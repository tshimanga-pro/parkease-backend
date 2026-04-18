const mongoose = require("mongoose");
const TyreTransactionSchema = new mongoose.Schema({
  tyreSize: {
    type: String,
  },
  serviceType: {
    type: String,
    enum: ["Pressure", "Puncture Fixing","Valves"],
  },
    tyreModel: {
    type: String,
    enum: ["Basic", "Standard","Premium"],
  },

  amountPaid: {
    type: Number,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TyreTransaction", TyreTransactionSchema);