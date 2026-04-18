const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const multer = require("multer");
const { isAttendant } = require("../middleware/auth");


//Import model files
const Vehicle = require("../models/VehicleRegistration");


router.get("/registerVehicle", (req, res) => {
  res.render("vehicleRegistration");
});

router.post("/registerVehicle", (req, res) => {
  res.redirect("/attendant");
});


//Image upload configurations
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
let upload = multer({ storage: storage })


//Routing
// router.get('/registerVehicle', isAttendant, (req, res) => {
//     res.render('vehicleRegistration');
// });

router.post('/registerVehicle', upload.single('vehicleImage'), isAttendant, async (req, res) => {
    try {
        const uniqueTicket = "Rcpt-" + crypto.randomBytes(3).toString("hex").toUpperCase();
        const newVehicle = new Vehicle({
            driverName: req.body.driverName,
            phoneNumber: req.body.phoneNumber,
            vehicleType: req.body.vehicleType,
            numberPlate: req.body.numberPlate,
            vehicleModel: req.body.vehicleModel,
            vehicleColor: req.body.vehicleColor,
            ninNumber: req.body.ninNumber,
            arrivalTime: req.body.arrivalTime,
            receiptNumber: uniqueTicket,
            vehicleImage: req.file.path
        })
        console.log(newVehicle)
        await newVehicle.save();
        res.redirect('/')
    } catch (error) {
        console.error(error)
        res.render("vehicleRegistration")
    }

});



// router.get("/vehiclelist", async (req, res) => {
//     try {
//         let vehicles = await Vehicle.find({ status: "Parked" }).sort({ $natural: -1 })
//         res.render("vehicleList", { vehicles })
//     } catch (error) {
//         res.status(400).send("Unable to find vehicles in the Database.")
//     }
// })

//Update vehicle routes
//Show the update form
// router.get("/vehicles/update/:id", async (req, res) => {
//     try {
//         const vehicle = await Vehicle.findById(req.params.id)
//         if (!vehicle) return res.redirect("/vehicleList")
//         res.render("updateVehicle", { vehicle })
//     } catch (error) {
//         res.status(400).send("Unable to find vehicle in the Database.")
//     }
// })

// router.post("/vehicles/update/:id", async (req, res) => {
//     try {
//         await Vehicle.findByIdAndUpdate(req.params.id, req.body);
//         res.redirect("/vehicleList")
//     } catch (error) {
//         res.status(400).send("Unable to update vehicle in the Database.")
//     }
// })

// router.post("/vehicles/delete", async (req, res) => {
//     try {
//         await Vehicle.deleteOne({_id: req.body.id});
//         res.redirect("/vehicleList")
//     } catch (error) {
//         res.status(400).send("Unable to delete vehicle in the Database.")
//     }
// })

module.exports = router;
