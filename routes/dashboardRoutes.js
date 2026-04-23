const express = require("express");
const router = express.Router();
const {isAuthenticated, isAdmin, isManager, isAttendant} = require("../middleware/auth")

// import models
const Registration = require('../models/Registration')

router.get("/manager", isManager, (req, res) => {
  res.render("manager");
});

router.get("/admin", async (req, res) => {
  try {
    // determine the selected date, default to today if none is provided
    const queryDate = req.query.date? new Date(req.query.date) : new Date();
    // Created start and end of selected date for mongoDb querying
    const startOfdate = (queryDate.setHours(0,0,0,0));
    const endOfdate = (queryDate.setHours(23,59,59,999));
    // Query signedout vehicle for parking revenue
    // const signedOutVehicles = await

  } catch (error) {
    
  }
  res.render("admin");
});

router.get("/signout", isAttendant, (req, res) => {
  res.render("vehicleSignout");
});

router.get("/attendant", isAttendant, async (req, res) => {
  res.render("attendant");
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