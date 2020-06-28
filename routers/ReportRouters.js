const express = require("express");
const { reportControllers } = require("../controllers");

const router = express.Router;

router.get("/getprogramcompleted", reportControllers.totalSales);

module.exports = router;
