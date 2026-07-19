import express from 'express';
import { createJob, getJobs, getJobById, applyToJob } from '../controllers/jobController.js';
import { getJobApplicants } from '../controllers/recruiterController.js';
import { verifyToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

// Recruiters can post jobs
router.post('/', verifyToken, checkRole('RECRUITER'), createJob);

// Authenticated users (candidates/recruiters) can browse jobs
router.get('/', verifyToken, getJobs);
router.get('/:id', verifyToken, getJobById);

// Candidates can apply to jobs (requires Candidate role)
router.post('/:id/apply', verifyToken, checkRole('CANDIDATE'), applyToJob);

// Recruiters can see ranked applicant list for their own jobs
router.get('/:id/applicants', verifyToken, checkRole('RECRUITER'), getJobApplicants);

export default router;
