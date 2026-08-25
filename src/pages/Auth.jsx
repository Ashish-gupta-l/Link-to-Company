import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { authApi, saveSession } from '../lib/api';

const demoRoles = [
  { role: 'Admin', email: 'ashish.g.gupta25@slrtce.in', password: 'demo-admin-2026' },
  { role: 'Student', email: 'student.demo@slrtce.in', password: 'demo-student-2026' },
  { role: 'Company', email: 'recruiter@techvedika.in', password: 'demo-company-2026' },
  { role: 'College', email: 'tpo@slrtce.in', password: 'demo-college-2026' },
  { role: 'Faculty', email: 'faculty@slrtce.in', password: 'demo-faculty-2026' },
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('student.demo@slrtce.in');
  const [password, setPassword] = useState('demo-student-2026');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Student');
  const [regPassword, setRegPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const seedRole = (r) => { setEmail(r.email); setPassword(r.password); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      saveSession(res.token, res.user);
      toast({ title: 'Signed in', description: `Welcome to LinktoCompany · ${res.user.role}` });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Login failed', description: err?.response?.data?.detail || 'Check credentials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast({ title: 'Missing fields', description: 'Fill all fields to register.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ name: regName, email: regEmail, password: regPassword, role: regRole });
      saveSession(res.token, res.user);
      toast({ title: 'Account created', description: `Welcome, ${res.user.name}` });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Register failed', description: err?.response?.data?.detail || 'Try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_20%,rgba(37,99,235,0.12),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(34,197,94,0.08),transparent_60%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mt-8">
          <div>
            <div className="w-11 h-11 rounded-md bg-blue-600 flex items-center justify-center font-black text-white text-lg mb-8">L</div>
            <h1 className="font-display font-black text-white text-5xl md:text-6xl leading-[0.95]">Evidence-first access.</h1>
            <p className="text-white/55 mt-6 max-w-md leading-relaxed">
              Login with a seeded SIH demo role or create an account. Real JWT authentication with role-aware dashboards.
            </p>

            <div className="mt-8 space-y-2 max-w-md">
              {demoRoles.map((r) => (
                <button key={r.role} onClick={() => seedRole(r)} className="w-full flex items-center justify-between rounded-md border border-white/10 bg-[#0b0d13] hover:border-emerald-500/40 hover:bg-[#0e1218] transition-all px-4 py-3 text-left">
                  <div>
                    <div className="text-white font-semibold text-sm">{r.role}</div>
                    <div className="text-white/40 text-xs font-mono mt-0.5">{r.email}</div>
                  </div>
                  <KeyRound size={16} className="text-emerald-400" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-7">
              <h2 className="font-display font-black text-white text-2xl">Access LinktoCompany</h2>
              <p className="text-white/50 text-sm mt-1">Secure JWT authentication with role-aware dashboards.</p>

              <Tabs defaultValue="login" className="mt-6">
                <TabsList className="w-full grid grid-cols-2 bg-[#0a0c11] border border-white/10 p-1">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-white/60">Login</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-white/60">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-5">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div><Label className="text-white/80">Email</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 bg-[#0a0c11] border-white/10 text-white" /></div>
                    <div><Label className="text-white/80">Password</Label>
                      <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2 bg-[#0a0c11] border-white/10 text-white" /></div>
                    <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Login securely'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-5">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div><Label className="text-white/80">Full name</Label><Input value={regName} onChange={(e) => setRegName(e.target.value)} className="mt-2 bg-[#0a0c11] border-white/10 text-white" /></div>
                    <div><Label className="text-white/80">Email</Label><Input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} type="email" className="mt-2 bg-[#0a0c11] border-white/10 text-white" /></div>
                    <div><Label className="text-white/80">Role</Label>
                      <select value={regRole} onChange={(e) => setRegRole(e.target.value)} className="mt-2 w-full bg-[#0a0c11] border border-white/10 rounded-md px-3 py-2 text-white text-sm">
                        {['Student', 'Company', 'College', 'Faculty'].map((r) => <option key={r} value={r}>{r}</option>)}
                      </select></div>
                    <div><Label className="text-white/80">Password</Label><Input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} type="password" className="mt-2 bg-[#0a0c11] border-white/10 text-white" /></div>
                    <Button type="submit" disabled={loading} className="w-full bg-emerald-400 hover:bg-emerald-300 text-black font-semibold">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
