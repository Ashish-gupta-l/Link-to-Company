import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#050508]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center font-black text-white text-lg">L</div>
              <div className="leading-tight">
                <div className="font-display font-black text-white text-[15px] tracking-tight">LinktoCompany</div>
                <div className="text-[10px] tracking-[0.18em] text-white/40 font-mono uppercase">Skill Proof Network</div>
              </div>
            </div>
            <p className="text-white/50 text-sm max-w-md leading-relaxed">
              A unified, evidence-first talent graph connecting students, colleges, companies, and faculty through verified skills and real industry challenges.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SIH 2026 · Prototype build
            </div>
          </div>

          <div>
            <div className="text-white font-semibold text-sm mb-4">Product</div>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#portals" className="hover:text-white transition-colors">Portals</a></li>
              <li><a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Access platform</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold text-sm mb-4">Ecosystem</div>
            <ul className="space-y-2 text-sm text-white/50">
              <li>Students</li>
              <li>Companies</li>
              <li>Colleges</li>
              <li>Faculty</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-xs text-white/40 font-mono">© 2026 LinktoCompany · Built for Smart India Hackathon</div>
          <div className="text-xs text-white/40 font-mono">Proof over claims · Skills over keywords</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
