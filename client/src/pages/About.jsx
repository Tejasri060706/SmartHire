import React from "react";
import { motion } from "framer-motion";
import { Target, Heart, Sparkles, Users } from "lucide-react";
import teamCollaboration from '../assets/team_collaboration.png';


import tejasri from "../assets/Team/tejasri.jpeg";
import lavanya from "../assets/Team/lavanya.jpeg";
import jagruthi from "../assets/Team/jagruthi.jpeg";
import mounica from "../assets/Team/mounica.jpeg";
import keerthi from "../assets/Team/keerthi.jpeg";
import mourya from "../assets/Team/mourya.jpeg";


const teamMembers = [
  {
    name: "P. Teja Sri",
    role: "Frontend Developer",
    description:
      "Designed and implemented dynamic user interface components using React.js.",
    image: tejasri,
  },
  {
    name: "Dasari Lavanya",
    role: "UI/UX Designer",
    description:
      "Designed intuitive user interfaces, layouts, and an engaging user experience for the platform.",
    image: lavanya,
  },
  {
    name: "P.N. Jagruthi",
    role: "AI Skill Extraction Developer",
    description:
      "Developed AI modules to extract candidate skills, education, and experience using Gemini AI.",
    image: jagruthi,
  },
  {
    name: "Palukuri Mounica",
    role: "AI Job Matching Developer",
    description:
      "Built the AI-powered candidate-job matching and ranking system using Gemini AI.",
    image: mounica,
  },
  {
    name: "Keerthi Lathika Yeluri",
    role: "Database Developer (SQLite)",
    description:
      "Designed and managed the SQLite database using Prisma ORM for resumes, jobs, and user data.",
    image: keerthi,
  },
  {
    name: "Mourya Tandasa",
    role: "Backend Developer (Node.js & Express.js)",
    description:
      "Developed backend APIs, authentication, and business logic using Node.js and Express.js.",
    image: mourya,
  },
];
export default function About() {


  return (
    <div className="relative overflow-hidden bg-slate-950 min-h-screen text-slate-100 pb-20 px-6 py-12">
      {/* Animated ambient background */}
      <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl animate-float -z-10"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl animate-float-reverse -z-10"></div>

      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Title Header */}
        <div className="text-center space-y-3 animate-slide-up stagger-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Heart size={24} className="animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Our Story & Mission</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Connecting builders and creators with teams that celebrate real capability.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up stagger-2">
          
          {/* Pillar 1 */}
          <div className="glass-card text-center p-6 space-y-3 group hover:border-emerald-500/30 transition-all duration-300">
            <Target className="mx-auto text-emerald-400 group-hover:scale-110 transition-transform" size={26} />
            <h4 className="font-bold text-white text-base">Fair Opportunities</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We eliminate traditional credentials and profile bias by allowing candidates to prove their capabilities directly with real challenges.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-card text-center p-6 space-y-3 group hover:border-indigo-500/30 transition-all duration-300">
            <Heart className="mx-auto text-indigo-400 group-hover:scale-110 transition-transform" size={26} />
            <h4 className="font-bold text-white text-base">Growth Centered</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every attempt is a learning step. Receive customized tips from your Career Guide to master skills and expand your expertise.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-card text-center p-6 space-y-3 group hover:border-amber-500/30 transition-all duration-300">
            <Sparkles className="mx-auto text-amber-400 group-hover:scale-110 transition-transform" size={26} />
            <h4 className="font-bold text-white text-base">Skills First</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We replace cold screening pipelines with smart scores, making candidate identification instant and hiring processes collaborative.
            </p>
          </div>

        </div>

        {/* Vision & Image split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-slide-up stagger-3">
          
          <div className="lg:col-span-7 glass-card space-y-4">
            <h3 className="text-2xl font-bold text-white">Why we built Smart Hire</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              We spent years observing how talented developers got hidden behind automated resume screening systems simply due to lacking certain buzzwords. At the same time, recruiters struggled to filter hundreds of applicants without simple metrics.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Smart Hire was created to balance the equation. We provide developers a path to prove their skills objectively and let their accomplishments shine. For recruiters, we compile real match stats and verification levels, saving time and creating better career matches.
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group p-1.5">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:scale-105 transition-all duration-500 -z-10"></div>
              <img 
                src={teamCollaboration} 
                alt="Approachable modern team illustration" 
                className="w-full max-w-[380px] h-auto object-contain rounded-2xl border border-white/10 shadow-2xl animate-float-reverse"
              />
            </div>
          </div>

        </div>

               {/* Team Carousel */}

        <div className="animate-slide-up stagger-4">

          <h3 className="text-3xl font-bold text-center text-white mb-8">
            Meet Our Team
          </h3>

         <div className="overflow-hidden w-full">
  <motion.div
  className="flex gap-6"
  animate={{ x: ["0%", "-100%"] }}
  transition={{
    repeat: Infinity,
    repeatType: "loop",
    duration: 15,
    ease: "linear",
  }}
  whileHover={{}}
>
    {[...teamMembers, ...teamMembers].map((member, index) => (
      <div
        key={index}
        className="glass-card text-center p-6 rounded-2xl border border-white/10 flex-shrink-0 w-[300px]"
      >
        <img
          src={member.image}
          alt={member.name}
          className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-slate-700"
        />

        <h3 className="text-xl font-bold text-white">
          {member.name}
        </h3>

        <p className="text-emerald-400 font-semibold mt-2">
          {member.role}
        </p>

        <p className="text-slate-400 text-sm mt-4 leading-relaxed">
          {member.description}
        </p>
      </div>
    ))}
 </motion.div>
</div>

</div>

</div>
</div>

  );
}