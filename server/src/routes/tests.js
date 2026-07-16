import express from 'express';
import { getTestDetails, startAttempt, submitAttempt } from '../controllers/testController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/:testId', verifyToken, checkRole('CANDIDATE'), getTestDetails);
router.post('/:testId/attempts', verifyToken, checkRole('CANDIDATE'), startAttempt);
router.post('/attempts/:attemptId/submit', verifyToken, checkRole('CANDIDATE'), submitAttempt);

export default router;
