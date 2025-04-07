import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { completeProfile } from "../controllers/auth.js";
configDotenv();
const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.REDIRECT_URL}/login` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.redirect(`${process.env.REDIRECT_URL}/signin?token=${token}`);
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.json({ msg: "Logged Out" })
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


router.post('/complete-profile'  ,completeProfile );
export default router;
