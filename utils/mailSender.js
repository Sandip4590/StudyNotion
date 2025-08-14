const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    let transporter = await nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "Mail Send By Sandip",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log(" Printing Info ", info);
    return info;
  } catch (e) {
    console.log("Eror fatching While sending a mail");
    console.error(e);
  }
};


module.exports = mailSender ;