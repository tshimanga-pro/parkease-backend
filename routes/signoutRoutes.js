const express = require("express");
const router = express.Router();
const calculateParkingFee = require("../utils/feeCalculator");

// Importing Models (collection models:botton name in the schema, defines by 'mongoose.model' )
const Vehicle = require("../models/VehicleRegistration");
const SignedOut = require("../models/VehicleSignOut");

router.get("/signout", (req, res) => {
  res.render("vehicleSignout");
});

router.post("/signout/verify", async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      receiptNumber: req.body.receiptNumber,
      status: "Parcked",
    });
    if (!Vehicle) {
      return req.render("vehicleSignout");
    }
    const fee = calculateParkingFee(Vehicle.vehicleType, Vehicle.arrivalDate);
    res.render("vehicleSignout", { vehicle, free });
  } catch (error) {
    res.render("vehicleSignout");
  }
});
router.post("/signout/confirm", async (req, res) => {
  try {
    const newSignout = await SignedOut(req.body);
    const savedSignOut = await newSignout.save();
    await Vehicle.findByIdAndUpdate(req.body.VehicleId, {
      status: "Signed-out",
    });
    res.redirect(`/signout/ticket/${savedSignOut._id}`);
  } catch (error) {
    res.render("vehicleSignout");
  }
});
router.post("/signout/ticket/:id", async (req, res) => {
  try {
    const newSignout = await SignedOut.findById(req.params.id).populate(
      "vehicleId",
    );
    if (!record) {
      return req.redirect("/signout");
      req.render("receipt", {record});
    }
    res.redirect("/attendant");
  } catch (error) {
    res.render("vehicleSignout");
  }
});



module.exports = router;
