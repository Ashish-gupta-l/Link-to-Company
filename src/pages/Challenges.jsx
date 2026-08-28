import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Trophy, Plus, Loader2, Users, ArrowUpRight, Zap, ShieldCheck,
  CheckCircle2, XCircle, Sparkles, Filter, Search, Calendar,
  Building2, ExternalLink, BookOpen, Clock, AlertTriangle,
  Briefcase, GraduationCap, MapPin, SlidersHorizontal, Check,
  ChevronRight, X, HelpCircle, ArrowRight, Award, MessageSquare,
  FileCode, Layers, Star, DollarSign, UserCheck, Play
} from 'lucide-react';
import { challengeApi, getSession, dashboardApi, profileApi } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import AppLayout from '../components/AppLayout';

const DOMAIN_OPTIONS = [
  'All',
  'Artificial Intelligence',
  'Backend',
  'Frontend',
  'Full Stack',
  'Cyber Security',
  'Data Science',
  'Cloud & DevOps'
];

const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const OPPORTUNITY_OPTIONS = ['All', 'Internship with PPO', 'Direct Placement', 'Internship & Placement'];

const Challenges = () => {
  const { user } = getSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isStudent = !user || user.role === 'Student';
  const isCompany = user?.role === 'Company';
  const isCollege = user?.role === 'College' || user?.role === 'Faculty';
  const isAdmin = user?.role === 'Admin';

  const [items, setItems] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [oppFilter, setOppFilter] = useState('All');
  const [minMatch, setMinMatch] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Modal / Detail States
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(null);
  const [leaderboardRows, setLeaderboardRows] = useState([]);

  // Application & Submission States
  const [applyNotes, setApplyNotes] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);
  const [subForm, setSubForm] = useState({ github_url: '', demo_url: '', notes: '' });
  const [submittingSolution, setSubmittingSolution] = useState(false);

  // Post Challenge Form State (Company)
  const [newChall, setNewChall] = useState({
    title: '',
    company: user?.role === 'Company' ? user.name : '',
    category: 'Artificial Intelligence',
    domain: 'Computer Vision & Deep Learning',
    difficulty: 'Intermediate',
    required_skills: 'Python, Machine Learning, SQL',
    preferred_skills: 'PyTorch, Docker, FastAPI',
    eligible_branches: 'Computer Science, Information Technology, AI & Data Science',
    eligible_year: '3rd Year, 4th Year',
    deadline_days: 14,
    opportunity_type: 'Internship with PPO',
    stipend: '₹30,000 / month',
    salary: '₹8.5 - 14.0 LPA',
    location_type: 'Hybrid',
    team_size: 'Individual or Team of 2',
    problem_statement: '',
    expected_solution: '',
    description: ''
  });
  const [posting, setPosting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [challRes, recRes, statsRes] = await Promise.allSettled([
        challengeApi.list(),
        user?.role === 'Student' ? challengeApi.getRecommended() : Promise.resolve({ recommended: [] }),
        dashboardApi.stats()
      ]);

      if (challRes.status === 'fulfilled') {
        setItems(challRes.value.challenges || []);
      }
      if (recRes.status === 'fulfilled') {
        setRecommended(recRes.value.recommended || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      if (user?.role === 'Student') {
        profileApi.getStudentProfile().then((p) => setStudentProfile(p.profile)).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Check URL query for direct challenge open
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const challId = params.get('id');
    if (challId && items.length > 0) {
      openChallengeDetails(challId);
    }
  }, [location.search, items.length]);

  const openChallengeDetails = async (challId) => {
    setDetailLoading(true);
    setSelectedChallenge(null);
    try {
      const res = await challengeApi.getDetails(challId);
      setSelectedChallenge(res.challenge);
    } catch (e) {
      toast({ title: 'Cannot load challenge details', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedChallenge) return;
    setSubmittingApply(true);
    try {
      const res = await challengeApi.apply(selectedChallenge.id, applyNotes);
      toast({
        title: 'Application Submitted! 🎉',
        description: `Match Score: ${res.match_score}%. Next step: Submit your solution.`
      });
      setApplyNotes('');
      openChallengeDetails(selectedChallenge.id);
      loadData();
    } catch (err) {
      toast({
        title: 'Application Failed',
        description: err?.response?.data?.detail || 'Could not apply.',
        variant: 'destructive'
      });
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!selectedChallenge) return;
    if (!subForm.github_url || !subForm.github_url.startsWith('http')) {
      toast({
        title: 'Invalid GitHub URL',
        description: 'Please provide a valid repository URL (e.g. https://github.com/you/repo)',
        variant: 'destructive'
      });
      return;
    }
    setSubmittingSolution(true);
    try {
      await challengeApi.submitSolution(selectedChallenge.id, subForm);
      toast({
        title: 'Solution Submitted for Review! 🚀',
        description: `Your repository has been forwarded to ${selectedChallenge.company} recruiters.`
      });
      setSubForm({ github_url: '', demo_url: '', notes: '' });
      openChallengeDetails(selectedChallenge.id);
      loadData();
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: err?.response?.data?.detail || 'Try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmittingSolution(false);
    }
  };

  const handlePostChallenge = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const payload = {
        ...newChall,
        required_skills: newChall.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
        preferred_skills: newChall.preferred_skills.split(',').map((s) => s.trim()).filter(Boolean),
        eligible_branches: newChall.eligible_branches.split(',').map((s) => s.trim()).filter(Boolean),
        eligible_year: newChall.eligible_year.split(',').map((s) => s.trim()).filter(Boolean),
        deadline_days: Number(newChall.deadline_days) || 14
      };
      await challengeApi.create(payload);
      toast({ title: 'Challenge Published!', description: `"${newChall.title}" is now live for students.` });
      setShowPostModal(false);
      loadData();
    } catch (err) {
      toast({
        title: 'Cannot Post Challenge',
        description: err?.response?.data?.detail || 'Check fields and try again.',
        variant: 'destructive'
      });
    } finally {
      setPosting(false);
    }
  };

  const openLeaderboard = async (id) => {
    setShowLeaderboardModal(id);
    try {
      const res = await challengeApi.leaderboard(id);
      setLeaderboardRows(res.submissions || []);
    } catch (err) {
      setLeaderboardRows([]);
    }
  };

  // Filtered items
  const filteredChallenges = useMemo(() => {
    return items.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const inTitle = c.title.toLowerCase().includes(q);
        const inComp = c.company.toLowerCase().includes(q);
        const inDesc = (c.description || '').toLowerCase().includes(q);
        const inSkills = [...(c.required_skills || []), ...(c.preferred_skills || [])].some((s) => s.toLowerCase().includes(q));
        if (!inTitle && !inComp && !inDesc && !inSkills) return false;
      }
      if (domainFilter !== 'All' && c.category !== domainFilter && c.domain !== domainFilter) return false;
      if (diffFilter !== 'All' && c.difficulty !== diffFilter) return false;
      if (oppFilter !== 'All' && !(c.opportunity_type || '').includes(oppFilter)) return false;
      if (minMatch > 0 && (c.match_score || 0) < minMatch) return false;
      return true;
    });
  }, [items, search, domainFilter, diffFilter, oppFilter, minMatch]);

  const getMatchBadgeColor = (score) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 50) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  const getStatusStepperColor = (status) => {
    switch (status) {
      case 'Selected':
      case 'Internship Offered':
      case 'Placement Offered':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'Evaluated':
      case 'Submitted':
        return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
      case 'Shortlisted':
      case 'Challenge Assigned':
        return 'text-purple-400 border-purple-500/40 bg-purple-500/10';
      case 'Under Review':
      case 'Applied':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'Rejected':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
      default:
        return 'text-white/40 border-white/10 bg-white/5';
    }
  };

  return (
    <AppLayout stats={stats}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* TOP HERO & HEADER: PIPELINE INDICATOR */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0f17] via-[#090b11] to-[#06080c] p-6 md:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono font-semibold">
                <Zap size={14} className="animate-pulse" />
                <span>SKILL MAPPING & INDUSTRY CHALLENGE PIPELINE</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                Prove Real Skills. Close Gaps. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-300 to-teal-200">Unlock Opportunities.</span>
              </h1>
              <p className="text-white/60 text-xs md:text-sm leading-relaxed">
                Discover live challenges calibrated to your actual skill profile. Analyze skill gaps, complete industry solutions, and get evaluated for direct internship and placement offers.
              </p>

              {/* USP Pipeline Stepper */}
              <div className="pt-2 hidden sm:flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-white/50">
                <span className="text-white font-semibold flex items-center gap-1"><CheckCircle2 size={13} className="text-emerald-400" /> Your Skills</span>
                <ChevronRight size={13} className="text-white/20" />
                <span className="text-blue-300 font-semibold flex items-center gap-1"><Sparkles size={13} className="text-blue-400" /> Gap Analysis</span>
                <ChevronRight size={13} className="text-white/20" />
                <span className="text-purple-300 font-semibold flex items-center gap-1"><Trophy size={13} className="text-purple-400" /> Challenge Matching</span>
                <ChevronRight size={13} className="text-white/20" />
                <span className="text-amber-300 font-semibold flex items-center gap-1"><FileCode size={13} className="text-amber-400" /> GitHub Submission</span>
                <ChevronRight size={13} className="text-white/20" />
                <span className="text-emerald-400 font-semibold flex items-center gap-1"><Award size={13} className="text-emerald-400" /> Evaluation & PPO</span>
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
              {isCompany && (
                <Button
                  onClick={() => setShowPostModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 shadow-lg shadow-blue-600/30"
                >
                  <Plus size={16} className="mr-1.5" /> Post Industry Challenge
                </Button>
              )}
              {isStudent && (
                <Link
                  to="/dashboard?tab=portfolio"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors"
                >
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>Update My Skills ({studentProfile?.technical_skills?.length || 4})</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. SMART RECOMMENDATIONS SECTION (If student has recommendations) */}
        {/* ========================================================================= */}
        {isStudent && recommended.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider font-mono">
                <Sparkles size={16} className="text-emerald-400" />
                <span>Recommended Challenges For You</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-sans normal-case">
                  Matched from your profile skills
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommended.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => openChallengeDetails(rec.id)}
                  className="group relative rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-[#0b0e16] p-5 space-y-3 cursor-pointer hover:border-emerald-400/60 transition-all hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-white/70 font-semibold">
                        <Building2 size={13} className="text-blue-400" />
                        <span>{rec.company}</span>
                        {rec.verification_status === 'Verified' && (
                          <span className="text-[10px] text-blue-400 flex items-center" title="Verified Company">
                            <ShieldCheck size={13} className="fill-blue-500 text-[#0b0e16]" />
                          </span>
                        )}
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getMatchBadgeColor(rec.match_score)}`}>
                        {rec.match_score}% Match
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-base text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {rec.title}
                    </h3>
                    <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                      {rec.description || rec.problem_statement}
                    </p>

                    {/* Why this is recommended pill box */}
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1">
                        <Check size={11} /> Why Recommended:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rec.why_recommended?.slice(0, 2).map((w, idx) => (
                          <span key={idx} className="text-[10px] text-white/70 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-mono font-semibold">{rec.opportunity_type}</span>
                    <span className="text-white/60 group-hover:text-white flex items-center gap-1 font-semibold text-xs">
                      View Challenge <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SEARCH & MULTI-FILTER BAR */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Search challenges by title, company, or required skill (e.g. Python, React)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#0a0c11] border-white/10 text-white text-xs h-10 placeholder:text-white/30"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="bg-[#0a0c11] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d === 'All' ? 'All Domains' : d}</option>
                ))}
              </select>

              <select
                value={diffFilter}
                onChange={(e) => setDiffFilter(e.target.value)}
                className="bg-[#0a0c11] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`text-xs border-white/10 text-white ${showFilters ? 'bg-white/10' : 'bg-[#0a0c11]'}`}
              >
                <SlidersHorizontal size={14} className="mr-1.5" />
                <span>Filters</span>
                {(minMatch > 0 || oppFilter !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 ml-1.5"></span>
                )}
              </Button>
            </div>
          </div>

          {/* Extended Filters Drawer */}
          {showFilters && (
            <div className="p-4 rounded-xl border border-white/10 bg-[#0a0c11] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in duration-200">
              <div>
                <Label className="text-white/60 mb-1.5 block">Opportunity Type</Label>
                <select
                  value={oppFilter}
                  onChange={(e) => setOppFilter(e.target.value)}
                  className="w-full bg-[#07090e] border border-white/10 rounded-md p-2 text-white text-xs"
                >
                  {OPPORTUNITY_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label className="text-white/60">Minimum Skill Match: <strong className="text-emerald-400 font-mono">{minMatch}%</strong></Label>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={10}
                  value={minMatch}
                  onChange={(e) => setMinMatch(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 font-mono mt-1">
                  <span>0% (All)</span>
                  <span>50%</span>
                  <span>90%+</span>
                </div>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={() => {
                    setDomainFilter('All');
                    setDiffFilter('All');
                    setOppFilter('All');
                    setMinMatch(0);
                    setSearch('');
                  }}
                  variant="ghost"
                  className="text-xs text-white/50 hover:text-white"
                >
                  Reset Filters
                </Button>
                <span className="text-[11px] text-white/40 font-mono self-center">
                  Showing {filteredChallenges.length} challenges
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN CHALLENGES CARD GRID */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/50 space-y-3">
            <Loader2 size={28} className="animate-spin text-blue-500" />
            <p className="text-xs font-mono">Calculating skill overlaps & loading live industry challenges…</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-white/10 bg-[#0b0d13] p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/40">
              <Search size={24} />
            </div>
            <h3 className="text-base font-bold text-white">No matching challenges found</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              Try adjusting your filter criteria, lowering minimum match percentage, or searching for other skills.
            </p>
            <Button
              onClick={() => {
                setDomainFilter('All');
                setDiffFilter('All');
                setOppFilter('All');
                setMinMatch(0);
                setSearch('');
              }}
              className="bg-blue-600 text-white text-xs"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filteredChallenges.map((c) => {
              const hasApplied = !!c.user_application;
              const appStatus = c.user_application?.status;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-[#0b0d14] hover:border-white/20 transition-all p-6 flex flex-col justify-between space-y-5 shadow-lg relative group"
                >
                  {/* Top Bar: Company, Verified Badge, Match Score */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider">
                            {c.company}
                          </span>
                          {c.verification_status === 'Verified' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold" title="Verified Industry Partner">
                              <ShieldCheck size={11} className="fill-blue-500 text-[#0b0d14]" /> Verified
                            </span>
                          )}
                          <span className="text-white/20">·</span>
                          <span className="text-[10px] font-mono text-white/40">{c.category}</span>
                        </div>
                        <h2
                          onClick={() => openChallengeDetails(c.id)}
                          className="font-display font-black text-lg md:text-xl text-white hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          {c.title}
                        </h2>
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 shadow-sm ${getMatchBadgeColor(c.match_score)}`}>
                          <Sparkles size={12} />
                          <span>{c.match_score}% Match</span>
                        </div>
                        {hasApplied && (
                          <span className={`text-[10px] font-mono mt-1 px-2 py-0.5 rounded border ${getStatusStepperColor(appStatus)}`}>
                            {appStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-white/60 text-xs leading-relaxed line-clamp-3">
                      {c.problem_statement || c.description}
                    </p>

                    {/* Skill Chips (Required vs Missing status indication) */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-white/40 font-semibold">
                        Required Skills:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.required_skills?.map((sk) => {
                          const isMatched = (c.matched_skills || []).includes(sk);
                          return (
                            <span
                              key={sk}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                                isMatched
                                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-white/5 text-white/50 border border-white/10 border-dashed'
                              }`}
                            >
                              {isMatched ? <Check size={11} className="text-emerald-400" /> : <span className="text-white/30">✗</span>}
                              {sk}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata Pills: Opportunity, Stipend, Difficulty, Eligibility */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                      <div className="p-2 rounded bg-[#07080d] border border-white/5">
                        <div className="text-white/40 text-[9px] uppercase">Opportunity</div>
                        <div className="text-emerald-400 font-bold truncate">{c.opportunity_type || 'Internship'}</div>
                      </div>
                      <div className="p-2 rounded bg-[#07080d] border border-white/5">
                        <div className="text-white/40 text-[9px] uppercase">Perks / Stipend</div>
                        <div className="text-white font-semibold truncate">{c.stipend || '₹25,000/mo'}</div>
                      </div>
                      <div className="p-2 rounded bg-[#07080d] border border-white/5">
                        <div className="text-white/40 text-[9px] uppercase">Difficulty</div>
                        <div className="text-blue-300 font-semibold">{c.difficulty}</div>
                      </div>
                      <div className="p-2 rounded bg-[#07080d] border border-white/5">
                        <div className="text-white/40 text-[9px] uppercase">Deadline</div>
                        <div className="text-amber-400 font-semibold">{c.deadline_days} days</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-white/40 text-xs font-mono">
                      <Users size={13} />
                      <span>{c.participants || 0} participants</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => openLeaderboard(c.id)}
                        variant="ghost"
                        className="text-xs text-white/60 hover:text-white h-9 px-3"
                      >
                        <Trophy size={13} className="mr-1 text-amber-400" /> Leaderboard
                      </Button>

                      <Button
                        onClick={() => openChallengeDetails(c.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 px-4 shadow-md shadow-blue-600/20"
                      >
                        {hasApplied ? 'View Status & Solution' : 'View Challenge'}
                        <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DEEP CHALLENGE DETAILS DRAWER / MODAL */}
        {/* ========================================================================= */}
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end overflow-y-auto">
            <div className="w-full max-w-3xl bg-[#090b12] border-l border-white/10 min-h-screen p-6 md:p-8 space-y-6 shadow-2xl overflow-y-auto">
              
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 uppercase">{selectedChallenge.company}</span>
                    {selectedChallenge.verification_status === 'Verified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                        <ShieldCheck size={11} className="fill-blue-500 text-[#090b12]" /> Verified Partner
                      </span>
                    )}
                    <span className="text-white/20">·</span>
                    <span className="text-white/50 text-xs font-mono">{selectedChallenge.domain || selectedChallenge.category}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white">
                    {selectedChallenge.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Match Score & Gap Overview Banner */}
              <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-950/30 via-[#0d121f] to-emerald-950/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-blue-300 font-bold flex items-center gap-1.5">
                      <Sparkles size={14} /> SKILL GAP & MATCH ANALYSIS
                    </div>
                    <div className="text-2xl font-black text-white mt-0.5">
                      Your Skill Match: <span className="text-emerald-400">{selectedChallenge.match_score}%</span>
                    </div>
                  </div>

                  <Link
                    to="/dashboard?tab=portfolio"
                    className="text-xs text-blue-400 hover:text-blue-300 underline font-mono font-semibold"
                  >
                    Edit Profile Skills →
                  </Link>
                </div>

                {/* Available vs Missing Breakdown */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Matched Skills ({selectedChallenge.matched_skills?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedChallenge.matched_skills?.length > 0 ? (
                        selectedChallenge.matched_skills.map((sk) => (
                          <span key={sk} className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                            ✓ {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-white/40 text-xs italic">None matched yet</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-amber-500/20 space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
                      <XCircle size={13} /> Missing Skills ({selectedChallenge.missing_skills?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedChallenge.missing_skills?.length > 0 ? (
                        selectedChallenge.missing_skills.map((sk) => (
                          <span key={sk} className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                            ✗ {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400 text-xs font-mono">✓ No missing required skills!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4-Step Recommended Learning Path */}
                {selectedChallenge.learning_path?.length > 0 && (
                  <div className="p-4 rounded-lg bg-[#070910] border border-white/10 space-y-2">
                    <div className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-blue-400" /> Recommended Learning Path to Close Gaps
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs text-white/70">
                      {selectedChallenge.learning_path.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded bg-white/[0.02]">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] flex items-center justify-center shrink-0 font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-[11px]">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        to="/assessment"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 border border-emerald-400/30 text-xs font-semibold"
                      >
                        <Zap size={13} /> Improve My Skills (Take Proctored Quiz)
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Problem Statement & Expected Solution */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-1.5">
                    Problem Statement
                  </h3>
                  <p className="text-white/80 text-xs leading-relaxed whitespace-pre-line bg-[#070910] p-4 rounded-xl border border-white/5">
                    {selectedChallenge.problem_statement || selectedChallenge.description}
                  </p>
                </div>

                {selectedChallenge.expected_solution && (
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider mb-1.5">
                      Expected Solution & Deliverables
                    </h3>
                    <p className="text-white/80 text-xs leading-relaxed whitespace-pre-line bg-[#070910] p-4 rounded-xl border border-white/5">
                      {selectedChallenge.expected_solution}
                    </p>
                  </div>
                )}
              </div>

              {/* Challenge Parameters Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#070910] border border-white/10 space-y-0.5">
                  <div className="text-white/40 text-[10px] uppercase">Opportunity</div>
                  <div className="text-emerald-400 font-bold">{selectedChallenge.opportunity_type}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070910] border border-white/10 space-y-0.5">
                  <div className="text-white/40 text-[10px] uppercase">Stipend / CTC</div>
                  <div className="text-white font-bold">{selectedChallenge.stipend || selectedChallenge.salary || 'Competitive'}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070910] border border-white/10 space-y-0.5">
                  <div className="text-white/40 text-[10px] uppercase">Team Size</div>
                  <div className="text-white font-bold">{selectedChallenge.team_size || 'Individual (1)'}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070910] border border-white/10 space-y-0.5">
                  <div className="text-white/40 text-[10px] uppercase">Eligible Branches</div>
                  <div className="text-white/80 text-[11px] truncate">{selectedChallenge.eligible_branches?.join(', ')}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070910] border border-white/10 space-y-0.5">
                  <div className="text-white/40 text-[10px] uppercase">Eligible Year</div>
                  <div className="text-white/80 text-[11px]">{selectedChallenge.eligible_year?.join(', ')}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#070910] border border-white/10 space-y-0.5">
                  <div className="text-white/40 text-[10px] uppercase">Deadline</div>
                  <div className="text-amber-400 font-bold">{selectedChallenge.deadline_date || `${selectedChallenge.deadline_days} days`}</div>
                </div>
              </div>

              {/* Evaluation Rubric */}
              {selectedChallenge.evaluation_criteria?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Evaluation Criteria
                  </h3>
                  <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-[#070910] overflow-hidden">
                    {selectedChallenge.evaluation_criteria.map((ec, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                        <div>
                          <div className="font-semibold text-white">{ec.criterion}</div>
                          <div className="text-[11px] text-white/50">{ec.desc}</div>
                        </div>
                        <span className="font-mono text-xs font-bold text-blue-400 shrink-0">{ec.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* APPLICATION STATUS & SUBMISSION PIPELINE SECTION */}
              {/* ========================================================= */}
              <div className="p-6 rounded-2xl border border-white/15 bg-[#0b0e18] space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase">
                      Application & Solution Pipeline
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      Track your multi-stage progress and submit your solution.
                    </p>
                  </div>
                  {selectedChallenge.user_application && (
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getStatusStepperColor(selectedChallenge.user_application.status)}`}>
                      {selectedChallenge.user_application.status}
                    </span>
                  )}
                </div>

                {/* Pipeline Stepper Visualization */}
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-white/40 font-bold">
                    Workflow Status:
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[10px] font-mono">
                    {['Applied', 'Shortlisted', 'Challenge Assigned', 'Submitted', 'Evaluated', 'Selected'].map((st, i) => {
                      const currStatus = selectedChallenge.user_application?.status || 'Not Applied';
                      const isReached =
                        currStatus === st ||
                        (currStatus === 'Submitted' && ['Applied', 'Shortlisted', 'Challenge Assigned', 'Submitted'].includes(st)) ||
                        (currStatus === 'Evaluated' && ['Applied', 'Shortlisted', 'Challenge Assigned', 'Submitted', 'Evaluated'].includes(st)) ||
                        (['Selected', 'Internship Offered', 'Placement Offered'].includes(currStatus));

                      return (
                        <div
                          key={st}
                          className={`p-2 rounded-lg border transition-all ${
                            isReached
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold'
                              : 'border-white/5 bg-white/[0.02] text-white/30'
                          }`}
                        >
                          <div className="text-[9px] text-white/40">{i + 1}</div>
                          <div className="truncate">{st}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Evaluation Scorecard if Evaluated */}
                {selectedChallenge.user_application?.evaluation && (
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-xs font-mono uppercase flex items-center gap-1.5">
                        <Award size={15} className="text-emerald-400" /> Recruiter Evaluation Scorecard
                      </div>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {selectedChallenge.user_application.evaluation.overall_score}% Score
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-black/40 border border-white/5">
                        <div className="text-white/40 text-[9px]">Technical</div>
                        <div className="text-white font-bold">{selectedChallenge.user_application.evaluation.tech_score}/100</div>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5">
                        <div className="text-white/40 text-[9px]">Problem Solving</div>
                        <div className="text-white font-bold">{selectedChallenge.user_application.evaluation.problem_solving_score}/100</div>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5">
                        <div className="text-white/40 text-[9px]">Code Quality</div>
                        <div className="text-white font-bold">{selectedChallenge.user_application.evaluation.code_quality_score}/100</div>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5">
                        <div className="text-white/40 text-[9px]">Innovation</div>
                        <div className="text-white font-bold">{selectedChallenge.user_application.evaluation.innovation_score}/100</div>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5">
                        <div className="text-white/40 text-[9px]">Communication</div>
                        <div className="text-white font-bold">{selectedChallenge.user_application.evaluation.communication_score}/100</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-black/40 text-xs text-white/80 border border-white/5">
                      <strong className="text-emerald-300 font-mono">Feedback: </strong>
                      {selectedChallenge.user_application.evaluation.feedback}
                    </div>
                  </div>
                )}

                {/* Submissions form OR Apply Button */}
                {!selectedChallenge.user_application ? (
                  <form onSubmit={handleApply} className="space-y-4 pt-2">
                    <div>
                      <Label className="text-xs text-white/80">Application Note (Optional)</Label>
                      <textarea
                        rows={2}
                        value={applyNotes}
                        onChange={(e) => setApplyNotes(e.target.value)}
                        placeholder="Highlight your domain interest, availability, and motivation for this challenge..."
                        className="mt-1 w-full bg-[#070910] border border-white/10 rounded-md p-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingApply}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs py-2.5"
                    >
                      {submittingApply ? <Loader2 size={16} className="animate-spin" /> : 'Apply / Participate in Challenge'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitSolution} className="space-y-4 pt-2 border-t border-white/10">
                    <div className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                      <FileCode size={14} className="text-blue-400" />
                      {selectedChallenge.user_application.status === 'Submitted' ? 'Update Submitted Solution' : 'Submit Challenge Solution'}
                    </div>

                    <div>
                      <Label className="text-xs text-white/80">GitHub Repository URL *</Label>
                      <Input
                        placeholder="https://github.com/your-username/challenge-repo"
                        value={subForm.github_url || selectedChallenge.user_application.github_url || ''}
                        onChange={(e) => setSubForm({ ...subForm, github_url: e.target.value })}
                        required
                        className="mt-1 bg-[#070910] border-white/10 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-white/80">Live Demo / Hosted URL (Optional)</Label>
                      <Input
                        placeholder="https://your-demo-app.vercel.app"
                        value={subForm.demo_url || selectedChallenge.user_application.demo_url || ''}
                        onChange={(e) => setSubForm({ ...subForm, demo_url: e.target.value })}
                        className="mt-1 bg-[#070910] border-white/10 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-white/80">Implementation & Architecture Notes</Label>
                      <textarea
                        rows={2}
                        placeholder="Explain model architecture, test coverage, tradeoffs, and execution steps..."
                        value={subForm.notes || selectedChallenge.user_application.notes || ''}
                        onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                        className="mt-1 w-full bg-[#070910] border border-white/10 rounded-md p-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingSolution}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5"
                    >
                      {submittingSolution ? <Loader2 size={16} className="animate-spin" /> : 'Submit Solution for Evaluation'}
                    </Button>
                  </form>
                )}
              </div>

              {/* FAQs Accordion */}
              {selectedChallenge.faqs?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-2">
                    {selectedChallenge.faqs.map((faq, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-white/10 bg-[#070910] space-y-1 text-xs">
                        <div className="font-semibold text-white">{faq.q}</div>
                        <div className="text-white/60 leading-relaxed text-[11px]">{faq.a}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. COMPANY "POST CHALLENGE" MODAL */}
        {/* ========================================================================= */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#0b0e16] border border-white/15 rounded-2xl p-6 md:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Post Live Industry Challenge</h2>
                  <p className="text-xs text-white/50">Define required skills, problem statement, and evaluation criteria.</p>
                </div>
                <button onClick={() => setShowPostModal(false)} className="text-white/60 hover:text-white p-1 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePostChallenge} className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Challenge Title *</Label>
                    <Input
                      placeholder="e.g. AI-Based Crop Disease Detection"
                      value={newChall.title}
                      onChange={(e) => setNewChall({ ...newChall, title: e.target.value })}
                      required
                      className="mt-1 bg-[#070910] border-white/10 text-white text-xs"
                    />
                  </div>
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      placeholder="e.g. ABC Technologies"
                      value={newChall.company}
                      onChange={(e) => setNewChall({ ...newChall, company: e.target.value })}
                      required
                      className="mt-1 bg-[#070910] border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Category</Label>
                    <select
                      value={newChall.category}
                      onChange={(e) => setNewChall({ ...newChall, category: e.target.value })}
                      className="mt-1 w-full bg-[#070910] border border-white/10 rounded-md p-2 text-white text-xs"
                    >
                      <option>Artificial Intelligence</option>
                      <option>Backend</option>
                      <option>Frontend</option>
                      <option>Full Stack</option>
                      <option>Cyber Security</option>
                      <option>Data Science</option>
                      <option>Cloud & DevOps</option>
                    </select>
                  </div>
                  <div>
                    <Label>Difficulty Level</Label>
                    <select
                      value={newChall.difficulty}
                      onChange={(e) => setNewChall({ ...newChall, difficulty: e.target.value })}
                      className="mt-1 w-full bg-[#070910] border border-white/10 rounded-md p-2 text-white text-xs"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <Label>Deadline (Days)</Label>
                    <Input
                      type="number"
                      value={newChall.deadline_days}
                      onChange={(e) => setNewChall({ ...newChall, deadline_days: e.target.value })}
                      className="mt-1 bg-[#070910] border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label>Required Skills (Comma separated) *</Label>
                  <Input
                    placeholder="Python, Machine Learning, OpenCV, SQL"
                    value={newChall.required_skills}
                    onChange={(e) => setNewChall({ ...newChall, required_skills: e.target.value })}
                    required
                    className="mt-1 bg-[#070910] border-white/10 text-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-white/40 font-mono">Used for automated student skill-match calculations.</span>
                </div>

                <div>
                  <Label>Preferred / Bonus Skills (Comma separated)</Label>
                  <Input
                    placeholder="PyTorch, Docker, FastAPI"
                    value={newChall.preferred_skills}
                    onChange={(e) => setNewChall({ ...newChall, preferred_skills: e.target.value })}
                    className="mt-1 bg-[#070910] border-white/10 text-white text-xs font-mono"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Opportunity Type</Label>
                    <select
                      value={newChall.opportunity_type}
                      onChange={(e) => setNewChall({ ...newChall, opportunity_type: e.target.value })}
                      className="mt-1 w-full bg-[#070910] border border-white/10 rounded-md p-2 text-white text-xs"
                    >
                      <option>Internship with PPO</option>
                      <option>Direct Placement</option>
                      <option>Internship & Placement</option>
                      <option>Paid Consultancy / Bounty</option>
                    </select>
                  </div>
                  <div>
                    <Label>Stipend / CTC</Label>
                    <Input
                      placeholder="e.g. ₹30,000 / month"
                      value={newChall.stipend}
                      onChange={(e) => setNewChall({ ...newChall, stipend: e.target.value })}
                      className="mt-1 bg-[#070910] border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label>Problem Statement *</Label>
                  <textarea
                    rows={3}
                    placeholder="Describe the business/technical problem students need to solve..."
                    value={newChall.problem_statement}
                    onChange={(e) => setNewChall({ ...newChall, problem_statement: e.target.value })}
                    required
                    className="mt-1 w-full bg-[#070910] border border-white/10 rounded-md p-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label>Expected Solution & Deliverables</Label>
                  <textarea
                    rows={2}
                    placeholder="Expected repository structure, models, API endpoints, benchmarks..."
                    value={newChall.expected_solution}
                    onChange={(e) => setNewChall({ ...newChall, expected_solution: e.target.value })}
                    className="mt-1 w-full bg-[#070910] border border-white/10 rounded-md p-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <Button type="button" variant="ghost" onClick={() => setShowPostModal(false)} className="text-xs text-white/60">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={posting} className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs px-6">
                    {posting ? <Loader2 size={16} className="animate-spin" /> : 'Publish Challenge'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. LEADERBOARD MODAL */}
        {/* ========================================================================= */}
        {showLeaderboardModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#0b0e16] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-amber-400" />
                  <h3 className="font-bold text-white text-base font-mono uppercase">Challenge Leaderboard</h3>
                </div>
                <button onClick={() => setShowLeaderboardModal(null)} className="text-white/60 hover:text-white p-1 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                {leaderboardRows.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-xs font-mono">
                    No submissions scored yet. Be the first to submit!
                  </div>
                ) : (
                  leaderboardRows.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-[#070910] border border-white/5 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-amber-400 font-bold w-6">#{s.rank}</span>
                        <div>
                          <div className="font-bold text-white">{s.user_name}</div>
                          <div className="text-[10px] text-white/40 font-mono">{s.status}</div>
                        </div>
                      </div>
                      <div className="font-mono font-black text-emerald-400 text-sm">
                        {s.score}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default Challenges;
