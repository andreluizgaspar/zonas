import asyncHandler from 'express-async-handler';
import axios from 'axios';
import zoneController from './zoneController.js';
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import Point from "@arcgis/core/geometry/Point.js";
import Extent from "@arcgis/core/geometry/Extent.js"
import { project } from "@arcgis/core/geometry/projection.js";

const query = asyncHandler(async (req, res) => {
    const split = req.body.coordenadas.split(',')
    const latitude = split[0].trim()
    const longitude = split[1].trim()

    const originalPoint = new Point({
        latitude: latitude,
        longitude: longitude,
        spatialReference: { wkid: 4326 }
    });

    const targetSpatialReference = new SpatialReference({ wkid: 102100 });

    const projectedPoint = project(originalPoint, targetSpatialReference);

    const bufferSize = 7

    const extent = new Extent({
        xmin: projectedPoint.x - bufferSize,
        ymin: projectedPoint.y - bufferSize,
        xmax: projectedPoint.x + bufferSize,
        ymax: projectedPoint.y + bufferSize,
        spatialReference: targetSpatialReference
    });

    console.log(extent.toJSON())

    try {
        const response = await axios.get('https://geo.londrina.pr.gov.br/server/rest/services/Publico/IPPULLeisUsoOcupacaoSoloRevisado2023/MapServer/dynamicLayer/query', {
            params: {
                f: 'json',
                returnGeometry: 'false',
                geometry: JSON.stringify(extent.toJSON()),
                outFields: 'OBJECTID_12,OBJECTID_1,OBJECTID,ZONEAMENTO,ITEM,LEI_12236_,PARÂMETRO,SHAPE_LENG,CORRECAO,SHAPE.AREA,SHAPE.LEN',
                layer: JSON.stringify({"source":{"type":"mapLayer","mapLayerId":6}})
                // layer: JSON.stringify({"source":{"type":"mapLayer","mapLayerId":6}})
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

export { query };

// TODO separete and improve
// study bufferSize
// checar o se o q retorna eh igual a rua pedioda, aumentar buffer se precisar
// wtf is maplayer id 6