const express = require("express");
const { authControllers } = require("../controllers/");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.post("/register", authControllers.register);
router.get("/verified", auth, authControllers.verifieduser);
router.post("/sendemailverified", authControllers.sendEmailVerified);
router.get("/login", authControllers.login);
router.post("/sendemailpassword", authControllers.sendEmailPassword);
router.get("/resetpassword", auth, authControllers.ResetPassword);
router.get("/getusers", authControllers.getUser);
router.get("/getaddress/:id", authControllers.getAddress);
router.get("/getpoints/:id", authControllers.getPoints);
router.put("/banuser/:id", authControllers.banUser);
router.post("/proofimage", authControllers.proofimage);
router.get("/gettotaluser", authControllers.getTotalUser);
router.get("/keeplogin", auth, authControllers.keepLogin);

module.exports = router;
