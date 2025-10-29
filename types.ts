export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  NONE = 'none',
}

export interface User {
  uid: string;
  email: string | null;
  role: UserRole;
}

export interface Drive {
  id: string;
  companyName: string;
  role: string;
  description: string;
  date: string;
  logoUrl: string;
  applyUrl: string;
}

export interface RoadmapStep {
    title: string;
    description: string;
    resources: { name: string; url: string }[];
    completed: boolean;
}

export interface Roadmap {
    role: string;
    steps: RoadmapStep[];
}

export interface ResumeFeedback {
    atsScore: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export interface MockTestResult {
    id: string;
    topic: string;
    score: number;
    totalQuestions: number;
    date: string;
}

export interface Question {
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface StudentProfile {
    goalRole: string;
    goalCompanies: string[];
    skills: string[];
}

export interface InterviewQuestion {
    question: string;
    answer: string;
}