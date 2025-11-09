import mongoose from 'mongoose';

const recuosSchema = mongoose.Schema({
  frontal: { type: Number },
  lateral: { type: Number },
  fundos: { type: Number },
  entreBloco: { type: Number },
});

export default recuosSchema;
