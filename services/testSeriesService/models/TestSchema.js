import mongoose, { Schema ,model } from "mongoose";
import { QuestionSchema } from './QuestionSchema.js'

const SectionSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    sectionType: {type:String , enum:['Quiz' , 'Coding']} ,
    questionSet: [QuestionSchema],
    problemset : [{type:mongoose.Schema.Types.ObjectId , ref:'Problem'}]
})

const TestSchema = new Schema({
    sections:[SectionSchema],
    name: { type: String, required: true },
    description: { type: String },
    duration:{type:Number},
    isAvailable:{type:Boolean,default:false}
},{
    timestamps:true
});

export const Test = model('Test',TestSchema);