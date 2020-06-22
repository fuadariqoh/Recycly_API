const express = require("express");
const { programControllers } = require("../controllers");
const { auth } = require("../helpers/Auth");
const router = express.Router();

router.post("/addprogram", programControllers.addProgram);
router.get("/getprogram", programControllers.getProgram);

//================ USER ROUTER FOR PAGINATION, SEARCH, FILTER, SORT ================//

router.get("/getprogramuser", programControllers.getProgramUser);
router.get("/totalprogram", programControllers.getTotalProgram);
router.get("/programdetail/:id", programControllers.selectProgram);
router.get("/category", programControllers.getCategory);

module.exports = router;
