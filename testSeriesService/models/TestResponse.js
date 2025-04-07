import { response } from "express";
import mongoose , {Schema, model} from "mongoose";
import { CandidateQuesAnswerSchema } from "./CandidateQuestionAnswer.js";

const UserTestResponse = Schema({
    answers :{CandidateQuesAnswerSchema}
})
const TestResponseSchema = Schema({
    testId: {type: Schema.Types.ObjectId, ref: 'Test'},
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    isSubmitted:{type:Boolean,default:false},
    response:[{UserTestResponse}]
},{
    timestamps: true
})

// creating index
TestResponseSchema.index({testId:1,userId:1},{unique:true})
export const TestResponse = model('TestResponse' , TestResponseSchema);