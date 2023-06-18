// Import Modules
const express = require("express");

const router = express.Router();

// Import Controllers
const { Dashbard } = require("../../Controllers/Admin/Dashboard");
const { TotalUser } = require("../../Controllers/Admin/TotalUsers");

router.get("/", Dashbard);
router.get("/total-users", TotalUser)

module.exports = router;
