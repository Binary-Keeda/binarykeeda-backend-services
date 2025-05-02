import { Router } from "express";
import { getParticularTestSubmission } from "../controllers/testControllers.js";
import { addQuestionToSection, AddSection, createTest } from "../controllers/testCreateControllers.js";
import { getAllTest, getTestById } from "../controllers/testFetchController.js";



const testRouter = Router();

testRouter.post('/create' , createTest);
testRouter.get('/get' , getAllTest);
testRouter.get('/submission', getParticularTestSubmission);
testRouter.get('/:id' , getTestById);

// add a question to section
testRouter.post('/:testId/section/:sectionId/add-question', addQuestionToSection);
// add a section
testRouter.post('/:testId/sections', AddSection);
export default  testRouter;