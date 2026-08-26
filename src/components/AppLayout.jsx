import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Globe, Briefcase, Laptop, Layers, FileText, Edit3,
  Calendar, Trophy, HelpCircle, MessageSquare, User, LogOut,
  PanelLeft, Flame, Bell, Sparkles, X, ChevronRight, BookOpen,
  ShieldCheck, Zap, Star
} from 'lucide-react';
import { getSession, clearSession } from '../lib/api';

const AppLayout = ({ children, activeTab, onTabChange, stats }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = getSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const isNavActive = (tabKey, path) => {
    if (path && location.pathname === path) return true;
    if (activeTab === tabKey && location.pathname === '/dashboard') return true;
    return false;
  };

  const handleNavClick = (tabKey, path) => {
    setMobileMenuOpen(false);
    if (path) {
      navigate(path);
    } else {
      if (location.pathname !== '/dashboard') {
        navigate(`/dashboard?tab=${tabKey}`);
      } else if (onTabChange) {
        onTabChange(tabKey);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="h-[58px] bg-[#0b0d14] border-b border-white/10 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Sidebar Toggle + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors hidden md:block"
            title="Toggle Sidebar"
          >
            <PanelLeft size={18} />
          </button>
          
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors md:hidden"
          >
            <PanelLeft size={18} />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-600/20">
              L
            </div>
            <span className="font-display font-black text-white text-base tracking-tight hidden sm:inline">
              LinktoCompany
            </span>
          </Link>
        </div>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Company Wise Kit Pill Button */}
          <button
            type="button"
            onClick={() => handleNavClick('company-kit')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
          >
            <span>Company Wise Kit</span>
            <span className="text-amber-400">🌟</span>
            <ChevronRight size={13} />
          </button>

          {/* Streak Counter */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-bold">
            <Flame size={14} className="fill-orange-400" />
            <span>{stats?.completed_topics?.length > 0 ? '3' : '1'}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-white/5 text-white/70 hover:text-white transition-colors relative"
            >
              <Bell size={17} />
              {(stats?.notifications?.length > 0 || stats?.interviews?.length > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#0b0d14]"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0f121a] border border-white/10 shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Notifications</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Real-time</span>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {stats?.notifications?.length > 0 ? (
                    stats.notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                        <div className="font-semibold text-white">{n.title}</div>
                        <div className="text-white/60 text-[11px] mt-0.5">{n.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-white/40 text-center py-4">No new notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-white leading-tight">{(user?.name || 'Student').split(' ')[0]}</div>
              <div className="text-[10px] text-white/40 font-mono leading-tight">{user?.role || 'Student'}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR (Desktop) */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0 -ml-64'
          } transition-all duration-300 ease-in-out bg-[#0b0d14] border-r border-white/10 flex flex-col justify-between hidden md:flex shrink-0 select-none overflow-y-auto`}
        >
          <div className="p-3.5 space-y-6">
            
            {/* Top Single Link */}
            <SidebarItem
              icon={<Home size={16} />}
              label="Home"
              active={isNavActive('my-sheets')}
              onClick={() => handleNavClick('my-sheets')}
            />

            {/* SECTION 1: PROFILE TRACKER */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-white/30 tracking-[0.16em] uppercase font-mono">
                PROFILE TRACKER
              </div>
              <SidebarItem
                icon={<Globe size={16} />}
                label="Portfolio & Verified Card"
                active={isNavActive('portfolio')}
                onClick={() => handleNavClick('portfolio')}
              />
            </div>

            {/* SECTION 2: QUESTION & CURRICULUM TRACKER */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-white/30 tracking-[0.16em] uppercase font-mono">
                QUESTION TRACKER
              </div>
              <SidebarItem
                icon={<Briefcase size={16} />}
                label="Company Wise Kit"
                active={isNavActive('company-kit')}
                onClick={() => handleNavClick('company-kit')}
                badge="Hot"
              />
              <SidebarItem
                icon={<Laptop size={16} />}
                label="My Workspace"
                active={isNavActive('workspace')}
                onClick={() => handleNavClick('workspace')}
              />
              <SidebarItem
                icon={<Layers size={16} />}
                label="Explore Sheets"
                active={isNavActive('explore-sheets')}
                onClick={() => handleNavClick('explore-sheets')}
              />
              <SidebarItem
                icon={<FileText size={16} />}
                label="My Sheets (9 Pillars)"
                active={isNavActive('my-sheets')}
                onClick={() => handleNavClick('my-sheets')}
              />
              <SidebarItem
                icon={<Edit3 size={16} />}
                label="Notes & Cheatsheets"
                active={isNavActive('notes')}
                onClick={() => handleNavClick('notes')}
              />
            </div>

            {/* SECTION 3: EVENT TRACKER */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-white/30 tracking-[0.16em] uppercase font-mono">
                EVENT TRACKER
              </div>
              <SidebarItem
                icon={<Calendar size={16} />}
                label="Contests & Challenges"
                active={location.pathname === '/challenges'}
                onClick={() => handleNavClick(null, '/challenges')}
              />
              <SidebarItem
                icon={<ShieldCheck size={16} />}
                label="Skill Assessments Quiz"
                active={location.pathname === '/assessment'}
                onClick={() => handleNavClick(null, '/assessment')}
              />
            </div>

            {/* SECTION 4: COMMUNITY */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-white/30 tracking-[0.16em] uppercase font-mono">
                COMMUNITY
              </div>
              <SidebarItem
                icon={<Trophy size={16} />}
                label="Leaderboard"
                active={isNavActive('leaderboard')}
                onClick={() => handleNavClick('leaderboard')}
              />
              <SidebarItem
                icon={<MessageSquare size={16} />}
                label="Teacher & Recruiter"
                active={isNavActive('interaction')}
                onClick={() => handleNavClick('interaction')}
                badge={stats?.interviews?.length > 0 ? `${stats.interviews.length}` : null}
              />
            </div>

            {/* SECTION 5: SUPPORT */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-white/30 tracking-[0.16em] uppercase font-mono">
                SUPPORT
              </div>
              <SidebarItem
                icon={<HelpCircle size={16} />}
                label="Help Center"
                active={isNavActive('help')}
                onClick={() => handleNavClick('help')}
              />
              <SidebarItem
                icon={<MessageSquare size={16} />}
                label="Feedback"
                active={isNavActive('feedback')}
                onClick={() => handleNavClick('feedback')}
              />
            </div>
          </div>

          {/* SIDEBAR FOOTER */}
          <div className="p-3 border-t border-white/10 space-y-1 bg-[#090a10]">
            <SidebarItem
              icon={<User size={16} />}
              label="Edit Profile"
              active={isNavActive('profile')}
              onClick={() => handleNavClick('profile')}
            />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut size={16} className="text-red-400" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* MOBILE SIDEBAR MODAL */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 md:hidden flex">
            <div className="w-72 bg-[#0b0d14] h-full border-r border-white/10 p-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-sm">L</div>
                    <span className="font-bold text-white text-sm">LinktoCompany</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 p-1">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-1">
                  <SidebarItem icon={<Home size={16} />} label="Home" active={isNavActive('my-sheets')} onClick={() => handleNavClick('my-sheets')} />
                  <SidebarItem icon={<FileText size={16} />} label="My Sheets (9 Pillars)" active={isNavActive('my-sheets')} onClick={() => handleNavClick('my-sheets')} />
                  <SidebarItem icon={<Briefcase size={16} />} label="Company Wise Kit" active={isNavActive('company-kit')} onClick={() => handleNavClick('company-kit')} />
                  <SidebarItem icon={<Calendar size={16} />} label="Contests & Challenges" active={location.pathname === '/challenges'} onClick={() => handleNavClick(null, '/challenges')} />
                  <SidebarItem icon={<ShieldCheck size={16} />} label="Skill Assessments Quiz" active={location.pathname === '/assessment'} onClick={() => handleNavClick(null, '/assessment')} />
                  <SidebarItem icon={<Trophy size={16} />} label="Leaderboard" active={isNavActive('leaderboard')} onClick={() => handleNavClick('leaderboard')} />
                  <SidebarItem icon={<MessageSquare size={16} />} label="Teacher & Recruiter" active={isNavActive('interaction')} onClick={() => handleNavClick('interaction')} />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-xs text-red-400 font-semibold py-2"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#07080c] min-w-0">
          {children}
        </main>
      </div>

    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, badge }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
      active
        ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm'
        : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
    }`}
  >
    <div className="flex items-center gap-2.5 truncate">
      <span className={active ? 'text-blue-400' : 'text-white/50'}>{icon}</span>
      <span className="truncate">{label}</span>
    </div>
    {badge && (
      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
        {badge}
      </span>
    )}
  </button>
);

export default AppLayout;
