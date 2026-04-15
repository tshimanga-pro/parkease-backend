const mongoose = require("mongoose");

const VehicleSignedOutSchema = new mongoose.Schema({
    recieverName: {
        type: String,
        trim: true
    },
    receiptNumberNumber: {
        type: String,
        trim: true
    },
    signoutTime: {
        type: Date,
        default: Date.now
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        trim: true
    },
    ninNumber: {
        type: String,
        trim: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VehicleRegistration"
    },
    amountPaid: {
        type: Number,
    }
})

module.exports = mongoose.model("VehicleSignOut", VehicleSignedOutSchema);