const express = require("express");
const router = express.Router();

//Import model files
const Registration = require("../models/Registration");
const VehicleRegistration = require("../models/VehicleRegistration");
const BatteryRegistration = require("../models/BatteryRegistration");

router.get("/users", async (req, res) => {
    try {
       let users = await Registration.find().sort({$natural:-1})
       res.render("userList", {users}); 
    } catch (error) {
        res.status(400).send("Unable to find users in the database")
    }  
});

router.get("/registerVehicle", async (req, res) => {
    try {
        let vehicle = await VehicleRegistration.find().sort({$natural:-1})
        res.render("vehicleList", {vehicle});
    } catch (error) {
       res.status(400).send("Unable to find cars in the database") 
    }
});

router.get("/registerBattery", async (req, res) => {
    try {
        let batteries = await BatteryRegistration.find().sort({$natural:-1})
        res.render("batteryList", {batteries});
    } catch (error) {
        res.status(400).send("Unable to find batteries in the database")  
    }
});

module.exports = router;