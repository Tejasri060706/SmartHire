import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Shield, Building, Award, UserCheck } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CANDIDATE'); // 'CANDIDATE' or 'RECRUITER'
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (role === 'RECRUITER' && (!companyName || companyName.trim() === '')) {
      setError('Company name is required for Recruiter registration');
      setIsSubmitting(false);
      return;
    }

    const res = await register(name, email, password, role, companyName);
    setIsSubmitting(false);

    if (res.success) {
      if (role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="glass-card w-full max-w-md fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
            <Shield size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 mt-2 text-sm font-medium">Join Smart Hire Talent Portal</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            {error}
          </div>
        )}

        {/* Role Toggle Selector */}
        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-white/5 mb-6">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              role === 'CANDIDATE'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            onClick={() => setRole('CANDIDATE')}
          >
            <User size={16} />
            Candidate
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              role === 'RECRUITER'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            onClick={() => setRole('RECRUITER')}
          >
            <Building size={16} />
            Recruiter
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                className="form-input w-full pl-12"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                className="form-input w-full pl-12"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                className="form-input w-full pl-12"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {role === 'RECRUITER' && (
            <div className="form-group fade-in">
              <label className="form-label">Company Name</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-500">
                  <Building size={18} />
                </span>
                <input
                  type="text"
                  required
                  className="form-input w-full pl-12"
                  placeholder="e.g. Google, SageTech Systems"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full mt-4"
          >
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <UserCheck size={18} />
                Register Now
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
