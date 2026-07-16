/**
 * Computes the deterministic skill overlap and combines it with the LLM Fit Score
 * to generate the final resume-to-job match rating.
 * 
 * @param {Array<string>} candidateSkills - Array of skills extracted from candidate resume
 * @param {Array<string>} requiredSkills - Array of skills required for the job posting
 * @param {number} llmFitScore - 0-100 score returned from LLM fit evaluation
 * @returns {Object} Object containing score breakdowns
 */
export const calculateMatchScore = (candidateSkills = [], requiredSkills = [], llmFitScore = 50) => {
  if (requiredSkills.length === 0) {
    return {
      skillOverlapScore: 100,
      llmFitScore,
      finalScore: llmFitScore,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const candSkillsLower = candidateSkills.map((s) => s.toLowerCase().trim());
  const reqSkillsLower = requiredSkills.map((s) => s.toLowerCase().trim());

  const matched = [];
  const missing = [];

  requiredSkills.forEach((skill, index) => {
    const rawSkill = skill.trim();
    const parsedSkill = reqSkillsLower[index];

    // Check if skill is in candidate's skills array
    if (candSkillsLower.includes(parsedSkill)) {
      matched.push(rawSkill);
    } else {
      // Check for partial substring matching (e.g. "React" matching "React.js")
      const partialMatch = candSkillsLower.some(
        (candSkill) => candSkill.includes(parsedSkill) || parsedSkill.includes(candSkill)
      );
      if (partialMatch) {
        matched.push(rawSkill);
      } else {
        missing.push(rawSkill);
      }
    }
  });

  const skillOverlapScore = Math.round((matched.length / requiredSkills.length) * 100);
  const finalScore = Math.round(0.6 * skillOverlapScore + 0.4 * llmFitScore);

  return {
    skillOverlapScore,
    llmFitScore,
    finalScore,
    matchedSkills: matched,
    missingSkills: missing,
  };
};
