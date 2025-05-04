import { Router } from "express";
import { getParticularTestSubmission, startTest, submitSectionResponse } from "../controllers/testControllers.js";
import { AddProblem, addProblemToSection, addQuestionToSection, AddSection, createTest } from "../controllers/testCreateControllers.js";
import { getAllProblems, getAllTest, getTestById, getUserTests } from "../controllers/testFetchController.js";
import { getUserProblemResponse } from "../controllers/problemController.js";
import { updateTestDetails } from "../controllers/testUpdateControllers.js";



const testRouter = Router();

testRouter.post('/create' , createTest);
testRouter.get('/get' , getAllTest);
testRouter.get('/submission', getParticularTestSubmission);
testRouter.get('/:id' , getTestById);
testRouter.post('/:testId/section/:sectionId/add-question', addQuestionToSection);
testRouter.post('/:testId/sections', AddSection);
//fetch all problems
testRouter.get('/problems/get' ,getAllProblems);
// add a problem
testRouter.post('/problem/add' ,AddProblem);
// add a problem to section
testRouter.post('/section/:testId/:sectionId/add-problem', addProblemToSection);
// get user tests 
testRouter.get('/user/:userId', getUserTests);
// submit a section
testRouter.post('/submit-section/:submissionId' , submitSectionResponse);
// start a test
testRouter.post('/start/:submissionId', startTest);
// get a problem res
testRouter.get('/get/problem/response' ,getUserProblemResponse )

// edit a  test
testRouter.post('/edit/:id' , updateTestDetails);
export default  testRouter;