const { db } = require("../connections");
const transporter = require("../helpers/mailer");
const { createJWTToken } = require("../helpers/jwt");
const encrypt = require("../helpers/crypto");

module.exports = {
  getReward: (req, res) => {
    var sql = `select * from reward`;
    db.query(sql, (error, result) => {
      if (error) res.status(500).send(error);
      res.status(200).send(result);
    });
  },
  buyReward: (req, res) => {
    let {
      rewardId,
      userId,
      status,
      categoryid,
      decreasedPoints,
      qty,
    } = req.body;
    console.log(rewardId, userId, status);
    let sql = `select * from transactionReward where userId=${userId} AND status='${status}' AND rewardId=${rewardId}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      if (result.length) {
        obj = {
          qty: result[0].qty + qty,
        };
        sql = `update transactionReward SET ? where userId=${userId} AND status='${status}' AND rewardId=${rewardId}`;
        db.query(sql, obj, (err1, result1) => {
          if (err1) res.status(500).send(err1);
          res.status(200).send(result1);
        });
      } else {
        console.log("masuk sini rewards");
        sql = `insert into transactionReward SET ?`;
        db.query(sql, req.body, (err2, result2) => {
          if (err2) res.status(500).send(err2);
          res.status(200).send(result2);
        });
      }
    });
  },
  getRewardUser: (req, res) => {
    const { categoryid, id } = req.query;
    if (categoryid == 1) {
      let sql = `select * from reward where categoryid=${1}`;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else if (categoryid == 2) {
      let sql = `select * from reward where categoryid=${2}`;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else if (categoryid == 3) {
      let sql = `select * from reward where categoryid=${3}`;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else {
      let sql = `select * from reward where categoryid=${4}`;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    }
  },
  // SEMENTARA TIDAK DIPAKAI
  getTotalReward: (req, res) => {
    const { categoryid } = req.query;
    if (categoryid == 1) {
      let sql = `select count(id) AS total from reward where categoryid=1`;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else if (categoryid == 2) {
      let sql = `select count(id) AS total from reward where categoryid=2`;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else if (categoryid == 3) {
      let sql = `select count(id) AS total from reward where categoryid=3`;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else {
      let sql = `select count(id) AS total from reward where categoryid=4`;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    }
  },
  getRewardDetail: (req, res) => {
    const { id } = req.query;
    console.log(id, "masuk req reward detail");
    let sql = `select * from reward where id=${id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  getOtherGift: (req, res) => {
    const { id } = req.query;
    console.log(id, "masuk get other gift");
    let sql = `select categoryid from reward where id=${id}`;
    db.query(sql, (err, result1) => {
      console.log(result1[0].categoryid);
      if (err) res.status(500).send(err);
      sql = `select * from reward where categoryid=${result1[0].categoryid} AND NOT id=${id} LIMIT 4`;
      db.query(sql, (err1, result2) => {
        if (err1) res.status(500).send(err1);
        res.status(200).send(result2);
      });
    });
  },
  getCartData: (req, res) => {
    const { id } = req.query;
    let sql = `select tr.*,r.title,r.priceDescription 
    from transactionReward tr
    join reward r on tr.rewardId=r.id 
    where userId=${id} AND status="oncart" and is_deleted=0`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  deleteFromCart: (req, res) => {
    const { id } = req.query;
    let sql = `select * from transactionReward where id=${id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      if (result.length) {
        let obj = {
          is_deleted: 1,
          status: "deleted",
        };
        sql = `update transactionReward set ? where id=${id}`;
        db.query(sql, obj, (err1, result1) => {
          if (err1) res.status(500).send(err1);
          res.status(200).send({ message: "delete success" });
        });
      }
    });
  },
  checkOutReward: (req, res) => {
    const { userId, totalPoints } = req.query;
    let sql = `select * from transactionReward where userId=${userId} AND status='oncart' AND is_deleted=0`;
    db.query(sql, (err, result) => {
      console.log(result);
      if (err) res.status(500).send(err);
      if (result.length) {
        obj = {
          status: "completed",
        };
        let sql = `update transactionReward set ? where userId=${userId} AND status='oncart' AND is_deleted=0`;
        db.query(sql, obj, (err1, result1) => {
          if (err1) res.status(500).send(err1);
          sql = `select points,email from users where id=${userId}`;
          db.query(sql, (err2, result2) => {
            if (err2) res.status(500).send(err2);
            obj = {
              points: result2[0].points - totalPoints,
            };
            sql = `update users set ? where id=${userId}`;
            db.query(sql, obj, (err3, result3) => {
              if (err3) res.status(500).send(err3);
              var mailoptions = {
                from: "Team 5 <team5jc12@gmail.com>",
                to: result2[0].email,
                subject: "Thanks for redeem your reward",
                html: `Thanks for redeem you reward:)

                “The roots of all goodness lie in the soil of appreciation for goodness.” – Dalai Lama
                `,
              };
              transporter.sendMail(mailoptions, (err4, result4) => {
                if (err4) res.status(500).send(err4);
                res.status(200).send({ message: "Email send to users" });
              });
            });
          });
        });
      }
    });
  },
  getTotalRewardTransaction: (req, res) => {
    let sql = `
    select count(id) AS total_reward from transactionReward where is_deleted=0 and status='completed'
    `;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  getAllDataTransactionReward: (req, res) => {
    const { page } = req.query;
    let sql = `select 
              *
              from transactionReward tr 
              join users u on tr.userId=u.id
              join rewardcategory rc on tr.categoryid=rc.id
              join reward r on tr.rewardId=r.id
              where status='completed'
              LIMIT ${page},5
              
    `;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  getRewardReport: (req, res) => {
    let sql = `
    select  
          sum(case when transactionReward.categoryid=1 then 1 else 0 end)AS REWARD1,
          sum(case when transactionReward.categoryid=2 then 1 else 0 end)AS REWARD2,
          sum(case when transactionReward.categoryid=3 then 1 else 0 end)AS REWARD3,
          sum(case when transactionReward.categoryid=4 then 1 else 0 end)AS REWARD4
          from transactionReward 
          where transactionReward.status='completed'
    `;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
};
