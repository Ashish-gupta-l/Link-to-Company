import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, ArrowUpRight, Sparkles, Trophy, Target, BookOpen,
  ShieldCheck, Zap, Calendar, Video, MessageSquare, PlusCircle, Building2,
  GraduationCap, Award, CheckSquare, Square, ChevronRight, UserCheck
} from 'lucide-react';
import { getSession, dashboardApi } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const ROADMAP_TRACKS = {
  'Full Stack Software Engineer': [
    {
      id: 'dsa',
      title: '2. Data Structures & Algorithms (DSA)',
      desc: 'Placement Target: 150–250 quality problems with pattern mastery.',
      subtopics: [
        'Arrays & Strings + Two Pointers',
        'Linked List, Stack & Queue',
        'HashMap & HashSet',
        'Recursion & Backtracking',
        'Trees & Binary Search Trees (BST)',
        'Heaps & Priority Queues',
        'Graph Algorithms (BFS/DFS, Dijkstra)',
        'Sorting, Searching & Binary Search',
        'Dynamic Programming (0/1 Knapsack, LCS, LIS)'
      ],
      assessmentSkill: 'DSA'
    },
    {
      id: 'dev',
      title: '3. Full Stack Development Track',
      desc: 'HTML/CSS → JavaScript → React → Node.js → Database → REST APIs → Deployment',
      subtopics: [
        'HTML5 & Modern Responsive CSS / Tailwind',
        'Core JavaScript ES6+, Async/Await & Event Loop',
        'React Hooks, Context API & State Management',
        'Node.js & Express RESTful API Architecture',
        'JWT Token Authentication & Role-Based Access Control',
        'Production Deployment on Cloud / Render / Docker'
      ],
      assessmentSkill: 'JavaScript'
    },
    {
      id: 'db',
      title: '4. Database Mastery',
      desc: 'SQL, Relational Modeling, Indexing & Transactions',
      subtopics: [
        'Relational Databases: PostgreSQL & MySQL',
        'Advanced SQL Queries, Subqueries & Joins',
        'Database Indexes & Query Optimization',
        'ACID Transactions & Concurrency Control',
        'Schema Normalization (1NF, 2NF, 3NF, BCNF)',
        'NoSQL Data Modeling with MongoDB'
      ],
      assessmentSkill: 'SQL & Databases'
    },
    {
      id: 'git',
      title: '5. Git & GitHub Workflow',
      desc: 'Professional team version control & code review pipelines',
      subtopics: [
        'git clone, init, add, commit, status',
        'Branching strategies (feature branches, main)',
        'git merge, pull requests (PR) & code review',
        'Resolving Git merge conflicts cleanly',
        'GitHub Actions & Automated CI/CD Basics'
      ],
      assessmentSkill: 'Git & DevOps'
    },
    {
      id: 'cs',
      title: '6. Core Computer Science Fundamentals',
      desc: 'High-frequency campus interview & placement topics',
      subtopics: [
        'Object-Oriented Programming (OOP: Encapsulation, Polymorphism, Abstraction)',
        'Database Management Systems (DBMS Architecture & Storage)',
        'Operating Systems (Processes, Threads, Deadlocks, Virtual Memory)',
        'Computer Networks (OSI Model, TCP/IP, DNS, HTTP/HTTPS, WebSockets)',
        'Software Engineering Basics & Agile Scrum'
      ],
      assessmentSkill: 'CS Fundamentals'
    },
    {
      id: 'projects',
      title: '7. Real Industry Projects',
      desc: 'Build 2–4 comprehensive production-grade projects with live deployment',
      subtopics: [
        'Project 1: Secure Authentication + Live Email OTP System',
        'Project 2: E-Commerce Store with Payment & Cart APIs',
        'Project 3: College Placement & Student Management ERP',
        'Project 4: Real-Time Team Collaboration & Chat Application'
      ],
      assessmentSkill: 'Node.js'
    },
    {
      id: 'tools',
      title: '8. Developer Tools & DevOps',
      desc: 'VS Code, Postman, Docker containerization & Linux/CLI',
      subtopics: [
        'VS Code / IntelliJ Debugging & Keybindings',
        'Postman API Testing & Automated Collections',
        'Docker Basics: Dockerfile, Images, Containerization',
        'Linux CLI: Navigation, Permissions, Bash Scripts',
        'Cloud Deployment (Render, Vercel, Supabase)'
      ],
      assessmentSkill: 'Git & DevOps'
    },
    {
      id: 'softskills',
      title: '9. Soft Skills & Technical Interview Readiness',
      desc: 'Articulating code design, debugging under pressure, and teamwork',
      subtopics: [
        'Structured Problem Solving & Clarifying Questions',
        'Explaining Code & Time/Space Complexity Out Loud',
        'Live Debugging & System Design Whiteboarding',
        'Reading Official Documentation & Fast Troubleshooting',
        'Collaborative Teamwork & Agile Sprint Standups'
      ],
      assessmentSkill: 'CS Fundamentals'
    }
  ],
  'Java Backend Developer': [
    {
      id: 'java-dsa',
      title: '1. Core Java & Data Structures (DSA)',
      desc: 'Java Collections Framework, OOP & 150+ DSA placement problems',
      subtopics: ['Core Java Syntax & Generics', 'Java Collections (ArrayList, HashMap, PriorityQueue)', 'DSA: Trees, Graphs, DP in Java'],
      assessmentSkill: 'DSA'
    },
    {
      id: 'spring',
      title: '2. Spring Boot & Microservices',
      desc: 'Spring Boot → REST API → Hibernate/JPA → Security → Deployment',
      subtopics: ['Spring Boot Starter & Dependency Injection', 'Building RESTful APIs with Controllers', 'Hibernate & Spring Data JPA', 'Spring Security & JWT Authentication'],
      assessmentSkill: 'SQL & Databases'
    },
    {
      id: 'sql-db',
      title: '3. Database Design & SQL Optimization',
      desc: 'PostgreSQL, Joins, Indexes, ACID Transactions',
      subtopics: ['Advanced SQL & Joins', 'Database Indexing & Query Tuning', 'Database Migrations with Flyway / Liquibase'],
      assessmentSkill: 'SQL & Databases'
    }
  ]
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = getSession();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    trust_score: 15,
    skill_readiness: 0,
    verified_skills_count: 0,
    challenges_solved: 0,
    interviews_count: 0,
    top_skill: null,
    verified_skills: [],
    goal_track: 'Full Stack Software Engineer',
    completed_topics: [],
    interviews: [],
    endorsements: [],
    notifications: []
  });

  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'interviews' | 'endorsements' | 'talents'
  const [talents, setTalents] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ role_title: 'Software Engineer Intern', date_time: '', meet_link: 'https://meet.google.com/new', notes: '' });

  const loadData = () => {
    if (!user) { navigate('/auth'); return; }
    setLoading(true);
    dashboardApi.stats()
      .then((data) => {
        setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (user.role !== 'Student') {
      dashboardApi.listTalents().then((r) => setTalents(r.talents)).catch(() => {});
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const toggleTopic = async (topicName) => {
    const current = stats.completed_topics || [];
    let updated;
    if (current.includes(topicName)) {
      updated = current.filter((t) => t !== topicName);
    } else {
      updated = [...current, topicName];
    }
    
    // Update local state optimistically
    const newCount = updated.length;
    const newReadiness = Math.min(100, Math.floor((newCount * 3.5) + (stats.verified_skills_count * 10) + (stats.challenges_solved * 12)));
    setStats({ ...stats, completed_topics: updated, skill_readiness: newReadiness });

    try {
      await dashboardApi.updateProgress({ goal_track: stats.goal_track, completed_topics: updated });
    } catch {
      toast({ title: 'Sync Error', description: 'Failed to update milestone progress.', variant: 'destructive' });
    }
  };

  const handleTrackChange = async (newTrack) => {
    setStats({ ...stats, goal_track: newTrack });
    try {
      await dashboardApi.updateProgress({ goal_track: newTrack, completed_topics: stats.completed_topics });
      toast({ title: 'Goal Track Updated', description: `Your personalized curriculum is now set to ${newTrack}` });
    } catch {}
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTalent) return;
    try {
      await dashboardApi.scheduleInterview({
        student_id: selectedTalent.id,
        student_name: selectedTalent.name,
        student_email: selectedTalent.email,
        role_title: scheduleForm.role_title,
        date_time: scheduleForm.date_time,
        meet_link: scheduleForm.meet_link,
        notes: scheduleForm.notes
      });
      setShowScheduleModal(false);
      toast({ title: 'Interview Scheduled!', description: `Interview invite & email sent to ${selectedTalent.name} (${selectedTalent.email})` });
      loadData();
    } catch (err) {
      toast({ title: 'Failed to Schedule', description: err?.response?.data?.detail || 'Try again.', variant: 'destructive' });
    }
  };

  const currentRoadmap = ROADMAP_TRACKS[stats.goal_track] || ROADMAP_TRACKS['Full Stack Software Engineer'];

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-[62px]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] tracking-[0.24em] uppercase text-emerald-400 font-mono mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {user?.role || 'Student'} PORTAL · REAL TIME SKILL GRAPH
            </div>
            <h1 className="font-display font-black text-white text-3xl md:text-5xl leading-[1] flex items-baseline gap-3 flex-wrap">
              Welcome, <span className="text-blue-500">{(user?.name || 'Candidate').split(' ')[0]}</span>
            </h1>
            <p className="text-white/50 text-xs md:text-sm mt-2 font-mono flex items-center gap-2">
              <span>{user?.email}</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">VERIFIED EMAIL</span>
            </p>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <Link to="/assessment" className="inline-flex items-center gap-2 rounded-md bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs md:text-sm px-4 py-2.5 shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={16} /> Take Skill Quiz
            </Link>
            <Link to="/challenges" className="inline-flex items-center gap-2 rounded-md border border-white/15 hover:border-white/40 hover:bg-white/5 text-white text-xs md:text-sm px-4 py-2.5">
              <Zap size={16} /> Solve Company Challenge
            </Link>
          </div>
        </div>

        {/* Real Dynamic Stats Grid (Starts at 0% for new users) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard label="Trust Score" value={`${stats.trust_score}/100`} accent="emerald" sub="Email verified + badges" />
          <StatCard label="Skill Readiness" value={`${stats.skill_readiness}%`} accent="blue" sub="Roadmap + quiz verified" />
          <StatCard label="Verified Skills" value={stats.verified_skills_count} accent="emerald" sub="Quizzes passed" />
          <StatCard label="Challenges Solved" value={stats.challenges_solved} accent="blue" sub="GitHub submissions" />
          <StatCard label="Direct Interviews" value={stats.interviews_count} accent="emerald" sub="Recruiter invitations" />
        </div>

        {/* Notifications Bar if any */}
        {stats.notifications && stats.notifications.length > 0 && (
          <div className="mb-8 rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1 font-semibold">
              <Sparkles size={14} /> LIVE TALENT NOTIFICATION
            </div>
            <div className="text-sm text-white font-medium">{stats.notifications[0].title}</div>
            <div className="text-xs text-white/60 mt-0.5">{stats.notifications[0].message}</div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto gap-4">
          <TabButton active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} label="Goal Career Roadmap" icon={<Target size={15} />} />
          <TabButton active={activeTab === 'interviews'} onClick={() => setActiveTab('interviews')} label={`Interviews (${stats.interviews.length})`} icon={<Calendar size={15} />} />
          <TabButton active={activeTab === 'endorsements'} onClick={() => setActiveTab('endorsements')} label={`Teacher & Recruiter Interaction (${stats.endorsements.length})`} icon={<MessageSquare size={15} />} />
          {user?.role !== 'Student' && (
            <TabButton active={activeTab === 'talents'} onClick={() => setActiveTab('talents')} label={`Talent Marketplace (${talents.length})`} icon={<UserCheck size={15} />} />
          )}
        </div>

        {/* TAB 1: ROADMAP & CURRICULUM */}
        {activeTab === 'roadmap' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: 9-Pillar Roadmap */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 mb-1 font-mono text-xs">
                      <Sparkles size={14} /> PERSONALIZED CAREER GOAL
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={stats.goal_track}
                        onChange={(e) => handleTrackChange(e.target.value)}
                        className="bg-[#050508] border border-white/20 rounded-md px-3 py-1.5 text-white font-bold text-lg focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Full Stack Software Engineer">Full Stack Software Engineer Track</option>
                        <option value="Java Backend Developer">Java Backend Developer Track</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-white/40 font-mono uppercase tracking-widest">Readiness Gap</div>
                    <div className="font-display font-black text-white text-2xl">{100 - stats.skill_readiness}% to 100% Ready</div>
                  </div>
                </div>

                {/* Modules Accordion / List */}
                <div className="space-y-4">
                  {currentRoadmap.map((pillar, idx) => {
                    const completedInPillar = pillar.subtopics.filter((st) => stats.completed_topics?.includes(st)).length;
                    const isAllDone = completedInPillar === pillar.subtopics.length && pillar.subtopics.length > 0;
                    
                    return (
                      <div key={pillar.id} className="rounded-lg border border-white/10 bg-[#0a0c11] overflow-hidden">
                        <div className="p-4 flex items-center justify-between gap-3 border-b border-white/5 bg-white/[0.02]">
                          <div>
                            <div className="font-bold text-white text-base flex items-center gap-2">
                              <span>{pillar.title}</span>
                              {isAllDone && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-normal">COMPLETED</span>}
                            </div>
                            <div className="text-xs text-white/50 mt-0.5">{pillar.desc}</div>
                          </div>
                          
                          <Link
                            to={`/assessment?skill=${encodeURIComponent(pillar.assessmentSkill || 'JavaScript')}`}
                            className="shrink-0 text-xs font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded flex items-center gap-1"
                          >
                            Verify Quiz <ArrowUpRight size={12} />
                          </Link>
                        </div>

                        <div className="p-3 space-y-1.5 bg-[#050508]/40">
                          {pillar.subtopics.map((subtopic) => {
                            const isDone = stats.completed_topics?.includes(subtopic);
                            return (
                              <button
                                key={subtopic}
                                type="button"
                                onClick={() => toggleTopic(subtopic)}
                                className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded hover:bg-white/5 transition-colors group"
                              >
                                {isDone ? (
                                  <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                                ) : (
                                  <Square size={16} className="text-white/30 group-hover:text-white/60 shrink-0" />
                                )}
                                <span className={`text-xs ${isDone ? 'text-white/90 line-through text-white/50' : 'text-white/80'}`}>
                                  {subtopic}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel: Verified Skills & Matchmaker */}
            <div className="space-y-6">
              {/* Top Skill Card */}
              <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
                <div className="flex items-center gap-2 text-blue-400 mb-2 font-mono text-xs">
                  <Trophy size={14} /> <span>HIGHEST VERIFIED SKILL</span>
                </div>
                {stats.top_skill ? (
                  <>
                    <div className="font-display font-black text-white text-3xl">{stats.top_skill.name}</div>
                    <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${stats.top_skill.score}%` }}></div>
                    </div>
                    <div className="text-white/50 text-xs mt-2 font-mono">Proctored Score · {stats.top_skill.score}%</div>
                  </>
                ) : (
                  <div className="text-xs text-white/40 py-2">
                    No quizzes passed yet. Take a 5-question assessment to earn your first verified badge!
                  </div>
                )}
              </div>

              {/* Verified Skills List */}
              <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
                    <BookOpen size={14} /> <span>VERIFIED SKILL BADGES</span>
                  </div>
                  <span className="text-xs font-mono text-white/40">{stats.verified_skills.length} verified</span>
                </div>

                {stats.verified_skills.length === 0 ? (
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-dashed border-white/10 text-center">
                    <p className="text-xs text-white/40 mb-3">Your profile starts at 0 verified badges.</p>
                    <Link to="/assessment" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono">
                      Start DSA / JS Quiz <ArrowUpRight size={13} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.verified_skills.map((vs, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md border border-emerald-500/20 bg-emerald-500/[0.04] px-3.5 py-2.5 font-mono text-xs">
                        <span className="text-emerald-400 font-semibold">{vs.skill} · {vs.score}%</span>
                        <div className="flex items-center gap-1 text-[11px] text-white/60">
                          <span>Integrity: {vs.integrity}%</span>
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recruiter Auto-Match Status */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <Building2 size={16} /> Automated Recruiter Match
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Companies receive automated shortlists when you score <strong>≥ 80% on assessments</strong> or submit working GitHub project code.
                </p>
                <div className="pt-2">
                  <Link to="/challenges" className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    Browse 3 Active Recruiter Challenges <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULED INTERVIEWS */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display font-black text-white text-2xl">Scheduled Recruiter Interviews</h2>
                  <p className="text-xs text-white/50 mt-1">Direct technical rounds scheduled by company recruiters & faculty mentors.</p>
                </div>
              </div>

              {stats.interviews.length === 0 ? (
                <div className="p-8 rounded-lg border border-dashed border-white/10 text-center bg-white/[0.01]">
                  <Calendar size={32} className="mx-auto text-white/20 mb-3" />
                  <h3 className="text-base font-bold text-white">No Interviews Scheduled Yet</h3>
                  <p className="text-xs text-white/50 max-w-md mx-auto mt-1 mb-4">
                    Complete your skill verification quizzes and submit challenges with $\ge 80\%$ score to trigger direct interview shortlists!
                  </p>
                  <Link to="/assessment" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400 text-black font-semibold rounded text-xs">
                    Verify Skills Now
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {stats.interviews.map((iv) => (
                    <div key={iv.id} className="rounded-lg border border-emerald-500/30 bg-[#0a0c11] p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {iv.status}
                        </span>
                        <span className="text-xs text-white/40 font-mono">{iv.date_time}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{iv.role_title}</h4>
                        <p className="text-xs text-white/60 font-mono mt-0.5">Company: <strong className="text-white">{iv.company_name}</strong></p>
                      </div>
                      {iv.notes && <p className="text-xs text-white/70 italic bg-white/5 p-2 rounded">"{iv.notes}"</p>}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <a
                          href={iv.meet_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                        >
                          <Video size={14} /> Join Google Meet
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ENDORSEMENTS & TEACHER INTERACTION */}
        {activeTab === 'endorsements' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
              <h2 className="font-display font-black text-white text-2xl mb-1">Student · Teacher · Recruiter Interactions</h2>
              <p className="text-xs text-white/50 mb-6">Mentorship feedback, college TPO recommendations, and recruiter notes.</p>

              {stats.endorsements.length === 0 ? (
                <div className="p-8 rounded-lg border border-dashed border-white/10 text-center bg-white/[0.01]">
                  <MessageSquare size={32} className="mx-auto text-white/20 mb-3" />
                  <p className="text-xs text-white/50">No mentor endorsements yet. Take assessments to request faculty endorsements!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.endorsements.map((e) => (
                    <div key={e.id} className="p-4 rounded-lg border border-white/10 bg-[#0a0c11]">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-bold text-white">{e.author_name} <span className="text-xs text-emerald-400 font-mono">({e.author_role})</span></div>
                        <span className="text-[11px] text-white/40 font-mono">{e.created_at?.split('T')[0]}</span>
                      </div>
                      <p className="text-xs text-white/80 mt-1">"{e.message}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TALENT MARKETPLACE (FOR RECRUITERS & TEACHERS) */}
        {activeTab === 'talents' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-6">
              <h2 className="font-display font-black text-white text-2xl mb-1">Verified Candidate Talent Marketplace</h2>
              <p className="text-xs text-white/50 mb-6">Real registered candidates with proctored skill proofs. 1-click schedule interview.</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {talents.map((t) => (
                  <div key={t.id} className="rounded-lg border border-white/10 bg-[#0a0c11] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{t.name}</span>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        Trust: {t.trust_score}/100
                      </span>
                    </div>
                    <div className="text-xs text-white/50 font-mono truncate">{t.email}</div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs bg-white/[0.02] p-2 rounded font-mono">
                      <div><span className="text-white/40">Verified:</span> <strong className="text-emerald-400">{t.verified_count} skills</strong></div>
                      <div><span className="text-white/40">Avg Score:</span> <strong className="text-blue-400">{t.avg_score}%</strong></div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedTalent(t);
                        setShowScheduleModal(true);
                      }}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-semibold py-1.5"
                    >
                      <Calendar size={13} className="mr-1.5" /> Schedule Interview
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {showScheduleModal && selectedTalent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b0d13] border border-white/20 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-emerald-400" /> Schedule Interview for {selectedTalent.name}
            </h3>
            <p className="text-xs text-white/50">An automated email invitation and calendar link will be dispatched to {selectedTalent.email}.</p>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs text-white/80">Role / Position Title</Label>
                <Input
                  value={scheduleForm.role_title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, role_title: e.target.value })}
                  placeholder="e.g. Software Engineer - React / Node"
                  required
                  className="bg-[#050508] border-white/10 text-white mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-white/80">Date & Time</Label>
                <Input
                  value={scheduleForm.date_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date_time: e.target.value })}
                  placeholder="e.g. Tomorrow at 3:00 PM IST"
                  required
                  className="bg-[#050508] border-white/10 text-white mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-white/80">Meeting Link (Google Meet / Zoom)</Label>
                <Input
                  value={scheduleForm.meet_link}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meet_link: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abc"
                  required
                  className="bg-[#050508] border-white/10 text-white mt-1 text-xs font-mono"
                />
              </div>

              <div>
                <Label className="text-xs text-white/80">Notes for Candidate</Label>
                <Input
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="e.g. Please be ready with your code editor."
                  className="bg-[#050508] border-white/10 text-white mt-1 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs">
                  Send Invite & Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ label, value, accent, sub }) => (
  <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-4 flex flex-col justify-between">
    <div className="text-[11px] text-white/40 font-mono uppercase tracking-widest">{label}</div>
    <div className={`font-display font-black text-2xl md:text-3xl my-1.5 ${accent === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`}>
      {value}
    </div>
    <div className="text-[10px] text-white/40 font-mono truncate">{sub}</div>
  </div>
);

const TabButton = ({ active, onClick, label, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`pb-3 text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${
      active ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/70'
    }`}
  >
    {icon} {label}
  </button>
);

export default Dashboard;
