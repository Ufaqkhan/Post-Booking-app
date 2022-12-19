const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  SmsMessageSid: {
    type: String,
    default: null,
  },
  From: {
    type: String,
    default: null,
  },
  ProfileName: {
    type: String,
    default: null,
  },
  Body: {
    type: String,
    default: null,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
