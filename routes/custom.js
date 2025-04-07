import express from "express";
import { sendLoginLink, verifyToken } from "../controllers/auth.js";
import passport from "passport";

const router = express.Router();

// in routes/auth.js
router.post("/login", async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: info.message || "Login failed" });
  
      req.login(user, (err) => {

        if (err) return next(err);
        
        // return res.redirect(`${process.env.REDIRECT_URL}`);
        return res.json({ message: "Login successful", user });
      });
    })(req, res, next);
  });
  
router.post("/signup", sendLoginLink);
router.post("/verify", verifyToken);

export default router;
