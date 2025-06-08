import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import customRoutes from './routes/custom.js';
import "./config/passport.js"; 
import { configDotenv } from "dotenv";
import solutionRouter from "./routes/solutionRoutes.js";
import QuizRouter from "./routes/quizRoutes.js";
import axios from 'axios'
import { corsConfig } from "./config/config.js";
import testRouter from "./services/testSeriesService/routes/testRoutes.js";
import reviewRouter from "./services/testSeriesService/routes/CodeReview.js";
import morgan from "morgan";
import profileRouter from "./services/userServices/routes/profileRoutes.js";
import nodemailer from 'nodemailer'
import { TestResponse } from "./services/testSeriesService/models/TestResponse.js";
configDotenv();

const app = express();
// Middleware
app.use(cors(corsConfig));
app.use(express.json());
app.use(morgan('dev'))
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

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



// Test service routes
app.use('/api/v2/test', (req,res,next) => {
  if(req.isAuthenticated()) next();
  else return res.status(401).json({msg :"Unauthorised request"})
}  , testRouter);
app.use('/api/v3/review',reviewRouter);


// University name fetech route
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


// user profile data fetch routes
app.use('/user/profile/' , profileRouter);


// end point for api.binarykeeda.com
app.get('/', (req, res) => {
  res.redirect('https://binarykeeda.com');
});


app.post('/submit/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await TestResponse.findByIdAndUpdate(
      id,
      { isSubmitted: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Test response not found' });
    }

    res.json({ message: 'Test submitted successfully', data: updated });
  } catch (error) {
    console.error('Error updating isSubmitted:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

