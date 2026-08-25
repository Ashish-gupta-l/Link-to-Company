import React, { useEffect, useRef, useState } from 'react';
import { copilotApi } from '../lib/api';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';

const Copilot = () => {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem('ltc_copilot_session');
    if (existing) return existing;
    const s = `sess-${Date.now()}`;
    localStorage.setItem('ltc_copilot_session', s);
    return s;
  });
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    copilotApi.history(sessionId).then((r) => {
      const flat = [];
      r.messages.forEach((m) => {
        flat.push({ role: 'user', text: m.user_message });
        flat.push({ role: 'assistant', text: m.assistant_reply });
      });
      setMsgs(flat);
    }).catch(() => {});
  }, [open, sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text }]);
    setSending(true);
    try {
      const r = await copilotApi.chat(sessionId, text);
      setMsgs((m) => [...m, { role: 'assistant', text: r.reply }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: 'assistant', text: 'Sorry, the copilot is unavailable right now.' }]);
    } finally {
      setSending(false);
    }
  };

  const suggestions = [
    'Which skill should I learn next?',
    'Why am I not getting shortlisted?',
    'How can I improve my resume for a Full Stack role?',
    'Which project will boost my portfolio?',
  ];

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-semibold shadow-lg shadow-emerald-500/20">
          <Sparkles size={16} /> Ask Copilot
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[560px] rounded-2xl border border-white/10 bg-[#0b0d13] shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot size={16} />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">AI Career Copilot</div>
                <div className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Evidence-first advice</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white"><X size={18} /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {msgs.length === 0 && (
              <div className="space-y-3">
                <div className="text-white/70 text-sm">Hi. I use your verified skills and platform data to guide your next move. Try:</div>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => setInput(s)} className="block w-full text-left text-xs rounded-md border border-white/10 bg-[#0a0c11] hover:border-emerald-500/40 px-3 py-2 text-white/70">{s}</button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#0a0c11] border border-white/10 text-white/85'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 text-sm bg-[#0a0c11] border border-white/10 text-white/60 inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask about skills, roles, or roadmaps…" className="flex-1 rounded-md bg-[#0a0c11] border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400" />
              <button onClick={send} disabled={sending || !input.trim()} className="px-3 rounded-md bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Copilot;
