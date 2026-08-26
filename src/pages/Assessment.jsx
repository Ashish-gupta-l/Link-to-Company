import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi, dashboardApi } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { AlertTriangle, ShieldCheck, Clock, Loader2, Award, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import AppLayout from '../components/AppLayout';

const Assessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [skills, setSkills] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [starting, setStarting] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [warnings, setWarnings] = useState(0);
  const [stats, setStats] = useState(null);
  const eventsRef = useRef([]);
  const terminatedRef = useRef(false);

  useEffect(() => {
    dashboardApi.stats().then((s) => setStats(s)).catch(() => {});
    assessmentApi.skills().then((r) => {
      setSkills(r.skills);
      const params = new URLSearchParams(location.search);
      const targetSkill = params.get('skill');
      if (targetSkill && r.skills.includes(targetSkill)) {
        startAssessment(targetSkill);
      }
    }).catch(() => {});
  }, [location.search]);

  // Timer
  useEffect(() => {
    if (!attempt || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [attempt, timeLeft, result]);

  // Anti-cheating
  useEffect(() => {
    if (!attempt || result) return;
    const record = (type) => {
      if (terminatedRef.current) return;
      eventsRef.current.push(type);
      setWarnings((w) => {
        const next = w + 1;
        if (next >= 3) {
          terminatedRef.current = true;
          toast({ title: 'Assessment terminated', description: 'Repeated suspicious activity detected.', variant: 'destructive' });
          handleSubmit(true);
        } else {
          toast({ title: 'Warning', description: `Suspicious activity detected (${type}). Attempt terminates after 3 warnings.`, variant: 'destructive' });
        }
        return next;
      });
    };
    const onBlur = () => record('blur');
    const onVisibility = () => { if (document.hidden) record('visibilitychange'); };
    const onFullscreen = () => { if (!document.fullscreenElement) record('fullscreen_exit'); };
    const onPaste = () => record('paste');
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('paste', onPaste);
    };
  }, [attempt, result]);

  const startAssessment = async (skill) => {
    try {
      setStarting(skill);
      const res = await assessmentApi.start(skill);
      setAttempt(res);
      setAnswers(new Array(res.questions.length).fill(-1));
      setTimeLeft(res.duration_seconds);
      setWarnings(0);
      eventsRef.current = [];
      terminatedRef.current = false;
      setResult(null);
      toast({ title: 'Assessment started', description: `${skill} · 10 minutes · max 3 warnings` });
    } catch (e) {
      toast({ title: 'Cannot start', description: e?.response?.data?.detail || 'Try again later', variant: 'destructive' });
    } finally {
      setStarting(null);
    }
  };

  const handleSubmit = async (forceDQ = false) => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    try {
      const res = await assessmentApi.submit({
        attempt_id: attempt.attempt_id,
        answers: answers.map((a) => (a < 0 ? 0 : a)),
        integrity_events: forceDQ ? [...eventsRef.current, 'terminated'] : eventsRef.current,
      });
      setResult(res);
      if (res.passed) {
        toast({ title: 'Skill verified!', description: `${attempt.skill} · ${res.score}%` });
      } else if (res.disqualified) {
        toast({ title: 'Attempt disqualified', description: 'Integrity threshold not met.', variant: 'destructive' });
      } else {
        toast({ title: 'Not passed', description: `Score ${res.score}%. Threshold: 70%.` });
      }
      dashboardApi.stats().then((s) => setStats(s)).catch(() => {});
    } catch (e) {
      toast({ title: 'Submit failed', description: e?.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <AppLayout stats={stats}>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <div className="text-[11px] tracking-[0.24em] uppercase text-emerald-400 font-mono mb-2 flex items-center gap-1.5 font-bold">
            <ShieldCheck size={14} /> PROCTORED SKILL VERIFICATION
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white">Prove a skill with anti-cheat proctoring.</h1>
          <p className="text-white/50 text-xs md:text-sm mt-1">
            Server-side timer, randomized questions, tab-switch monitoring, and integrity scoring. Scoring $\ge 80\%$ triggers direct recruiter interview invites.
          </p>
        </div>

        {!attempt && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills.map((s) => (
              <div key={s} className="rounded-xl border border-white/10 bg-[#0b0d13] p-5 flex items-center justify-between hover:border-emerald-500/40 transition-all">
                <div>
                  <div className="font-bold text-white text-base md:text-lg">{s}</div>
                  <div className="text-white/40 text-xs font-mono mt-0.5">5 questions · 10 min</div>
                </div>
                <Button onClick={() => startAssessment(s)} disabled={!!starting} className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs">
                  {starting === s ? <Loader2 size={14} className="animate-spin" /> : 'Start Quiz'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {attempt && !result && (
          <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <div className="text-[11px] tracking-widest uppercase text-emerald-400 font-mono font-bold">Assessment · {attempt.skill}</div>
                <div className="font-display font-black text-xl text-white mt-0.5">Answer all questions below</div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-xs ${warnings > 0 ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'}`}>
                  <ShieldCheck size={14} /> Integrity: {Math.max(0, 100 - warnings * 20)}%
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-500/40 bg-blue-500/10 text-blue-300 font-mono text-xs font-bold">
                  <Clock size={14} /> {mmss(timeLeft)}
                </div>
              </div>
            </div>

            {warnings > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-yellow-500/40 bg-yellow-500/5 px-3 py-2 text-yellow-300 text-xs">
                <AlertTriangle size={14} /> Warning {warnings}/3 · Do not switch tabs or blur the window.
              </div>
            )}

            <div className="space-y-4">
              {attempt.questions.map((q, qi) => (
                <div key={q.id} className="rounded-lg border border-white/10 bg-[#0a0c11] p-4 space-y-3">
                  <div className="text-white/40 font-mono text-xs">Question {qi + 1}</div>
                  <div className="text-white text-sm font-medium">{q.q}</div>
                  <div className="grid sm:grid-cols-2 gap-2 pt-1">
                    {q.opts.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => {
                          const next = [...answers];
                          next[qi] = oi;
                          setAnswers(next);
                        }}
                        className={`text-left rounded-md border px-3 py-2 text-xs transition-all ${
                          answers[qi] === oi
                            ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200 font-semibold'
                            : 'border-white/10 bg-[#0b0d13] text-white/70 hover:border-white/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => handleSubmit(false)} disabled={submitting || answers.includes(-1)} className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs py-2 px-6">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Assessment'}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-8 space-y-6">
            <div>
              <div className="text-[11px] tracking-widest uppercase font-mono font-bold mb-1" style={{ color: result.passed ? '#22c55e' : '#f87171' }}>
                {result.passed ? 'Skill Verified Badge Awarded' : result.disqualified ? 'Disqualified' : 'Not Passed'}
              </div>
              <div className="font-display font-black text-4xl text-white">{result.score}%</div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <StatBlock label="Correct Answers" value={`${result.correct}/${result.total}`} />
              <StatBlock label="Anti-Cheat Integrity" value={`${result.integrity_score}%`} />
              <StatBlock label="Verified Status" value={result.passed ? 'Passed (Verified)' : 'Needs Practice'} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => { setAttempt(null); setResult(null); }} className="bg-white/10 hover:bg-white/15 text-white text-xs">
                Take Another Skill Quiz
              </Button>
              <Button onClick={() => navigate('/dashboard')} className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs">
                Back to My Sheets
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const StatBlock = ({ label, value }) => (
  <div className="rounded-lg border border-white/10 bg-[#0a0c11] p-3.5">
    <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">{label}</div>
    <div className="font-display font-bold text-lg text-white">{value}</div>
  </div>
);

export default Assessment;
