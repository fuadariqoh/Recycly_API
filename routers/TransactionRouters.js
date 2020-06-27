const express = require("express");
const { transactionController } = require("../controllers");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.get("/paymentmethod", transactionController.getPaymentMethod);
router.get("/getaddress/:id", transactionController.getUserAddress);
router.post("/join", transactionController.joinProgram);
router.get("/transactiondetail/:id", transactionController.transactionDetail);
router.get(
  "/selectedpayment/:id",
  transactionController.getSelectedPaymentMethod
);
router.post("/uploadpayment", auth, transactionController.uploadPayment);
// MANAGE TRANSAKSI START
router.get("/confirmpayment", transactionController.getDataWaitForConfirm);
router.get("/getalltransaction", transactionController.getAllTransaction);
router.get(
  "/gettotalconfirmpayment",
  transactionController.getTotalConfirmPayment
);
router.get(
  "/gettotaltransaction",
  transactionController.getTotalAllTransaction
);

router.put("/onaccepttransaction", transactionController.onAcceptTransaction);
router.put("/declinetransaction", transactionController.onDeclineTransaction);
router.put("/acceptpickup", transactionController.acceptPickUp);
router.put("/declinepickup", transactionController.declinePickup);
router.get(
  "/gettotalconfirmpickup",
  transactionController.getTotalConfirmPickup
);
router.get("/confirmpickup", transactionController.getConfirmPickUpData);
// MANAGE TRANSAKSI END

// TRANSACTION HISTORY START
router.get(
  "/totaltransactionhistory/:id",
  transactionController.totalTransactionHistory
);
router.get(
  "/datatransactionhistory/:id",
  transactionController.getDataTotalTransactionHistory
);

module.exports = router;
