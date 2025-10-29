import React, { useState } from 'react';
import { generateInterviewQuestions } from '../services/geminiService';
import { InterviewQuestion } from '../types';

// A simple loading spinner
const LoadingSpinner = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce"></div>
    </div>
);

// List of popular companies
const popularCompanies = [
    { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.svg' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Adobe_Corporate_logo.svg' },
    { name: 'Salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg' },
];

const interviewRounds = ['Aptitude & Logical Reasoning', 'Technical Round 1', 'Technical Round 2', 'HR Round'];

interface InterviewPrepProps {
    initialCompany?: { name: string; logo: string } | null;
    onBackToCompanies: () => void;
}


const InterviewPrep: React.FC<InterviewPrepProps> = ({ initialCompany, onBackToCompanies }) => {
    const [selectedCompany, setSelectedCompany] = useState<{ name: string; logo: string } | null>(initialCompany || null);
    const [activeRound, setActiveRound] = useState(interviewRounds[0]);
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(null);

    React.useEffect(() => {
        if (initialCompany && initialCompany.name !== selectedCompany?.name) {
            setSelectedCompany(initialCompany);
            const initialRound = interviewRounds[0];
            setActiveRound(initialRound);
            fetchQuestions(initialCompany.name, initialRound);
        }
    }, [initialCompany]);

    const handleCompanySelect = (company: { name: string; logo: string }) => {
        setSelectedCompany(company);
        const initialRound = interviewRounds[0];
        setActiveRound(initialRound);
        fetchQuestions(company.name, initialRound);
    };

    const handleRoundChange = (round: string) => {
        setActiveRound(round);
        if (selectedCompany) {
            fetchQuestions(selectedCompany.name, round);
        }
    };
    
    const handleBack = () => {
        setSelectedCompany(null);
        setSearchQuery('');
        onBackToCompanies();
    };

    const fetchQuestions = async (companyName: string, round: string) => {
        setIsLoading(true);
        setError(null);
        setQuestions([]);
        setOpenQuestionIndex(null);
        try {
            const result = await generateInterviewQuestions(companyName, round);
            setQuestions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleQuestion = (index: number) => {
        setOpenQuestionIndex(openQuestionIndex === index ? null : index);
    };

    if (selectedCompany) {
        return (
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={handleBack}
                    className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    &larr; Back to Companies
                </button>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center">
                    <img src={selectedCompany.logo} alt={`${selectedCompany.name} logo`} className="h-12 w-auto mr-4 object-contain"/>
                    <h2 className="text-3xl font-bold text-gray-800">{selectedCompany.name} Interview Prep</h2>
                </div>
                
                <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
                    {interviewRounds.map(round => (
                        <button
                            key={round}
                            onClick={() => handleRoundChange(round)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${activeRound === round ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {round}
                        </button>
                    ))}
                </div>

                {isLoading && (
                     <div className="flex flex-col items-center justify-center h-64 text-center text-gray-600">
                        <LoadingSpinner />
                        <p className="mt-4 font-semibold">Generating questions for {activeRound}...</p>
                    </div>
                )}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}

                {!isLoading && !error && (
                    <div className="space-y-4">
                        {questions.map((q, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => toggleQuestion(index)}
                                    className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                                >
                                    <p className="font-semibold text-lg text-gray-800">{q.question}</p>
                                    <span className={`transform transition-transform duration-200 ${openQuestionIndex === index ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>
                                {openQuestionIndex === index && (
                                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                                        <h4 className="font-semibold text-gray-700 mb-2">Ideal Answer:</h4>
                                        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">{q.answer}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const filteredCompanies = popularCompanies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Company-Wise Interview Prep</h2>
                <p className="mt-2 text-lg text-gray-600">Select a company to start preparing with AI-generated questions for each interview round.</p>
            </div>
            
             <div className="max-w-lg mx-auto mb-8">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search for a company..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCompanies.map(company => (
                    <button
                        key={company.name}
                        onClick={() => handleCompanySelect(company)}
                        className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center space-y-4"
                    >
                        <img src={company.logo} alt={`${company.name} logo`} className="h-16 object-contain"/>
                        <p className="text-lg font-semibold text-gray-700">{company.name}</p>
                    </button>
                ))}
            </div>

             {filteredCompanies.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg shadow-md col-span-full">
                    <h3 className="text-2xl font-semibold text-gray-700">No Companies Found</h3>
                    <p className="mt-2 text-gray-500">Try adjusting your search query.</p>
                </div>
            )}
        </div>
    );
};

export default InterviewPrep;
