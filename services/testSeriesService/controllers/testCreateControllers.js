import Problem from '../models/Problem.js';
import { Test } from '../models/TestSchema.js';

export const createTest = async (req, res) => {
  try {
    const { name, description, duration } = req.body;

    if (!name || !description || !duration) {
      return res.status(400).json({ msg: "Please provide all fields" });
    }

    const newTest = new Test({ name, description, duration });

    await newTest.save();

    return res.status(200).json({ msg: "Test created successfully" });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// POST /api/v2/test/:testId/section/:sectionId/question
export const addQuestionToSection =  async (req, res) => {
  const { testId, sectionId } = req.params
  const { question, marks, negative, answerOptions } = req.body

  if (!question || !Array.isArray(answerOptions)) {
    return res.status(400).json({ message: 'Invalid payload' })
  }

  try {
    const test = await Test.findById(testId)
    if (!test) return res.status(404).json({ message: 'Test not found' })
    const section = test.sections.id(sectionId)
    if (!section) return res.status(404).json({ message: 'Section not found' })

    section.questionSet.push({ question, marks, negative, answerOptions })

    await test.save()
    res.status(201).json({ message: 'Question added successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
};


// POST /api/tests/:testId/sections
export const AddSection = async (req, res) => {
    const { name, description, sectionType } = req.body;

    if (!name || !sectionType) return res.status(400).json({ message: "Missing required fields" });

    try {
        const test = await Test.findById(req.params.testId);
        if (!test) return res.status(404).json({ message: "Test not found" });

        const newSection = {
            name,
            description,
            sectionType,
            questionSet: [],
            problemset: []
        };

        test.sections.push(newSection);
        await test.save();

        res.status(200).json({ message: "Section added", test });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// export const AddProblem = async (req, res) => {
//     try {
//         const {
//             title,
//             description,
//             difficulty,
//             sampleTestCases,
//             functionSignatures,
//             testCases
//         } = req.body;

//         const newProblem = new Problem({
//             title,
//             description,
//             difficulty,
//             functionSignatures,
//             sampleTestCases,
//             testCases
//         });

//         const savedProblem = await newProblem.save();
//         res.status(201).json({ message: 'Problem added successfully', problem: savedProblem });
//     } catch (error) {
//         console.error('Error adding problem:', error);
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };


export const addProblemToSection = async (req, res) => {
    const { testId, sectionId } = req.params;
    const { problemId } = req.body;
  
    try {
      const test = await Test.findById(testId);
      if (!test) return res.status(404).json({ message: 'Test not found' });
  
      const section = test.sections.id(sectionId);
      if (!section) return res.status(404).json({ message: 'Section not found' });
  
      const problemExists = await Problem.exists({ _id: problemId });
      if (!problemExists) return res.status(404).json({ message: 'Problem not found' });
  
      // Check for duplicate
      if (section.problemset.includes(problemId)) {
        return res.status(400).json({ message: 'Problem already added to section' });
      }
  
      section.problemset.push(problemId);
      await test.save();
  
      res.status(200).json({ message: '✅ Problem added to section' });
    } catch (err) {
      console.error('❌ Error adding problem to section:', err);
      res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
  };