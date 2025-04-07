import { TestResponse } from "../models/TestResponse.js";
import { Test } from "../models/TestSchema.js";
import User from "../../models/User.js";// Assuming User model exists

export const getParticularTestSubmission = async (req, res) => {
  try {
    const { testId, userId } = req.query;

    if (!testId || !userId) {
      return res.status(400).json({ message: "Test Id and User Id are required" });
    }

    // Fetch test submission, test, and user in parallel
    const [testSubmission, test, user] = await Promise.all([
      TestResponse.findOne({ testId }).lean(),
      Test.findOne({ _id: testId }).lean(),
      User.findOne({ _id: userId }).lean(),
    ]);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (testSubmission?.isSubmitted) {
      return res.status(400).json({ message: "Test already submitted" });
    }

    // Create new test submission if not found
    if (!testSubmission) {
      const newTestSubmission = await TestResponse.create({ testId, userId });
      return res.status(201).json({newTestSubmission,test});
    }

    return res.status(200).json({testSubmission,test});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
