import Quiz from '../models/Quiz.js';
import Solution from '../models/Solution.js';
import sendRes from '../utils/sendRes.js';
import { z } from 'zod';

const quizSchema = z.object({
    creator: z.string().nonempty("Creator is required"),
    title: z.string().nonempty("Title is required"),
    duration: z.number().positive("Duration must be a positive number"),
    questions: z.array(z.object({
        question: z.string().nonempty("Question is required"),
        marks: z.number().positive("Marks must be a positive number"),
        category: z.string().nonempty("Category is required"),
        image: z.string().optional(),
        answer: z.string().optional(),
    })).optional(),
    marks: z.number().positive("Marks must be a positive number"),
    category: z.string().optional(),
    tags: z.string().optional(),
    difficulty: z.string().optional(),
});

const questionSchema = z.object({
    question: z.string().nonempty("Question is required"),
    quizId: z.string().nonempty("Quiz ID is required"),
    marks: z.number().positive("Marks must be a positive number"),
    negative: z.number().negative("Must be a negative number"),
    category: z.string().nonempty("Category is required"),
    image: z.string().optional(),
    answer: z.string().optional(),
    options: z.array(
        z.object({
            text: z.string(),
            isCorrect: z.boolean()
        })
    )
});

export const addQuiz = async (req, res) => {
    try {
        const reqQuiz = quizSchema.parse(req.body);
        const newQuiz = new Quiz(reqQuiz);
        await newQuiz.save();
        return sendRes("Quiz Created Successfully", 200, true, res);
    } catch (error) {
        console.log(error);
        return sendRes(error.errors || error.message, 400, false, res);
    }
};

export const addQuestion = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        console.log(data)
        const questionToAdd = questionSchema.parse(data);

        const quiz = await Quiz.findById(questionToAdd.quizId);
        if (!quiz) return sendRes("Quiz not found", 404, false, res);

        if (req.file) questionToAdd.image = req.file.path;

        quiz.questions.push(questionToAdd);
        await quiz.save();

        return sendRes("Question Added Successfully", 200, true, res);
    } catch (error) {
        return sendRes(error.errors || error.message, 400, false, res);
    }
};

export const addQuestions = async (req, res) => {
    try {
        const { data, quizId } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return sendRes("Quiz not found", 404, false, res);

        const validQuestions = data.map((q) => questionSchema.parse(q));
        quiz.questions.push(...validQuestions);

        await quiz.save();
        return sendRes("Questions added successfully", 200, true, res);
    } catch (error) {
        return sendRes(error.errors || error.message, 400, false, res);
    }
};

export const getQuiz = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        const query = search ? { title: { $regex: search, $options: "i" } } : {};

        const [quizzes, totalItems] = await Promise.all([
            Quiz.find(query)
                .skip(skip)
                .limit(limit)
                .populate({ path: 'creator', select: '-password' })
                .lean(),
            Quiz.countDocuments(query),
        ]);

        const response = {
            status: true,
            data: quizzes,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        };

        res.status(200).json(response);
    } catch (error) {
        sendRes("Failed to fetch quizzes", 500, false, res);
    }
};

export const getParticularQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('questions');
        if (!quiz) return sendRes("Quiz Not Found", 404, false, res);
        return res.json(quiz);
    } catch (error) {
        return sendRes("Internal Server Error", 500, false, res);
    }
};

export const getParticularSolution = async (req, res) => {
    try {
        const { userId } = req.query;
        const { id: quizId } = req.params;

        if (!userId) return sendRes("User ID is required", 400, false, res);

        const quiz = await Quiz.findById(quizId).populate("questions");
        if (!quiz) return sendRes("Quiz Not Found", 404, false, res);

        const existingSolution = await Solution.findOne({
            quizId,
            userId,
            isSubmitted: true,
        });

        if (existingSolution) {
            return sendRes("Quiz can be solved only once", 400, false, res);
        }

        // Check for an existing unsubmitted solution or create a new one
        let solution = await Solution.findOne({ quizId, userId });
        if (!solution) {
            solution = await Solution.create({ quizId, userId, isSubmitted: false });
        }

        // Respond with the quiz and solution
        return res.status(200).json({ quiz, solution });
    } catch (error) {
        console.error("Error fetching solution:", error.message);
        return sendRes("Internal Server Error", 500, false, res);
    }
};

export const editQuiz = async (req, res) => {
    const { id } = req.params; 
    const quizData = req.body;

    try {
        if (!id) {
            return res.status(400).json({ message: 'Quiz ID is required for editing.' });
        }

        const updatedQuiz = await Quiz.findByIdAndUpdate(id, quizData, { new: true });
        if (!updatedQuiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        return res.status(200).json({ message: 'Quiz updated successfully.', quiz: updatedQuiz });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating the quiz.', error });
    }
};

export const delQuiz = async (req, res) => {
    const { id } = req.params; // Get the ID from the route parameters

    try {
        if (!id) {
            return res.status(400).json({ message: 'Quiz ID is required for deletion.' });
        }

        const deletedQuiz = await Quiz.findByIdAndDelete(id);
        if (!deletedQuiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        return res.status(200).json({ message: 'Quiz deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while deleting the quiz.', error });
    }
};

export const delQuestion = async (req, res) => {
    try {
        const { quizId, questionId } = req.query;

        // Validate input
        if (!quizId || !questionId) {
            return res.status(400).json({ message: 'Invalid or missing parameters.' });
        }

        // Fetch quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // Check if question exists
        const questionExists = quiz.questions.some(question => question._id.toString() === questionId);
        if (!questionExists) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        // Remove the question
        quiz.questions = quiz.questions.filter(question => question._id.toString() !== questionId);

        // Save changes
        await quiz.save();

        return res.status(200).json({ message: 'Question deleted successfully.' });
    } catch (error) {
        console.error('Error deleting question:', error); // Log error for debugging
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const getUserQuiz = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const search = req.query.search || "";
        const category = req.query.category || "";
        const skip = (page - 1) * limit;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "User ID is required",
            });
        }

        // Query filters
        const query = {
            ...(search ? { title: { $regex: search, $options: "i" } } : {}),
            ...(category ? { category: category } : {}), // Include category if provided
        };

        const quizzes = await Quiz.aggregate([
            { $match: query },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "solutions",
                    let: { quizId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$quizId", "$$quizId"] },
                                        { $eq: ["$userId", userId] },
                                    ],
                                },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: "userSolution",
                },
            },
            {
                $addFields: {
                    isSubmitted: {
                        $cond: {
                            if: { $gt: [{ $size: "$userSolution" }, 0] },
                            then: { $ifNull: [{ $arrayElemAt: ["$userSolution.isSubmitted", 0] }, false] },
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    userSolution: 0,
                    questions: 0,
                },
            },
        ]);
        
        const totalItems = await Quiz.countDocuments(query);

        res.status(200).json({
            status: true,
            data: quizzes,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        });

    } catch (error) {
        console.error("Error fetching quizzes:", error);
        sendRes("Failed to fetch quizzes", 500, false, res);
    }
};
