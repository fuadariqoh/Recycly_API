const express = require("express");
const { rewardControllers } = require("../controllers/");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.get("/getreward", rewardControllers.getReward);
router.post("/buyreward", rewardControllers.buyReward);
// router.put("/acceptreward/:id", rewardControllers.acceptTransactionReward);
router.get("/getrewarduser", rewardControllers.getRewardUser);
router.get("/totalreward", rewardControllers.getTotalReward);

module.exports = router;
