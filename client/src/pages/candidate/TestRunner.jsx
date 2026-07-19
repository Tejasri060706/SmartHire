import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Award,
  AlertCircle
} from 'lucide-react';

export default function TestRunner() {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Answers state: { [questionId]: selectedIndex }
  const [selectedAnswers, setSelectedAnswers] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Result state
  const [result, setResult] = useState(null); // { score, passed, breakdown }

  useEffect(() => {
    initiateTest();
  }, [testId]);

  const initiateTest = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Create a test attempt record (validates resume upload rules)
      const attemptRes = await axios.post(`https://smarthire-backend-riay.onrender.com/api/tests/${testId}/attempt`);
      setAttemptId(attemptRes.data.attemptId);
      setStarting(false);

      // 2. Fetch test details (questions list without correct answers)
      const testRes = await axios.get(`https://smarthire-backend-riay.onrender.com/api/tests/${testId}`);
      setTest(testRes.data.test);
      setQuestions(testRes.data.test.questions || []);
    } catch (err) {
      console.error('Failed to initialize test:', err);
      setError(err.response?.data?.error || 'Failed to start the skills assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return; // disable selection if result is shown
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    
    setSubmitting(true);
    setError('');

    // Format answers array
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    try {
      const res = await axios.post(`https://smarthire-backend-riay.onrender.com/api/tests/${testId}/submit`, {
        answers: formattedAnswers,
      });
      setResult(res.data);
    } catch (err) {
      console.error('Failed to submit test:', err);
      setError(err.response?.data?.error || 'Failed to submit your answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">Loading assessment parameters...</p>
        </div>
      </div>
    );
  }

  if (error && starting) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 fade-in">
        <div className="glass-card text-center py-10">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Assessment Locked</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">{error}</p>
          <button onClick={() => navigate('/candidate/resume')} className="btn btn-primary">
            Go to Resume Profile
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (result) {
    const isPassed = result.passed;
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 fade-in">
        <div className="glass-card text-center p-8 relative overflow-hidden">
          {/* Accent decoration */}
          <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl ${
            isPassed ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}></div>

          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-6 ${
            isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {isPassed ? <Award size={36} /> : <XCircle size={36} />}
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {isPassed ? 'Assessment Passed!' : 'Assessment Not Passed'}
          </h1>
          
          <p className="text-slate-400 font-medium mb-6">
            {test.title}
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8 bg-slate-900/60 p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Your Score</span>
              <span className={`text-2xl font-bold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.score}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Pass Mark</span>
              <span className="text-2xl font-bold text-slate-300">
                {test.passScore}%
              </span>
            </div>
          </div>

          <p className="text-slate-300 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            {isPassed 
              ? 'Congratulations! You have met the criteria to apply for jobs matching this category. This assessment credential will automatically unlock matching applications.'
              : 'You did not achieve the required passing score. Feel free to review your technical skills and try again when you are ready.'
            }
          </p>

          <div className="flex gap-4 justify-center border-t border-white/5 pt-6">
            <button onClick={() => navigate('/candidate/jobs')} className="btn btn-outline">
              Back to Job Board
            </button>
            {!isPassed && (
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                Retake Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Test Runner Screen
  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIdx === totalQuestions - 1;
  const isSelected = selectedAnswers[currentQuestion.id] !== undefined;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 fade-in">
      {/* Test Progress & Stats */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">{test.title}</h2>
          <span className="text-xs text-slate-500 mt-1 block uppercase tracking-wider font-semibold">
            {test.roleCategory ? `${test.roleCategory} assessment` : 'general assessment'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <Clock size={16} className="text-emerald-400" />
          <span>Active Session</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 mb-8 border border-white/5 overflow-hidden">
        <div
          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
        ></div>
      </div>

      <div className="glass-card">
        {/* Question Panel */}
        <div className="mb-8">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-2">
            Question {currentIdx + 1} of {totalQuestions}
          </span>
          <h3 className="text-xl font-bold text-white leading-snug">
            {currentQuestion.questionText}
          </h3>
        </div>

        {/* Options Stack */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => {
            const isCurrentSelection = selectedAnswers[currentQuestion.id] === index;
            return (
              <button
                key={index}
                onClick={() => handleSelectOption(currentQuestion.id, index)}
                className={`w-full text-left p-4 rounded-xl border font-medium transition-all text-sm flex items-center justify-between ${
                  isCurrentSelection
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-900/80 hover:border-white/10'
                }`}
              >
                <span>{option}</span>
                <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isCurrentSelection ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-white/20'
                }`}>
                  {isCurrentSelection && <span className="h-2 w-2 rounded-full bg-white"></span>}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="btn btn-outline flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                'Submit Assessment'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isSelected}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              Next Question
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
