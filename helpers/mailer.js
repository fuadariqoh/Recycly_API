const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "fuadariqoh@gmail.com",
    pass: "dhwyzfatvmkwpsvm",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
