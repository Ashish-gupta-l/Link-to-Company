// Mock data for LinktoCompany platform

export const profileMock = {
  name: 'Ashish Gupta',
  title: 'Aspiring Full Stack Developer',
  trustScore: 78,
  skillReadiness: 62,
  challengesSolved: 7,
  verifiedSkillsCount: 3,
  verifiedSkills: [
    { name: 'JavaScript', level: '91%', proven: false },
    { name: 'React', level: '88%', proven: false },
    { name: 'MongoDB', level: 'Challenge proven', proven: true },
  ],
};

export const journeySteps = [
  {
    id: '01',
    icon: 'ShieldCheck',
    title: 'Verify',
    description: 'Assessments convert claimed skills into evidence-backed credentials.',
  },
  {
    id: '02',
    icon: 'Medal',
    title: 'Prove',
    description: 'Industry challenges rank students by practical execution, not keywords.',
  },
  {
    id: '03',
    icon: 'Bot',
    title: 'Improve',
    description: 'AI turns skill gaps into ordered learning, project, and challenge actions.',
  },
  {
    id: '04',
    icon: 'Briefcase',
    title: 'Connect',
    description: 'High scores trigger shortlists, interviews, mentorship, and internships.',
  },
];

export const portals = [
  {
    icon: 'Users',
    title: 'Students',
    description: 'Skill verification, portfolio, AI roadmap, challenges, recommendations.',
  },
  {
    icon: 'Building2',
    title: 'Companies',
    description: 'Post challenges, discover proven talent, automate interview shortlists.',
  },
  {
    icon: 'GraduationCap',
    title: 'Colleges',
    description: 'Track readiness, promote students, identify curriculum skill gaps.',
  },
  {
    icon: 'Route',
    title: 'Faculty',
    description: 'FDPs, consultancy, research collaboration, mentorship, live projects.',
  },
];

export const intelligenceFeatures = [
  {
    icon: 'Sparkles',
    title: 'AI Skill Gap Engine',
    description: 'Missing skills become a prioritized action plan tied to assessments and challenges.',
  },
  {
    icon: 'BarChart3',
    title: 'Skill Demand Intelligence',
    description: 'Live market demand informs student learning and college curriculum decisions.',
  },
  {
    icon: 'CircleCheck',
    title: 'Anti-Fake Assessment',
    description: 'Server-side attempts, attempt limits, audit trails, integrity scoring, and suspicious-event termination.',
  },
];

export const demoRoles = [
  { role: 'Admin', email: 'ashish.g.gupta25@slrtce.in', password: 'demo-admin-2026' },
  { role: 'Student', email: 'student.demo@slrtce.in', password: 'demo-student-2026' },
  { role: 'Company', email: 'recruiter@techvedika.in', password: 'demo-company-2026' },
  { role: 'College', email: 'tpo@slrtce.in', password: 'demo-college-2026' },
  { role: 'Faculty', email: 'faculty@slrtce.in', password: 'demo-faculty-2026' },
];

export const dashboardMock = {
  student: {
    name: 'Ashish Gupta',
    role: 'Student',
    trustScore: 78,
    skillReadiness: 62,
    verifiedSkills: 3,
    challengesSolved: 7,
    internships: 2,
    topSkill: { name: 'JavaScript', score: 91 },
    missingSkills: ['Node.js', 'MongoDB', 'REST APIs', 'Authentication', 'Docker'],
    actionPlan: [
      { step: 1, action: 'Learn Node.js fundamentals', status: 'in-progress' },
      { step: 2, action: 'Build REST API project', status: 'pending' },
      { step: 3, action: 'Learn MongoDB', status: 'pending' },
      { step: 4, action: 'Implement JWT authentication', status: 'pending' },
      { step: 5, action: 'Complete company challenge', status: 'pending' },
      { step: 6, action: 'Apply for matching internships', status: 'pending' },
    ],
    recommendedOpportunities: [
      {
        id: 1,
        title: 'Frontend Internship',
        company: 'TechVedika',
        match: 82,
        matchReasons: ['React', 'JavaScript', 'UI Development'],
        improve: ['API Integration', 'Testing'],
      },
      {
        id: 2,
        title: 'Full Stack Trainee',
        company: 'Innovex Labs',
        match: 74,
        matchReasons: ['React', 'MongoDB'],
        improve: ['Node.js', 'Docker'],
      },
      {
        id: 3,
        title: 'Data Engineering Intern',
        company: 'Datamind',
        match: 61,
        matchReasons: ['SQL', 'Python'],
        improve: ['Airflow', 'Spark'],
      },
    ],
    liveChallenges: [
      { id: 1, title: 'Build a Student Management API', company: 'TechVedika', category: 'Backend', deadline: '2 days', participants: 84 },
      { id: 2, title: 'Responsive Dashboard from JSON API', company: 'Innovex Labs', category: 'Frontend', deadline: '5 days', participants: 132 },
      { id: 3, title: 'Redesign a Checkout Flow', company: 'PixelForge', category: 'UI/UX', deadline: '7 days', participants: 46 },
    ],
  },
};
