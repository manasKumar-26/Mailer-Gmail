const express = require("express");
const port = process.env.PORT || 8000;
const app = express();
const mailController = require("./Controllers/mailController");
app.use(express.urlencoded());
app.get("/", mailController.handleToken);
app.use("/api", require("./Routes/API"));
app.listen(port, (err) => {
  if (err) {
    console.error.bind("Error", console);
    return;
  }
  console.log("Server set up at port ", port);
});
