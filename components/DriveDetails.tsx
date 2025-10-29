import React from 'react';
import { Drive } from '../types';

interface DriveDetailsProps {
  drive: Drive;
  onBack: () => void;
  onPrepare: (company: { name: string; logo: string }) => void;
}

const DriveDetails: React.FC<DriveDetailsProps> = ({ drive, onBack, onPrepare }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        &larr; Back to All Drives
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
            <img src={drive.logoUrl} alt={`${drive.companyName} logo`} className="w-16 h-16 mr-6 mb-4 sm:mb-0 object-contain" />
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{drive.role}</h2>
              <p className="text-xl text-gray-600">{drive.companyName}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Job Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{drive.description}</p>
          </div>
        </div>
        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-gray-600 font-medium">
            <span className="font-bold">Date Posted:</span> {drive.date}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => onPrepare({ name: drive.companyName, logo: drive.logoUrl })}
              className="px-6 py-3 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition-colors duration-200"
            >
              Start Preparation
            </button>
            <a
              href={drive.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveDetails;
