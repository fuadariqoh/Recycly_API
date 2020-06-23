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
    console.log(req.body);
    let sql = ` insert into transactionReward SET ?`;
    db.query(sql, req.body, (err, result) => {
      if (err) res.status(500).send(err);
      sql = `select points from users where id=${req.body.userId}`;
      db.query(sql, (err1, result1) => {
        if (err) res.status(500).send(err1);
        console.log(result1[0].points);
        var obj = {
          points: result1[0].points - req.body.decreasedPoints,
        };
        sql = `update users set ? where id=${req.body.userId}`;
        db.query(sql, obj, (err2, result2) => {
          if (err2) res.status(500).send(err2);
          sql = `select points from users where id=${req.body.userId}`;
          db.query(sql, (err3, result3) => {
            if (err3) res.status(500).send(err3);
            res.status(200).send(result3);
          });
        });
      });
    });
  },
  getRewardUser: (req, res) => {
    const { categoryid } = req.query;
    console.log(categoryid);
    if (categoryid == 1) {
      console.log("masuk category1");
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

    // if (search) {
    //   var sql = `  SELECT * from reward
    //                 WHERE title LIKE '%${search}%'
    //                 LIMIT ${page},6`;
    //   db.query(sql, (err, result) => {
    //     if (err)
    //       res.status(500).send({ err, message: "error get program reward" });
    //     return res.send(result);
    //   });
    // } else if (search && sort) {
    //   var sql = `  SELECT * from reward
    //                 WHERE title LIKE '%${search}%'
    //                 ORDER BY ${sort}
    //                 LIMIT ${page},6`;
    //   db.query(sql, (err, result) => {
    //     if (err)
    //       res.status(500).send({ err, message: "error get program reward" });
    //     return res.send(result);
    //   });
    // } else if (sort) {
    //   let sql = ` SELECT * from reward
    //             ORDER BY ${sort}
    //             LIMIT ${page},6

    //   `;
    //   db.query(sql, (err, result) => {
    //     if (err)
    //       res.status(500).send({ err, message: "error get program reward" });
    //     return res.send(result);
    //   });
    // } else {
    //   var sql = `  SELECT * from reward
    //                 LIMIT ${page},6`;
    //   db.query(sql, (err, result) => {
    //     if (err)
    //       res.status(500).send({ err, message: "error get total reward" });
    //     return res.send(result);
    //   });
    // }
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
  // SEMENTARA TIDAK DIPAKAI

  //   if (search) {
  //     console.log("masuk search");
  //     var sql = `  SELECT COUNT(id) AS total
  //                     FROM reward
  //                     WHERE title LIKE '%${search}%' `;
  //     db.query(sql, (err, result) => {
  //       if (err)
  //         res.status(500).send({ err, message: "error get total program" });
  //       console.log(result);
  //       console.log(search);
  //       return res.send(result[0]);
  //     });
  //   } else {
  //     console.log("masuk else");
  //     var sql = `  SELECT COUNT(id) AS total
  //                     FROM reward `;
  //     db.query(sql, (err, result) => {
  //       if (err)
  //         res.status(500).send({ err, message: "error get total program" });
  //       return res.send(result[0]);
  //     });
  //   }
  // },
};
