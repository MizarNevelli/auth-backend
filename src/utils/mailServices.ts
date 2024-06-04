import nodemailer, { SentMessageInfo } from "nodemailer";

export const sendMail = async (
  from: string,
  to: string,
  subject: string,
  html: string,
  cllBck: (error: Error | null, info: SentMessageInfo) => void
) => {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: html,
  };

  console.info(`Sending mail to - ${to}`);

  transporter.sendMail(mailOptions, cllBck);
};
