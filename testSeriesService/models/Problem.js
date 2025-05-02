import mongoose, { Schema } from "mongoose";

export const ProblemSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true,
    },
    sampleTestCases:{
        type:Array, 
        required:true,
    },
    testCases:{
        type: Array,
        required: true,

    },
    
})

export const Problem = mongoose.model('Problem', ProblemSchema);