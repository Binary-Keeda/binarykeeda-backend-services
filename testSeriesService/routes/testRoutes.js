import { Router } from "express";
import { getParticularTestSubmission } from "../controllers/testControllers.js";


const testRouter = Router();

testRouter.get('/submission', getParticularTestSubmission);

export default  testRouter;