import { Router } from 'express'
import { addQuestion, addQuestions, addQuiz, delQuestion, delQuiz, editQuiz, getParticularQuiz, getParticularSolution, getQuiz, getUserQuiz } from '../controllers/quizControllers.js';
import { generateQuiz } from '../controllers/quizGenerate.js';
import upload from '../middleware/upload.js';

const QuizRouter = Router();

QuizRouter.post('/quiz/add/', addQuiz);
QuizRouter.post('/quiz/add/question', upload.single('image'), addQuestion);
QuizRouter.post('/quiz/add/questions', addQuestions);
// QuizRouter.post('/quiz/add/option', upload.single('image'), addOption);
QuizRouter.get('/quiz/get/', getQuiz);
QuizRouter.get('/quiz/del/:id', delQuiz);
QuizRouter.post('/quiz/edit/:id', editQuiz);
QuizRouter.get('/quiz/generate/', generateQuiz);
QuizRouter.get('/quiz/solution/:id', getParticularSolution);
QuizRouter.get('/quiz/:id', getParticularQuiz);
QuizRouter.get('/quiz/question/del' , delQuestion);
QuizRouter.get('/quiz/get/user/' , getUserQuiz);
export default QuizRouter;