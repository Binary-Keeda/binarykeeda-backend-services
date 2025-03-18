import { configDotenv } from "dotenv";
configDotenv();
export const USER_JWT_SECRET = "FDSHHSDJDS";
export const ADMIN_JWT_SECRET = "shgdsjdsjds";
import mongoose from "mongoose";

export const CALLBACK = ""
export const corsConfig = {
    origin: ['https://binarykeeda.com' ,'https://www.binarykeeda.com' , 'http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
export const db = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.MONGODB_URI, {})
            .then(() => {
                console.log("Connected to MongoDB");
                resolve();
            })
            .catch((err) => {
                console.log("Error connecting to MongoDB");
                reject(err);
            });
    })
}

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };