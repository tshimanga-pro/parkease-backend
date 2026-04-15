const express = require("express");
const router = express.Router();
const calculateParkingFee = require("../utils/feeCalculator");

// Importing Models (collection models:botton name in the schema, defines by 'mongoose.model' )
const Vehicle = require("../models/VehicleRegistration");
const SignedOut = require("../models/VehicleSignOut");

router.get("/signout", (req, res) => {
  res.render("vehicleSignout");
});




module.exports = router;
