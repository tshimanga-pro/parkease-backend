const mongoose = require('mongoose');
const BattryTransactionSchema = new mongoose.Schema({
    numberPlate: {
        type: String,
    },
    batteryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Battery"
    },
    transactionType: {
        type: String,
        enum: ["Hire","Sale"]
    },
    amountPaid: {
        type: Number,
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    
});

module.exports = mongoose.model("BatteryTransaction", BattryTransactionSchema);