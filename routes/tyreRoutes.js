const express = require("express");
const router = express.Router();
const {isAuthenticated, isAdmin, isManager, isAttendant} = require("../middleware/auth")

const TyreTransaction = require("../models/TyreTransaction");

router.get("/tyreService", async (req, res) => {
  try {
    const successMessage = req.query.success === "1" ? "Tyre service submitted successfully." : null;
    const totalResult = await TyreTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalServicesAmount: { $sum: "$servicesTotal" },
        },
      },
    ]);
    const cumulativeTotal = totalResult.length > 0 ? totalResult[0].totalServicesAmount : 0;
    const formattedCumulativeTotal = `UGX ${cumulativeTotal.toLocaleString("en-UG")}`;

    res.render("tyreClinic", {
      successMessage,
      formattedCumulativeTotal,
    });
  } catch (error) {
    console.error(error);
    res.render("tyreClinic", {
      formattedCumulativeTotal: "UGX 0",
    });
  }
});

router.post("/tyreService", async (req, res) => {
  console.log("reached here");
  try {
    const newTyre = new TyreTransaction(req.body);
    console.log(newTyre);
    await newTyre.save();
    res.redirect("/tyreService?success=1");
  } catch (error) {
    console.error(error);
    const totalResult = await TyreTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalServicesAmount: { $sum: "$servicesTotal" },
        },
      },
    ]);
    const cumulativeTotal = totalResult.length > 0 ? totalResult[0].totalServicesAmount : 0;
    const formattedCumulativeTotal = `UGX ${cumulativeTotal.toLocaleString("en-UG")}`;
    res.render("tyreClinic", {
      errorMessage: "Unable to save tyre service. Please try again.",
      formattedCumulativeTotal,
    });
  }
});

module.exports = router;