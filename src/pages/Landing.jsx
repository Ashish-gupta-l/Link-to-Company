import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Medal, Bot, Briefcase, Users, Building2, GraduationCap, Route, Sparkles, BarChart3, CircleCheck, CheckCircle2 } from 'lucide-react';
import { profileMock, journeySteps, portals, intelligenceFeatures } from '../mock';

const iconMap = {
  ShieldCheck, Medal, Bot, Briefcase, Users, Building2, GraduationCap, Route, Sparkles, BarChart3, CircleCheck,
};

const Landing = () => {
  return (
    <div className="bg-[#050508] text-white min-h-screen">
      {/* HERO */}
      <section className="relative pt-[62px] overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(37,99,235,0.15),transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_80%,rgba(34,197,94,0.08),transparent_60%)]"></div>
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
          }}></div>
          {/* Constellation dots */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="rgba(34, 197, 94, 0.35)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid lg:grid-cols-[1.1fr,1fr] gap-14 items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-mono text-[11px] mb-8">
                <span className="opacity-70">SIH 2026</span>
                <span className="opacity-40">·</span>
                <span>Academia–Industry Collaboration</span>
              </div>

              <h1 className="font-display font-black tracking-tight leading-[0.95] text-white text-[56px] md:text-[76px]">
                Prove your skills.<br />
                <span className="text-blue-500">Get discovered.</span><br />
                Link to opportunities.
              </h1>

              <p className="mt-8 text-white/60 text-base md:text-lg max-w-xl leading-relaxed">
                LinktoCompany replaces resume-first filtering with verified assessments, real company challenges, AI career action plans, and automatic shortlists.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-emerald-400 hover:bg-emerald-300 transition-colors text-black font-semibold text-sm">
                  Start proving skills <ArrowRight size={16} />
                </Link>
                <a href="#how-it-works" className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-white/15 hover:border-white/40 hover:bg-white/5 transition-colors text-white text-sm">
                  View the journey
                </a>
              </div>
            </div>

            {/* RIGHT: Evidence profile card */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/10 rounded-2xl blur-xl"></div>
              <div className="relative rounded-xl border border-white/10 bg-[#0b0d13]/90 backdrop-blur-sm p-6 md:p-7">
                <div className="text-[11px] tracking-[0.24em] uppercase text-white/40 font-mono mb-3">Evidence profile</div>
                <div className="font-display font-black text-3xl md:text-4xl text-white">{profileMock.name}</div>
                <div className="text-white/50 text-sm mt-1">{profileMock.title}</div>

                <div className="h-px bg-white/10 my-5"></div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Trust score" value={`${profileMock.trustScore}/100`} />
                  <StatCard label="Skill readiness" value={`${profileMock.skillReadiness}%`} />
                  <StatCard label="Challenges" value={`${profileMock.challengesSolved} solved`} />
                  <StatCard label="Verified skills" value={`${profileMock.verifiedSkillsCount} skills`} />
                </div>

                <div className="mt-4 space-y-2">
                  {profileMock.verifiedSkills.map((s) => (
                    <div key={s.name} className="flex items-center justify-between rounded-md border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3 font-mono text-sm">
                      <span className="text-emerald-400">{s.name} <span className="text-white/40">·</span> {s.level}</span>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative bg-[#0a0c11] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-[11px] tracking-[0.24em] uppercase text-emerald-400 font-mono mb-5">Challenge-based hiring</div>
          <h2 className="font-display font-black text-white text-4xl md:text-5xl leading-[1.05] max-w-2xl">
            From learning to direct opportunity.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
            {journeySteps.map((step) => {
              const Icon = iconMap[step.icon];
              return (
                <div key={step.id} className="group relative rounded-lg border border-white/10 bg-[#0b0d13] p-6 hover:border-emerald-500/40 hover:bg-[#0e1218] transition-all">
                  <div className="flex items-start justify-between mb-10">
                    <div className="w-11 h-11 rounded-md border border-emerald-500/25 bg-emerald-500/5 flex items-center justify-center text-emerald-400">
                      <Icon size={20} />
                    </div>
                    <span className="font-mono text-xs text-white/30">{step.id}</span>
                  </div>
                  <h3 className="font-display font-black text-white text-2xl mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PORTALS */}
      <section id="portals" className="relative bg-[#050508] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-[1fr,1.4fr] gap-16">
            <div>
              <div className="text-[11px] tracking-[0.24em] uppercase text-blue-500 font-mono mb-5">Unified ecosystem</div>
              <h2 className="font-display font-black text-white text-4xl md:text-5xl leading-[1.05]">
                Four portals. One verified talent graph.
              </h2>
              <p className="text-white/55 text-base mt-6 max-w-md leading-relaxed">
                Students, colleges, companies, and faculty operate on shared evidence: verified skills, challenge outcomes, projects, and opportunity conversion.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {portals.map((p) => {
                const Icon = iconMap[p.icon];
                return (
                  <div key={p.title} className="rounded-lg border border-white/10 bg-[#0b0d13] p-6 hover:border-blue-500/40 transition-all">
                    <div className="w-10 h-10 rounded-md border border-blue-500/25 bg-blue-500/5 flex items-center justify-center text-blue-400 mb-6">
                      <Icon size={18} />
                    </div>
                    <h3 className="font-display font-black text-white text-xl mb-2">{p.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* INTELLIGENCE */}
      <section id="intelligence" className="relative bg-[#050508] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-4">
            {intelligenceFeatures.map((f) => {
              const Icon = iconMap[f.icon];
              return (
                <div key={f.title} className="rounded-lg border border-white/10 bg-[#0b0d13] p-6 hover:border-emerald-500/40 transition-all">
                  <div className="text-emerald-400 mb-6"><Icon size={22} /></div>
                  <h3 className="font-display font-black text-white text-xl mb-3">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>

          {/* CTA banner */}
          <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b0d13] to-[#0a0f18] p-10 md:p-14 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <div className="text-[11px] tracking-[0.24em] uppercase text-emerald-400 font-mono mb-4">Ready when you are</div>
                <h3 className="font-display font-black text-white text-3xl md:text-4xl leading-tight max-w-xl">
                  Skip the resume. Prove the skill. Land the interview.
                </h3>
              </div>
              <div className="flex gap-3">
                <Link to="/auth" className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-emerald-400 hover:bg-emerald-300 transition-colors text-black font-semibold text-sm">
                  Enter platform <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="rounded-md border border-white/10 bg-white/[0.02] px-4 py-3">
    <div className="text-[11px] text-white/40 mb-1">{label}</div>
    <div className="font-display font-black text-white text-xl md:text-[22px]">{value}</div>
  </div>
);

export default Landing;
