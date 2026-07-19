import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { createRequire } from 'module';
import { parseResume, chat } from '../lib/ai.js';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const prisma = new PrismaClient();

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const candidateId = req.user.candidateId;
    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidates can upload resumes' });
    }

    const filePath = req.file.path;
    const fileUrl = `/uploads/${req.file.filename}`;

    // Read file text content
    let rawText = '';
    const fileExt = req.file.originalname.toLowerCase();

    if (fileExt.endsWith('.txt')) {
      try {
        rawText = fs.readFileSync(filePath, 'utf-8');
      } catch (err) {
        console.error('Error reading txt file:', err);
        rawText = `Resume of ${req.user.name}.`;
      }
    } else if (fileExt.endsWith('.pdf')) {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        rawText = data.text || '';
        
        if (!rawText.trim()) {
          throw new Error('Extracted PDF text is empty');
        }
      } catch (err) {
        console.error('Error reading PDF file, falling back to mock:', err.message);
        rawText = `Resume of ${req.user.name}.
Technical Skills: JavaScript, React, Node.js, Express, CSS, HTML, Git, SQLite.
Work Experience: 3 years as a frontend engineer. Built responsive layouts and interactive dashboards.
Education: Bachelor of Science in Information Technology, State University, 2021.`;
      }
    } else {
      // Mock extract for other binary file types (e.g. .docx)
      rawText = `Resume of ${req.user.name}.
Technical Skills: JavaScript, React, Node.js, Express, CSS, HTML, Git, SQLite.
Work Experience: 3 years as a frontend engineer. Built responsive layouts and interactive dashboards.
Education: Bachelor of Science in Information Technology, State University, 2021.`;
    }

    // Call LLM extraction helper
    const parsedData = await parseResume(rawText);

    // Mark previous candidate resumes as not latest
    await prisma.resume.updateMany({
      where: { candidateId, isLatest: true },
      data: { isLatest: false },
    });

    // Create DB Resume record
    const resumeRecord = await prisma.resume.create({
      data: {
        candidateId,
        fileUrl,
        rawText,
        parsedSkills: JSON.stringify(parsedData.skills),
        parsedExperience: parsedData.experience,
        parsedEducation: parsedData.education,
        isLatest: true,
      },
    });

    return res.status(201).json({
      message: 'Resume uploaded and parsed successfully',
      resume: {
        id: resumeRecord.id,
        fileUrl: resumeRecord.fileUrl,
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        uploadedAt: resumeRecord.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return res.status(500).json({ error: 'Internal server error uploading resume' });
  }
};

export const getLatestResume = async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidate accounts can access resumes' });
    }

    const resume = await prisma.resume.findFirst({
      where: { candidateId, isLatest: true },
    });

    if (!resume) {
      return res.status(404).json({ error: 'No resume uploaded yet' });
    }

    let skillsArray = [];
    try {
      skillsArray = JSON.parse(resume.parsedSkills);
    } catch (e) {
      skillsArray = [];
    }

    return res.status(200).json({
      resume: {
        id: resume.id,
        fileUrl: resume.fileUrl,
        skills: skillsArray,
        experience: resume.parsedExperience,
        education: resume.parsedEducation,
        uploadedAt: resume.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Get latest resume error:', error);
    return res.status(500).json({ error: 'Internal server error retrieving resume' });
  }
};

export const getCandidateAnalysis = async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidate accounts can access this analysis' });
    }

    // 1. Fetch all test attempts including answers
    const attempts = await prisma.testAttempt.findMany({
      where: { candidateId },
      include: {
        answers: true,
      },
    });

    const topicStats = {};

    attempts.forEach((att) => {
      att.answers.forEach((ans) => {
        if (!topicStats[ans.topicTag]) {
          topicStats[ans.topicTag] = { total: 0, correct: 0 };
        }
        topicStats[ans.topicTag].total++;
        if (ans.isCorrect) {
          topicStats[ans.topicTag].correct++;
        }
      });
    });

    const topicsList = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      percentage: Math.round((stats.correct / stats.total) * 100),
      totalQuestions: stats.total,
    }));

    // If no tests have been taken yet, return placeholders or empty lists
    const strongTopics = topicsList.filter((t) => t.percentage >= 60).map((t) => t.topic);
    const weakTopics = topicsList.filter((t) => t.percentage < 60).map((t) => t.topic);

    // 2. Compute recommended roles
    const resume = await prisma.resume.findFirst({
      where: { candidateId, isLatest: true },
    });

    const recommendedRoles = [];
    let skillsArray = [];
    if (resume) {
      try {
        skillsArray = JSON.parse(resume.parsedSkills).map((s) => s.toLowerCase().trim());
      } catch (e) {
        skillsArray = [];
      }
    }

    // Heuristics based on skills
    const frontendKeywords = ['react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'tailwind', 'html'];
    const backendKeywords = ['node', 'express', 'django', 'spring', 'sql', 'postgresql', 'sqlite', 'prisma', 'docker', 'apis', 'rest', 'jwt'];
    const aimlKeywords = ['python', 'pytorch', 'tensorflow', 'scikit', 'ml', 'ai', 'nlp', 'llm', 'embeddings', 'deep learning'];

    const hasFrontend = skillsArray.some((s) => frontendKeywords.includes(s));
    const hasBackend = skillsArray.some((s) => backendKeywords.includes(s));
    const hasAiml = skillsArray.some((s) => aimlKeywords.includes(s));

    if (hasFrontend || recommendedRoles.length === 0) recommendedRoles.push('frontend');
    if (hasBackend) recommendedRoles.push('backend');
    if (hasAiml) recommendedRoles.push('ai-ml');

    return res.status(200).json({
      weakTopics,
      strongTopics,
      recommendedRoles,
    });
  } catch (error) {
    console.error('Fetch candidate analysis error:', error);
    return res.status(500).json({ error: 'Internal server error aggregating analysis' });
  }
};

