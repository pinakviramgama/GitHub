const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log("rendered index.ejs");
  res.render("index");
});

module.exports = router;
