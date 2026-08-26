import React, { useEffect, useState } from 'react';
import { challengeApi, getSession, dashboardApi } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Trophy, Plus, Loader2, Users, ArrowUpRight, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import AppLayout from '../components/AppLayout';

const Challenges = () => {
  const { user } = getSession();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState({ title: '', company: user?.role === 'Company' ? user.name : '', category: 'Backend', description: '', deadline_days: 7 });
  const [subForm, setSubForm] = useState({ challenge_id: '', github_url: '', demo_url: '', notes: '' });
  const [leaderboard, setLeaderboard] = useState({ id: null, rows: [] });
  const [stats, setStats] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await challengeApi.list();
      setItems(r.challenges);
      dashboardApi.stats().then((s) => setStats(s)).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const postChallenge = async (e) => {
    e.preventDefault();
    try {
      await challengeApi.create(form);
      toast({ title: 'Challenge posted', description: form.title });
      setShowPost(false);
      setForm({ ...form, title: '', description: '' });
      load();
    } catch (e) {
      toast({ title: 'Cannot post', description: e?.response?.data?.detail || 'Only companies can post.', variant: 'destructive' });
    }
  };

  const submitToChallenge = async (e) => {
    e.preventDefault();
    if (!subForm.github_url.startsWith('http')) {
      toast({ title: 'Invalid URL', description: 'Provide a full GitHub URL (e.g. https://github.com/you/repo)', variant: 'destructive' });
      return;
    }
    try {
      const r = await challengeApi.submit(subForm);
      toast({ title: `Score ${r.submission.score}%`, description: `Auto-shortlist: ${r.submission.shortlist.replace('_', ' ')}` });
      setSubForm({ challenge_id: '', github_url: '', demo_url: '', notes: '' });
      openLeaderboard(subForm.challenge_id);
      load();
    } catch (e) {
      toast({ title: 'Submit failed', description: e?.response?.data?.detail || 'Try again', variant: 'destructive' });
    }
  };

  const openLeaderboard = async (id) => {
    if (leaderboard.id === id) {
      setLeaderboard({ id: null, rows: [] });
      return;
    }
    try {
      const r = await challengeApi.leaderboard(id);
      setLeaderboard({ id, rows: r.submissions });
    } catch (e) {
      toast({ title: 'Cannot load leaderboard', variant: 'destructive' });
    }
  };

  return (
    <AppLayout stats={stats}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] tracking-widest uppercase text-blue-400 font-mono mb-1 font-semibold flex items-center gap-1.5">
              <Zap size={14} /> LIVE COMPANY CONTESTS & CHALLENGES
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white">Prove your code on real challenges.</h1>
            <p className="text-white/50 text-xs md:text-sm mt-1">Submit working GitHub repos. Fast-track scoring automatically triggers recruiter interview invites.</p>
          </div>
          {user?.role === 'Company' && (
            <Button onClick={() => setShowPost(!showPost)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
              <Plus size={16} className="mr-1.5" /> Post Challenge
            </Button>
          )}
        </div>

        {showPost && (
          <form onSubmit={postChallenge} className="rounded-xl border border-white/10 bg-[#0b0d13] p-6 grid md:grid-cols-2 gap-4">
            <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1 bg-[#0a0c11] border-white/10 text-white text-xs" /></div>
            <div><Label className="text-xs">Company Name</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required className="mt-1 bg-[#0a0c11] border-white/10 text-white text-xs" /></div>
            <div>
              <Label className="text-xs">Category</Label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full bg-[#0a0c11] border border-white/10 rounded-md px-3 py-2 text-white text-xs">
                <option>Backend</option><option>Frontend</option><option>Full Stack</option><option>UI/UX</option><option>Database</option>
              </select>
            </div>
            <div><Label className="text-xs">Deadline (days)</Label><Input type="number" value={form.deadline_days} onChange={(e) => setForm({ ...form, deadline_days: Number(e.target.value) })} className="mt-1 bg-[#0a0c11] border-white/10 text-white text-xs" /></div>
            <div className="md:col-span-2"><Label className="text-xs">Description</Label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required className="mt-1 w-full bg-[#0a0c11] border border-white/10 rounded-md px-3 py-2 text-white text-xs" />
            </div>
            <div className="md:col-span-2 flex justify-end"><Button type="submit" className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs">Publish</Button></div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-white/50 text-xs py-8"><Loader2 size={16} className="animate-spin" /> Loading challenges…</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {items.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/10 bg-[#0b0d13] p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] tracking-widest text-blue-400 font-mono uppercase mb-1 font-bold">{c.company} · {c.category}</div>
                    <div className="font-display font-black text-lg md:text-xl text-white">{c.title}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 bg-white/5 text-white/60">{c.deadline_days}d</span>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">{c.description}</p>
                <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                  <Users size={12} /> {c.participants || 0} submissions
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={() => setSubForm({ ...subForm, challenge_id: c.id })} className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs">Attempt</Button>
                  <Button onClick={() => openLeaderboard(c.id)} className="bg-white/10 hover:bg-white/20 text-white text-xs"><Trophy size={13} className="mr-1" /> Leaderboard</Button>
                </div>

                {subForm.challenge_id === c.id && (
                  <form onSubmit={submitToChallenge} className="mt-4 space-y-3 border-t border-white/10 pt-4">
                    <div><Label className="text-xs">GitHub Repository URL *</Label><Input placeholder="https://github.com/you/project" value={subForm.github_url} onChange={(e) => setSubForm({ ...subForm, github_url: e.target.value })} className="mt-1 bg-[#0a0c11] border-white/10 text-white text-xs font-mono" required /></div>
                    <div><Label className="text-xs">Live Demo URL (optional)</Label><Input placeholder="https://demo.example.com" value={subForm.demo_url} onChange={(e) => setSubForm({ ...subForm, demo_url: e.target.value })} className="mt-1 bg-[#0a0c11] border-white/10 text-white text-xs font-mono" /></div>
                    <div><Label className="text-xs">Implementation Notes</Label><textarea value={subForm.notes} onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })} rows={2} className="mt-1 w-full bg-[#0a0c11] border border-white/10 rounded-md px-3 py-2 text-white text-xs" placeholder="Approach, database design, testing..." /></div>
                    <div className="flex gap-2"><Button type="submit" className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs">Submit for scoring</Button><Button type="button" onClick={() => setSubForm({ challenge_id: '', github_url: '', demo_url: '', notes: '' })} className="bg-white/10 hover:bg-white/20 text-white text-xs">Cancel</Button></div>
                  </form>
                )}

                {leaderboard.id === c.id && (
                  <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
                    <div className="text-[11px] tracking-widest uppercase font-mono text-blue-400 font-bold">Leaderboard</div>
                    {leaderboard.rows.length === 0 ? (
                      <div className="text-white/40 text-xs">No submissions yet. Be the first to submit!</div>
                    ) : (
                      <div className="space-y-1.5">
                        {leaderboard.rows.map((s) => (
                          <div key={s.id} className="flex items-center justify-between rounded-md border border-white/10 bg-[#0a0c11] px-3 py-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-white/50 w-5">#{s.rank}</span>
                              <span className="text-white font-semibold">{s.user_name}</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">{s.status}</span>
                              <span className="font-black text-emerald-400">{s.score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Challenges;
