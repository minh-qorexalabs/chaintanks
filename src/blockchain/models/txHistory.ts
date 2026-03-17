import mongoose from "mongoose";
const Schema = mongoose.Schema;

const txHistory = new Schema({
  type: String,
  value: String
})

const TxHistory = mongoose.model("txHistory", txHistory);

export { TxHistory }
