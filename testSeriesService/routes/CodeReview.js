import { GoogleGenerativeAI } from '@google/generative-ai';
import { Router } from 'express';
import dotenv from 'dotenv';
import { UserSolution } from '../models/UserSolution.js';

// Load environment variables from .env file
dotenv.config();

const reviewRouter = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to review the code
async function reviewCode(req, res) {
  const { sourceCode } = req.body; // Get the source code from the request body

  if (!sourceCode) {
    return res.status(400).json({ error: "Source code is required" });
  }

  try {
    // Get the generative model for code review
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Prepare the prompt to analyze the source code
    const prompt = `
      Analyze the following code's functions and return a JSON object with the following structure:

      {
        "indentation": score (out of 10), // A score for indentation, 10 being perfect
        "modularity": score (out of 10), // A score for modularity, 10 being highly modular
        "variable_name_convention": score (out of 10), // A score for variable name consistency, 10 being perfect
        "time_complexity": score (out of 10), // A score based on time complexity, 10 being optimal
        "space_complexity": score (out of 10) // A score based on space complexity, 10 being optimal
      }

      Only return the JSON. Do not explain anything. Here's the code:

      ${sourceCode}
    `;

    // Requesting the AI model for content generation
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response and return it
    try {
      const reviewResult = text;
      return res.json({data:reviewResult}); // Send the result back as JSON
    } catch (err) {
      console.error("Could not parse Gemini response:", text);
      return res.status(500).json({ error: "Error parsing Gemini response" });
    }
  } catch (error) {
    console.error("Error during code review:", error);
    return res.status(500).json({ error: "Error during code review" });
  }
}


// controllers/submit.controller.js


export const saveCodeSubmission = async (req, res) => {
  try {
    const {
      userId,
      problemId,
      testId,
      language,
      sourceCode,
      codeReview,
      passedTestCases = 0,
      totalTestCases = 0,
      executionTime,
      memoryUsed
    } = req.body;

    if (!userId || !problemId || !testId || !language || !sourceCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedReview = {
      indentation: codeReview?.indentation || 0,
      modularity: codeReview?.modularity || 0,
      variable_name_convention: codeReview?.variable_name_convention || 0,
      time_complexity: codeReview?.time_complexity || 0,
      space_complexity: codeReview?.space_complexity || 0
    };

    const submission = new UserSolution({
      userId,
      testId,
      problemId,
      language,
      code: sourceCode,
      codeReview: sanitizedReview,
      passedTestCases,
      totalTestCases,
      executionTime,
      memoryUsed
    });

    await submission.save();

    res.status(201).json({
      message: 'Submission saved successfully',
      submissionId: submission._id
    });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Failed to save submission' });
  }
};









// Define the POST route for /code
reviewRouter.post('/code', reviewCode);
reviewRouter.post('/submit' , saveCodeSubmission);

export default reviewRouter;
