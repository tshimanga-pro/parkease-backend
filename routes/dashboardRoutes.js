const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
  isAdmin,
  isManager,
  isAttendant,
} = require("../middleware/auth");

// import models
const Registration = require("../models/Registration");
const VehicleRegistration = require("../models/VehicleRegistration");
const VehicleSignOut = require("../models/VehicleSignOut");
const TyreTransaction = require("../models/TyreTransaction");
const BatteryTransaction = require("../models/BatteryTransaction");
router.get("/manager", isManager, (req, res) => {
  res.render("manager");
});

router.get("/admin", async (req, res) => {
  try {
    // determine the selected date, default to today if none is provided
    const queryDate = req.query.date ? new Date(req.query.date) : new Date();
    // Created start and end of selected date for mongoDb querying
    const startOfdate = queryDate.setHours(0, 0, 0, 0);
    const endOfdate = queryDate.setHours(23, 59, 59, 999);

    // 1. Query signedout vehicle for parking revenue
    const signedOutVehicles = await VehicleSignOut.find({
      signoutTime: {
        $gte: startOfdate,
        $lte: endOfdate,
      },
    })
      .populate("vehicleId")
      .sort({ signoutTime: -1 });
    // Calculate/get parking Revenue
    const parkingRevenue = VehicleSignOut.reduce((total, record) => {
      return total + (record.amountPaid || 0);
    }, 0);

    // 2. Query Tyre Transaction
    const TyreTransactions = await TyreTransaction.find({
      transactionDate: {
        $gte: startOfdate,
        $lte: endOfdate,
      },
    });

    // Calculate Tyre Revenue
    const tyreRevenue = TyreTransaction.reduce((total, record) => {
      return total + (record.amountPaid || 0);
    }, 0);

    // 3.  Query Battery Transactions
    const batteryTransactions = await BatteryTransaction.find({
      transactionDate: {
        $gte: startOfdate,
        $lte: endOfdate,
      },
    });

    // Calculate Battery Revenue
    const batteryRevenue = BatteryTransaction.reduce((total, record) => {
      return total + (record.amountPaid || 0);
    }, 0);
    re.render("admin", {
      selectedDate: startOfdate.toISOString().split("T")[0],
      signedOutVehicles,
      parkingRevenue,
      tyreRevenue,
      batteryRevenue,

    })

  } catch (error) {}
  console.error(error.message)
  res.render(400).send("No Data found in the Database!")
});

router.get("/signout", isAttendant, (req, res) => {
  res.render("vehicleSignout");
});

router.get("/attendant", isAttendant, async (req, res) => {
  try {
    const parkedVehicles = await VehicleRegistration.find({
      status: "Parked",
    }).sort({ $natural: -1 });
    const totalVehiclesPacked = parkedVehicles.length;

    res.render("attendant", { parkedVehicles, totalVehiclesPacked });
  } catch (error) {
    console.error(error);
    res.render("attendant", { parkedVehicles: [], totalVehiclesPacked: 0 });
  }
});

router.get("/usersList", isAdmin, async (req, res) => {
  try {
    let users = await Registration.find().sort({ $natural: -1 });
    res.render("usersList", { users });
  } catch (error) {
    res.status(400).send("Unable to find users in the Database.");
  }
});

module.exports = router;
