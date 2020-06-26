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
      return res.status(200).send({ status: true });
    });
  },

  login: (req, res) => {
    const { username, password } = req.query;
    var sql = ` SELECT * FROM users 
              WHERE username='${username}'`;
    // console.log('masuklogin')
    db.query(sql, (err, result) => {
      if (err)
        return res.status(500).send({ err, message: "error get username" });
      if (result.length) {
        //untuk ambil data cart
        sql = `SELECT * FROM users 
                  WHERE username='${username}' AND password='${encrypt(
          password
        )}'`;
        db.query(sql, (err1, result1) => {
          if (err1)
            return res.status(500).send({ err1, message: "error get user" });
          if (result1.length) {
            const token = createJWTToken({
              id: result1[0].id,
              username: result1[0].username,
            });

            res.status(200).send({ ...result1[0], status: true, token: token});
          } else {
            return res
              .status(200)
              .send({ status: false, incorrectPassword: true });
          }
        });
      } else {
        return res.status(200).send({ status: false, incorrectUsername: true });
      }
    });
  },

  sendEmailPassword: (req, res) => {
    const { email } = req.body;
    var sql = ` SELECT * FROM users 
              WHERE email='${email}'`;
    db.query(sql, (err, result) => {
      if (err)
        return res.status(500).send({ err, message: "error get username" });
      if (result.length) {
        //untuk cari emailnya
        const token = createJWTToken({
          userid: result[0].id,
          username: result[0].username,
          email,
        });
        var LinkPassword = `http://localhost:3000/resetpassword?token=${token}`;
        var mailoptions = {
          from: "Team 5 <team5jc12@gmail.com>",
          to: email,
          subject: "RECYC.LY Reset Password",
          html: `Please click this link below to change your password :
                <a href=${LinkPassword}>Change Password</a>`,
        };
        transporter.sendMail(mailoptions, (err, result2) => {
          if (err) return res.status(500).send(err);
          return res.status(200).send({ status: true });
        });
      } else {
        return res.status(200).send({ status: false, incorrectEmail: true });
      }
    });
  },

  ResetPassword: (req, res) => {
    const { password } = req.query;
    const { userid } = req.user;
    // console.log(password)
    // console.log(req.user)
    var obj = {
      password: encrypt(password),
      update_time: new Date(),
    };
    var sql = ` UPDATE users SET ? 
              WHERE id=${userid}`;
    db.query(sql, obj, (err, result) => {
      if (err)
        return res.status(500).send({ err, message: "error update password" });
      sql = ` SELECT * FROM users 
              WHERE id=${userid}`;
      db.query(sql, (err1, result1) => {
        if (err1) return res.status(500).send(err1);
        return res.status(200).send(result1[0]);
      });
    });
  },
  getUser: (req, res) => {
    let sql = `select id,username from users where is_deleted=0`;
    db.query(sql, (error, result) => {
      if (error) res.status(500).send(error);
      res.status(200).send(result);
    });
  },
  getAddress:(req,res)=>{
    let sql= `SELECT u.first_name,u.last_name,a.address,a.city,a.state,a.zipcode,a.phonenumber FROM finalproject.address a LEFT JOIN finalproject.users u ON a.user_id=u.id where a.user_id=${req.params.id};`
    db.query(sql, (error, result) => {
      if (error) res.status(500).send(error);
      res.status(200).send(result);
    });
  },
  banUser: (req, res) => {
    let { id } = req.params;
    let sql = `select * from users where id=${id}`;
    db.query(sql, (error, result) => {
      console.log(result);
      if (error) res.status(500).send(error);
      if (result.length) {
        console.log("masuk length");
        sql = `update users set ? where id=${id}`;
        let obj = {
          is_deleted: 1,
        };
        db.query(sql, obj, (error1, result1) => {
          if (error1) res.status(500).send(error1);
          res.status(200).send(result1);
        });
      }
    });
  },
  proofimage: (req, res) => {
    console.log("ini req body", req.files);
  },
  keepLogin: (req, res) => {
    // console.log(req.user)
    var sql = `select * from users where id=${req.user.id}`;
    db.query(sql, (err, result) => {
      if (err) return res.status(500).send(err);
      const token = createJWTToken({
        id: result[0].id,
        username: result[0].username,
      });
      res.status(200).send({ ...result[0], token: token });
    });
  },
};
