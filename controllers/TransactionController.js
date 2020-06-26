const { db } = require("../connections");
const transporter = require("../helpers/mailer");
const { createJWTToken } = require("../helpers/jwt");
const encrypt = require("../helpers/crypto");
const { uploader } = require("./../helpers/uploader");
const fs = require("fs");

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
    const { id } = req.params;
    var sql = `   SELECT * 
                    FROM transactions
                    WHERE id=${id}`;
    db.query(sql, (err, result) => {
      if (err) res.status(500).send({ status: false });
      return res.status(200).send(result);
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
            LIMIT ${page},5
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
      LIMIT ${page},5
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
};
// p.name AS program_name,u.username,pm.name AS paymentmethod
