const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const bearertoken = require("express-bearer-token");
var CronJob = require('cron').CronJob;
const { db } = require("./connections");

const app = express();


var job = new CronJob('*/10 * * * *', function() {
  var data = {
      status : 'cancelled_by_system',
      reject_reason : 'payment expired'
    }
    var sql=` UPDATE transactions SET ?
              WHERE (status = 'waiting_payment' OR status = 'canceled' ) 
              AND expired_time < CURRENT_TIMESTAMP`
    db.query(sql, data, (err,result)=>{
        if(err) console.log(err)
        return console.log('Check expired payment:' + result.message)
    })
}, null, true, 'America/Los_Angeles');
job.start();

const PORT = process.env.PORT || 4000;

app.use(bearertoken());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).send("<h1>SELAMAT DATANG DI API FINAL PROJECT JC 12</h1>");
});


const { authRouters, rewardRouters, programRouters, transactionRouters } = require("./routers");

app.use("/users", authRouters);
app.use("/users", rewardRouters);
app.use("/programs", programRouters);
app.use("/transaction", transactionRouters);



app.listen(PORT, () => console.log(`APP JALAN DI PORT ${PORT}`));
