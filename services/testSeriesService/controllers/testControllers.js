import { TestResponse } from "../models/TestResponse.js";
import { Test } from "../models/TestSchema.js";
import User from "../../../models/User.js";// Assuming User model exists

export const getParticularTestSubmission = async (req, res) => {
  try {
    const { testId, userId } = req.query;

    if (!testId || !userId) {
      return res.status(400).json({ message: "Test Id and User Id are required" });
    }

    // Fetch test and user
    const [test, user] = await Promise.all([
      Test.findById(testId).lean().populate({
        path: 'sections.problemset',
        model: 'Problem',
      }),
      User.findById(userId).lean(),
    ]);

    if (!test) return res.status(404).json({ message: "Test not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check existing submissions (attempts)
    const submissions = await TestResponse.findOne({ testId, userId }).lean();
    // const submissions = await TestResponse.find({ testId, userId }).sort({ createdAt: -1 }).lean();

    // if (submissions.length >= 1) {
      // return res.status(403).json({ message: "Maximum attempt limit reached (1/1)" });
    // }

    // If latest one exists and is not submitted, use that
    // const latestSubmission = submissions;
    // if (latestSubmission && !latestSubmission.isSubmitted) {
    //   return res.status(200).json({ testSubmission: latestSubmission, test });
    // }

    // Else create a new one
    if(submissions) return res.status(200).json({ testSubmission: submissions, test });
    const newSubmission = await TestResponse.create({ testId, userId, attempt:  1 });
    return res.status(201).json({ testSubmission: newSubmission, test });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const startTest = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const updatedSubmission = await TestResponse.findByIdAndUpdate(
      submissionId,
      {
        $set: {
          startedAt: Date.now(),
          hasAgreed: true
        }
      },
      { new: true }
    );

    if (!updatedSubmission) {
      return res.status(404).json({ message: "Test submission not found" });
    }

    return res.status(200).json({ message: "Test started", testSubmission: updatedSubmission });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const submitSectionResponse = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { sectionId, sectionType, quizAnswers, codingAnswers } = req.body;

    if (!sectionId || !sectionType) {
      return res.status(400).json({ message: "Section ID and type are required" });
    }

    const submission = await TestResponse.findById(submissionId);
    if (!submission) return res.status(404).json({ message: "Test submission not found" });

    const test = await Test.findById(submission.testId).lean();
    if (!test) return res.status(404).json({ message: "Test not found" });

    let sectionIndex = submission.response.findIndex(
      s => s.sectionId.toString() === sectionId
    );

    // If section doesn't exist, push it and get the new index
    if (sectionIndex === -1) {
      submission.response.push({
        sectionId,
        sectionType,
        quizAnswers: [],
        codingAnswers: []
      });
      sectionIndex = submission.response.length - 1; // update index
    }

    if (sectionType === 'Quiz' && quizAnswers) {
      submission.response[sectionIndex].quizAnswers = quizAnswers;

      const totalQues = test.sections.find(s => s._id.toString() === sectionId)?.questionSet.length || 0;
      let totalCorrect = 0;

      const questions = test.sections.find(s => s._id.toString() === sectionId)?.questionSet || [];

      questions.forEach((question) => {
        const selectedOptionId = quizAnswers[question._id.toString()];
        const correctOption = question.answerOptions.find(opt => opt.isCorrect);

        if (
          selectedOptionId &&
          correctOption &&
          selectedOptionId === correctOption._id.toString()
        ) {
          totalCorrect++;
        }
      });

      submission.response[sectionIndex].totalQuestions = totalQues;
      submission.response[sectionIndex].correctAnswers = totalCorrect;
    }

    else if (sectionType === 'Coding' && codingAnswers) {
      submission.response[sectionIndex].codingAnswers = codingAnswers;
    }

    submission.markModified('response');
    submission.curr += 1;

    if (submission.curr >= test.sections.length) {
      submission.isSubmitted = true;
    }

    await submission.save();

    return res.status(200).json({
      message: submission.isSubmitted ? "Test submitted" : "Section submitted",
      testSubmission: submission,
    });

  } catch (err) {
    console.error("Error submitting section:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

