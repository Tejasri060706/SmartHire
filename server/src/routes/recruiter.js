import express from 'express';
import { getRecruiterDashboard } from '../controllers/recruiterController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/dashboard', verifyToken, checkRole('RECRUITER'), getRecruiterDashboard);

export default router;
