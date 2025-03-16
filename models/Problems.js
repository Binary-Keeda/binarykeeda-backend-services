import { model, Schema } from 'mongoose';

const problemSchema = new Schema({
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
    testCases:{
        type: Array,
        required: true,

    },
    
})