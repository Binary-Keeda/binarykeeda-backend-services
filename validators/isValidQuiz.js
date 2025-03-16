import Quiz from "../models/Quiz.js";

export default function (quiz) {
    if (!quiz.creator || !quiz.opensAt || !quiz.closeAt  || !quiz.marks || !quiz.duration) {
        return {success:false , message : "Please provide all fields"};
    }
    const marks = calc(quiz.questions);
    if(marks > quiz.marks){
        return {success:false , message : "Invalid marks"};
    }
    return {
        success: true,
        message: "Quiz created successfully",
        
    }

}


const calc = (marks = []) => {
    let totalMarks = 0;
    marks.forEach((element, idx) => {
        totalMarks += element.marks;
        console.log(totalMarks);
    })
}