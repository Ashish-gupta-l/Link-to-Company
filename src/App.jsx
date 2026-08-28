import React, { useEffect, Component } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Copilot from './components/Copilot';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Challenges from './pages/Challenges';
import { Toaster } from './components/ui/toaster';
import { getSession, clearSession } from './lib/api';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LinktoCompany ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    clearSession();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080c] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl font-bold mb-4">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-xs text-white/50 max-w-md mb-3">
            An unexpected error occurred while loading this view. You can reload the page or reset your session.
          </p>
          {this.state.error?.message && (
            <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[11px] max-w-md break-all">
              {this.state.error.message}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
            >
              Reset Session & Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Protected = ({ children }) => {
  const session = getSession();
  if (!session?.user) return <Navigate to="/auth" replace />;
  return children;
};

const Shell = () => {
  const location = useLocation();
  const hideChrome = location.pathname === '/auth';
  const session = getSession();
  const authed = !!session?.user;
  const inApp = ['/dashboard', '/assessment', '/challenges'].some((p) => location.pathname.startsWith(p));

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <>
      {!hideChrome && !inApp && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/assessment" element={<Protected><Assessment /></Protected>} />
        <Route path="/challenges" element={<Protected><Challenges /></Protected>} />
      </Routes>
      {!hideChrome && !inApp && <Footer />}
      {authed && inApp && <Copilot />}
      <Toaster />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </div>
    </ErrorBoundary>
  );
}

export default App;
