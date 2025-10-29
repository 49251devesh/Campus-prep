import React, { useState, useEffect } from 'react';
import { UserRole, Drive, Roadmap, MockTestResult, StudentProfile, User } from './types';
import { generateRoadmap } from './services/geminiService';
import * as db from './services/firebaseService'; // Simulated Firebase service
import AuthForm from './components/AuthForm';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import PersonalizationSetup from './components/PersonalizationSetup';

const App = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [drives, setDrives] = useState<Drive[]>([]);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [mockTestHistory, setMockTestHistory] = useState<MockTestResult[]>([]);
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    
    // UI states
    const [isPersonalizing, setIsPersonalizing] = useState(false);
    const [personalizationError, setPersonalizationError] = useState<string | null>(null);
    const [isAddingRoadmap, setIsAddingRoadmap] = useState(false);
    const [addRoadmapError, setAddRoadmapError] = useState<string | null>(null);

    // Effect to listen for auth changes
    useEffect(() => {
        const unsubscribe = db.onAuthStateChangedListener(async (userAuth) => {
            if (userAuth) {
                // Fetch user-specific data
                const profile = await db.getUserProfile(userAuth.uid);
                if (profile) {
                    setStudentProfile(profile.profile || null);
                    setRoadmaps(profile.roadmaps || []);
                    setMockTestHistory(profile.mockTests || []);
                }
                setCurrentUser(userAuth);
            } else {
                setCurrentUser(null);
                // Clear user data on logout
                setStudentProfile(null);
                setRoadmaps([]);
                setMockTestHistory([]);
            }
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    // Effect to fetch global data (drives)
    useEffect(() => {
        const fetchDrives = async () => {
            const fetchedDrives = await db.getDrives();
            setDrives(fetchedDrives);
        };
        fetchDrives();
    }, []);

    const handleLogout = async () => {
        await db.signOutUser();
    };

    const addDrive = async (driveData: Omit<Drive, 'id' | 'logoUrl'>) => {
        const newDrive = await db.addDriveToDb(driveData);
        setDrives(prevDrives => [newDrive, ...prevDrives]);
    };

    const deleteDrive = async (driveId: string) => {
        await db.deleteDriveFromDb(driveId);
        setDrives(prev => prev.filter(d => d.id !== driveId));
    };

    const addMockTestResult = async (result: { topic: string; score: number; totalQuestions: number; }) => {
        if (!currentUser) return;
        const newResult = await db.addMockTestResultToDb(currentUser.uid, result);
        setMockTestHistory(prev => [newResult, ...prev]);
    };
    
    const updateRoadmaps = async (updatedRoadmaps: Roadmap[]) => {
        if (!currentUser) return;
        await db.updateUserRoadmaps(currentUser.uid, updatedRoadmaps);
        setRoadmaps(updatedRoadmaps);
    }

    const handlePersonalizationSave = async (profile: StudentProfile) => {
        if (!currentUser) return;
        setIsPersonalizing(true);
        setPersonalizationError(null);
        try {
            const newRoadmap = await generateRoadmap(profile.goalRole);
            const initialRoadmaps = [newRoadmap];
            await db.updateUserProfile(currentUser.uid, { profile, roadmaps: initialRoadmaps });
            setRoadmaps(initialRoadmaps);
            setStudentProfile(profile);
        } catch (error) {
            setPersonalizationError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsPersonalizing(false);
        }
    };

    const handleAddRoadmap = async (roleName: string) => {
        if (!currentUser) return;
        if (roadmaps.some(r => r.role.toLowerCase() === roleName.toLowerCase())) {
            setAddRoadmapError(`A roadmap for "${roleName}" already exists.`);
            setTimeout(() => setAddRoadmapError(null), 4000);
            return;
        }

        setIsAddingRoadmap(true);
        setAddRoadmapError(null);
        try {
            const newRoadmap = await generateRoadmap(roleName);
            const updatedRoadmaps = [newRoadmap, ...roadmaps];
            await db.updateUserRoadmaps(currentUser.uid, updatedRoadmaps);
            setRoadmaps(updatedRoadmaps);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setAddRoadmapError(errorMessage);
        } finally {
            setIsAddingRoadmap(false);
        }
    };

    const handleDeleteRoadmap = async (roleNameToDelete: string) => {
        if (!currentUser) return;
        const updatedRoadmaps = roadmaps.filter(r => r.role !== roleNameToDelete);
        await db.updateUserRoadmaps(currentUser.uid, updatedRoadmaps);
        setRoadmaps(updatedRoadmaps);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-600"></div>
            </div>
        );
    }
    
    if (!currentUser) {
        return <AuthForm />;
    }

    switch (currentUser.role) {
        case UserRole.STUDENT:
            if (!studentProfile) {
                return <PersonalizationSetup 
                            onSave={handlePersonalizationSave}
                            isLoading={isPersonalizing}
                            error={personalizationError} 
                        />;
            }
            return <StudentDashboard 
                        studentProfile={studentProfile}
                        drives={drives} 
                        onLogout={handleLogout}
                        roadmaps={roadmaps}
                        onRoadmapsChange={updateRoadmaps}
                        mockTestHistory={mockTestHistory}
                        onTestComplete={addMockTestResult} 
                        onAddRoadmap={handleAddRoadmap}
                        onDeleteRoadmap={handleDeleteRoadmap}
                        isAddingRoadmap={isAddingRoadmap}
                        addRoadmapError={addRoadmapError}
                    />;
        case UserRole.ADMIN:
            return <AdminDashboard drives={drives} addDrive={addDrive} deleteDrive={deleteDrive} onLogout={handleLogout} />;
        default:
            return <AuthForm />;
    }
};

export default App;