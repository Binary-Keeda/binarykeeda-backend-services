import { Schema ,model } from "mongoose";
import { QuestionSchema } from './QuestionSchema.js'
import { ProblemSchema } from "./Problem.js";

const SectionSchema = Schema({
    name: { type: String, required: true },
    description: { type: String },
    sectionType: {type:String , enum:['Quiz' , 'Coding']} ,
    questionSet: [QuestionSchema],
    problemset : [ProblemSchema]
})

const TestSchema = Schema({
    sections:[SectionSchema],
    name: { type: String, required: true },
    description: { type: String },
    duration:{type:Number},
    isAvailable:{type:Boolean,default:false}
},{
    timestamps:true
});

export const Test = model('Test',TestSchema);