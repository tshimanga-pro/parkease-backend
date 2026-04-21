const express = require("express");
const router = express.Router();
const multer  = require("multer");
const {isManager} = require("../middleware/auth")

const BatteryRegistration = require("../models/BatteryRegistration");

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
  
})

module.exports = router;