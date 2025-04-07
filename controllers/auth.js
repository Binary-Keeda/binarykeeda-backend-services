import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { transporter } from "../config/transporter.js";
import bcrypt from 'bcryptjs';
import { configDotenv } from "dotenv";
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
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Magic Login Link",
      html: `
      <!DOCTYPE html>
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
                text-align: center;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                color: #888;
                padding: 20px 0 10px;
              }
              a.button {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
              }
              a.button:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <!-- Header -->
              <div class="header">
                <img src="https://binarykeeda.com/assets/logo/A37A874D-8E55-4BCC-BDF4-EBFA65B2F790_1_201_a.jpeg" alt="Binary Keeda Logo" />
              </div>

              <!-- Main Content -->
              <div class="content">
                <p>Hey there 👋</p>
                <p>Click the button below to verify your email and complete the signup process:</p>
                <a href="${verifyLink}" class="button">Verify Email</a>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p><a href="${verifyLink}">${verifyLink}</a></p>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Binary Keeda. All rights reserved.</p>
                <p>This is an automated message. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>`,
    });
//
    res.json({ message: "Verification link sent. Check your email." });
  } catch (error) {
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

    await user.save();

    // Manually re-login user to refresh session
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Error logging in user" });

      res.json({data:user, message: "Profile updated successfully" });
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};
