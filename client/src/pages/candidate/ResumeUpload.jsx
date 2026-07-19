import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const fetchLatestResume = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/resumes/latest');
      setResume(res.data.resume);
    } catch (err) {
      console.log('No resume uploaded yet.');
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setError('');
    setSuccess('');
    
    if (!selected) return;

    // Validate size (5MB)
    if (selected.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    setFile(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post('http://localhost:5000/api/resumes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Resume uploaded and parsed successfully!');
      setResume(res.data.resume);
      setFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload and parse resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Resume Analytics Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Upload your resume to extract skills, aggregate experience, and qualify for match scoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Upload Form */}
        <div className="glass-card md:col-span-1">
          <h3 className="text-lg font-bold text-white mb-4">Upload Resume</h3>
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle size={14} className="shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div className="border border-dashed border-white/10 rounded-xl p-6 bg-slate-900/50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/30 transition-all mb-4 relative">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
              />
              <UploadCloud size={32} className="text-slate-400 mb-2 group-hover:text-emerald-400" />
              <span className="text-xs text-slate-300 font-semibold block mb-1">
                {file ? file.name : 'Select PDF, DOCX, or TXT'}
              </span>
              <span className="text-[10px] text-slate-500">Max size 5MB</span>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                'Extract Resume Data'
              )}
            </button>
          </form>
        </div>

        {/* Parsed Profile Displays */}
        <div className="md:col-span-2 space-y-6">
          {fetching ? (
            <div className="glass-card flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-3"></div>
              <p className="text-slate-400 text-sm font-medium">Validating resume profile...</p>
            </div>
          ) : resume ? (
            <div className="glass-card fade-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Parsed Profile Information</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                </div>
                <span className="badge badge-success flex items-center gap-1">
                  <Sparkles size={12} />
                  AI Sync Active
                </span>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">Extracted Skills</span>
                <div className="flex flex-wrap gap-2">
                  {resume.skills && resume.skills.length > 0 ? (
                    resume.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 italic">No skills extracted.</span>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Work Experience Summary</span>
                <div className="flex gap-3 bg-slate-900/40 p-4 rounded-xl border border-white/5">
                  <Briefcase className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {resume.experience || 'No experience summary provided.'}
                  </p>
                </div>
              </div>

              {/* Education */}
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Education History</span>
                <div className="flex gap-3 bg-slate-900/40 p-4 rounded-xl border border-white/5">
                  <GraduationCap className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {resume.education || 'No education details provided.'}
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card text-center py-20">
              <UploadCloud size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Profile Sync Active</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Please upload a resume file (PDF, TXT, or DOCX) in the upload card. 
                Our AI parser will analyze your technical qualifications to unlock job matches.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
