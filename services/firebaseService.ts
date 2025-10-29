import { UserRole, User, Drive, StudentProfile, Roadmap, MockTestResult } from '../types';

// --- SIMULATED FIREBASE/DATABASE SERVICE ---
// This service uses localStorage to mimic a persistent database.
// In a real application, these functions would make calls to Firebase Auth and Firestore.

// --- INITIAL MOCK DATA ---
const initialDrives: Drive[] = [
    { id: '1', companyName: 'Google', role: 'Software Engineer Intern', description: 'Join our team...', date: '2024-09-15', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', applyUrl: '#' },
    { id: '2', companyName: 'Microsoft', role: 'Data Analyst', description: 'Analyze large datasets...', date: '2024-09-20', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', applyUrl: '#' },
    { id: '3', companyName: 'Amazon', role: 'Cloud Support Associate', description: 'Provide technical support...', date: '2024-09-22', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', applyUrl: '#' },
];

const DB_KEY = 'campusprep_db';
const AUTH_SESSION_KEY = 'campusprep_auth_session';

interface Database {
    users: Record<string, {
        profile: StudentProfile | null;
        roadmaps: Roadmap[];
        mockTests: MockTestResult[];
        auth: { email: string; passwordHash: string; role: UserRole }
    }>;
    drives: Drive[];
}

const initializeDb = () => {
    const dbString = localStorage.getItem(DB_KEY);
    if (!dbString) {
        const defaultDb: Database = {
            users: {},
            drives: initialDrives,
        };
        localStorage.setItem(DB_KEY, JSON.stringify(defaultDb));
    }
};

initializeDb();

const getDb = (): Database => JSON.parse(localStorage.getItem(DB_KEY) || '{}');
const saveDb = (db: Database) => localStorage.setItem(DB_KEY, JSON.stringify(db));

// --- AUTHENTICATION FUNCTIONS ---

export const signUpWithEmailPassword = async (email: string, password: string): Promise<User> => {
    const db = getDb();
    const lcEmail = email.toLowerCase();
    
    // Check if user exists
    const existingUser = Object.values(db.users).find(u => u.auth.email === lcEmail);
    if (existingUser) {
        throw new Error("An account with this email already exists.");
    }
    
    const uid = `user_${Date.now()}`;
    db.users[uid] = {
        profile: null,
        roadmaps: [],
        mockTests: [],
        auth: { email: lcEmail, passwordHash: password, role: UserRole.STUDENT } // In real app, hash the password
    };
    saveDb(db);

    const user: User = { uid, email, role: UserRole.STUDENT };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    
    // Notify listeners
    _authChangeCallback?.(user);

    return user;
};

export const signInWithEmailPassword = async (email: string, password: string): Promise<User> => {
    const db = getDb();
    const lcEmail = email.toLowerCase();
    
    const userEntry = Object.entries(db.users).find(([_, u]) => u.auth.email === lcEmail);
    if (!userEntry) {
        throw new Error("Invalid credentials. Please check your email and password.");
    }

    const [uid, userData] = userEntry;
    if (userData.auth.passwordHash !== password) { // In real app, compare hashes
        throw new Error("Invalid credentials. Please check your email and password.");
    }

    const user: User = { uid, email, role: userData.auth.role };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));

    _authChangeCallback?.(user);
    return user;
};

export const signInAsAdmin = async (): Promise<User> => {
    const adminUser: User = { uid: 'admin_user', email: 'admin@campus.edu', role: UserRole.ADMIN };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(adminUser));
    _authChangeCallback?.(adminUser);
    return adminUser;
}

export const signOutUser = async (): Promise<void> => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    _authChangeCallback?.(null);
};

// Listener to mimic onAuthStateChanged
let _authChangeCallback: ((user: User | null) => void) | null = null;
export const onAuthStateChangedListener = (callback: (user: User | null) => void): (() => void) => {
    _authChangeCallback = callback;
    // Immediately call with current session state
    const sessionUser = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY) || 'null');
    callback(sessionUser);
    
    // Return unsubscribe function
    return () => { _authChangeCallback = null; };
};

// --- DATABASE (FIRESTORE) FUNCTIONS ---

export const getUserProfile = async (uid: string) => {
    if (uid === 'admin_user') return null; // Admins don't have profiles
    const db = getDb();
    return db.users[uid] || null;
};

export const updateUserProfile = async (uid: string, data: { profile: StudentProfile; roadmaps: Roadmap[] }) => {
    const db = getDb();
    if (db.users[uid]) {
        db.users[uid].profile = data.profile;
        db.users[uid].roadmaps = data.roadmaps;
        saveDb(db);
    }
};

export const updateUserRoadmaps = async (uid: string, roadmaps: Roadmap[]) => {
    const db = getDb();
    if (db.users[uid]) {
        db.users[uid].roadmaps = roadmaps;
        saveDb(db);
    }
};

export const addMockTestResultToDb = async (uid: string, result: { topic: string; score: number; totalQuestions: number; }): Promise<MockTestResult> => {
    const db = getDb();
    const newResult: MockTestResult = {
        id: `test_${Date.now()}`,
        date: new Date().toLocaleDateString(),
        ...result,
    };
    if (db.users[uid]) {
        db.users[uid].mockTests.unshift(newResult);
        saveDb(db);
    }
    return newResult;
};

export const getDrives = async (): Promise<Drive[]> => {
    const db = getDb();
    return db.drives || [];
};

export const addDriveToDb = async (driveData: Omit<Drive, 'id' | 'logoUrl'>): Promise<Drive> => {
    const db = getDb();
    const companyDomain = driveData.companyName.toLowerCase().replace(/\s/g, '');
    const newDrive: Drive = {
        ...driveData,
        id: `drive_${Date.now()}`,
        logoUrl: `https://logo.clearbit.com/${companyDomain}.com`,
    };
    db.drives.unshift(newDrive);
    saveDb(db);
    return newDrive;
};

export const deleteDriveFromDb = async (driveId: string): Promise<void> => {
    const db = getDb();
    db.drives = db.drives.filter(d => d.id !== driveId);
    saveDb(db);
};
