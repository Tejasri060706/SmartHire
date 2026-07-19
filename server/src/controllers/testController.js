import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTestDetails = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true, // JSON string array
            topicTag: true,
            difficulty: true,
          },
        },
      },
    });

    if (!test) {
      return res.status(404).json({ error: 'Assessment test not found' });
    }

    // Format options as array
    const formattedQuestions = test.questions.map((q) => {
      let optionsArray = [];
      try {
        optionsArray = JSON.parse(q.options);
      } catch (e) {
        optionsArray = [];
      }
      return {
        ...q,
        options: optionsArray,
      };
    });

    return res.status(200).json({
      test: {
        id: test.id,
        type: test.type,
        roleCategory: test.roleCategory,
        title: test.title,
        passScore: test.passScore,
        questions: formattedQuestions,
      },
    });
  } catch (error) {
    console.error('Fetch test details error:', error);
    return res.status(500).json({ error: 'Internal server error fetching test details' });
  }
};

export const startAttempt = async (req, res) => {
  try {
    const { testId } = req.params;
    const candidateId = req.user.candidateId;

    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidates can take tests' });
    }

    // Business Rule 5.2.1: Must have at least 1 resume to take any test
    const resumeCount = await prisma.resume.count({
      where: { candidateId },
    });

    if (resumeCount === 0) {
      return res.status(400).json({
        error: 'You must upload at least one resume before starting an assessment.',
      });
    }

    // Verify test exists
    const test = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) {
      return res.status(404).json({ error: 'Assessment test not found' });
    }

    const attempt = await prisma.testAttempt.create({
      data: {
        candidateId,
        testId,
        score: 0,
        totalQuestions: 0,
        passed: false,
      },
    });

    return res.status(201).json({ attemptId: attempt.id });
  } catch (error) {
    console.error('Start attempt error:', error);
    return res.status(500).json({ error: 'Internal server error initiating test' });
  }
};

export const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedIndex }
    const candidateId = req.user.candidateId;

    if (!candidateId) {
      return res.status(403).json({ error: 'Only candidates can submit test attempts' });
    }

    // Load attempt, including questions for score calculations
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }

    if (attempt.completedAt) {
      return res.status(400).json({ error: 'This test attempt has already been submitted' });
    }

    const dbQuestions = attempt.test.questions;
    const totalQuestions = dbQuestions.length;
    let correctCount = 0;

    const answerRecordsData = [];

    // Evaluate answers
    for (const q of dbQuestions) {
      const submittedAnswer = (answers || []).find((a) => a.questionId === q.id);
      const selectedIndex = submittedAnswer ? submittedAnswer.selectedIndex : -1;
      const isCorrect = selectedIndex === q.correctIndex;

      if (isCorrect) {
        correctCount++;
      }

      answerRecordsData.push({
        attemptId,
        questionId: q.id,
        selectedIndex,
        isCorrect,
        topicTag: q.topicTag,
      });
    }

    // Create TestAnswer records in batch
    await prisma.testAnswer.createMany({
      data: answerRecordsData,
    });

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= attempt.test.passScore;

    // Update attempt
    await prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        totalQuestions,
        passed,
        completedAt: new Date(),
      },
    });

    return res.status(200).json({
      score,
      passed,
      breakdown: {
        correctCount,
        totalQuestions,
      },
    });
  } catch (error) {
    console.error('Submit attempt error:', error);
    return res.status(500).json({ error: 'Internal server error submitting assessment' });
  }
};
