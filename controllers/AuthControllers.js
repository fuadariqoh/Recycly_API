const { db } = require("../connections");
const transporter = require("../helpers/mailer");
const { createJWTToken } = require("../helpers/jwt");
const encrypt = require("../helpers/crypto");

module.exports = {
  register: (req, res) => {
    const {
      firstname,
      lastname,
      username,
      address,
      city,
      state,
      zipcode,
      phonenumber,
      email,
      password,
    } = req.body;
    // GET DUPLICATE USERNAME
    var sql = `SELECT * FROM users
               WHERE username='${username}'`;
    db.query(sql, (err, result) => {
      if (err)
        return res
          .status(500)
          .send({ err, message: "error get duplicate username" });
      if (result.length) {
        return res.status(200).send({ status: false, dupUsername: true });
      }
      // GET DUPLICATE EMAIL
      sql = ` SELECT * FROM users
              WHERE email='${email}'`;
      db.query(sql, (err6, result6) => {
        if (err6)
          return res
            .status(500)
            .send({ err, message: "error get duplicate username" });
        if (result6.length) {
          return res.status(200).send({ status: false, dupEmail: true });
        }
        // INSERT NEW USER
        sql = ` INSERT INTO users 
                SET ?`;
        var data = {
          first_name: firstname,
          last_name: lastname,
          username: username,
          email: email,
          password: encrypt(password),
          last_login: new Date(),
        };
        db.query(sql, data, (err1, result1) => {
          if (err1)
            return res
              .status(500)
              .send({ err1, message: "error insert into users" });
          // INSERT NEW USER ADDRESS
          sql = ` INSERT INTO address
                  SET ?`;
          var data = {
            user_id: result1.insertId,
            address,
            city,
            state,
            zipcode,
            phonenumber,
          };
          db.query(sql, data, (err2, result2) => {
            if (err2) {
              //DELETE CREATED USER IF INSERT ADDRESS ERROR
              sql = ` DELETE FROM users
                      WHERE id=${result1.insertId}`;
              db.query(sql, (err5, result5) => {
                if (err5)
                  return res
                    .status(500)
                    .send({ err5, message: "error delete created users" });
                return res
                  .status(500)
                  .send({ err2, message: "error insert address" });
              });
            }
            // CREATE TOKEN
            const token = createJWTToken({
              id: result1.insertId,
              username: username,
            });
            var LinkVerifikasi = `http://localhost:3000/verified?token=${token}`;
            // SEND EMAIL VERIFICATION
            var mailoptions = {
              from: "Team 5 <team5jc12@gmail.com>",
              to: email,
              subject: "Users Email Verification",
              html: `Please Click this link to verify your account
                        <a href=${LinkVerifikasi}>Click This</a>`,
            };
            transporter.sendMail(mailoptions, (err3, result3) => {
              if (err3)
                return res
                  .status(500)
                  .send({ err3, message: "error send email" });
              // SEND NEW USER DATA
              sql = ` SELECT * FROM users 
                      WHERE id=${result1.insertId}`;
              db.query(sql, (err4, result4) => {
                if (err4)
                  return res
                    .status(500)
                    .send({ err4, message: "error get new user data" });
                return res
                  .status(200)
                  .send({ ...result4[0], token, status: true });
              });
            });
          });
        });
      });
    });
  },
  verifieduser: (req, res) => {
    const { id } = req.user;
    var obj = {
      is_verified: 1,
      last_login: new Date(),
      update_time: new Date(),
    };
    var sql = ` UPDATE users SET ? 
                WHERE id=${id}`;
    db.query(sql, obj, (err, result) => {
      if (err) return res.status(500).send(err);
      sql = ` SELECT * FROM users 
              WHERE id=${id}`;
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
      from: "Team 5 <team5jc12@gmail.com>",
      to: email,
      subject: "[Re-send]Users Email Verification",
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
            res.status(200).send({ ...result1[0], status: true, token: token });
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
};
