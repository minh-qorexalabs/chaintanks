import mongoose from "mongoose";
const Schema = mongoose.Schema;

const nftTank = new Schema({
  // tank id
  id: {
    type: String,
    required: true
  },

  // tank owner
  owner: {
    type: String,
    required: true
  },

  // tank level
  level: {
    type: String,
    default: "0"
  },

  role: {
    type: String,
    default: "NFT"
  }
})

const tankSchema = new Schema({
  classType: {
    type: Number, // tank class type
    required: true
  },

  energy: {
    type: Number, // remained energy for tank
    default: 0
  },

  maxEnergy: {
    type: Number, // max energy size
    default: 0
  },

  energyPool: {
    type: Number, // energy pool size
    default: 0
  },

  maxEnergyPool: {
    type: Number, // max energy pool size
    default: 0
  },

  experience: {
    type: Number, // tank experience
    default: 0
  },

  tankLevel: {
    type: Number, // current level
    default: 0
  },

  name: {
    type: String // tank name
  },

  image: {
    type: String // tank image
  },

  description: {
    type: String // tank description
  },

  health: {
    type: Number, // max health
    default: 0
  },

  fireRate: {
    type: Number, // fire Rate
    default: 0
  },

  firePower: {
    type: Number, // fire Power
    default: 0
  },

  speed: {
    type: Number, //  speed
    default: 0
  },

  borrower: {
    type: String, // borrower
    default: ""
  },

  followers: [{
    type: String
  }],
}, {
  timestamps: true
})

const NFTTankschema = new Schema();
NFTTankschema.add(nftTank).add(tankSchema);
const NFTTank = mongoose.model("NFTTanks", NFTTankschema);

export { NFTTank }
