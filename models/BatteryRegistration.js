const mongoose = require("mongoose");
const BatteryRegistrationSchema = new mongoose.Schema({
  batteryType: {
    type: String,
  },
  batteryBrand: {
    type: String,
  },
  batteryImage: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Available", "Hired", "Solde"],
    default: "Available",
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "BatteryRegistration",
  BatteryRegistrationSchema,
);
