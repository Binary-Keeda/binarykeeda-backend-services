import { Test } from "../models/TestSchema.js";

export const updateTestDetails = async (req, res) => {
  const { id } = req.params;
  const { name, duration, isAvailable } = req.body;

  try {
    const updatedTest = await Test.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name }),
        ...(duration !== undefined && { duration }),
        ...(isAvailable !== undefined && { isAvailable })
      },
      { new: true } // return the updated doc
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.status(200).json(updatedTest);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
