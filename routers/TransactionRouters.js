const express = require("express");
const { transactionController } = require("../controllers");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.get("/paymentmethod", transactionController.getPaymentMethod);
router.get('/getaddress/:id', transactionController.getUserAddress)
router.post('/join', transactionController.joinProgram)
router.get('/transactiondetail/:id', transactionController.transactionDetail)
router.get('/selectedpayment/:id', transactionController.getSelectedPaymentMethod)
router.post('/uploadpayment', auth, transactionController.uploadPayment)

module.exports = router;