const mongoose = require('mongoose');
const BatteryRegistrationSchema = new mongoose.Schema({
    batteryType: {
        type: String,
    },
    batteryBrand: {
        type: String,
    },
    batteryImage: {
        type: String,
    }
});

module.exports = mongoose.model("BatteryRegistration", BatteryRegistrationSchema);