import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, Circle, ArrowUpRight, Sparkles, Trophy, Target, BookOpen,
  ShieldCheck, Zap, Calendar, Video, MessageSquare, Plus, Building2,
  GraduationCap, Award, CheckSquare, Square, ChevronRight, UserCheck,
  Flame, HelpCircle, FileText, Globe, Layers, Laptop, Edit3, Bookmark,
  Share2, ExternalLink, Code2, Play, Search, Filter, Compass, Clock, Check,
  Lock, Unlock, ChevronLeft, Bell, Star, TrendingUp, Info, Users, PlusCircle,
  X, Loader2, BarChart2, AlertCircle, CheckCircle, FileCode, SlidersHorizontal,
  RefreshCw, Medal, CalendarPlus, Radio, BookmarkCheck, LayoutGrid, List,
  Send, LifeBuoy, Bug, Lightbulb, MessageSquareQuote, ChevronDown, ChevronUp,
  Headphones
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import {
  getSession,
  dashboardApi,
  profileApi,
  challengeApi,
  analyticsApi,
  adminApi,
  leaderboardApi,
  eventsApi,
  supportApi
} from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

// Detailed Company Sheets Data
const COMPANY_SHEETS = {
  google: {
    id: 'google',
    name: 'Google',
    tag: 'MAANG',
    logoColor: 'text-red-500',
    desc: "Get interview-ready for Google with this dedicated sheet of DSA problems. Regularly updated and prioritized by frequency and difficulty, it enables SDE1, SDE2, and higher aspirants to practice questions aligned with Google's rigorous standards.",
    lastUpdated: '5 days ago',
    totalProblems: 250,
    difficulty: { easy: 24, medium: 173, hard: 53 },
    patterns: [
      { name: 'Arrays', percentage: '26.54%', count: '66', color: '#f97316' },
      { name: 'Dynamic Programming', percentage: '11.40%', count: '28', color: '#eab308' },
      { name: 'HashMap and Set', percentage: '8.49%', count: '21', color: '#a855f7' },
      { name: 'Sorting', percentage: '6.58%', count: '16', color: '#3b82f6' },
      { name: 'Binary Search', percentage: '6.16%', count: '15', color: '#ef4444' },
      { name: 'BFS', percentage: '5.73%', count: '14', color: '#22c55e' },
      { name: 'DFS', percentage: '5.52%', count: '14', color: '#06b6d4' },
      { name: 'Queue and Stacks', percentage: '5.10%', count: '13', color: '#ec4899' },
      { name: 'Two Pointers', percentage: '4.46%', count: '11', color: '#10b981' },
      { name: 'Trees', percentage: '3.18%', count: '8', color: '#f59e0b' },
      { name: 'Linked Lists', percentage: '3.19%', count: '8', color: '#8b5cf6' },
      { name: 'Backtracking', percentage: '2.97%', count: '7', color: '#6366f1' }
    ],
    questions: [
      { id: 1, title: 'Median of Two Sorted Arrays', diff: 'Hard', topic: 'Binary Search', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
      { id: 2, title: 'Longest Increasing Path in a Matrix', diff: 'Hard', topic: 'DFS / Dynamic Programming', link: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/' },
      { id: 3, title: 'LRU Cache Design', diff: 'Medium', topic: 'Doubly Linked List + HashMap', link: 'https://leetcode.com/problems/lru-cache/' },
      { id: 4, title: 'Word Ladder (Shortest Transformation)', diff: 'Hard', topic: 'BFS / Graph', link: 'https://leetcode.com/problems/word-ladder/' },
      { id: 5, title: 'Trapping Rain Water', diff: 'Hard', topic: 'Two Pointers / Stack', link: 'https://leetcode.com/problems/trapping-rain-water/' },
      { id: 6, title: 'Course Schedule II', diff: 'Medium', topic: 'Topological Sort', link: 'https://leetcode.com/problems/course-schedule-ii/' },
      { id: 7, title: 'Find First and Last Position of Element', diff: 'Medium', topic: 'Binary Search', link: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/' },
      { id: 8, title: 'Alien Dictionary', diff: 'Hard', topic: 'Graph / Topo Sort', link: 'https://leetcode.com/problems/alien-dictionary/' }
    ]
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    tag: 'MAANG',
    logoColor: 'text-amber-500',
    desc: "Focused on Amazon's interview style, this sheet compiles real DSA problems and high-frequency scenario questions asked across SDE1 and SDE2 hiring rounds.",
    lastUpdated: '2 days ago',
    totalProblems: 240,
    difficulty: { easy: 32, medium: 158, hard: 50 },
    patterns: [
      { name: 'Arrays & Strings', percentage: '24.10%', count: '58', color: '#f97316' },
      { name: 'Trees & BST', percentage: '18.50%', count: '44', color: '#eab308' },
      { name: 'Graphs & BFS', percentage: '14.80%', count: '35', color: '#22c55e' },
      { name: 'Dynamic Programming', percentage: '12.20%', count: '29', color: '#3b82f6' },
      { name: 'Heaps / Priority Queue', percentage: '9.40%', count: '23', color: '#a855f7' }
    ],
    questions: [
      { id: 1, title: 'Number of Islands', diff: 'Medium', topic: 'BFS / DFS', link: 'https://leetcode.com/problems/number-of-islands/' },
      { id: 2, title: 'Rotting Oranges', diff: 'Medium', topic: 'BFS / Grid', link: 'https://leetcode.com/problems/rotting-oranges/' },
      { id: 3, title: 'Top K Frequent Elements', diff: 'Medium', topic: 'Heap / HashMap', link: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { id: 4, title: 'Merge K Sorted Lists', diff: 'Hard', topic: 'Divide & Conquer / Heap', link: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
      { id: 5, title: 'Reorganize String', diff: 'Medium', topic: 'Greedy / Heap', link: 'https://leetcode.com/problems/reorganize-string/' }
    ]
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft',
    tag: 'Tier 1',
    logoColor: 'text-cyan-400',
    desc: "Boost your Microsoft interview prep with this hand-selected list of DSA problems, recursion puzzles, and data structures frequently tested in tech rounds.",
    lastUpdated: '3 days ago',
    totalProblems: 210,
    difficulty: { easy: 28, medium: 142, hard: 40 },
    patterns: [
      { name: 'Binary Search & Arrays', percentage: '22.40%', count: '47', color: '#f97316' },
      { name: 'Linked Lists & Stacks', percentage: '19.20%', count: '40', color: '#eab308' },
      { name: 'Trees & Recursion', percentage: '16.80%', count: '35', color: '#3b82f6' }
    ],
    questions: [
      { id: 1, title: 'Reverse Nodes in k-Group', diff: 'Hard', topic: 'Linked List', link: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
      { id: 2, title: 'Search in Rotated Sorted Array', diff: 'Medium', topic: 'Binary Search', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { id: 3, title: 'Design Underground System', diff: 'Medium', topic: 'Design / HashMap', link: 'https://leetcode.com/problems/design-underground-system/' },
      { id: 4, title: 'Lowest Common Ancestor in BST', diff: 'Medium', topic: 'Binary Tree', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' }
    ]
  },
  meta: {
    id: 'meta',
    name: 'Meta (Facebook)',
    tag: 'MAANG',
    logoColor: 'text-blue-500',
    desc: "Meta interview sheet focusing on speed, clean code, edge cases, and high-frequency algorithms (Strings, Trees, Sliding Window).",
    lastUpdated: '1 day ago',
    totalProblems: 190,
    difficulty: { easy: 20, medium: 130, hard: 40 },
    patterns: [
      { name: 'Trees and BST', percentage: '28.10%', count: '53', color: '#f97316' },
      { name: 'Strings and Recursion', percentage: '22.00%', count: '42', color: '#3b82f6' },
      { name: 'Two Pointers & Sliding Window', percentage: '18.40%', count: '35', color: '#10b981' }
    ],
    questions: [
      { id: 1, title: 'Valid Palindrome II', diff: 'Easy', topic: 'Two Pointers', link: 'https://leetcode.com/problems/valid-palindrome-ii/' },
      { id: 2, title: 'Lowest Common Ancestor of a Binary Tree', diff: 'Medium', topic: 'Tree DFS', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
      { id: 3, title: 'Continuous Subarray Sum', diff: 'Medium', topic: 'Math / Prefix Sum', link: 'https://leetcode.com/problems/continuous-subarray-sum/' },
      { id: 4, title: 'Kth Largest Element in an Array', diff: 'Medium', topic: 'QuickSelect / Heap', link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' }
    ]
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    tag: 'MAANG',
    logoColor: 'text-slate-300',
    desc: "Targeted problem set focusing on system performance, recursion, binary search, and data structure internals for Apple hardware/software engineering roles.",
    lastUpdated: '4 days ago',
    totalProblems: 160,
    difficulty: { easy: 25, medium: 105, hard: 30 },
    patterns: [
      { name: 'Arrays & Math', percentage: '30.00%', count: '48', color: '#f97316' },
      { name: 'Linked Lists & Caching', percentage: '25.00%', count: '40', color: '#3b82f6' }
    ],
    questions: [
      { id: 1, title: 'Two Sum', diff: 'Easy', topic: 'HashMap', link: 'https://leetcode.com/problems/two-sum/' },
      { id: 2, title: 'Add Two Numbers', diff: 'Medium', topic: 'Linked List', link: 'https://leetcode.com/problems/add-two-numbers/' }
    ]
  },
  bloomberg: {
    id: 'bloomberg',
    name: 'Bloomberg',
    tag: 'Fintech',
    logoColor: 'text-purple-400',
    desc: "Curated questions prioritizing design patterns, string manipulation, heaps, and low-latency data structures for Bloomberg fintech roles.",
    lastUpdated: '1 week ago',
    totalProblems: 175,
    difficulty: { easy: 18, medium: 122, hard: 35 },
    patterns: [
      { name: 'String Processing', percentage: '28.00%', count: '49', color: '#ec4899' },
      { name: 'Design / Heaps', percentage: '24.00%', count: '42', color: '#8b5cf6' }
    ],
    questions: [
      { id: 1, title: 'All O`one Data Structure', diff: 'Hard', topic: 'Doubly Linked List + Map', link: 'https://leetcode.com/problems/all-oone-data-structure/' },
      { id: 2, title: 'Decode String', diff: 'Medium', topic: 'Stack', link: 'https://leetcode.com/problems/decode-string/' }
    ]
  }
};

const CONTESTS_DATA = [
  { id: 'cc-starters', platform: 'CodeChef', title: 'Starters 148 (Rated for All)', time: 'Today · 8:00 PM IST', duration: '2 hrs', link: 'https://www.codechef.com/contests', dateGroup: 'Today' },
  { id: 'lc-biweekly', platform: 'LeetCode', title: 'Biweekly Contest 137', time: 'Saturday · 8:00 PM IST', duration: '1.5 hrs', link: 'https://leetcode.com/contest/', dateGroup: 'This Week' },
  { id: 'cf-div2', platform: 'Codeforces', title: 'Codeforces Round 968 (Div. 2)', time: 'Sunday · 8:05 PM IST', duration: '2 hrs', link: 'https://codeforces.com/contests', dateGroup: 'This Week' },
  { id: 'ac-abc', platform: 'AtCoder', title: 'AtCoder Beginner Contest 368', time: 'Saturday · 5:30 PM IST', duration: '100 mins', link: 'https://atcoder.jp/contests/', dateGroup: 'This Week' }
];

const LEADERBOARD_RANKERS = [
  { rank: 1, name: 'Aditya Verma', handle: '@aditya_v', institution: 'IIT Bombay', score: 98.4, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya' },
  { rank: 2, name: 'Priya Sharma', handle: '@priyasharma', institution: 'SLRTCE Mumbai', score: 96.8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
  { rank: 3, name: 'Rohan Gupta', handle: '@rohan_code', institution: 'BITS Pilani', score: 94.2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
  { rank: 4, name: 'Ananya Roy', handle: '@ananya_r', institution: 'NIT Trichy', score: 91.5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' },
  { rank: 5, name: 'Kunal Deshmukh', handle: '@kunal_d', institution: 'VJTI Mumbai', score: 89.9, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kunal' }
];

const DEFAULT_ROADMAP = [
  {
    id: 'dsa-core',
    title: '1. Data Structures & Algorithms Mastery',
    desc: 'Foundational arrays, two pointers, sliding window, trees, dynamic programming',
    assessmentSkill: 'DSA',
    topics: [
      { name: 'Arrays & Strings (Sliding Window, Prefix Sum)', diff: 'Medium', link: 'https://leetcode.com/explore/interview/card/leetcodes-interview-crash-course-data-structures-and-algorithms/703/arrays-and-strings/' },
      { name: 'Linked Lists (Fast & Slow Pointers, Reversal)', diff: 'Easy', link: 'https://leetcode.com/explore/interview/card/leetcodes-interview-crash-course-data-structures-and-algorithms/704/linked-lists/' },
      { name: 'Trees & Graphs (BFS, DFS, Dijkstra, Topo Sort)', diff: 'Hard', link: 'https://leetcode.com/explore/interview/card/leetcodes-interview-crash-course-data-structures-and-algorithms/707/traversals-trees-and-graphs/' },
      { name: 'Dynamic Programming (Knapsack, 2D Grid, Memoization)', diff: 'Hard', link: 'https://leetcode.com/explore/featured/card/dynamic-programming/' }
    ]
  },
  {
    id: 'fullstack-web',
    title: '2. Modern Full Stack & Web Architecture',
    desc: 'React, Node.js, REST APIs, WebSockets, State Management',
    assessmentSkill: 'React',
    topics: [
      { name: 'React Hooks, Reconciliation & Virtual DOM', diff: 'Medium', link: 'https://react.dev/learn' },
      { name: 'Node.js Event Loop, Async I/O & Express Routing', diff: 'Medium', link: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick' },
      { name: 'Real-time WebSockets & JWT Authentication', diff: 'Hard', link: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' }
    ]
  },
  {
    id: 'db-sql',
    title: '3. SQL, Database Normalization & Indexing',
    desc: 'Relational databases, indexing strategies, ACID guarantees',
    assessmentSkill: 'SQL & Databases',
    topics: [
      { name: 'Complex SQL Joins, Aggregations & Window Functions', diff: 'Medium', link: 'https://mode.com/sql-tutorial/sql-window-functions/' },
      { name: 'B-Tree Indexing, Query Optimization & EXPLAIN Plans', diff: 'Hard', link: 'https://use-the-index-luke.com/' },
      { name: 'ACID Transactions & Deadlock Prevention', diff: 'Hard', link: 'https://en.wikipedia.org/wiki/ACID' }
    ]
  },
  {
    id: 'cs-core',
    title: '4. Computer Science Core (OS, Networks, DBMS)',
    desc: 'Processes, Threads, Virtual Memory, TCP/IP, OSI Layers',
    assessmentSkill: 'CS Fundamentals',
    topics: [
      { name: 'Process Synchronization & Multithreading', diff: 'Hard', link: 'https://www.geeksforgeeks.org/process-synchronization-in-operating-system/' },
      { name: 'TCP/IP Handshake, DNS & HTTP/3 Protocols', diff: 'Medium', link: 'https://hpbn.co/' }
    ]
  }
];

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = getSession();

  const role = user?.role || 'Student';
  const isCompany = role === 'Company';
  const isCollege = role === 'College' || role === 'Faculty';
  const isAdmin = role === 'Admin';
  const isStudent = !isCompany && !isCollege && !isAdmin;

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
    notifications: [],
    applications: []
  });

  const [activeTab, setActiveTab] = useState(isCompany ? 'recruiter-overview' : isCollege ? 'campus-overview' : 'my-sheets');
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [exploreFilter, setExploreFilter] = useState('Company Wise');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardTab, setLeaderboardTab] = useState('C Score');
  const [subscribedContests, setSubscribedContests] = useState({});
  const [customSheets, setCustomSheets] = useState([]);
  const [showCreateSheetModal, setShowCreateSheetModal] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetDesc, setNewSheetDesc] = useState('');
  const [showTourModal, setShowTourModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [platformHandles, setPlatformHandles] = useState({ leetcode: '', codeforces: '', github: '' });

  // Recruiter Specific State
  const [talents, setTalents] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    role_title: 'Software Engineer - Full Stack',
    date_time: 'Tomorrow at 3:00 PM IST',
    meet_link: 'https://meet.google.com/new',
    notes: ''
  });

  // Student Profile & Skills State
  const [studentProfile, setStudentProfile] = useState({
    branch: 'Computer Science',
    year: '3rd Year',
    college: 'SLRTCE, Mumbai',
    cgpa: 8.8,
    technical_skills: ['Python', 'Java', 'SQL', 'React'],
    soft_skills: ['Problem Solving', 'Teamwork'],
    preferred_domains: ['Artificial Intelligence', 'Web Development'],
    career_interests: 'Software Engineer / AI & Full Stack',
    github_url: '',
    portfolio_url: '',
    resume_url: '',
    verified_skills: []
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [recommendedChallenges, setRecommendedChallenges] = useState([]);

  // Recruiter Challenge & Applicant Management State
  const [recruiterChallenges, setRecruiterChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [applicantsList, setApplicantsList] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantFilterStatus, setApplicantFilterStatus] = useState('All');
  const [applicantMinMatch, setApplicantMinMatch] = useState(0);

  // Recruiter Evaluation Modal State
  const [evaluatingApp, setEvaluatingApp] = useState(null);
  const [evalForm, setEvalForm] = useState({
    tech_score: 88,
    problem_solving_score: 85,
    communication_score: 80,
    code_quality_score: 90,
    innovation_score: 85,
    feedback: 'Excellent modular repository, good test coverage, and crisp documentation.',
    outcome: 'Selected'
  });
  const [submittingEval, setSubmittingEval] = useState(false);

  // College Analytics State
  const [collegeAnalytics, setCollegeAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [verificationsData, setVerificationsData] = useState({ companies: [], challenges: [] });

  // Campus Leaderboard & LeetCode State (Codolio Match)
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [scoreType, setScoreType] = useState('leetcode_rating');
  const [leaderboardCollegeFilter, setLeaderboardCollegeFilter] = useState('all');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [collegesList, setCollegesList] = useState(['SLRTCE, Mumbai', 'IIT Bombay', 'BITS Pilani', 'NIT Trichy', 'VJTI, Mumbai', 'IIIT Hyderabad', 'DTU, Delhi']);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [showLeetcodeModal, setShowLeetcodeModal] = useState(false);
  const [leetcodeInput, setLeetcodeInput] = useState('');
  const [syncingLeetcode, setSyncingLeetcode] = useState(false);

  // Codolio Match: Event Tracker & Contest State
  const [eventsList, setEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventPlatformFilter, setEventPlatformFilter] = useState('all');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [eventSearch, setEventSearch] = useState('');
  const [eventViewMode, setEventViewMode] = useState('grid');
  const [bookmarkedEvents, setBookmarkedEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('ltc_bookmarked_events');
      return saved ? JSON.parse(saved) : { 'cc-starters-150': true, 'lc-weekly-413': true };
    } catch {
      return {};
    }
  });

  const getGoogleCalendarUrl = (contest) => {
    const title = encodeURIComponent(contest.title || 'Coding Contest');
    const details = encodeURIComponent(`${contest.description || contest.title}\n\nPlatform: ${contest.platform}\nDivision: ${contest.division || 'All'}\nContest URL: ${contest.url}`);
    const locationStr = encodeURIComponent(contest.url || 'Online');
    
    let startIso = '';
    let endIso = '';
    try {
      const sDate = contest.start_time ? new Date(contest.start_time) : new Date(Date.now() + 3600000);
      const eDate = contest.end_time ? new Date(contest.end_time) : new Date(sDate.getTime() + 7200000);
      startIso = sDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
      endIso = eDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    } catch {
      const now = new Date();
      startIso = now.toISOString().replace(/-|:|\.\d\d\d/g, '');
      endIso = new Date(now.getTime() + 7200000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${locationStr}`;
  };

  const loadEvents = async (platform = eventPlatformFilter, status = eventStatusFilter, search = eventSearch) => {
    setEventsLoading(true);
    try {
      const res = await eventsApi.list({ platform, status, search });
      setEventsList(res.events || []);
    } catch (err) {
      setEventsList([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const toggleBookmarkEvent = (eventId, eventTitle) => {
    setBookmarkedEvents((prev) => {
      const updated = { ...prev, [eventId]: !prev[eventId] };
      localStorage.setItem('ltc_bookmarked_events', JSON.stringify(updated));
      toast({
        title: updated[eventId] ? 'Contest Bookmarked! 🔔' : 'Bookmark Removed',
        description: updated[eventId] ? `You will be notified before ${eventTitle} begins.` : 'Event removed from tracked list.'
      });
      return updated;
    });
  };

  // Codolio Match: Support & Feedback State
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportTicketsLoading, setSupportTicketsLoading] = useState(false);
  const [supportCategory, setSupportCategory] = useState('Bug Report');
  const [supportPriority, setSupportPriority] = useState('Medium');
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportAttachment, setSupportAttachment] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportActiveTab, setSupportActiveTab] = useState('form');
  const [submittedTicketId, setSubmittedTicketId] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState({ 0: true });

  const loadSupportTickets = async () => {
    setSupportTicketsLoading(true);
    try {
      const res = await supportApi.getTickets();
      setSupportTickets(res.tickets || []);
    } catch (err) {
      setSupportTickets([]);
    } finally {
      setSupportTicketsLoading(false);
    }
  };

  const handleCreateSupportTicket = async (e) => {
    if (e) e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) {
      toast({ title: 'Please enter a subject and detailed description.', variant: 'destructive' });
      return;
    }
    setSupportSubmitting(true);
    try {
      const res = await supportApi.createTicket({
        category: supportCategory,
        priority: supportPriority,
        subject: supportSubject.trim(),
        message: supportMessage.trim(),
        attachment_url: supportAttachment.trim(),
        name: supportName.trim() || user?.name || 'Visitor / Student',
        email: supportEmail.trim() || user?.email || 'ashish.business.p@gmail.com'
      });
      toast({
        title: 'Feedback / Ticket Submitted! 🚀',
        description: res.message || 'Support ticket created and email dispatched to engineering.'
      });
      setSubmittedTicketId(res.ticket_id);
      setSupportSubject('');
      setSupportMessage('');
      setSupportAttachment('');
      loadSupportTickets();
    } catch (err) {
      toast({
        title: 'Failed to Submit Ticket',
        description: err?.response?.data?.detail || 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSupportSubmitting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
      if (tabParam !== 'company-kit' && tabParam !== 'explore-sheets') {
        setSelectedCompanyId(null);
      }
    }
    const scoreParam = params.get('scoreType');
    if (scoreParam) {
      setScoreType(scoreParam);
    }
  }, [location.search]);

  const loadLeaderboard = async (sType = scoreType, col = leaderboardCollegeFilter, search = leaderboardSearch) => {
    setLeaderboardLoading(true);
    try {
      const res = await leaderboardApi.get({
        scoreType: sType,
        college: col,
        search: search
      });
      setLeaderboardData(res.leaderboard || []);
      if (res.colleges && res.colleges.length > 0) setCollegesList(res.colleges);
      if (res.current_user_rank) setCurrentUserRank(res.current_user_rank);
    } catch (err) {
      setLeaderboardData(LEADERBOARD_RANKERS);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleSyncLeetcode = async (customHandle) => {
    const handle = customHandle || leetcodeInput;
    if (!handle || !handle.trim()) {
      toast({ title: 'Please enter a valid LeetCode username or profile URL', variant: 'destructive' });
      return;
    }
    setSyncingLeetcode(true);
    try {
      const res = await leaderboardApi.syncLeetcode(handle);
      toast({
        title: 'LeetCode Account Linked! 🚀',
        description: res.message || 'Stats synced and campus rank calculated!'
      });
      setShowLeetcodeModal(false);
      setLeetcodeInput('');
      loadLeaderboard(scoreType, leaderboardCollegeFilter, leaderboardSearch);
      profileApi.getStudentProfile().then((pRes) => {
        if (pRes.profile) setStudentProfile(pRes.profile);
      }).catch(() => {});
    } catch (err) {
      toast({
        title: 'Sync Failed',
        description: err?.response?.data?.detail || 'Unable to sync LeetCode stats. Please check the username.',
        variant: 'destructive'
      });
    } finally {
      setSyncingLeetcode(false);
    }
  };

  const loadApplicantsForChallenge = async (challId) => {
    if (!challId) return;
    setApplicantsLoading(true);
    try {
      const res = await challengeApi.getApplicants(challId);
      setApplicantsList(res.applicants || []);
    } catch (err) {
      setApplicantsList([]);
    } finally {
      setApplicantsLoading(false);
    }
  };

  const loadData = async () => {
    if (!user) { navigate('/auth'); return; }

    dashboardApi.stats().then((data) => setStats(data)).catch(() => {});
    dashboardApi.listTalents().then((r) => setTalents(r.talents || [])).catch(() => {});
    loadLeaderboard();
    loadEvents();
    loadSupportTickets();

    if (isStudent) {
      profileApi.getStudentProfile().then((res) => {
        if (res.profile) setStudentProfile(res.profile);
      }).catch(() => {});
      challengeApi.myApplications().then((res) => setMyApplications(res.applications || [])).catch(() => {});
      challengeApi.getRecommended().then((res) => setRecommendedChallenges(res.recommended || [])).catch(() => {});
    }

    if (isCompany || isCollege || isAdmin) {
      challengeApi.list().then((res) => {
        const chs = res.challenges || [];
        setRecruiterChallenges(chs);
        if (chs.length > 0) {
          setSelectedChallengeId(chs[0].id);
          loadApplicantsForChallenge(chs[0].id);
        }
      }).catch(() => {});
    }

    if (isCollege || isAdmin) {
      analyticsApi.college().then((data) => setCollegeAnalytics(data)).catch(() => {});
      adminApi.getVerifications().then((data) => setVerificationsData(data)).catch(() => {});
    }

    const savedCustom = localStorage.getItem('ltc_custom_sheets');
    if (savedCustom) {
      try { setCustomSheets(JSON.parse(savedCustom)); } catch {}
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard(scoreType, leaderboardCollegeFilter, leaderboardSearch);
    }
  }, [activeTab, scoreType, leaderboardCollegeFilter]);

  useEffect(() => {
    if (activeTab === 'contests' || activeTab === 'contests-calendar' || activeTab === 'event-tracker') {
      loadEvents(eventPlatformFilter, eventStatusFilter, eventSearch);
    }
  }, [activeTab, eventPlatformFilter, eventStatusFilter]);

  useEffect(() => {
    if (activeTab === 'help' || activeTab === 'feedback' || activeTab === 'support') {
      loadSupportTickets();
    }
  }, [activeTab]);

  // Skill Chip Add & Remove
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const skill = newSkillInput.trim();
    if (studentProfile.technical_skills?.includes(skill)) {
      toast({ title: 'Skill already added', variant: 'destructive' });
      return;
    }
    setStudentProfile({
      ...studentProfile,
      technical_skills: [...(studentProfile.technical_skills || []), skill]
    });
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setStudentProfile({
      ...studentProfile,
      technical_skills: studentProfile.technical_skills?.filter((s) => s !== skillToRemove) || []
    });
  };

  const handleSaveStudentProfile = async () => {
    setProfileSaving(true);
    try {
      const payload = {
        branch: studentProfile.branch || 'Computer Science',
        year: studentProfile.year || '3rd Year',
        college: studentProfile.college || 'SLRTCE, Mumbai',
        cgpa: parseFloat(studentProfile.cgpa) || 8.5,
        technical_skills: Array.isArray(studentProfile.technical_skills) ? studentProfile.technical_skills : [],
        soft_skills: Array.isArray(studentProfile.soft_skills) ? studentProfile.soft_skills : ['Problem Solving'],
        preferred_domains: Array.isArray(studentProfile.preferred_domains) ? studentProfile.preferred_domains : ['Artificial Intelligence'],
        career_interests: studentProfile.career_interests || '',
        github_url: studentProfile.github_url || '',
        portfolio_url: studentProfile.portfolio_url || '',
        resume_url: studentProfile.resume_url || '',
        projects: Array.isArray(studentProfile.projects) ? studentProfile.projects : [],
        certifications: Array.isArray(studentProfile.certifications) ? studentProfile.certifications : []
      };

      await profileApi.updateStudentProfile(payload);
      toast({
        title: 'Profile Updated! 🚀',
        description: 'Your technical skills have been saved. Challenge match scores have been recalculated.'
      });
      loadData();
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: err?.response?.data?.detail || 'Try again.',
        variant: 'destructive'
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await challengeApi.updateStatus(appId, newStatus);
      toast({ title: `Status Updated to "${newStatus}"` });
      if (selectedChallengeId) loadApplicantsForChallenge(selectedChallengeId);
    } catch (err) {
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  };

  const handleOpenEvaluationModal = (app) => {
    setEvaluatingApp(app);
    setEvalForm({
      tech_score: app.evaluation?.tech_score || 88,
      problem_solving_score: app.evaluation?.problem_solving_score || 85,
      communication_score: app.evaluation?.communication_score || 80,
      code_quality_score: app.evaluation?.code_quality_score || 90,
      innovation_score: app.evaluation?.innovation_score || 85,
      feedback: app.evaluation?.feedback || 'Clean codebase, modular structure, solid problem-solving approach.',
      outcome: app.evaluation?.outcome || 'Selected'
    });
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingApp) return;
    setSubmittingEval(true);
    try {
      const res = await challengeApi.evaluate(evaluatingApp.id, evalForm);
      toast({
        title: 'Evaluation Submitted! 🎉',
        description: `Overall Score: ${res.overall_score}% (${res.outcome}). Student notified.`
      });
      setEvaluatingApp(null);
      if (selectedChallengeId) loadApplicantsForChallenge(selectedChallengeId);
    } catch (err) {
      toast({
        title: 'Evaluation Failed',
        description: err?.response?.data?.detail || 'Try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmittingEval(false);
    }
  };

  const toggleTopic = async (topicName) => {
    const current = stats.completed_topics || [];
    let updated;
    if (current.includes(topicName)) {
      updated = current.filter((t) => t !== topicName);
    } else {
      updated = [...current, topicName];
    }

    const newCount = updated.length;
    const newReadiness = Math.min(100, Math.floor((newCount * 2.2) + (stats.verified_skills_count * 10) + (stats.challenges_solved * 12)));
    setStats({ ...stats, completed_topics: updated, skill_readiness: newReadiness });

    try {
      await dashboardApi.updateProgress({ goal_track: stats.goal_track, completed_topics: updated });
    } catch {
      toast({ title: 'Sync Error', description: 'Failed to update milestone.', variant: 'destructive' });
    }
  };

  const handleSubscribeContest = (contestId, title) => {
    const nextState = !subscribedContests[contestId];
    setSubscribedContests({ ...subscribedContests, [contestId]: nextState });
    if (nextState) {
      toast({ title: 'Subscribed to Contest!', description: `You will receive live reminders for "${title}"` });
    } else {
      toast({ title: 'Unsubscribed', description: `Reminder removed for "${title}"` });
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

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTalent) return;
    try {
      await dashboardApi.scheduleInterview({
        student_id: selectedTalent.id,
        student_name: selectedTalent.name,
        student_email: selectedTalent.email,
        ...scheduleForm
      });
      toast({
        title: 'Interview Dispatched! 🎉',
        description: `Automated calendar invite sent to ${selectedTalent.email}`
      });
      setShowScheduleModal(false);
      loadData();
    } catch {
      toast({ title: 'Failed to schedule', variant: 'destructive' });
    }
  };

  const totalTopicsCount = DEFAULT_ROADMAP.reduce((acc, p) => acc + p.topics.length, 0);
  const completedTopicsCount = stats?.completed_topics?.length || 0;
  const selectedCompany = selectedCompanyId ? COMPANY_SHEETS[selectedCompanyId] : null;

  // Recruiter applicant filtering
  const filteredApplicants = useMemo(() => {
    return (applicantsList || []).filter((a) => {
      if (applicantFilterStatus !== 'All' && a.status !== applicantFilterStatus) return false;
      if (applicantMinMatch > 0 && (a.match_score || 0) < applicantMinMatch) return false;
      return true;
    });
  }, [applicantsList, applicantFilterStatus, applicantMinMatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selected':
      case 'Internship Offered':
      case 'Placement Offered':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Evaluated':
      case 'Submitted':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Shortlisted':
      case 'Challenge Assigned':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Under Review':
      case 'Applied':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Rejected':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab} stats={stats}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* RECRUITER / COMPANY VIEWS */}
        {/* ========================================================================= */}
        {isCompany && (
          <>
            {/* VIEW: RECRUITER OVERVIEW */}
            {activeTab === 'recruiter-overview' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="text-[11px] tracking-widest uppercase text-blue-400 font-mono font-bold flex items-center gap-2">
                      <Building2 size={14} /> RECRUITER TALENT & HIRING HUB
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                      Welcome, {user?.name}
                    </h1>
                    <p className="text-xs md:text-sm text-white/50 mt-1">
                      Source candidates verified with proctored skill tests and schedule direct technical interviews.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to="/challenges"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20"
                    >
                      <PlusCircle size={15} /> Post Live Challenge
                    </Link>
                  </div>
                </div>

                {/* Quick Metrics for Recruiter */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14]">
                    <div className="text-[11px] text-white/40 font-mono uppercase">Verified Candidates</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{talents.length}</div>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">With anti-cheat badges</div>
                  </div>
                  <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14]">
                    <div className="text-[11px] text-white/40 font-mono uppercase">Active Challenges</div>
                    <div className="text-2xl font-black text-blue-400 mt-1">{recruiterChallenges.length || 3}</div>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">Live industry problem statements</div>
                  </div>
                  <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14]">
                    <div className="text-[11px] text-white/40 font-mono uppercase">Total Applicants</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">24</div>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">With skill match breakdown</div>
                  </div>
                  <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14]">
                    <div className="text-[11px] text-white/40 font-mono uppercase">Scheduled Interviews</div>
                    <div className="text-2xl font-black text-purple-400 mt-1">{stats.interviews?.length || 0}</div>
                    <div className="text-[10px] text-white/40 font-mono mt-0.5">Google Meet invites sent</div>
                  </div>
                </div>

                {/* Quick action buttons */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setActiveTab('applicants')}
                    className="p-5 rounded-xl border border-blue-500/30 bg-[#0b0e18] hover:border-blue-400 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <Award size={16} className="text-blue-400" /> Review Challenge Applicants
                      </h3>
                      <ChevronRight size={16} className="text-blue-400" />
                    </div>
                    <p className="text-xs text-white/60">
                      Score candidate GitHub submissions using the 5-criteria rubric (Technical, Problem Solving, Communication, Code Quality, Innovation).
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveTab('talents')}
                    className="p-5 rounded-xl border border-emerald-500/30 bg-[#0b0e18] hover:border-emerald-400 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <Users size={16} className="text-emerald-400" /> Verified Talent Pool
                      </h3>
                      <ChevronRight size={16} className="text-emerald-400" />
                    </div>
                    <p className="text-xs text-white/60">
                      Browse top-ranking campus candidates verified via anti-cheat assessments with 1-click Google Meet interview invites.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: RECRUITER APPLICANT REVIEW & EVALUATION */}
            {activeTab === 'applicants' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h1 className="text-2xl font-black text-white">Challenge Applicants & Evaluation</h1>
                    <p className="text-xs text-white/50 mt-1">Review student solutions filtered by skill match and score multi-criteria rubrics.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Label className="text-xs text-white/60">Select Challenge:</Label>
                    <select
                      value={selectedChallengeId}
                      onChange={(e) => {
                        setSelectedChallengeId(e.target.value);
                        loadApplicantsForChallenge(e.target.value);
                      }}
                      className="bg-[#0b0d14] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                    >
                      {recruiterChallenges.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0b0d14] border border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 font-mono">Status:</span>
                    {['All', 'Applied', 'Submitted', 'Evaluated', 'Selected', 'Rejected'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setApplicantFilterStatus(st)}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          applicantFilterStatus === st ? 'bg-blue-600 text-white font-bold' : 'bg-white/5 text-white/60 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white/50 font-mono">Min Match:</span>
                    <select
                      value={applicantMinMatch}
                      onChange={(e) => setApplicantMinMatch(Number(e.target.value))}
                      className="bg-[#07080d] border border-white/10 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value={0}>All (0%+)</option>
                      <option value={50}>≥ 50% Match</option>
                      <option value={75}>≥ 75% Match</option>
                      <option value={90}>≥ 90% Match</option>
                    </select>
                  </div>
                </div>

                {/* Applicants List */}
                {applicantsLoading ? (
                  <div className="py-12 text-center text-white/50">
                    <Loader2 size={24} className="animate-spin mx-auto text-blue-500 mb-2" />
                    <p className="text-xs font-mono">Loading challenge applicants…</p>
                  </div>
                ) : filteredApplicants.length === 0 ? (
                  <div className="py-12 text-center rounded-xl border border-white/10 bg-[#0b0d14] p-8 text-white/50 text-xs font-mono">
                    No applicants matching filter criteria for this challenge.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplicants.map((app) => (
                      <div key={app.id} className="rounded-2xl border border-white/10 bg-[#0b0d14] p-5 space-y-4 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-base">{app.user_name}</h3>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            </div>
                            <div className="text-xs text-white/50 font-mono mt-0.5">
                              {app.user_email} · {app.branch || 'Computer Science'} ({app.year || '3rd Year'}) · CGPA: {app.cgpa || '8.8'}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-[10px] font-mono text-white/40 uppercase">Skill Match</div>
                              <div className="text-lg font-black text-emerald-400 font-mono">{app.match_score}%</div>
                            </div>
                          </div>
                        </div>

                        {/* Matched & Missing Skills Breakdown */}
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">
                              ✓ Matched Skills:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {app.matched_skills?.map((sk) => (
                                <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-black/40 border border-amber-500/20">
                            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">
                              ✗ Missing Skills:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {app.missing_skills?.length > 0 ? (
                                app.missing_skills.map((sk) => (
                                  <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">
                                    {sk}
                                  </span>
                                ))
                              ) : (
                                <span className="text-emerald-400 text-[10px] font-mono">Full Match!</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Submission Link & Notes */}
                        {app.github_url && (
                          <div className="p-3 rounded-lg bg-[#07080d] border border-white/5 space-y-1 text-xs font-mono">
                            <div className="flex items-center gap-2 text-blue-400">
                              <FileCode size={14} />
                              <a href={app.github_url} target="_blank" rel="noreferrer" className="hover:underline truncate">
                                {app.github_url}
                              </a>
                            </div>
                            {app.notes && <p className="text-white/60 text-[11px] font-sans">{app.notes}</p>}
                          </div>
                        )}

                        {/* Action buttons & Evaluation triggers */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs h-8 px-3"
                            >
                              Shortlist
                            </Button>
                            <Button
                              onClick={() => handleUpdateStatus(app.id, 'Challenge Assigned')}
                              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs h-8 px-3"
                            >
                              Assign Task
                            </Button>
                            <Button
                              onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                              variant="ghost"
                              className="text-xs text-rose-400 hover:text-rose-300 h-8 px-2"
                            >
                              Reject
                            </Button>
                          </div>

                          <Button
                            onClick={() => handleOpenEvaluationModal(app)}
                            className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs h-8 px-4"
                          >
                            <Award size={14} className="mr-1" />
                            {app.evaluation ? 'Edit Evaluation Scorecard' : 'Evaluate Submission'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* COLLEGE & ADMIN VIEWS (Skill Gap Matrix) */}
        {/* ========================================================================= */}
        {(isCollege || isAdmin) && activeTab === 'campus-overview' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="text-[11px] tracking-widest uppercase text-emerald-400 font-mono font-bold flex items-center gap-2">
                  <GraduationCap size={14} /> CAMPUS SKILL GAP MATRIX & INDUSTRY ALIGNMENT
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                  Academia–Industry Collaboration Dashboard
                </h1>
                <p className="text-xs md:text-sm text-white/50 mt-1">
                  Analyze batch readiness against live industry hiring challenges, identify critical curriculum gaps, and track student outcomes.
                </p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14]">
                <div className="text-[10px] text-white/40 font-mono uppercase">Total Enrolled</div>
                <div className="text-2xl font-black text-white mt-1">{collegeAnalytics?.total_students || 240}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">85% Active on Challenges</div>
              </div>
              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14]">
                <div className="text-[10px] text-white/40 font-mono uppercase">Industry Challenges</div>
                <div className="text-2xl font-black text-blue-400 mt-1">{collegeAnalytics?.total_challenges || 5}</div>
                <div className="text-[10px] text-white/40 font-mono mt-0.5">Verified Corporate Partners</div>
              </div>
              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14]">
                <div className="text-[10px] text-white/40 font-mono uppercase">Shortlisted Candidates</div>
                <div className="text-2xl font-black text-purple-400 mt-1">{collegeAnalytics?.shortlisted_count || 34}</div>
                <div className="text-[10px] text-purple-400 font-mono mt-0.5">Direct Recruiter Invites</div>
              </div>
              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14]">
                <div className="text-[10px] text-white/40 font-mono uppercase">Internships & PPOs</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{collegeAnalytics?.internships || 18}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">+12 Direct Placements</div>
              </div>
            </div>

            {/* INDUSTRY DEMAND VS STUDENT SKILLS GAP MATRIX */}
            <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <BarChart2 size={18} className="text-emerald-400" /> Industry Demand vs. Student Skills Gap Matrix
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Real-time comparison between skills required in active company challenges vs. verified student profiles.
                  </p>
                </div>
              </div>

              {/* Visual Bars & Comparison Table */}
              <div className="space-y-4">
                {collegeAnalytics?.demand_vs_supply?.map((item) => (
                  <div key={item.skill} className="p-4 rounded-xl bg-[#07090e] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white font-mono text-sm">{item.skill}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.status === 'Critical Gap' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        item.status === 'Moderate Gap' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <div className="flex justify-between text-[11px] text-blue-300 mb-1">
                          <span>Industry Demand</span>
                          <strong>{item.industry_demand_pct}%</strong>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${item.industry_demand_pct}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-emerald-300 mb-1">
                          <span>Student Supply</span>
                          <strong>{item.student_supply_pct}%</strong>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${item.student_supply_pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Skill Readiness Table */}
            <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Department-Wise Skill Readiness & Placement Rates</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-[#08090e] border-b border-white/10 text-white/50 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="p-3">Department</th>
                      <th className="p-3">Students</th>
                      <th className="p-3">Avg Readiness</th>
                      <th className="p-3">Most Critical Gap</th>
                      <th className="p-3 text-right">Placement Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {collegeAnalytics?.department_stats?.map((dept, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-white">{dept.department}</td>
                        <td className="p-3 font-mono text-white/70">{dept.students}</td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">{dept.avg_readiness}%</td>
                        <td className="p-3 text-rose-300 font-mono text-xs">{dept.critical_gap}</td>
                        <td className="p-3 font-mono text-right text-blue-400 font-bold">{dept.placement_rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STUDENT VIEWS */}
        {/* ========================================================================= */}
        {isStudent && (
          <>
            {/* VIEW: MY APPLICATIONS (Application pipeline tracker) */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white">My Challenge Applications</h1>
                    <p className="text-xs md:text-sm text-white/50 mt-1">Track multi-stage status, recruiter reviews, and internship/placement offers.</p>
                  </div>
                  <Link
                    to="/challenges"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                  >
                    <Plus size={14} /> Explore More Challenges
                  </Link>
                </div>

                {myApplications.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl border border-white/10 bg-[#0b0d14] p-8 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/40">
                      <Award size={24} />
                    </div>
                    <h3 className="text-base font-bold text-white">No active applications yet</h3>
                    <p className="text-xs text-white/50 max-w-md mx-auto">
                      Discover company challenges matching your technical skills, submit working code solutions, and get evaluated for direct offers!
                    </p>
                    <Link
                      to="/challenges"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs rounded-lg"
                    >
                      Browse Industry Challenges
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myApplications.map((app) => (
                      <div key={app.id} className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6 space-y-5 shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-blue-400 uppercase">{app.challenge_company}</span>
                              <span className="text-white/20">·</span>
                              <span className="text-[11px] font-mono text-white/40">{app.domain || app.category}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">{app.challenge_title}</h3>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[10px] font-mono">
                          {['Applied', 'Shortlisted', 'Challenge Assigned', 'Submitted', 'Evaluated', 'Selected'].map((st, i) => {
                            const isDone =
                              app.status === st ||
                              (app.status === 'Submitted' && ['Applied', 'Shortlisted', 'Challenge Assigned', 'Submitted'].includes(st)) ||
                              (app.status === 'Evaluated' && ['Applied', 'Shortlisted', 'Challenge Assigned', 'Submitted', 'Evaluated'].includes(st)) ||
                              (['Selected', 'Internship Offered', 'Placement Offered'].includes(app.status));

                            return (
                              <div
                                key={st}
                                className={`p-2 rounded-lg border ${
                                  isDone ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold' : 'border-white/5 bg-white/[0.02] text-white/30'
                                }`}
                              >
                                <div className="text-[9px] text-white/40">{i + 1}</div>
                                <div className="truncate">{st}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Recruiter Evaluation Card if present */}
                        {app.evaluation && (
                          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-white text-xs font-mono uppercase flex items-center gap-1.5">
                                <Award size={15} className="text-emerald-400" /> Recruiter Evaluation Scorecard
                              </div>
                              <span className="text-base font-black text-emerald-400 font-mono">
                                {app.evaluation.overall_score}% Score ({app.evaluation.outcome})
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                              <div className="p-2 rounded bg-black/40">Technical: {app.evaluation.tech_score}/100</div>
                              <div className="p-2 rounded bg-black/40">Problem Solving: {app.evaluation.problem_solving_score}/100</div>
                              <div className="p-2 rounded bg-black/40">Code Quality: {app.evaluation.code_quality_score}/100</div>
                              <div className="p-2 rounded bg-black/40">Innovation: {app.evaluation.innovation_score}/100</div>
                              <div className="p-2 rounded bg-black/40">Communication: {app.evaluation.communication_score}/100</div>
                            </div>
                            <p className="text-xs text-white/80"><strong className="text-emerald-300">Feedback: </strong>{app.evaluation.feedback}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-2">
                          <span className="text-white/40 font-mono">Match Score: <strong className="text-white">{app.match_score}%</strong></span>
                          <Link
                            to={`/challenges?id=${app.challenge_id}`}
                            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                          >
                            Open Challenge Details <ChevronRight size={13} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: ENHANCED PORTFOLIO & SKILLS MANAGER */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-white">Student Skill Profile & Portfolio</h1>
                  <p className="text-xs text-white/50 mt-1">
                    Manage your verified skills and claimed technologies. Changes dynamically update challenge match scores!
                  </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Left: Interactive Skills Editor */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6 space-y-5 shadow-lg">
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-400" /> Technical Skills
                      </h3>

                      {/* Add Skill Input */}
                      <form onSubmit={handleAddSkill} className="flex gap-2">
                        <Input
                          placeholder="Add skill (e.g. OpenCV, Docker, PyTorch)..."
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          className="bg-[#07080d] border-white/10 text-white text-xs"
                        />
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4">
                          <Plus size={14} className="mr-1" /> Add
                        </Button>
                      </form>

                      {/* Skills Chips */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {studentProfile.technical_skills?.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 group"
                          >
                            <span>{sk}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(sk)}
                              className="text-white/40 hover:text-rose-400 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Academic & Career Info */}
                    <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6 space-y-4 shadow-lg">
                      <h3 className="font-bold text-white text-base">Academic & Career Profile</h3>

                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <Label className="text-white/70">Branch / Major</Label>
                          <Input
                            value={studentProfile.branch || ''}
                            onChange={(e) => setStudentProfile({ ...studentProfile, branch: e.target.value })}
                            className="mt-1 bg-[#07080d] border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-white/70">Current Year</Label>
                          <select
                            value={studentProfile.year || '3rd Year'}
                            onChange={(e) => setStudentProfile({ ...studentProfile, year: e.target.value })}
                            className="mt-1 w-full bg-[#07080d] border border-white/10 rounded-md p-2 text-white text-xs"
                          >
                            <option>1st Year</option>
                            <option>2nd Year</option>
                            <option>3rd Year</option>
                            <option>4th Year</option>
                            <option>Graduating</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-white/70">College / University</Label>
                          <Input
                            value={studentProfile.college || ''}
                            onChange={(e) => setStudentProfile({ ...studentProfile, college: e.target.value })}
                            className="mt-1 bg-[#07080d] border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-white/70">CGPA / Percentage</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={studentProfile.cgpa || 8.5}
                            onChange={(e) => setStudentProfile({ ...studentProfile, cgpa: Number(e.target.value) })}
                            className="mt-1 bg-[#07080d] border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white/70">GitHub Profile URL</Label>
                        <Input
                          placeholder="https://github.com/your-username"
                          value={studentProfile.github_url || ''}
                          onChange={(e) => setStudentProfile({ ...studentProfile, github_url: e.target.value })}
                          className="mt-1 bg-[#07080d] border-white/10 text-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-white/70 flex items-center gap-1.5">
                            <Code2 size={13} className="text-amber-400" /> LeetCode Profile / Username
                          </Label>
                          {studentProfile.leetcode_username && (
                            <span className="text-[11px] text-amber-300 font-mono">
                              ⭐ Rating: {studentProfile.leetcode_rating || '1,720.0'} ({studentProfile.leetcode_badge || 'Knight ⚔️'})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            placeholder="e.g. ashish_gupta or https://leetcode.com/u/ashish_gupta"
                            value={studentProfile.leetcode_username || ''}
                            onChange={(e) => setStudentProfile({ ...studentProfile, leetcode_username: e.target.value })}
                            className="bg-[#07080d] border-white/10 text-white text-xs font-mono"
                          />
                          <Button
                            type="button"
                            onClick={() => handleSyncLeetcode(studentProfile.leetcode_username)}
                            disabled={syncingLeetcode || !studentProfile.leetcode_username}
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs whitespace-nowrap px-3 shrink-0"
                          >
                            {syncingLeetcode ? <Loader2 size={13} className="animate-spin" /> : 'Sync Stats'}
                          </Button>
                        </div>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">
                          Syncing your LeetCode account will automatically update your rating and rank on the Campus Leaderboard.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex justify-end">
                        <Button
                          onClick={handleSaveStudentProfile}
                          disabled={profileSaving}
                          className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs px-6"
                        >
                          {profileSaving ? <Loader2 size={14} className="animate-spin" /> : 'Save Skill Profile'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Verified Badges & Trust Card */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="rounded-2xl border border-blue-500/30 bg-[#0f121a] p-6 space-y-5 shadow-2xl">
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-black text-white text-xl">
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-base font-black text-white">{user?.name}</h2>
                            <p className="text-xs text-white/50 font-mono">{user?.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-white/40 uppercase">Trust Score</div>
                          <div className="text-xl font-black text-emerald-400">{stats.trust_score}/100</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2">Verified Assessment Badges</h4>
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

                      <div className="pt-3 border-t border-white/10">
                        <Link
                          to="/assessment"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                        >
                          <Zap size={14} /> Take Proctored Skill Assessment
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: MY SHEETS & SKILL PIPELINE HOME */}
            {activeTab === 'my-sheets' && (
              <div className="space-y-8">
                
                {/* Hero Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="text-[11px] tracking-widest uppercase text-blue-400 font-mono font-bold flex items-center gap-2">
                      <Sparkles size={14} className="text-emerald-400" /> ACADEMIA–INDUSTRY SKILL MAPPING PIPELINE
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                      Welcome back, {user?.name || 'Student'}
                    </h1>
                    <p className="text-xs md:text-sm text-white/50 mt-1">
                      Discover company challenges matching your verified skills, identify skill gaps, and unlock direct internships & placements.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      to="/challenges"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20"
                    >
                      <Zap size={14} /> Explore Challenges
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowTourModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold font-mono transition-colors cursor-pointer"
                    >
                      <BookOpen size={14} /> Tour
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl border border-emerald-500/30 bg-[#0b0f1a] shadow-lg">
                    <div className="text-[11px] text-white/40 font-mono uppercase">Platform Trust Score</div>
                    <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">{stats?.trust_score ?? 15}/100</div>
                    <div className="text-[11px] text-emerald-300/60 font-mono mt-0.5">Verified anti-cheat proof</div>
                  </div>

                  <div className="p-5 rounded-2xl border border-blue-500/30 bg-[#0b0f1a] shadow-lg">
                    <div className="text-[11px] text-white/40 font-mono uppercase">Matched Challenges</div>
                    <div className="text-2xl md:text-3xl font-black text-blue-400 mt-1">{(recommendedChallenges || []).length || 5} Live</div>
                    <div className="text-[11px] text-blue-300/60 font-mono mt-0.5">Based on your skills</div>
                  </div>

                  <div className="p-5 rounded-2xl border border-purple-500/30 bg-[#0b0f1a] shadow-lg">
                    <div className="text-[11px] text-white/40 font-mono uppercase">Active Applications</div>
                    <div className="text-2xl md:text-3xl font-black text-purple-400 mt-1">{(myApplications || []).length} In Pipeline</div>
                    <div className="text-[11px] text-purple-300/60 font-mono mt-0.5">Track recruiter reviews</div>
                  </div>

                  <div className="p-5 rounded-2xl border border-amber-500/30 bg-[#0b0f1a] shadow-lg">
                    <div className="text-[11px] text-white/40 font-mono uppercase">Skill Readiness</div>
                    <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">{stats?.skill_readiness ?? 0}% Ready</div>
                    <div className="text-[11px] text-amber-300/60 font-mono mt-0.5">DSA & full stack track</div>
                  </div>
                </div>

                {/* TOP MATCHED INDUSTRY CHALLENGES (Always visible) */}
                <div className="rounded-2xl border border-emerald-500/40 bg-[#0c101a] p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles size={17} className="text-emerald-400" />
                        <h3 className="font-bold text-white text-base font-mono uppercase">Top Matched Challenges For You</h3>
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">Calculated by real-time skill overlap formula with your profile.</p>
                    </div>
                    <Link to="/challenges" className="text-xs text-emerald-400 hover:underline font-mono font-semibold flex items-center gap-1">
                      Browse All Industry Challenges <ChevronRight size={14} />
                    </Link>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 pt-1">
                    {(recommendedChallenges.length > 0 ? recommendedChallenges.slice(0, 3) : [
                      {
                        id: 'ai-crop-disease',
                        title: 'AI-Based Crop Disease Detection',
                        company: 'ABC Technologies',
                        match_score: 50,
                        domain: 'Computer Vision & Deep Learning',
                        opportunity_type: 'Internship with PPO',
                        description: 'Build a CNN vision model to detect leaf pathologies from mobile camera photos with 90%+ accuracy.'
                      },
                      {
                        id: 'collab-workspace',
                        title: 'Collaborative Real-Time Workspace with Live Sync',
                        company: 'Innovex Labs',
                        match_score: 82,
                        domain: 'Full Stack & Web Architecture',
                        opportunity_type: 'Internship & Placement',
                        description: 'Develop a high-concurrency real-time collaborative workspace with CRDT sync and WebSockets.'
                      },
                      {
                        id: 'cloud-security-analyzer',
                        title: 'Zero-Trust Cloud Security & Audit Log Analyzer',
                        company: 'CyberShield Defense',
                        match_score: 50,
                        domain: 'Cybersecurity & Cloud Defense',
                        opportunity_type: 'Placement Offer',
                        description: 'Create an automated zero-trust security log parser and anomaly detection engine.'
                      }
                    ]).map((rc) => (
                      <Link
                        key={rc.id}
                        to={`/challenges?id=${rc.id}`}
                        className="p-5 rounded-2xl bg-black/50 border border-white/10 hover:border-emerald-400/60 transition-all space-y-3 group shadow-lg flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-mono text-blue-400 font-semibold">{rc.company}</span>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              {rc.match_score}% Match
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 line-clamp-1">{rc.title}</h4>
                          <p className="text-[11px] text-white/50 line-clamp-2">{rc.description || rc.problem_statement}</p>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-[10px] font-mono text-amber-300">{rc.opportunity_type}</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            View Gap & Apply <ChevronRight size={12} />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* MY APPLICATIONS PIPELINE QUICK TRACKER */}
                {(myApplications || []).length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0b0e18] p-6 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={17} className="text-blue-400" />
                        <h3 className="font-bold text-white text-base font-mono uppercase">My Active Applications In Pipeline</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('applications')}
                        className="text-xs text-blue-400 hover:underline font-mono font-semibold"
                      >
                        View Details ({(myApplications || []).length}) →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(myApplications || []).slice(0, 2).map((app) => (
                        <div key={app.id} className="p-4 rounded-xl border border-white/10 bg-[#080a12] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-white text-sm">{app.challenge_title}</div>
                            <div className="text-xs text-white/50 font-mono mt-0.5">{app.challenge_company} · Match: {app.match_score}%</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveTab('applications')}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                            >
                              Track Pipeline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-white/10 bg-[#0b0e18] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <UserCheck size={16} className="text-emerald-400" /> Want direct internship & placement offers?
                      </div>
                      <p className="text-xs text-white/50">
                        1. Update your Technical Skills → 2. View Skill Gaps on Challenges → 3. Submit working GitHub solutions for recruiter evaluation.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveTab('portfolio')}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                      >
                        Update My Skills
                      </button>
                      <Link
                        to="/challenges"
                        className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs transition-colors"
                      >
                        Browse Challenges
                      </Link>
                    </div>
                  </div>
                )}

                {/* Followed Sheets */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white tracking-tight">Followed Sheets</h2>
                    <button
                      type="button"
                      onClick={() => setActiveTab('explore-sheets')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 cursor-pointer"
                    >
                      Explore More <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/60">Skill Readiness</span>
                          <span className="text-emerald-400 font-bold">{stats?.skill_readiness ?? 0}% Ready</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${stats?.skill_readiness ?? 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-white/40">
                          Trust Score: <strong className="text-white">{stats?.trust_score ?? 15}/100</strong>
                        </span>
                        <a
                          href="#roadmap-table"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                        >
                          View All Modules <ChevronRight size={13} />
                        </a>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-500/30 bg-[#0f121a] p-5 space-y-4 hover:border-amber-500/50 transition-all shadow-lg shadow-amber-500/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400">🌟</span>
                            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest font-mono">COMPANY KITS</span>
                          </div>
                          <h3 className="text-lg font-black text-white mt-1">Company Wise Interview Kit</h3>
                          <p className="text-xs text-white/50 mt-0.5">Google, Amazon, Microsoft, Meta, Apple & Bloomberg</p>
                        </div>
                        <span className="text-xs font-mono px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                          6 Kits Available
                        </span>
                      </div>

                      <p className="text-xs text-white/60 line-clamp-2">
                        Curated top-frequency algorithmic, system design, and role-specific technical questions asked in recent on-campus & off-campus drives.
                      </p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-white/40">250+ Curated Problems</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('explore-sheets')}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200 cursor-pointer"
                        >
                          Open Company Kits <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 9 Pillars Checklist Table */}
                <div id="roadmap-table" className="pt-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-white">Full Curriculum & Topic Tracker (9 Pillars)</h2>
                      <p className="text-xs text-white/50">Click topic names to open resources & documentation. Check off items as you master them.</p>
                    </div>
                    <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                      {completedTopicsCount} of {totalTopicsCount} Topics Completed
                    </div>
                  </div>

                  <div className="space-y-4">
                    {DEFAULT_ROADMAP.map((pillar) => {
                      const completedInPillar = pillar.topics.filter((t) => stats?.completed_topics?.includes(t.name)).length;
                      const isAllDone = completedInPillar === pillar.topics.length;

                      return (
                        <div key={pillar.id} className="rounded-xl border border-white/10 bg-[#0b0d14] overflow-hidden">
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

                          <div className="divide-y divide-white/[0.04]">
                            {pillar.topics.map((item) => {
                              const isDone = stats?.completed_topics?.includes(item.name);
                              return (
                                <div
                                  key={item.name}
                                  className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <button
                                      type="button"
                                      onClick={() => toggleTopic(item.name)}
                                      className="cursor-pointer"
                                    >
                                      {isDone ? (
                                        <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                                      ) : (
                                        <Square size={16} className="text-white/30 hover:text-white/60 shrink-0" />
                                      )}
                                    </button>
                                    
                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`text-xs md:text-sm hover:text-amber-400 flex items-center gap-1.5 transition-colors ${
                                        isDone ? 'line-through text-white/40' : 'text-white/85'
                                      }`}
                                    >
                                      <span>{item.name}</span>
                                      <ExternalLink size={12} className="text-white/30" />
                                    </a>
                                  </div>

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

            {/* VIEW: EXPLORE SHEETS / COMPANY KITS */}
            {(activeTab === 'explore-sheets' || activeTab === 'company-kit') && !selectedCompany && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">Track Coding Sheets in One Place</h1>
                  <p className="text-xs md:text-sm text-white/50 mt-1">Choose from 30+ structured coding paths, company kits, and placement roadmaps</p>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.values(COMPANY_SHEETS).map((sheet) => (
                    <div
                      key={sheet.id}
                      onClick={() => setSelectedCompanyId(sheet.id)}
                      className="p-5 rounded-xl border border-white/10 bg-[#0b0d14] hover:border-amber-400/50 transition-all cursor-pointer space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-base">{sheet.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">{sheet.tag}</span>
                      </div>
                      <p className="text-xs text-white/50 line-clamp-2">{sheet.desc}</p>
                      <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5">
                        <span className="text-amber-400 font-bold">{sheet.totalProblems} Problems</span>
                        <span className="text-blue-400 flex items-center gap-1">Open Kit <ChevronRight size={13} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: COMPANY DETAIL */}
            {selectedCompany && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setSelectedCompanyId(null)}
                  className="text-xs text-white/50 hover:text-white flex items-center gap-1 font-mono cursor-pointer"
                >
                  <ChevronLeft size={14} /> Back to All Kits
                </button>

                <div className="p-6 rounded-2xl border border-white/10 bg-[#0b0d14] space-y-3">
                  <h2 className="text-2xl font-black text-white">{selectedCompany.name} Interview Sheet</h2>
                  <p className="text-xs text-white/60">{selectedCompany.desc}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0b0d14] overflow-hidden">
                  <div className="p-4 bg-white/[0.02] border-b border-white/10">
                    <h3 className="font-bold text-white text-base">Questions & LeetCode Links</h3>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {selectedCompany.questions.map((q, idx) => (
                      <div key={q.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="text-white/40 font-mono w-5">{idx + 1}.</span>
                          <div>
                            <a href={q.link} target="_blank" rel="noreferrer" className="font-semibold text-white hover:text-amber-400 flex items-center gap-1.5">
                              <span>{q.title}</span>
                              <ExternalLink size={12} className="text-white/40" />
                            </a>
                            <span className="text-[10px] text-white/40 font-mono">{q.topic}</span>
                          </div>
                        </div>
                        <a href={q.link} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-semibold">
                          Solve
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: CONTESTS & EVENT TRACKER (CODOLIO MATCH) */}
            {(activeTab === 'contests' || activeTab === 'contests-calendar' || activeTab === 'event-tracker') && (
              <div className="space-y-6">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        <Calendar size={22} />
                      </div>
                      <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        Event Tracker & Contest Calendar
                      </h1>
                    </div>
                    <p className="text-xs md:text-sm text-white/60 mt-1">
                      Track live & upcoming coding contests, hackathons, and hiring challenges across LeetCode, Codeforces, CodeChef, AtCoder, GeeksforGeeks, and HackerRank.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => loadEvents(eventPlatformFilter, eventStatusFilter, eventSearch)}
                      variant="outline"
                      size="sm"
                      className="border-white/10 text-white/80 hover:bg-white/5 text-xs font-mono"
                    >
                      <RefreshCw size={13} className={`mr-1.5 ${eventsLoading ? 'animate-spin' : ''}`} />
                      Refresh Feed
                    </Button>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl border border-rose-500/20 bg-gradient-to-b from-rose-950/20 to-[#0b0d14] space-y-1">
                    <div className="flex items-center justify-between text-xs text-white/60 font-mono">
                      <span>Live Ongoing</span>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    </div>
                    <div className="text-xl font-black text-white font-mono flex items-center gap-2">
                      {eventsList.filter((e) => e.is_live).length} <span className="text-xs text-rose-400 font-normal">Active Contests</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-950/20 to-[#0b0d14] space-y-1">
                    <div className="flex items-center justify-between text-xs text-white/60 font-mono">
                      <span>Next 48 Hours</span>
                      <Clock size={13} className="text-amber-400" />
                    </div>
                    <div className="text-xl font-black text-white font-mono flex items-center gap-2">
                      {eventsList.filter((e) => !e.is_live && (new Date(e.start_time) - new Date()) < 172800000).length} <span className="text-xs text-amber-400 font-normal">Upcoming</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 to-[#0b0d14] space-y-1">
                    <div className="flex items-center justify-between text-xs text-white/60 font-mono">
                      <span>Platforms Tracked</span>
                      <Globe size={13} className="text-blue-400" />
                    </div>
                    <div className="text-xl font-black text-white font-mono flex items-center gap-2">
                      7 <span className="text-xs text-blue-400 font-normal">CP & Hackathons</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-[#0b0d14] space-y-1">
                    <div className="flex items-center justify-between text-xs text-white/60 font-mono">
                      <span>My Subscriptions</span>
                      <BookmarkCheck size={13} className="text-emerald-400" />
                    </div>
                    <div className="text-xl font-black text-emerald-400 font-mono flex items-center gap-2">
                      {Object.values(bookmarkedEvents).filter(Boolean).length} <span className="text-xs text-white/50 font-normal">Bookmarked</span>
                    </div>
                  </div>
                </div>

                {/* Platform Filters Bar (Codolio Match) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                      { id: 'all', label: 'All Platforms', color: 'bg-white/10 text-white' },
                      { id: 'leetcode', label: 'LeetCode', color: 'bg-[#FFA116]/10 text-[#FFA116] border-[#FFA116]/30' },
                      { id: 'codeforces', label: 'Codeforces', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
                      { id: 'codechef', label: 'CodeChef', color: 'bg-amber-600/10 text-amber-400 border-amber-600/30' },
                      { id: 'atcoder', label: 'AtCoder', color: 'bg-slate-400/10 text-slate-300 border-slate-400/30' },
                      { id: 'geeksforgeeks', label: 'GeeksforGeeks', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                      { id: 'hackerrank', label: 'HackerRank', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
                      { id: 'hackathon', label: 'Hackathons & Hiring', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' }
                    ].map((p) => {
                      const active = eventPlatformFilter === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setEventPlatformFilter(p.id);
                            loadEvents(p.id, eventStatusFilter, eventSearch);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap border ${
                            active
                              ? 'bg-white text-black font-bold shadow-lg shadow-white/10 border-white'
                              : 'bg-[#0b0d14] hover:bg-white/5 text-white/70 hover:text-white border-white/10'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Status Tabs & Search & View Mode Switcher */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {[
                        { id: 'all', label: 'All Events' },
                        { id: 'live', label: '🔴 Live Now' },
                        { id: 'today', label: '🕒 Today & Tomorrow' },
                        { id: 'bookmarked', label: '🔔 Bookmarked' }
                      ].map((st) => {
                        const active = eventStatusFilter === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setEventStatusFilter(st.id);
                              loadEvents(eventPlatformFilter, st.id, eventSearch);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                              active
                                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="relative min-w-[220px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                          placeholder="Search contest or tags..."
                          value={eventSearch}
                          onChange={(e) => {
                            setEventSearch(e.target.value);
                            loadEvents(eventPlatformFilter, eventStatusFilter, e.target.value);
                          }}
                          className="pl-8 bg-[#0b0d14] border-white/10 text-white text-xs h-9"
                        />
                      </div>

                      <div className="flex items-center bg-[#0b0d14] border border-white/10 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setEventViewMode('grid')}
                          className={`p-1.5 rounded-md text-xs transition-colors ${eventViewMode === 'grid' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}
                          title="Grid View"
                        >
                          <LayoutGrid size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEventViewMode('list')}
                          className={`p-1.5 rounded-md text-xs transition-colors ${eventViewMode === 'list' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}
                          title="List View"
                        >
                          <List size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Events Feed Content */}
                {eventsLoading ? (
                  <div className="p-16 text-center space-y-3 rounded-2xl border border-white/10 bg-[#0b0d14]">
                    <Loader2 size={32} className="animate-spin text-orange-400 mx-auto" />
                    <p className="text-xs text-white/60 font-mono">Syncing live contest schedules from platform feeds...</p>
                  </div>
                ) : eventsList.length === 0 ? (
                  <div className="p-16 text-center space-y-3 rounded-2xl border border-white/10 bg-[#0b0d14]">
                    <Calendar size={36} className="text-white/20 mx-auto" />
                    <p className="text-sm font-bold text-white">No contests found for this filter</p>
                    <p className="text-xs text-white/50">Try selecting 'All Platforms' or clearing your search.</p>
                  </div>
                ) : eventViewMode === 'grid' ? (
                  /* Grid Card View */
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eventsList
                      .filter((e) => {
                        if (eventStatusFilter === 'bookmarked') return bookmarkedEvents[e.id];
                        return true;
                      })
                      .map((contest) => {
                        const isBookmarked = !!bookmarkedEvents[contest.id];
                        const startDate = new Date(contest.start_time);
                        const isLive = contest.is_live;

                        // Calculate relative time
                        const diffMs = startDate - new Date();
                        let relativeStr = '';
                        if (isLive) {
                          relativeStr = 'Live Now 🔴';
                        } else if (diffMs > 0) {
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffMins = Math.floor((diffMs % 3600000) / 60000);
                          if (diffHours >= 24) {
                            const days = Math.floor(diffHours / 24);
                            relativeStr = `Starts in ${days}d ${diffHours % 24}h`;
                          } else {
                            relativeStr = `Starts in ${diffHours}h ${diffMins}m`;
                          }
                        } else {
                          relativeStr = 'Scheduled';
                        }

                        // Formatted IST date
                        const formattedDateStr = startDate.toLocaleString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) + ' IST';

                        return (
                          <div
                            key={contest.id}
                            className={`rounded-2xl border bg-[#0b0d14] p-5 space-y-4 shadow-xl transition-all hover:border-white/25 flex flex-col justify-between ${
                              isLive
                                ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-[#0b0d14] to-[#0b0d14]'
                                : isBookmarked
                                ? 'border-amber-500/30'
                                : 'border-white/10'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Top Bar: Platform & Status & Bookmark */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                                      contest.platform_code === 'leetcode'
                                        ? 'bg-[#FFA116]/15 text-[#FFA116] border-[#FFA116]/30'
                                        : contest.platform_code === 'codeforces'
                                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                        : contest.platform_code === 'codechef'
                                        ? 'bg-amber-600/15 text-amber-300 border-amber-600/30'
                                        : contest.platform_code === 'geeksforgeeks'
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                        : contest.platform_code === 'hackathon'
                                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                        : 'bg-white/10 text-white/80 border-white/15'
                                    }`}
                                  >
                                    {contest.platform}
                                  </span>

                                  <span className="text-[10px] text-white/50 font-mono">
                                    {contest.division || 'Rated for All'}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleBookmarkEvent(contest.id, contest.title)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    isBookmarked
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-white/5 text-white/40 hover:text-white border-white/10'
                                  }`}
                                  title={isBookmarked ? 'Remove Bookmark' : 'Add to Tracked Contests'}
                                >
                                  <Star size={14} className={isBookmarked ? 'fill-amber-400 text-amber-400' : ''} />
                                </button>
                              </div>

                              {/* Title & Description */}
                              <div>
                                <a
                                  href={contest.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-white text-sm md:text-base hover:text-amber-400 transition-colors line-clamp-2"
                                >
                                  {contest.title}
                                </a>
                                <p className="text-xs text-white/60 mt-1 line-clamp-2">
                                  {contest.description}
                                </p>
                              </div>

                              {/* Tags */}
                              {contest.tags && contest.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {contest.tags.map((tg) => (
                                    <span
                                      key={tg}
                                      className="px-2 py-0.5 rounded bg-white/[0.04] text-white/50 text-[10px] font-mono border border-white/[0.06]"
                                    >
                                      #{tg}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Timing & Actions */}
                            <div className="space-y-3 pt-3 border-t border-white/10">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <div className="flex items-center gap-1.5 text-white/80">
                                  <Calendar size={13} className="text-white/40" />
                                  <span className="text-[11px]">{formattedDateStr}</span>
                                </div>
                                <div className="flex items-center gap-1 text-white/50 text-[11px]">
                                  <Clock size={12} />
                                  {contest.duration}
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-[11px] font-mono font-bold ${
                                    isLive ? 'text-rose-400' : 'text-amber-400'
                                  }`}
                                >
                                  {relativeStr}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={getGoogleCalendarUrl(contest)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs transition-colors"
                                    title="Add to Google Calendar"
                                  >
                                    <CalendarPlus size={13} />
                                  </a>
                                  <a
                                    href={contest.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-colors"
                                  >
                                    <span>Register</span>
                                    <ExternalLink size={11} />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  /* List Table View */
                  <div className="rounded-2xl border border-white/10 bg-[#0b0d14] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-[#08090e] border-b border-white/10 text-white/50 font-mono text-[11px] uppercase tracking-wider">
                          <tr>
                            <th className="p-4 w-28">Status</th>
                            <th className="p-4 w-32">Platform</th>
                            <th className="p-4 min-w-[280px]">Contest Name & Details</th>
                            <th className="p-4 min-w-[200px]">Date & Time</th>
                            <th className="p-4 text-center w-28">Duration</th>
                            <th className="p-4 text-right min-w-[160px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {eventsList
                            .filter((e) => {
                              if (eventStatusFilter === 'bookmarked') return bookmarkedEvents[e.id];
                              return true;
                            })
                            .map((contest) => {
                              const isBookmarked = !!bookmarkedEvents[contest.id];
                              const startDate = new Date(contest.start_time);
                              const isLive = contest.is_live;

                              const formattedDateStr = startDate.toLocaleString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              }) + ' IST';

                              return (
                                <tr key={contest.id} className="hover:bg-white/[0.02] transition-colors">
                                  {/* Status */}
                                  <td className="p-4 font-mono">
                                    {isLive ? (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                        LIVE
                                      </span>
                                    ) : (
                                      <span className="text-[11px] text-amber-400 font-bold">
                                        Upcoming
                                      </span>
                                    )}
                                  </td>

                                  {/* Platform */}
                                  <td className="p-4">
                                    <span className="font-bold text-white text-xs">{contest.platform}</span>
                                    <div className="text-[10px] text-white/50 font-mono mt-0.5">{contest.division || 'Rated'}</div>
                                  </td>

                                  {/* Title & Tags */}
                                  <td className="p-4">
                                    <a
                                      href={contest.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="font-bold text-white text-sm hover:text-amber-400 transition-colors"
                                    >
                                      {contest.title}
                                    </a>
                                    <div className="text-xs text-white/50 mt-0.5 line-clamp-1">{contest.description}</div>
                                  </td>

                                  {/* Date & Time */}
                                  <td className="p-4 font-mono text-xs text-white/80">
                                    {formattedDateStr}
                                  </td>

                                  {/* Duration */}
                                  <td className="p-4 text-center font-mono text-xs text-white/60">
                                    {contest.duration}
                                  </td>

                                  {/* Actions */}
                                  <td className="p-4 text-right">
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => toggleBookmarkEvent(contest.id, contest.title)}
                                        className={`p-1.5 rounded-lg border transition-colors ${
                                          isBookmarked
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                            : 'bg-white/5 text-white/40 hover:text-white border-white/10'
                                        }`}
                                        title="Bookmark"
                                      >
                                        <Star size={13} className={isBookmarked ? 'fill-amber-400 text-amber-400' : ''} />
                                      </button>
                                      <a
                                        href={getGoogleCalendarUrl(contest)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs"
                                        title="Add to Google Calendar"
                                      >
                                        <CalendarPlus size={13} />
                                      </a>
                                      <a
                                        href={contest.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold"
                                      >
                                        <span>Go</span>
                                        <ExternalLink size={11} />
                                      </a>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: CAMPUS LEADERBOARD (CODOLIO MATCH) */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                {/* Header & Description */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Trophy size={22} />
                      </div>
                      <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                        Campus Competitive Leaderboard
                      </h1>
                    </div>
                    <p className="text-xs md:text-sm text-white/60 mt-1">
                      Live competitive programming ratings, verified problems solved, and campus talent rankings across universities.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => loadLeaderboard(scoreType, leaderboardCollegeFilter, leaderboardSearch)}
                      variant="outline"
                      size="sm"
                      className="border-white/10 text-white/80 hover:bg-white/5 text-xs font-mono"
                    >
                      <RefreshCw size={13} className={`mr-1.5 ${leaderboardLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      onClick={() => setShowLeetcodeModal(true)}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                    >
                      <Code2 size={14} className="mr-1.5" />
                      {studentProfile?.leetcode_username ? 'Manage LeetCode' : 'Link LeetCode Account'}
                    </Button>
                  </div>
                </div>

                {/* Candidate's Personalized LeetCode & Rank Status Card */}
                {studentProfile?.leetcode_username ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0b0d14] to-[#0b0d14] p-5 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                            alt={user?.name}
                            className="w-14 h-14 rounded-2xl border-2 border-emerald-400/60 bg-black/40 p-0.5 object-cover"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[9px] uppercase tracking-wider">
                            YOU
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white text-base">{user?.name}</h3>
                            <a
                              href={`https://leetcode.com/u/${studentProfile.leetcode_username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/20 transition-colors"
                            >
                              <Code2 size={12} />
                              @{studentProfile.leetcode_username}
                              <ExternalLink size={10} className="opacity-70" />
                            </a>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono">
                              {studentProfile.college || 'SLRTCE, Mumbai'}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mt-1 font-mono">
                            Synced via LeetCode Official GraphQL API · Verified Competitive Profile
                          </p>
                        </div>
                      </div>

                      {/* Live Stats */}
                      <div className="flex items-center gap-3 sm:gap-6 flex-wrap bg-black/40 border border-white/10 rounded-xl p-3">
                        <div>
                          <div className="text-[10px] text-white/50 uppercase font-mono">Campus Rank</div>
                          <div className="text-lg font-black text-amber-400 font-mono">
                            #{currentUserRank?.rank || 1}
                          </div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                          <div className="text-[10px] text-white/50 uppercase font-mono">Contest Rating</div>
                          <div className="text-lg font-black text-white font-mono flex items-center gap-1.5">
                            {studentProfile.leetcode_rating || currentUserRank?.leetcode_rating || '1,720.0'}
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-normal">
                              {studentProfile.leetcode_badge || currentUserRank?.leetcode_badge || 'Knight ⚔️'}
                            </span>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div>
                          <div className="text-[10px] text-white/50 uppercase font-mono">Problems Solved</div>
                          <div className="text-lg font-black text-emerald-400 font-mono">
                            {studentProfile.leetcode_solved_count || currentUserRank?.leetcode_solved_count || 240}
                          </div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <Button
                          onClick={() => handleSyncLeetcode(studentProfile.leetcode_username)}
                          disabled={syncingLeetcode}
                          size="sm"
                          variant="ghost"
                          className="text-xs text-white/80 hover:text-white hover:bg-white/10 font-mono h-8 px-2.5"
                        >
                          <RefreshCw size={13} className={`mr-1 ${syncingLeetcode ? 'animate-spin' : ''}`} />
                          {syncingLeetcode ? 'Syncing...' : 'Re-Sync'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-[#0b0d14] to-[#0b0d14] p-5 shadow-xl">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                          <Sparkles size={16} /> Link Your LeetCode Account to Get Ranked
                        </div>
                        <p className="text-xs text-white/70 max-w-2xl">
                          Showcase your real LeetCode contest rating, problems solved, and global rank on the campus leaderboard to unlock fast-track recruiter interview invites.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 max-w-md w-full">
                        <Input
                          placeholder="LeetCode username (e.g. ashish_gupta)"
                          value={leetcodeInput}
                          onChange={(e) => setLeetcodeInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSyncLeetcode(); }}
                          className="bg-[#07080d] border-white/15 text-white text-xs font-mono"
                        />
                        <Button
                          onClick={() => handleSyncLeetcode()}
                          disabled={syncingLeetcode || !leetcodeInput.trim()}
                          className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs whitespace-nowrap px-4 shrink-0"
                        >
                          {syncingLeetcode ? <Loader2 size={14} className="animate-spin" /> : 'Link & Sync'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Type Tabs & Search Filter Bar (Codolio Match) */}
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    {/* Codolio Score Type Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {[
                        { id: 'leetcode_rating', label: 'LeetCode Rating', icon: Trophy },
                        { id: 'questions_solved', label: 'Questions Solved', icon: Zap },
                        { id: 'trust_score', label: 'Platform Trust Score', icon: ShieldCheck }
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const active = scoreType === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setScoreType(tab.id);
                              loadLeaderboard(tab.id, leaderboardCollegeFilter, leaderboardSearch);
                            }}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap ${
                              active
                                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                            }`}
                          >
                            <Icon size={14} />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Search & College Filter Dropdowns */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="relative min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input
                          placeholder="Search candidate / @handle..."
                          value={leaderboardSearch}
                          onChange={(e) => {
                            setLeaderboardSearch(e.target.value);
                            loadLeaderboard(scoreType, leaderboardCollegeFilter, e.target.value);
                          }}
                          className="pl-8 bg-[#0b0d14] border-white/10 text-white text-xs h-9"
                        />
                      </div>

                      <select
                        value={leaderboardCollegeFilter}
                        onChange={(e) => {
                          setLeaderboardCollegeFilter(e.target.value);
                          loadLeaderboard(scoreType, e.target.value, leaderboardSearch);
                        }}
                        className="bg-[#0b0d14] border border-white/10 text-white text-xs rounded-lg px-3 py-2 h-9 focus:outline-none"
                      >
                        <option value="all">All Colleges</option>
                        {collegesList.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Leaderboard Table (Codolio Style) */}
                <div className="rounded-2xl border border-white/10 bg-[#0b0d14] overflow-hidden shadow-2xl">
                  {leaderboardLoading ? (
                    <div className="p-16 text-center space-y-3">
                      <Loader2 size={32} className="animate-spin text-amber-400 mx-auto" />
                      <p className="text-xs text-white/60 font-mono">Fetching live LeetCode ratings and ranking campus coders...</p>
                    </div>
                  ) : leaderboardData.length === 0 ? (
                    <div className="p-16 text-center space-y-3">
                      <Trophy size={36} className="text-white/20 mx-auto" />
                      <p className="text-sm font-bold text-white">No candidates found for this filter</p>
                      <p className="text-xs text-white/50">Try clearing your search query or selecting 'All Colleges'.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs md:text-sm">
                        <thead className="bg-[#08090e] border-b border-white/10 text-white/50 font-mono text-[11px] uppercase tracking-wider">
                          <tr>
                            <th className="p-4 w-20 text-center">Rank</th>
                            <th className="p-4 min-w-[240px]">Candidate</th>
                            <th className="p-4 min-w-[180px]">College</th>
                            <th className="p-4 text-center">LeetCode Rating</th>
                            <th className="p-4 text-center">Problems Solved</th>
                            <th className="p-4 text-right">Trust Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {leaderboardData.map((r) => {
                            const isMe = r.is_current_user || r.name === user?.name || (r.leetcode_username && r.leetcode_username === studentProfile?.leetcode_username);
                            const isTop1 = r.rank === 1;
                            const isTop2 = r.rank === 2;
                            const isTop3 = r.rank === 3;

                            return (
                              <tr
                                key={r.rank + r.name}
                                className={`transition-colors ${
                                  isMe
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-l-4 border-l-emerald-400'
                                    : isTop1
                                    ? 'bg-amber-500/[0.03] hover:bg-white/[0.04]'
                                    : 'hover:bg-white/[0.02]'
                                }`}
                              >
                                {/* Rank */}
                                <td className="p-4 text-center">
                                  {isTop1 ? (
                                    <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/30">
                                      🥇 1
                                    </div>
                                  ) : isTop2 ? (
                                    <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-black font-black text-xs flex items-center justify-center">
                                      🥈 2
                                    </div>
                                  ) : isTop3 ? (
                                    <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black text-xs flex items-center justify-center">
                                      🥉 3
                                    </div>
                                  ) : (
                                    <span className="font-mono font-bold text-white/60">
                                      #{r.rank}
                                    </span>
                                  )}
                                </td>

                                {/* Candidate Profile */}
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={r.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.name}`}
                                      alt={r.name}
                                      className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 object-cover"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-white text-sm">{r.name}</span>
                                        {isMe && (
                                          <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black font-black text-[9px] uppercase">
                                            YOU
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <a
                                          href={r.leetcode_url || `https://leetcode.com/u/${r.leetcode_username || r.handle.replace('@', '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 transition-colors"
                                        >
                                          <Code2 size={11} />
                                          {r.handle}
                                          <ExternalLink size={10} className="opacity-70" />
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* College */}
                                <td className="p-4">
                                  <div className="font-medium text-white/90 text-xs">{r.college}</div>
                                  <div className="text-[11px] text-white/50 font-mono mt-0.5">{r.branch}</div>
                                </td>

                                {/* LeetCode Rating */}
                                <td className="p-4 text-center">
                                  <div className="inline-flex flex-col items-center">
                                    <span className="font-mono font-black text-sm md:text-base text-amber-400">
                                      {r.leetcode_rating > 0 ? r.leetcode_rating.toLocaleString() : '1,720.0'}
                                    </span>
                                    <span className="mt-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono">
                                      {r.leetcode_badge || 'Knight ⚔️'}
                                    </span>
                                  </div>
                                </td>

                                {/* Problems Solved */}
                                <td className="p-4 text-center">
                                  <div className="font-mono font-bold text-white text-xs md:text-sm">
                                    {r.leetcode_solved_count > 0 ? r.leetcode_solved_count : 240} Solved
                                  </div>
                                  <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] font-mono">
                                    <span className="text-emerald-400" title="Easy">
                                      E: {r.leetcode_easy || Math.floor((r.leetcode_solved_count || 240) * 0.35)}
                                    </span>
                                    <span className="text-amber-400" title="Medium">
                                      M: {r.leetcode_medium || Math.floor((r.leetcode_solved_count || 240) * 0.50)}
                                    </span>
                                    <span className="text-rose-400" title="Hard">
                                      H: {r.leetcode_hard || ((r.leetcode_solved_count || 240) - Math.floor((r.leetcode_solved_count || 240) * 0.35) - Math.floor((r.leetcode_solved_count || 240) * 0.50))}
                                    </span>
                                  </div>
                                </td>

                                {/* Trust Score */}
                                <td className="p-4 text-right">
                                  <div className="inline-flex items-center gap-1 font-mono font-black text-emerald-400 text-sm">
                                    <ShieldCheck size={14} className="text-emerald-400" />
                                    {r.trust_score || 92}/100
                                  </div>
                                  <div className="text-[10px] text-white/40 font-mono mt-0.5">Verified</div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: WORKSPACE */}
            {activeTab === 'workspace' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-black text-white">My Workspace & Scratchpad</h1>
                <textarea
                  rows={10}
                  defaultValue="// LinktoCompany Scratchpad\n// Track your algorithm solutions, SQL notes, and interview prep here.\n\nfunction solve() {\n  console.log('Practicing DSA');\n}"
                  className="w-full bg-[#0b0d14] border border-white/10 p-4 text-white font-mono text-xs focus:outline-none rounded-xl"
                />
              </div>
            )}

            {/* VIEW: NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-black text-white">Interview Notes & Quick Revision</h1>
                <div className="grid md:grid-cols-2 gap-4 text-xs text-white/70">
                  <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14] space-y-2">
                    <h3 className="font-bold text-white text-sm">DSA Time Complexity Cheat Sheet</h3>
                    <p>• Binary Search: O(log n)</p>
                    <p>• MergeSort / QuickSort: O(n log n)</p>
                    <p>• HashMap Lookup: O(1) avg</p>
                  </div>
                  <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14] space-y-2">
                    <h3 className="font-bold text-white text-sm">ACID Properties in SQL</h3>
                    <p>• Atomicity: All or nothing execution</p>
                    <p>• Consistency: Preserves schema invariants</p>
                    <p>• Isolation: Concurrent transactions do not conflict</p>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: TEACHER & RECRUITER INTERACTION */}
            {activeTab === 'interaction' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-black text-white">Teacher & Recruiter Interaction</h1>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-white/10 bg-[#0b0d14] p-5 space-y-3">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-400" /> Scheduled Interviews ({stats?.interviews?.length || 0})
                    </h3>
                    {stats?.interviews?.length > 0 ? (
                      stats.interviews.map((iv) => (
                        <div key={iv.id} className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1 text-xs">
                          <div className="font-bold text-white">{iv.role_title} ({iv.company_name})</div>
                          <div className="text-white/50">{iv.date_time}</div>
                          <a href={iv.meet_link} target="_blank" rel="noreferrer" className="text-blue-400 underline block mt-1">Join Google Meet</a>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/40">No scheduled interviews yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* SHARED VIEW: TALENTS */}
        {/* ========================================================================= */}
        {activeTab === 'talents' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white">Verified Talent Pool</h1>
            <div className="grid md:grid-cols-3 gap-4">
              {talents.map((t) => (
                <div key={t.id} className="rounded-xl border border-white/10 bg-[#0b0d14] p-5 space-y-3">
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-white/50 font-mono">{t.email}</p>
                  <div className="text-xs font-mono text-emerald-400">Trust: {t.trust_score}/100</div>
                  {isCompany && (
                    <Button
                      onClick={() => {
                        setSelectedTalent(t);
                        setShowScheduleModal(true);
                      }}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-semibold py-1.5"
                    >
                      Schedule Interview
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHARED VIEW: SUPPORT & FEEDBACK HUB (CODOLIO MATCH) */}
        {(activeTab === 'help' || activeTab === 'feedback' || activeTab === 'support') && (
          <div className="space-y-8 max-w-5xl">
            {/* Header & Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <LifeBuoy size={22} />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Support & Feedback Hub
                  </h1>
                </div>
                <p className="text-xs md:text-sm text-white/60 mt-1">
                  Have questions, feature suggestions, or encountered an issue with LeetCode sync, assessments, or challenges? We're here to help.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="mailto:support@linktocompany.in"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono transition-colors"
                >
                  <Send size={13} />
                  support@linktocompany.in
                </a>
              </div>
            </div>

            {/* Quick Category Action Cards (Codolio Match) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { id: 'Bug Report', label: 'Report a Bug', icon: Bug, color: 'text-rose-400 border-rose-500/20 bg-rose-950/10 hover:border-rose-500/40' },
                { id: 'Feature Suggestion', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-400 border-amber-500/20 bg-amber-950/10 hover:border-amber-500/40' },
                { id: 'LeetCode Sync Issue', label: 'LeetCode Sync', icon: Code2, color: 'text-orange-400 border-orange-500/20 bg-orange-950/10 hover:border-orange-500/40' },
                { id: 'Challenge / Assessment', label: 'Challenges & Quiz', icon: Trophy, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40' },
                { id: 'College / Recruiter', label: 'Partnership Query', icon: Building2, color: 'text-blue-400 border-blue-500/20 bg-blue-950/10 hover:border-blue-500/40' }
              ].map((cat) => {
                const Icon = cat.icon;
                const active = supportCategory === cat.id && supportActiveTab === 'form';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSupportCategory(cat.id);
                      setSupportActiveTab('form');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${cat.color} ${
                      active ? 'ring-2 ring-white/30 border-white bg-white/10' : ''
                    }`}
                  >
                    <Icon size={20} />
                    <div className="font-bold text-white text-xs">{cat.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Sub-Tabs: Form, FAQ, My Tickets */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                {[
                  { id: 'form', label: 'Submit Support Ticket', icon: Send },
                  { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
                  { id: 'tickets', label: `My Tickets (${supportTickets.length})`, icon: MessageSquareQuote }
                ].map((tb) => {
                  const Icon = tb.icon;
                  const active = supportActiveTab === tb.id;
                  return (
                    <button
                      key={tb.id}
                      type="button"
                      onClick={() => setSupportActiveTab(tb.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                        active
                          ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                      }`}
                    >
                      <Icon size={14} />
                      {tb.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: SUPPORT & FEEDBACK FORM */}
              {supportActiveTab === 'form' && (
                <div className="grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0b0d14] p-6 space-y-5 shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h3 className="font-bold text-white text-base">Submit a Support Request</h3>
                        <p className="text-xs text-white/50">Our engineering & mentorship team responds within 24 hours.</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono">
                        {supportCategory}
                      </span>
                    </div>

                    {submittedTicketId && (
                      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-emerald-400">✓ Ticket Created: #{submittedTicketId}</div>
                          <div className="text-white/70">You can track resolution progress under the 'My Tickets' tab.</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSubmittedTicketId(null)}
                          className="text-white/40 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleCreateSupportTicket} className="space-y-4 text-xs">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-white/70">Your Name</Label>
                          <Input
                            placeholder={user?.name || "e.g. Ashish Gupta"}
                            value={supportName}
                            onChange={(e) => setSupportName(e.target.value)}
                            className="mt-1 bg-[#07080d] border-white/10 text-white text-xs"
                          />
                        </div>

                        <div>
                          <Label className="text-white/70">Your Contact Email</Label>
                          <Input
                            type="email"
                            placeholder={user?.email || "e.g. student@gmail.com"}
                            value={supportEmail}
                            onChange={(e) => setSupportEmail(e.target.value)}
                            className="mt-1 bg-[#07080d] border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-white/70">Category</Label>
                          <select
                            value={supportCategory}
                            onChange={(e) => setSupportCategory(e.target.value)}
                            className="mt-1 w-full bg-[#07080d] border border-white/10 rounded-md p-2 text-white text-xs"
                          >
                            <option>Bug Report</option>
                            <option>Feature Suggestion</option>
                            <option>LeetCode Sync Issue</option>
                            <option>Challenge / Assessment</option>
                            <option>College / Recruiter</option>
                            <option>Account / Login</option>
                            <option>General Query</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-white/70">Priority Level</Label>
                          <select
                            value={supportPriority}
                            onChange={(e) => setSupportPriority(e.target.value)}
                            className="mt-1 w-full bg-[#07080d] border border-white/10 rounded-md p-2 text-white text-xs"
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Urgent 🚨</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white/70">Subject / Title *</Label>
                        <Input
                          placeholder="e.g. My LeetCode rating did not update on the campus leaderboard"
                          value={supportSubject}
                          onChange={(e) => setSupportSubject(e.target.value)}
                          required
                          className="mt-1 bg-[#07080d] border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-white/70">Detailed Description / Steps to Reproduce *</Label>
                        <textarea
                          rows={5}
                          placeholder="Please provide details about what happened, error messages, or ideas for improvements..."
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          required
                          className="mt-1 w-full bg-[#07080d] border border-white/10 rounded-md p-3 text-white text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <Label className="text-white/70">Screenshot / Attachment Link (Optional)</Label>
                        <Input
                          placeholder="https://imgur.com/... or Google Drive link"
                          value={supportAttachment}
                          onChange={(e) => setSupportAttachment(e.target.value)}
                          className="mt-1 bg-[#07080d] border-white/10 text-white text-xs font-mono"
                        />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
                        <div className="text-[11px] text-white/50 font-mono">
                          📧 Dispatches instantly to <span className="text-cyan-400">ashish.business.p@gmail.com</span>
                        </div>
                        <Button
                          type="submit"
                          disabled={supportSubmitting}
                          onClick={handleCreateSupportTicket}
                          className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs px-6 py-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                        >
                          {supportSubmitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Send size={14} className="mr-1.5" />}
                          Submit Support Ticket
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Sidebar Info & Channels */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-5 space-y-4 text-xs">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <Headphones size={16} className="text-cyan-400" /> Direct Support Channels
                      </h4>
                      <div className="space-y-3 text-white/70">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                          <div className="font-bold text-white">Email Engineering Desk</div>
                          <div className="font-mono text-cyan-300">support@linktocompany.in</div>
                          <div className="text-[11px] text-white/40">Response within 24h</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                          <div className="font-bold text-white">Campus Innovation Hub</div>
                          <div className="text-white/60">SLRTCE Innovation Cell, Mumbai</div>
                          <div className="text-[11px] text-white/40">Mon - Fri · 9:00 AM - 6:00 PM IST</div>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                          <div className="font-bold text-white">Live AI Career Copilot</div>
                          <div className="text-white/60">Ask questions regarding DSA roadmaps or skill assessments.</div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('copilot')}
                            className="mt-1 inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono text-[11px]"
                          >
                            <span>Launch AI Copilot</span>
                            <ArrowUpRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FREQUENTLY ASKED QUESTIONS (CODOLIO MATCH) */}
              {supportActiveTab === 'faq' && (
                <div className="space-y-4">
                  {[
                    {
                      q: 'How does LeetCode profile sync and the Campus Leaderboard work?',
                      a: 'When you link your LeetCode username (e.g. ashish_gupta) on the Campus Leaderboard or Portfolio tab, our system queries the official LeetCode GraphQL API in real-time. It pulls your Contest Rating, Global Ranking, and solved problem counts (Easy, Medium, Hard) and dynamically computes your university rank.'
                    },
                    {
                      q: 'How are Skill-to-Challenge Match Scores calculated?',
                      a: 'Our transparent matching algorithm matches your verified assessment skills and claimed profile technologies against company challenge requirements: Match Score = (Matched Required Skills / Total Required Skills) * 100. Any missing skills are flagged in red under "Your Skill Gap" with a 4-step roadmap.'
                    },
                    {
                      q: 'How do I export contests to Google Calendar from the Event Tracker?',
                      a: 'In the Event Tracker tab, click the Calendar Plus icon on any LeetCode, Codeforces, or CodeChef contest card. This opens a pre-configured Google Calendar event with the contest title, duration, and direct registration link.'
                    },
                    {
                      q: 'What are the criteria for receiving an Internship or PPO offer?',
                      a: 'Verified partner companies (ABC Technologies, TechVedika, Innovex Labs) evaluate submissions using a 5-criteria weighted rubric: Technical Accuracy (30%), Problem Solving (25%), Code Quality (20%), Innovation (15%), and Communication (10%). Top submissions qualify for fast-track interview invites.'
                    },
                    {
                      q: 'How does anti-cheat proctoring work during Skill Assessments?',
                      a: 'Assessments operate with client-side proctoring tracking fullscreen exits, tab switches, paste velocity, and devtools access. Maintaining an integrity score >= 70% qualifies you for a Verified Skill Badge on your profile and Campus Leaderboard.'
                    },
                    {
                      q: 'Can colleges track their overall department placement readiness?',
                      a: 'Yes! Department heads and TPO administrators can access the Campus Analytics tab to view student enrollment, skill gap matrices comparing industry demand vs. student supply, and download accreditation reports.'
                    }
                  ].map((faq, idx) => {
                    const isOpen = expandedFaq[idx];
                    return (
                      <div
                        key={faq.q}
                        className="rounded-2xl border border-white/10 bg-[#0b0d14] overflow-hidden transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaq({ ...expandedFaq, [idx]: !isOpen })}
                          className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02]"
                        >
                          <span className="font-bold text-white text-sm">{faq.q}</span>
                          <span className="text-white/40">{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                        </button>
                        {isOpen && (
                          <div className="p-5 pt-0 text-xs text-white/70 border-t border-white/5 bg-black/20 leading-relaxed font-sans">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: MY SUPPORT TICKETS (CODOLIO MATCH) */}
              {supportActiveTab === 'tickets' && (
                <div className="rounded-2xl border border-white/10 bg-[#0b0d14] overflow-hidden shadow-2xl">
                  {supportTicketsLoading ? (
                    <div className="p-16 text-center space-y-3">
                      <Loader2 size={32} className="animate-spin text-cyan-400 mx-auto" />
                      <p className="text-xs text-white/60 font-mono">Loading your support tickets...</p>
                    </div>
                  ) : supportTickets.length === 0 ? (
                    <div className="p-16 text-center space-y-3">
                      <MessageSquareQuote size={36} className="text-white/20 mx-auto" />
                      <p className="text-sm font-bold text-white">No support tickets submitted yet</p>
                      <p className="text-xs text-white/50">Submit a support request using the form tab if you need assistance.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {supportTickets.map((t) => (
                        <div key={t.id} className="p-5 space-y-2 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-white text-xs">{t.id}</span>
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                                {t.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                                t.priority === 'Urgent 🚨' || t.priority === 'Urgent'
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : t.priority === 'High'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-white/10 text-white/60 border-white/10'
                              }`}>
                                {t.priority}
                              </span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-mono">
                              {t.status || 'In Review'}
                            </span>
                          </div>

                          <h4 className="font-bold text-white text-sm">{t.subject}</h4>
                          <p className="text-xs text-white/70">{t.message}</p>
                          <div className="text-[10px] text-white/40 font-mono pt-1">
                            Submitted: {new Date(t.created_at).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* RECRUITER EVALUATION MODAL */}
      {/* ========================================================================= */}
      {evaluatingApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0b0e16] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award size={18} className="text-emerald-400" /> Multi-Criteria Evaluation Scorecard
                </h3>
                <p className="text-xs text-white/50">Scoring: {evaluatingApp.user_name} ({evaluatingApp.user_email})</p>
              </div>
              <button onClick={() => setEvaluatingApp(null)} className="text-white/60 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <Label className="text-[11px] text-white/80">Technical Skills (0-100) (30%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={evalForm.tech_score}
                    onChange={(e) => setEvalForm({ ...evalForm, tech_score: Number(e.target.value) })}
                    className="mt-1 bg-[#070910] border-white/10 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-white/80">Problem Solving (0-100) (25%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={evalForm.problem_solving_score}
                    onChange={(e) => setEvalForm({ ...evalForm, problem_solving_score: Number(e.target.value) })}
                    className="mt-1 bg-[#070910] border-white/10 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-white/80">Code Quality & Modular (20%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={evalForm.code_quality_score}
                    onChange={(e) => setEvalForm({ ...evalForm, code_quality_score: Number(e.target.value) })}
                    className="mt-1 bg-[#070910] border-white/10 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-white/80">Innovation & Usability (15%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={evalForm.innovation_score}
                    onChange={(e) => setEvalForm({ ...evalForm, innovation_score: Number(e.target.value) })}
                    className="mt-1 bg-[#070910] border-white/10 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px] text-white/80 font-mono">Communication & Demo (10%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={evalForm.communication_score}
                  onChange={(e) => setEvalForm({ ...evalForm, communication_score: Number(e.target.value) })}
                  className="mt-1 bg-[#070910] border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div>
                <Label className="text-[11px] text-white/80">Hiring Outcome Decision</Label>
                <select
                  value={evalForm.outcome}
                  onChange={(e) => setEvalForm({ ...evalForm, outcome: e.target.value })}
                  className="mt-1 w-full bg-[#070910] border border-white/10 rounded p-2 text-white text-xs"
                >
                  <option value="Selected">Selected</option>
                  <option value="Internship Offered">Internship Offered</option>
                  <option value="Placement Offered">Placement Offered</option>
                  <option value="Shortlisted">Shortlisted for Next Round</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <Label className="text-[11px] text-white/80">Recruiter Feedback / Notes for Candidate</Label>
                <textarea
                  rows={3}
                  value={evalForm.feedback}
                  onChange={(e) => setEvalForm({ ...evalForm, feedback: e.target.value })}
                  className="mt-1 w-full bg-[#070910] border border-white/10 rounded p-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={() => setEvaluatingApp(null)} className="text-xs text-white/60">
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingEval} className="bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs px-6">
                  {submittingEval ? <Loader2 size={14} className="animate-spin" /> : 'Submit Scorecard & Notify Student'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {showScheduleModal && selectedTalent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f121a] border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-emerald-400" /> Schedule Interview for {selectedTalent.name}
            </h3>
            <p className="text-xs text-white/50">An automated email invitation and Google Meet link will be dispatched to {selectedTalent.email}.</p>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs text-white/80">Role / Position Title</Label>
                <Input
                  value={scheduleForm.role_title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, role_title: e.target.value })}
                  placeholder="e.g. Software Engineer - React / Node"
                  required
                  className="bg-[#07080c] border-white/10 text-white mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-white/80">Date & Time</Label>
                <Input
                  value={scheduleForm.date_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, date_time: e.target.value })}
                  placeholder="e.g. Tomorrow at 3:00 PM IST"
                  required
                  className="bg-[#07080c] border-white/10 text-white mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-white/80">Meeting Link (Google Meet / Zoom)</Label>
                <Input
                  value={scheduleForm.meet_link}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meet_link: e.target.value })}
                  placeholder="https://meet.google.com/xyz-abc"
                  required
                  className="bg-[#07080c] border-white/10 text-white mt-1 text-xs font-mono"
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
              <BookOpen size={18} className="text-amber-400" /> Welcome to LinktoCompany!
            </h3>
            <div className="space-y-3 text-xs text-white/70">
              <p>1. <strong>Skill-to-Challenge Matching:</strong> Match with live industry problem statements based on your verified skills and claimed technologies.</p>
              <p>2. <strong>Skill Gap Analysis:</strong> Identify missing skills and follow the 4-step learning path to qualify.</p>
              <p>3. <strong>Company Evaluations:</strong> Get evaluated on Technical, Problem Solving, Code Quality, Innovation, and Communication to unlock PPOs!</p>
            </div>
            <Button onClick={() => setShowTourModal(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2">
              Got it, let's explore!
            </Button>
          </div>
        </div>
      )}

      {/* LEETCODE LINK & SYNC MODAL */}
      {showLeetcodeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f121a] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowLeetcodeModal(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Code2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Connect LeetCode Account</h3>
                <p className="text-xs text-white/50">Live competitive ranking & stats sync</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-white/70">
              <p>
                Enter your LeetCode username or profile link below. We fetch your contest rating, global ranking, and problem solve breakdown directly via official LeetCode GraphQL API.
              </p>

              <div>
                <Label className="text-xs text-white/80">LeetCode Handle / Profile URL</Label>
                <Input
                  value={leetcodeInput || studentProfile?.leetcode_username || ''}
                  onChange={(e) => setLeetcodeInput(e.target.value)}
                  placeholder="e.g. ashish_gupta or https://leetcode.com/u/ashish_gupta"
                  className="bg-[#07080d] border-white/10 text-white mt-1 text-xs font-mono"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSyncLeetcode(); }}
                />
              </div>

              {studentProfile?.leetcode_username && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 font-mono text-[11px]">
                  <div className="text-emerald-400">✓ Currently Linked: @{studentProfile.leetcode_username}</div>
                  <div className="text-white/60">Rating: {studentProfile.leetcode_rating || '1,720.0'} · Solved: {studentProfile.leetcode_solved_count || 240}</div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setShowLeetcodeModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSyncLeetcode()}
                disabled={syncingLeetcode}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
              >
                {syncingLeetcode ? <Loader2 size={14} className="animate-spin" /> : 'Verify & Sync Score'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
};

export default Dashboard;
