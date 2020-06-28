const { db } = require("../connections");
const transporter = require("../helpers/mailer");
const { createJWTToken } = require("../helpers/jwt");
const encrypt = require("../helpers/crypto");
const { uploader } = require("./../helpers/uploader");
const fs = require("fs");
var moment = require("moment");
const path = require("path");
var handlebars = require("handlebars");

module.exports = {
  getPaymentMethod: (req, res) => {
    var sql = `   SELECT * 
                    FROM paymentmethod`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send({ status: false });
      return res.status(200).send(result);
    });
  },
  getUserAddress: (req, res) => {
    const { id } = req.params;
    var sql = `   SELECT * 
                    FROM address
                    WHERE user_id=${id} AND is_deleted=0`;
    db.query(sql, (err, result) => {
      if (err)
        res.status(500).send({ status: false, message: "error get address" });
      return res.status(200).send(result);
    });
  },
  joinProgram: (req, res) => {
    const {
      user_id,
      address_id,
      program_id,
      paymentmethod_id,
      total_payment,
    } = req.body;
    var data = {
      user_id,
      address_id,
      program_id,
      paymentmethod_id,
      total_payment,
      status: "waiting_payment",
      expired_time: moment().add(1, "days").format("YYYY-MM-DD HH:mm:ss"),
    };
    var sql = `INSERT INTO transactions SET ?`;
    db.query(sql, data, (err, result) => {
      if (err) res.status(500).send({ err, message: "error add transaction" });
      sql = ` UPDATE programs 
                    SET purchased = purchased + 1
                    WHERE id=${program_id}`;
      db.query(sql, (err1, result1) => {
        if (err1)
          res.status(500).send({ err1, message: "error add purchased" });
        res.status(200).send(result);
      });
    });
  },
  transactionDetail: (req, res) => {
    const { idtrans } = req.query;
    const { id } = req.user;
    var data = {
      status: "cancelled_by_system",
      reject_reason: "payment expired",
    };
    var sql = `   UPDATE transactions SET ?
                    WHERE id=${idtrans} AND status = 'waiting_payment' AND expired_time < CURRENT_TIMESTAMP`;
    db.query(sql, data, (err1, result1) => {
      if (err1) res.status(500).send({ status: false });
      sql = `   SELECT * 
                    FROM transactions
                    WHERE id=${idtrans} AND user_id=${id}`;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send({ status: false });
        if (result.length) {
          return res.status(200).send(result);
        }
        return res.status(200).send({ status: false });
      });
    });
  },
  getSelectedPaymentMethod: (req, res) => {
    const { id } = req.params;
    var sql = `   SELECT * 
                    FROM paymentmethod
                    WHERE id=${id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send({ status: false });
      return res.status(200).send(result);
    });
  },
  uploadPayment: (req, res) => {
    try {
      console.log("masuk try");
      const path = "/payment"; //terserah namanya
      const upload = uploader(path, "PAY").fields([{ name: "image" }]);
      console.log(path);
      upload(req, res, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "upload picture failed !", error: err.message });
        }
        console.log("lewat"); //pada tahap ini foto berhasil di upload
        const { image } = req.files;
        const { id } = JSON.parse(req.body.data);
        const imagePath = image ? path + "/" + image[0].filename : null;
        var sql = `   UPDATE transactions
                            SET payment_image = '${imagePath}',status = 'waiting_verification'
                            WHERE id = ${id}`;
        db.query(sql, (err, result) => {
          if (err) {
            fs.unlinkSync("./public" + imagePath);
            return res.status(500).json({
              message:
                "There is an error on the server. Please contact the administrator.",
              error: err.message,
            });
          }
          return res.status(200).send(result);
        });
      });
    } catch (error) {
      return res.status(500).send({ message: "catch error" });
    }
  },
  getDataWaitForConfirm: (req, res) => {
    const { page } = req.query;
    let sql = `select 
        u.first_name,username,
        a.phonenumber, 
        p.name AS program_name,
        pm.name AS paymentmethod,
        t.id,payment_image
        from transactions t
        join paymentmethod pm on t.paymentmethod_id=pm.id
        join address a on t.address_id=a.id
        join programs p on t.program_id=p.id
        join users u on t.user_id=u.id
        where t.status='waiting_verification'
            LIMIT ${page},6
        `;

    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  getAllTransaction: (req, res) => {
    const { page } = req.query;
    let sql = `select 
      u.first_name,username,
      a.phonenumber, 
      p.name AS program_name,
      pm.name AS paymentmethod,
      t.id,payment_image,status
      from transactions t
      join paymentmethod pm on t.paymentmethod_id=pm.id
      join address a on t.address_id=a.id
      join programs p on t.program_id=p.id
      join users u on t.user_id=u.id
      LIMIT ${page},6
      `;

    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  getTotalConfirmPayment: (req, res) => {
    let sql = `select 
      COUNT(id) AS total_confirm from transactions where status='waiting_verification'
      `;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  getTotalAllTransaction: (req, res) => {
    let sql = `select 
      COUNT(id) AS total_transaction from transactions
      `;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  onAcceptTransaction: (req, res) => {
    const { id } = req.query;
    let sql = `select * from transactions where id=${id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      if (result.length) {
        obj = {
          status: "on_pickup",
        };
        sql = `update transactions set ? where id=${id}`;
        db.query(sql, obj, (err1, result1) => {
          if (err) res.status(500).send(err);
          sql = `select * from transactions where id=${id} AND status='on_pickup'`;
          db.query(sql, (err2, result2) => {
            console.log(result2);
            if (err2) res.status(500).send(err2);
            res.status(200).send(result2);
          });
        });
      }
    });
  },
  onDeclineTransaction: (req, res) => {
    const { id } = req.query;
    const { reject_reason } = req.body;
    let sql = `select * from transactions where id=${id}`;
    db.query(sql, (err, result) => {
      console.log("masuk sini");
      if (err) res.status(500).send(err);
      if (result.length) {
        obj = {
          status: "canceled",
          reject_reason: reject_reason,
        };
        sql = `update transactions set ? where id=${id}`;
        db.query(sql, obj, (err1, result1) => {
          console.log("masuk sini 3");
          if (err1) res.status(500).send(err1);
          sql = `select * from transactions where id=${id}`;
          db.query(sql, (err2, result2) => {
            if (err2) res.status(500).send(err2);
            res.status(200).send(result2);
          });
        });
      }
    });
  },
  getTotalConfirmPickup: (req, res) => {
    let sql = `select count(id) AS total_pickup
     from transactions where status='on_pickup'`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  getConfirmPickUpData: (req, res) => {
    const { page } = req.query;
    console.log("masuk", page);
    let sql = `select 
    u.first_name,username,email,
    a.phonenumber,city,state, 
    p.name AS program_name,
    pm.name AS paymentmethod,
    t.id,payment_image
    from transactions t
    join paymentmethod pm on t.paymentmethod_id=pm.id
    join address a on t.address_id=a.id
    join programs p on t.program_id=p.id
    join users u on t.user_id=u.id
    where t.status='on_pickup'
        LIMIT ${page},6
    `;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  acceptPickUp: (req, res) => {
    const { id } = req.query;
    let sql = `select p.point,
                      u.points,email,
                      t.user_id,total_payment,
                      pm.name
                      from transactions t
                       join programs p on t.program_id=p.id
                      join users u on t.user_id=u.id
                      join paymentmethod pm on t.paymentmethod_id=pm.id
                     where t.id=${id}`;
    db.query(sql, (err, result) => {
      console.log(result[0]);
      if (err) res.status(500).send(err);
      if (result.length) {
        obj = {
          status: "completed",
        };
        sql = `update transactions set ? where id=${id}`;
        db.query(sql, obj, (err1, result1) => {
          if (err1) res.status(500).send(err1);
          obj = {
            points: result[0].points + result[0].point,
          };
          sql = `update users set ? where id=${result[0].user_id}`;
          db.query(sql, obj, (err2, result2) => {
            if (err2) res.status(500).send(err2);
            var readHTMLFile = function (path, callback) {
              fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
                if (err) {
                  throw err;
                  callback(err);
                } else {
                  callback(null, html);
                }
              });
            };

            readHTMLFile(__dirname + "/.././assets/Invoice.html", function (
              err,
              html
            ) {
              var template = handlebars.compile(html);
              var replacements = {
                total_payment: result[0].total_payment,
                name: result[0].name,
                point: result[0].point,
              };
              var htmlToSend = template(replacements);
              var mailOptions = {
                from: "Recycly - Do Not Reply <team5jc12@gmail.com>",
                to: result[0].email,
                subject: "Invoice",
                html: htmlToSend,
                attachments: [
                  {
                    filename: "logo.png",
                    path: "./assets/images/logo.png",
                    cid: "logo", //same cid value as in the html img src
                  },
                ],
              };
              transporter.sendMail(mailOptions, function (error, response) {
                if (error) {
                  console.log({ error, message: "error send email" });
                  // callback(error);
                }
              });
              return res.status(200).send({ status: true });
            });
          });
        });
      }
    });
  },
  declinePickup: (req, res) => {
    const { id, reject_reason, email } = req.query;
    let sql = `select * from transactions
              where id=${id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      if (result.length) {
        obj = {
          status: "failed",
          reject_reason: reject_reason,
        };
        sql = `update transactions set ? where id=${id}`;
        db.query(sql, obj, (err1, result1) => {
          if (err1) res.status(500).send(err1);
          var readHTMLFile = function (path, callback) {
            fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
              if (err) {
                throw err;
                callback(err);
              } else {
                callback(null, html);
              }
            });
          };

          readHTMLFile(
            __dirname + "/.././assets/TransactionFailed.html",
            function (err, html) {
              var template = handlebars.compile(html);
              var replacements = {};
              var htmlToSend = template(replacements);
              var mailOptions = {
                from: "Recycly - Do Not Reply <team5jc12@gmail.com>",
                to: email,
                subject: "Transaction Failed",
                html: htmlToSend,
                attachments: [
                  {
                    filename: "logo.png",
                    path: "./assets/images/logo.png",
                    cid: "logo", //same cid value as in the html img src
                  },
                ],
              };
              transporter.sendMail(mailOptions, function (error, response) {
                if (error) {
                  console.log({ error, message: "error send email" });
                  // callback(error);
                }
              });
              return res.status(200).send({ status: true });
            }
          );
        });
      }
    });
  },
  totalTransactionHistory: (req, res) => {
    const { id } = req.params;
    let sql = `select count(id) from transactions where user_id=${id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send(err);
      res.status(200).send(result);
    });
  },
  getDataTotalTransactionHistory: (req, res) => {
    const { id } = req.params;
    const { filter, sort, page } = req.query;
    console.log(filter, sort, page);

    if (sort && filter) {
      let sql = `select *,t.id AS id_transaksi from transactions t
      join address a on t.address_id=a.id
      join programs p on t.program_id=p.id
      join users u on t.user_id=u.id
                where u.id=${id} AND t.status='${filter}'
                ORDER BY t.${sort}
                LIMIT ${page},6       
      `;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else if (sort) {
      let sql = `select *,t.id AS id_transaksi from transactions t
      join address a on t.address_id=a.id
      join programs p on t.program_id=p.id
      join users u on t.user_id=u.id
                where u.id=${id} 
                ORDER BY t.${sort}
                LIMIT ${page},6       
      `;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else if (filter) {
      console.log("masuk filter");
      let sql = `select *,t.id AS id_transaksi from transactions t
      join address a on t.address_id=a.id
      join programs p on t.program_id=p.id
      join users u on t.user_id=u.id
                where u.id=${id} AND t.status='${filter}'
                LIMIT ${page},6       
      `;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else {
      let sql = `select *,t.id AS id_transaksi from transactions t
      join address a on t.address_id=a.id
      join programs p on t.program_id=p.id
      join users u on t.user_id=u.id
                where u.id=${id} 
                LIMIT ${page},6       
      `;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    }
  },
  getTransactionReport: (req, res) => {
    const { filter } = req.query;

    if (filter) {
      let sql = `
      select 
  sum(case when t.program_id=4 then 1 else 0 end)AS PROGRAM_4,
  sum(case when t.program_id=5 then 1 else 0 end)AS PROGRAM_5,
  sum(case when t.program_id=6 then 1 else 0 end)AS PROGRAM_6,
  sum(case when t.program_id=7 then 1 else 0 end)AS PROGRAM_7,
  sum(case when t.program_id=8 then 1 else 0 end)AS PROGRAM_8,
  sum(case when t.program_id=9 then 1 else 0 end)AS PROGRAM_9,
  sum(case when t.program_id=10 then 1 else 0 end)AS PROGRAM_10,
  sum(case when t.program_id=11 then 1 else 0 end)AS PROGRAM_11,
  sum(case when t.program_id=12 then 1 else 0 end)AS PROGRAM_12
  from transactions t
  join programs p on t.program_id=p.id
  where t.status='${filter}'
      `;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    } else {
      let sql = `
      select 
  sum(case when t.program_id=4 then 1 else 0 end)AS PROGRAM_4,
  sum(case when t.program_id=5 then 1 else 0 end)AS PROGRAM_5,
  sum(case when t.program_id=6 then 1 else 0 end)AS PROGRAM_6,
  sum(case when t.program_id=7 then 1 else 0 end)AS PROGRAM_7,
  sum(case when t.program_id=8 then 1 else 0 end)AS PROGRAM_8,
  sum(case when t.program_id=9 then 1 else 0 end)AS PROGRAM_9,
  sum(case when t.program_id=10 then 1 else 0 end)AS PROGRAM_10,
  sum(case when t.program_id=11 then 1 else 0 end)AS PROGRAM_11,
  sum(case when t.program_id=12 then 1 else 0 end)AS PROGRAM_12
  from transactions t
  join programs p on t.program_id=p.id
  where t.status='completed'
      `;
      db.query(sql, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send(result);
      });
    }
  },
};
