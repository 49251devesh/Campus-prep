import React, { useState } from 'react';
import { UserRole, Drive, Roadmap, MockTestResult, StudentProfile } from '../types';
import Layout from './Layout';
import AnalyticsCard from './AnalyticsCard';
import DrivesList from './DrivesList';
import Roadmaps from './Roadmaps';
import ResumeAnalyzer from './ResumeAnalyzer';
import MockTestGenerator from './MockTestGenerator';
import InterviewPrep from './InterviewPrep';
import DriveDetails from './DriveDetails';
import { BriefcaseIcon, ChartBarIcon, DocumentTextIcon, PencilSquareIcon, CheckCircleIcon } from './icons';


interface StudentDashboardProps {
  studentProfile: StudentProfile;
  drives: Drive[];
  onLogout: () => void;
  roadmaps: Roadmap[];
  onRoadmapsChange: (roadmaps: Roadmap[]) => void;
  mockTestHistory: MockTestResult[];
  onTestComplete: (result: { topic: string; score: number; totalQuestions: number; }) => void;
  onAddRoadmap: (roleName: string) => Promise<void>;
  onDeleteRoadmap: (roleName: string) => void;
  isAddingRoadmap: boolean;
  addRoadmapError: string | null;
}

const DashboardView: React.FC<{
    drives: Drive[],
    roadmaps: Roadmap[],
    mockTestHistory: MockTestResult[],
    studentProfile: StudentProfile,
    onViewDriveDetails: (driveId: string) => void;
}> = ({ drives, roadmaps, mockTestHistory, studentProfile, onViewDriveDetails }) => {
    const totalSteps = roadmaps.reduce((acc, r) => acc + r.steps.length, 0);
    const completedSteps = roadmaps.reduce((acc, r) => acc + r.steps.filter(s => s.completed).length, 0);
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800">Welcome, Student!</h2>
                <p className="text-gray-600 mt-1">
                    Let's get you ready for your dream role as a <span className="font-semibold text-indigo-600">{studentProfile.goalRole}</span>.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnalyticsCard title="Upcoming Drives" value={drives.length.toString()} icon={BriefcaseIcon} color="bg-blue-500" />
                <AnalyticsCard title="Applications" value="3" icon={DocumentTextIcon} color="bg-green-500" />
                <AnalyticsCard title="Roadmap Progress" value={`${progress}%`} icon={ChartBarIcon} color="bg-yellow-500" />
                <AnalyticsCard title="Mock Tests Taken" value={mockTestHistory.length.toString()} icon={PencilSquareIcon} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Recently Added Drives</h3>
                    <DrivesList drives={drives.slice(0, 3)} onDriveViewDetails={onViewDriveDetails}/>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Mock Tests</h3>
                    {mockTestHistory.length > 0 ? (
                        <ul className="space-y-4">
                            {mockTestHistory.slice(0, 4).map(test => (
                                <li key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <div className="flex items-center">
                                        <CheckCircleIcon className="w-6 h-6 mr-3 text-green-500" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{test.topic}</p>
                                            <p className="text-sm text-gray-500">{test.date}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-lg text-indigo-600">{test.score}/{test.totalQuestions}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">You haven't taken any mock tests yet.</p>
                            <p className="text-sm text-gray-400 mt-1">Go to the Mock Tests section to get started!</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Mock Test Progress</h3>
                {mockTestHistory.length > 0 ? (
                    <ul className="space-y-6">
                        {mockTestHistory.slice(0, 5).map(test => {
                            const percentage = test.totalQuestions > 0 ? Math.round((test.score / test.totalQuestions) * 100) : 0;
                            let barColor = 'bg-green-500';
                            if (percentage < 40) barColor = 'bg-red-500';
                            else if (percentage < 75) barColor = 'bg-yellow-500';

                            return (
                                <li key={test.id}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-800">{test.topic}</p>
                                            <p className="text-sm text-gray-500">{test.date}</p>
                                        </div>
                                        <p className="font-bold text-lg text-gray-700">{percentage}%</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${barColor} transition-all duration-500`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="font-semibold text-gray-600 w-24 text-right">{test.score} / {test.totalQuestions}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="text-center py-10">
                        <PencilSquareIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">Take some mock tests to see your progress here!</p>
                        <p className="text-sm text-gray-400 mt-1">Your performance trends will be visualized once you complete a test.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
    studentProfile, 
    drives, 
    onLogout, 
    roadmaps, 
    onRoadmapsChange, 
    mockTestHistory, 
    onTestComplete,
    onAddRoadmap,
    onDeleteRoadmap,
    isAddingRoadmap,
    addRoadmapError 
}) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
  const [prepCompany, setPrepCompany] = useState<{ name: string; logo: string } | null>(null);

  const handleViewChange = (view: string) => {
    setSelectedDriveId(null);
    setPrepCompany(null);
    setActiveView(view);
  };
  
  const handleViewDriveDetails = (driveId: string) => {
      setSelectedDriveId(driveId);
      setActiveView('drives');
  }

  const renderContent = () => {
    const selectedDrive = selectedDriveId ? drives.find(d => d.id === selectedDriveId) : null;

    switch (activeView) {
      case 'dashboard':
        return <DashboardView drives={drives} roadmaps={roadmaps} mockTestHistory={mockTestHistory} studentProfile={studentProfile} onViewDriveDetails={handleViewDriveDetails} />;
      case 'drives':
        if (selectedDrive) {
          return <DriveDetails
            drive={selectedDrive}
            onBack={() => setSelectedDriveId(null)}
            onPrepare={(company) => {
              setPrepCompany(company);
              setActiveView('interview-prep');
              setSelectedDriveId(null);
            }}
          />;
        }
        return <DrivesList drives={drives} onDriveViewDetails={setSelectedDriveId} />;
      case 'roadmaps':
        return <Roadmaps 
                    roadmapsData={roadmaps} 
                    onRoadmapsChange={onRoadmapsChange}
                    onAddRoadmap={onAddRoadmap}
                    onDeleteRoadmap={onDeleteRoadmap}
                    isAddingRoadmap={isAddingRoadmap}
                    addRoadmapError={addRoadmapError}
                />;
      case 'resume':
        return <ResumeAnalyzer />;
      case 'mock-tests':
        return <MockTestGenerator onTestComplete={onTestComplete} />;
      case 'interview-prep':
        return <InterviewPrep initialCompany={prepCompany} onBackToCompanies={() => setPrepCompany(null)} />;
      default:
        return <DashboardView drives={drives} roadmaps={roadmaps} mockTestHistory={mockTestHistory} studentProfile={studentProfile} onViewDriveDetails={handleViewDriveDetails} />;
    }
  };

  return (
    <Layout
      userRole={UserRole.STUDENT}
      activeView={activeView}
      setActiveView={handleViewChange}
      onLogout={onLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default StudentDashboard;
