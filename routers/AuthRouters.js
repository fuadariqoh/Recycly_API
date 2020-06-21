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
router.put("/banuser/:id", authControllers.banUser);
router.get('/keeplogin',auth,authControllers.keepLogin)

module.exports = router;
