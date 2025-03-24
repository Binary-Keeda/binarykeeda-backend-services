import { model, Schema } from "mongoose";

const OptionSchema = new Schema({
    optionText: String,
    isCorrect: Boolean,
});

const QuestionSchema = new Schema({
    questionText: { type: String, required: true },
    options: [OptionSchema],
    correctAnswer: { type: String, required: true },
});

const ProblemSchema = new Schema({
    problemName: { type: String, required: true },
    problemDescription: { type: String, required: true },
    testCases: {
        weightage: Number,
        input: [String],
        expectedOutput: [String], 
    },
    exampleTestCase: {
        input: String,
        expectedOutput: String,
    },
});

const QuizSchema = new Schema({
    quizName: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isSubmitted: { type: Boolean, default: false },
    duration: { type: Number, required: true },
    questions: { type: [QuestionSchema], default: [], sparse: true },
    problems: { type: [ProblemSchema], default: [], sparse: true },
});

const TestSchema = new Schema({
    testName: { type: String, required: true },
    testDescrition:{type:Text},
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isSubmitted: { type: Boolean, default: false },
    sections: { type: [QuizSchema], default: [] },
});

const Test = model('Test', TestSchema);
export default Test;
