import fs from 'fs';
import path from 'path';
import Consulta from '../models/Consulta.js';

const __dirname = path.resolve();
const zones = JSON.parse(fs.readFileSync(path.join(__dirname, 'zones.json'), 'utf8'));

class DatabaseService {
  async getZoneInfo(zoneName) {
    const zoneData = zones.find(
      (z) => z.zone.toLowerCase() === zoneName.toLowerCase()
    );
    return zoneData;
  }

  async buscarHistorico(userId) {
    return await Consulta.find({ usuario: userId });
  }
}

export default DatabaseService;
