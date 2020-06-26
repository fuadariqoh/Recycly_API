const mysql = require("mysql");

const db = mysql.createConnection({
  host: "35.247.151.205",
  user: "root",
  password: "AnggaCoolZs90",
  database: "finalproject",

  port: "3306",
});
db.connect((err) => {
  if (err) {
    console.log(err);
  }
  console.log("connect sudah");
});

module.exports = db;
