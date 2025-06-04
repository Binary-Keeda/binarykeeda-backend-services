import User from "../models/User.js";
import jwt from "jsonwebtoken";
import transporter  from "../config/transporter.js";
import bcrypt from 'bcryptjs';
import { configDotenv } from "dotenv";
import Rank from "../services/userServices/models/Rank.js";
import mongoose from "mongoose";
configDotenv();

export const sendLoginLink = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });
    // console.log(user)
    if (user) {
      return res.status(400).json({ message: "Email already taken" });
    }

    // Generate token valid for 10 mins
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10d" });
    const verifyLink = `${process.env.REDIRECT_URL}/verify/${encodeURIComponent(token)}`;

//
await transporter.sendMail({
      from: `"Binary Keeda" <${process.env.email}>`,
      to: email,
      subject: "Your sign up Link",
      html:`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        padding: 20px 0;
      }
      .header img {
        max-width: 150px;
        height: auto;
      }
      .content {
        font-size: 16px;
        color: #333;
        line-height: 1.6;
        text-align: left;
      }
      .button-container {
        text-align: left;
      }
      .footer {
        text-align: left;
        font-size: 13px;
        color: #666;
        padding: 20px 0 10px;
        border-top: 1px solid #e0e0e0;
      }
      .contact-info {
        margin-top: 10px;
        line-height: 1.5;
      }
      a.button {
        display: inline-block;
        padding: 10px 20px;
        width: calc(100% - 40px);
        text-align: center;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      }
      a.button:hover {
        background-color: #0056b3;
      }
      a {
        color: #007bff;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <img src="https://res.cloudinary.com/drzyrq7d5/image/upload/v1744699895/binarykeeda/zipjouvv161c11xywrwk.jpg" alt="Binary Keeda Logo" />
      </div>

      <!-- Main Content -->
      <div class="content">
        <p>Dear User,</p>
        <p>Thank you for registering with <strong>Binary Keeda</strong>. To complete your sign-up process and activate your account, please verify your email address by clicking the button below:</p>

        <div class="button-container">
          <a href="${verifyLink}" class="button">Verify Email</a>
        </div>

        <p>If the above button does not work, kindly copy and paste the following link into your web browser:</p>
        <p><a href="${verifyLink}">${verifyLink}</a></p>

        <p>If you did not request this email, please disregard it. Your account will remain inactive until verified.</p>

        <p>Best regards,<br/>Team Binary Keeda</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Binary Keeda. All rights reserved.</p>
        <p>This is an automated email. Please do not reply to this message.</p>
        <div class="contact-info">
          <p><strong>Contact Us</strong></p>
          <p>📞 +91 74979 18739</p>
          <p>✉️ support@binarykeeda.com</p>
        </div>
      </div>
    </div>
  </body>
</html>
`
    });
//
    res.json({ message: "Verification link sent. Check your email." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    // console.log(token)
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      user = await User.create({ email: decoded.email,password:password });
    }

    await user.save();

    return res.status(200).json({ message: "Please try to login now" });
    // return res.redirect("https://google.com");


  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please request a new one.' });
    }
    console.log(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};


export const completeProfile = async (req, res) => {
  try {
    const { yearOfGraduation,university, program, semester, avatar, _id , specialisation } = req.body;
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.yearOfGraduation = yearOfGraduation;
    user.program = program;
    user.university = university;
    user.semester = semester;
    user.avatar = avatar;
    user.isVerified = true;
    user.specialisation = specialisation;
    const newRank = new Rank({
      userId: new mongoose.Types.ObjectId(_id),
      points:0,
    })
    
    await newRank.save()
    await user.save();

    // Manually re-login user to refresh session
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Error logging in user" });

      res.json({data:user, message: "Profile updated successfully" });
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "An error occurred" });
  }
};
