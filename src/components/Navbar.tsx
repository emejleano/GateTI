import { User as UserIcon, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { User } from '../types';
import logoGateTi from '../image/logo_gateTi.png';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Navbar({ activePage, onNavigate, currentUser, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex cursor-pointer items-center space-x-3 transition hover:opacity-90"
          id="nav-logo-group"
        >
          <img src={logoGateTi} alt="GateTI Logo" className="h-14 w-auto object-contain" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden space-x-1 md:flex">
          {[
            { id: 'home', label: 'HOME' },
            { id: 'lomba', label: 'Lomba' },
            { id: 'beasiswa', label: 'Beasiswa' },
            { id: 'webinar', label: 'Webinar' },
            { id: 'sertifikasi', label: 'Sertifikasi' },
          ].map((item) => {
            const isActive = activePage === item.id || 
              (item.id === 'lomba' && activePage === 'prestasi') ||
              (item.id === 'lomba' && activePage === 'lomba-details') ||
              (item.id === 'beasiswa' && activePage === 'beasiswa-details') ||
              (item.id === 'webinar' && activePage === 'webinar-details');
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Session Action Area */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="relative group flex items-center space-x-2">
              
              {/* Profile Shortcut Button */}
              <button
                id="nav-profile-btn"
                onClick={() => onNavigate('profile')}
                className={`flex items-center space-x-2 rounded-full p-1 border transition ${
                  activePage === 'profile' 
                    ? 'border-blue-900 bg-blue-50/50' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
                title="Lihat Data Diri"
              >
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-900">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <span className="hidden max-w-[120px] truncate text-xs font-semibold text-slate-700 sm:block px-1">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              {/* Admin Portal Quicklink */}
              {currentUser.role === 'admin' && (
                <button
                  id="nav-admin-quick"
                  onClick={() => onNavigate('admin-dashboard')}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                  title="Dashboard Panel Admin"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}

              {/* Direct Logout Action */}
              <button
                id="nav-logout-btn"
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                title="Keluar dari Portal"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>
          ) : (
            <button
              id="nav-login-redirect"
              onClick={() => onNavigate('login')}
              className="px-4 py-2 text-xs font-bold leading-5 text-white bg-blue-950 rounded-lg hover:bg-blue-900 shadow-sm transition"
            >
              Masuk Mahasiswa
            </button>
          )}
        </div>

      </div>

      {/* Touch Mobile Navigation Bar - Compact Flow */}
      <div className="flex border-t border-slate-100 bg-slate-50 py-1 md:hidden justify-around">
        {[
          { id: 'home', label: 'Home' },
          { id: 'lomba', label: 'Lomba' },
          { id: 'beasiswa', label: 'Beasiswa' },
          { id: 'webinar', label: 'Webinar' },
          { id: 'sertifikasi', label: 'Sertifikasi' },
        ].map((item) => {
          const isActive = activePage === item.id || 
            (item.id === 'lomba' && activePage === 'prestasi') ||
            (item.id === 'lomba' && activePage === 'lomba-details') ||
            (item.id === 'beasiswa' && activePage === 'beasiswa-details') ||
            (item.id === 'webinar' && activePage === 'webinar-details');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-[11px] font-bold px-2 py-1.5 rounded transition ${
                isActive ? 'text-blue-900 bg-blue-100/70 font-extrabold' : 'text-slate-500'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
