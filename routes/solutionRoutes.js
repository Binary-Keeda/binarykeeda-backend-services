import {Router} from 'express'
import { getUserSubmissions, SubmitQuizController } from '../controllers/solutionController.js';

const solutionRouter = Router();


solutionRouter.get('/timestamp' , () => {});
solutionRouter.post('/ufm' , () => {});
solutionRouter.post('/user/submit/' , SubmitQuizController);
solutionRouter.post('/auto/submit' , () => {});
solutionRouter.get('/get/solutions' , getUserSubmissions);

export default solutionRouter;