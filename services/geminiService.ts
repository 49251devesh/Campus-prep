import { GoogleGenAI, Type } from "@google/genai";
import { ResumeFeedback, Question, Roadmap, InterviewQuestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const resumeFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        atsScore: {
            type: Type.INTEGER,
            description: "An Applicant Tracking System (ATS) score out of 100 for the resume. Higher is better."
        },
        strengths: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A key strength of the resume."
            },
            description: "A list of 3-4 key strengths of the resume."
        },
        weaknesses: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A key weakness or area for improvement in the resume."
            },
            description: "A list of 3-4 key weaknesses of the resume."
        },
        suggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A specific, actionable suggestion to improve the resume."
            },
            description: "A list of 3-4 actionable suggestions to improve the resume."
        }
    },
    required: ["atsScore", "strengths", "weaknesses", "suggestions"]
};

// Helper to clean up Gemini's JSON response
const cleanJsonString = (jsonString: string): string => {
    // Gemini can sometimes wrap the JSON in ```json ... ```
    return jsonString.trim().replace(/^```json/, '').replace(/```$/, '').trim();
}


export const analyzeResume = async (input: { text?: string; file?: { base64Data: string; mimeType: string } }): Promise<ResumeFeedback> => {
    try {
        let requestContents: any;

        if (input.file) {
            const prompt = "Analyze the following resume file and provide feedback. Act as an expert tech recruiter and career coach. Be critical but constructive. Evaluate it for clarity, impact, and keyword optimization for an Applicant Tracking System (ATS).";
            requestContents = {
                parts: [
                    { text: prompt },
                    { inlineData: { data: input.file.base64Data, mimeType: input.file.mimeType } }
                ]
            };
        } else {
             const prompt = `Analyze the following resume text and provide feedback. Act as an expert tech recruiter and career coach. Be critical but constructive. Evaluate it for clarity, impact, and keyword optimization for an Applicant Tracking System (ATS).

            Resume Text:
            ---
            ${input.text}
            ---
            `;
            requestContents = prompt;
        }


        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: requestContents,
            config: {
                responseMimeType: "application/json",
                responseSchema: resumeFeedbackSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = cleanJsonString(response.text);
        const feedback = JSON.parse(jsonText);

        // Basic validation
        if (typeof feedback.atsScore !== 'number' || !Array.isArray(feedback.strengths)) {
            throw new Error("Invalid response format from API");
        }

        return feedback as ResumeFeedback;

    } catch (error) {
        console.error("Error analyzing resume:", error);
        throw new Error("Failed to get feedback from AI. Please check the resume content or file type and try again.");
    }
};

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        questionText: { type: Type.STRING, description: "The text of the multiple-choice question." },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 4 strings representing the possible answers."
        },
        correctAnswer: { type: Type.STRING, description: "The string of the correct answer from the options array." },
        explanation: { type: Type.STRING, description: "A brief but clear explanation of why the correct answer is right." }
    },
    required: ["questionText", "options", "correctAnswer", "explanation"]
};

const mockTestSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: questionSchema
        }
    },
    required: ["questions"]
}


export const generateMockTest = async (topic: string, difficulty: string, numQuestions: number, description: string): Promise<Question[]> => {
    try {
        const prompt = `Create a multiple-choice mock test for a college student preparing for placements.
            
            Topic: ${topic}
            Difficulty: ${difficulty}
            Number of Questions: ${numQuestions}
            ${description ? `\nTest Description: ${description}` : ''}

            Instructions:
            1.  Generate exactly ${numQuestions} questions.
            2.  Each question must have exactly 4 options.
            3.  Ensure the questions are relevant to the topic, difficulty level, and description provided.
            4.  Provide a clear explanation for each correct answer.
            `;
            
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: mockTestSchema,
                temperature: 0.7,
            },
        });

        const jsonText = cleanJsonString(response.text);
        const testData = JSON.parse(jsonText);

        if (!testData.questions || !Array.isArray(testData.questions)) {
             throw new Error("Invalid test format from API");
        }

        return testData.questions as Question[];

    } catch (error) {
        console.error("Error generating mock test:", error);
        throw new Error("Failed to generate the mock test. The topic might be too specific or there was an issue with the AI service. Please try again.");
    }
};

const resourceSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The descriptive name of the online resource." },
        url: { type: Type.STRING, description: "The full URL to the resource." }
    },
    required: ["name", "url"]
};

const roadmapStepSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A concise, actionable title for this step." },
        description: { type: Type.STRING, description: "A detailed description of what the student needs to learn or accomplish in this step." },
        resources: {
            type: Type.ARRAY,
            items: resourceSchema,
            description: "A list of 2-3 relevant online resources to help with this step."
        }
    },
    required: ["title", "description", "resources"]
};

const roadmapSchema = {
    type: Type.OBJECT,
    properties: {
        role: { type: Type.STRING, description: "The job role this roadmap is for." },
        steps: {
            type: Type.ARRAY,
            items: roadmapStepSchema,
            description: "A list of 4 to 6 steps that make up the roadmap."
        }
    },
    required: ["role", "steps"]
};

export const generateRoadmap = async (role: string): Promise<Roadmap> => {
    try {
        const prompt = `Act as an expert career coach for college students. Generate a detailed, step-by-step roadmap for a student preparing for a "${role}" role in the tech industry.
        
        Instructions:
        1. The 'role' in the response should exactly match the provided role: "${role}".
        2. Generate between 4 and 6 distinct, logical steps for the roadmap.
        3. For each step, provide a clear 'title', a helpful 'description', and a list of 2-3 real, high-quality online 'resources'.
        4. Ensure the resource URLs are valid and directly relevant to the step's content.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: roadmapSchema,
                temperature: 0.6,
            },
        });

        const jsonText = cleanJsonString(response.text);
        const roadmapData = JSON.parse(jsonText);

        if (!roadmapData.role || !Array.isArray(roadmapData.steps)) {
            throw new Error("Invalid roadmap format from API");
        }
        
        // Add the 'completed' property to each step, as it's not in the AI response
        const roadmapWithCompletion = {
            ...roadmapData,
            steps: roadmapData.steps.map((step: any) => ({ ...step, completed: false }))
        };

        return roadmapWithCompletion as Roadmap;

    } catch (error) {
        console.error("Error generating roadmap:", error);
        throw new Error(`Failed to generate a roadmap for "${role}". The AI service may be temporarily unavailable or the role might be too niche. Please try again.`);
    }
};


const interviewQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING, description: "The interview question text." },
        answer: { type: Type.STRING, description: "A detailed, ideal answer for the interview question, formatted nicely (e.g., with bullet points if needed)." }
    },
    required: ["question", "answer"]
};

const interviewPrepSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: interviewQuestionSchema,
            description: "A list of 5 to 7 interview questions."
        }
    },
    required: ["questions"]
}

export const generateInterviewQuestions = async (companyName: string, interviewRound: string): Promise<InterviewQuestion[]> => {
    try {
        const prompt = `Act as a senior hiring manager at ${companyName}.
        Generate a list of 5 to 7 realistic interview questions for a college student applying for a tech role (like Software Engineer or Data Analyst) during the "${interviewRound}" round.
        
        For each question, provide a detailed, well-explained ideal answer. The answer should guide the student on how to structure their response, what key points to hit, and what demonstrates a strong candidate.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewPrepSchema,
                temperature: 0.7,
            },
        });

        const jsonText = cleanJsonString(response.text);
        const data = JSON.parse(jsonText);

        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error("Invalid question format from API");
        }

        return data.questions as InterviewQuestion[];

    } catch (error) {
        console.error("Error generating interview questions:", error);
        throw new Error(`Failed to generate interview questions for ${companyName}. The AI service may be temporarily unavailable. Please try again.`);
    }
};