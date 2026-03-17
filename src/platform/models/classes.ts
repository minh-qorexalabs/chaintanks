import mongoose from "mongoose";
const Schema = mongoose.Schema;

const classes = new Schema({
  id: {
    type: Number,
    required: true
  },

  name: {
    type: String
  },

  image: {
    type: String
  },

  description: {
    type: String // tank description
  },

  health: {
    type: Number
  },

  fireRate: {
    type: Number
  },

  firePower: {
    type: Number
  },

  speed: {
    type: Number
  },

  healthAdd: {
    type: Number
  },

  fireRateAdd: {
    type: Number
  },

  firePowerAdd: {
    type: Number
  },

  speedAdd: {
    type: Number
  },

  price: {
    type: Number
  }
}, {
  timestamps: true
})

const Classes = mongoose.model("classes", classes);

export { Classes }
