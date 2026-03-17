import mongoose from "mongoose";
const Schema = mongoose.Schema;

const adminSetting = new Schema({
  type: String,
  value: String
})

const AdminSetting = mongoose.model("adminSetting", adminSetting);

export { AdminSetting }
