const mongoose = require("mongoose");
const TyreTransactionSchema = new mongoose.Schema({
  numberPlate: {
    type: String,
  },
  serviceType: {
    type: String,
    enum: ["Pressure", "Puncture Fixing","Valves"],
  },
    modelType: {
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