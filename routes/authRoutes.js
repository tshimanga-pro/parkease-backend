// 1. Dependencies
const express = require("express");
const router = express.Router();
const passport = require("passport");

// 2. Import registration file model
const Registration = require("../models/Registration");

router.get("/Signup", (req, res) => {
  res.render("userPage");
});

router.post("/Signup", async (req, res) => {
  try {
      const newUser = Registration(req.body)
  await Registration.register(newUser, req.body.password);
   res.redirect("/admin")
  } catch (error) {
    console.error(error)
    res.send("Not able to save the user to the database")
  }

});
 

router.get("/login", (req, res) => {
  res.render("logIn");
});
router.post("/login", passport.authenticate("local", {
failureRedirect:"/login"
}),(req, res) => {
  if(req.user.role === "Admin"){
    res.redirect("/admin")
  } else if(req.user.role === "Manager"){
    res.redirect("/manager")
  } else if(req.user.role === "Attendant"){
    res.redirect("/attendant")
  } else{
    res.redirect("/");
  }
  });

router.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if(err) { return next(err); }
    res.redirect("/")
  })
})

module.exports = router;
