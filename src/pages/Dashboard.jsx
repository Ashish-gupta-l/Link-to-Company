import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, Circle, ArrowUpRight, Sparkles, Trophy, Target, BookOpen,
  ShieldCheck, Zap, Calendar, Video, MessageSquare, Plus, Building2,
  GraduationCap, Award, CheckSquare, Square, ChevronRight, UserCheck,
  Flame, HelpCircle, FileText, Globe, Layers, Laptop, Edit3, Bookmark,
  Share2, ExternalLink, Code2, Play, Search, Filter, Compass, Clock, Check
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { getSession, dashboardApi } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

// Comprehensive 9-Pillar Roadmap Topics
const DEFAULT_ROADMAP = [
  {
    id: 'dsa',
    title: '2. Data Structures & Algorithms (DSA)',
    desc: 'Target: 150–250 quality problems with pattern mastery for campus & tech interviews.',
    assessmentSkill: 'DSA',
    topics: [
      { name: 'Arrays & Strings (Two Pointers, Sliding Window)', diff: 'Easy-Med' },
      { name: 'Linked List (Reversal, Fast-Slow Pointer)', diff: 'Med' },
      { name: 'Stack & Queue (Monotonic Stack, Parentheses)', diff: 'Med' },
      { name: 'HashMap & HashSet (Frequency Counting, Anagrams)', diff: 'Easy' },
      { name: 'Recursion & Backtracking (Subsets, Permutations)', diff: 'Med-Hard' },
      { name: 'Trees & Binary Search Trees (Traversals, LCA)', diff: 'Med' },
      { name: 'Heaps & Priority Queues (Kth Largest, Top K)', diff: 'Med' },
      { name: 'Graph Algorithms (BFS/DFS, Dijkstra, Topo Sort)', diff: 'Med-Hard' },
      { name: 'Sorting & Searching (Binary Search variations)', diff: 'Easy-Med' },
      { name: 'Dynamic Programming (0/1 Knapsack, LCS, LIS, Grid DP)', diff: 'Hard' }
    ]
  },
  {
    id: 'dev',
    title: '3. Full Stack Development Track',
    desc: 'HTML/CSS → JavaScript → React → Node.js → Database → REST APIs → Deployment',
    assessmentSkill: 'JavaScript',
    topics: [
      { name: 'HTML5 & Modern Responsive CSS / Tailwind Layouts', diff: 'Easy' },
      { name: 'Core JavaScript ES6+, Async/Await & Event Loop', diff: 'Med' },
      { name: 'React Components, Hooks, Context API & State Management', diff: 'Med' },
      { name: 'Node.js & Express RESTful API Architecture', diff: 'Med' },
      { name: 'JWT Authentication & Role-Based Access Control', diff: 'Med' },
      { name: 'Production Cloud Deployment (Render / Docker)', diff: 'Med' }
    ]
  },
  {
    id: 'db',
    title: '4. Database Mastery',
    desc: 'SQL, Relational Modeling, Indexing & ACID Transactions',
    assessmentSkill: 'SQL & Databases',
    topics: [
      { name: 'Relational DBs: PostgreSQL / MySQL Architecture', diff: 'Easy' },
      { name: 'Advanced SQL Queries, Subqueries & Complex Joins', diff: 'Med' },
      { name: 'Database Indexing (B-Tree) & Query Plan Optimization', diff: 'Med' },
      { name: 'ACID Transactions, Locking & Concurrency Control', diff: 'Med-Hard' },
      { name: 'Schema Normalization (1NF, 2NF, 3NF, BCNF)', diff: 'Med' },
      { name: 'NoSQL Data Modeling with MongoDB', diff: 'Easy-Med' }
    ]
  },
  {
    id: 'git',
    title: '5. Git & GitHub Workflow',
    desc: 'Professional team version control & code review pipelines',
    assessmentSkill: 'Git & DevOps',
    topics: [
      { name: 'git clone, init, add, commit, push, status', diff: 'Easy' },
      { name: 'Branching strategies (feature branches, main)', diff: 'Easy' },
      { name: 'git merge, pull requests (PR) & code review', diff: 'Med' },
      { name: 'Resolving Git merge conflicts cleanly', diff: 'Med' },
      { name: 'GitHub Actions & Automated CI/CD Basics', diff: 'Med' }
    ]
  },
  {
    id: 'cs',
    title: '6. Core Computer Science Fundamentals',
    desc: 'High-frequency campus interview & placement topics',
    assessmentSkill: 'CS Fundamentals',
    topics: [
      { name: 'Object-Oriented Programming (OOP: Encapsulation, Polymorphism, Abstraction)', diff: 'Med' },
      { name: 'DBMS Architecture, Transactions & Storage Engines', diff: 'Med' },
      { name: 'Operating Systems (Processes, Threads, Deadlocks, Virtual Memory)', diff: 'Med' },
      { name: 'Computer Networks (OSI Model, TCP/IP, DNS, HTTP/HTTPS)', diff: 'Med' },
      { name: 'Software Engineering Basics & Agile Scrum Life Cycle', diff: 'Easy' }
    ]
  },
  {
    id: 'projects',
    title: '7. Real Industry Projects',
    desc: 'Build 2–4 comprehensive production-grade projects with live deployment',
    assessmentSkill: 'Node.js',
    topics: [
      { name: 'Project 1: Secure Authentication + Live Email OTP System', diff: 'Med' },
      { name: 'Project 2: E-Commerce Store with Payment & Cart APIs', diff: 'Med-Hard' },
      { name: 'Project 3: College Placement & Student Management ERP', diff: 'Med' },
      { name: 'Project 4: Real-Time Team Collaboration & Chat Application', diff: 'Hard' }
    ]
  },
  {
    id: 'tools',
    title: '8. Developer Tools & DevOps',
    desc: 'VS Code, Postman, Docker containerization & Linux/CLI',
    assessmentSkill: 'Git & DevOps',
    topics: [
      { name: 'VS Code / IntelliJ Debugging & Productivity Setup', diff: 'Easy' },
      { name: 'Postman API Testing & Automated Collections', diff: 'Easy' },
      { name: 'Docker Basics: Dockerfile, Images, Containerization', diff: 'Med' },
      { name: 'Linux CLI: Navigation, Permissions, Bash Scripts', diff: 'Med' },
      { name: 'Cloud Deployment (Render, Vercel, Supabase)', diff: 'Med' }
    ]
  },
  {
    id: 'softskills',
    title: '9. Soft Skills & Technical Interview Readiness',
    desc: 'Articulating code design, debugging under pressure, and teamwork',
    assessmentSkill: 'CS Fundamentals',
    topics: [
      { name: 'Structured Problem Solving & Clarifying Questions', diff: 'Med' },
      { name: 'Explaining Code & Time/Space Complexity Out Loud', diff: 'Med' },
      { name: 'Live Debugging & System Design Whiteboarding', diff: 'Med-Hard' },
      { name: 'Reading Official Documentation & Fast Troubleshooting', diff: 'Med' },
      { name: 'Collaborative Teamwork & Agile Sprint Standups', diff: 'Easy' }
    ]
  }
];

