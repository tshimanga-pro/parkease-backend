const mongoose = require("mongoose");
const TyreTransactionSchema = new mongoose.Schema({
  tyreSize: {
    type: String,
  },
  services: [{
    type: String,
  }],
  tyreModel: {
    type: String,
    enum: ["Basic", "Standard","Premium"],
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  pressureTotal: {
    type: Number,
    default: 0,
  },
  punctureTotal: {
    type: Number,
    default: 0,
  },
  valvesTotal: {
    type: Number,
    default: 0,
  },
  servicesTotal: {
    type: Number,
    default: 0,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TyreTransaction", TyreTransactionSchema);