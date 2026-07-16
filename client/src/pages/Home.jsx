import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  FileText,
  Activity,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Briefcase,
  Quote,
  Star
} from 'lucide-react';
import heroIllustration from '../assets/hero_illustration.png';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-slate-950 min-h-screen text-slate-100 pb-24">
      {/* Dynamic Animated Ambient Background Blobs */}
      <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl animate-float -z-10"></div>
      <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl animate-float-reverse -z-10"></div>
      <div className="absolute bottom-[10%] left-[25%] w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-3xl animate-float -z-10"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left animate-slide-up stagger-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={13} className="text-emerald-400 animate-pulse" />
              Empowering Human Connections Through Tech
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Find work you love. <br />
              Prove what you can <span className="text-gradient-primary">build.</span>
            </h1>
            
            <p className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed">
              Smart Hire is a warm, skills-first companion that helps you highlight genuine capabilities, test your strengths in real-time, and get shortlisted directly by hiring managers who care.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {user ? (
                <Link
                  to={user.role === 'RECRUITER' ? '/recruiter/dashboard' : '/candidate/dashboard'}
                  className="btn btn-primary px-8 py-4 flex items-center gap-2 group"
                >
                  Go to my Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary px-8 py-4 flex items-center gap-2 group">
                    Join as Candidate
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/register" className="btn btn-secondary px-8 py-4 flex items-center gap-2 group">
                    Hire with Smart Hire
                    <Briefcase size={18} className="group-hover:scale-110 transition-transform" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Right Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center animate-slide-up stagger-2">
            <div className="relative group p-2">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 rounded-2xl blur-2xl group-hover:scale-105 transition-all duration-500 -z-10"></div>
              <img 
                src={heroIllustration} 
                alt="Developer and Recruiter working together illustration" 
                className="w-full max-w-[480px] h-auto object-contain rounded-2xl border border-white/10 shadow-2xl animate-float"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Feature Grids */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">How Smart Hire works for you</h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            By shifting from rigid keywords to dynamic proofs of capability, we make talent matching transparent and human.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="glass-card flex flex-col items-start gap-4 p-8 animate-slide-up stagger-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <FileText size={22} />
            </div>
            <h3 className="text-xl font-bold text-white">Story-driven Resume parsing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We extract skills and experiences from your resume to highlight your story and technical credentials without letting keyword filters stand in your way.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card flex flex-col items-start gap-4 p-8 animate-slide-up stagger-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Activity size={22} />
            </div>
            <h3 className="text-xl font-bold text-white">Verify with Skill Checks</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Unlock roles by taking structured backend, frontend, or general tests. Verified scores help you stand out and prove you have what it takes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card flex flex-col items-start gap-4 p-8 animate-slide-up stagger-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-xl font-bold text-white">Your Personal Career Advisor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Receive suggestions and tips from our friendly AI counselor. It helps you review skill gaps, suggests tests, and finds roles suited just for you.
            </p>
          </div>

        </div>
      </section>

      {/* Community Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 bg-slate-900/10 rounded-3xl my-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Loved by developers and teams</h2>
          <p className="text-slate-400 text-sm">
            Read what candidates and hiring managers have experienced using Smart Hire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Testimonial 1 */}
          <div className="glass-card flex flex-col justify-between p-8 relative animate-slide-up stagger-1">
            <Quote size={32} className="text-emerald-500/20 absolute top-4 right-4" />
            <div className="space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "Smart Hire completely turned my job search around. Instead of getting stuck in resume screening loops, the interactive tests let me showcase my React and Node skills directly. The AI Chatbot gave me feedback that helped me grow."
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                SC
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Sarah Chen</h4>
                <span className="text-[10px] text-slate-400">Junior Fullstack Engineer</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="glass-card flex flex-col justify-between p-8 relative animate-slide-up stagger-2">
            <Quote size={32} className="text-indigo-500/20 absolute top-4 right-4" />
            <div className="space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-indigo-400 text-indigo-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "We were looking for backend engineers for months. Standard tests didn't feel practical. But Smart Hire's combined scoring of tests and parsed resumes gave us pre-vetted, highly matched applicants immediately. We cut review time in half!"
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/5">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                MV
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Marcus Vance</h4>
                <span className="text-[10px] text-slate-400">Head of Talent at GreenTree</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Statistics / Company Mission */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass-card bg-slate-900/40 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12 border border-white/5 animate-slide-up stagger-1">
          <div className="max-w-xl space-y-4">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Our Core Mission</span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">Eliminating Hiring Bias & Friction</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              We believe recruiting should be transparent and human. By helping developers benchmark their practical tech skills in a safe sandbox, we make sure recruiters find qualified builders and candidates feel validated and supported.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full md:w-auto shrink-0">
            <div className="bg-slate-950 p-6 rounded-xl border border-white/5 text-center shadow-lg group hover:border-emerald-500/30 transition-all duration-300">
              <span className="text-4xl font-extrabold text-emerald-400 block group-hover:scale-110 transition-transform">95%</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mt-2">Hiring Speedup</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-xl border border-white/5 text-center shadow-lg group hover:border-indigo-500/30 transition-all duration-300">
              <span className="text-4xl font-extrabold text-indigo-400 block group-hover:scale-110 transition-transform">4+</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mt-2">Skills Tracks</span>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
