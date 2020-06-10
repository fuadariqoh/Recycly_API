const { db } = require("../connections");
const transporter = require("../helpers/mailer");
const { createJWTToken } = require("../helpers/jwt");
const encrypt = require("../helpers/crypto");

module.exports = {
  register: (req, res) => {
    const { username, password, email } = req.body;
    var sql = `select * from users where username='${username}'`;
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length) {
        return res.status(200).send({ status: false });
      }
      sql = `insert into users set ?`;
      var data = {
        username: username,
        password: encrypt(password),
        email: email,
        lastlogin: new Date(),
      };
      db.query(sql, data, (err, result1) => {
        if (err) return res.status(500).send(err);
        const token = createJWTToken({
          id: result1.insertId,
          username: username,
        });
        var LinkVerifikasi = `http://localhost:3000/verified?token=${token}`;
        var mailoptions = {
          from: "Team 5 <team5jc12@gmail.com>",
          to: email,
          subject: "Users Email Verification",
          html: `Please Click this link to verify your account
                    <a href=${LinkVerifikasi}>Click This</a>`,
        };
        transporter.sendMail(mailoptions, (err, result2) => {
          if (err) return res.status(500).send(err);
          sql = `select * from users where id=${result1.insertId}`;
          db.query(sql, (err, result3) => {
            if (err) return res.status(500).send(err);
            return res.status(200).send({ ...result3[0], token, status: true });
          });
        });
      });
    });
  },
  verifieduser: (req, res) => {
    const { id } = req.user;
    var obj = {
      verified: 1,
    };
    var sql = `update users set ? where id=${id}`;
    db.query(sql, obj, (err, result) => {
      if (err) return res.status(500).send(err);
      sql = `select * from users where id=${id}`;
      db.query(sql, (err, result1) => {
        if (err) return res.status(500).send(err);
        return res.status(200).send(result1[0]);
      });
    });
  },
  sendEmailVerified: (req, res) => {
    const { userid, username, email } = req.body;
    const token = createJWTToken({
      id: userid,
      username: username,
      email,
    });
    var LinkVerifikasi = `http://localhost:3000/verified?token=${token}`;
    var mailoptions = {
      from: "Hokage <aldinorahman36@gmail.com>",
      to: email,
      subject: "Misi Level A verified",
      html: `tolong klik link ini untuk verifikasi :
            <a href=${LinkVerifikasi}>MInimales verified</a>`,
    };
    transporter.sendMail(mailoptions, (err, result2) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send({ pesan: true });
    });
  },
};
