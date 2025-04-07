import mongoose, { Schema } from "mongoose";

export const CandidateQuesAnswerSchema = new Schema({
  candidate: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  questionSet: {
    type: Schema.Types.ObjectId,
    ref: 'QuestionSet'
  },
  questionAnswers: {
    type: [Number]
  }
}, {
  timestamps: true
});

CandidateQuesAnswerSchema.pre('save', function updateTotalScore(next) {
  next();
});

CandidateQuesAnswerSchema.pre('save', function updateIsPassed(next) {
  next();
});

export const CandidateQuesAnswer = mongoose.model('CandidateAnswer', CandidateQuesAnswerSchema);