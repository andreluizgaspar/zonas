import mongoose from 'mongoose';

const parametrosUrbanisticosSchema = mongoose.Schema({
  coeficienteAproveitamento: { type: Number },
  taxaOcupacao: { type: Number },
  alturaMaxima: { type: Number },
  vagas: { type: Number },
});

export default parametrosUrbanisticosSchema;
