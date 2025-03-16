import Quiz from "../models/Quiz.js"
import Solution from "../models/Solution.js";

export const SubmitQuizController = async (req, res) => {
    try {
        const { userId, quizId, response } = req.body;

        // Validate required fields
        if (!userId || !quizId || !response) {
            return res.status(400).json({ message: "All fields are required: userId, quizId, and response" });
        }

        // Find the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Check if there's an unsubmitted solution for the given quiz and user
        const submission = await Solution.findOne({ userId, quizId, isSubmitted: false });
        if (!submission) {
            return res.status(400).json({ message: "No unsubmitted solution found for this quiz" });
        }

        // Update the submission
        submission.isSubmitted = true;
        submission.response = response;

        await submission.save();

        // Send success response
        return res.status(200).json({ message: "Submission successful" });
    } catch (error) {
        console.error("Error during quiz submission:", error.message);

        // Send generic server error response
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



export const getUserSubmissions = async (req,res) => {
    try {
        const {userId} = req.query;
        const submissions = await Solution.find({userId}).populate('quizId');
        res.json(submissions);
    } catch (error) {
        res.status(500).json({messgae:"Internal Server Error" , success:false})
    }
}