const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const fetch = require("node-fetch");
var SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
];
let currentUserAuth;
const TOKEN_PATH = "token.json";
module.exports.handleToken = (req, res) => {
  return res.send(
    `Here is your token code to be used in redirect url query param : ${req.query.code}`
  );
};
const authorize = (credentials, res) => {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getNewToken(oAuth2Client, res);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    currentUserAuth = oAuth2Client;
    return res.status(200).json({
      Message: "Successfully Authenticated",
    });
  });
};
const getNewToken = (oAuth2Client, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  return res.status(200).json({
    Message:
      "Visit this URL to authenticate and enter the generated code as query param of redirect url mentioned Below",
    Authenticate: authUrl,
    Redirect: 'localhost:8000/api/verifyToken/?code=<"Auth Code">',
  });
};
module.exports.verifyToken = (req, res) => {
  const code = req.query.code;
  console.log(code);
  fs.readFile("credentials.json", (err, content) => {
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        currentUserAuth = oAuth2Client;
        return res.status(200).json({
          Message: "Successfully Authenticated",
        });
      });
    });
  });
};
const makeEmailBody = (to, subject, message) => {
  var str = [
    'Content-Type: text/plain; charset="UTF-8"\n',
    "MIME-Version: 1.0\n",
    "Content-Transfer-Encoding: 7bit\n",
    "to: ",
    to,
    "\n",
    "subject: ",
    subject,
    "\n\n",
    message,
  ].join("");

  var encodedMail = new Buffer(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return encodedMail;
};

const sendEmail = async (auth, email_details, cb) => {
  const gmail = google.gmail({ version: "v1", auth });
  gmail.users.messages
    .send({
      userId: "me",
      resource: {
        raw: makeEmailBody(
          email_details.to,
          email_details.subject,
          email_details.body
        ),
      },
    })
    .then((result) => cb(null, result))
    .catch((err) => cb(err, null));
};
module.exports.sendMail = (req, res) => {
  const { to, subject, body } = req.body;
  sendEmail(currentUserAuth, { to, subject, body }, (err, result) => {
    if (err) {
      res.status(401).json({
        msg: "Please Log in and try again",
      });
    } else {
      res.json({
        success: true,
        Mail: {
          To: to,
          Subject: subject,
          Message: body,
        },
      });
    }
  });
};
module.exports.authenticate = (req, res) => {
  fs.readFile("credentials.json", (err, content) => {
    if (err) {
      return res.status(200).json({
        Message: "File Not Present",
      });
    }
    authorize(JSON.parse(content), res);
  });
};
