import { Schema } from "mongoose";

import mongoose from 'mongoose';
import { QuestionSchema } from "./QuestionSchema";

export const QuestionSetSchema = new Schema({
  questionSet: {
    type: [QuestionSchema],
  },
}, {
  timestamps: true
});

export const QuestionSet = mongoose.model('QuestionSet', QuestionSetSchema);X