const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  // password: "Maroon511",
  // database: "finalproject",
  password: "afong456",
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
