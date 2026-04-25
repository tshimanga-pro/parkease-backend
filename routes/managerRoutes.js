const express = require("express");
const router = express.Router();
const multer  = require("multer");
const {isAuthenticated, isManager} = require("../middleware/auth")

// Importing Models
const BatteryRegistration = require("../models/BatteryRegistration");
const BatteryTransaction = require("../models/BatteryTransaction");
const TyreTransaction = require("../models/TyreTransaction");
  
// Routing
router.get("/manager", isManager, async (req, res) => {
  try {
    const availableBatteries = await BatteryRegistration.find({ status: "Available" }).sort({ dateAdded: -1 });
    const totalAvailableBatteries = availableBatteries.length;
    res.render("manager", { availableBatteries, totalAvailableBatteries });
  } catch (error) {
    console.error(error);
    res.status(400).send("No batteries available in the database.");
  }
});

// Image upload configurations
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

let upload = multer({ storage: storage })

router.get("/registerBattery", isManager, (req, res) => {
  res.render("battery");
})

router.post("/registerBattery", upload.single('batteryImage'), isManager, async (req, res) => {
  console.log("reached here");
  try {
    const newBattery = new BatteryRegistration(req.body);
    newBattery.batteryImage = req.file.path
    await newBattery.save();
    console.log(newBattery);
    
    res.redirect("/manager");
  } catch (error) {
    console.error(error);
    res.render("battery");
  }
})

router.get("/batteryList", isManager, async (req, res) => {
  try {
    const batteries = await BatteryRegistration.find().sort({ dateAdded: -1 });
    res.render("batteryList", { batteries });
  } catch (error) {
    console.error(error);
    res.status(400).send("Unable to load battery list.");
  }
});

// Tyre Transaction
router.get("/tyreService", isManager, (req, res) => {
  res.render("tyreClinic");
});

router.post("/tyreService", isManager, async (req, res) => {
  try {
    const newTyre = new TyreTransaction(req.body);
    await newTyre.save();
    res.redirect("/tyreService");
  } catch (error) {
    console.error(error);
    res.render("tyreClinic");
  }
});

// Battery Services
router.get("/battryServices", isManager, async (req, res) => {
  try {
    const availableBattries = await BatteryRegistration.find({ status: "Available" });
    res.render("batterySection", { availableBattries });
  } catch (error) {
    console.error(error);
    res.status(400).send("Oops! Battery not found in the database.");
  }
});

router.post("/battryService", isManager, async (req, res) => {
  try {
    const newBattery = new BatteryTransaction(req.body);
    await newBattery.save();
    const newBatteryStatus = req.body.transactionType === "Sale" ? "Solde" : "Hired";
    await BatteryRegistration.findByIdAndUpdate(req.body.BatteryRegistrationId, { status: newBatteryStatus });
    res.redirect("/manager");
  } catch (error) {
    console.error(error);
    res.render("batterySection");
  }
});

module.exports = router;















module.exports = router;