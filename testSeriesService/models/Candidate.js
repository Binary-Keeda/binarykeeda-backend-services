import { Schema } from "mongoose";
import mongoose from 'mongoose';

export const CandidateSchema= new Schema({
  name: String,
  email: String, 
  totalAttempt: {
    type: Number,
    default: 0,
    validate: {
      validator: function(value) {
        return value === 3;
      },
      message: 'You have already done three attempts.'
    }
  },
  candidateQuestionAnswers: {
    type: [Schema.Types.ObjectId],
    ref: 'CandidateQuesAnswer'
  }
}, {
  timestamps: true
});

export const Candidate = mongoose.model('Candidate', CandidateSchema);