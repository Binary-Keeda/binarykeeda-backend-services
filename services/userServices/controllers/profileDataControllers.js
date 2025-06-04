import mongoose from 'mongoose';
import Solution from '../../../models/Solution.js';
import Rank from '../models/Rank.js';

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
export const getUserRanks = async (req, res) => {
  try {
    const { userId, university } = req.query;

    if (!userId || !university) {
      return res.status(400).json({ error: 'userId and university are required' });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    const [globalRankData] = await Rank.aggregate([
      {
        $setWindowFields: {
          sortBy: { points: -1 },
          output: { rank: { $rank: {} } }
        }
      },
      { $match: { userId: objectId } },
      { $project: { _id: 0, globalRank: '$rank' } }
    ]);

    const [universityRankData] = await Rank.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
     {
    $match: {
      $expr: {
        $eq: [
          { $toLower: '$user.university' },
          university.toLowerCase()
        ]
      }
    }
  },
      {
        $setWindowFields: {
          sortBy: { points: -1 },
          output: { rank: { $rank: {} } }
        }
      },
      { $match: { userId: objectId } },
      { $project: { _id: 0, universityRank: '$rank' } }
    ]);

    return res.status(200).json({
      userId,
      university,
      globalRank: globalRankData?.globalRank ?? null,
      universityRank: universityRankData?.universityRank ?? null
    });

  } catch (err) {
    console.error('Rank fetch error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
