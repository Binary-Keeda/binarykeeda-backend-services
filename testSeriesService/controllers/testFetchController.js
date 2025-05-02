import { Test } from '../models/TestSchema.js';

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
    Test.findById(req.params.id)
      .then(data => res.send(data))
      .catch(err => res.status(500).json({ error: err.message }));
  };
  