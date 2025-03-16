import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();
const router = express.Router();

// Google Sign-In & Sign-Up
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    // Generate JWT Token
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/signin?token=${token}`);
  }
);

// Logout User
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    // res.redirect("http://localhost:5173");
    res.json({msg:"Logged Out"})
  });
});

// Get Logged-In User
router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

export default router;
