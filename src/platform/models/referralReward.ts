import mongoose from "mongoose";
const Schema = mongoose.Schema;

const referralReward = new Schema({
  user: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  action: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },

  tx: {
    type: String,
    default: ''
  },

  log: {
    type: String,
    default: ''
  },
})

const ReferralReward = mongoose.model("ReferralRewards", referralReward);

export { ReferralReward }
