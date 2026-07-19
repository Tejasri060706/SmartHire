import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--------------------------------------------------');
  console.log('🚀 Smart Hire Edge Case Test Suite Running...');
  console.log('--------------------------------------------------');

  let candidateToken = '';
  let recruiterToken = '';
  let recruiter2Token = '';
  let candidateId = '';
  let recruiterId = '';
  let jobId = '';
  let backendTestId = '';
  let generalTestId = '';
  let attemptId = '';

  try {
    // Ensure the server is reachable
    const healthRes = await fetch(`${API_BASE}/health`);
    if (!healthRes.ok) throw new Error('Server health check failed');
    console.log('✅ Server is active and reachable.');

    // Clean up any old edge test users to ensure repeatable tests
    await prisma.chatMessage.deleteMany({
      where: { candidate: { user: { email: { startsWith: 'edge_' } } } }
    });
    await prisma.interview.deleteMany({
      where: {
        OR: [
          { application: { candidate: { user: { email: { startsWith: 'edge_' } } } } },
          { application: { job: { recruiter: { user: { email: { startsWith: 'edge_' } } } } } }
        ]
      }
    });
    await prisma.application.deleteMany({
      where: {
        OR: [
          { candidate: { user: { email: { startsWith: 'edge_' } } } },
          { job: { recruiter: { user: { email: { startsWith: 'edge_' } } } } }
        ]
      }
    });
    await prisma.job.deleteMany({
      where: { recruiter: { user: { email: { startsWith: 'edge_' } } } }
    });
    await prisma.testAnswer.deleteMany({
      where: { attempt: { candidate: { user: { email: { startsWith: 'edge_' } } } } }
    });
    await prisma.testAttempt.deleteMany({
      where: { candidate: { user: { email: { startsWith: 'edge_' } } } }
    });
    await prisma.resume.deleteMany({
      where: { candidate: { user: { email: { startsWith: 'edge_' } } } }
    });
    
    // Fetch user IDs to delete
    const edgeUsers = await prisma.user.findMany({
      where: { email: { startsWith: 'edge_' } }
    });
    const edgeUserIds = edgeUsers.map(u => u.id);
    
    await prisma.recruiter.deleteMany({ where: { userId: { in: edgeUserIds } } });
    await prisma.candidate.deleteMany({ where: { userId: { in: edgeUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: edgeUserIds } } });

    console.log('🧹 Cleaned up old edge test records.');

    // Fetch seeded assessment test IDs for testing gating flows
    const tests = await prisma.test.findMany();
    generalTestId = tests.find(t => t.type === 'GENERAL')?.id;
    backendTestId = tests.find(t => t.type === 'ROLE_SPECIFIC' && t.roleCategory === 'backend')?.id;

    if (!generalTestId || !backendTestId) {
      throw new Error('Please seed the database first using "node prisma/seed.js"');
    }

    /* ====================================================
       1. EDGE CASE: Duplicate Registrations
       ==================================================== */
    console.log('\nTesting 1. Duplicate Registrations...');
    
    // Register candidate first time
    const regRes1 = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Edge Candidate',
        email: 'edge_candidate@gmail.com',
        password: 'password123',
        role: 'CANDIDATE'
      })
    });
    
    const regData1 = await regRes1.json();
    candidateToken = regData1.token;
    candidateId = regData1.user.candidateId;

    // Try duplicate registration
    const regRes2 = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Edge Candidate Dup',
        email: 'edge_candidate@gmail.com',
        password: 'password123',
        role: 'CANDIDATE'
      })
    });
    
    if (regRes2.status === 400) {
      console.log('✅ Correctly blocked duplicate email with Status 400.');
    } else {
      console.error('❌ FAILED: Duplicate email was not blocked (Status:', regRes2.status, ')');
    }

    /* ====================================================
       2. EDGE CASE: Recruiter Missing Company Name (Zod validation)
       ==================================================== */
    console.log('\nTesting 2. Recruiter Zod Constraints...');
    const regRec1 = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Edge Recruiter',
        email: 'edge_recruiter@gmail.com',
        password: 'password123',
        role: 'RECRUITER'
      })
    });

    if (regRec1.status === 400) {
      const data = await regRec1.json();
      console.log(`✅ Correctly blocked recruiter registration without companyName. Error: "${data.error}"`);
    } else {
      console.error('❌ FAILED: Recruiter registration without companyName was allowed.');
    }

    // Now register recruiters correctly
    const regRec2 = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Edge Recruiter 1',
        email: 'edge_recruiter@gmail.com',
        password: 'password123',
        role: 'RECRUITER',
        companyName: 'Edge Solutions'
      })
    });
    const regRecData2 = await regRec2.json();
    recruiterToken = regRecData2.token;
    recruiterId = regRecData2.user.recruiterId;

    const regRec3 = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Edge Recruiter 2',
        email: 'edge_recruiter2@gmail.com',
        password: 'password123',
        role: 'RECRUITER',
        companyName: 'Alternative Corp'
      })
    });
    const regRecData3 = await regRec3.json();
    recruiter2Token = regRecData3.token;

    /* ====================================================
       3. EDGE CASE: Taking Tests Without a Resume
       ==================================================== */
    console.log('\nTesting 3. Take Test Without Resume...');
    const testAttemptRes1 = await fetch(`${API_BASE}/tests/${generalTestId}/attempts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateToken}`
      }
    });

    if (testAttemptRes1.status === 400) {
      const data = await testAttemptRes1.json();
      console.log(`✅ Correctly blocked attempt starting. Message: "${data.error}"`);
    } else {
      console.error('❌ FAILED: Candidate allowed to start test without a resume uploaded.');
    }

    // Create a mock resume record in DB directly to bypass file upload for testing remainder
    await prisma.resume.create({
      data: {
        candidateId,
        fileUrl: '/uploads/edge-resume-mock.pdf',
        rawText: 'Resume text',
        parsedSkills: JSON.stringify(['Node.js', 'Express', 'React', 'JavaScript', 'SQL']),
        parsedExperience: '2 years working with Node',
        parsedEducation: 'B.Sc. in CS',
        isLatest: true
      }
    });
    console.log('📂 Seeded mock candidate resume.');

    /* ====================================================
       4. EDGE CASE: Starting Test with Valid Resume
       ==================================================== */
    console.log('\nTesting 4. Start Test Attempt...');
    const testAttemptRes2 = await fetch(`${API_BASE}/tests/${backendTestId}/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateToken}`
      }
    });

    if (testAttemptRes2.status === 201) {
      const data = await testAttemptRes2.json();
      attemptId = data.attemptId;
      console.log('✅ Correctly started test attempt. Attempt ID:', attemptId);
    } else {
      console.error('❌ FAILED: Failed to start test attempt (Status:', testAttemptRes2.status, ')');
    }

    /* ====================================================
       5. EDGE CASE: Answer Masking Verification
       ==================================================== */
    console.log('\nTesting 5. Correct Answer Index Masking...');
    const testDetailRes = await fetch(`${API_BASE}/tests/${backendTestId}`, {
      headers: { 'Authorization': `Bearer ${candidateToken}` }
    });
    const testDetail = await testDetailRes.json();
    const hasCorrectIndex = testDetail.test.questions.some(q => q.correctIndex !== undefined);

    if (!hasCorrectIndex) {
      console.log('✅ Checked questions list. correctIndex field is successfully hidden.');
    } else {
      console.error('❌ SECURITY FAILURE: correctIndex field was leaked to the candidate client!');
    }

    /* ====================================================
       6. EDGE CASE: Double Submission Gating
       ==================================================== */
    console.log('\nTesting 6. Double Test Submission Gating...');
    
    // Generate mock answers matching all database questions
    const qList = await prisma.question.findMany({ where: { testId: backendTestId } });
    const mockAnswers = qList.map(q => ({
      questionId: q.id,
      selectedIndex: q.correctIndex // Answer 100% correct to pass
    }));

    const submitRes1 = await fetch(`${API_BASE}/tests/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateToken}`
      },
      body: JSON.stringify({ answers: mockAnswers })
    });
    const submitData = await submitRes1.json();
    console.log(`- Submitted first time. Passed: ${submitData.passed}. Score: ${submitData.score}%`);

    const submitRes2 = await fetch(`${API_BASE}/tests/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateToken}`
      },
      body: JSON.stringify({ answers: mockAnswers })
    });

    if (submitRes2.status === 400) {
      const data = await submitRes2.json();
      console.log(`✅ Correctly blocked second submission attempt. Error: "${data.error}"`);
    } else {
      console.error('❌ FAILED: Allowed candidate to submit the same test attempt twice!');
    }

    /* ====================================================
       7. EDGE CASE: Invalid Job Submission Validation
       ==================================================== */
    console.log('\nTesting 7. Recruiter Job Post Validation...');
    const jobRes1 = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        title: 'Backend Intern',
        description: 'Short', // Less than 10 characters (should fail Zod)
        requiredSkills: [], // Empty skills (should fail Zod)
        roleCategory: 'invalid-category' // Invalid roleCategory
      })
    });

    if (jobRes1.status === 400) {
      const data = await jobRes1.json();
      console.log(`✅ Correctly blocked invalid job schema. Error: "${data.error}"`);
    } else {
      console.error('❌ FAILED: Allowed creation of job with invalid parameters.');
    }

    // Post a valid backend job
    const jobRes2 = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        title: 'Edge Backend Engineer',
        description: 'Develop high scalability backend architectures with Postgres and Node.',
        requiredSkills: ['Node.js', 'Express', 'SQLite'],
        roleCategory: 'backend'
      })
    });
    const jobData = await jobRes2.json();
    jobId = jobData.job.id;
    console.log('✅ Posted valid job. Job ID:', jobId);

    /* ====================================================
       8. EDGE CASE: Cross Recruiter Data Leak Gating
       ==================================================== */
    console.log('\nTesting 8. Cross Recruiter Data Leak Gating...');
    
    // Recruiter 2 trying to fetch applicants for Recruiter 1's job
    const crossRes = await fetch(`${API_BASE}/jobs/${jobId}/applicants`, {
      headers: { 'Authorization': `Bearer ${recruiter2Token}` }
    });

    if (crossRes.status === 403) {
      console.log('✅ Correctly blocked foreign recruiter from fetching applicant profiles.');
    } else {
      console.error('❌ FAILED: Recruiter allowed to view applicants for jobs they did not post!');
    }

    /* ====================================================
       9. EDGE CASE: Gated Apply Checking
       ==================================================== */
    console.log('\nTesting 9. Role-Specific Test Apply Gate...');
    
    // Register candidate 2 who HAS a resume but HAS NOT passed the backend test
    const regCand2 = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Edge Candidate 2',
        email: 'edge_candidate2@gmail.com',
        password: 'password123',
        role: 'CANDIDATE'
      })
    });
    const regCand2Data = await regCand2.json();
    const cand2Token = regCand2Data.token;
    const cand2Id = regCand2Data.user.candidateId;

    // Seed mock resume for candidate 2
    await prisma.resume.create({
      data: {
        candidateId: cand2Id,
        fileUrl: '/uploads/edge-resume-mock.pdf',
        rawText: 'Resume text',
        parsedSkills: JSON.stringify(['React']),
        isLatest: true
      }
    });

    // Try applying to backend job without passing the backend test
    const applyRes1 = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${cand2Token}` }
    });

    if (applyRes1.status === 403) {
      const data = await applyRes1.json();
      console.log(`✅ Correctly blocked application. Return test:`, data.requiredTest);
    } else {
      console.error('❌ FAILED: Allowed Candidate 2 to apply without passing the required test. Status:', applyRes1.status);
    }

    // Now apply using Candidate 1 (who passed the backend test in step 13)
    const applyRes2 = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${candidateToken}` }
    });

    let appRecordId = '';
    if (applyRes2.status === 201) {
      const data = await applyRes2.json();
      appRecordId = data.application.id;
      console.log(`✅ Successfully applied with Candidate 1. Application ID:`, appRecordId);
    } else {
      console.error('❌ FAILED: Passed Candidate 1 was blocked from applying. Status:', applyRes2.status);
    }

    /* ====================================================
       10. EDGE CASE: Duplicate Job Applications
       ==================================================== */
    console.log('\nTesting 10. Duplicate Application Prevention...');
    const applyRes3 = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${candidateToken}` }
    });

    if (applyRes3.status === 400) {
      console.log('✅ Correctly blocked candidate from applying to the same job twice.');
    } else {
      console.error('❌ FAILED: Allowed duplicate job application (Status:', applyRes3.status, ')');
    }

    /* ====================================================
       11. EDGE CASE: Invalid Workflow State Transitions
       ==================================================== */
    console.log('\nTesting 11. Workflow State Transition Rules...');
    
    // Register candidate 3 for rejection tests
    const regCand3 = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Edge Candidate 3',
        email: 'edge_candidate3@gmail.com',
        password: 'password123',
        role: 'CANDIDATE'
      })
    });
    const regCand3Data = await regCand3.json();
    const cand3Token = regCand3Data.token;
    const cand3Id = regCand3Data.user.candidateId;

    // Seed mock resume for candidate 3
    await prisma.resume.create({
      data: {
        candidateId: cand3Id,
        fileUrl: '/uploads/edge-resume-mock.pdf',
        rawText: 'Resume text',
        parsedSkills: JSON.stringify(['React']),
        isLatest: true
      }
    });

    // Pass the test for Candidate 3
    await prisma.testAttempt.create({
      data: {
        candidateId: cand3Id,
        testId: backendTestId,
        score: 100,
        totalQuestions: 5,
        passed: true,
        completedAt: new Date()
      }
    });

    // Candidate 3 applies
    const applyResCand3 = await fetch(`${API_BASE}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${cand3Token}` }
    });
    const applyCand3Data = await applyResCand3.json();
    const cand3AppId = applyCand3Data.application.id;

    // Status of Candidate 3 is currently APPLIED. Trying to schedule interview directly should fail
    // (Transition must be APPLIED -> SHORTLISTED -> INTERVIEW_SCHEDULED)
    const transitionRes1 = await fetch(`${API_BASE}/applications/${cand3AppId}/interview`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        mode: 'ONLINE',
        notes: 'Tech round'
      })
    });

    if (transitionRes1.status === 400) {
      const data = await transitionRes1.json();
      console.log(`✅ Correctly blocked scheduling interview directly from APPLIED. Error: "${data.error}"`);
    } else {
      console.error('❌ FAILED: Allowed scheduling interview directly without shortlisting candidate.');
    }

    // Shortlist Candidate 3
    await fetch(`${API_BASE}/applications/${cand3AppId}/shortlist`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${recruiterToken}` }
    });
    console.log('- Shortlisted Candidate 3 successfully.');

    // Try shortlisting again (expects 400 "Cannot shortlist...")
    const transitionRes2 = await fetch(`${API_BASE}/applications/${cand3AppId}/shortlist`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${recruiterToken}` }
    });

    if (transitionRes2.status === 400) {
      console.log('✅ Correctly blocked redundant shortlist update (APPLIED -> SHORTLISTED when already SHORTLISTED).');
    } else {
      console.error('❌ FAILED: Redundant shortlist transition was ignored or allowed (Status:', transitionRes2.status, ')');
    }

    /* ====================================================
       12. EDGE CASE: Scheduling for Rejected Candidate
       ==================================================== */
    console.log('\nTesting 12. Actions on Rejected Candidates...');
    
    // Reject Candidate 3
    await fetch(`${API_BASE}/applications/${cand3AppId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${recruiterToken}` }
    });
    console.log('- Candidate 3 rejected.');

    // Try to schedule interview for rejected candidate (expects 400)
    const transitionRes3 = await fetch(`${API_BASE}/applications/${cand3AppId}/interview`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        mode: 'ONLINE',
        notes: 'Review details'
      })
    });

    if (transitionRes3.status === 400) {
      console.log('✅ Correctly blocked scheduling interview for rejected candidate.');
    } else {
      console.error('❌ FAILED: Scheduled interview for rejected candidate!');
    }

    /* ====================================================
       13. EDGE CASE: Hire Candidate Transition Flow & Edge Cases
       ==================================================== */
    console.log('\nTesting 13. Hire Candidate Transition Flow & Edge Cases...');

    // Candidate 1 (appRecordId) is currently in APPLIED status.
    // Try to Hire Candidate 1 (should FAIL with status 400)
    const hireResApplied = await fetch(`${API_BASE}/applications/${appRecordId}/hire`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${recruiterToken}` }
    });

    if (hireResApplied.status === 400) {
      console.log('✅ Correctly blocked hiring candidate directly from APPLIED status.');
    } else {
      console.error('❌ FAILED: Allowed hiring candidate directly from APPLIED status (Status:', hireResApplied.status, ')');
    }

    // Shortlist Candidate 1
    await fetch(`${API_BASE}/applications/${appRecordId}/shortlist`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${recruiterToken}` }
    });
    console.log('- Shortlisted Candidate 1.');

    // Try to Hire Candidate 1 (should FAIL with status 400 since status is SHORTLISTED)
    const hireResShortlisted = await fetch(`${API_BASE}/applications/${appRecordId}/hire`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${recruiterToken}` }
    });

    if (hireResShortlisted.status === 400) {
      console.log('✅ Correctly blocked hiring candidate from SHORTLISTED status.');
    } else {
      console.error('❌ FAILED: Allowed hiring candidate from SHORTLISTED status (Status:', hireResShortlisted.status, ')');
    }

    // Schedule interview for Candidate 1 (transitions to INTERVIEW_SCHEDULED)
    await fetch(`${API_BASE}/applications/${appRecordId}/interview`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        mode: 'ONLINE',
        notes: 'Final round interview'
      })
    });
    console.log('- Interview scheduled for Candidate 1.');

    // Hire Candidate 1 (should SUCCEED with status 200)
    const hireResScheduled = await fetch(`${API_BASE}/applications/${appRecordId}/hire`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${recruiterToken}` }
    });

    if (hireResScheduled.status === 200) {
      const data = await hireResScheduled.json();
      if (data.application.status === 'HIRED') {
        console.log('✅ Successfully hired candidate from INTERVIEW_SCHEDULED status.');
      } else {
        console.error('❌ FAILED: Status is not HIRED after successful hire API call:', data.application.status);
      }
    } else {
      console.error('❌ FAILED: Failed to hire candidate from INTERVIEW_SCHEDULED (Status:', hireResScheduled.status, ')');
    }

    // Try to Hire Candidate 1 again (should FAIL with status 400 since they are already HIRED)
    const hireResHiredAgain = await fetch(`${API_BASE}/applications/${appRecordId}/hire`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${recruiterToken}` }
    });

    if (hireResHiredAgain.status === 400) {
      console.log('✅ Correctly blocked redundant hire call for already hired candidate.');
    } else {
      console.error('❌ FAILED: Redundant hire call succeeded or ignored (Status:', hireResHiredAgain.status, ')');
    }

    // Try to Reschedule interview for Candidate 1 (should FAIL with status 400 since HIRED is terminal)
    const scheduleResHired = await fetch(`${API_BASE}/applications/${appRecordId}/interview`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recruiterToken}`
      },
      body: JSON.stringify({
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        mode: 'ONLINE',
        notes: 'Post-hire sync'
      })
    });

    if (scheduleResHired.status === 400) {
      console.log('✅ Correctly blocked interview scheduling on hired candidate.');
    } else {
      console.error('❌ FAILED: Allowed interview scheduling on hired candidate (Status:', scheduleResHired.status, ')');
    }

    // Try to Reject Candidate 1 (should FAIL with status 400 since HIRED is terminal)
    const rejectResHired = await fetch(`${API_BASE}/applications/${appRecordId}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${recruiterToken}` }
    });

    if (rejectResHired.status === 400) {
      console.log('✅ Correctly blocked rejection of hired candidate.');
    } else {
      console.error('❌ FAILED: Allowed rejecting hired candidate (Status:', rejectResHired.status, ')');
    }

    console.log('\n--------------------------------------------------');
    console.log('🏆 All 13 Smart Hire Edge Case Tests Completed!');
    console.log('--------------------------------------------------');

  } catch (error) {
    console.error('❌ TEST RUN FAILED:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