// Curated Company Wise Kits
const COMPANY_KITS = [
  {
    id: 'google',
    name: 'Google Placement Kit',
    tier: 'MAANG',
    color: 'from-blue-500/20 to-red-500/20 border-blue-500/30',
    questions: 35,
    topFocus: 'Graph Algorithms, Dynamic Programming, Scalability',
    items: ['Two Sum & 3Sum Variations', 'Median of Two Sorted Arrays', 'Word Ladder (BFS)', 'Alien Dictionary (Topo Sort)', 'LRU Cache Design']
  },
  {
    id: 'amazon',
    name: 'Amazon SDE Kit',
    tier: 'MAANG',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
    questions: 42,
    topFocus: 'Tree Traversal, Sliding Window, Leadership Principles',
    items: ['Number of Islands', 'Course Schedule II', 'Rotting Oranges', 'Top K Frequent Elements', 'Merge K Sorted Lists']
  },
  {
    id: 'microsoft',
    name: 'Microsoft Engineering Kit',
    tier: 'Tier 1',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    questions: 30,
    topFocus: 'Binary Trees, Linked Lists, System Design Basics',
    items: ['Lowest Common Ancestor in BST', 'Reverse Nodes in k-Group', 'Search in Rotated Sorted Array', 'Design Underground System']
  },
  {
    id: 'tcs-infosys',
    name: 'TCS Digital & Infosys SP Kit',
    tier: 'Mass Placement',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    questions: 28,
    topFocus: 'Strings, HashMaps, SQL Queries & Core CS',
    items: ['Longest Substring Without Repeating Characters', 'Valid Parentheses', 'SQL Group By & Subqueries', 'OOP Inheritance & Encapsulation']
  },
  {
    id: 'techvedika',
    name: 'TechVedika & Startup Kit',
    tier: 'Product Startup',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    questions: 24,
    topFocus: 'REST APIs, React State, JWT Auth, Database Design',
    items: ['Build Auth + Email OTP System', 'Design RESTful Student Management API', 'Implement Responsive Dashboard', 'SQL Indexing & Normalization']
  }
];

