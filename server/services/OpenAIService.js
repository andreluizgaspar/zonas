import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const __dirname = path.resolve();
let zonesData = [];
try {
    zonesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'zones.json'), 'utf8'));
} catch (err) {
    console.error('Erro ao ler zones.json no OpenAIService:', err);
}

class OpenAIService {
    async extrairEndereco(query) {
        try {
            if (!process.env.OPENAI_API_KEY) {
                console.error('OPENAI_API_KEY não configurada no .env');
                return query;
            }

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Você é um especialista em urbanismo de Londrina. Extraia o endereço da mensagem do usuário. Se mencionar apenas rua/avenida, complete com 'Londrina'. Retorne APENAS o endereço, de forma limpa. Se não houver endereço, retorne: ENDEREÇO_INVÁLIDO"
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                temperature: 0,
            });

            const endereco = response.choices[0].message.content.trim();

            if (endereco.includes('ENDEREÇO_INVÁLIDO') || endereco.toLowerCase().includes('desculpe') || endereco.toLowerCase().includes('não consegui')) {
                throw new Error('Não foi possível extrair um endereço válido da sua mensagem. Por favor, forneça um endereço ou rua específica em Londrina.');
            }

            return endereco;
        } catch (error) {
            console.error('Erro ao extrair endereço com OpenAI:', error.message || error);
            throw error;
        }
    }

    async gerarExplicacaoZoneamento(zona, zoneInfo, endereco) {
        try {
            if (!process.env.OPENAI_API_KEY) {
                console.error('OPENAI_API_KEY não configurada no .env');
                return this._gerarExplicacaoSemIA(zona, zoneInfo, endereco);
            }

            const prompt = `
                Como um assistente de planejamento urbano, explique de forma clara e amigável o zoneamento para o endereço: ${endereco}.
                
                Dados Técnicos da Zona ${zona}:
                - Unidade Habitacional: ${zoneInfo.unidadeHabitacionalCada}
                - Frente Mínima: ${zoneInfo.frenteMinimaLarguraMedia?.meioQuadra || 'N/A'}
                - Taxa de Ocupação Máxima: ${zoneInfo.taxaOcupacaoMaxima}
                - Coeficiente de Aproveitamento: ${zoneInfo.coeficienteAproveitamentoMaximo}
                - Altura Máxima: ${zoneInfo.alturaMaxima}
                - Recuo Mínimo: ${zoneInfo.recuoMinimo}
                - Afastamentos: Abertura ${zoneInfo.afastamentosMinimos?.abertura || 'N/A'}, Sem Abertura ${zoneInfo.afastamentosMinimos?.semAbertura || 'N/A'}
                
                Traduza esses termos técnicos para o que o cidadão pode ou não construir, de forma resumida e profissional.
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Você é um arquiteto e urbanista auxiliando um cidadão a entender o que ele pode construir em seu terreno baseado na lei de zoneamento de Londrina."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Erro ao gerar explicação com OpenAI:', error.message || error);
            return this._gerarExplicacaoSemIA(zona, zoneInfo, endereco);
        }
    }

    _gerarExplicacaoSemIA(zona, zoneInfo, endereco) {
        return `
Para o endereço ${endereco} na zona ${zona}, aqui estão os detalhes da regulamentação:

**Características Principais:**
- Unidade Habitacional Mínima: ${zoneInfo.unidadeHabitacionalCada}
- Frente Mínima: ${zoneInfo.frenteMinimaLarguraMedia?.meioQuadra || 'N/A'}
- Taxa de Ocupação Máxima: ${zoneInfo.taxaOcupacaoMaxima}
- Coeficiente de Aproveitamento Máximo: ${zoneInfo.coeficienteAproveitamentoMaximo}
- Altura Máxima: ${zoneInfo.alturaMaxima}

**Recuos e Afastamentos:**
- Recuo Mínimo: ${zoneInfo.recuoMinimo}
- Afastamento com Abertura: ${zoneInfo.afastamentosMinimos?.abertura || 'N/A'}
- Afastamento sem Abertura: ${zoneInfo.afastamentosMinimos?.semAbertura || 'N/A'}
- Área de Infiltração: ${zoneInfo.areaInfiltracao}

Consulte a legislação municipal para mais detalhes técnicos e restrições específicas.
        `.trim();
    }

    async responderDuvidaGeral(pergunta) {
        try {
            if (!process.env.OPENAI_API_KEY) {
                console.error('OPENAI_API_KEY não configurada no .env');
                return "Desculpe, o serviço de IA não está configurado no momento.";
            }

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Você é um arquiteto, urbanista e assistente especialista em zoneamento e planejamento urbano da cidade de Londrina, PR. 
Use a tabela de zonas e parâmetros abaixo para responder às dúvidas do cidadão com precisão, clareza e termos simplificados.
Se a pergunta não for relacionada a urbanismo, zoneamento, recuos, coeficientes de aproveitamento, taxas de ocupação ou Londrina, responda educadamente que você é especializado apenas no zoneamento urbano de Londrina.

Zonas e parâmetros urbanísticos de Londrina:
${JSON.stringify(zonesData, null, 2)}`
                    },
                    {
                        role: "user",
                        content: pergunta
                    }
                ],
                temperature: 0.5,
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Erro ao responder dúvida geral com OpenAI:', error.message || error);
            return "Desculpe, ocorreu um erro ao processar sua pergunta com a inteligência artificial.";
        }
    }
}

export default new OpenAIService();
