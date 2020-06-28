const { db } = require("../connections");
const transporter = require("../helpers/mailer");
const { createJWTToken } = require("../helpers/jwt");
const encrypt = require("../helpers/crypto");

module.exports = {
  totalSales: (req, res) => {
    let sql = `
        select 
sum(case when t.program_id=1 then 1 else 0 end)AS PROGRAM_1,
 sum(case when t.program_id=2 then 1 else 0 end)AS PROGRAM_2,
 sum(case when t.program_id=3 then 1 else 0 end)AS PROGRAM_3,
 sum(case when t.program_id=4 then 1 else 0 end)AS PROGRAM_4,
 sum(case when t.program_id=5 then 1 else 0 end)AS PROGRAM_5,
 sum(case when t.program_id=6 then 1 else 0 end)AS PROGRAM_6,
 sum(case when t.program_id=7 then 1 else 0 end)AS PROGRAM_7,
 sum(case when t.program_id=8 then 1 else 0 end)AS PROGRAM_8,
 sum(case when t.program_id=9 then 1 else 0 end)AS PROGRAM_9,
 sum(case when t.program_id=10 then 1 else 0 end)AS PROGRAM_10,
 sum(case when t.program_id=11 then 1 else 0 end)AS PROGRAM_11,
 sum(case when t.program_id=12 then 1 else 0 end)AS PROGRAM_12,
 sum(case when t.program_id=13 then 1 else 0 end)AS PROGRAM_13,
 sum(case when t.program_id=14 then 1 else 0 end)AS PROGRAM_14
from transactions t
join programs p on t.program_id=p.id
        `;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
};
