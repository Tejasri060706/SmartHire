import express from 'express';
import {
  uploadResume,
  getLatestResume,
  getCandidateDashboard,
  getCandidateAnalysis,
  getCandidateApplications,
  getChatHistory,
  sendChatMessage,
} from '../controllers/candidateController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Candidate Resume upload & retrieval
router.post('/resumes', verifyToken, checkRole('CANDIDATE'), upload.single('resume'), uploadResume);
router.get('/resumes/latest', verifyToken, checkRole('CANDIDATE'), getLatestResume);

// Candidate Dashboard & Analytics summary
router.get('/candidate/dashboard', verifyToken, checkRole('CANDIDATE'), getCandidateDashboard);
router.get('/candidate/analysis', verifyToken, checkRole('CANDIDATE'), getCandidateAnalysis);
router.get('/candidate/applications', verifyToken, checkRole('CANDIDATE'), getCandidateApplications);

// Chat endpoints
router.get('/candidate/chat/history', verifyToken, checkRole('CANDIDATE'), getChatHistory);
router.post('/candidate/chat', verifyToken, checkRole('CANDIDATE'), sendChatMessage);

export default router;
