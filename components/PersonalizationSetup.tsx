import React, { useState } from 'react';
import { StudentProfile } from '../types';

interface PersonalizationSetupProps {
  onSave: (profile: StudentProfile) => void;
  isLoading: boolean;
  error: string | null;
}

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const PersonalizationSetup: React.FC<PersonalizationSetupProps> = ({ onSave, isLoading, error }) => {
    const [goalRole, setGoalRole] = useState('');
    const [goalCompanies, setGoalCompanies] = useState('');
    const [skills, setSkills] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalRole.trim() || isLoading) return;

        const profile: StudentProfile = {
            goalRole,
            goalCompanies: goalCompanies.split(',').map(s => s.trim()).filter(Boolean),
            skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        };
        onSave(profile);
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Let's Personalize Your Journey</h1>
            <p className="mt-2 text-md text-gray-500">Tell us your goals. This will help us tailor your preparation experience.</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="goalRole" className="block text-sm font-medium text-gray-700 mb-1">
                What is your target role? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="goalRole"
                value={goalRole}
                onChange={e => setGoalRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                required
                placeholder="e.g., Software Engineer, Data Analyst"
              />
            </div>

            <div>
              <label htmlFor="goalCompanies" className="block text-sm font-medium text-gray-700 mb-1">
                What are your dream companies?
              </label>
              <input
                type="text"
                id="goalCompanies"
                value={goalCompanies}
                onChange={e => setGoalCompanies(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Google, Microsoft, Amazon (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">Separate company names with a comma.</p>
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                What skills do you want to focus on?
              </label>
              <input
                type="text"
                id="skills"
                value={skills}
                onChange={e => setSkills(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., React, Python, System Design (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">Separate skills with a comma.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                  <>
                    <LoadingSpinner />
                    Generating Your Roadmap...
                  </>
              ) : (
                'Get Started'
              )}
            </button>
          </form>
        </div>
      </div>
    );
};

export default PersonalizationSetup;