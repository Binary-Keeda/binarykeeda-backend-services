import { Router } from "express";
import { getUserQuizBreakdown } from "../controllers/profileDataControllers.js";

const profileRouter  = Router();


profileRouter.get('/quiz-breakdown/:userId' , getUserQuizBreakdown);
profileRouter.get('/' , (req,res) => res.send("Hell"))
export default profileRouter;