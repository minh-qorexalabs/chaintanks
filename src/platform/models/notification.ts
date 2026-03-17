import mongoose from "mongoose";
const Schema = mongoose.Schema;

const notification = new Schema({
  user: {
    type: String,
    required: true
  },

  title: {
    type: String,
    default: ""
  },

  description: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    default: ""
  },

  created: {
    type: Number,
    default: 0
  }
})

const Notification = mongoose.model("notifications", notification);

export { Notification }
