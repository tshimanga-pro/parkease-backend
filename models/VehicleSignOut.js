const mongoose = require("mongoose");

const VehicleSignedOutSchema = new mongoose.Schema({
  receiverName: {
    type: String,
    trim: true,
  },
  receiptNumber: {
    type: String,
    trim: true,
  },
  signoutTime: {
    type: Date,
    default: Date.now,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    trim: true,
  },
  ninNumber: {
    type: String,
    trim: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleRegistration",
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("VehicleSignOut", VehicleSignedOutSchema);