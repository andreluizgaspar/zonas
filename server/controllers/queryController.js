import asyncHandler from 'express-async-handler';
import ProcessadorEndereco from '../services/ProcessadorEndereco.js';
import ApiArcGIS from '../services/ApiArcGIS.js';
import DatabaseService from '../services/DatabaseService.js';
import Consulta from '../models/Consulta.js';

const processadorEndereco = new ProcessadorEndereco();
const apiArcGIS = new ApiArcGIS();
const databaseService = new DatabaseService();

const query = asyncHandler(async (req, res) => {
    const { query } = req.body;

    console.log('query')
    console.log(query)

    if (!query) {
        res.status(400).json({ error: 'Address query is required.' });
        return;
    }

    try {
        const coordenadas = await processadorEndereco.converterEnderecoParaCoordenadas(query);

        console.log('coordenadas')
        console.log(coordenadas)

        const zona = await apiArcGIS.consultarZoneamento(coordenadas.latitude, coordenadas.longitude);

        console.log('zona')
        console.log(zona)

        if (!zona) {
            res.status(404).json({ error: 'Could not find zone for the given address.' });
            return;
        }

        const zoneInfo = await databaseService.getZoneInfo(zona);

        if (!zoneInfo) {
            res.status(404).json({ error: 'Zone information not found in the database.' });
            return;
        }

        const consulta = new Consulta({
            usuario: req.user._id,
            endereco: query,
            coordenadas: coordenadas,
            resultado: {
                zona: zoneInfo.zone,
                categoria: zoneInfo.unidadeHabitacionalCada,
                hierarquia: zoneInfo.frenteMinimaLarguraMedia.meioQuadra,
                caracteristicas: zoneInfo.taxaOcupacaoMaxima,
                acessoLei: zoneInfo.coeficienteAproveitamentoMaximo,
            },
        });

        await consulta.save();

        const resumo = consulta.resultado.gerarResumo();

        res.status(200).json({ ...zoneInfo, resumo });
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

const getQueryHistory = asyncHandler(async (req, res) => {
    const history = await databaseService.buscarHistorico(req.user._id);
    res.status(200).json(history);
});

export { query, getQueryHistory };
