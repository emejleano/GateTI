import React, { useState } from 'react';
import { User } from '../types';
import { Lock, UserCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export default function Login({ onLoginSuccess, onNavigate }: LoginProps) {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nim || !password) {
      setError('Harap masukkan NIM dan Password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: nim.trim(), password: password.trim() })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal login. Periksa kembali NIM dan password.');
      }

      onLoginSuccess(result.user);
    } catch (err: any) {
      setError(err.message || 'Koneksi server gagal.');
    } finally {
      setLoading(false);
    }
  };

  // Helper autofill for testing
  const handleAutoFill = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setNim('3333230000');
      setPassword('230000');
    } else {
      setNim('admin');
      setPassword('admin123');
    }
    setError(null);
  };

  return (
    <div 
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-12"
      id="login-page-root"
    >
      {/* Immersive engineering/campus atmosphere background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.75), rgba(30, 58, 138, 0.85)), url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200')`
        }}
      />

      {/* Floated massive display heading from PDF */}
      <div className="relative z-10 mb-6 text-center">
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md sm:text-5xl font-display">
          Welcome to GateTI
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Your Portal Hub for Industrial Engineering Opportunities
        </p>
      </div>

      {/* White centered credential login card */}
      <div 
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl transition duration-300 hover:shadow-blue-900/10"
        id="login-card"
      >
        {/* Emblem - Teknik Industri */}
        <div className="flex flex-col items-center pb-6 border-b border-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 text-white shadow-inner">
            <svg 
              className="h-9 w-9 text-amber-400" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <span className="mt-2 text-md font-bold tracking-widest text-blue-950 uppercase font-display">
            TEKNIK INDUSTRI
          </span>
          <span className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">
            Universitas Sultan Ageng Tirtayasa
          </span>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 flex items-center space-x-2 rounded-lg bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 pb-1.5">
              NIM Mahasiswa
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <UserCheck className="h-4.5 w-4.5" />
              </span>
              <input
                id="login-input-nim"
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Masukkan NIM..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 transition focus:border-blue-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 pb-1.5">
              Password Portal
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                id="login-input-pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 transition focus:border-blue-900 focus:bg-white focus:outline-none"
              />
            </div>
            {/* Olive notice on bottom from Page 1 */}
            <p className="mt-2 text-left text-xs font-medium text-lime-700">
              * Password default adalah 6 digit belakang NIM
            </p>
          </div>

          {/* violet blue submit button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-700 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg transition hover:bg-blue-800 focus:outline-none active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </button>
        </form>

        {/* Quick Credentials Seeding area for ease of testing */}
        <div className="mt-8 rounded-xl bg-slate-50 p-4 border border-slate-150">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
            🔑 COBA DEMO INSTAN (ONE-CLICK LOGIN)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAutoFill('student')}
              className="rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-950 font-bold text-xs py-2 transition"
              id="demo-student-fill"
            >
              Demo Mahasiswa
            </button>
            <button
              onClick={() => handleAutoFill('admin')}
              className="rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-950 font-bold text-xs py-2 transition"
              id="demo-admin-fill"
            >
              Demo Admin/Staff
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
            Mahasiswa: NIM <b>3333230000</b> | Pwd <b>230000</b>
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="relative z-10 mt-12 text-center">
        <p className="text-xs text-slate-400 font-medium">
          © 2026 GateTI – IDS Teknik Industri Untirta
        </p>
        {/* Hidden admin trigger for extra credit to user's "hide admin/login" request */}
        <button 
          onClick={() => onNavigate('admin-login')}
          className="mt-1 text-[10px] text-slate-500/30 hover:text-slate-200 hover:underline transition"
        >
          Portal Staf Admin
        </button>
      </div>
    </div>
  );
}
