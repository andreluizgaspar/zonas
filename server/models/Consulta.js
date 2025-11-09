import mongoose from 'mongoose';
import coordenadasSchema from './Coordenadas.js';
import resultadoZoneamentoSchema from './ResultadoZoneamento.js';

const consultaSchema = mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    endereco: {
      type: String,
      required: true,
    },
    coordenadas: coordenadasSchema,
    resultado: resultadoZoneamentoSchema,
  },
  {
    timestamps: true,
  }
);

const Consulta = mongoose.model('Consulta', consultaSchema);

export default Consulta;
