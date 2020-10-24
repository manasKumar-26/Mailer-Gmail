const express = require("express");
const router = express.Router();
const mailController = require("../../Controllers/mailController");
router.get("/authenticate", mailController.authenticate); //To Authenticate
router.get("/verifyToken", mailController.verifyToken); //To validate
router.post("/sendMail", mailController.Mail); //To send mail
module.exports = router;
