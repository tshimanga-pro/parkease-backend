const express = require("express");
const router = express.Router();

router.get("/battryServices", (req, res) => {
  res.render("batterySection");
});

module.exports = router;