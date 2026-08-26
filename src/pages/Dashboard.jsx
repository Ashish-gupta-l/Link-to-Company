import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, Circle, ArrowUpRight, Sparkles, Trophy, Target, BookOpen,
  ShieldCheck, Zap, Calendar, Video, MessageSquare, Plus, Building2,
  GraduationCap, Award, CheckSquare, Square, ChevronRight, UserCheck,
  Flame, HelpCircle, FileText, Globe, Layers, Laptop, Edit3, Bookmark,
  Share2, ExternalLink, Code2, Play, Search, Filter, Compass, Clock, Check,
  Lock, Unlock, ChevronLeft, Bell, Star, TrendingUp, Info
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { getSession, dashboardApi } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

// Detailed Company Sheets Data (Screenshot 1 & 4)
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
    name: 'Meta',
    tag: 'MAANG',
    logoColor: 'text-blue-400',
    desc: "Target Meta interviews smartly with this handpicked list of DSA questions focusing on high-speed execution, two-pointers, and graph traversals.",
    lastUpdated: '1 day ago',
    totalProblems: 195,
    difficulty: { easy: 20, medium: 135, hard: 40 },
    patterns: [
      { name: 'Strings & HashMaps', percentage: '28.50%', count: '55', color: '#f97316' },
      { name: 'Binary Trees & Graphs', percentage: '22.00%', count: '43', color: '#3b82f6' },
      { name: 'Two Pointers & Arrays', percentage: '18.30%', count: '36', color: '#22c55e' }
    ],
    questions: [
      { id: 1, title: 'Kth Largest Element in an Array', diff: 'Medium', topic: 'QuickSelect / Heap', link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { id: 2, title: 'Minimum Remove to Make Valid Parentheses', diff: 'Medium', topic: 'Stack', link: 'https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/' },
      { id: 3, title: 'Lowest Common Ancestor in Binary Tree', diff: 'Medium', topic: 'Binary Tree', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
      { id: 4, title: 'Subarray Sum Equals K', diff: 'Medium', topic: 'Prefix Sum + HashMap', link: 'https://leetcode.com/problems/subarray-sum-equals-k/' }
    ]
  },
  bloomberg: {
    id: 'bloomberg',
    name: 'Bloomberg',
    tag: 'FinTech',
    logoColor: 'text-purple-400',
    desc: "Crack Bloomberg's challenging interviews with this collection of high-frequency data streaming, design, and algorithmic questions.",
    lastUpdated: '4 days ago',
    totalProblems: 180,
    difficulty: { easy: 25, medium: 120, hard: 35 },
    patterns: [
      { name: 'Stacks & Queues', percentage: '25.00%', count: '45', color: '#f97316' },
      { name: 'Design Problems', percentage: '20.00%', count: '36', color: '#3b82f6' },
      { name: 'Two Pointers & Heaps', percentage: '18.00%', count: '32', color: '#22c55e' }
    ],
    questions: [
      { id: 1, title: 'Design Leaderboard', diff: 'Medium', topic: 'HashMap + Heap', link: 'https://leetcode.com/problems/design-a-leaderboard/' },
      { id: 2, title: 'Decode String', diff: 'Medium', topic: 'Stack', link: 'https://leetcode.com/problems/decode-string/' },
      { id: 3, title: 'Two City Scheduling', diff: 'Medium', topic: 'Greedy', link: 'https://leetcode.com/problems/two-city-scheduling/' }
    ]
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    tag: 'Hardware/OS',
    logoColor: 'text-gray-300',
    desc: "Strengthen your coding prep with Apple-specific DSA questions prioritizing robust memory management, matrix traversals, and clean recursion.",
    lastUpdated: '6 days ago',
    totalProblems: 170,
    difficulty: { easy: 30, medium: 110, hard: 30 },
    patterns: [
      { name: 'Arrays & Math', percentage: '24.00%', count: '41', color: '#f97316' },
      { name: 'Trees & Linked Lists', percentage: '22.00%', count: '37', color: '#3b82f6' },
      { name: 'Dynamic Programming', percentage: '15.00%', count: '25', color: '#eab308' }
    ],
    questions: [
      { id: 1, title: 'Spiral Matrix', diff: 'Medium', topic: 'Matrix Traversal', link: 'https://leetcode.com/problems/spiral-matrix/' },
      { id: 2, title: 'Valid Sudoku', diff: 'Medium', topic: 'HashMap / Matrix', link: 'https://leetcode.com/problems/valid-sudoku/' },
      { id: 3, title: 'Coin Change', diff: 'Medium', topic: 'Dynamic Programming', link: 'https://leetcode.com/problems/coin-change/' }
    ]
  }
};

