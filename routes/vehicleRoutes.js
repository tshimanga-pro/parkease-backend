const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const multer = require("multer");
const { isAuthenticated, isAttendant } = require("../middleware/auth");


//Import model files
const VehicleRegistration = require("../models/VehicleRegistration");

// Image upload configurations
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
let upload = multer({ storage: storage })

//Routing
router.get("/registerVehicle", isAttendant, (req, res) => {
  res.render("vehicleRegistration");
});

router.post("/registerVehicle", upload.single("vehicleImage"), isAttendant, async (req, res) => {
    try {
        const uniqueTicket = "RCPT-" + crypto.randomBytes(3).toString("hex").toUpperCase();
        const newVehicle = new VehicleRegistration({
            driverName: req.body.driverName,
            phoneNumber: req.body.phoneNumber,
            vehicleType: req.body.vehicleType,
            numberPlate: req.body.numberPlate,
            vehicleImage: req.body.vehicleImage,
            vehicleModel: req.body.vehicleModel,
            vehicleColor: req.body.vehicleColor,
            ninNumber: req.body.ninNumber,
            arrivalTime: req.body.arrivalTime,
            receiptNumber: uniqueTicket,
            vehicleImage: req.file.path
      

        })
        console.log(req.body)
        await newVehicle.save();
          res.redirect("/attendant");
    } catch (error) {
        console.error(error)
        res.render("vehicleRegistration");
    }

})

router.get("/signout", (req, res)=>{
    res.render("vehicleSignout");
})

router.get("/vehiclelist", async (req, res) => {
    try { 
        let vehicles = await VehicleRegistration.find({ status: "Parked" }).sort({ $natural: -1 })
        res.render("vehicleList", { vehicles })
    } catch (error) {
        res.status(400).send("Unable to find vehicles in the Database.")
    }
})

// Update vehicle routes
// Show the update form 
router.get("/vehicles/update/:id", async (req, res) => {
    try {
        const vehicle = await VehicleRegistration.findById(req.params.id)
        if (!vehicle) return res.redirect("/vehicleList")
        res.render("updateVehicle", { vehicle })
    } catch (error) {
        res.status(400).send("Unable to find vehicle in the Database.")
    }
})

router.post("/vehicles/update/:id", async (req, res) => {
    try {
        await VehicleRegistration.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/vehicleList")
    } catch (error) {
        res.status(400).send("Unable to update vehicle in the Database.")
    }
})

router.post("/vehicles/delete", async (req, res) => {
    try {
        await VehicleRegistration.deleteOne({_id: req.body.id});
        res.redirect("/vehicleList")
    } catch (error) {
        res.status(400).send("Unable to delete vehicle in the Database.")
    }
})



module.exports = router;
