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
        let enderecoLimpo;
        let isGeneralQuery = false;
        let explicacaoIA;

        try {
            enderecoLimpo = await OpenAIService.extrairEndereco(userQuery);
            console.log(`Endereço extraído: ${enderecoLimpo}`);
        } catch (extractError) {
            console.log(`Falha ao extrair endereço, tratando como dúvida geral: ${extractError.message}`);
            isGeneralQuery = true;
        }

        let coordenadas;
        if (!isGeneralQuery) {
            try {
                coordenadas = await processadorEndereco.converterEnderecoParaCoordenadas(enderecoLimpo);
                console.log('Coordenadas obtidas:', coordenadas);
                if (!coordenadas || !coordenadas.latitude) {
                    isGeneralQuery = true;
                }
            } catch (geocodeError) {
                console.log(`Falha ao geocodificar, tratando como dúvida geral: ${geocodeError.message}`);
                isGeneralQuery = true;
            }
        }

        let zonaNome;
        let zoneInfo;
        if (!isGeneralQuery) {
            try {
                zonaNome = await apiArcGIS.consultarZoneamento(coordenadas.latitude, coordenadas.longitude);
                console.log(`Zona identificada: ${zonaNome}`);
                
                if (!zonaNome) {
                    isGeneralQuery = true;
                } else {
                    zoneInfo = await databaseService.getZoneInfo(zonaNome);
                    if (!zoneInfo) {
                        isGeneralQuery = true;
                    }
                }
            } catch (arcgisError) {
                console.log(`Falha ao obter zoneamento do ArcGIS, tratando como dúvida geral: ${arcgisError.message}`);
                isGeneralQuery = true;
            }
        }

        if (isGeneralQuery) {
            // Responder dúvida geral
            explicacaoIA = await OpenAIService.responderDuvidaGeral(userQuery);
            
            // Salvar no histórico
            const consulta = new Consulta({
                usuario: req.user._id,
                endereco: userQuery, // usa a própria dúvida como "endereço" para identificação no histórico
                resultado: {
                    resumo: explicacaoIA
                }
            });
            await consulta.save();

            res.status(200).json({
                resultado: null,
                resumo: explicacaoIA,
                endereco: userQuery,
                coordenadas: null
            });
            return;
        }

        explicacaoIA = await OpenAIService.gerarExplicacaoZoneamento(zonaNome, zoneInfo, enderecoLimpo);

        // Helper to parse numeric values from strings (e.g. "5m" -> 5, "50%" -> 50)
        const parseNumber = (val) => {
            if (!val) return undefined;
            if (typeof val === 'number') return val;
            const cleaned = val.replace(/[^0-9.,]/g, '').replace(',', '.');
            const num = parseFloat(cleaned);
            return isNaN(num) ? undefined : num;
        };

        const zone = zoneInfo.zone;
        
        let categoria = 'Outros';
        if (zone.startsWith('ZR')) categoria = 'Residencial';
        else if (zone.startsWith('ZC')) categoria = 'Central / Comercial';
        else if (zone.startsWith('ZI')) categoria = 'Industrial';

        const parts = (zoneInfo.descricao || '').split(' - ');
        const hierarquia = parts.length > 1 ? parts[1] : (zoneInfo.descricao || '');

        const caracteristicas = `${zoneInfo.descricao || ''}. Tipologia permitida: ${zoneInfo.unidadeHabitacionalCada || ''}.`;

        const acessoLei = `Lei Municipal nº 12.236/2015 de Londrina. Regulamenta o zoneamento para a zona ${zone}.`;

        const recuos = {
            frontal: parseNumber(zoneInfo.recuoMinimo) || 5,
            lateral: zoneInfo.afastamentosMinimos ? (parseNumber(zoneInfo.afastamentosMinimos.abertura) || 1.5) : 1.5,
            fundos: zoneInfo.afastamentosMinimos ? (parseNumber(zoneInfo.afastamentosMinimos.semAbertura) || 1.0) : 1.0,
            entreBloco: 0,
        };

        const parametrosUrbanisticos = {
            coeficienteAproveitamento: parseNumber(zoneInfo.coeficienteAproveitamentoMaximo) || 1.0,
            taxaOcupacao: parseNumber(zoneInfo.taxaOcupacaoMaxima) || 50,
            alturaMaxima: parseNumber(zoneInfo.alturaMaxima) || 8,
            vagas: 1,
        };

        const resultadoCalculado = {
            zona: zone,
            categoria: categoria,
            hierarquia: hierarquia,
            caracteristicas: caracteristicas,
            acessoLei: acessoLei,
            resumo: explicacaoIA,
            recuos: recuos,
            parametrosUrbanisticos: parametrosUrbanisticos,
        };

        const consulta = new Consulta({
            usuario: req.user._id,
            endereco: enderecoLimpo,
            coordenadas: coordenadas,
            resultado: resultadoCalculado,
        });

        await consulta.save();

        res.status(200).json({
            resultado: resultadoCalculado,
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
