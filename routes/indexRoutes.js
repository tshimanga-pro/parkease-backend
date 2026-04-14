const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router; //its critical to have this line inorder to import the files