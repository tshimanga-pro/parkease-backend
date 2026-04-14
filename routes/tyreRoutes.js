const express = require("express");
const router = express.Router();
const {isAuthenticated, isAdmin, isManager, isAttendant} = require("../middleware/auth")

const TyreClinic = require("../models/TyreTransaction");

router.get("/tyreService", (req, res) => {
  res.render("tyreClinic");
});

router.post("/tyreService", async (req, res) => {
  console.log("reached here");
  try {
    const newTyre = new Tyre(req.body);
    console.log(newTyre);
    await newTyre.save();
    res.redirect("/tyreService");
  } catch (error) {
    console.error(error);
    res.render("tyreClinic");
  }
});

module.exports = router;