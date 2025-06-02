import { configDotenv } from 'dotenv';
configDotenv();
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });

export default transporter;
