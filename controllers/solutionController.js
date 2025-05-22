import Quiz from '../models/Quiz.js';
import Solution from '../models/Solution.js';
import Users from '../models/User.js';

export const SubmitQuizController = async (req, res) => {
  try {
    const { userId, quizId, response } = req.body;

    if (!userId || !quizId || !response) {
      return res.status(400).json({
        message: "All fields are required: userId, quizId, and response",
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const submission = await Solution.findOne({ userId, quizId, isSubmitted: false });
    if (!submission) {
      return res.status(400).json({
        message: "No unsubmitted solution found for this quiz",
      });
    }

    // Calculate obtained marks
    let obtainedMarks = 0;

    quiz.questions.forEach((question) => {
      const correctOptions = question.options.filter((option) => option.isCorrect);
      if (correctOptions[0] == response[question._id]) {
        obtainedMarks += question.marks;
      } else if (response[question._id]) {
        obtainedMarks += question.negative || 0;
      }
    });

    // Update submission
    submission.isSubmitted = true;
    submission.response = response;
    submission.marks = obtainedMarks;
    await submission.save();

    // Update quiz statistics
    quiz.totalAttempts = (quiz.totalAttempts || 0) + 1;
    quiz.averageScore =
      ((quiz.averageScore || 0) * (quiz.totalAttempts - 1) + obtainedMarks) /
      quiz.totalAttempts;
    if (obtainedMarks > (quiz.highestScore || 0)) {
      quiz.highestScore = obtainedMarks;
    }
    await quiz.save();

    // Update user's solutions stats by quiz category
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const category = quiz.category; // Make sure this field exists in your Quiz schema and matches user.solutions keys
    if (user.solutions && user.solutions[category]) {
      user.solutions[category].attempted += 1;
      const attempted = user.solutions[category].attempted;
      const oldAverage = user.solutions[category].average;
      user.solutions[category].average = ((oldAverage * (attempted - 1)) + obtainedMarks) / attempted;
      await user.save();
    }

    return res.status(200).json({
      message: "Submission successful",
      marks: obtainedMarks,
      averageScore: quiz.averageScore,
    });

  } catch (error) {
    console.error("Error during quiz submission:", error.message);
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