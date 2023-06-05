// Import Modules
const express = require("express");

const router = express.Router();

// Import Controllers
const {ReceiveMsg} = require("../../Controllers/User/AI-Message/ReceiveMsg");

router.post("/", ReceiveMsg);

module.exports = router;
