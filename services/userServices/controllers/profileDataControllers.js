import mongoose from 'mongoose';
import Solution from '../../../models/Solution.js';

export const getUserQuizBreakdown = async (req, res) => {
  const { userId } = req.params;

  try {
    const breakdown = await Solution.aggregate([
      {
        $match: {
          userId: userId
        }
      },
      {
        $lookup: {
          from: 'quizzes', // Check this in your DB
          localField: 'quizId',
          foreignField: '_id',
          as: 'quiz'
        }
      },
      {
        $unwind: '$quiz'
      },
      {
        $group: {
          _id: '$quiz._id',
          title: { $first: '$quiz.title' },
          category: { $first: '$quiz.category' },
          difficulty: { $first: '$quiz.difficulty' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          quizId: '$_id',
          title: 1,
          category: 1,
          difficulty: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return res.status(200).json({ breakdown });
  } catch (err) {
    console.error('Error fetching user quiz breakdown:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
