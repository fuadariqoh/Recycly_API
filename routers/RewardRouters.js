const express = require("express");
const { rewardControllers } = require("../controllers/");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.get("/getreward", rewardControllers.getReward);
router.post("/buyreward", rewardControllers.buyReward);
// router.put("/acceptreward/:id", rewardControllers.acceptTransactionReward);
router.get("/getrewarduser", rewardControllers.getRewardUser);
router.get("/totalreward", rewardControllers.getTotalReward);
router.get("/rewarddetails", rewardControllers.getRewardDetail);
router.get("/getothergift", rewardControllers.getOtherGift);
router.get("/getcartdata", rewardControllers.getCartData);
router.put("/deletefromcart", rewardControllers.deleteFromCart);
router.put("/checkoutreward", rewardControllers.checkOutReward);
router.get(
  "/gettotalrewardtransaction",
  rewardControllers.getTotalRewardTransaction
);
router.get(
  "/getallrewardtransaction",
  rewardControllers.getAllDataTransactionReward
);
router.get("/getrewardreport", rewardControllers.getRewardReport);

module.exports = router;
