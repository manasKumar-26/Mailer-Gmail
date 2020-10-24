const fs = require("fs"); //To read and write files
const { google } = require("googleapis"); // Google API to authenticate and send mails
// Scope of the current User what it can do i.e send modify and compose
var SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.send",
];
let currentUserAuth; // to store current authenticated user
const TOKEN_PATH = "token.json"; // to store the access token of logged in user;
// to handle the authentication after google send a secret key for the user in browser
module.exports.handleToken = (req, res) => {
  return res.send(
    `Here is your token code to be used in redirect url query param : ${req.query.code}`
  );
};
//We check the credentials file if out project is valid to use gmail api or not
const authorize = (credentials, res) => {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  //Check if token.json is present or not if not then call the getNewToken method
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      return getNewToken(oAuth2Client, res);
    }
    //If present then validate and set credential of current logged in user and send response success
    oAuth2Client.setCredentials(JSON.parse(token));
    currentUserAuth = oAuth2Client;
    return res.status(200).json({
      Message: "Successfully Authenticated",
    });
  });
};
//We create a url where we define the scope that we want of the current user who is trying to log in
//After our url is created then we request the user to visit that and after reciving secret key
//we call the redirect url which calls our verifyToken function below
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
//After getting the secret key and calling the redirect url verifyToken verifies the code and creates our
//Token.json and return success;
module.exports.verifyToken = (req, res) => {
  const code = req.query.code;
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
//creating Email Message
const makeEmailBody = (to, subject, message) => {
  let str = [
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

  let encodedMail = new Buffer(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return encodedMail;
};
//To send the mail
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
//To call send mail after auth
module.exports.Mail = (req, res) => {
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
//Calls the authenticate function when someone tries to authenticate
//If Credentials is not present in root directory then throws an error else calls authorize function
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
