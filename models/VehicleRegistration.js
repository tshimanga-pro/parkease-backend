const mongoose = require("mongoose");

const VehicleRegistrationSchema = new mongoose.Schema({
    driverName: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    vehicleType: {
        type: String,
    },
    numberPlate: {
        type: String,
        trim: true
    },
    vehicleImage: {
        type: String,
    },
    vehicleModel: {
        type: String,
        trim: true
    },
    vehicleColor: {
        type: String,
        trim: true
    },
    ninNumber: {
        type: String,
        trim: true
    },
    arrivalTime: {
        type: Date,
        default: Date.now,
    },
    receiptNumber: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ["Parked", "Signed-out"], 
        default: "Parked"
    }
})

module.exports = mongoose.model("VehicleRegistration", VehicleRegistrationSchema);