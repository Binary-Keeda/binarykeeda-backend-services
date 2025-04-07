import { Schema } from 'mongoose';

export const AnswerOptionSchema = new Schema({
  optionNumber: {
    type: Number
  },
  answerBody: {
    type: String,
    minlength: 1,
    maxlength: 200,
  },
  isCorrectAnswer: { 
    type: Boolean,
    default: false
  }
}, {
  _id: false
});