const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokensSchema = new Schema (
  {
    tokens: {
      type: [String],
      required: true
    }
  }
);

module.exports = mongoose.model("Tokens", TokensSchema, 'tokens');
