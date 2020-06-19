const express = require("express");
const { rewardControllers } = require("../controllers/");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.get("/getreward", rewardControllers.getReward);

module.exports = router;
