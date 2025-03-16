import { GoogleGenerativeAI } from "@google/generative-ai";
import { configDotenv } from "dotenv";
configDotenv();
const key = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function generateQuizService(title, marks, noOfQuestions, Difficulty) {
    try {
        const prompt = `
            Create a structured JSON object for a quiz with the following format:
            {
            questions: Array<{
                question: string,
                marks:int,
                options: Array<{ text: string, isCorrect: boolean }>
            }>
            }
            The quiz topic is ${title} , Total Marks ${marks} , Total number of questions ${noOfQuestions} and Difficulty level ${Difficulty}
            `;
        const res = await model.generateContent(prompt);

        const content = res.response.text();
        return content;
    } catch (error) {
        return error.message;
    }
}

const convertInJson  = (str = "") => {
    str = str.split('');
    str.pop()
    str.pop()
    str.pop()
    str.shift();str.shift();str.shift();str.shift();str.shift();str.shift();str.shift();
    str = str.join('');
    str = str.trim();
    const quizJson = JSON.parse(str);
    return quizJson;
}
