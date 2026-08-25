import React, { useEffect, useState } from 'react';
import { challengeApi, getSession } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Trophy, Plus, ArrowLeft, Loader2, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Link } from 'react-router-dom';

const Challenges = () => {
  const { user } = getSession();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [form, setForm] = useState({ title: '', company: user?.role === 'Company' ? user.name : '', category: 'Backend', description: '', deadline_days: 7 });
  const [subForm, setSubForm] = useState({ challenge_id: '', github_url: '', demo_url: '', notes: '' });
  const [leaderboard, setLeaderboard] = useState({ id: null, rows: [] });

  const load = async () => {
    setLoading(true);
    try {
      const r = await challengeApi.list();
      setItems(r.challenges);
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
      toast({ title: 'Invalid URL', description: 'Provide a full GitHub URL', variant: 'destructive' });
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
    try {
      const r = await challengeApi.leaderboard(id);
      setLeaderboard({ id, rows: r.submissions });
    } catch (e) {
      toast({ title: 'Cannot load leaderboard', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-[62px]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="text-[11px] tracking-[0.24em] uppercase text-blue-400 font-mono mb-3">Company challenges</div>
            <h1 className="font-display font-black text-4xl md:text-5xl leading-[1]">Prove. Rank. Get shortlisted.</h1>
            <p className="text-white/50 mt-3 max-w-xl">Auto-shortlist rules: Score ≥ 90% → Fast track, ≥ 85% → Internship, ≥ 80% → Interview.</p>
          </div>
          {(user?.role === 'Company' || user?.role === 'Admin') && (
            <Button onClick={() => setShowPost(!showPost)} className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold">
              <Plus size={16} /> Post challenge
            </Button>
          )}
        </div>

        {showPost && (
          <form onSubmit={postChallenge} className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 grid md:grid-cols-2 gap-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1 bg-[#0a0c11] border-white/10 text-white" /></div>
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required className="mt-1 bg-[#0a0c11] border-white/10 text-white" /></div>
            <div><Label>Category</Label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full bg-[#0a0c11] border border-white/10 rounded-md px-3 py-2 text-white text-sm">
                {['Backend', 'Frontend', 'Data', 'UI/UX', 'DevOps', 'AI/ML'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><Label>Deadline (days)</Label><Input type="number" value={form.deadline_days} onChange={(e) => setForm({ ...form, deadline_days: Number(e.target.value) })} className="mt-1 bg-[#0a0c11] border-white/10 text-white" /></div>
            <div className="md:col-span-2"><Label>Description</Label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required className="mt-1 w-full bg-[#0a0c11] border border-white/10 rounded-md px-3 py-2 text-white text-sm" />
            </div>
            <div className="md:col-span-2 flex justify-end"><Button type="submit" className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold">Publish</Button></div>
          </form>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-white/50"><Loader2 size={16} className="animate-spin" /> Loading challenges…</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {items.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] tracking-widest text-blue-400 font-mono uppercase mb-1">{c.company} · {c.category}</div>
                    <div className="font-display font-black text-xl text-white">{c.title}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 bg-white/5 text-white/60">{c.deadline_days}d</span>
                </div>
                <p className="text-white/50 text-sm mt-3 leading-relaxed">{c.description}</p>
                <div className="flex items-center gap-2 text-white/40 text-xs font-mono mt-4">
                  <Users size={12} /> {c.participants || 0} submissions
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => setSubForm({ ...subForm, challenge_id: c.id })} className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold">Attempt</Button>
                  <Button onClick={() => openLeaderboard(c.id)} className="bg-white/10 hover:bg-white/20 text-white"><Trophy size={14} /> Leaderboard</Button>
                </div>

                {subForm.challenge_id === c.id && (
                  <form onSubmit={submitToChallenge} className="mt-5 space-y-3 border-t border-white/10 pt-5">
                    <div><Label className="text-xs">GitHub URL</Label><Input placeholder="https://github.com/you/project" value={subForm.github_url} onChange={(e) => setSubForm({ ...subForm, github_url: e.target.value })} className="mt-1 bg-[#0a0c11] border-white/10 text-white text-sm" required /></div>
                    <div><Label className="text-xs">Demo URL (optional)</Label><Input placeholder="https://demo.example.com" value={subForm.demo_url} onChange={(e) => setSubForm({ ...subForm, demo_url: e.target.value })} className="mt-1 bg-[#0a0c11] border-white/10 text-white text-sm" /></div>
                    <div><Label className="text-xs">Notes</Label><textarea value={subForm.notes} onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })} rows={2} className="mt-1 w-full bg-[#0a0c11] border border-white/10 rounded-md px-3 py-2 text-white text-sm" placeholder="Approach, tradeoffs, tests…" /></div>
                    <div className="flex gap-2"><Button type="submit" className="bg-emerald-400 hover:bg-emerald-300 text-black font-semibold">Submit for scoring</Button><Button type="button" onClick={() => setSubForm({ challenge_id: '', github_url: '', demo_url: '', notes: '' })} className="bg-white/10 hover:bg-white/20 text-white">Cancel</Button></div>
                  </form>
                )}

                {leaderboard.id === c.id && (
                  <div className="mt-5 border-t border-white/10 pt-5">
                    <div className="text-[11px] tracking-widest uppercase font-mono text-blue-400 mb-3">Leaderboard</div>
                    {leaderboard.rows.length === 0 ? (
                      <div className="text-white/40 text-sm">No submissions yet. Be the first.</div>
                    ) : (
                      <div className="space-y-2">
                        {leaderboard.rows.map((s) => (
                          <div key={s.id} className="flex items-center justify-between rounded-md border border-white/10 bg-[#0a0c11] px-3 py-2 text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-white/50 w-6">#{s.rank}</span>
                              <span className="text-white">{s.user_name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">{s.status}</span>
                              <span className="font-mono font-black text-emerald-400">{s.score}%</span>
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
    </div>
  );
};

export default Challenges;
