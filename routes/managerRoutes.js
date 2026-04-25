const express = require("express");
const router = express.Router();
const multer  = require("multer");
const {isAuthenticated, isManager} = require("../middleware/auth")

// Importing Models
const BatteryRegistration = require("../models/BatteryRegistration");
const BatteryTransaction = require("../models/BatteryTransaction");
const TyreTransaction = require("../models/TyreTransaction");
  
// Routing
router.get("/manager", isManager, async (req, res)=>{
    try {
        let battries = await BatteryRegistration.find().sort({naturel:-1})
        res.render("manager", {battries})
    } catch (error) {
        res.status(400).send("Manager not found in the Database") 
    }
})

//Image upload configurations
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
    let batteries = await Battery.find().sort({natural: -1})
    res.render("batteryList", {batteries})
  } catch (error) {
    
  }
//   Tyre Transaction
  router.get("/tyreService", (req, res) => {
    res.render("tyreClinic");
  });
  
  router.post("/tyreService", async (req, res) => {
    console.log("reached here");
    try {
      const newTyre = new TyreTransaction(req.body);
      console.log(newTyre);
      await newTyre.save();
      res.redirect("/tyreService");
    } catch (error) {
      console.error(error);
      res.render("tyreClinic");
    }
  });
  
// Battery Services
  router.get("/battryServices", async (req, res) => {
    try {
        const availableBattries = await BatteryRegistration.find({status:Available})
        res.render("batterySection", {availableBattries});
    } catch (error) {
        res.status(400).send("Oaps Battery not found in the Database") 
    }
 
  });
  
  router.post("/battryService", async (req, res) => {
    console.log("reached here");
    try {
        // Save new Transaction in Battery Transaction Model
      const newBattery = new BatteryTransaction(req.body);
      await newBattery.save();

    // Update Battery Status in the Database  
      const newBatteryStatus = req.body.transactionType === "Sale" ? "Sold" : "Hired" 
      await BatteryRegistration.findByIdAndUpdate(req.body.BatteryRegistrationId, {status: newBatteryStatus})
      res.redirect("/manager");
    } catch (error) {
      console.error(error);
      res.render("batterySection");
    }
  });


})















module.exports = router;