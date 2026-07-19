import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { calculateMatchScore } from '../lib/scoring.js';
import { getFitScore } from '../lib/ai.js';

const prisma = new PrismaClient();

const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill must be specified'),
  roleCategory: z.enum(['frontend', 'backend', 'ai-ml']),
});

export const createJob = async (req, res) => {
  try {
    const validation = createJobSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { title, description, requiredSkills, roleCategory } = validation.data;

    if (!req.user.recruiterId) {
      return res.status(403).json({ error: 'Only registered recruiters can post jobs' });
    }

    const job = await prisma.job.create({
      data: {
        recruiterId: req.user.recruiterId,
        title,
        description,
        requiredSkills: JSON.stringify(requiredSkills),
        roleCategory,
        status: 'OPEN',
      },
    });

    return res.status(201).json({ job });
  } catch (error) {
    console.error('Create job error:', error);
    return res.status(500).json({ error: 'Internal server error posting job' });
  }
};

export const getJobs = async (req, res) => {
  try {
    const { roleCategory } = req.query;

    const filter = { status: 'OPEN' };
    if (roleCategory) {
      filter.roleCategory = roleCategory;
    }

    const jobs = await prisma.job.findMany({
      where: filter,
      include: {
        recruiter: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check if the candidate has uploaded a resume
    let candidateSkills = [];
    let resumeUploaded = false;
    let gateAttemptsMap = {}; // Maps roleCategory to passed boolean status
    
    if (req.user.role === 'CANDIDATE' && req.user.candidateId) {
      const resume = await prisma.resume.findFirst({
        where: { candidateId: req.user.candidateId, isLatest: true },
      });
      if (resume) {
        resumeUploaded = true;
        try {
          candidateSkills = JSON.parse(resume.parsedSkills);
        } catch (e) {
          candidateSkills = [];
        }
      }

      // Check passed tests to determine eligibility for each category
      const attempts = await prisma.testAttempt.findMany({
        where: { candidateId: req.user.candidateId, passed: true },
        include: { test: true },
      });
      attempts.forEach((att) => {
        if (att.test.roleCategory) {
          gateAttemptsMap[att.test.roleCategory] = true;
        }
      });
    }

    // Format jobs with calculated match statistics
    const formattedJobs = jobs.map((job) => {
      let skillsArray = [];
      try {
        skillsArray = JSON.parse(job.requiredSkills);
      } catch (e) {
        skillsArray = [];
      }

      let matchScore = null;
      let eligible = true;

      if (req.user.role === 'CANDIDATE') {
        if (resumeUploaded) {
          // Faster list evaluation (assume default narrative match score 75 for listing view)
          const result = calculateMatchScore(candidateSkills, skillsArray, 75);
          matchScore = result.finalScore;
        }
        
        // Gated evaluation: Check if they passed the role-specific test
        // (Only checks if they have a passed test attempt for this category)
        eligible = gateAttemptsMap[job.roleCategory] ? true : false;
      }

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        requiredSkills: skillsArray,
        roleCategory: job.roleCategory,
        status: job.status,
        companyName: job.recruiter.companyName,
        createdAt: job.createdAt,
        matchScore,
        eligible,
      };
    });

    return res.status(200).json({ jobs: formattedJobs });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return res.status(500).json({ error: 'Internal server error fetching jobs' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        recruiter: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    let skillsArray = [];
    try {
      skillsArray = JSON.parse(job.requiredSkills);
    } catch (e) {
      skillsArray = [];
    }

    let matchScore = null;
    let matchedSkills = [];
    let missingSkills = [];
    let eligible = true;
    let resumeUploaded = false;

    // Detailed evaluations for Candidate view
    if (req.user.role === 'CANDIDATE' && req.user.candidateId) {
      const resume = await prisma.resume.findFirst({
        where: { candidateId: req.user.candidateId, isLatest: true },
      });

      if (resume) {
        resumeUploaded = true;
        let candidateSkills = [];
        try {
          candidateSkills = JSON.parse(resume.parsedSkills);
        } catch (e) {
          candidateSkills = [];
        }

        // Full AI Fit Score evaluation
        const fitResult = await getFitScore(
          {
            skills: candidateSkills,
            experience: resume.parsedExperience,
            education: resume.parsedEducation,
          },
          job.description,
          skillsArray
        );

        const scoring = calculateMatchScore(candidateSkills, skillsArray, fitResult.llmFitScore);
        matchScore = scoring.finalScore;
        matchedSkills = scoring.matchedSkills;
        missingSkills = scoring.missingSkills;
      }

      // Check test eligibility
      const passedAttempt = await prisma.testAttempt.findFirst({
        where: {
          candidateId: req.user.candidateId,
          passed: true,
          test: {
            roleCategory: job.roleCategory,
          },
        },
      });
      eligible = passedAttempt ? true : false;
    }

    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      requiredSkills: skillsArray,
      roleCategory: job.roleCategory,
      status: job.status,
      companyName: job.recruiter.companyName,
      createdAt: job.createdAt,
      matchScore,
      matchedSkills,
      missingSkills,
      eligible,
      resumeUploaded,
    };

    return res.status(200).json({ job: formattedJob });
  } catch (error) {
    console.error('Fetch job by ID error:', error);
    return res.status(500).json({ error: 'Internal server error fetching job details' });
  }
};

export const applyToJob = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const candidateId = req.user.candidateId;

    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidate accounts can apply to jobs' });
    }

    // 1. Check if candidate has a resume
    const latestResume = await prisma.resume.findFirst({
      where: { candidateId, isLatest: true },
    });

    if (!latestResume) {
      return res.status(400).json({ error: 'You must upload a resume before applying to a job.' });
    }

    // 2. Fetch the job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // 3. Check if they already applied to this job
    const existingApp = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
    });

    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    // 4. Gate Test verification
    // Check if the candidate has passed the role-specific test for this job's roleCategory
    const passedAttempt = await prisma.testAttempt.findFirst({
      where: {
        candidateId,
        passed: true,
        test: {
          roleCategory: job.roleCategory,
          type: 'ROLE_SPECIFIC',
        },
      },
      orderBy: { score: 'desc' }, // take highest score attempt
    });

    if (!passedAttempt) {
      // Find the required test ID so the frontend can redirect to it
      const requiredTest = await prisma.test.findFirst({
        where: {
          roleCategory: job.roleCategory,
          type: 'ROLE_SPECIFIC',
        },
      });

      if (!requiredTest) {
        return res.status(500).json({ error: 'Category assessment test not configured' });
      }

      return res.status(403).json({
        error: 'You must pass the category assessment test before applying.',
        requiredTest: {
          testId: requiredTest.id,
          roleCategory: job.roleCategory,
        },
      });
    }

    // 5. Calculate match scores
    let candidateSkills = [];
    try {
      candidateSkills = JSON.parse(latestResume.parsedSkills);
    } catch (e) {
      candidateSkills = [];
    }
    const requiredSkills = JSON.parse(job.requiredSkills);

    // Call LLM narrative fit evaluator
    const fitResult = await getFitScore(
      {
        skills: candidateSkills,
        experience: latestResume.parsedExperience,
        education: latestResume.parsedEducation,
      },
      job.description,
      requiredSkills
    );

    const scoring = calculateMatchScore(candidateSkills, requiredSkills, fitResult.llmFitScore);

    // 6. Create application
    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId,
        resumeId: latestResume.id,
        matchScore: scoring.finalScore,
        matchedSkills: JSON.stringify(scoring.matchedSkills),
        missingSkills: JSON.stringify(scoring.missingSkills),
        gateTestAttemptId: passedAttempt.id,
        status: 'APPLIED',
      },
    });

    return res.status(201).json({
      message: 'Successfully applied to job',
      application,
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    return res.status(500).json({ error: 'Internal server error submitting application' });
  }
};

