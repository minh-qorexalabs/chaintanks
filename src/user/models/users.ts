import mongoose from "mongoose";
const Schema = mongoose.Schema;

const linkSchema = new Schema({
  type: {
    type: String,
    default: '',
  },
  href: {
    type: String,
    default: '',
  },
})

const UserSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
  },

  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  description: {
    type: String,
    require: true
  },
  password: {
    type: String,
    required: true
  },

  image: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  links: [
    linkSchema
  ],

  role: {
    type: String,
    default: "player"
  },
  merit: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default: ''
  },
  referrallers: [{
    type: String
  }],
  referralReward: {
    type: Number,
    default: 0
  },
  followers: [{
    type: String
  }],

  // borrow data
  borrowCount: {
    type: Number,
    default: 0
  },
  borrowTime: {
    type: Number,
    default: 0,
  },

  lasttime: {
    type: Number,
    default: 0,
  },

  isVip: {
    type: Boolean,
    default: false,
  },

  created: {
    type: Number,
    default: 0,
  }
})

const Users = mongoose.model("users", UserSchema);

export { Users }