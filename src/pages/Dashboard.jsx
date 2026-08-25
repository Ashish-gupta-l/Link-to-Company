import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowUpRight, Sparkles, Trophy, Target, BookOpen, ShieldCheck, Zap } from 'lucide-react';
import { dashboardMock } from '../mock';
import { getSession, assessmentApi, challengeApi } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = getSession();
  const d = dashboardMock.student;
  const [attempts, setAttempts] = useState([]);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    assessmentApi.my().then((r) => setAttempts(r.attempts)).catch(() => {});
    challengeApi.list().then((r) => setChallenges(r.challenges.slice(0, 3))).catch(() => {});
  }, [user, navigate]);

  const verifiedFromServer = attempts.filter((a) => a.passed);
  const verifiedCount = verifiedFromServer.length || d.verifiedSkills;

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-[62px]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[11px] tracking-[0.24em] uppercase text-emerald-400 font-mono mb-3">{user?.role || 'Student'} portal</div>
            <h1 className="font-display font-black text-white text-4xl md:text-5xl leading-[1] flex items-baseline gap-3 flex-wrap">
              Welcome, <span className="text-blue-500">{(user?.name || 'Student').split(' ')[0]}</span>
            </h1>
            <p className="text-white/50 text-sm mt-2 font-mono">{user?.email}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/assessment" className="inline-flex items-center gap-2 rounded-md bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-sm px-4 py-2">
              <ShieldCheck size={16} /> Take assessment
            </Link>
            <Link to="/challenges" className="inline-flex items-center gap-2 rounded-md border border-white/15 hover:border-white/40 hover:bg-white/5 text-white text-sm px-4 py-2">
              <Zap size={16} /> Challenges
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          <BigStat label="Trust score" value={`${d.trustScore}/100`} accent="emerald" />
          <BigStat label="Skill readiness" value={`${d.skillReadiness}%`} accent="blue" />
          <BigStat label="Verified skills" value={verifiedCount} accent="emerald" />
          <BigStat label="Challenges solved" value={d.challengesSolved} accent="blue" />
          <BigStat label="Internships" value={d.internships} accent="emerald" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#0b0d13] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-1"><Sparkles size={14} /><span className="text-[11px] tracking-[0.24em] uppercase font-mono">AI Action plan</span></div>
                <h2 className="font-display font-black text-white text-2xl">Full Stack Developer track</h2>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-white/40 font-mono uppercase tracking-widest">Skill gap</div>
                <div className="font-display font-black text-white text-2xl">{100 - d.skillReadiness}%</div>
              </div>
            </div>
            <div className="space-y-2">
              {d.actionPlan.map((a) => (
                <div key={a.step} className="flex items-center gap-3 rounded-md border border-white/10 bg-[#0a0c11] px-4 py-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs ${a.status === 'in-progress' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-white/40 border border-white/10'}`}>{a.step}</div>
                  <div className="flex-1 text-sm text-white/80">{a.action}</div>
                  {a.status === 'in-progress' ? <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Active</span> : <Circle size={14} className="text-white/20" />}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono"><Target size={14} /> Missing: {d.missingSkills.join(' · ')}</div>
              <Link to="/assessment" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">Start next step <ArrowUpRight size={14} /></Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
              <div className="flex items-center gap-2 text-blue-400 mb-2"><Trophy size={14} /><span className="text-[11px] tracking-[0.24em] uppercase font-mono">Top skill</span></div>
              <div className="font-display font-black text-white text-3xl">{d.topSkill.name}</div>
              <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${d.topSkill.score}%` }}></div></div>
              <div className="text-white/50 text-xs mt-2 font-mono">Score · {d.topSkill.score}%</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
              <div className="flex items-center gap-2 text-emerald-400 mb-4"><BookOpen size={14} /><span className="text-[11px] tracking-[0.24em] uppercase font-mono">Verified skills</span></div>
              <div className="space-y-2">
                {verifiedFromServer.length === 0 && [{ n: 'JavaScript', v: '91%' }, { n: 'React', v: '88%' }, { n: 'MongoDB', v: 'Challenge proven' }].map((s) => (
                  <div key={s.n} className="flex items-center justify-between rounded-md border border-emerald-500/20 bg-emerald-500/[0.04] px-3 py-2 font-mono text-sm">
                    <span className="text-emerald-400">{s.n} <span className="text-white/40">·</span> {s.v}</span>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                ))}
                {verifiedFromServer.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-md border border-emerald-500/20 bg-emerald-500/[0.04] px-3 py-2 font-mono text-sm">
                    <span className="text-emerald-400">{a.skill} <span className="text-white/40">·</span> {a.score}%</span>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-black text-white text-xl">Recommended opportunities</h3>
              <span className="text-[11px] tracking-[0.24em] uppercase text-emerald-400 font-mono">Matched for you</span>
            </div>
            <div className="space-y-3">
              {d.recommendedOpportunities.map((o) => (
                <div key={o.id} className="rounded-md border border-white/10 bg-[#0a0c11] p-4 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div><div className="text-white font-semibold">{o.title}</div><div className="text-white/40 text-xs mt-0.5">{o.company}</div></div>
                    <div className="text-right"><div className="font-mono text-emerald-400 text-lg font-black">{o.match}%</div><div className="text-[10px] text-white/40 font-mono uppercase tracking-widest">match</div></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {o.matchReasons.map((r) => <span key={r} className="text-[10px] font-mono px-2 py-1 rounded border border-emerald-500/25 bg-emerald-500/5 text-emerald-400">{r}</span>)}
                    {o.improve.map((r) => <span key={r} className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 bg-white/5 text-white/50">+ {r}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-black text-white text-xl">Live company challenges</h3>
              <Link to="/challenges" className="text-[11px] tracking-[0.24em] uppercase text-blue-400 font-mono hover:text-blue-300">View all →</Link>
            </div>
            <div className="space-y-3">
              {(challenges.length ? challenges : d.liveChallenges).map((c) => (
                <div key={c.id} className="rounded-md border border-white/10 bg-[#0a0c11] p-4 hover:border-blue-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div><div className="text-white font-semibold">{c.title}</div><div className="text-white/40 text-xs mt-0.5">{c.company} · {c.category}</div></div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 bg-white/5 text-white/60">{c.deadline_days ? `${c.deadline_days}d` : c.deadline}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-white/40 font-mono">{c.participants || 0} students competing</div>
                    <Link to="/challenges" className="text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center gap-1">Attempt <ArrowUpRight size={12} /></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BigStat = ({ label, value, accent }) => (
  <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-5">
    <div className={`text-[10px] tracking-[0.22em] uppercase font-mono mb-2 ${accent === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`}>{label}</div>
    <div className="font-display font-black text-white text-2xl md:text-[26px]">{value}</div>
  </div>
);

export default Dashboard;