// 9-Pillar Roadmap Topics (Screenshot 1 & Curriculum)
const DEFAULT_ROADMAP = [
  {
    id: 'dsa',
    title: '2. Data Structures & Algorithms (DSA)',
    desc: 'Target: 150–250 quality problems with pattern mastery for campus & tech interviews.',
    assessmentSkill: 'DSA',
    topics: [
      { name: 'Arrays & Strings (Two Pointers, Sliding Window)', diff: 'Easy-Med', link: 'https://leetcode.com/tag/array/' },
      { name: 'Linked List (Reversal, Fast-Slow Pointer)', diff: 'Med', link: 'https://leetcode.com/tag/linked-list/' },
      { name: 'Stack & Queue (Monotonic Stack, Parentheses)', diff: 'Med', link: 'https://leetcode.com/tag/stack/' },
      { name: 'HashMap & HashSet (Frequency Counting, Anagrams)', diff: 'Easy', link: 'https://leetcode.com/tag/hash-table/' },
      { name: 'Recursion & Backtracking (Subsets, Permutations)', diff: 'Med-Hard', link: 'https://leetcode.com/tag/backtracking/' },
      { name: 'Trees & Binary Search Trees (Traversals, LCA)', diff: 'Med', link: 'https://leetcode.com/tag/tree/' },
      { name: 'Heaps & Priority Queues (Kth Largest, Top K)', diff: 'Med', link: 'https://leetcode.com/tag/heap-priority-queue/' },
      { name: 'Graph Algorithms (BFS/DFS, Dijkstra, Topo Sort)', diff: 'Med-Hard', link: 'https://leetcode.com/tag/graph/' },
      { name: 'Sorting & Searching (Binary Search variations)', diff: 'Easy-Med', link: 'https://leetcode.com/tag/binary-search/' },
      { name: 'Dynamic Programming (0/1 Knapsack, LCS, LIS, Grid DP)', diff: 'Hard', link: 'https://leetcode.com/tag/dynamic-programming/' }
    ]
  },
  {
    id: 'dev',
    title: '3. Full Stack Development Track',
    desc: 'HTML/CSS → JavaScript → React → Node.js → Database → REST APIs → Deployment',
    assessmentSkill: 'JavaScript',
    topics: [
      { name: 'HTML5 & Modern Responsive CSS / Tailwind Layouts', diff: 'Easy', link: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
      { name: 'Core JavaScript ES6+, Async/Await & Event Loop', diff: 'Med', link: 'https://javascript.info/' },
      { name: 'React Components, Hooks, Context API & State Management', diff: 'Med', link: 'https://react.dev/' },
      { name: 'Node.js & Express RESTful API Architecture', diff: 'Med', link: 'https://nodejs.org/' },
      { name: 'JWT Authentication & Role-Based Access Control', diff: 'Med', link: 'https://jwt.io/' },
      { name: 'Production Cloud Deployment (Render / Docker)', diff: 'Med', link: 'https://docs.render.com/' }
    ]
  },
  {
    id: 'db',
    title: '4. Database Mastery',
    desc: 'SQL, Relational Modeling, Indexing & ACID Transactions',
    assessmentSkill: 'SQL & Databases',
    topics: [
      { name: 'Relational DBs: PostgreSQL / MySQL Architecture', diff: 'Easy', link: 'https://www.postgresql.org/docs/' },
      { name: 'Advanced SQL Queries, Subqueries & Complex Joins', diff: 'Med', link: 'https://sqlbolt.com/' },
      { name: 'Database Indexing (B-Tree) & Query Plan Optimization', diff: 'Med', link: 'https://use-the-index-luke.com/' },
      { name: 'ACID Transactions, Locking & Concurrency Control', diff: 'Med-Hard', link: 'https://en.wikipedia.org/wiki/ACID' },
      { name: 'Schema Normalization (1NF, 2NF, 3NF, BCNF)', diff: 'Med', link: 'https://www.geeksforgeeks.org/database-normalization-introduction/' },
      { name: 'NoSQL Data Modeling with MongoDB', diff: 'Easy-Med', link: 'https://www.mongodb.com/docs/' }
    ]
  },
  {
    id: 'git',
    title: '5. Git & GitHub Workflow',
    desc: 'Professional team version control & code review pipelines',
    assessmentSkill: 'Git & DevOps',
    topics: [
      { name: 'git clone, init, add, commit, push, status', diff: 'Easy', link: 'https://git-scm.com/doc' },
      { name: 'Branching strategies (feature branches, main)', diff: 'Easy', link: 'https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows' },
      { name: 'git merge, pull requests (PR) & code review', diff: 'Med', link: 'https://docs.github.com/en/pull-requests' },
      { name: 'Resolving Git merge conflicts cleanly', diff: 'Med', link: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts' },
      { name: 'GitHub Actions & Automated CI/CD Basics', diff: 'Med', link: 'https://docs.github.com/en/actions' }
    ]
  },
  {
    id: 'cs',
    title: '6. Core Computer Science Fundamentals',
    desc: 'High-frequency campus interview & placement topics',
    assessmentSkill: 'CS Fundamentals',
    topics: [
      { name: 'Object-Oriented Programming (OOP: Encapsulation, Polymorphism, Abstraction)', diff: 'Med', link: 'https://en.wikipedia.org/wiki/Object-oriented_programming' },
      { name: 'DBMS Architecture, Transactions & Storage Engines', diff: 'Med', link: 'https://www.geeksforgeeks.org/dbms/' },
      { name: 'Operating Systems (Processes, Threads, Deadlocks, Virtual Memory)', diff: 'Med', link: 'https://www.geeksforgeeks.org/operating-systems/' },
      { name: 'Computer Networks (OSI Model, TCP/IP, DNS, HTTP/HTTPS)', diff: 'Med', link: 'https://www.geeksforgeeks.org/computer-network-tutorials/' },
      { name: 'Software Engineering Basics & Agile Scrum Life Cycle', diff: 'Easy', link: 'https://www.atlassian.com/agile/scrum' }
    ]
  },
  {
    id: 'projects',
    title: '7. Real Industry Projects',
    desc: 'Build 2–4 comprehensive production-grade projects with live deployment',
    assessmentSkill: 'Node.js',
    topics: [
      { name: 'Project 1: Secure Authentication + Live Email OTP System', diff: 'Med', link: 'https://github.com/Ashish-gupta-l/Link-to-Company' },
      { name: 'Project 2: E-Commerce Store with Payment & Cart APIs', diff: 'Med-Hard', link: 'https://github.com/' },
      { name: 'Project 3: College Placement & Student Management ERP', diff: 'Med', link: 'https://github.com/' },
      { name: 'Project 4: Real-Time Team Collaboration & Chat Application', diff: 'Hard', link: 'https://github.com/' }
    ]
  },
  {
    id: 'tools',
    title: '8. Developer Tools & DevOps',
    desc: 'VS Code, Postman, Docker containerization & Linux/CLI',
    assessmentSkill: 'Git & DevOps',
    topics: [
      { name: 'VS Code / IntelliJ Debugging & Productivity Setup', diff: 'Easy', link: 'https://code.visualstudio.com/docs' },
      { name: 'Postman API Testing & Automated Collections', diff: 'Easy', link: 'https://learning.postman.com/docs/getting-started/overview/' },
      { name: 'Docker Basics: Dockerfile, Images, Containerization', diff: 'Med', link: 'https://docs.docker.com/get-started/' },
      { name: 'Linux CLI: Navigation, Permissions, Bash Scripts', diff: 'Med', link: 'https://ubuntu.com/tutorials/command-line-for-beginners' },
      { name: 'Cloud Deployment (Render, Vercel, Supabase)', diff: 'Med', link: 'https://render.com' }
    ]
  },
  {
    id: 'softskills',
    title: '9. Soft Skills & Technical Interview Readiness',
    desc: 'Articulating code design, debugging under pressure, and teamwork',
    assessmentSkill: 'CS Fundamentals',
    topics: [
      { name: 'Structured Problem Solving & Clarifying Questions', diff: 'Med', link: 'https://www.freecodecamp.org/news/how-to-solve-coding-problems/' },
      { name: 'Explaining Code & Time/Space Complexity Out Loud', diff: 'Med', link: 'https://www.bigocheatsheet.com/' },
      { name: 'Live Debugging & System Design Whiteboarding', diff: 'Med-Hard', link: 'https://github.com/donnemartin/system-design-primer' },
      { name: 'Reading Official Documentation & Fast Troubleshooting', diff: 'Med', link: 'https://stackoverflow.com/' },
      { name: 'Collaborative Teamwork & Agile Sprint Standups', diff: 'Easy', link: 'https://www.atlassian.com/agile' }
    ]
  }
];

// Contest Calendar Data (Screenshot 2)
const CONTESTS_DATA = [
  { id: 1, title: 'Logical Reasoning (Part 3)', time: '12:00 AM - 12:00 AM', dateGroup: 'Today', subscribers: 59, platform: 'LinktoCompany', link: '/assessment' },
  { id: 2, title: 'Starters 253', time: '8:00 PM - 10:00 PM', dateGroup: 'Today', subscribers: 56, platform: 'CodeChef', link: 'https://www.codechef.com/contests' },
  { id: 3, title: '13th Asprova Programming Contest (AtCoder)', time: '11:30 AM - 3:30 PM', dateGroup: '29 Aug 2026', subscribers: 14, platform: 'AtCoder', link: 'https://atcoder.jp/contests' },
  { id: 4, title: 'AtCoder Beginner Contest 473', time: '5:30 PM - 7:10 PM', dateGroup: '29 Aug 2026', subscribers: 37, platform: 'AtCoder', link: 'https://atcoder.jp/contests' },
  { id: 5, title: 'LeetCode Weekly Contest 412', time: '8:00 AM - 9:30 AM', dateGroup: '30 Aug 2026', subscribers: 142, platform: 'LeetCode', link: 'https://leetcode.com/contest/' },
  { id: 6, title: 'Codeforces Round 970 (Div. 2)', time: '8:05 PM - 10:05 PM', dateGroup: '31 Aug 2026', subscribers: 98, platform: 'Codeforces', link: 'https://codeforces.com/contests' }
];

// Leaderboard Data (Screenshot 3)
const LEADERBOARD_RANKERS = [
  { rank: 1, name: 'Pratham Lashkari', handle: '@Pratham', institution: 'Sushila Devi Bansal College of Technology', score: '889.42', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pratham' },
  { rank: 2, name: 'Tejas Nalawade', handle: '@tejas_nalawade', institution: 'Vishwakarma Institute of Technology', score: '888.94', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tejas' },
  { rank: 3, name: 'Raj Roy', handle: '@RkRay', institution: 'Indian Institute of Technology (BHU)', score: '888.44', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Raj' },
  { rank: 4, name: 'Aarav Sharma', handle: '@aarav_s', institution: 'Delhi Technological University', score: '876.10', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aarav' },
  { rank: 5, name: 'Ashish Gupta', handle: '@ashish_g', institution: 'SLRTCE Mumbai', score: '865.50', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ashish' },
  { rank: 6, name: 'Ananya Verma', handle: '@ananya_v', institution: 'Thapar Institute of Engineering', score: '852.30', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ananya' }
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
  const [selectedCompanyId, setSelectedCompanyId] = useState(null); // When user clicks a company card!
  const [exploreFilter, setExploreFilter] = useState('Company Wise'); // 'Company Wise' | 'All' | 'Popular' | 'Quick Revision' | 'Complete DSA' | 'Topic Specific' | 'Competitive'
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardTab, setLeaderboardTab] = useState('C Score'); // 'C Score' | 'Total Questions' | 'Leetcode Rating' | 'Codeforces Rating'
  const [subscribedContests, setSubscribedContests] = useState({});
  const [customSheets, setCustomSheets] = useState([]);
  const [showCreateSheetModal, setShowCreateSheetModal] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetDesc, setNewSheetDesc] = useState('');
  const [showTourModal, setShowTourModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [platformHandles, setPlatformHandles] = useState({ leetcode: '', codeforces: '', github: '' });

  // Sync tab with URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
      if (tabParam !== 'company-kit' && tabParam !== 'explore-sheets') {
        setSelectedCompanyId(null);
      }
    }
  }, [location.search]);

  const loadData = () => {
    if (!user) { navigate('/auth'); return; }
    dashboardApi.stats()
      .then((data) => setStats(data))
      .catch(() => {});

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
    
    // Dynamic 0% calculation
    const newCount = updated.length;
    const newReadiness = Math.min(100, Math.floor((newCount * 2.2) + (stats.verified_skills_count * 10) + (stats.challenges_solved * 12)));
    setStats({ ...stats, completed_topics: updated, skill_readiness: newReadiness });

    try {
      await dashboardApi.updateProgress({ goal_track: stats.goal_track, completed_topics: updated });
    } catch {
      toast({ title: 'Sync Error', description: 'Failed to update topic milestone.', variant: 'destructive' });
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

  const totalTopicsCount = DEFAULT_ROADMAP.reduce((acc, p) => acc + p.topics.length, 0);
  const completedTopicsCount = stats.completed_topics?.length || 0;

  // Selected Company Detail Data
  const selectedCompany = selectedCompanyId ? COMPANY_SHEETS[selectedCompanyId] : null;

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={(t) => {
        setActiveTab(t);
        setSelectedCompanyId(null);
      }}
      stats={stats}
    >
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================================= */}
        {/* VIEW 1: EXPLORE SHEETS & TRACK CODING SHEETS (Screenshot 1) */}
        {/* ========================================================================= */}
        {(activeTab === 'explore-sheets' || activeTab === 'company-kit') && !selectedCompany && (
          <div className="space-y-6">
            
            {/* Header with Mascot & Title */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Track Coding Sheets in One Place
                </h1>
                <p className="text-xs md:text-sm text-white/50 mt-1">
                  Choose from 30+ structured coding paths, company kits, and placement roadmaps
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowTourModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold font-mono transition-colors"
                >
                  <BookOpen size={14} /> Tour
                </button>
                {/* Cute Owl / Coder Avatar Mascot */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-lg hidden sm:flex">
                  🦉
                </div>
              </div>
            </div>

            {/* Search Bar (Screenshot 1) */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any coding sheet, company or topic..."
                className="pl-10 bg-[#0b0d14] border-white/10 text-white placeholder:text-white/30 text-xs rounded-xl focus:border-amber-400 h-10"
              />
            </div>

            {/* Category Filter Pills (Orange Active Highlight - Screenshot 1) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                'Company Wise', 'All', 'Popular', 'Quick Revision', 'Complete DSA', 'Topic Specific', 'Competitive'
              ].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setExploreFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    exploreFilter === tab
                      ? 'bg-[#f97316] text-white shadow-md shadow-orange-500/20 font-bold'
                      : 'bg-[#0b0d14] hover:bg-white/5 text-white/70 border border-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Company Wise Sheets</span>
                <span className="text-xs text-blue-400 font-normal font-mono cursor-pointer hover:underline">(Learn More)</span>
              </h2>
            </div>

            {/* CLICKABLE COMPANY CARDS GRID (Screenshot 1) */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(COMPANY_SHEETS)
                .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(company.id)}
                    className="rounded-2xl border border-white/10 hover:border-amber-400/60 bg-[#0b0d14] hover:bg-[#0f121d] p-6 text-left flex flex-col justify-between space-y-4 transition-all group shadow-lg hover:shadow-amber-500/5 cursor-pointer"
                  >
                    <div>
                      {/* Logo + Company Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl group-hover:scale-105 transition-transform">
                          <span className={company.logoColor}>{company.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-display font-black text-lg text-white group-hover:text-amber-300 transition-colors">
                            {company.name}
                          </h3>
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{company.tag}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-white/55 mt-3 line-clamp-2 leading-relaxed">
                        {company.desc}
                      </p>
                    </div>

                    {/* Card Footer: Icons */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-white/40 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-white/40" />
                        <span>{company.totalProblems} Problems</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold group-hover:translate-x-1 transition-transform text-xs">
                        <span>Open Kit</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => toast({ title: 'All 30+ Company Sheets Loaded', description: 'Showing top hiring tech companies.' })}
                className="text-xs font-mono text-white/50 hover:text-white underline cursor-pointer"
              >
                Show More Sheets
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1.B: COMPANY SHEET DETAIL VIEW (Screenshot 4 - Google/Amazon/Meta) */}
        {/* ========================================================================= */}
        {selectedCompany && (
          <div className="space-y-6">
            
            {/* Back button */}
            <button
              type="button"
              onClick={() => setSelectedCompanyId(null)}
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors font-mono cursor-pointer"
            >
              <ChevronLeft size={16} /> Back to Company Sheets
            </button>

            {/* Top Detail Header Banner (Screenshot 4) */}
            <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-2xl">
                    <span className={selectedCompany.logoColor}>{selectedCompany.name.charAt(0)}</span>
                  </div>
                  <h1 className="font-display font-black text-3xl md:text-4xl text-white">
                    {selectedCompany.name}
                  </h1>
                </div>

                <p className="text-xs md:text-sm text-white/65 leading-relaxed">
                  {selectedCompany.desc}
                </p>

                <div className="pt-2">
                  <a
                    href="#questions-list"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-colors"
                  >
                    <Play size={14} /> Explore Questions
                  </a>
                </div>
              </div>

              {/* Right Lock / Last Updated Indicator (Screenshot 4) */}
              <div className="flex flex-col items-center lg:items-end justify-center gap-2 shrink-0">
                <div className="text-[11px] font-mono text-white/40 flex items-center gap-1">
                  <Clock size={13} /> Last Updated: {selectedCompany.lastUpdated}
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/40 bg-emerald-500/5 flex flex-col items-center justify-center">
                  <Unlock size={22} className="text-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold mt-1">Unlocked</span>
                </div>
              </div>
            </div>

            {/* Time Filter Tabs (Screenshot 4) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['All Time Favourite', '45 Days', '6 Months', 'Interview BETA'].map((tab, idx) => (
                <button
                  key={tab}
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    idx === 0
                      ? 'bg-[#f97316] text-white font-bold shadow-md shadow-orange-500/20'
                      : idx === 3
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-[#0b0d14] text-white/70 border border-white/10 hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Graphic Distribution Cards Grid (Screenshot 4) */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Card 1: Interview Pattern Distribution Donut Breakdown (Screenshot 4) */}
              <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6 space-y-4">
                <h3 className="font-display font-black text-white text-lg text-center">
                  Interview Pattern Distribution
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  {selectedCompany.patterns.map((pat) => (
                    <div key={pat.name} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pat.color }}></span>
                        <span className="text-white/80 text-[11px] truncate">{pat.name}</span>
                      </div>
                      <span className="font-mono text-white/60 font-semibold text-[11px] shrink-0 ml-1">{pat.percentage}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Difficulty Wise Distribution Ring Chart (Screenshot 4) */}
              <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-6 flex flex-col justify-between space-y-4">
                <h3 className="font-display font-black text-white text-lg text-center">
                  Difficulty Wise Distribution
                </h3>

                <div className="flex items-center justify-center gap-8 py-4">
                  {/* Total Circle */}
                  <div className="w-32 h-32 rounded-full border-8 border-amber-400/80 border-t-emerald-400 border-r-red-400 flex flex-col items-center justify-center">
                    <span className="font-display font-black text-3xl text-white">{selectedCompany.totalProblems}</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase">Total Problems</span>
                  </div>

                  {/* Difficulty Legend */}
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                      <span className="text-white/70 w-16">Easy</span>
                      <strong className="text-white text-sm">{selectedCompany.difficulty.easy}</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="text-white/70 w-16">Medium</span>
                      <strong className="text-white text-sm">{selectedCompany.difficulty.medium}</strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-red-400"></span>
                      <span className="text-white/70 w-16">Hard</span>
                      <strong className="text-white text-sm">{selectedCompany.difficulty.hard}</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Pill */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/70">Practice verified problems with instant test runner</span>
                  <Link
                    to="/assessment"
                    className="px-3 py-1.5 rounded-lg bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold text-xs transition-colors"
                  >
                    Take Quiz Now
                  </Link>
                </div>
              </div>

            </div>

            {/* Clickable Problem List for Selected Company */}
            <div id="questions-list" className="rounded-2xl border border-white/10 bg-[#0b0d14] overflow-hidden">
              <div className="p-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white text-base">
                  High-Frequency {selectedCompany.name} Interview Questions
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-semibold">Click to solve on LeetCode</span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {selectedCompany.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-white/40 w-5">{idx + 1}.</span>
                      <div>
                        <a
                          href={q.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs md:text-sm font-semibold text-white hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                        >
                          <span>{q.title}</span>
                          <ExternalLink size={13} className="text-white/40" />
                        </a>
                        <div className="text-[11px] text-white/40 font-mono mt-0.5">{q.topic}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold ${
                        q.diff === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        q.diff === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {q.diff}
                      </span>
                      <a
                        href={q.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                      >
                        Solve
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CONTEST CALENDAR (Screenshot 2) */}
        {/* ========================================================================= */}
        {(activeTab === 'contests' || activeTab === 'contests-calendar') && (
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Contest Calendar
              </h1>
              <p className="text-xs md:text-sm text-white/50 mt-1">
                Explore Coding Contests and never miss placement drives or competitive rounds
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              
              {/* Left Column: Contest List with Subscribe (Screenshot 2) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Search & Filter */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                    <Input
                      placeholder="Search contest..."
                      className="pl-9 bg-[#0b0d14] border-white/10 text-white text-xs rounded-xl h-9"
                    />
                  </div>
                  <Button className="bg-[#0b0d14] hover:bg-white/5 text-white border border-white/10 text-xs h-9">
                    <Filter size={13} className="mr-1" /> Filters
                  </Button>
                </div>

                {/* Timeline Cards grouped by Today / Upcoming (Screenshot 2) */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  
                  <div className="text-xs font-bold text-white uppercase tracking-wider font-mono text-white/50">Today</div>
                  
                  {CONTESTS_DATA.filter((c) => c.dateGroup === 'Today').map((contest) => (
                    <div key={contest.id} className="p-4 rounded-xl border border-white/10 bg-[#0b0d14] space-y-3 hover:border-amber-400/40 transition-colors">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-emerald-400 font-semibold">{contest.time}</span>
                        <button
                          type="button"
                          onClick={() => handleSubscribeContest(contest.id, contest.title)}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                            subscribedContests[contest.id]
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'text-white/60 hover:text-white bg-white/5'
                          }`}
                        >
                          {subscribedContests[contest.id] ? '✓ Subscribed' : 'Subscribe'}
                        </button>
                      </div>

                      <div className="font-bold text-white text-sm">
                        <a href={contest.link} target={contest.link.startsWith('http') ? '_blank' : '_self'} rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                          <span>{contest.title}</span>
                          <ExternalLink size={12} className="text-white/40" />
                        </a>
                      </div>

                      <div className="text-[11px] font-mono text-white/40 flex items-center gap-1.5">
                        <UserCheck size={13} /> {contest.subscribers} users subscribed to this contest
                      </div>
                    </div>
                  ))}

                  <div className="text-xs font-bold text-white uppercase tracking-wider font-mono text-white/50 pt-2">Upcoming (29 - 31 Aug 2026)</div>
                  
                  {CONTESTS_DATA.filter((c) => c.dateGroup !== 'Today').map((contest) => (
                    <div key={contest.id} className="p-4 rounded-xl border border-white/10 bg-[#0b0d14] space-y-3 hover:border-amber-400/40 transition-colors">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-blue-400 font-semibold">{contest.time} · {contest.dateGroup}</span>
                        <button
                          type="button"
                          onClick={() => handleSubscribeContest(contest.id, contest.title)}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                            subscribedContests[contest.id]
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'text-white/60 hover:text-white bg-white/5'
                          }`}
                        >
                          {subscribedContests[contest.id] ? '✓ Subscribed' : 'Subscribe'}
                        </button>
                      </div>

                      <div className="font-bold text-white text-sm">
                        <a href={contest.link} target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                          <span>{contest.title}</span>
                          <ExternalLink size={12} className="text-white/40" />
                        </a>
                      </div>

                      <div className="text-[11px] font-mono text-white/40 flex items-center gap-1.5">
                        <UserCheck size={13} /> {contest.subscribers} users subscribed
                      </div>
                    </div>
                  ))}

                </div>
              </div>

              {/* Right Column: August 2026 Interactive Calendar (Screenshot 2) */}
              <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0b0d14] p-6 space-y-4">
                
                {/* Calendar Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <h3 className="font-display font-black text-xl text-white">August 2026</h3>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 rounded-lg bg-white/10 text-xs font-semibold text-white">Today</button>
                    <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
                      <button className="px-2.5 py-1 rounded-md bg-[#f97316] text-white font-bold">Month</button>
                      <button className="px-2.5 py-1 rounded-md text-white/60 hover:text-white">Week</button>
                      <button className="px-2.5 py-1 rounded-md text-white/60 hover:text-white">Day</button>
                    </div>
                  </div>
                </div>

                {/* Calendar Grid (Screenshot 2) */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                    <div key={day} className="p-2 text-white/40 font-bold text-[11px]">{day}</div>
                  ))}

                  {/* Sample Days with Contests */}
                  {[
                    { d: 26, contests: ['Weekend D...', 'Codeforces'] },
                    { d: 27, contests: ['Monday M...'] },
                    { d: 28, contests: [] },
                    { d: 29, contests: ['Starters 253'] },
                    { d: 30, contests: [] },
                    { d: 31, contests: ['Placement Drive'] },
                    { d: 1, contests: ['AtCoder'] },
                    { d: 2, contests: [] },
                    { d: 3, contests: ['Weekly Co...'] },
                    { d: 4, contests: [] },
                    { d: 5, contests: ['Starters 250'] },
                    { d: 6, contests: ['Codeforces'] },
                    { d: 7, contests: ['Educational...'] },
                    { d: 8, contests: [] }
                  ].map((cell, idx) => (
                    <div key={idx} className="min-h-[75px] rounded-lg bg-white/[0.01] border border-white/5 p-1.5 flex flex-col justify-between text-left hover:bg-white/[0.03] transition-colors">
                      <span className="text-[10px] font-bold text-white/60">{cell.d}</span>
                      <div className="space-y-1 mt-1">
                        {cell.contests.map((c, i) => (
                          <div key={i} className="text-[9px] px-1 py-0.5 rounded bg-orange-500/20 text-orange-300 truncate font-mono border border-orange-500/30">
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: LEADERBOARD & PODIUM (Screenshot 3) */}
        {/* ========================================================================= */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Leaderboard</h1>
                <p className="text-xs text-white/50 mt-1">Global campus ranks based on verified skill scores and coding challenges</p>
              </div>
              <button
                type="button"
                onClick={() => toast({ title: 'Leaderboard Scoring System', description: 'Calculated using verified anti-cheat test scores, problem accuracy, and GitHub repositories.' })}
                className="text-xs text-blue-400 hover:underline font-mono cursor-pointer"
              >
                How It Works?
              </button>
            </div>

            {/* Filter Tabs (Screenshot 3) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['C Score', 'Total Questions', 'Leetcode Rating', 'Codeforces Rating'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setLeaderboardTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    leaderboardTab === tab
                      ? 'bg-[#f97316] text-white font-bold shadow-md shadow-orange-500/20'
                      : 'bg-[#0b0d14] text-white/70 border border-white/10 hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* PODIUM TOP 3 CARDS (#1 Gold, #2 Silver, #3 Bronze - Screenshot 3) */}
            <div className="grid md:grid-cols-3 gap-4 items-end">
              
              {/* #2 Rank Card (Silver) */}
              <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={LEADERBOARD_RANKERS[1].avatar} alt="" className="w-10 h-10 rounded-full bg-white/10" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{LEADERBOARD_RANKERS[1].name}</h4>
                      <span className="text-[11px] text-white/40 font-mono">{LEADERBOARD_RANKERS[1].handle}</span>
                    </div>
                  </div>
                  <span className="text-xl">🥈</span>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-white/40 block">C Score</span>
                    <strong className="text-white text-lg">{LEADERBOARD_RANKERS[1].score}</strong>
                  </div>
                  <span className="text-xs font-bold text-white/60">Rank: #2</span>
                </div>
              </div>

              {/* #1 Rank Card (Gold Centerpiece - Screenshot 3) */}
              <div className="rounded-2xl border-2 border-amber-400 bg-[#0f1422] p-6 space-y-3 relative overflow-hidden shadow-2xl shadow-amber-500/10 md:-translate-y-2">
                <div className="absolute top-2 right-2 text-3xl">🥇</div>
                <div className="flex items-center gap-3">
                  <img src={LEADERBOARD_RANKERS[0].avatar} alt="" className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400" />
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="font-black text-white text-base">{LEADERBOARD_RANKERS[0].name}</h4>
                      <span className="text-amber-400">👑</span>
                    </div>
                    <span className="text-[11px] text-amber-300 font-mono">{LEADERBOARD_RANKERS[0].handle}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-amber-300/60 block uppercase tracking-widest">Top C Score</span>
                    <strong className="text-amber-400 text-2xl">{LEADERBOARD_RANKERS[0].score}</strong>
                  </div>
                  <span className="text-xs font-black text-amber-400 bg-amber-400/20 px-2 py-1 rounded">Rank: #1</span>
                </div>
              </div>

              {/* #3 Rank Card (Bronze) */}
              <div className="rounded-2xl border border-white/10 bg-[#0b0d14] p-5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={LEADERBOARD_RANKERS[2].avatar} alt="" className="w-10 h-10 rounded-full bg-white/10" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{LEADERBOARD_RANKERS[2].name}</h4>
                      <span className="text-[11px] text-white/40 font-mono">{LEADERBOARD_RANKERS[2].handle}</span>
                    </div>
                  </div>
                  <span className="text-xl">🥉</span>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-white/40 block">C Score</span>
                    <strong className="text-white text-lg">{LEADERBOARD_RANKERS[2].score}</strong>
                  </div>
                  <span className="text-xs font-bold text-white/60">Rank: #3</span>
                </div>
              </div>

            </div>

            {/* Connect Platforms Banner (Screenshot 3) */}
            <div className="rounded-2xl border border-blue-500/30 bg-[#0b1020] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Plus size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Link your platforms to get ranked</h4>
                  <p className="text-xs text-white/50 mt-0.5">Connect LeetCode, Codeforces, and GitHub profiles to track cross-platform scores.</p>
                </div>
              </div>
              <Button
                onClick={() => setShowConnectModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 shrink-0"
              >
                Connect Platforms <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>

            {/* Global Ranking Table (Screenshot 3) */}
            <div className="rounded-2xl border border-white/10 bg-[#0b0d14] overflow-hidden">
              <div className="p-4 bg-white/[0.02] border-b border-white/10">
                <h3 className="font-bold text-white text-base">Global Ranking (Cumulative)</h3>
                <p className="text-xs text-white/50 mt-0.5">Ranks coders based on verified skill tests, DSA accuracy, and development challenges.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead className="bg-[#08090e] border-b border-white/10 text-white/50 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Rank</th>
                      <th className="p-4">User Name</th>
                      <th className="p-4">Institution / College</th>
                      <th className="p-4 text-right">C Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {LEADERBOARD_RANKERS.map((r) => (
                      <tr key={r.rank} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-mono font-bold">
                          {r.rank === 1 ? '🥇 #1' : r.rank === 2 ? '🥈 #2' : r.rank === 3 ? '🥉 #3' : `#${r.rank}`}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <img src={r.avatar} alt="" className="w-7 h-7 rounded-full bg-white/10" />
                            <div>
                              <div className="font-bold text-white">{r.name}</div>
                              <span className="text-[11px] text-white/40 font-mono">{r.handle}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-white/70 text-xs">{r.institution}</td>
                        <td className="p-4 text-right font-mono font-bold text-amber-400 text-sm">{r.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: MY SHEETS (Curriculum Checklist & Followed Roadmaps) */}
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

            {/* Followed Sheets Section */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white tracking-tight">Followed Sheets</h2>
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
                      View All Modules <ChevronRight size={13} />
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
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200"
                    >
                      Open Company Kits <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Sheets (Codolio Dotted Card Style) */}
            <div className="space-y-3.5">
              <h2 className="text-base font-bold text-white tracking-tight">Custom Sheets</h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSheetModal(true)}
                  className="rounded-xl border-2 border-dashed border-white/20 hover:border-amber-400/60 bg-white/[0.01] hover:bg-amber-400/[0.03] p-8 flex flex-col items-center justify-center gap-3 transition-all group min-h-[160px] cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 transition-transform group-hover:scale-110">
                    <Plus size={24} />
                  </div>
                  <span className="text-sm font-semibold text-white/80 group-hover:text-amber-300">
                    Create a new sheet
                  </span>
                </button>

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
            </div>

            {/* FULL 9-PILLAR ROADMAP TABLE WITH CLICKABLE LINKS */}
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

                      {/* Topic Rows with Clickable Links */}
                      <div className="divide-y divide-white/[0.04]">
                        {pillar.topics.map((item) => {
                          const isDone = stats.completed_topics?.includes(item.name);
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

        {/* ========================================================================= */}
        {/* VIEW 5: PORTFOLIO & VERIFIED CARD */}
        {/* ========================================================================= */}
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
        {/* VIEW 6: WORKSPACE & NOTES */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white">My Workspace & Scratchpad</h1>
            <p className="text-xs text-white/50">Write code solutions and technical notes.</p>
            <div className="rounded-xl border border-white/10 bg-[#0b0d14] p-4">
              <textarea
                rows={12}
                defaultValue="// 📝 LinktoCompany Code & Notes Scratchpad\n// Track your algorithm solutions, SQL notes, and interview prep here.\n\nfunction solve() {\n  console.log('Practicing DSA');\n}"
                className="w-full bg-[#07080c] p-3 text-white font-mono text-xs focus:outline-none rounded"
              />
            </div>
          </div>
        )}

        {/* VIEW 7: NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white">Interview Notes & Quick Revision</h1>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-white/70">
              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14] space-y-2">
                <h3 className="font-bold text-white text-sm">DSA Time Complexity Cheat Sheet</h3>
                <p>• Binary Search: O(log n)</p>
                <p>• MergeSort / QuickSort: O(n log n)</p>
                <p>• HashMap Lookup: O(1) avg</p>
                <p>• Graph BFS/DFS: O(V + E)</p>
              </div>
              <div className="p-5 rounded-xl border border-white/10 bg-[#0b0d14] space-y-2">
                <h3 className="font-bold text-white text-sm">ACID Properties in SQL</h3>
                <p>• Atomicity: All or nothing execution</p>
                <p>• Consistency: Preserves schema invariants</p>
                <p>• Isolation: Concurrent transactions do not conflict</p>
                <p>• Durability: Persists commits across power failure</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: TEACHER & RECRUITER INTERACTION */}
        {activeTab === 'interaction' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white">Teacher & Recruiter Interaction</h1>
            <p className="text-xs text-white/50">Scheduled technical interviews (Google Meet) & mentorship feedback.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-white/10 bg-[#0b0d14] p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-400" /> Scheduled Interviews ({stats.interviews?.length || 0})
                </h3>
                {stats.interviews?.length > 0 ? (
                  stats.interviews.map((iv) => (
                    <div key={iv.id} className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-emerald-400 font-bold">{iv.role_title}</span>
                        <span className="text-white/40">{iv.date_time}</span>
                      </div>
                      <div className="text-xs text-white/70">Company: <strong>{iv.company_name}</strong></div>
                      <a href={iv.meet_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold mt-1">
                        <Video size={12} /> Join Google Meet
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/40 py-3">No scheduled interviews yet. Score $\ge 80\%$ on quizzes to receive recruiter interview calls.</p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0b0d14] p-5 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-400" /> Mentor & Recruiter Notes
                </h3>
                {stats.endorsements?.length > 0 ? (
                  stats.endorsements.map((e) => (
                    <div key={e.id} className="p-3 rounded-lg border border-white/10 bg-black/30 space-y-1 text-xs">
                      <div className="font-bold text-white">{e.author_name} ({e.author_role})</div>
                      <p className="text-white/70">"{e.message}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/40 py-3">No mentorship feedback yet.</p>
                )}
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

      {/* CONNECT PLATFORMS MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f121a] border border-white/20 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-blue-400" /> Connect Coding Platforms
            </h3>
            <p className="text-xs text-white/50">Link your profiles to aggregate your ratings and rank on the global campus leaderboard.</p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-white/80">LeetCode Username</Label>
                <Input
                  value={platformHandles.leetcode}
                  onChange={(e) => setPlatformHandles({ ...platformHandles, leetcode: e.target.value })}
                  placeholder="e.g. tour_de_code"
                  className="bg-[#07080c] border-white/10 text-white mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-white/80">Codeforces Handle</Label>
                <Input
                  value={platformHandles.codeforces}
                  onChange={(e) => setPlatformHandles({ ...platformHandles, codeforces: e.target.value })}
                  placeholder="e.g. candidate_master"
                  className="bg-[#07080c] border-white/10 text-white mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-white/80">GitHub Profile URL</Label>
                <Input
                  value={platformHandles.github}
                  onChange={(e) => setPlatformHandles({ ...platformHandles, github: e.target.value })}
                  placeholder="https://github.com/your-username"
                  className="bg-[#07080c] border-white/10 text-white mt-1 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" onClick={() => setShowConnectModal(false)} className="flex-1 bg-white/10 text-white text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowConnectModal(false);
                  toast({ title: 'Platforms Connected!', description: 'Your coding ratings are now synced to the Leaderboard.' });
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
              >
                Save & Sync
              </Button>
            </div>
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
              <p>1. <strong>Track Coding Sheets:</strong> Click on Google, Amazon, Microsoft, or Meta to practice high-frequency interview patterns with live LeetCode links.</p>
              <p>2. <strong>Contest Calendar:</strong> Never miss a CodeChef, AtCoder, or company placement contest with 1-click subscription.</p>
              <p>3. <strong>Leaderboard:</strong> Connect platforms and compete with campus peers on verified trust scores.</p>
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
