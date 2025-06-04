import { Router } from "express";
import { getUserQuizBreakdown, getUserRanks } from "../controllers/profileDataControllers.js";

const profileRouter  = Router();


profileRouter.get('/quiz-breakdown/:userId' , getUserQuizBreakdown);
profileRouter.get('/rank' , getUserRanks);
profileRouter.get('/' , (req,res) => res.send("Hell"))
export default profileRouter;