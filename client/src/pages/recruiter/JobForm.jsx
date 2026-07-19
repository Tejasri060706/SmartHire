import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, ListPlus, Send, Tag, FileText, Code } from 'lucide-react';

export default function JobForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [roleCategory, setRoleCategory] = useState('frontend');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Process skills into array
    const requiredSkills = skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    if (requiredSkills.length === 0) {
      setError('Please specify at least one required skill.');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/jobs', {
        title,
        description,
        requiredSkills,
        roleCategory,
      });
      navigate('/recruiter/dashboard');
    } catch (err) {
      console.error('Failed to post job:', err);
      const errMsg = err.response?.data?.error || 'Failed to create job posting.';
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <ListPlus size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Post a New Job</h1>
          <p className="text-slate-400 text-sm mt-1">Specify role details, categories, and technical skill requirements</p>
        </div>
      </div>

      <div className="glass-card">
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500">
                <Briefcase size={18} />
              </span>
              <input
                type="text"
                required
                className="form-input w-full pl-12"
                placeholder="e.g. Senior React Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="form-group mb-0">
              <label className="form-label">Role Category</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-500">
                  <Tag size={18} />
                </span>
                <select
                  className="form-input w-full pl-12 appearance-none bg-slate-900"
                  value={roleCategory}
                  onChange={(e) => setRoleCategory(e.target.value)}
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="ai-ml">AI & Machine Learning</option>
                </select>
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="form-label">Required Skills (Comma-separated)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-500">
                  <Code size={18} />
                </span>
                <input
                  type="text"
                  required
                  className="form-input w-full pl-12"
                  placeholder="React, TypeScript, CSS, Git"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group mb-8">
            <label className="form-label">Job Description</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-500">
                <FileText size={18} />
              </span>
              <textarea
                required
                rows={6}
                className="form-input w-full pl-12 py-3 resize-none"
                placeholder="Provide a detailed description of the role, responsibilities, and qualifications required..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/recruiter/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              {isSubmitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <Send size={18} />
                  Post Job Posting
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
