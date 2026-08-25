import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Copilot from './components/Copilot';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Challenges from './pages/Challenges';
import { Toaster } from './components/ui/toaster';
import { getSession } from './lib/api';

const Protected = ({ children }) => {
  const { user } = getSession();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const Shell = () => {
  const location = useLocation();
  const hideChrome = location.pathname === '/auth';
  const authed = !!getSession().user;
  const inApp = ['/dashboard', '/assessment', '/challenges'].some((p) => location.pathname.startsWith(p));

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <>
      {!hideChrome && <Header />}
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
    <div className="App">
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </div>
  );
}

export default App;
