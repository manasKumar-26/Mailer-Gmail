const express = require("express"); //Server Creation
const port = process.env.PORT || 8000; // Port
const app = express();
const mailController = require("./Controllers/mailController"); // Controller
app.use(express.urlencoded()); // To parse the form data
app.get("/", mailController.handleToken);
app.use("/api", require("./Routes/API")); //Routes for our api's
app.listen(port, (err) => {
  if (err) {
    console.error.bind("Error", console);
    return;
  }
  console.log("Server set up at port ", port);
});
