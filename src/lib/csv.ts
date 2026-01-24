import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export type QuestionRow = {
    QuestionID: string;
    Category: string;
    Topic: string;
    Question: string;
    Answer: string;
    AnswerChoice1: string;
    AnswerChoice2: string;
    AnswerChoice3: string;
    AnswerChoice4: string;
};

export function getQuestions() {
    const filePath = path.join(process.cwd(), 'src', 'data', 'exam-prep.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
        skipEmptyLines: true,
        trim: true
    });

    return records as QuestionRow[];
}