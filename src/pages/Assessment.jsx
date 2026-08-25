import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { AlertTriangle, ShieldCheck, Clock, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

const Assessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [skills, setSkills] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [starting, setStarting] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [warnings, setWarnings] = useState(0);
  const eventsRef = useRef([]);
  const terminatedRef = useRef(false);

  useEffect(() => {
    assessmentApi.skills().then((r) => setSkills(r.skills)).catch(() => {});
  }, []);

  // Timer
  useEffect(() => {
    if (!attempt || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        toast({ title: 'Skill verified', description: `${attempt.skill} · ${res.score}%` });
      } else if (res.disqualified) {
        toast({ title: 'Attempt disqualified', description: 'Integrity threshold not met.', variant: 'destructive' });
      } else {
        toast({ title: 'Not passed', description: `Score ${res.score}%. Threshold: 70%.` });
      }
    } catch (e) {
      toast({ title: 'Submit failed', description: e?.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-[62px]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-[11px] tracking-[0.24em] uppercase text-emerald-400 font-mono mb-3">Skill assessment</div>
        <h1 className="font-display font-black text-4xl md:text-5xl leading-[1]">Prove a skill.</h1>
        <p className="text-white/50 mt-3 max-w-2xl">Server-side timer, randomized questions, tab/blur/paste monitoring, integrity scoring, and 3-attempt cap.</p>

        {!attempt && (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills.map((s) => (
              <div key={s} className="rounded-lg border border-white/10 bg-[#0b0d13] p-6 flex items-center justify-between hover:border-emerald-500/40 transition-all">
                <div>
                  <div className="font-display font-black text-white text-2xl">{s}</div>
                  <div className="text-white/40 text-xs font-mono mt-1">5 questions · 10 min</div>
                </div>
                <Button onClick={() => startAssessment(s)} disabled={!!starting} className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold">
                  {starting === s ? <Loader2 size={16} className="animate-spin" /> : 'Start'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {attempt && !result && (
          <div className="mt-8 rounded-xl border border-white/10 bg-[#0b0d13] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[11px] tracking-[0.24em] uppercase text-emerald-400 font-mono">Assessment · {attempt.skill}</div>
                <div className="font-display font-black text-2xl mt-1">Question 1 – {attempt.questions.length}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-sm ${warnings > 0 ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'}`}>
                  <ShieldCheck size={14} /> Integrity: {Math.max(0, 100 - warnings * 20)}%
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-500/40 bg-blue-500/10 text-blue-300 font-mono text-sm">
                  <Clock size={14} /> {mmss(timeLeft)}
                </div>
              </div>
            </div>

            {warnings > 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-yellow-500/40 bg-yellow-500/5 px-3 py-2 text-yellow-300 text-sm">
                <AlertTriangle size={14} /> Warnings: {warnings}/3 · Do not switch tabs, blur the window, or paste content.
              </div>
            )}

            <div className="space-y-6">
              {attempt.questions.map((q, qi) => (
                <div key={q.id} className="rounded-md border border-white/10 bg-[#0a0c11] p-5">
                  <div className="text-white/40 font-mono text-xs mb-2">Q{qi + 1}</div>
                  <div className="text-white font-medium">{q.q}</div>
                  <div className="mt-4 grid sm:grid-cols-2 gap-2">
                    {q.opts.map((opt, oi) => (
                      <button key={oi} onClick={() => {
                        const next = [...answers];
                        next[qi] = oi;
                        setAnswers(next);
                      }} className={`text-left rounded-md border px-3 py-2 text-sm transition-all ${answers[qi] === oi ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-[#0b0d13] text-white/70 hover:border-white/30'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => handleSubmit(false)} disabled={submitting || answers.includes(-1)} className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit assessment'}
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 rounded-xl border border-white/10 bg-[#0b0d13] p-8">
            <div className="text-[11px] tracking-[0.24em] uppercase font-mono mb-2" style={{ color: result.passed ? '#22c55e' : '#f87171' }}>
              {result.passed ? 'Skill verified' : result.disqualified ? 'Disqualified' : 'Not passed'}
            </div>
            <div className="font-display font-black text-5xl">{result.score}%</div>
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              <StatBlock label="Correct" value={`${result.correct}/${result.total}`} />
              <StatBlock label="Integrity" value={`${result.integrity_score}%`} />
              <StatBlock label="Passed" value={result.passed ? 'Yes' : 'No'} />
            </div>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => { setAttempt(null); setResult(null); }} className="bg-white/10 hover:bg-white/15 text-white">Take another</Button>
              <Button onClick={() => navigate('/dashboard')} className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold">Back to dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatBlock = ({ label, value }) => (
  <div className="rounded-md border border-white/10 bg-[#0a0c11] p-4">
    <div className="text-[11px] text-white/40 font-mono uppercase tracking-widest mb-1">{label}</div>
    <div className="font-display font-black text-2xl text-white">{value}</div>
  </div>
);

export default Assessment;
