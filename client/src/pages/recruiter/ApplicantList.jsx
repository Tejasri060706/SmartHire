import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Calendar,
  UserCheck,
  AlertTriangle,
  UserX,
  Sparkles,
  ArrowUpDown,
  Mail,
  FileText,
  Clock,
  Video,
  MapPin,
  X,
  Check
} from 'lucide-react';

export default function ApplicantList() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('matchScore'); // 'matchScore' or 'appliedAt'
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Interview modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [mode, setMode] = useState('ONLINE');
  const [notes, setNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, [jobId, sortBy]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/jobs/${jobId}/applicants?sort=${sortBy}`);
      setApplicants(res.data.applicants);
      setJobTitle(res.data.jobTitle);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Could not retrieve candidate lists for this position.');
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (appId) => {
    setActionError('');
    try {
      await axios.post(`http://localhost:5000/api/applications/${appId}/shortlist`);
      fetchApplicants();
    } catch (err) {
      console.error('Shortlist failed:', err);
      setActionError(err.response?.data?.error || 'Failed to shortlist candidate.');
    }
  };

  const handleReject = async (appId) => {
    setActionError('');
    try {
      await axios.post(`http://localhost:5000/api/applications/${appId}/reject`);
      fetchApplicants();
    } catch (err) {
      console.error('Rejection failed:', err);
      setActionError(err.response?.data?.error || 'Failed to reject candidate.');
    }
  };

  const handleHire = async (appId) => {
    setActionError('');
    try {
      await axios.post(`http://localhost:5000/api/applications/${appId}/hire`);
      fetchApplicants();
    } catch (err) {
      console.error('Hire failed:', err);
      setActionError(err.response?.data?.error || 'Failed to hire candidate.');
    }
  };

  const handleOpenScheduleModal = (appId) => {
    setSelectedAppId(appId);
    setScheduledTime('');
    setMode('ONLINE');
    setNotes('');
    setShowModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId || !scheduledTime) return;

    setScheduling(true);
    setActionError('');

    try {
      await axios.post(`http://localhost:5000/api/applications/${selectedAppId}/interview`, {
        scheduledTime,
        mode,
        notes,
      });
      setShowModal(false);
      fetchApplicants();
    } catch (err) {
      console.error('Scheduling failed:', err);
      setActionError(err.response?.data?.error || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  const getMatchScoreBadge = (score) => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-danger';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED': return 'badge-info';
      case 'SHORTLISTED': return 'badge-warning';
      case 'INTERVIEW_SCHEDULED': return 'badge-success';
      case 'REJECTED': return 'badge-danger';
      case 'HIRED': return 'badge-success';
      default: return 'badge-info';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">Analyzing applicant profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 fade-in relative">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="text-indigo-400" size={28} />
            Applicants for {jobTitle}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review candidates, skill overlap metrics, and coordinate scheduling</p>
        </div>

        {/* Toggle Sorting */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown size={14} />
            Sort By
          </span>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setSortBy('matchScore')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                sortBy === 'matchScore' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Match Score
            </button>
            <button
              onClick={() => setSortBy('appliedAt')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                sortBy === 'appliedAt' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Applied Date
            </button>
          </div>
        </div>
      </div>

      {(error || actionError) && (
        <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error || actionError}
        </div>
      )}

      {applicants.length === 0 ? (
        <div className="glass-card text-center py-20">
          <Users size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Applicants Yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">Candidates who apply to this role will appear here ranked by their AI qualifications profile.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applicants.map((app) => (
            <div key={app.applicationId} className="glass-card flex flex-col lg:flex-row justify-between gap-6 relative overflow-hidden group">
              
              {/* Left Column: Candidate Main Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{app.candidateName}</h3>
                  <span className={`badge ${getStatusBadge(app.status)}`}>{app.status}</span>
                  <a
                    href={`http://localhost:5000${app.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-500 hover:text-indigo-400 font-medium inline-flex items-center gap-1 transition-colors ml-2"
                  >
                    <FileText size={14} />
                    View Resume
                  </a>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail size={16} className="text-indigo-400" />
                  <span>{app.candidateEmail}</span>
                  <span className="h-3 w-px bg-white/10 mx-2"></span>
                  <span className="text-slate-500 text-xs">Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>

                {/* Skill Breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider block mb-2">Matched Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {app.matchedSkills.length > 0 ? (
                        app.matchedSkills.map((skill, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No direct matches.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-wider block mb-2">Missing Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {app.missingSkills.length > 0 ? (
                        app.missingSkills.map((skill, idx) => (
                          <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 border border-white/5 font-medium">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">None. Full skill overlap.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interview Information Display */}
                {app.interview && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
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
                      <div className="text-xs text-slate-400 max-w-md italic border-l border-white/10 pl-3">
                        "{app.interview.notes}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Match Score & Action Buttons */}
              <div className="flex flex-col justify-between items-end shrink-0 gap-6 lg:border-l lg:border-white/5 lg:pl-6">
                <div className="flex flex-col items-end">
                  <span className={`badge ${getMatchScoreBadge(app.matchScore)} text-xs py-1.5 px-3`}>
                    Score: {app.matchScore}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-400 animate-pulse" />
                    Narrative Fit Evaluated
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {app.status === 'APPLIED' && (
                    <>
                      <button
                        onClick={() => handleReject(app.applicationId)}
                        className="btn btn-outline flex items-center gap-1.5 py-2 px-3 text-xs text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white"
                      >
                        <UserX size={14} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleShortlist(app.applicationId)}
                        className="btn btn-primary flex items-center gap-1.5 py-2 px-3 text-xs"
                      >
                        <UserCheck size={14} />
                        Shortlist
                      </button>
                    </>
                  )}

                  {app.status === 'SHORTLISTED' && (
                    <>
                      <button
                        onClick={() => handleReject(app.applicationId)}
                        className="btn btn-outline flex items-center gap-1.5 py-2 px-3 text-xs text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white"
                      >
                        <UserX size={14} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleOpenScheduleModal(app.applicationId)}
                        className="btn btn-secondary flex items-center gap-1.5 py-2 px-3 text-xs"
                      >
                        <Calendar size={14} />
                        Schedule Interview
                      </button>
                    </>
                  )}

                  {app.status === 'INTERVIEW_SCHEDULED' && (
                    <>
                      <button
                        onClick={() => handleReject(app.applicationId)}
                        className="btn btn-outline flex items-center gap-1.5 py-2 px-3 text-xs text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white"
                      >
                        <UserX size={14} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleOpenScheduleModal(app.applicationId)}
                        className="btn btn-secondary flex items-center gap-1.5 py-2 px-3 text-xs"
                      >
                        <Calendar size={14} />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleHire(app.applicationId)}
                        className="btn btn-primary flex items-center gap-1.5 py-2 px-3 text-xs"
                      >
                        <Check size={14} />
                        Hire Candidate
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Scheduling Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md fade-in relative border border-white/10">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="text-indigo-400" size={20} />
              Schedule Candidate Interview
            </h3>
            <p className="text-slate-400 text-xs mb-6">Coordinate date, execution mode, and feedback notes</p>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Interview Time</label>
                <input
                  type="datetime-local"
                  required
                  className="form-input w-full"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Execution Mode</label>
                <select
                  className="form-input w-full bg-slate-900"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="ONLINE">Online Video Call</option>
                  <option value="OFFLINE">In-Person Office Visit</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Recruiter Notes (Optional)</label>
                <textarea
                  rows={3}
                  className="form-input w-full resize-none"
                  placeholder="e.g. Discuss technical architecture, salary expectations, timeline..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  className="btn btn-outline text-xs"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="btn btn-primary text-xs"
                >
                  {scheduling ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    'Confirm Schedule'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
