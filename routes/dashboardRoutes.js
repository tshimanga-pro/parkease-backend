const express = require("express");
const router = express.Router();
const {isAuthenticated, isAdmin, isManager, isAttendant} = require("../middleware/auth")

// import models
const Registration = require('../models/Registration')
const VehicleRegistration = require('../models/VehicleRegistration')

router.get("/manager", isManager, (req, res) => {
  res.render("manager");
});

router.get("/admin", async (req, res) => {
  try {
    const users = await Registration.find().sort({ surname: 1, firstName: 1 });
    res.render("admin", { users });
  } catch (error) {
    console.error(error);
    res.render("admin", { users: [] });
  }
});

router.get("/signout", isAttendant, (req, res, next) => {
  next();
});

router.get("/attendant", isAttendant, async (req, res) => {
  try {
    // Fetch all parked vehicles
    const parkedVehicles = await VehicleRegistration.find({ status: "Parked" }).sort({ arrivalTime: -1 });
    // Calculate total vehicles packed
    const totalVehiclesPacked = parkedVehicles.length;
    
    res.render("attendant", { 
      parkedVehicles, 
      totalVehiclesPacked 
    });
  } catch (error) {
    console.error(error);
    res.render("attendant", { 
      parkedVehicles: [], 
      totalVehiclesPacked: 0 
    });
  }
});

router.get("/usersList", isAdmin, async (req, res) => {
  try {
    let users = await Registration.find().sort({$natural: -1})
    res.render("usersList", {users});
  } catch (error) {
    res.status(400).send("Unable to find users in the Database.")
  }
})

module.exports = router;