const express = require("express");
const { programControllers } = require("../controllers");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.post('/addprogram',programControllers.addProgram)
router.get('/getprogram',programControllers.getProgram)

module.exports = router;
