import Quiz from '../models/Quiz.js';
import Solution from '../models/Solution.js';
import Users from '../models/User.js';
import Rank from '../services/userServices/models/Rank.js';

export const SubmitQuizController = async (req, res) => {
  try {
    const { userId, quizId, response } = req.body;

    // ✅ Validate inputs
    if (!userId || !quizId || !response) {
      return res.status(400).json({
        message: "All fields are required: userId, quizId, and response",
      });
    }

    // ✅ Find quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // ✅ Use predefined total marks
    const totalMarks = Number(quiz.marks) || 0;

    // ✅ Check for unsubmitted solution
    const submission = await Solution.findOne({ userId, quizId, isSubmitted: false });
    if (!submission) {
      return res.status(400).json({
        message: "No unsubmitted solution found for this quiz",
      });
    }

    // ✅ Calculate obtained marks
    let obtainedMarks = 0;

    quiz.questions.forEach((question) => {
      const correctOptions = question.options
        .filter(option => option.isCorrect)
        .map(opt => opt._id.toString());

      const userAnswerRaw = response[question._id];
      const userAnswer = userAnswerRaw ? userAnswerRaw.toString() : null;

      const marks = Number(question.marks) || 0;
      const penalty = typeof question.negative === 'number' ? question.negative : 0;

      console.log("User answer:", userAnswer);
      console.log("Correct options:", correctOptions);

      if (userAnswer && correctOptions.includes(userAnswer)) {
        console.log("correct");
        obtainedMarks += marks;
      } else if (userAnswer) {
        console.log("incorrect");
        obtainedMarks += penalty;
      }
    });

    
    const UserRank = await Rank.findOne({userId:userId});
    // ✅ Finalize submission
    submission.isSubmitted = true;
    submission.response = response;
    submission.marks = obtainedMarks;
    UserRank.points += obtainedMarks;
    UserRank.save()

    submission.totalMarks = totalMarks;
    await submission.save();

    // ✅ Update quiz stats
    const oldAttempts = Number(quiz.totalAttempts) || 0;
    const oldAverage = Number(quiz.averageScore) || 0;

    quiz.totalAttempts = oldAttempts + 1;
    quiz.averageScore = ((oldAverage * oldAttempts) + obtainedMarks) / quiz.totalAttempts;

    if (!quiz.highestScore || obtainedMarks > quiz.highestScore) {
      quiz.highestScore = obtainedMarks;
    }

    await quiz.save();

    // ✅ Update user stats
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const category = quiz.category;

    if (!user.solutions) user.solutions = {};
    if (!user.solutions.totalQuizSolutions) user.solutions.totalQuizSolutions = 0;
    if (!user.solutions[category]) {
      user.solutions[category] = {
        attempted: 0,
        average: 0,
      };
    }

    const userCatStats = user.solutions[category];
    const previousAttempts = Number(userCatStats.attempted) || 0;
    const previousAverage = Number(userCatStats.average) || 0;

    userCatStats.attempted = previousAttempts + 1;
    userCatStats.average =
      ((previousAverage * previousAttempts) + obtainedMarks) / userCatStats.attempted;

    user.solutions.totalQuizSolutions += 1;

    await user.save();

    // ✅ Final response
    return res.status(200).json({
      message: "Submission successful",
      marks: obtainedMarks,
      totalMarks,
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