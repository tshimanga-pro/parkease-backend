const express = require("express");
const router = express.Router();

router.get("/contact", (req, res) => {
  res.render("contact");
});

module.exports = router; //its critical to have this line inorder to import the files