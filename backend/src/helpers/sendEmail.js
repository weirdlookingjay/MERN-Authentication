import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import hbs from "nodemailer-express-handlebars";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (
  send_from,
  send_to,
  subject,
  reply_to,
  template,
  name,
  link
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.RESEND_USER,
      pass: process.env.RESEND_PASSKEY,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  const handleBarsOptions = {
    viewEngine: {
      extName: ".hbs",
      partialsDir: path.join(__dirname, "../views"),
      defaultLayout: false,
    },
    viewPath: path.join(__dirname, "../views"),
    extName: ".hbs",
  };

  transporter.use("compile", hbs(handleBarsOptions));

  const mailOptions = {
    from: send_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    template: template,
    context: {
      name: name,
      link: link,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.log("Error sending email", error.message);
    throw new Error("Error sending email");
  }
};
export default sendEmail;
