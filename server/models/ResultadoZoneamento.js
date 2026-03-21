import mongoose from 'mongoose';
import recuosSchema from './Recuos.js';
import parametrosUrbanisticosSchema from './ParametrosUrbanisticos.js';

const resultadoZoneamentoSchema = mongoose.Schema({
  zona: { type: String },
  categoria: { type: String },
  hierarquia: { type: String },
  caracteristicas: { type: String },
  acessoLei: { type: String },
  resumo: { type: String },
  recuos: recuosSchema,
  parametrosUrbanisticos: parametrosUrbanisticosSchema,
});

resultadoZoneamentoSchema.methods.gerarResumo = function () {
  if (this.resumo) return this.resumo;
  
  return `
    Zona: ${this.zona}
    Categoria: ${this.categoria}
    Hierarquia: ${this.hierarquia}
    Características: ${this.caracteristicas}
    Acesso à Lei: ${this.acessoLei}
  `;
};

export default resultadoZoneamentoSchema;