const EXPLORE_SHEETS = [
  { id: 'striver', title: "Striver's SDE Sheet (190 Problems)", author: 'Striver', questions: 190, category: 'DSA Placement' },
  { id: 'blind75', title: 'Blind 75 LeetCode Master Sheet', author: 'Silicon Valley Curated', questions: 75, category: 'FAANG DSA' },
  { id: 'lovebabbar', title: 'Love Babbar 450 DSA Sheet', author: 'Love Babbar', questions: 450, category: 'Comprehensive DSA' },
  { id: 'sql50', title: 'Top 50 LeetCode SQL Queries', author: 'Database Leads', questions: 50, category: 'SQL & DB' },
  { id: 'cs100', title: '100 Core CS Fundamentals Questions', author: 'LinktoCompany Experts', questions: 100, category: 'OOP, OS, DBMS, CN' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = getSession();

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

  const [activeTab, setActiveTab] = useState('my-sheets');
  const [talents, setTalents] = useState([]);
  const [customSheets, setCustomSheets] = useState([]);
  const [showCreateSheetModal, setShowCreateSheetModal] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetDesc, setNewSheetDesc] = useState('');
  const [showTourModal, setShowTourModal] = useState(false);

  // Workspace code note state
  const [workspaceNotes, setWorkspaceNotes] = useState(
    "// 📝 LinktoCompany Code & Placement Notes\n// Track your algorithm approaches, SQL queries, and interview preparation notes here.\n\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}"
  );

  // Sync tab with URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const loadData = () => {
    if (!user) { navigate('/auth'); return; }
    dashboardApi.stats()
      .then((data) => {
        setStats(data);
      })
      .catch(() => {});

    if (user.role !== 'Student') {
      dashboardApi.listTalents().then((r) => setTalents(r.talents)).catch(() => {});
    }

    const savedCustom = localStorage.getItem('ltc_custom_sheets');
    if (savedCustom) {
      try { setCustomSheets(JSON.parse(savedCustom)); } catch {}
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
    
    // Dynamic calculation
    const newCount = updated.length;
    const newReadiness = Math.min(100, Math.floor((newCount * 2.2) + (stats.verified_skills_count * 10) + (stats.challenges_solved * 12)));
    setStats({ ...stats, completed_topics: updated, skill_readiness: newReadiness });

    try {
      await dashboardApi.updateProgress({ goal_track: stats.goal_track, completed_topics: updated });
    } catch {
      toast({ title: 'Sync Error', description: 'Failed to update topic milestone.', variant: 'destructive' });
    }
  };

  const handleCreateCustomSheet = (e) => {
    e.preventDefault();
    if (!newSheetTitle.trim()) return;
    const newSheet = {
      id: `custom_${Date.now()}`,
      title: newSheetTitle.trim(),
      desc: newSheetDesc.trim() || 'Custom placement preparation sheet',
      created: new Date().toLocaleDateString(),
      itemsCount: 0
    };
    const updated = [newSheet, ...customSheets];
    setCustomSheets(updated);
    localStorage.setItem('ltc_custom_sheets', JSON.stringify(updated));
    setShowCreateSheetModal(false);
    setNewSheetTitle('');
    setNewSheetDesc('');
    toast({ title: 'Custom Sheet Created!', description: `"${newSheet.title}" added to your custom sheets.` });
  };

  const totalTopicsCount = DEFAULT_ROADMAP.reduce((acc, p) => acc + p.topics.length, 0);
  const completedTopicsCount = stats.completed_topics?.length || 0;

  return (
    <AppLayout activeTab={activeTab} onTabChange={(t) => setActiveTab(t)} stats={stats}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* VIEW 1: MY SHEETS (Codolio Style Landing for Student Dashboard) */}
        {/* ========================================================================= */}
        {activeTab === 'my-sheets' && (
          <div className="space-y-8">
            
            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>My Sheets</span>
                </h1>
                <p className="text-xs md:text-sm text-white/50 mt-1">
                  Based on your personal and followed placement roadmaps & skill sheets
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTourModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold font-mono transition-colors"
                >
                  <BookOpen size={14} /> Tour
                </button>
              </div>
            </div>

            {/* SECTION 1: FOLLOWED SHEETS */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Followed Sheets</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('explore-sheets')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1"
                >
                  Explore More <ChevronRight size={13} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* 9-Pillar Full Stack SDE Sheet Card */}
                <div className="rounded-xl border border-blue-500/30 bg-[#0f121a] p-5 space-y-4 hover:border-blue-500/50 transition-all shadow-lg shadow-blue-500/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">PRIMARY TRACK</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-1">9-Pillar Software Engineer Curriculum</h3>
                      <p className="text-xs text-white/50 mt-0.5">DSA, Full Stack, SQL Databases, Git, CS Fundamentals & Real Projects</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 shrink-0">
                      {completedTopicsCount}/{totalTopicsCount} Done
                    </span>
                  </div>

                  {/* Dynamic Progress Bar (Starts at 0% for new user) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white/60">Skill Readiness</span>
                      <span className="text-emerald-400 font-bold">{stats.skill_readiness}% Ready</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${stats.skill_readiness}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-white/40">
                      Trust Score: <strong className="text-white">{stats.trust_score}/100</strong>
                    </span>
                    <a
                      href="#roadmap-table"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      View Sheet Modules <ChevronRight size={13} />
                    </a>
                  </div>
                </div>

                {/* Company Wise Placement Kit Card */}
                <div className="rounded-xl border border-amber-500/30 bg-[#0f121a] p-5 space-y-4 hover:border-amber-500/50 transition-all shadow-lg shadow-amber-500/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">🌟</span>
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest font-mono">COMPANY KITS</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-1">Company Wise Interview Kit</h3>
                      <p className="text-xs text-white/50 mt-0.5">Google, Amazon, Microsoft, TCS Digital & TechVedika kits</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                      5 Kits Active
                    </span>
                  </div>

                  <p className="text-xs text-white/60 line-clamp-2">
                    Curated top-frequency algorithmic, system design, and role-specific technical questions asked in recent on-campus & off-campus drives.
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-white/40">150+ Curated Problems</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('company-kit')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200"
                    >
                      Open Company Kits <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: CUSTOM SHEETS (Codolio Exact Dotted + Card Style) */}
            <div className="space-y-3.5">
              <h2 className="text-base font-bold text-white tracking-tight">Custom Sheets</h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Dotted + Create a new sheet card */}
                <button
                  type="button"
                  onClick={() => setShowCreateSheetModal(true)}
                  className="rounded-xl border-2 border-dashed border-white/20 hover:border-amber-400/60 bg-white/[0.01] hover:bg-amber-400/[0.03] p-8 flex flex-col items-center justify-center gap-3 transition-all group min-h-[160px]"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 transition-transform group-hover:scale-110">
                    <Plus size={24} />
                  </div>
                  <span className="text-sm font-semibold text-white/80 group-hover:text-amber-300">
                    Create a new sheet
                  </span>
                </button>

                {/* Rendered Custom Sheets if any */}
                {customSheets.map((cs) => (
                  <div key={cs.id} className="rounded-xl border border-white/10 bg-[#0f121a] p-5 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{cs.created}</div>
                      <h4 className="font-bold text-white text-base mt-1">{cs.title}</h4>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">{cs.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="font-mono text-emerald-400">Custom Sheet</span>
                      <button
                        onClick={() => {
                          const updated = customSheets.filter((x) => x.id !== cs.id);
                          setCustomSheets(updated);
                          localStorage.setItem('ltc_custom_sheets', JSON.stringify(updated));
                        }}
                        className="text-red-400 hover:text-red-300 text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {customSheets.length === 0 && (
                <p className="text-xs text-white/40 text-center py-2">
                  No custom sheets created yet. Click above to create personalized practice lists.
                </p>
              )}
            </div>

            {/* SECTION 3: FULL 9-PILLAR ROADMAP TABLE */}
            <div id="roadmap-table" className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Full Curriculum & Topic Tracker (9 Pillars)</h2>
                  <p className="text-xs text-white/50">Check off topics as you learn them. Progress dynamically updates in real time.</p>
                </div>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                  {completedTopicsCount} of {totalTopicsCount} Topics Completed
                </div>
              </div>

              <div className="space-y-4">
                {DEFAULT_ROADMAP.map((pillar) => {
                  const completedInPillar = pillar.topics.filter((t) => stats.completed_topics?.includes(t.name)).length;
                  const isAllDone = completedInPillar === pillar.topics.length;

                  return (
                    <div key={pillar.id} className="rounded-xl border border-white/10 bg-[#0b0d14] overflow-hidden">
                      {/* Pillar Header */}
                      <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                            <span>{pillar.title}</span>
                            {isAllDone && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                                COMPLETED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{pillar.desc}</p>
                        </div>

                        <Link
                          to={`/assessment?skill=${encodeURIComponent(pillar.assessmentSkill)}`}
                          className="shrink-0 text-xs font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                        >
                          <ShieldCheck size={13} /> Verify Quiz
                        </Link>
                      </div>

                      {/* Topic Rows */}
                      <div className="divide-y divide-white/[0.04]">
                        {pillar.topics.map((item) => {
                          const isDone = stats.completed_topics?.includes(item.name);
                          return (
                            <div
                              key={item.name}
                              className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                            >
                              <button
                                type="button"
                                onClick={() => toggleTopic(item.name)}
                                className="flex items-center gap-3 text-left flex-1 group"
                              >
                                {isDone ? (
                                  <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                                ) : (
                                  <Square size={16} className="text-white/30 group-hover:text-white/60 shrink-0" />
                                )}
                                <span className={`text-xs md:text-sm ${isDone ? 'line-through text-white/40' : 'text-white/85'}`}>
                                  {item.name}
                                </span>
                              </button>

                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                item.diff === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                item.diff.includes('Hard') ? 'bg-red-500/10 text-red-400' :
                                'bg-blue-500/10 text-blue-400'
                              }`}>
                                {item.diff}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: COMPANY WISE KIT */}
        {/* ========================================================================= */}
        {activeTab === 'company-kit' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Company Wise Interview Kits</h1>
              <p className="text-xs text-white/50 mt-1">High-frequency interview questions & technical assessments targeted per company.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {COMPANY_KITS.map((kit) => (
                <div key={kit.id} className={`rounded-xl border bg-[#0b0d14] p-5 flex flex-col justify-between space-y-4 bg-gradient-to-br ${kit.color}`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/70">{kit.tier}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{kit.questions} Problems</span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-1">{kit.name}</h3>
                    <p className="text-xs text-white/70 font-mono mt-1">Focus: {kit.topFocus}</p>

                    <div className="mt-4 space-y-1.5">
                      <div className="text-[11px] font-bold text-white/80 uppercase tracking-wider font-mono">Sample Problems:</div>
                      {kit.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-white/80 flex items-center gap-2 bg-black/30 px-2.5 py-1.5 rounded">
                          <span className="text-[10px] text-amber-400 font-mono">{idx + 1}.</span>
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    to="/challenges"
                    className="w-full text-center py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    Solve Company Challenges <ArrowUpRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: EXPLORE SHEETS */}
        {/* ========================================================================= */}
        {activeTab === 'explore-sheets' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Explore Curated Sheets</h1>
              <p className="text-xs text-white/50 mt-1">Popular community & competitive programming roadmaps.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {EXPLORE_SHEETS.map((s) => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-[#0b0d14] p-5 flex items-center justify-between hover:border-blue-500/40 transition-all">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">{s.category}</span>
                    <h3 className="text-base font-bold text-white">{s.title}</h3>
                    <div className="text-xs text-white/50 font-mono">Curated by {s.author} · {s.questions} problems</div>
                  </div>
                  <Button
                    onClick={() => {
                      setActiveTab('my-sheets');
                      toast({ title: 'Enrolled in Sheet', description: `Now tracking ${s.title}` });
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Enroll
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: MY WORKSPACE & NOTES */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">My Workspace & Scratchpad</h1>
                <p className="text-xs text-white/50 mt-1">Write code solutions, complexity analyses, and revision notes.</p>
              </div>
              <Button
                onClick={() => toast({ title: 'Workspace Saved', description: 'Your code notes are saved locally.' })}
                className="bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-semibold"
              >
                Save Scratchpad
              </Button>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0b0d14] overflow-hidden">
              <div className="bg-black/50 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-white/60">scratchpad.js</span>
                <span className="text-[11px] font-mono text-emerald-400">Auto-saved</span>
              </div>
              <textarea
                value={workspaceNotes}
                onChange={(e) => setWorkspaceNotes(e.target.value)}
                rows={16}
                className="w-full bg-[#07080c] p-4 text-white font-mono text-xs md:text-sm focus:outline-none resize-y"
              ></textarea>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: NOTES & CHEATSHEETS */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Interview Cheatsheets & Notes</h1>
              <p className="text-xs text-white/50 mt-1">Fast revision summaries for technical interview rounds.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14] space-y-2">
                <h3 className="font-bold text-white text-base">DSA Time Complexities Quick Reference</h3>
                <ul className="text-xs text-white/70 space-y-1 font-mono">
                  <li>• Binary Search: O(log n)</li>
                  <li>• QuickSort / MergeSort: O(n log n)</li>
                  <li>• HashMap Lookup & Insertion: O(1) avg</li>
                  <li>• Graph BFS/DFS: O(V + E)</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14] space-y-2">
                <h3 className="font-bold text-white text-base">ACID Database Properties</h3>
                <ul className="text-xs text-white/70 space-y-1">
                  <li>• <strong>Atomicity:</strong> All operations succeed or all roll back.</li>
                  <li>• <strong>Consistency:</strong> Preserves schema constraints & invariants.</li>
                  <li>• <strong>Isolation:</strong> Concurrent transactions do not interfere.</li>
                  <li>• <strong>Durability:</strong> Committed transactions persist across crashes.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14] space-y-2">
                <h3 className="font-bold text-white text-base">OOP Principles Explained</h3>
                <ul className="text-xs text-white/70 space-y-1">
                  <li>• <strong>Encapsulation:</strong> Bundling data and methods with private fields.</li>
                  <li>• <strong>Abstraction:</strong> Hiding internal complexities behind interfaces.</li>
                  <li>• <strong>Inheritance:</strong> Reusing code hierarchy across classes.</li>
                  <li>• <strong>Polymorphism:</strong> Method overloading & overriding.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14] space-y-2">
                <h3 className="font-bold text-white text-base">Git Daily Commands</h3>
                <ul className="text-xs text-white/70 space-y-1 font-mono">
                  <li>• git checkout -b feature/new-branch</li>
                  <li>• git commit -m "feat: implement auth OTP"</li>
                  <li>• git push origin feature/new-branch</li>
                  <li>• git pull --rebase origin main</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: PORTFOLIO & VERIFIED PROOF CARD */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Verified Candidate Portfolio</h1>
              <p className="text-xs text-white/50 mt-1">Cryptographically signed skill proofs and anti-cheat verified scores.</p>
            </div>

            <div className="max-w-2xl rounded-2xl border border-blue-500/30 bg-[#0f121a] p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-black text-white text-xl">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{user?.name}</h2>
                    <p className="text-xs text-white/50 font-mono">{user?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Trust Score</div>
                  <div className="text-2xl font-black text-emerald-400">{stats.trust_score}/100</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-lg font-bold text-white">{stats.verified_skills_count}</div>
                  <div className="text-[10px] text-white/50 font-mono">Verified Skills</div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-lg font-bold text-blue-400">{stats.skill_readiness}%</div>
                  <div className="text-[10px] text-white/50 font-mono">Skill Readiness</div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-lg font-bold text-amber-400">{stats.challenges_solved}</div>
                  <div className="text-[10px] text-white/50 font-mono">Challenges</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">Verified Skill Badges</h4>
                {stats.verified_skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stats.verified_skills.map((vs, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> {vs.skill} ({vs.score}%)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40">No quizzes passed yet. Take assessments to earn verified skill badges.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 7: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Campus & Global Leaderboard</h1>
              <p className="text-xs text-white/50 mt-1">Rankings based on verified quiz accuracy, anti-cheat integrity, and challenge submissions.</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0b0d14] overflow-hidden">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-white/[0.03] border-b border-white/10 text-white/50 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Rank</th>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Verified Badges</th>
                    <th className="p-4">Avg Score</th>
                    <th className="p-4 text-right">Trust Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {talents.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono font-bold text-amber-400">#{idx + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-white">{t.name}</div>
                        <div className="text-xs text-white/40 font-mono">{t.email}</div>
                      </td>
                      <td className="p-4 font-mono text-emerald-400">{t.verified_count} skills</td>
                      <td className="p-4 font-mono text-blue-400">{t.avg_score}%</td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-400">{t.trust_score}/100</td>
                    </tr>
                  ))}
                  {talents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/40 text-xs">
                        Leaderboard ranks will populate as candidates complete verified assessments.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 8: TEACHER & RECRUITER INTERACTION / INTERVIEWS */}
        {activeTab === 'interaction' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Teacher & Recruiter Interaction</h1>
              <p className="text-xs text-white/50 mt-1">Scheduled technical interviews (Google Meet) and faculty mentorship feedback.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Scheduled Interviews */}
              <div className="rounded-xl border border-white/10 bg-[#0b0d14] p-5 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-400" /> Scheduled Interviews ({stats.interviews?.length || 0})
                </h3>

                {stats.interviews?.length > 0 ? (
                  stats.interviews.map((iv) => (
                    <div key={iv.id} className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-emerald-400 font-bold">{iv.role_title}</span>
                        <span className="text-white/40">{iv.date_time}</span>
                      </div>
                      <div className="text-xs text-white/70 font-mono">Company: <strong>{iv.company_name}</strong></div>
                      {iv.notes && <p className="text-xs text-white/60 italic">"{iv.notes}"</p>}
                      <a
                        href={iv.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold mt-2"
                      >
                        <Video size={13} /> Join Google Meet
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/40 py-4">No interviews scheduled yet. Score $\ge 80\%$ on quizzes to receive recruiter interview calls.</p>
                )}
              </div>

              {/* Endorsements & Feedback */}
              <div className="rounded-xl border border-white/10 bg-[#0b0d14] p-5 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-400" /> Mentor & Recruiter Notes
                </h3>
                {stats.endorsements?.length > 0 ? (
                  stats.endorsements.map((e) => (
                    <div key={e.id} className="p-3.5 rounded-lg border border-white/10 bg-black/30 space-y-1">
                      <div className="text-xs font-bold text-white">{e.author_name} <span className="text-white/40">({e.author_role})</span></div>
                      <p className="text-xs text-white/70">"{e.message}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/40 py-4">No mentorship feedback yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 9: HELP CENTER & FEEDBACK */}
        {(activeTab === 'help' || activeTab === 'feedback') && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-2xl font-black text-white">Help Center & Feedback</h1>
              <p className="text-xs text-white/50 mt-1">Get support on skill assessments, interview shortlists, or submit feedback.</p>
            </div>

            <div className="p-6 rounded-xl border border-white/10 bg-[#0b0d14] space-y-4">
              <h3 className="font-bold text-white text-base">Frequently Asked Questions</h3>
              <div className="space-y-3 text-xs text-white/70">
                <div>
                  <strong className="text-white">How does Trust Score increase?</strong>
                  <p>Your Trust Score starts at 15/100 upon email OTP verification. Each passed proctored assessment adds +15 points, and completed challenges add +20 points.</p>
                </div>
                <div>
                  <strong className="text-white">How do companies schedule interviews?</strong>
                  <p>When you achieve $\ge 80\%$ on skill quizzes or submit high-quality GitHub repositories, automated talent alerts match your profile with recruiters who schedule Google Meet interviews directly.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CREATE CUSTOM SHEET MODAL */}
      {showCreateSheetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f121a] border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-amber-400" /> Create Custom Sheet
            </h3>
            <form onSubmit={handleCreateCustomSheet} className="space-y-3">
              <div>
                <Label className="text-xs text-white/80">Sheet Title</Label>
                <Input
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  placeholder="e.g. My 30-Day LeetCode Grind"
                  required
                  className="bg-[#07080c] border-white/10 text-white mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-white/80">Description</Label>
                <Input
                  value={newSheetDesc}
                  onChange={(e) => setNewSheetDesc(e.target.value)}
                  placeholder="e.g. High priority DSA questions for Amazon"
                  className="bg-[#07080c] border-white/10 text-white mt-1 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" onClick={() => setShowCreateSheetModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs">
                  Create Sheet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOUR MODAL */}
      {showTourModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f121a] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-amber-400" /> Welcome to LinktoCompany Placement Portal!
            </h3>
            <div className="space-y-3 text-xs text-white/70">
              <p>1. <strong>My Sheets (9 Pillars):</strong> Master 150+ DSA problems, Full Stack Web Dev, Databases, Git, and CS Core.</p>
              <p>2. <strong>Company Wise Kit:</strong> Practice real questions asked in Google, Amazon, Microsoft, and TCS drives.</p>
              <p>3. <strong>Automated Recruiter Invites:</strong> Pass quizzes with $\ge 80\%$ score to get direct Google Meet interview invitations!</p>
            </div>
            <Button onClick={() => setShowTourModal(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2">
              Got it, let's practice!
            </Button>
          </div>
        </div>
      )}

    </AppLayout>
  );
};

export default Dashboard;
