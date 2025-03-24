import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { transporter } from "../config/transporter.js";

export const sendLoginLink = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: "Email already taken" });
    }

    if (!user) {
      user = new User({ email, isVerified: false });
      await user.save();
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });
    const verifyLink = `${process.env.CLIENT_URL}/verify/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Magic Login Link",
      html: `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`,
    });

    res.json({ message: "Verification link sent. Check your email." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isVerified = true;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};


export const completeProfile = async (req, res) => {
  try {
    const { yearOfGraduation,university, program, semester, avatar, _id } = req.body;
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.yearOfGraduation = yearOfGraduation;
    user.program = program;
    user.university = university;
    user.semester = semester;
    user.avatar = avatar;
    user.isVerified = true;

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
