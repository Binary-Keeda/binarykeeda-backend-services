import mongoose, { model, Schema } from 'mongoose'

const SolutionSchema = Schema({
    userId: {
        type:String,
        ref:'Users',
        required:true
    },
    quizId: { 
        type:mongoose.Schema.Types.ObjectId,
        ref:'Quiz',
        required:true
    },
    response:{},
    ufmAttempts: {type:Number , default : 0},
    score:Number,
    isSubmitted:{type:Boolean, default:false},
}, {
    timestamps:true
})

const Solution = model('Solution' , SolutionSchema);
export default Solution;