// models/TestResponse.js
import mongoose, { Schema, model } from "mongoose";

// Response for a quiz question
const QuizAnswerSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, required: true },
  selectedOptionId: { type: Schema.Types.ObjectId } // optional if not attempted
});

// Response for a coding problem
const CodingAnswerSchema = new Schema({
  id:{type:String},
  userSolutionId: { type: Schema.Types.ObjectId, ref: 'UserSolution' } // or another solution model
});

// Response to one section
const SectionResponseSchema = new Schema({
  sectionId: { type: Schema.Types.ObjectId, required: true },
  sectionType: { type: String, enum: ['Quiz', 'Coding'], required: true },
  quizAnswers: [],
  codingAnswers: []
});

// Full test response by a user
const TestResponseSchema = new Schema({
  testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isSubmitted: { type: Boolean, default: false },
  response: [SectionResponseSchema],
  hasAgreed:{type:Boolean , default :false}, 
  startedAt: {type:Date , default : null},
  curr:{type:Number, default:0},
  attempt:Number
  
}, {
  timestamps: true
});

// Composite index: a user can have multiple attempts for a test
TestResponseSchema.index({ testId: 1, userId: 1 });

export const TestResponse = model('TestResponse', TestResponseSchema);