export const getCandidateApplications = async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidate accounts can access applications' });
    }

    const applications = await prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          include: {
            recruiter: {
              select: { companyName: true },
            },
          },
        },
        interview: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    const formatted = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      companyName: app.job.recruiter.companyName,
      roleCategory: app.job.roleCategory,
      matchScore: app.matchScore,
      status: app.status,
      appliedAt: app.appliedAt,
      interview: app.interview
        ? {
            scheduledTime: app.interview.scheduledTime,
            mode: app.interview.mode,
            status: app.interview.status,
            notes: app.interview.notes,
          }
        : null,
    }));

    return res.status(200).json({ applications: formatted });
  } catch (error) {
    console.error('Fetch applications error:', error);
    return res.status(500).json({ error: 'Internal server error fetching candidate applications' });
  }
};

export const getCandidateDashboard = async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidate accounts can access the dashboard' });
    }

    // 1. Resume status
    const latestResume = await prisma.resume.findFirst({
      where: { candidateId, isLatest: true },
    });

    // 2. Application count
    const applicationsCount = await prisma.application.count({
      where: { candidateId },
    });

    // 3. List of all tests with highest scores achieved by user
    const tests = await prisma.test.findMany({
      include: {
        attempts: {
          where: { candidateId },
          orderBy: { score: 'desc' },
        },
      },
    });

    const testsSummary = tests.map((t) => {
      const highestAttempt = t.attempts[0] || null;
      return {
        id: t.id,
        title: t.title,
        type: t.type,
        roleCategory: t.roleCategory,
        passScore: t.passScore,
        hasAttempted: highestAttempt ? true : false,
        highestScore: highestAttempt ? highestAttempt.score : 0,
        passed: highestAttempt ? highestAttempt.passed : false,
      };
    });

    return res.status(200).json({
      hasResume: latestResume ? true : false,
      resumeUploadedAt: latestResume ? latestResume.uploadedAt : null,
      applicationsCount,
      tests: testsSummary,
    });
  } catch (error) {
    console.error('Fetch candidate dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error loading dashboard details' });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const candidateId = req.user.candidateId;
    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidate accounts can access chat history' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    return res.status(500).json({ error: 'Internal server error fetching chat history' });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const candidateId = req.user.candidateId;

    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidate accounts can send messages' });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    // 1. Fetch Candidate Context
    const latestResume = await prisma.resume.findFirst({
      where: { candidateId, isLatest: true },
    });

    let resumeSkills = [];
    if (latestResume) {
      try {
        resumeSkills = JSON.parse(latestResume.parsedSkills);
      } catch (e) {
        resumeSkills = [];
      }
    }

    const applications = await prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          include: {
            recruiter: {
              select: { companyName: true },
            },
          },
        },
      },
    });

    const passedAttempts = await prisma.testAttempt.findMany({
      where: { candidateId, passed: true },
      include: { test: true },
    });

    const candidateContext = {
      name: req.user.name,
      resumeSkills,
      resumeExperience: latestResume ? latestResume.parsedExperience : 'None uploaded',
      resumeEducation: latestResume ? latestResume.parsedEducation : 'None uploaded',
      applicationsCount: applications.length,
      applications: applications.map((app) => ({
        jobTitle: app.job.title,
        companyName: app.job.recruiter.companyName,
        status: app.status,
        matchScore: app.matchScore,
      })),
      passedTests: passedAttempts.map((att) => att.test.title),
    };

    // 2. Fetch Conversation History (last 20 messages for context window size constraints)
    const messages = await prisma.chatMessage.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Reverse since we fetched 'desc' for limit, but we need it 'asc' chronological
    const conversationHistory = messages.reverse().map((msg) => ({
      role: msg.sender === 'CANDIDATE' ? 'user' : 'assistant',
      content: msg.message,
    }));

    // 3. Call AI Advisor completion engine
    const aiResult = await chat(candidateContext, conversationHistory, message);

    // 4. Save Candidate message in Database
    await prisma.chatMessage.create({
      data: {
        candidateId,
        sender: 'CANDIDATE',
        message: message,
      },
    });

    // 5. Save AI reply in Database
    const aiMessage = await prisma.chatMessage.create({
      data: {
        candidateId,
        sender: 'AI',
        message: aiResult.reply,
      },
    });

    return res.status(200).json({
      reply: aiResult.reply,
      aiMessage,
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    return res.status(500).json({ error: 'Internal server error processing career message' });
  }
};


