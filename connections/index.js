const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "afong456",
  database: "final_jc12",
  port: "3306",
});
db.connect((err) => {
  if (err) {
    console.log(err);
  }
  console.log("connect sudah");
});

module.exports = db;
