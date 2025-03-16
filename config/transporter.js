import nodemailer from "nodemailer";
import { configDotenv } from 'dotenv'
configDotenv();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.email, 
        pass: process.env.pass, 
    },
});

export { transporter };
