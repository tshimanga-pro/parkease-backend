const express = require("express");
const router = express.Router();
const calculateParkingFee = require("../utils/feeCalculator");

// Importing Models (collection models:botton name in the schema, defines by 'mongoose.model' )
const VehicleRegistration = require("../models/VehicleRegistration");
const VehicleSignOut = require("../models/VehicleSignOut");

router.get("/signout", (req, res) => {
  res.render("vehicleSignout");
});

router.post("/signout/verify", async (req, res) => {
  try {
    const VehicleRegistration = await VehicleRegistration.findOne({
      receiptNumber: req.body.receiptNumber,
      status: "Parcked",
    });
    if (!VehicleRegistration) {
      return req.render("vehicleSignout");
    }
    const fee = calculateParkingFee(VehicleRegistration.vehicleType, Vehicle.arrivalDate);
    res.render("vehicleSignout", { VehicleRegistration, free });
  } catch (error) {
    res.render("vehicleSignout");
  }
});
router.post("/signout/confirm", async (req, res) => {
  try {
    const newSignout = await VehicleSignOut(req.body);
    const savedSignOut = await newSignout.save();
    await VehicleRegistration.findByIdAndUpdate(req.body.VehicleId, {
      status: "Signed-out",
    });
    res.redirect(`/signout/receipt/${savedSignOut._id}`);
  } catch (error) {
    res.render("vehicleSignout");
  }
});
router.get("/signout/receipt/:id", async (req, res) => {
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
