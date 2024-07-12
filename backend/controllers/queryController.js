import asyncHandler from 'express-async-handler';
import { Client } from "@googlemaps/google-maps-services-js";
import axios from 'axios';
import zoneController from './zoneController.js';
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import Point from "@arcgis/core/geometry/Point.js";
import Extent from "@arcgis/core/geometry/Extent.js"
import { project } from "@arcgis/core/geometry/projection.js";

const query = asyncHandler(async (req, res) => {
    const query = req.body.query
    const client = new Client({});
    let location = {
        latitude: '',
        longitude: ''
    }

    await client
        .geocode({
            params: {
                address: query,
                key: 'AIzaSyAr1Yvl5beQkFsjeA4tYOq4uCNP4b3f1bQ',
            },
            timeout: 1000,
        })
        .then((response) => {
            if (response.data.results.length > 0) {
                const coords = response.data.results[0].geometry.location;
                const latitude = coords.lat;
                const longitude = coords.lng;

                location.latitude = latitude.toString()
                location.longitude = longitude.toString()

            } else {
                console.log('bruh');
            }
        })
        .catch((error) => {
            console.error('Error:', error.message);
            if (error.response) {
                console.error('API Error:', error.response.data.error_message);
            }
        });

    const originalPoint = new Point({
        latitude: location.latitude,
        longitude: location.longitude,
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

    try {
        const response = await axios.get('https://geo.londrina.pr.gov.br/server/rest/services/Publico/IPPULLeisUsoOcupacaoSoloRevisado2023/MapServer/dynamicLayer/query', {
            params: {
                f: 'json',
                returnGeometry: 'false',
                geometry: JSON.stringify(extent.toJSON()),
                outFields: 'OBJECTID_12,OBJECTID_1,OBJECTID,ZONEAMENTO,ITEM,LEI_12236_,PARÂMETRO,SHAPE_LENG,CORRECAO,SHAPE.AREA,SHAPE.LEN',
                layer: JSON.stringify({ "source": { "type": "mapLayer", "mapLayerId": 6 } })
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
// aquela outra rota pra obter info