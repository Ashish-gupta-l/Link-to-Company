import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getSession, clearSession } from '../lib/api';

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = getSession();
  const inApp = ['/dashboard', '/assessment', '/challenges'].some((p) => location.pathname.startsWith(p));
  const isDashboard = inApp;
  const signOut = () => { clearSession(); navigate('/'); };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#050508]/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-[62px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/20">L</div>
          <div className="leading-tight">
            <div className="font-display font-black text-white text-[15px] tracking-tight">LinktoCompany</div>
            <div className="text-[10px] tracking-[0.18em] text-white/40 font-mono uppercase">Skill Proof Network</div>
          </div>
        </Link>

        {!isDashboard && (
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
            <Link to="/challenges" className="hover:text-emerald-400 font-medium transition-colors flex items-center gap-1.5">
              <span>Challenges & Skill Match</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">New</span>
            </Link>
            <Link to="/assessment" className="hover:text-white transition-colors">Skill Assessments</Link>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#portals" className="hover:text-white transition-colors">Portals</a>
          </nav>
        )}

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="px-5 py-2 rounded-md bg-emerald-400 hover:bg-emerald-300 transition-colors text-black text-sm font-semibold">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/auth" className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium">
              Login / Sign Up
            </Link>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-white">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && !isDashboard && (
        <div className="md:hidden border-t border-white/5 bg-[#050508] px-6 py-4 space-y-3 text-sm text-white/70">
          <a href="#how-it-works" onClick={() => setOpen(false)} className="block">How it works</a>
          <a href="#portals" onClick={() => setOpen(false)} className="block">Portals</a>
          <a href="#intelligence" onClick={() => setOpen(false)} className="block">Intelligence</a>
          <Link to="/auth" onClick={() => setOpen(false)} className="block bg-blue-600 text-white text-center py-2 rounded-md">Login</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
