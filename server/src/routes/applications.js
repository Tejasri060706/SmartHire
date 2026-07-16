import express from 'express';
import {
  shortlistApplicant,
  rejectApplicant,
  scheduleInterview,
  hireApplicant,
} from '../controllers/recruiterController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/:id/shortlist', verifyToken, checkRole('RECRUITER'), shortlistApplicant);
router.post('/:id/reject', verifyToken, checkRole('RECRUITER'), rejectApplicant);
router.post('/:id/interview', verifyToken, checkRole('RECRUITER'), scheduleInterview);
router.post('/:id/hire', verifyToken, checkRole('RECRUITER'), hireApplicant);

export default router;

