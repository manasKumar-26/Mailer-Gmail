const express = require("express");
const router = express.Router();
const mailController = require("../../Controllers/mailController");
router.get("/authenticate", mailController.authenticate);
router.get("/verifyToken", mailController.verifyToken);
router.post("/sendMail", mailController.sendMail);
module.exports = router;
