import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  Users,
  CheckSquare,
  Award,
  PlusCircle,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://smarthire-backend-riay.onrender.com/api/recruiter/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching recruiter dashboard:', err);
      setError('Could not load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">Loading recruiter parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="text-indigo-400" size={28} />
            Recruitment Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review active pipeline matches, post new roles, and coordinate interviews</p>
        </div>
        <button
          onClick={() => navigate('/recruiter/jobs/new')}
          className="btn btn-secondary flex items-center gap-2 hover:scale-[1.02]"
        >
          <PlusCircle size={18} />
          Post New Position
        </button>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Metric 1 */}
        <div className="glass-card flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Openings</span>
            <span className="text-3xl font-extrabold text-white block mt-1">{stats?.openJobs || 0}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Applicants</span>
            <span className="text-3xl font-extrabold text-white block mt-1">{stats?.totalApplicants || 0}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CheckSquare size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Shortlisted Candidates</span>
            <span className="text-3xl font-extrabold text-white block mt-1">{stats?.shortlisted || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Posted Jobs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card">
            <h3 className="text-xl font-bold text-white mb-6">Active Jobs list</h3>
            
            {stats?.jobs?.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Briefcase size={32} className="mx-auto mb-2 opacity-45" />
                <p className="text-sm">No jobs posted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-3">Job Details</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Candidates</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {stats?.jobs?.map((job) => (
                      <tr key={job.id} className="group/row hover:bg-white/5 transition-all">
                        <td className="py-4 font-semibold text-white">
                          <div>{job.title}</div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="badge badge-info text-[9px]">{job.roleCategory}</span>
                        </td>
                        <td className="py-4 font-bold text-slate-300">
                          {job.applicantsCount} candidate(s)
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            to={`/recruiter/jobs/${job.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all text-xs font-semibold"
                          >
                            Applicants
                            <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Scorers Sideboard */}
        <div className="lg:col-span-1">
          <div className="glass-card h-full">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="text-emerald-400" size={20} />
              Top AI Matches
            </h3>

            {stats?.topScorers?.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-45" />
                <p className="text-sm">No match data available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.topScorers?.map((scorer, index) => (
                  <div key={index} className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">{scorer.candidateName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{scorer.jobTitle}</p>
                      <span className="badge badge-success text-[9px] mt-2 block w-max">{scorer.status}</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-emerald-400">{scorer.matchScore}%</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold mt-1">Match</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
