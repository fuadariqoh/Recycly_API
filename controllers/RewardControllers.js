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
  getRewardSpec:(req,res) => {
    var sql = `SELECT r.id,r.title,r.description,r.priceDescription,r.image,r.p1,r.p2,r.categoryid,rc.categoryname FROM finalproject.reward r LEFT JOIN finalproject.rewardcategory rc ON r.categoryid=rc.id`
    db.query(sql, (error, result) => {
      if (error) res.status(500).send(error);
      res.status(200).send(result);
    });
  },
  getRewardRedeemed:(req,res) => {
    var sql = `SELECT sum(decreasedPoints) AS reedemedPoints FROM finalproject.transactionReward where userId=${req.params.id} and status='completed'`
    db.query(sql, (error, result) => {
      if (error) res.status(500).send(error);
      res.status(200).send(result);
    });
  },


  buyReward: (req, res) => {
    let sql = ` insert into transactionReward SET ?  `;
    db.query(sql, req.body, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(req.body);
    });
  },
  getTransactionReward: (req, res) => {
    let sql = `select tr.*,u.username as username,r.title from transactionReward tr
     join  users u on tr.userId=u.id 
    join reward r on tr.rewardId=r.id where tr.status='waiting_send'`;
    db.query(sql, (error, result) => {
      if (error) res.status(500).send(error);
      res.status(200).send(result);
    });
  },
  acceptTransactionReward: (req, res) => {
    let { id } = req.params;
    let { nomor_resi } = req.body;
    let sql = `select * from transactionReward where id=${id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      if (result) {
        sql = `update transactionReward set ? where id=${id}`;
        obj = {
          status: "on_courier",
          nomor_resi: nomor_resi,
        };
        db.query(sql, obj, (err2, result2) => {
          if (err2) res.status(500).send(err2);
          res.status(200).send(result2);
        });
      }
    });
  },
  //my-impact reward list
  getRewardCompletedbyUser:(req,res)=>{
    sql = `SELECT p.name,p.point,p.purchased FROM finalproject.transactions t 
    LEFT JOIN finalproject.programs p 
    ON t.program_id=p.id 
    WHERE status='completed' 
    AND user_id=${req.params.id}`
    db.query(sql,(err,result)=>{
      if(err) res.status(500).send({status:false})
      return res.status(200).send(result)
  })
}
};
