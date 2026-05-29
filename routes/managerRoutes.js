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
    const totalBatteries = availableBatteries.length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const batteryTransactionsTodayCount = await BatteryTransaction.countDocuments({
      transactionDate: { $gte: todayStart, $lte: todayEnd },
    });
    const tyreServicesTodayCount = await TyreTransaction.countDocuments({
      transactionDate: { $gte: todayStart, $lte: todayEnd },
    });

    const tyreActivities = await TyreTransaction.find({
      transactionDate: { $gte: todayStart, $lte: todayEnd },
    })
      .sort({ transactionDate: -1 })
      .limit(10)
      .lean();

    const batteryActivities = await BatteryTransaction.find({
      transactionDate: { $gte: todayStart, $lte: todayEnd },
    })
      .populate("batteryId")
      .sort({ transactionDate: -1 })
      .limit(10)
      .lean();

    const recentActivities = [
      ...tyreActivities.map((tx) => ({
        timeValue: tx.transactionDate ? new Date(tx.transactionDate).getTime() : 0,
        time: tx.transactionDate ? new Date(tx.transactionDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
        service: tx.serviceType ? `Tyre ${tx.serviceType}` : "Tyre Service",
        item: [tx.tyreModel, tx.tyreSize].filter(Boolean).join(" "),
        status: "Completed",
      })),
      ...batteryActivities.map((tx) => ({
        timeValue: tx.transactionDate ? new Date(tx.transactionDate).getTime() : 0,
        time: tx.transactionDate ? new Date(tx.transactionDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
        service: `Battery ${tx.transactionType || "Service"}`,
        item: [tx.batteryId?.batteryType, tx.batteryId?.batteryBrand].filter(Boolean).join(" "),
        status: "Completed",
      })),
    ]
      .sort((a, b) => b.timeValue - a.timeValue)
      .slice(0, 10);

    res.render("manager", {
      allBatteries: availableBatteries,
      totalBatteries,
      batteryTransactionsTodayCount,
      tyreServicesTodayCount,
      recentActivities,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Unable to render the manager dashboard.");
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
    const successMessage = req.query.success === "1" ? "Battery transaction submitted successfully." : null;
    res.render("batterySection", { availableBattries, successMessage });
  } catch (error) {
    console.error(error);
    res.status(400).send("Oops! Battery not found in the database.");
  }
});

router.post("/battryServices", isManager, async (req, res) => {
  try {
    const { batteryId, numberPlate, transactionType, amountPaid } = req.body;

    if (!batteryId || !transactionType || !numberPlate) {
      const availableBattries = await BatteryRegistration.find({ status: "Available" });
      return res.status(400).render("batterySection", {
        availableBattries,
        errorMessage: "Please select a battery, transaction type, and number plate.",
      });
    }

    const battery = await BatteryRegistration.findOne({ _id: batteryId, status: "Available" });
    if (!battery) {
      const availableBattries = await BatteryRegistration.find({ status: "Available" });
      return res.status(400).render("batterySection", {
        availableBattries,
        errorMessage: "Selected battery is not available. Please choose another battery.",
      });
    }

    const newBatteryTx = new BatteryTransaction({
      numberPlate,
      batteryId,
      transactionType,
      amountPaid: Number(amountPaid) || 0,
    });
    await newBatteryTx.save();

    const newBatteryStatus = transactionType === "Sale" ? "Solde" : "Hired";
    await BatteryRegistration.findByIdAndUpdate(batteryId, { status: newBatteryStatus });

    res.redirect("/battryServices?success=1");
  } catch (error) {
    console.error(error);
    const availableBattries = await BatteryRegistration.find({ status: "Available" });
    res.status(500).render("batterySection", {
      availableBattries,
      errorMessage: "Unable to complete the battery transaction. Please try again.",
    });
  }
});

module.exports = router;