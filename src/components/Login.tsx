import React, { useState } from 'react';
import { User } from '../types';
import { loginUser } from '../api';
import { Lock, UserCheck, AlertCircle } from 'lucide-react';
import logoTeknikIndustri from '../image/logo_teknikindustri.png';
import loginBg from '../image/login_card.png';


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
      
      const user = await loginUser(nim.trim(), password.trim());
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Koneksi server gagal.');
    } finally {
      setLoading(false);
    }
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
          backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.75), rgba(30, 58, 138, 0.85)), url('${loginBg}')`
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
          <img src={logoTeknikIndustri} alt="Teknik Industri Logo" className="h-24 w-auto object-contain" />
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
