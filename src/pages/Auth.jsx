import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Mail, ShieldCheck, CheckCircle2,
  Lock, Eye, EyeOff, KeyRound, Sparkles
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { authApi, saveSession } from '../lib/api';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // View Mode: 'auth' (Tabs for Sign In / Register) | 'forgot-password'
  const [authMode, setAuthMode] = useState('auth');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('Student');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regOtp, setRegOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password Recovery State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotSendingOtp, setForgotSendingOtp] = useState(false);
  const [forgotResetting, setForgotResetting] = useState(false);

  const handleSendOtp = async () => {
    if (!regEmail || !regEmail.includes('@') || !regEmail.includes('.')) {
      toast({ title: 'Invalid Email', description: 'Please enter a valid real email address (e.g. name@gmail.com).', variant: 'destructive' });
      return;
    }
    setSendingOtp(true);
    try {
      const res = await authApi.sendOtp(regEmail, regName);
      setOtpSent(true);
      if (res.email_delivered) {
        toast({
          title: 'OTP Sent to Your Email!',
          description: `Check your Gmail inbox and spam folder at ${regEmail} for the 6-digit code.`,
        });
      } else {
        toast({
          title: 'Verification Code Dispatched',
          description: `OTP dispatched to ${regEmail}. Please check your email.`,
        });
      }
    } catch (err) {
      toast({
        title: 'Failed to Send Email OTP',
        description: err?.response?.data?.detail || 'Please check email address and try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please enter your registered email and password.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      saveSession(res.token, res.user);
      toast({ title: 'Signed In', description: `Welcome back, ${res.user.name}` });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Login Failed', description: err?.response?.data?.detail || 'Invalid email or password. Please register first.', variant: 'destructive' });
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
    if (!otpSent || !regOtp || regOtp.trim().length !== 6) {
      toast({ title: 'Email Verification Required', description: 'Please click "Send OTP" and enter the 6-digit verification code sent to your email inbox.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        otp: regOtp.trim()
      });
      saveSession(res.token, res.user);
      toast({ title: 'Account Verified & Created!', description: `Welcome to LinktoCompany, ${res.user.name}` });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Verification Failed', description: err?.response?.data?.detail || 'Incorrect or expired OTP code.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Google-Style Forgot Password Flow Handlers
  const handleForgotSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@') || !forgotEmail.includes('.')) {
      toast({ title: 'Invalid Email', description: 'Please enter your registered email address.', variant: 'destructive' });
      return;
    }
    setForgotSendingOtp(true);
    try {
      const res = await authApi.forgotPasswordSendOtp(forgotEmail.trim());
      setForgotOtpSent(true);
      toast({
        title: 'Recovery Code Dispatched! ✉️',
        description: `We've sent a 6-digit recovery code to ${forgotEmail}. Please check your inbox.`
      });
    } catch (err) {
      toast({
        title: 'Recovery Request Failed',
        description: err?.response?.data?.detail || 'No account found with this email.',
        variant: 'destructive'
      });
    } finally {
      setForgotSendingOtp(false);
    }
  };

  const handleForgotReset = async (e) => {
    if (e) e.preventDefault();
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      toast({ title: 'OTP Required', description: 'Please enter the 6-digit code sent to your email.', variant: 'destructive' });
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      toast({ title: 'Password Too Short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast({ title: 'Passwords Do Not Match', description: 'Please ensure both passwords match.', variant: 'destructive' });
      return;
    }
    setForgotResetting(true);
    try {
      const res = await authApi.forgotPasswordReset({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        new_password: forgotNewPassword
      });
      saveSession(res.token, res.user);
      toast({
        title: 'Password Successfully Reset! 🚀',
        description: `Welcome back, ${res.user.name}`
      });
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: 'Password Reset Failed',
        description: err?.response?.data?.detail || 'Invalid or expired OTP code.',
        variant: 'destructive'
      });
    } finally {
      setForgotResetting(false);
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
              LinktoCompany strictly enforces <strong>real-email inbox identity verification</strong>. Fake candidate profiles and disposable accounts are blocked.
            </p>

            <div className="mt-8 space-y-3 max-w-md">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-[#0b0d13]">
                <Mail className="text-emerald-400 shrink-0" size={20} />
                <div>
                  <div className="text-sm font-semibold text-white">Live Email Inbox Delivery</div>
                  <div className="text-xs text-white/50 mt-0.5">Secure 6-digit one-time code delivered to your verified email inbox.</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-[#0b0d13]">
                <ShieldCheck className="text-blue-400 shrink-0" size={20} />
                <div>
                  <div className="text-sm font-semibold text-white">Verified Identity Guard</div>
                  <div className="text-xs text-white/50 mt-0.5">Skill assessments, trust scores, and challenge submissions are locked to your verified identity.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Card */}
          <div>
            <div className="rounded-2xl border border-white/10 bg-[#0b0d13] p-7 shadow-2xl">
              
              {/* VIEW 1: NORMAL SIGN IN / REGISTER TABS */}
              {authMode === 'auth' ? (
                <>
                  <h2 className="font-display font-black text-white text-2xl">Access LinktoCompany</h2>
                  <p className="text-white/50 text-sm mt-1">Sign in with your verified credentials or create a new account.</p>

                  <Tabs defaultValue="login" className="mt-6">
                    <TabsList className="w-full grid grid-cols-2 bg-[#0a0c11] border border-white/10 p-1 rounded-xl">
                      <TabsTrigger value="login" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 text-xs">
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger value="register" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 text-xs">
                        Register with Email
                      </TabsTrigger>
                    </TabsList>

                    {/* LOGIN TAB */}
                    <TabsContent value="login" className="mt-5">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <Label className="text-white/80 text-xs">Your Registered Email</Label>
                          <div className="relative mt-1.5">
                            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <Input
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              type="email"
                              placeholder="you@gmail.com"
                              required
                              className="pl-9 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30 text-xs h-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-white/80 text-xs">Password</Label>
                          <div className="relative mt-1.5">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <Input
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              required
                              className="pl-9 pr-10 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30 text-xs h-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 cursor-pointer"
                              title={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>

                          {/* GOOGLE-STYLE FORGOT PASSWORD LINK */}
                          <div className="flex justify-end mt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setForgotEmail(email || '');
                                setForgotOtpSent(false);
                                setForgotOtp('');
                                setForgotNewPassword('');
                                setForgotConfirmPassword('');
                                setAuthMode('forgot-password');
                              }}
                              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
                            >
                              Forgot Password?
                            </button>
                          </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 text-xs cursor-pointer shadow-lg shadow-blue-600/20">
                          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In Securely'}
                        </Button>
                      </form>
                    </TabsContent>

                    {/* REGISTER TAB */}
                    <TabsContent value="register" className="mt-5">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                          <Label className="text-white/80 text-xs">Full Name</Label>
                          <Input
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Your full name"
                            required
                            className="mt-1.5 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30 text-xs h-10"
                          />
                        </div>

                        <div>
                          <Label className="text-white/80 text-xs">Real Email Address</Label>
                          <div className="flex gap-2 mt-1.5">
                            <div className="relative flex-1">
                              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                              <Input
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                type="email"
                                placeholder="your.real.email@gmail.com"
                                required
                                className="pl-9 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30 text-xs h-10"
                              />
                            </div>
                            <Button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={sendingOtp || !regEmail}
                              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs px-3 font-mono shrink-0 h-10 cursor-pointer"
                            >
                              {sendingOtp ? <Loader2 size={14} className="animate-spin" /> : (otpSent ? 'Resend OTP' : 'Send OTP')}
                            </Button>
                          </div>
                        </div>

                        {otpSent && (
                          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                              <CheckCircle2 size={15} /> 6-digit OTP code sent to {regEmail}
                            </div>
                            <Label className="text-xs text-white/90">Enter 6-Digit Email OTP *</Label>
                            <Input
                              value={regOtp}
                              onChange={(e) => setRegOtp(e.target.value)}
                              placeholder="123456"
                              maxLength={6}
                              required
                              className="bg-[#0a0c11] border-white/20 text-white font-mono text-center tracking-widest text-lg font-bold h-11"
                            />
                            <div className="text-[11px] text-white/50">
                              Please check your email inbox (and spam folder) for the verification code.
                            </div>
                          </div>
                        )}

                        <div>
                          <Label className="text-white/80 text-xs">Account Role</Label>
                          <select
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value)}
                            className="mt-1.5 w-full bg-[#0a0c11] border border-white/10 rounded-md px-3 py-2 text-white text-xs h-10 focus:outline-none focus:border-emerald-400"
                          >
                            <option value="Student">Student (Job seeker, skill verification)</option>
                            <option value="Company">Company (Recruiter, post challenges)</option>
                            <option value="College">College (TPO, track readiness)</option>
                            <option value="Faculty">Faculty (Mentorship, FDPs)</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-white/80 text-xs">Password</Label>
                          <div className="relative mt-1.5">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <Input
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              type={showRegPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              required
                              className="pl-9 pr-10 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30 text-xs h-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 cursor-pointer"
                            >
                              {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <Button type="submit" disabled={loading || !otpSent} className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-semibold py-2.5 text-xs cursor-pointer shadow-lg shadow-emerald-500/20">
                          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify OTP & Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                /* VIEW 2: GOOGLE-STYLE ACCOUNT RECOVERY / FORGOT PASSWORD */
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <KeyRound size={20} />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-white text-xl">Account Recovery</h2>
                        <p className="text-white/50 text-xs">Reset your password using a secure 6-digit email OTP.</p>
                      </div>
                    </div>
                  </div>

                  {!forgotOtpSent ? (
                    /* Step 1: Send Recovery OTP */
                    <form onSubmit={handleForgotSendOtp} className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                        Enter the email associated with your LinktoCompany account. We will dispatch a 6-digit verification code to your inbox.
                      </div>

                      <div>
                        <Label className="text-white/80 text-xs">Your Registered Email Address</Label>
                        <div className="relative mt-1.5">
                          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <Input
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            type="email"
                            placeholder="you@gmail.com"
                            required
                            className="pl-9 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30 text-xs h-10"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={forgotSendingOtp || !forgotEmail}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
                      >
                        {forgotSendingOtp ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <Mail size={15} className="mr-1.5" />}
                        Send Recovery Code
                      </Button>
                    </form>
                  ) : (
                    /* Step 2: Enter OTP & Set New Password */
                    <form onSubmit={handleForgotReset} className="space-y-4">
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                        <div className="text-emerald-300 font-mono flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Code sent to {forgotEmail}
                        </div>
                        <button
                          type="button"
                          onClick={handleForgotSendOtp}
                          disabled={forgotSendingOtp}
                          className="text-[11px] text-cyan-400 hover:underline font-mono cursor-pointer"
                        >
                          {forgotSendingOtp ? 'Sending...' : 'Resend Code'}
                        </button>
                      </div>

                      <div>
                        <Label className="text-white/80 text-xs">6-Digit Recovery OTP Code *</Label>
                        <Input
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          required
                          className="mt-1.5 bg-[#0a0c11] border-white/20 text-white font-mono text-center tracking-widest text-lg font-bold h-11"
                        />
                      </div>

                      <div>
                        <Label className="text-white/80 text-xs">New Password (min. 6 chars)</Label>
                        <div className="relative mt-1.5">
                          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <Input
                            value={forgotNewPassword}
                            onChange={(e) => setForgotNewPassword(e.target.value)}
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            required
                            className="pl-9 pr-10 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30 text-xs h-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white/80 text-xs">Confirm New Password</Label>
                        <div className="relative mt-1.5">
                          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <Input
                            value={forgotConfirmPassword}
                            onChange={(e) => setForgotConfirmPassword(e.target.value)}
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            required
                            className="pl-9 bg-[#0a0c11] border-white/10 text-white placeholder:text-white/30 text-xs h-10"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={forgotResetting}
                        className="w-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold py-2.5 text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
                      >
                        {forgotResetting ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <ShieldCheck size={16} className="mr-1.5" />}
                        Reset Password & Sign In
                      </Button>
                    </form>
                  )}

                  {/* Back to Sign In Link */}
                  <div className="pt-2 text-center border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setAuthMode('auth')}
                      className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white font-medium transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={13} /> Back to Sign In
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
