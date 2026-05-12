const express = require("express");
const router = express.Router();
const calculateParkingFee = require("../utils/feeCalculator");

// Importing Models
const VehicleRegistration = require("../models/VehicleRegistration");
const VehicleSignOut = require("../models/VehicleSignOut");

router.get("/signout", (req, res) => {
  res.render("vehicleSignout");
});

// Search for vehicle by receipt/ticket - number or plate number
router.post("/signout/search", async (req, res) => {
  console.log(req.body);
  try {
    const { searchQuery } = req.body || {};

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({ error: "Please enter a ticket number or plate number." });
    }

    // Search by receipt number or plate number
    const vehicle = await VehicleRegistration.findOne({
      $or: [
        { receiptNumber: searchQuery.trim().toUpperCase() },
        { numberPlate: searchQuery.trim().toUpperCase() }
      ],
      status: "Parked"
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found or already signed out." });
    }

    // Calculate parking fee
    const arrivalTime = new Date(vehicle.arrivalTime);
    const currentTime = new Date();
    const fee = calculateParkingFee(vehicle.vehicleType, arrivalTime, currentTime);

    res.json({
      success: true,
      vehicle: {
        _id: vehicle._id,
        driverName: vehicle.driverName,
        receiptNumber: vehicle.receiptNumber,
        numberPlate: vehicle.numberPlate,
        vehicleType: vehicle.vehicleType,
        arrivalTime: vehicle.arrivalTime,
        fee: fee
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during search." });
  }
});

// Confirm sign-out and create record
router.post("/signout/confirm", async (req, res) => {
  try {
    const { vehicleId, receiverName, phoneNumber, gender, ninNumber } = req.body;

    if (!vehicleId) {
      return res.status(400).render("vehicleSignout", { error: "Vehicle ID is required." });
    }

    // Find the vehicle
    const vehicle = await VehicleRegistration.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).render("vehicleSignout", { error: "Vehicle not found." });
    }

    // Calculate fee
    const arrivalTime = new Date(vehicle.arrivalTime);
    const currentTime = new Date();
    const fee = calculateParkingFee(vehicle.vehicleType, arrivalTime, currentTime);

    // Create sign-out record
    const newSignOut = new VehicleSignOut({
      vehicleId: vehicleId,
      receiverName: receiverName,
      phoneNumber: phoneNumber,
      gender: gender,
      ninNumber: ninNumber,
      signoutTime: currentTime,
      fee: fee
    });

    const savedSignOut = await newSignOut.save();

    // Update vehicle status to "Signed-out"
    await VehicleRegistration.findByIdAndUpdate(vehicleId, {
      status: "Signed-out"
    });

    res.redirect(`/signout/receipt/${savedSignOut._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).render("vehicleSignout", { error: "Unable to complete sign-out." });
  }
});

// Display receipt
router.get("/signout/receipt/:id", async (req, res) => {
  try {
    const signout = await VehicleSignOut.findById(req.params.id).populate("vehicleId");

    if (!signout) {
      return res.redirect("/signout");
    }

    res.render("receipt", { signout });
  } catch (error) {
    console.error(error);
    res.status(500).render("vehicleSignout", { error: "Unable to load receipt." });
  }
});

module.exports = router;
