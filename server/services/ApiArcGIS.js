import axios from 'axios';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import Point from '@arcgis/core/geometry/Point.js';
import Extent from '@arcgis/core/geometry/Extent.js';
import { project, load } from '@arcgis/core/geometry/projection.js';

class ApiArcGIS {
  constructor() {
    this.baseUrl = 'https://geo.londrina.pr.gov.br/server/rest/services/Publico/IPPULLeisUsoOcupacaoSoloRevisado2023/MapServer/dynamicLayer/query';
    this.layerId = 6;
  }

  async consultarZoneamento(latitude, longitude) {
    await load();

    const originalPoint = new Point({
      latitude: latitude,
      longitude: longitude,
      spatialReference: { wkid: 4326 }, // WGS84
    });

    const targetSpatialReference = new SpatialReference({ wkid: 31982 }); // SIRGAS 2000 / UTM zone 22S

    const projectedPoint = project(originalPoint, targetSpatialReference);

    const bufferSize = 50; // 50 meters

    const extent = new Extent({
      xmin: projectedPoint.x - bufferSize,
      ymin: projectedPoint.y - bufferSize,
      xmax: projectedPoint.x + bufferSize,
      ymax: projectedPoint.y + bufferSize,
      spatialReference: targetSpatialReference,
    });

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          f: 'json',
          returnGeometry: 'false',
          geometry: JSON.stringify(extent.toJSON()),
          outFields: 'OBJECTID_12,OBJECTID_1,OBJECTID,ZONEAMENTO,ITEM,LEI_12236_,PARÂMETRO,SHAPE_LENG,CORRECAO,SHAPE.AREA,SHAPE.LEN',
          layer: JSON.stringify({ source: { type: 'mapLayer', mapLayerId: this.layerId } }),
        },
      });

      if (response.data.features.length > 0) {
        return response.data.features[0].attributes.ZONEAMENTO;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching data from ArcGIS server:', error);
      throw new Error('An error occurred while fetching data from ArcGIS server.');
    }
  }
}

export default ApiArcGIS;