import nodemailer from "nodemailer";
// import { promisify } from "util";
// import * as fs from "fs";

// const readFileAsync = promisify(fs.readFile);

export const sendMail = async (
  from: string,
  to: string,
  subject: string,
  html: string
) => {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // Read the HTML template and image file
  // const htmlTemplate = await readFileAsync(html, "utf-8");
  // const imageAttachment = await readFileAsync("../assets/logo-example.png");

  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: html,
    // attachments: [
    //   {
    //     filename: "logo-example.png",
    //     content: "../assets/logo-example.png",
    //     encoding: "base64",
    //     cid: "uniqueImageCID", // Referenced in the HTML template
    //   },
    // ],
  };

  console.info(`Sending mail to - ${to}`);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("There was an error sending the email: ", error);
    } else {
      console.info("Email sent: ", info.response);
    }
  });
};
