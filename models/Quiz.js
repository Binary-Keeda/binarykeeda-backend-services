import mongoose, { Schema } from "mongoose";

const OptionsSchema = Schema({
    text: { type: String, required: false },
    image: { type: String, required: false },
    isCorrect: { type: Boolean, default: false },
});

const QuestionSchema = Schema({
    question: { type: String },
    image: { type: String, sparse: true },
    marks: { type: Number, required: true },
    negative: { type: Number, default: 0 },
    category: {
        type: String,
        enum: ["MCQ", "MSQ", "Text"],
        default: "MCQ",
    },
    answer: { type: String, sparse: true },
    options: [OptionsSchema], // Corrected this line
  
});

const QuizSchema = Schema(
    {
        category:{type:String , enum:['Aptitude' , 'Miscellaneous' , 'Core'] },
        difficulty: { type:String,enum:['Easy','Medium' , 'Hard'] ,  default: 'Medium' },// Easy , medum
        tags: { type: [String], default: [] }, // #oops , #core 
        creator: { type:String, ref: 'Users', required: true },
        title: { type: String },
        duration: { type: Number, required: true },
        questions: [QuestionSchema], // Corrected this line
        marks: { type: Number, required: true },
        averageScore: { type: Number, default: 0 },
        highestScore: { type: Number, default: 0 }, // Fixed typo: "heightest" to "highest"
        isAvailable: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const Quiz = mongoose.model('Quiz', QuizSchema);

export default Quiz;
