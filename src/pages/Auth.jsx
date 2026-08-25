import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Loader2, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
  
  // Login State (clean, empty by default)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Student');
  const [regPassword, setRegPassword] = useState('');
  const [regOtp, setRegOtp] = useState('');
  
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemoPresets, setShowDemoPresets] = useState(false);

  const seedRole = (r) => {
    setEmail(r.email);
    setPassword(r.password);
    toast({ title: `Seeded ${r.role} Account`, description: r.email });
  };

  const handleSendOtp = async () => {
    if (!regEmail || !regEmail.includes('@')) {
      toast({ title: 'Invalid Email', description: 'Please enter a valid email address first.', variant: 'destructive' });
      return;
    }
    setSendingOtp(true);
    try {
      const res = await authApi.sendOtp(regEmail, regName);
      setOtpSent(true);
      if (res.dev_otp) {
        toast({ title: 'Verification Code Sent!', description: `OTP: ${res.dev_otp} (Sent to ${regEmail})` });
      } else {
        toast({ title: 'Verification Email Sent!', description: `Check your inbox at ${regEmail} for the 6-digit OTP code.` });
      }
    } catch (err) {
      toast({ title: 'Error sending OTP', description: err?.response?.data?.detail || 'Failed to send verification email.', variant: 'destructive' });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please enter your email and password.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      saveSession(res.token, res.user);
      toast({ title: 'Signed in', description: `Welcome back, ${res.user.name} (${res.user.role})` });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Login failed', description: err?.response?.data?.detail || 'Check your email and password.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        otp: regOtp || undefined
      });
      saveSession(res.token, res.user);
      toast({ title: 'Account Verified & Created!', description: `Welcome to LinktoCompany, ${res.user.name}` });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Registration failed', description: err?.response?.data?.detail || 'Try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_20%,rgba(37,99,235,0.12),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(34,197,94,0.08),transparent_60%)]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mt-8">
          {/* Left Info Panel */}
          <div>
            <div className="w-11 h-11 rounded-md bg-blue-600 flex items-center justify-center font-black text-white text-lg mb-8 shadow-lg shadow-blue-600/20">L</div>
            <h1 className="font-display font-black text-white text-5xl md:text-6xl leading-[0.95]">
              Real evidence.<br />
              <span className="text-blue-500">Verified access.</span>
            </h1>
            <p className="text-white/55 mt-6 max-w-md leading-relaxed">
              Sign up with your <strong>real email address</strong> to build your permanent verified talent profile, earn assessment badges, and get direct recruiter interviews.
            </p>

            {/* Email verification feature bullet points */}
            <div className="mt-8 space-y-3 max-w-md">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-[#0b0d13]">
                <Mail className="text-emerald-400 shrink-0" size={18} />
                <div className="text-xs text-white/70">
                  <span className="font-semibold text-white">Live Email Verification:</span> 6-digit OTP delivered directly to your inbox.
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-[#0b0d13]">
                <ShieldCheck className="text-blue-400 shrink-0" size={18} />
                <div className="text-xs text-white/70">
                  <span className="font-semibold text-white">Secure JWT Tokens:</span> Role-aware dashboards for Students, Companies, Colleges, and Faculty.
                </div>
              </div>
            </div>

            {/* Quick Demo Presets Toggle */}
            <div className="mt-8 max-w-md">
              <button
                type="button"
                onClick={() => setShowDemoPresets(!showDemoPresets)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5 font-mono"
              >
                <KeyRound size={13} /> {showDemoPresets ? 'Hide Hackathon Demo Presets' : 'Need quick Hackathon Demo Accounts? Click here'}
              </button>

              {showDemoPresets && (
                <div className="mt-3 space-y-2">
                  {demoRoles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => seedRole(r)}
                      className="w-full flex items-center justify-between rounded-md border border-white/10 bg-[#0b0d13] hover:border-emerald-500/40 hover:bg-[#0e1218] transition-all px-4 py-2.5 text-left"
                    >
                      <div>
                        <div className="text-white font-semibold text-xs">{r.role}</div>
                        <div className="text-white/40 text-[11px] font-mono">{r.email}</div>
                      </div>
                      <KeyRound size={14} className="text-emerald-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Auth Card */}
          <div>
            <div className="rounded-xl border border-white/10 bg-[#0b0d13] p-7 shadow-2xl">
              <h2 className="font-display font-black text-white text-2xl">Access LinktoCompany</h2>
              <p className="text-white/50 text-sm mt-1">Sign in with your email or register a new verified account.</p>

              <Tabs defaultValue="login" className="mt-6">
                <TabsList className="w-full grid grid-cols-2 bg-[#0a0c11] border border-white/10 p-1">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">
                    Register with Email
                  </TabsTrigger>
                </TabsList>

                {/* LOGIN TAB */}
                <TabsContent value="login" className="mt-5">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label className="text-white/80">Your Email Address</Label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="mt-2 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Password</Label>
                      <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        required
                        className="mt-2 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In Securely'}
                    </Button>
                  </form>
                </TabsContent>

                {/* REGISTER TAB */}
                <TabsContent value="register" className="mt-5">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label className="text-white/80">Full Name</Label>
                      <Input
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Ashish Gupta"
                        required
                        className="mt-2 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div>
                      <Label className="text-white/80">Real Email Address</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          type="email"
                          placeholder="your.real.email@gmail.com"
                          required
                          className="bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30 flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={sendingOtp || !regEmail}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs px-3 font-mono shrink-0"
                        >
                          {sendingOtp ? <Loader2 size={14} className="animate-spin" /> : (otpSent ? 'Resend OTP' : 'Send OTP')}
                        </Button>
                      </div>
                    </div>

                    {otpSent && (
                      <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-2">
                          <CheckCircle2 size={14} /> Verification OTP sent to {regEmail}
                        </div>
                        <Label className="text-xs text-white/80">Enter 6-Digit Email OTP</Label>
                        <Input
                          value={regOtp}
                          onChange={(e) => setRegOtp(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="mt-1 bg-[#0a0c11] border-white/10 text-white font-mono text-center tracking-widest text-lg"
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-white/80">Account Role</Label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="mt-2 w-full bg-[#0a0c11] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-400"
                      >
                        <option value="Student">Student (Job seeker, take assessments, solve challenges)</option>
                        <option value="Company">Company (Recruiter, post challenges, review talent)</option>
                        <option value="College">College (TPO, track student readiness & metrics)</option>
                        <option value="Faculty">Faculty (Mentorship, FDPs & research collaboration)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-white/80">Create Password</Label>
                      <Input
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        required
                        className="mt-2 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-emerald-400 hover:bg-emerald-300 text-black font-semibold py-2.5">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Verified Account'}
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
