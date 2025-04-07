import { Schema ,model } from "mongoose";
// import { QuestionSet } from "./QuestionSet";

const SectionSchema = Schema({
    name: { type: String, required: true },
    description: { type: String },
    questionSets: { type: Schema.Types.ObjectId, ref: 'QuestionSet' }
})
const TestSchema = Schema({
    sections:[{SectionSchema}],
    name: { type: String, required: true },
    description: { type: String },
    duration:{type:Number},
},{
    timestamps:true
});

export const Test = model('Test',TestSchema);