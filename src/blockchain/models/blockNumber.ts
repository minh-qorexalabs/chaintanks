import mongoose from "mongoose";
const Schema = mongoose.Schema;

const blockNumber = new Schema({
  id: {
    type: String,
    required: true
  },

  latestBlock: {
    type: Number,
    required: true
  }
})

const BlockNumber = mongoose.model("BlockNumbers", blockNumber);

export { BlockNumber }
