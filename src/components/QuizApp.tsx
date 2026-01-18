'use client';

import { useState, useEffect } from 'react';
import { QuestionRow } from '@/lib/csv';

interface QuizAppProps {
  questions: QuestionRow[];
}

type HistoryRecord = {
  questionId: string;
  isCorrect: boolean;
  userSelection: string;
};

export default function QuizApp({ questions }: QuizAppProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    
    

    // Initialize state directly from localStorage using a function
    const [history, setHistory] = useState<HistoryRecord[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('quiz-progress');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [currentIndex, setCurrentIndex] = useState(() => {
        if (typeof window === 'undefined') return 0;
        const saved = localStorage.getItem('quiz-progress');
        return saved ? JSON.parse(saved).length : 0;
    });

    // Save to localStorage whenever history changes
    useEffect(() => {
        localStorage.setItem('quiz-progress', JSON.stringify(history));
    }, [history]);

    const currentQuestion = questions[currentIndex];

    const handleAnswerClick = (choice: string) => {
        setSelectedAnswer(choice);
    };

    const handleNext = () => {
        if (!selectedAnswer) return;
        const isCorrect = selectedAnswer === currentQuestion.Answer;
        
        const newHistoryEntry: HistoryRecord = {
            questionId: currentQuestion.QuestionID.toString(),
            isCorrect,
            userSelection: selectedAnswer,
        };

        setHistory((prev) => [...prev, newHistoryEntry]);
        setSelectedAnswer(null);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex((prev: number) => prev + 1); 
        } else {
            setIsFinished(true);
        }
    };

    const handleReset = () => {
        localStorage.removeItem('quiz-progress');
        setHistory([]);
        setCurrentIndex(0);
        setIsFinished(false);
    };

    const calculateProgress = (): number => {
        if (questions.length === 0) return 0;
        if (currentIndex === 0) return 0;
        return ((currentIndex + 1) / questions.length) * 100;
    };

    const currentProgress = calculateProgress();


    if (isFinished) {
        const correctCount = history.filter((h) => h.isCorrect).length;
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
                <p className="text-xl mb-6">Score: {correctCount} / {questions.length}</p>
                
                <div className="space-y-4">
                {history.map((record, index) => {
                    const originalQ = questions.find(q => q.QuestionID.toString() === record.questionId);
                    return (
                    <div key={index} className={`p-4 border-l-4 ${record.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                        <p className="font-semibold">{originalQ?.Question}</p>
                        <p className="text-sm">Your answer: {record.userSelection}</p>
                        {!record.isCorrect && (
                        <p className="text-sm font-bold text-green-700">Correct answer: {originalQ?.Answer}</p>
                        )}
                    </div>
                    );
                })}
                </div>
                <button 
                onClick={handleReset}
                className="mt-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                Restart Quiz
                </button>
            </div>
        );
    }

    if (!currentQuestion) return <div>Loading...</div>;
    
    const choices = [
        currentQuestion.AnswerChoice1,
        currentQuestion.AnswerChoice2,
        currentQuestion.AnswerChoice3,
        currentQuestion.AnswerChoice4,
    ];

    return (
        <div className='bg-white dark:bg-gray-800 h-lvh flex flex-col p-6'>
            <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800">
                <div className="mb-4 text-sm text-gray-500">
                    Question {currentIndex + 1} of {questions.length} • {currentQuestion.Category}
                </div>
                
                <h2 className="text-xl font-bold mb-6">{currentQuestion.Question}</h2>

                <div className="space-y-3">
                    {choices.map((choice, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswerClick(choice)}
                            className={`w-full text-left p-4 border rounded hover:dark:text-white hover:border-blue-500 transition-colors
                                ${selectedAnswer === choice ? 'border-blue-500 ring-1 bg-blue-400 ring-blue-500 text-white dark:text-white' : 'border-gray-200'}
                            `}
                        >
                            {choice}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={!selectedAnswer}
                    className="mt-8 w-full bg-blue-600 text-white py-3 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                    {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>



                <div className='mt-3'>
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <h6 className="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
                            Completed
                        </h6>
                        <h6 className="block font-sans text-base antialiased font-semibold leading-relaxed tracking-normal text-blue-gray-900">
                            {currentProgress.toString().substring(0, 5)}%
                        </h6>

                        
                    </div>
                    <div className="flex-start flex h-2.5 w-full overflow-hidden rounded-full dark:bg-gray-900 bg-gray-300 font-sans text-xs font-medium">
                        <div className="flex items-center justify-center h-full overflow-hidden text-white break-all dark:bg-emerald-800 bg-emerald-500 rounded-full" style={{ width: currentProgress }}>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}