const express = require("express");
const { rewardControllers } = require("../controllers/");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.get("/getreward", rewardControllers.getReward);
router.get("/getrewardspec", rewardControllers.getRewardSpec);
router.get("/getrewardredeemed/:id", rewardControllers.getRewardRedeemed);
router.get('/getrewardcompletedbyuser/:id',rewardControllers.getRewardCompletedbyUser)

router.put("/buyreward", rewardControllers.buyReward);
router.post("/buyreward", rewardControllers.buyReward);
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
