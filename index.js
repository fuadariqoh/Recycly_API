const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const bearertoken = require("express-bearer-token");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bearertoken());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).send("<h1>SELAMAT DATANG DI API FINAL PROJECT JC 12</h1>");
});

const { authRouters, rewardRouters, programRouters } = require("./routers");

app.use("/users", authRouters);
app.use("/users", rewardRouters);
app.use("/programs", programRouters);

app.listen(PORT, () => console.log(`APP JALAN DI PORT ${PORT}`));
