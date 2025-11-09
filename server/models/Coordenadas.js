import mongoose from 'mongoose';

const coordenadasSchema = mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  wkid: { type: Number },
});

export default coordenadasSchema;
