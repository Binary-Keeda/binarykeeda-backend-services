import {configDotenv} from 'dotenv'
configDotenv();
import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email_user,
        pass: process.env.email_pass,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

export default transporter;
