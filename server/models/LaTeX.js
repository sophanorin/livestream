const {Schema, model} = require("mongoose");

const LaTeX = new Schema(
  {
    _id: String,
    data: Object,
  },
  {timestamps: true}
);

module.exports = model("LaTeX", LaTeX);
