const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BottlesSchema = new Schema (
  {
    bottles: {
      type: [String],
      required: true
    }
  }
);

module.exports = mongoose.model("Bottles", BottlesSchema, 'bottles');
