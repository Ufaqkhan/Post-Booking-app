require("dotenv").config({ path: ".env" });

const express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");

const connectDB = require("./config/db");

connectDB();
const app = express();

app.use(cors({ credentials: true, origin: true }));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());

//app.use(express.static(__dirname + '/public'));

//app.use("/api/v2", require("./routes/clientCallsRouter"));
app.use("/api", require("./routes/smsRouter"));


app.get("/", (req, res) => {
  res.send("client app");
  console.log("cool");
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`running on port ${port}`);
});