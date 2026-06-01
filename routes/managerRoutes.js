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
    // cumulative count of available batteries (efficient DB count)
    const totalBatteries = await BatteryRegistration.countDocuments({ status: "Available" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const batteryTransactionsTodayCount = await BatteryTransaction.countDocuments({
      transactionDate: { $gte: todayStart, $lte: todayEnd },
    });
    const batteryTransactionsTodayTotals = await BatteryTransaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalAmountPaid: { $sum: "$amountPaid" },
        },
      },
    ]);
    const batteryTransactionsTodayAmount = batteryTransactionsTodayTotals.length > 0 ? batteryTransactionsTodayTotals[0].totalAmountPaid : 0;
    const formattedBatteryTransactionsTodayAmount = `UGX ${batteryTransactionsTodayAmount.toLocaleString('en-UG')}`;

    const tyreServicesTodayCount = await TyreTransaction.countDocuments({
      transactionDate: { $gte: todayStart, $lte: todayEnd },
    });

    const tyreTodayTotals = await TyreTransaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalServicesAmount: { $sum: "$servicesTotal" },
        },
      },
    ]);

    const tyreServicesTotalAmount = tyreTodayTotals.length > 0 ? tyreTodayTotals[0].totalServicesAmount : 0;
    const formattedTyreServiceTotal = `UGX ${tyreServicesTotalAmount.toLocaleString('en-UG')}`;

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
      formattedBatteryTransactionsTodayAmount,
      tyreServicesTodayCount,
      formattedTyreServiceTotal,
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
  const successMessage = req.query.success === "1" ? "Tyre service submitted successfully." : null;
  res.render("tyreClinic", { successMessage });
});

router.post("/tyreService", isManager, async (req, res) => {
  try {
    const {
      tyreSize,
      tyreModel,
      services,
      amountPaid,
      pressureTotal,
      punctureTotal,
      valvesTotal,
      servicesTotal,
    } = req.body;

    const serviceList = Array.isArray(services) ? services : services ? [services] : [];
    const parsedAmount = Number(amountPaid) || 0;
    const parsedPressureTotal = Number(pressureTotal) || 0;
    const parsedPunctureTotal = Number(punctureTotal) || 0;
    const parsedValvesTotal = Number(valvesTotal) || 0;
    const parsedServicesTotal = Number(servicesTotal) || 0;

    if (!tyreSize || !tyreModel || !serviceList.length || parsedAmount <= 0 || parsedServicesTotal <= 0) {
      return res.status(400).render("tyreClinic", {
        errorMessage: "Please calculate charges and ensure tyre size/model and at least one service are selected before submitting.",
      });
    }

    const newTyre = new TyreTransaction({
      tyreSize,
      tyreModel,
      services: serviceList,
      amountPaid: parsedAmount,
      pressureTotal: parsedPressureTotal,
      punctureTotal: parsedPunctureTotal,
      valvesTotal: parsedValvesTotal,
      servicesTotal: parsedServicesTotal,
    });

    await newTyre.save();
    res.redirect("/tyreService?success=1");
  } catch (error) {
    console.error(error);
    res.status(500).render("tyreClinic", {
      errorMessage: "Unable to save tyre service. Please try again.",
    });
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