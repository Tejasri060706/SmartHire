import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FileText,
  Briefcase,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Brain,
  ThumbsUp,
  AlertCircle,
  Activity
} from 'lucide-react';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, analRes] = await Promise.all([
        axios.get('https://smarthire-backend-riay.onrender.com/api/candidate/dashboard'),
        axios.get('https://smarthire-backend-riay.onrender.com/api/candidate/analysis')
      ]);
      setDashboard(dashRes.data);
      setAnalysis(analRes.data);
    } catch (err) {
      console.error('Error fetching candidate dashboard data:', err);
      setError('Could not load dashboard information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">Assembling career metrics...</p>
        </div>
      </div>
    );
  }

  const generalTest = dashboard?.tests?.find(t => t.type === 'GENERAL');
  const roleTests = dashboard?.tests?.filter(t => t.type === 'ROLE_SPECIFIC') || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 fade-in">
      
      {/* Welcome Banner */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Monitor credentials, aggregate test feedback, and browse career paths</p>
        </div>

        {/* Quick action linking */}
        <div className="flex gap-3">
          <Link to="/candidate/jobs" className="btn btn-outline text-xs">
            Browse Jobs
          </Link>
          <Link to="/candidate/resume" className="btn btn-primary text-xs">
            Update Resume
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Resume status card */}
        <div className="glass-card flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Resume Sync Status</span>
            <span className="text-lg font-extrabold text-white mt-1 block">
              {dashboard?.hasResume ? 'SYNC ACTIVE' : 'MISSING PROFILE'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              {dashboard?.hasResume ? `Updated: ${new Date(dashboard.resumeUploadedAt).toLocaleDateString()}` : 'Upload resume to unlock'}
            </span>
          </div>
        </div>

        {/* Applications card */}
        <Link to="/candidate/applications" className="glass-card flex items-center gap-5 relative overflow-hidden group text-decoration-none">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Applications</span>
            <span className="text-3xl font-extrabold text-white mt-0.5 block">{dashboard?.applicationsCount || 0}</span>
            <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 mt-0.5 hover:text-indigo-300">
              Track Status
              <ChevronRight size={10} />
            </span>
          </div>
        </Link>

        {/* General aptitude test status */}
        <div className="glass-card flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award size={22} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">General Aptitude</span>
            {generalTest?.hasAttempted ? (
              <div className="mt-1">
                <span className="text-lg font-extrabold text-white">Score: {generalTest.highestScore}%</span>
                <span className={`badge ${generalTest.passed ? 'badge-success' : 'badge-danger'} text-[8px] ml-2`}>
                  {generalTest.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
            ) : (
              <button
                onClick={() => navigate(`/candidate/tests/${generalTest?.id}`)}
                className="btn btn-secondary py-1 px-3 text-[10px] h-max mt-2"
              >
                Take Assessment
              </button>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Assessment Gating Center */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card">
            <div className="border-b border-white/5 pb-4 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity size={20} className="text-emerald-400" />
                Category Assessments Gating
              </h3>
              <p className="text-xs text-slate-500 mt-1">Pass role assessments to unlock corresponding job applications</p>
            </div>

            <div className="space-y-4">
              {roleTests.map((t) => (
                <div key={t.id} className="p-5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-slate-900/80">
                  <div>
                    <span className="badge badge-info text-[9px] mb-2">{t.roleCategory}</span>
                    <h4 className="font-bold text-white text-base">{t.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Requires score ≥ {t.passScore}% to pass</p>
                  </div>

                  <div className="shrink-0 flex items-center gap-4">
                    {t.hasAttempted ? (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Highest Score</span>
                          <span className={`text-base font-bold ${t.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.highestScore}%
                          </span>
                        </div>
                        <span className={`badge ${t.passed ? 'badge-success' : 'badge-danger'} text-[10px]`}>
                          {t.passed ? 'Unlocked' : 'Locked'}
                        </span>
                        {!t.passed && (
                          <button
                            onClick={() => navigate(`/candidate/tests/${t.id}`)}
                            className="btn btn-primary py-2 px-3 text-xs"
                          >
                            Retake
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/candidate/tests/${t.id}`)}
                        className="btn btn-secondary py-2 px-4 text-xs"
                      >
                        Start Assessment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analytics Feedback & Recommendations */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Strengths & Weaknesses */}
          <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Brain size={18} className="text-emerald-400" />
              Skill Analytics Feedback
            </h3>

            <div className="space-y-4">
              {/* Strengths */}
              <div>
                <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider block mb-2">Verified Strengths</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis?.strongTopics?.length > 0 ? (
                    analysis.strongTopics.map((topic, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {topic}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No verified strengths yet. Pass tests to show skills!</span>
                  )}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wider block mb-2">Improvement Areas</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis?.weakTopics?.length > 0 ? (
                    analysis.weakTopics.map((topic, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded bg-amber-500/5 text-amber-400 border border-amber-500/10 font-medium">
                        {topic}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None logged. Complete assessments to evaluate areas.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Roles */}
          <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ThumbsUp size={18} className="text-indigo-400" />
              Recommended Categories
            </h3>

            <div className="space-y-3">
              {analysis?.recommendedRoles?.map((role, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-slate-900/40 border border-white/5 flex items-center justify-between"
                >
                  <span className="text-sm font-bold text-slate-200 capitalize">{role} roles</span>
                  <Link
                    to={`/candidate/jobs`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
                  >
                    Browse
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
              {!analysis?.recommendedRoles?.length && (
                <p className="text-xs text-slate-500 italic">Upload your resume to receive AI recommended role tracks.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
