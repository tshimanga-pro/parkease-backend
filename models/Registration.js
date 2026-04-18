const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose').default || require('passport-local-mongoose')

const registrationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true
  },
  surname: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true
  },
  telephone: {
    type: String,
    trim: true
  },
  role: {
    type: String
  },
});
registrationSchema.plugin(passportLocalMongoose, {usernameField: "email"})


module.exports = mongoose.model("Registration", registrationSchema);