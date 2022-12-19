const express = require("express");
const router = express.Router();
const { register,reply } = require("../controllers/smsFunctions");

router.post("/register", register);
router.post("/reply", reply);


module.exports = router;
