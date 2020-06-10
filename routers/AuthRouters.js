const express = require("express");
const { authControllers } = require("../controllers/");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.post("/register", authControllers.register);
router.get("/verified", auth, authControllers.verifieduser);
router.post("/sendemailverified", authControllers.sendEmailVerified);

module.exports = router;
