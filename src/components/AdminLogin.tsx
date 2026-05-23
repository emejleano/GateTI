import React, { useState } from 'react';
import { User } from '../types';
import { loginUser } from '../api';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: string) => void;
}

export default function AdminLogin({ onLoginSuccess, onNavigate }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('UID dan Pin Sandi harus lengkap.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const user = await loginUser(username.trim(), password.trim());

      if (user.role !== 'admin') {
        throw new Error('Akses ditolak. Akun Anda bukan bertipe Staf Administrasi.');
      }

      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Koneksi database terganggu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-12"
      id="admin-login-root"
    >
      {/* Sleek executive styled background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200')`
        }}
      />

      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl" id="admin-login-card">
        
        {/* Header decoration */}
        <div className="flex flex-col items-center pb-6 border-b border-slate-800/65">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-2 ring-1 ring-amber-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-sm font-black tracking-widest text-amber-500 uppercase font-display">
            ADMINISTRATOR PORTAL
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            GateTI Staf Sekretariat Program Studi
          </span>
        </div>

        {error && (
          <div className="mt-4 flex items-center space-x-2 rounded-lg bg-red-500/10 p-3 text-xs font-semibold text-red-400 border border-red-500/20">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials form */}
        <form onSubmit={handleAdminSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 pb-1.5 text-slate-450">ID Staff / Username</label>
            <input 
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukan admin..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-405 pb-1.5 text-slate-450">Password Sandi</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sandi admin..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 font-extrabold text-xs text-slate-950 py-3.5 shadow-md active:scale-98 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Memverifikasi Hak Akses...' : 'MASUK PANEL KONTROL'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button 
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Ke Portal Utama</span>
          </button>
          
          <span className="text-[10px] font-semibold text-slate-400 font-mono">
            V1.0.4 - Secure Mode
          </span>
        </div>

      </div>
    </div>
  );
}
