import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate warm submission response
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 900);
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 min-h-screen text-slate-100 pb-20 px-6 py-12">
      {/* Background ambient animations */}
      <div className="absolute top-[20%] right-[-5%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl animate-float -z-10"></div>
      <div className="absolute bottom-[20%] left-[-5%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-3xl animate-float-reverse -z-10"></div>

      <div className="max-w-5xl mx-auto">
        
        {/* Title Header */}
        <div className="text-center mb-16 space-y-3 animate-slide-up stagger-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <PhoneCall size={24} className="animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Let's Connect</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Have questions about career checks, job listings, or recruiter onboarding? Drop us a line.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Contact Details cards */}
          <div className="lg:col-span-1 space-y-6 animate-slide-up stagger-2">
            
            <div className="glass-card flex items-center gap-4 group hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Email Support</span>
                <span className="text-sm font-semibold text-slate-200 block mt-0.5">hello@smarthire.co</span>
              </div>
            </div>

            <div className="glass-card flex items-center gap-4 group hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Global HQ</span>
                <span className="text-sm font-semibold text-slate-200 block mt-0.5">100 Pine St, San Francisco, CA</span>
              </div>
            </div>

            <div className="glass-card flex items-center gap-4 group hover:border-amber-500/30 transition-all duration-300">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Clock size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Hours</span>
                <span className="text-sm font-semibold text-slate-200 block mt-0.5">Mon - Fri, 9 AM - 6 PM PST</span>
              </div>
            </div>

          </div>

          {/* Form Panel */}
          <div className="lg:col-span-2 animate-slide-up stagger-3">
            <div className="glass-card relative">
              <h3 className="text-xl font-bold text-white mb-2">Send us a friendly message</h3>
              <p className="text-slate-400 text-xs mb-6">Fill out your details below and our team will get back to you within 24 hours.</p>

              {submitted && (
                <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-sm text-emerald-400 flex items-start gap-3 fade-in">
                  <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-400 animate-bounce" />
                  <div>
                    <h4 className="font-bold text-emerald-200 mb-1">Message Sent Successfully</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Thank you for reaching out! We have received your thoughts and will contact you shortly. Let's build something great together.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      required
                      className="form-input w-full"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      className="form-input w-full"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group mb-6">
                  <label className="form-label">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="form-input w-full resize-none"
                    placeholder="Tell us what you're working on or how we can help..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full flex items-center justify-center gap-2 py-3.5 group"
                >
                  {submitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  ) : (
                    <>
                      <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
