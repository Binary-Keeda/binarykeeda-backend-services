import generateQuizService from "../service/quizGenerateService.js";
import sendRes from "../utils/sendRes.js";

export const generateQuiz = async (req, res) => {
    const { marks, topic, noOfQuestions, difficulty} = req.query;
    try {
        const quiz = await generateQuizService(marks, topic, noOfQuestions, difficulty);
        return res.status(200).json(quiz);
    } catch (error) {
        sendRes(error.message ,500 , false ,res);
    }
}
