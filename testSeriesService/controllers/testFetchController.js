import mongoose from 'mongoose';
import Problem from '../models/Problem.js';
import { Test } from '../models/TestSchema.js';
import { TestResponse } from '../models/TestResponse.js';

export const getAllTest = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const totalItems = await Test.countDocuments();
        const Tests = await Test.find()
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            status: true,
            data: Tests,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Server Error",
        });
    }
};

export const getTestById = (req, res) => {
    Test.findById(req.params.id).populate({
        path: 'sections.problemset',
        model: 'Problem',
        select: 'title description' 
      }).then(data => res.send(data))
      .catch(err => res.status(500).json({ error: err.message }));
  };
  
export const getAllProblems = (req,res) => {
    Problem.find({})
    .then(data => res.send(data))
    .catch(err => res.status(500).json({ error: err.message }));
}
export const getUserTests = async (req, res) => {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ status: false, message: "Invalid userId" });
      }
  
      // Count total available tests (for pagination)
      const totalTests = await Test.countDocuments({ isAvailable: true });
  
      // Fetch available tests with pagination
      const tests = await Test.find({ isAvailable: true })
        .skip(skip)
        .limit(limit);
  
      // Fetch attempt counts for this user per test
      const attemptCounts = await TestResponse.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$testId",
            attempts: { $sum: 1 }
          }
        }
      ]);
  
      // Create a lookup map of testId -> attempts
      const attemptMap = {};
      attemptCounts.forEach(({ _id, attempts }) => {
        attemptMap[_id.toString()] = attempts;
      });
  
      // Attach attempts and eligibility to each test
      const result = tests.map(test => {
        const attempts = attemptMap[test._id.toString()] || 0;
        return {
          _id: test._id,
          name: test.name,
          description: test.description,
          duration: test.duration,
          isAvailable: test.isAvailable,
          sections: test.sections.length,
          attempts,
          canAttempt: attempts < 1
        };
      });
  
      // Return final response
      return res.status(200).json({
        status: true,
        data: result,
        pagination: {
          total: totalTests,
          page,
          limit,
          totalPages: Math.ceil(totalTests / limit)
        }
      });
  
    } catch (error) {
      console.error("Error fetching user tests:", error);
      return res.status(500).json({ status: false, message: "Server error" });
    }
  };