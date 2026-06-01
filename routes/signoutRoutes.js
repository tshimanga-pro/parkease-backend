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
    const { searchQuery } = req.body 

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
      amountPaid: fee,
      receiptNumber: vehicle.receiptNumber,
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

    const arrivalTime = signout.vehicleId?.arrivalTime ? new Date(signout.vehicleId.arrivalTime) : null;
    const signoutTime = signout.signoutTime ? new Date(signout.signoutTime) : new Date();
    const amountDue = typeof signout.amountPaid === "number" && signout.amountPaid >= 0
      ? signout.amountPaid
      : calculateParkingFee(signout.vehicleId?.vehicleType, arrivalTime, signoutTime);
    const durationMs = arrivalTime ? Math.max(0, signoutTime.getTime() - arrivalTime.getTime()) : 0;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const formattedDuration = `${durationHours}h ${durationMinutes}m`;

    const formatDateTime = (date) => date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    res.render("receipt", {
      signout,
      receipt: {
        receiptNumber: signout.receiptNumber || signout.vehicleId?.receiptNumber || "N/A",
        date: formatDateTime(signoutTime),
        driverName: signout.vehicleId?.driverName || "Unknown",
        receiverName: signout.receiverName || "Unknown",
        plateNumber: signout.vehicleId?.numberPlate || "Unknown",
        vehicleType: signout.vehicleId?.vehicleType || "Unknown",
        arrivalTime: arrivalTime ? formatDateTime(arrivalTime) : "Unknown",
        signoutTime: formatDateTime(signoutTime),
        duration: formattedDuration,
        amountDue: amountDue.toLocaleString(),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("vehicleSignout", { error: "Unable to load receipt." });
  }
});

module.exports = router;
