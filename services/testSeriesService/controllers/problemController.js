import Problem from "../models/Problem.js";
import { UserSolution } from "../models/UserSolution.js";

import mongoose  from "mongoose";
// GET /api/solutions/check?userId=...&problemId=...&testId=...
export const getUserProblemResponse =  async (req, res) => {
  const { userId, problemId, testId } = req.query;

  if (!userId || !problemId || !testId) {
    return res.status(400).json({ message: 'Missing query parameters' });
  }

  try {
    const solution = await UserSolution.findOne({
      userId,
      problemId,
      testId
    });

    if (solution) {
      return res.status(200).json({ exists: true, id:solution._id });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}


// Utility: validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility: basic validation for required fields
const validateProblemFields = (data) => {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
    errors.push('Title must be a string with at least 3 characters.');
  }

  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required and must be a string.');
  }

  const allowedDifficulties = ['Easy', 'Medium', 'Hard'];
  if (!allowedDifficulties.includes(data.difficulty)) {
    errors.push('Difficulty must be one of Easy, Medium, or Hard.');
  }

  return errors;
};

// ============================
// @desc    Create a new problem
// ============================
// POST /api/v2/test/problem/add/
export const createProblem = async (req, res) => {
  const validationErrors = validateProblemFields(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const newProblem = new Problem(req.body);
    const saved = await newProblem.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create problem.', details: err.message });
  }
};

// ============================
// @desc    Update an existing problem
// ============================
export const updateProblem = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid Problem ID.' });
  }

  const validationErrors = validateProblemFields(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const updated = await Problem.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update problem.', details: err.message });
  }
};

