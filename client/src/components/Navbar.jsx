import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LogOut,
  User,
  Briefcase,
  FileText,
  MessageSquare,
  PlusCircle,
  BarChart2,
  ListTodo,
  Info,
  PhoneCall,
  LogIn,
  UserPlus,
  Sun,
  Moon
} from 'lucide-react';
import logoImg from '../assets/smartHire.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all text-sm
    ${isActive(path) 
      ? 'nav-link-active' 
      : 'nav-link-inactive'}
  `;

  return (
    <nav className="floating-navbar">
      {/* Brand/Logo */}
      <Link to="/" className="flex items-center text-slate-900 text-xl font-bold font-display tracking-tight text-decoration-none group hover:scale-[1.02] transition-transform duration-200">
        <img src={logoImg} alt="Smart Hire Logo" className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
      </Link>

      {/* Dynamic Navigation Tabs based on Auth State & Role */}
      <div className="flex items-center gap-1">
        {!user ? (
          <>
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>
            <Link to="/about" className={linkClass('/about')}>
              About Us
            </Link>
            <Link to="/contact" className={linkClass('/contact')}>
              Contact Us
            </Link>
          </>
        ) : user.role === 'CANDIDATE' ? (
          <>
            <Link to="/candidate/dashboard" className={linkClass('/candidate/dashboard')}>
              <BarChart2 size={16} />
              Dashboard
            </Link>
            <Link to="/candidate/resume" className={linkClass('/candidate/resume')}>
              <FileText size={16} />
              My Resume
            </Link>
            <Link to="/candidate/jobs" className={linkClass('/candidate/jobs')}>
              <Briefcase size={16} />
              Browse Jobs
            </Link>
            <Link to="/candidate/applications" className={linkClass('/candidate/applications')}>
              <ListTodo size={16} />
              Applications
            </Link>
            <Link to="/candidate/chat" className={linkClass('/candidate/chat')}>
              <MessageSquare size={16} />
              AI Chat
            </Link>
          </>
        ) : (
          <>
            <Link to="/recruiter/dashboard" className={linkClass('/recruiter/dashboard')}>
              <BarChart2 size={16} />
              Dashboard
            </Link>
            <Link to="/recruiter/jobs/new" className={linkClass('/recruiter/jobs/new')}>
              <PlusCircle size={16} />
              Post a Job
            </Link>
          </>
        )}
      </div>

      {/* User Account Controls or Public Login Buttons */}
      <div className="flex items-center gap-4">
        {/* Sun/Moon Toggle pill */}
        <div 
          onClick={toggleTheme}
          className="theme-toggle-pill hidden sm:flex"
        >
          <div 
            className="theme-toggle-ball"
            style={{ transform: isDark ? 'translateX(24px)' : 'translateX(0)' }}
          >
            {isDark ? (
              <Moon size={11} className="text-slate-700 fill-slate-700/20" />
            ) : (
              <Sun size={11} className="text-amber-500 fill-amber-500/20" />
            )}
          </div>
        </div>

        {!user ? (
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn py-2 px-5 text-xs font-semibold rounded-full border border-slate-300 bg-white text-indigo-600 hover:bg-slate-50 transition-all shadow-sm">
              Login
            </Link>
            <Link to="/register" className="btn py-2 px-5 text-xs font-semibold rounded-full bg-slate-950 text-white hover:bg-black transition-all shadow-md border border-slate-800">
              Sign Up
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-slate-800 text-sm font-semibold">{user.name}</span>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{user.role}</span>
            </div>
            
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-200 text-sm font-medium"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
