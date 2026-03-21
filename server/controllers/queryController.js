import asyncHandler from 'express-async-handler';
import ProcessadorEndereco from '../services/ProcessadorEndereco.js';
import ApiArcGIS from '../services/ApiArcGIS.js';
import DatabaseService from '../services/DatabaseService.js';
import OpenAIService from '../services/OpenAIService.js';
import Consulta from '../models/Consulta.js';

const processadorEndereco = new ProcessadorEndereco();
const apiArcGIS = new ApiArcGIS();
const databaseService = new DatabaseService();

const query = asyncHandler(async (req, res) => {
    const { query: userQuery } = req.body;

    if (!userQuery) {
        res.status(400).json({ error: 'Address query is required.' });
        return;
    }

    try {
        // 1. Usar OpenAI para extrair o endereço limpo ou entender intenção
        let enderecoLimpo;
        try {
            enderecoLimpo = await OpenAIService.extrairEndereco(userQuery);
            console.log(`Endereço extraído: ${enderecoLimpo}`);
        } catch (extractError) {
            res.status(400).json({ error: extractError.message });
            return;
        }

        // 2. Converter endereço para coordenadas
        let coordenadas;
        try {
            coordenadas = await processadorEndereco.converterEnderecoParaCoordenadas(enderecoLimpo);
        } catch (geocodeError) {
            res.status(404).json({ error: geocodeError.message });
            return;
        }
        console.log('Coordenadas obtidas:', coordenadas);

        if (!coordenadas || !coordenadas.latitude) {
            res.status(404).json({ error: 'Não foi possível encontrar a localização para este endereço.' });
            return;
        }

        // 3. Consultar Zoneamento no ArcGIS usando coordenadas
        const zonaNome = await apiArcGIS.consultarZoneamento(coordenadas.latitude, coordenadas.longitude);
        console.log(`Zona identificada: ${zonaNome}`);

        if (!zonaNome) {
            res.status(404).json({ error: 'Não encontramos zoneamento para este local em Londrina.' });
            return;
        }

        // 4. Buscar informações detalhadas da zona no banco/JSON
        const zoneInfo = await databaseService.getZoneInfo(zonaNome);

        if (!zoneInfo) {
            res.status(404).json({ error: `Informações técnicas para a zona ${zonaNome} não encontradas no sistema.` });
            return;
        }

        // 5. Gerar explicação amigável com OpenAI baseada nos dados técnicos
        const explicacaoIA = await OpenAIService.gerarExplicacaoZoneamento(zonaNome, zoneInfo, enderecoLimpo);

        // 6. Salvar a consulta no histórico
        const consulta = new Consulta({
            usuario: req.user._id,
            endereco: enderecoLimpo,
            coordenadas: coordenadas,
            resultado: {
                zona: zoneInfo.zone,
                unidadeHabitacional: zoneInfo.unidadeHabitacionalCada,
                frenteMinima: zoneInfo.frenteMinimaLarguraMedia?.meioQuadra,
                taxaOcupacao: zoneInfo.taxaOcupacaoMaxima,
                coeficienteAproveitamento: zoneInfo.coeficienteAproveitamentoMaximo,
                alturaMaxima: zoneInfo.alturaMaxima,
                recuoMinimo: zoneInfo.recuoMinimo,
                resumo: explicacaoIA
            },
        });

        await consulta.save();

        // 7. Retornar resposta rica para o frontend
        res.status(200).json({
            resultado: {
                zona: zoneInfo.zone,
                descricao: zoneInfo.descricao,
                categoria: zoneInfo.categoria,
                hierarquia: zoneInfo.hierarquia,
                caracteristicas: zoneInfo.caracteristicas,
                acessoLei: zoneInfo.acessoLei,
                recuos: zoneInfo.recuos,
                parametrosUrbanisticos: zoneInfo.parametrosUrbanisticos,
            },
            resumo: explicacaoIA,
            endereco: enderecoLimpo,
            coordenadas: coordenadas
        });
    } catch (error) {
        console.error('Error processing query:', error.message || error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            error: 'Ocorreu um erro ao processar sua consulta com inteligência artificial.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

const getQueryHistory = asyncHandler(async (req, res) => {
    const history = await databaseService.buscarHistorico(req.user._id);
    res.status(200).json(history);
});

const deleteQuery = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const consulta = await Consulta.findById(id);

    if (!consulta) {
        res.status(404);
        throw new Error('Consulta não encontrada');
    }

    if (consulta.usuario.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Não autorizado a deletar esta consulta');
    }

    await Consulta.findByIdAndDelete(id);

    res.status(200).json({ message: 'Consulta deletada com sucesso' });
});

export { query, getQueryHistory, deleteQuery };
