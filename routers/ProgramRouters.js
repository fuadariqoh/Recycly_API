const express = require("express");
const { programControllers } = require("../controllers");
const { auth } = require("../helpers/Auth");
// const ProgramControllers = require("../controllers/ProgramControllers");
const router = express.Router();

router.post('/addprogram',programControllers.addProgram)

module.exports = router;
