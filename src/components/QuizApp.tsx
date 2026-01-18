'use client';

import { useState, useEffect } from 'react';
import { QuestionRow } from '@/lib/csv';
import Filters from './Filters';
import { FilterState, HistoryRecord } from '@/types/quiz';

interface QuizAppProps {
  questions: QuestionRow[];
}

export default function QuizApp({ questions }: QuizAppProps) {
    const [view, setView] = useState<'filters' | 'quiz'>(() => {
        if (typeof window === 'undefined') return 'filters';
        // If we have a session saved, go straight to the quiz
        return localStorage.getItem('quiz-session-ids') ? 'quiz' : 'filters';
    });

    const [activeQuestions, setActiveQuestions] = useState<QuestionRow[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const savedSession = localStorage.getItem('quiz-session-ids');
            if (!savedSession) return [];

            const sessionIds = JSON.parse(savedSession) as string[];
            
            // Map the saved IDs back to the real question objects
            return sessionIds
                .map(id => questions.find(q => q.QuestionID.toString() === id))
                .filter((q): q is QuestionRow => !!q);
        } catch {
            return [];
        }
    });

    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    
    const [history, setHistory] = useState<HistoryRecord[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('quiz-progress');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    
    const [currentIndex, setCurrentIndex] = useState(() => {
        if (typeof window === 'undefined') return 0;
        try {
            const saved = localStorage.getItem('quiz-progress');
            return saved ? JSON.parse(saved).length : 0;
        } catch { return 0; }
    });
    

    // Save Progress
    useEffect(() => {
        if (view === 'quiz') {
            localStorage.setItem('quiz-progress', JSON.stringify(history));
        }
    }, [history, view]);


    // HANDLER: Start Quiz from Filters
    const handleStartQuiz = (filters: FilterState) => {
        let filtered = [...questions];

        // Filter Category
        if (filters.categories.length > 0) {
            filtered = filtered.filter(q => filters.categories.includes(q.Category));
        }

        // Filter Topic
        if(filters.topics.length > 0) {
            filtered = filtered.filter(q => filters.topics.includes(q.Topic));
        }

        // Shuffle
        filtered.sort(() => Math.random() - 0.5);

        // Limit
        if (filters.limit > 0) {
            filtered = filtered.slice(0, filters.limit);
        }

        if (filtered.length === 0) {
            alert("No questions match your filters!");
            return;
        }

        // Save Session
        const questionIds = filtered.map(q => q.QuestionID.toString());
        localStorage.setItem('quiz-session-ids', JSON.stringify(questionIds));

        // Reset & Launch
        setActiveQuestions(filtered);
        setHistory([]);
        setCurrentIndex(0);
        setIsFinished(false);
        localStorage.removeItem('quiz-progress');
        setView('quiz');
    };

    // HANDLER: Reset / Go Home
    const handleReset = () => {
        localStorage.removeItem('quiz-progress');
        localStorage.removeItem('quiz-session-ids'); 
        setHistory([]);
        setActiveQuestions([]);
        setCurrentIndex(0);
        setIsFinished(false);
        setView('filters');
    };


    if (view === 'filters') {
        return <Filters questions={questions} onStartQuiz={handleStartQuiz} />;
    }

    if (!activeQuestions || activeQuestions.length === 0) return <div>Loading...</div>;

    const currentQuestion = activeQuestions[currentIndex]; 
    if (!currentQuestion) return <div>Loading Question...</div>;

    const choices = [
        currentQuestion.AnswerChoice1,
        currentQuestion.AnswerChoice2,
        currentQuestion.AnswerChoice3,
        currentQuestion.AnswerChoice4,
    ].filter(c => c); // remove empty

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

        if (currentIndex + 1 < activeQuestions.length) {
            setCurrentIndex((prev: number) => prev + 1); 
        } else {
            setIsFinished(true);
        }
    };

    const currentProgress = (currentIndex / activeQuestions.length) * 100;

    if (isFinished) {
        const correctCount = history.filter((h) => h.isCorrect).length;
        return (
            <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md my-10">
                <h2 className="text-3xl font-bold mb-4 text-center dark:text-white">Quiz Complete!</h2>
                <div className="text-center mb-8">
                    <p className="text-5xl font-bold text-blue-600 mb-2">{Math.round((correctCount / activeQuestions.length) * 100)}%</p>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Score: {correctCount} / {activeQuestions.length}</p>
                </div>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {history.map((record, index) => {
                        const originalQ = activeQuestions.find(q => q.QuestionID.toString() === record.questionId);
                        return (
                        <div key={index} className={`p-4 rounded border-l-4 ${record.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                            <p className="font-semibold dark:text-gray-200">{originalQ?.Question}</p>
                            <p className="text-sm mt-1 dark:text-gray-400">Your answer: <span className={record.isCorrect ? "text-green-700 font-medium" : "text-red-600"}>{record.userSelection}</span></p>
                            {!record.isCorrect && (
                            <p className="text-sm font-bold text-green-700 dark:text-green-400">Correct answer: {originalQ?.Answer}</p>
                            )}
                        </div>
                        );
                    })}
                </div>
                <button 
                    onClick={handleReset}
                    className="mt-8 w-full bg-gray-800 text-white py-3 rounded bg-gray-500 hover:bg-gray-900 transition font-bold"
                >
                    Start New Quiz
                </button>
            </div>
        );
    }

    // --- QUIZ SCREEN ---
    return (
        <div className='bg-white dark:bg-gray-800 min-h-screen flex flex-col items-center justify-center p-6'>
            <div className="w-full max-w-xl bg-white dark:bg-gray-800">

                <div className='mb-8'>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Question {currentIndex + 1} of {activeQuestions.length}</span>
                        <span className="text-sm font-semibold text-blue-600">{currentProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                        <div className="h-2.5 bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${currentProgress}%` }}></div>
                    </div>
                </div>

                <div className="mb-2 text-sm text-blue-500 font-bold uppercase tracking-wider">
                    {currentQuestion.Category}
                </div>
                
                <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white leading-snug">
                    {currentQuestion.Question}
                </h2>

                <div className="space-y-3">
                    {choices.map((choice, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswerClick(choice)}
                            className={`w-full text-left p-4 border rounded-xl transition-all duration-200
                                ${selectedAnswer === choice 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500' 
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}
                                dark:text-gray-100
                            `}
                        >
                            {choice}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={!selectedAnswer}
                    className="mt-8 w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition shadow-lg"
                >
                    {currentIndex === activeQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        </div>
    );
}