import React, { useState } from 'react';
import { generateMockTest } from '../services/geminiService';
import { Question } from '../types';

type View = 'config' | 'taking-test' | 'results';

interface MockTestGeneratorProps {
    onTestComplete: (result: { topic: string; score: number; totalQuestions: number; }) => void;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce"></div>
    </div>
);

const MockTestGenerator: React.FC<MockTestGeneratorProps> = ({ onTestComplete }) => {
    const [view, setView] = useState<View>('config');
    const [topic, setTopic] = useState('Data Structures');
    const [difficulty, setDifficulty] = useState('Medium');
    const [numQuestions, setNumQuestions] = useState(5);
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        setError(null);
        try {
            const generatedQuestions = await generateMockTest(topic, difficulty, numQuestions, description);
            setQuestions(generatedQuestions);
            setUserAnswers({});
            setScore(0);
            setView('taking-test');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnswerSelect = (questionIndex: number, answer: string) => {
        setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmitTest = () => {
        let correctAnswers = 0;
        questions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswer) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        onTestComplete({
            topic: topic,
            score: correctAnswers,
            totalQuestions: questions.length
        });
        setView('results');
    };

    const handleReset = () => {
        setView('config');
        setQuestions([]);
        setUserAnswers({});
        setTopic('Data Structures');
        setDifficulty('Medium');
        setNumQuestions(5);
        setDescription('');
        setError(null);
    }
    
    if (view === 'config') {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Personalized Mock Test</h2>
                <p className="text-gray-600 mb-6">Configure your test and let our AI generate a personalized quiz for you.</p>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}
                <form onSubmit={handleGenerateTest} className="space-y-6">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Topic / Role</label>
                        <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" required placeholder="e.g., React, SQL, Aptitude" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Test Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Focus on React hooks and state management, or SQL joins and subqueries."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                            <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                             <select id="numQuestions" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500">
                                <option>5</option>
                                <option>10</option>
                                <option>15</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" disabled={isGenerating} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex justify-center items-center">
                        {isGenerating ? <LoadingSpinner /> : 'Generate Test'}
                    </button>
                </form>
            </div>
        );
    }

    if (view === 'taking-test') {
        return (
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{topic} Test ({difficulty})</h2>
                <div className="space-y-8">
                    {questions.map((q, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                            <p className="font-semibold text-lg text-gray-800 mb-4">{index + 1}. {q.questionText}</p>
                            <div className="space-y-3">
                                {q.options.map(option => (
                                    <label key={option} className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${userAnswers[index] === option ? 'bg-indigo-100 border-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name={`question-${index}`} value={option} checked={userAnswers[index] === option} onChange={() => handleAnswerSelect(index, option)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                        <span className="ml-3 text-gray-700">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={handleSubmitTest} className="mt-8 w-full bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700">
                    Submit Test
                </button>
            </div>
        )
    }

    if (view === 'results') {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-md text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Results</h2>
                    <p className="text-xl text-gray-600">You scored</p>
                    <p className="text-6xl font-extrabold text-indigo-600 my-2">{score} / {questions.length}</p>
                </div>

                <div className="space-y-6">
                    {questions.map((q, index) => {
                        const userAnswer = userAnswers[index];
                        const isCorrect = userAnswer === q.correctAnswer;
                        return (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: isCorrect ? '#22c55e' : '#ef4444' }}>
                                <p className="font-semibold text-lg text-gray-800 mb-4">{index + 1}. {q.questionText}</p>
                                <div className="space-y-2 mb-4">
                                    {q.options.map(option => {
                                        const isUserAnswer = userAnswer === option;
                                        const isCorrectAnswer = q.correctAnswer === option;
                                        let optionClass = "border-gray-200";
                                        if (isUserAnswer && !isCorrect) optionClass = "bg-red-100 border-red-300 text-red-800";
                                        if (isCorrectAnswer) optionClass = "bg-green-100 border-green-300 text-green-800";

                                        return (
                                            <div key={option} className={`p-3 rounded-md border ${optionClass}`}>
                                                {option}
                                            </div>
                                        )
                                    })}
                                </div>
                                {!isCorrect && <p className="text-sm text-red-700 mb-2">Your answer: {userAnswer || 'Not answered'}</p>}
                                <div className="bg-gray-100 p-3 rounded-md">
                                    <p className="font-semibold text-gray-800">Explanation:</p>
                                    <p className="text-gray-700">{q.explanation}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <button onClick={handleReset} className="mt-8 w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700">
                    Generate New Test
                </button>
            </div>
        )
    }
    
    return null;
}

export default MockTestGenerator;