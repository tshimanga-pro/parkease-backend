//1.Dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const expressSession = require('express-session');
const passport = require('passport');

// import registration model 
const Registration = require('./models/Registration')
require("dotenv").config();


// import routes
const indexRoutes = require("./routes/indexRoutes");
const authRoutes = require("./routes/authRoutes");
const tyreRoutes = require("./routes/tyreRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const batteryRoutes = require("./routes/batteryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const signoutRoutes = require("./routes/signoutRoutes");



// 2.Instantiations
const app = express();
const PORT = 3005 ;

// 3.Configurations
//Mongodb settings- setting up connections to the database.
mongoose.connect(process.env.DB);
mongoose.connection
  .once("open", () => {
    console.log("You are connected to mongoDATABASE");
  })
  .on("error", (err) => {
    console.error(`Connection error:${err.message}`);
  });


//set view engine to pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views")); //specifies the views' directory

// 4.Middleware
// To parse URL encoded data
app.use(express.static(path.join(__dirname, "public"))); //this helps to serve static files like css, js, images from the public folder
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(express.urlencoded({ extended: false })); //this helps to parse data from forms
app.use(expressSession({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/* PASSPORT LOCAL AUTHENTICATION */
passport.use(Registration.createStrategy());
passport.serializeUser(Registration.serializeUser());
passport.deserializeUser(Registration.deserializeUser());

// Global variable to make the logged in user available to all pug templates
// Passport automatically attaches the logged in user to req.user
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

// 5.Routes
// using imported routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/",tyreRoutes);
app.use("/", dashboardRoutes);
app.use("/", batteryRoutes);
app.use ("/", contactRoutes);
app.use("/", vehicleRoutes);
app.use("/", signoutRoutes);






//non existant routes regardless of the method used(get, post, put, delete) will be caught by this middleware
// This will always the last endpoint in this file
app.use((req, res) => {
  res.status(404).send("Oops! Route not found.");
});

// 6.Bootstrapping Server
app.listen(PORT, () => console.log(`listening on port ${PORT}`));

//full route path
//route path in the server.js + route path in the routes file
//e.g. full path for signup route
//  /auth/signup
//  /auth/login

