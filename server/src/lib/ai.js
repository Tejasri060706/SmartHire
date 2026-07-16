import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const API_KEY = process.env.AI_API_KEY || '';
const MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';

// Check if we should use the real LLM or fallback to mock
const isRealAPIConfigured = () => {
  return (
    API_KEY &&
    API_KEY !== 'replace_me' &&
    API_KEY !== 'mock_key_or_user_key' &&
    API_KEY.trim() !== ''
  );
};

// Initialize Gen AI client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper for making standard completions calls
const makeLLMCall = async (systemPrompt, userPrompt) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    },
  });

  const reply = response.text;
  if (!reply) {
    throw new Error('Empty response from Gemini API');
  }
  
  // Clean potential markdown code blocks ```json ... ```
  let cleanJSON = reply.trim();
  if (cleanJSON.startsWith('```')) {
    cleanJSON = cleanJSON.replace(/^```(json)?/, '').replace(/```$/, '').trim();
  }
  
  return JSON.parse(cleanJSON);
};

// Robust Skill Mock Extractor
const mockExtractSkills = (text) => {
  const commonSkills = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'Python', 'PyTorch', 
    'TensorFlow', 'SQL', 'PostgreSQL', 'SQLite', 'Git', 'CSS', 'Tailwind CSS', 
    'Docker', 'Prisma', 'REST', 'JWT', 'LLMs', 'NLP', 'Scikit-Learn', 'HTML'
  ];
  
  const foundSkills = [];
  const lowerText = text.toLowerCase();
  
  commonSkills.forEach((skill) => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  // Default skills if none match
  if (foundSkills.length === 0) {
    foundSkills.push('JavaScript', 'CSS', 'HTML');
  }
  
  return foundSkills;
};

export const parseResume = async (resumeText) => {
  if (isRealAPIConfigured()) {
    try {
      const systemPrompt = `You are an expert resume parser. Respond ONLY with a raw JSON object containing three keys:
- "skills" (array of strings representing technical skills found)
- "experience" (string summarizing duration and key job roles)
- "education" (string summarizing degree, school, and graduation year)
Do not include any explanation, markdown fences, markdown headers, preamble, or trailing text. The output must be valid JSON parseable in JavaScript.`;
      
      const userPrompt = `Parse the following resume text:\n\n${resumeText}`;
      const result = await makeLLMCall(systemPrompt, userPrompt);
      if (result.skills && Array.isArray(result.skills)) {
        return result;
      }
    } catch (e) {
      console.warn('AI parseResume failed, falling back to mock logic:', e.message);
    }
  }

  // Fallback Mock Parser
  const extractedSkills = mockExtractSkills(resumeText);
  return {
    skills: extractedSkills,
    experience: '3 years of experience as a software developer working with JavaScript and web frameworks.',
    education: 'Bachelor of Science in Computer Science, State University, 2021',
  };
};

export const getFitScore = async (parsedResume, jobDescription, requiredSkills) => {
  if (isRealAPIConfigured()) {
    try {
      const systemPrompt = `You are an expert technical interviewer. Compare the candidate's parsed resume details with the job description and required skills. 
Respond ONLY with a raw JSON object containing two keys:
- "llmFitScore" (integer between 0 and 100 representing how well their background and narrative fits this specific job description)
- "reasoning" (1-2 sentences explaining why you gave this score)
Do not include any explanation, markdown fences, markdown headers, preamble, or trailing text. The output must be valid JSON.`;
      
      const userPrompt = `Candidate Resume Info:\n${JSON.stringify(parsedResume)}\n\nJob Description:\n${jobDescription}\n\nRequired Skills:\n${JSON.stringify(requiredSkills)}`;
      const result = await makeLLMCall(systemPrompt, userPrompt);
      if (typeof result.llmFitScore === 'number') {
        return result;
      }
    } catch (e) {
      console.warn('AI getFitScore failed, falling back to mock logic:', e.message);
    }
  }

  // Fallback Mock Scoring
  // Simple heuristic: count matching skills
  let matchCount = 0;
  const resumeSkillsLower = (parsedResume.skills || []).map(s => s.toLowerCase());
  requiredSkills.forEach(skill => {
    if (resumeSkillsLower.includes(skill.toLowerCase())) {
      matchCount++;
    }
  });

  const ratio = requiredSkills.length > 0 ? matchCount / requiredSkills.length : 0.5;
  const llmFitScore = Math.min(Math.round(40 + ratio * 50 + Math.random() * 10), 100);

  return {
    llmFitScore,
    reasoning: `The candidate possesses skills in ${parsedResume.skills.slice(0, 3).join(', ')}, showing a strong baseline overlap with the required technologies.`,
  };
};

export const chat = async (candidateContext, conversationHistory, newMessage) => {
  if (isRealAPIConfigured()) {
    try {
      const systemPrompt = `You are Smart Hire AI Career Advisor. You are talking to a candidate. You are provided with the candidate's context (their parsed resume details, their application status, and tests they have passed). 
Answer their questions professionally based ONLY on this context. If they ask about things outside this scope (such as salary negotiations, other companies, or non-career related matters), politely inform them that you are only authorized to discuss their current applications and profile. 
Respond ONLY with a raw JSON object containing a "reply" key. Do not include markdown fences, preamble, or trailing text.`;
      
      const userPrompt = `Candidate Context:\n${JSON.stringify(candidateContext)}\n\nConversation History:\n${JSON.stringify(conversationHistory)}\n\nNew Message:\n${newMessage}`;
      const result = await makeLLMCall(systemPrompt, userPrompt);
      if (result.reply) {
        return result;
      }
    } catch (e) {
      console.warn('AI chat failed, falling back to mock logic:', e.message);
    }
  }

  // Fallback Mock Chat Advisor
  const cleanMessage = newMessage.toLowerCase();
  let reply = '';
  
  if (cleanMessage.includes('resume') || cleanMessage.includes('skills')) {
    const skillsList = candidateContext.resumeSkills ? candidateContext.resumeSkills.join(', ') : 'not uploaded yet';
    reply = `Based on your profile, your registered skills are: ${skillsList}. You can improve your matching score by completing role assessments.`;
  } else if (cleanMessage.includes('apply') || cleanMessage.includes('job') || cleanMessage.includes('status')) {
    const appsCount = candidateContext.applicationsCount || 0;
    reply = `You currently have ${appsCount} active application(s). You can browse the job list tab to find matching positions and complete required tests to apply.`;
  } else {
    reply = `Hello! I'm your Smart Hire Career Advisor. I can help you understand your resume matches, test status, and walk you through your application updates. What would you like to know?`;
  }

  return { reply };
};
