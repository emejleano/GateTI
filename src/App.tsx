import { useState, useEffect } from 'react';
import { User } from './types';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Home from './components/Home';
import LombaPage from './components/LombaPage';
import BeasiswaPage from './components/BeasiswaPage';
import WebinarPage from './components/WebinarPage';
import SertifikasiPage from './components/SertifikasiPage';
import ProfilePage from './components/ProfilePage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Load session synchronously to avoid layout flashes on load
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('gate_ti_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        localStorage.removeItem('gate_ti_user');
      }
    }
    return null;
  });

  const [currentPage, setCurrentPage] = useState<string>(() => {
    const savedUser = localStorage.getItem('gate_ti_user');
    if (!savedUser) {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#/admin/login' || hash === '#admin/login') {
        return 'admin-login';
      }
      return 'login';
    }
    return 'home';
  });

  // Secure URL hash change listener with page protection "login dulu baru dapet akses"
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      
      if (hash === '#/admin/login' || hash === '#admin/login') {
        setCurrentPage('admin-login');
      } else if (!currentUser) {
        // Force authentication view for students before displaying portal hubs
        setCurrentPage('login');
      } else {
        if (hash === '#/admin/dashboard' || hash === '#admin/dashboard') {
          setCurrentPage('admin-dashboard');
        } else if (hash === '#/lomba' || hash === '#lomba') {
          setCurrentPage('lomba');
        } else if (hash === '#/beasiswa' || hash === '#beasiswa') {
          setCurrentPage('beasiswa');
        } else if (hash === '#/webinar' || hash === '#webinar') {
          setCurrentPage('webinar');
        } else if (hash === '#/sertifikasi' || hash === '#sertifikasi') {
          setCurrentPage('sertifikasi');
        } else if (hash === '#/profile' || hash === '#profile') {
          setCurrentPage('profile');
        } else if (hash === '#/home' || hash === '#home' || !hash) {
          setCurrentPage('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial load or direct browser hit
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // Safe programmatic routing helper
  const handleNavigate = (page: string) => {
    if (page === 'home') window.location.hash = '#home';
    else if (page === 'lomba') window.location.hash = '#lomba';
    else if (page === 'beasiswa') window.location.hash = '#beasiswa';
    else if (page === 'webinar') window.location.hash = '#webinar';
    else if (page === 'sertifikasi') window.location.hash = '#sertifikasi';
    else if (page === 'profile') window.location.hash = '#profile';
    else if (page === 'admin-login') window.location.hash = '#/admin/login';
    else if (page === 'admin-dashboard') window.location.hash = '#/admin/dashboard';
    else if (page === 'login') {
      setCurrentPage('login');
      window.location.hash = '';
    } else {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('gate_ti_user', JSON.stringify(user));
    
    // Redirect to matching portal
    if (user.role === 'admin') {
      handleNavigate('admin-dashboard');
    } else {
      handleNavigate('home');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gate_ti_user');
    setCurrentPage('login');
    window.location.hash = '';
  };

  // Render the current view
  const renderView = () => {
    // Strict safety guard: guests can only access student or admin login
    if (!currentUser) {
      if (currentPage === 'admin-login') {
        return <AdminLogin onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      }
      return <Login onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      case 'admin-login':
        return <AdminLogin onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        if (currentUser.role !== 'admin') {
          return <AdminLogin onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
        }
        return <AdminDashboard currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'lomba':
        return <LombaPage onNavigate={handleNavigate} initialViewMode="landing" />;
      case 'beasiswa':
        return <BeasiswaPage onNavigate={handleNavigate} initialViewMode="landing" />;
      case 'webinar':
        return <WebinarPage onNavigate={handleNavigate} initialViewMode="landing" />;
      case 'sertifikasi':
        return <SertifikasiPage onNavigate={handleNavigate} initialViewMode="landing" />;
      case 'profile':
        return <ProfilePage currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'home':
      default:
        return <Home onNavigate={handleNavigate} subTab="home" />;
    }
  };

  // Show navigation bar ONLY after successful login and not on auth screens
  const showNavbar = currentUser !== null && currentPage !== 'login' && currentPage !== 'admin-login';

  return (
    <div className="flex min-h-screen flex-col bg-slate-55 select-none" id="applet-portal-viewport">
      {showNavbar && (
        <Navbar 
          activePage={currentPage} 
          onNavigate={handleNavigate} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />
      )}
      <main className="flex-1 bg-[#f8fafc]">
        {renderView()}
      </main>
    </div>
  );
}
