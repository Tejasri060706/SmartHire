import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRecruiterDashboard = async (req, res) => {
  try {
    const recruiterId = req.user.recruiterId;
    if (!recruiterId) {
      return res.status(403).json({ error: 'Only recruiters can access this dashboard' });
    }

    // 1. Get open jobs count
    const openJobs = await prisma.job.count({
      where: { recruiterId, status: 'OPEN' },
    });

    // 2. Get total applications count
    const totalApplicants = await prisma.application.count({
      where: {
        job: { recruiterId },
      },
    });

    // 3. Get shortlisted applications count
    const shortlisted = await prisma.application.count({
      where: {
        job: { recruiterId },
        status: { in: ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'HIRED'] },
      },
    });

    // 4. Get top scorers (highest matchScore)
    const topApplications = await prisma.application.findMany({
      where: {
        job: { recruiterId },
      },
      include: {
        candidate: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        job: {
          select: { title: true },
        },
      },
      orderBy: {
        matchScore: 'desc',
      },
      take: 5,
    });

    const topScorers = topApplications.map((app) => ({
      applicationId: app.id,
      candidateName: app.candidate.user.name,
      jobTitle: app.job.title,
      matchScore: app.matchScore,
      status: app.status,
    }));

    // 5. Get jobs list with applicant count
    const jobsList = await prisma.job.findMany({
      where: { recruiterId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const recruiterJobs = jobsList.map((job) => ({
      id: job.id,
      title: job.title,
      roleCategory: job.roleCategory,
      status: job.status,
      createdAt: job.createdAt,
      applicantsCount: job._count.applications,
    }));

    return res.status(200).json({
      openJobs,
      totalApplicants,
      shortlisted,
      topScorers,
      jobs: recruiterJobs,
    });
  } catch (error) {
    console.error('Recruiter dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error fetching dashboard statistics' });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { sort } = req.query; // 'matchScore' (default) or 'appliedAt'
    const recruiterId = req.user.recruiterId;

    if (!recruiterId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify job belongs to recruiter
    const job = await prisma.job.findFirst({
      where: { id: jobId, recruiterId },
    });

    if (!job) {
      return res.status(403).json({ error: 'Unauthorized to view applicants for this job' });
    }

    let orderBy = { matchScore: 'desc' };
    if (sort === 'appliedAt') {
      orderBy = { appliedAt: 'desc' };
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        resume: {
          select: { fileUrl: true },
        },
        interview: true,
      },
      orderBy,
    });

    const formattedApplicants = applications.map((app) => {
      let matched = [];
      let missing = [];
      try {
        matched = JSON.parse(app.matchedSkills);
        missing = JSON.parse(app.missingSkills);
      } catch (e) {
        matched = [];
        missing = [];
      }

      return {
        applicationId: app.id,
        candidateName: app.candidate.user.name,
        candidateEmail: app.candidate.user.email,
        matchScore: app.matchScore,
        matchedSkills: matched,
        missingSkills: missing,
        status: app.status,
        appliedAt: app.appliedAt,
        resumeUrl: app.resume.fileUrl,
        interview: app.interview
          ? {
              id: app.interview.id,
              scheduledTime: app.interview.scheduledTime,
              mode: app.interview.mode,
              status: app.interview.status,
              notes: app.interview.notes,
            }
          : null,
      };
    });

    return res.status(200).json({ applicants: formattedApplicants, jobTitle: job.title });
  } catch (error) {
    console.error('Fetch applicants error:', error);
    return res.status(500).json({ error: 'Internal server error fetching job applicants' });
  }
};

export const shortlistApplicant = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const recruiterId = req.user.recruiterId;

    if (!recruiterId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application || application.job.recruiterId !== recruiterId) {
      return res.status(403).json({ error: 'Unauthorized to manage this application' });
    }

    // Business Rules: Status Transitions: APPLIED -> SHORTLISTED
    if (application.status !== 'APPLIED') {
      return res.status(400).json({
        error: `Invalid transition. Cannot shortlist application in status '${application.status}'`,
      });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'SHORTLISTED' },
    });

    return res.status(200).json({ application: updated });
  } catch (error) {
    console.error('Shortlist application error:', error);
    return res.status(500).json({ error: 'Internal server error shortlisting candidate' });
  }
};

export const rejectApplicant = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const recruiterId = req.user.recruiterId;

    if (!recruiterId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application || application.job.recruiterId !== recruiterId) {
      return res.status(403).json({ error: 'Unauthorized to manage this application' });
    }

    // Business Rules: Status Transitions: Reject is allowed from any non-terminal state
    if (application.status === 'REJECTED' || application.status === 'HIRED') {
      return res.status(400).json({
        error: `Cannot reject application that is already in terminal state '${application.status}'`,
      });
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
    });

    return res.status(200).json({ application: updated });
  } catch (error) {
    console.error('Reject application error:', error);
    return res.status(500).json({ error: 'Internal server error rejecting candidate' });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const { scheduledTime, mode, notes } = req.body; // scheduledTime is ISO string
    const recruiterId = req.user.recruiterId;

    if (!recruiterId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!scheduledTime || !mode) {
      return res.status(400).json({ error: 'Interview time and mode (ONLINE/OFFLINE) are required' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, interview: true },
    });

    if (!application || application.job.recruiterId !== recruiterId) {
      return res.status(403).json({ error: 'Unauthorized to manage this application' });
    }

    // Business Rules: Status Transitions: SHORTLISTED -> INTERVIEW_SCHEDULED
    if (application.status !== 'SHORTLISTED' && application.status !== 'INTERVIEW_SCHEDULED') {
      return res.status(400).json({
        error: `Invalid transition. Interview can only be scheduled for 'SHORTLISTED' candidates. Current: '${application.status}'`,
      });
    }

    // Create or update interview record
    let interview;
    if (application.interview) {
      interview = await prisma.interview.update({
        where: { id: application.interview.id },
        data: {
          scheduledTime: new Date(scheduledTime),
          mode,
          notes,
          status: 'SCHEDULED',
        },
      });
    } else {
      interview = await prisma.interview.create({
        data: {
          applicationId,
          scheduledTime: new Date(scheduledTime),
          mode,
          notes,
          status: 'SCHEDULED',
        },
      });
    }

    // Update application status
    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'INTERVIEW_SCHEDULED' },
    });

    return res.status(200).json({ interview, application: updatedApp });
  } catch (error) {
    console.error('Schedule interview error:', error);
    return res.status(500).json({ error: 'Internal server error scheduling interview' });
  }
};

export const hireApplicant = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const recruiterId = req.user.recruiterId;

    if (!recruiterId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, interview: true },
    });

    if (!application || application.job.recruiterId !== recruiterId) {
      return res.status(403).json({ error: 'Unauthorized to manage this application' });
    }

    // Business Rules: Status Transitions: INTERVIEW_SCHEDULED -> HIRED
    if (application.status !== 'INTERVIEW_SCHEDULED') {
      return res.status(400).json({
        error: `Invalid transition. Candidate must be in 'INTERVIEW_SCHEDULED' status to be hired. Current: '${application.status}'`,
      });
    }

    // Update interview status to COMPLETED if it exists
    if (application.interview) {
      await prisma.interview.update({
        where: { id: application.interview.id },
        data: { status: 'COMPLETED' },
      });
    }

    // Update application status to HIRED
    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'HIRED' },
    });

    return res.status(200).json({ application: updatedApp });
  } catch (error) {
    console.error('Hire applicant error:', error);
    return res.status(500).json({ error: 'Internal server error hiring candidate' });
  }
};

