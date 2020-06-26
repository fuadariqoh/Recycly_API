const express = require("express");
const { rewardControllers } = require("../controllers/");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.get("/getreward", rewardControllers.getReward);
router.get("/getrewardtransaction", rewardControllers.getTransactionReward);
router.put("/buyreward", rewardControllers.buyReward);
router.put("/acceptreward/:id", rewardControllers.acceptTransactionReward);

module.exports = router;