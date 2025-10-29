import React, { useState } from 'react';
import { analyzeResume } from '../services/geminiService';
import { ResumeFeedback } from '../types';
import { DocumentTextIcon, UploadCloudIcon, FileIcon, TrashIcon } from './icons';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce"></div>
    </div>
);

const FeedbackSection: React.FC<{ title: string; items: string[]; color: string; }> = ({ title, items, color }) => (
    <div>
        <h3 className={`text-xl font-semibold mb-3 ${color}`}>{title}</h3>
        <ul className="space-y-2 list-disc list-inside text-gray-700">
            {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    </div>
);

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            if (result) {
                resolve(result);
            } else {
                reject(new Error("Failed to read file as base64."));
            }
        };
        reader.onerror = (error) => reject(error);
    });


const ResumeAnalyzer = () => {
    const [resumeText, setResumeText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [feedback, setFeedback] = useState<ResumeFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile) {
            setFile(selectedFile);
            setResumeText(''); // Clear text input when a file is selected
            setError(null);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResumeText(e.target.value);
        if (file) {
            setFile(null); // Clear file input when text is typed
        }
    };
    
    const handleAnalyze = async () => {
        if (!file && !resumeText.trim()) {
            setError("Please upload your resume file or paste its content.");
            return;
        }
        setError(null);
        setIsLoading(true);
        setFeedback(null);
        try {
            let result;
            if (file) {
                const base64Data = await fileToBase64(file);
                result = await analyzeResume({ file: { base64Data, mimeType: file.type } });
            } else {
                result = await analyzeResume({ text: resumeText });
            }
            setFeedback(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Input Section */}
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">AI Resume Analyzer</h2>
                <p className="text-gray-600">Upload your resume file (PDF, DOCX, TXT) or paste the content below to get instant feedback.</p>

                <div>
                    <input
                        type="file"
                        id="resume-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                    />
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                    >
                       {!file ? (
                            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                                <UploadCloudIcon className="w-12 h-12 text-gray-400 mb-2"/>
                                <span className="font-semibold text-indigo-600">Click to upload</span>
                                <span className="text-gray-500"> or drag and drop</span>
                                <span className="text-xs text-gray-400 mt-2">PDF, DOCX, or TXT</span>
                            </label>
                        ) : (
                            <div className="flex flex-col items-center">
                                <FileIcon className="w-12 h-12 text-green-500 mb-2" />
                                <p className="font-semibold text-gray-700 break-all">{file.name}</p>
                                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    onClick={() => setFile(null)}
                                    className="mt-2 text-sm text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                                >
                                    <TrashIcon className="w-4 h-4" /> Remove
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">OR</span>
                    </div>
                </div>

                <textarea
                    value={resumeText}
                    onChange={handleTextChange}
                    placeholder="Paste your full resume text here..."
                    className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isLoading ? <LoadingSpinner /> : 'Analyze My Resume'}
                </button>
            </div>
            {/* Feedback Section */}
            <div className="bg-white p-6 rounded-lg shadow-md min-h-[500px]">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Analysis & Feedback</h2>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}
                
                {isLoading && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-600">
                        <LoadingSpinner />
                        <p className="mt-4 font-semibold">Analyzing your resume...</p>
                        <p className="text-sm">This may take a moment.</p>
                    </div>
                )}

                {!isLoading && !feedback && !error && (
                     <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <DocumentTextIcon className="w-16 h-16 text-gray-300 mb-4" />
                        <p>Your feedback will appear here once you analyze your resume.</p>
                    </div>
                )}

                {feedback && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-lg font-medium text-gray-600">ATS Compatibility Score</p>
                            <p className={`text-6xl font-bold ${feedback.atsScore > 80 ? 'text-green-500' : feedback.atsScore > 60 ? 'text-yellow-500' : 'text-red-500'}`}>{feedback.atsScore}<span className="text-3xl text-gray-400">/100</span></p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FeedbackSection title="✅ Strengths" items={feedback.strengths} color="text-green-600" />
                            <FeedbackSection title="❌ Weaknesses" items={feedback.weaknesses} color="text-red-600" />
                        </div>
                        <div>
                             <FeedbackSection title="💡 Suggestions for Improvement" items={feedback.suggestions} color="text-indigo-600" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeAnalyzer;