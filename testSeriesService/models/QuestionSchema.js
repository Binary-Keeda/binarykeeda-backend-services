import { Schema } from 'mongoose';
import mongoose from 'mongoose';

export const QuestionSchema = new Schema({
  question: {
    type: String,
    minlength: 10,
    maxlength: 1000,
  },
  marks:{type:Number},
  negative:{type:Number},
  answerOptions: {
    type: [
      {
        text:{type:String},
      isCorrect:{type:Boolean,default:false}
    }
    ],
    default: undefined,
    validate: {
      validator: function(value) {
        return value && value.length === 4;
      },
      message: 'Answer options should be 4.'
    }
  }
}, {
  timestamps: true
});

export const Question = mongoose.model('Question', QuestionSchema);