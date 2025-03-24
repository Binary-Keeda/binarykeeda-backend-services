import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import customRoutes from './routes/custom.js';
import "./config/passport.js"; // Passport Config
import { configDotenv } from "dotenv";
import solutionRouter from "./routes/solutionRoutes.js";
import QuizRouter from "./routes/quizRoutes.js";
import axios from 'axios'
import { corsConfig } from "./config/config.js";
configDotenv();

const app = express();
// Middleware
app.use(cors(corsConfig));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 Day
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api/auth" ,customRoutes);
app.use('/api/v1/solution/', solutionRouter);
app.use('/api/v1/', QuizRouter);

// Start Server
app.get('/university/data/:name/',async (req, res) => {
  try {
    const response = await axios.get('http://universities.hipolabs.com/search',{
      params: {
        name: req.params.name,
        country:"India"
      }
    });
    res.json(response.data);
  } catch (error) {
    console.log(error.message);
    res.json([])
  }
});
app.get('/',(req,res)=>{
  res.send("Server ")
})
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
