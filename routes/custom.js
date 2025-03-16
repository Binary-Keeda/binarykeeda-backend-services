import express from "express";
import { sendLoginLink, verifyToken } from "../controllers/auth.js";

const router = express.Router();

router.post("/signup", sendLoginLink);
router.get("/verify/:token", verifyToken);

export default router;
