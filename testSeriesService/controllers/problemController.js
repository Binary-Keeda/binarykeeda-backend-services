import { UserSolution } from "../models/UserSolution.js";


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
