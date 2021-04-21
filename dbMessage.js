const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});
module.exports = mongoose.model("messageContent", messageSchema);
