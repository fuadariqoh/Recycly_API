const express = require("express");
const { authControllers } = require("../controllers/");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.post("/register", authControllers.register);
router.get("/verified", auth, authControllers.verifieduser);
router.post("/sendemailverified", authControllers.sendEmailVerified);
router.get('/login',authControllers.login)
router.post("/sendemailpassword", authControllers.sendEmailPassword);
router.get("/resetpassword", auth, authControllers.ResetPassword);

module.exports = router;
