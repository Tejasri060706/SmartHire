import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';

export default function JobBrowse() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Track applied jobs locally to reflect updates instantly
  const [appliedJobs, setAppliedJobs] = useState({});
  const [gateTestRequired, setGateTestRequired] = useState(null); // { jobId, testId, roleCategory }

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedCategory 
        ? `http://localhost:5000/api/jobs?roleCategory=${selectedCategory}`
        : 'http://localhost:5000/api/jobs';
      const res = await axios.get(url);
      setJobs(res.data.jobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Could not retrieve job listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      // In M2: we retrieve candidates' applications list to check already applied jobs
      const res = await axios.get('http://localhost:5000/api/candidate/applications');
      const mapping = {};
      res.data.applications.forEach(app => {
        mapping[app.jobId] = app.status;
      });
      setAppliedJobs(mapping);
    } catch (err) {
      // If endpoint doesn't exist yet, we fail silently or initialize empty
      console.log('Applications endpoint not ready or empty');
    }
  };

  const handleApply = async (jobId) => {
    setError('');
    setSuccessMsg('');
    setGateTestRequired(null);

    try {
      const res = await axios.post(`http://localhost:5000/api/jobs/${jobId}/apply`);
      setSuccessMsg('Application submitted successfully!');
      setAppliedJobs(prev => ({ ...prev, [jobId]: 'APPLIED' }));
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Application failed:', err);
      if (err.response?.status === 403 && err.response?.data?.requiredTest) {
        // Gated test required
        const { testId, roleCategory } = err.response.data.requiredTest;
        setGateTestRequired({ jobId, testId, roleCategory });
      } else {
        setError(err.response?.data?.error || 'Failed to submit application.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getMatchScoreColor = (score) => {
    if (!score) return 'badge-info';
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Briefcase className="text-emerald-400" size={28} />
            Explore Job Openings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Discover roles and view match rankings based on your AI parsed resume</p>
        </div>

        {/* Category Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 self-start md:self-auto">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === '' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('frontend')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'frontend' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Frontend
          </button>
          <button
            onClick={() => setSelectedCategory('backend')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'backend' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Backend
          </button>
          <button
            onClick={() => setSelectedCategory('ai-ml')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'ai-ml' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI & ML
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-5 text-sm text-red-400 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-200 mb-1">Application Error</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-sm text-emerald-400 flex items-start gap-3">
          <CheckCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-200 mb-1">Success</h4>
            <p>{successMsg}</p>
          </div>
        </div>
      )}

      {gateTestRequired && (
        <div className="mb-8 rounded-xl bg-amber-500/10 border border-amber-500/20 p-6 text-sm text-amber-400 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <h4 className="font-bold text-amber-200 text-base mb-1">Test Gate Required</h4>
              <p className="text-slate-300">
                You must pass the <span className="font-semibold uppercase text-amber-400">{gateTestRequired.roleCategory}</span> test to apply. 
                Passing this test unlocks all jobs in the category.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/candidate/tests/${gateTestRequired.testId}`)}
            className="btn btn-secondary shrink-0 flex items-center gap-2 hover:translate-x-1"
          >
            Take Skill Assessment
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-slate-400 font-medium">Fetching active job listings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card text-center py-16">
          <HelpCircle size={48} className="mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Jobs Found</h3>
          <p className="text-slate-400 max-w-md mx-auto">There are currently no open positions listed in this category. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => {
            const isApplied = appliedJobs[job.id];
            
            return (
              <div key={job.id} className="glass-card flex flex-col justify-between h-full relative overflow-hidden group">
                {/* Background glow decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>

                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="badge badge-info mb-2 text-[10px] tracking-widest">{job.roleCategory}</span>
                      <h3 className="text-xl font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                      <p className="text-slate-400 text-sm font-medium mt-1">{job.companyName}</p>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex flex-col items-end">
                      <span className={`badge ${getMatchScoreColor(job.matchScore)}`}>
                        {job.matchScore ? `Match: ${job.matchScore}%` : 'Match: N/A'}
                      </span>
                      {!job.matchScore && (
                        <span className="text-[10px] text-slate-500 mt-1 font-medium italic">Upload resume</span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Required Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((skill, index) => (
                        <span key={index} className="text-xs px-2.5 py-1 rounded bg-slate-900 text-slate-300 border border-white/5 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-auto flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  
                  {isApplied ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <CheckCircle size={16} />
                      Applied ({isApplied})
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="btn btn-primary btn-sm py-2 px-4 text-sm"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
