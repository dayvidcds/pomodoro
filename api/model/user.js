const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true },
    birthDate: { type: String, required: false },
    cpf: {
      number: {
        type: String,
        required: true,
        unique: true
      }
    },
    address: {
      type: {
        street: { type: String, required: false },
        complement: { type: String, required: false },
        number: { type: String, required: false },
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false },
      },
    },
    rating: { type: Number, min: 0, max: 5, required: false, default: 0 },
    level: { type: Number, min: 0, max: 5, required: false, default: 0 },
  },
  { timestamps: true, autoCreate: true },
);

const model = mongoose.model('user', schema);
//model.createCollection();
module.exports = model;