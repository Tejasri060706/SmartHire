import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ListTodo,
  CheckCircle,
  Clock,
  Calendar,
  Video,
  MapPin,
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/candidate/applications');
      setApplications(res.data.applications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Could not retrieve application records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    return 'text-red-400 border-red-500/20 bg-red-500/10';
  };

  const getStepStatus = (status, currentStep) => {
    const stepsOrder = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'HIRED'];
    const currentIdx = stepsOrder.indexOf(status);
    const targetIdx = stepsOrder.indexOf(currentStep);

    if (status === 'REJECTED') {
      if (currentStep === 'APPLIED') return 'completed';
      return 'rejected';
    }

    if (currentIdx >= targetIdx) {
      return 'completed';
    } else if (currentIdx + 1 === targetIdx) {
      return 'active';
    }
    return 'pending';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">Retrieving application history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 fade-in">
      <div className="flex items-center gap-3 mb-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ListTodo size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Application Pipeline</h1>
          <p className="text-slate-400 text-sm mt-1">Track status updates, match ratings, and schedule records for active submissions</p>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="glass-card text-center py-16">
          <HelpCircle size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-6">
            You haven't applied to any job postings yet. Navigate to the job board to find matching open roles.
          </p>
          <a href="/candidate/jobs" className="btn btn-primary">
            Explore Careers
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {applications.map((app) => (
            <div key={app.id} className="glass-card relative overflow-hidden group">
              {/* Background glows */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>

              {/* Top details section */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                  <span className="badge badge-info text-[9px] mb-2">{app.roleCategory}</span>
                  <h3 className="text-xl font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">{app.jobTitle}</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">{app.companyName}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block font-medium">
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <div className={`border rounded-xl px-4 py-2 flex flex-col items-end ${getMatchScoreColor(app.matchScore)}`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-65">Match Score</span>
                    <span className="text-xl font-extrabold">{app.matchScore}%</span>
                  </div>
                  {app.status === 'REJECTED' && (
                    <span className="badge badge-danger text-[9px] mt-1">Rejected</span>
                  )}
                  {app.status === 'HIRED' && (
                    <span className="badge badge-success text-[9px] mt-1">Hired</span>
                  )}
                </div>
              </div>

              {/* Progress Stepper Section */}
              <div className="py-6">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-6">Pipeline Progress</span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm shrink-0 shadow-lg shadow-emerald-500/10 border border-emerald-500/30">
                      1
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-xs">Applied</h5>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Record submitted</span>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm shrink-0 border transition-all ${
                      getStepStatus(app.status, 'SHORTLISTED') === 'completed'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : getStepStatus(app.status, 'SHORTLISTED') === 'active'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : getStepStatus(app.status, 'SHORTLISTED') === 'rejected'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-slate-900 border-white/10 text-slate-500'
                    }`}>
                      2
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-xs">Shortlist</h5>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {getStepStatus(app.status, 'SHORTLISTED') === 'rejected' ? 'Profile rejected' : 'Resume matching'}
                      </span>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm shrink-0 border transition-all ${
                      getStepStatus(app.status, 'INTERVIEW_SCHEDULED') === 'completed'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : getStepStatus(app.status, 'INTERVIEW_SCHEDULED') === 'active'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : getStepStatus(app.status, 'INTERVIEW_SCHEDULED') === 'rejected'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-slate-900 border-white/10 text-slate-500'
                    }`}>
                      3
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-xs">Interview</h5>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {getStepStatus(app.status, 'INTERVIEW_SCHEDULED') === 'rejected' ? 'Closed' : 'Assessment review'}
                      </span>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm shrink-0 border transition-all ${
                      app.status === 'HIRED'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : app.status === 'REJECTED'
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-slate-900 border-white/10 text-slate-500'
                    }`}>
                      4
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-xs">Decision</h5>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {app.status === 'HIRED' ? 'Hired!' : app.status === 'REJECTED' ? 'Rejected' : 'Pending review'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview info block if scheduled */}
              {app.interview && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {app.interview.mode === 'ONLINE' ? <Video size={18} /> : <MapPin size={18} />}
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-sm">
                        {app.interview.status === 'COMPLETED' ? 'Interview Completed' : 'Interview Scheduled'} ({app.interview.mode})
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(app.interview.scheduledTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {app.interview.notes && (
                    <div className="text-xs text-slate-400 max-w-lg italic border-l border-white/10 pl-3">
                      Notes from recruiter: "{app.interview.notes}"
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
