const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please provide a username"],
  },
  phone: {
    type: String,
    required: [true, "please add a phone number"],
    unique: true,
  },
  phase: {
    type: Number,
    default: 0,
  },
  path:{
    type: String,
    default: null,
  },

});




const User = mongoose.model("User", userSchema);

module.exports = User;
