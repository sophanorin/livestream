const { Schema, model } = require("mongoose");

const Document = new Schema(
  {
    chat: String,
    time_pair: Date,
  },
  { timestamps: true }
);

module.exports = model("Chat", Document);
