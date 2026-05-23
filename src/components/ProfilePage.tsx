import { User, LogOut, ArrowLeft, Download, ShieldCheck, Award } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfilePageProps {
  currentUser: UserType | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function ProfilePage({ currentUser, onNavigate, onLogout }: ProfilePageProps) {
  // Use current user details or fallback to Justin Bieber from Page 3 of PDF
  const user = currentUser || {
    nim: '3333230000',
    name: 'Justin Bieber',
    jurusan: 'S1 Teknik Industri',
    angkatan: '2023',
    role: 'user',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  };

  const handlePrintIdMock = () => {
    alert('Kartu Tanda Mahasiswa (KTM) Digital berhasil dipersiapkan untuk diunduh sebagai PDF!');
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 w-full animate-fade-in" id="profile-page-root">
      
      {/* Header and Back button */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-900 transition"
          id="profile-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>
        <h2 className="text-lg font-black text-blue-950 font-display uppercase tracking-wider">
          Data Diri Mahasiswa
        </h2>
      </div>

      {/* Profile Card from Page 3 */}
      <div 
        className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-950 to-blue-900 text-white p-8 text-center shadow-xl relative overflow-hidden flex flex-col items-center"
        id="student-profile-badge"
      >
        {/* Glow styling effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-lime-400/5 rounded-full blur-2xl" />

        {/* Circular Profile Picture with Double Ring Frame (green/white) from Page 3 */}
        <div className="relative group mb-6 z-10">
          <div className="absolute inset-0 rounded-full border-4 border-solid border-lime-400 scale-102 animate-pulse-slow" />
          <div className="relative rounded-full border-4 border-solid border-white p-1 overflow-hidden h-36 w-36 bg-slate-800 shadow-inner">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="h-full w-full rounded-full object-cover transition"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-105 text-white">
                <User className="h-16 w-16 text-blue-300" />
              </div>
            )}
          </div>
          <span className="absolute bottom-1 right-2 rounded-full bg-lime-455 px-2.5 py-1 text-[9px] font-black text-slate-900 uppercase tracking-wide bg-lime-400 shadow-sm z-20">
            {user.role}
          </span>
        </div>

        {/* Profile Attributes Text boxes from Page 3 */}
        <div className="w-full space-y-3 relative z-10" id="profile-text-fields-grid">
          
          <div className="rounded-xl bg-white/10 p-3.5 border border-white/5 shadow-inner">
            <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">Nama Lengkap</span>
            <span className="text-base font-bold font-display tracking-tight">{user.name}</span>
          </div>

          <div className="rounded-xl bg-white/10 p-3.5 border border-white/5 shadow-inner">
            <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">Nomor Induk Mahasiswa (NIM)</span>
            <span className="text-base font-bold font-mono tracking-wide text-amber-400">{user.nim}</span>
          </div>

          <div className="rounded-xl bg-white/10 p-3.5 border border-white/5 shadow-inner">
            <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">Program Studi / Jurusan</span>
            <span className="text-sm font-semibold text-slate-100">{user.jurusan || 'S1 Teknik Industri'}</span>
          </div>

          <div className="rounded-xl bg-white/10 p-3.5 border border-white/5 shadow-inner">
            <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">Tahun Angkatan</span>
            <span className="text-sm font-semibold text-slate-100">{user.angkatan || 'Angkatan 2023'}</span>
          </div>

        </div>

        {/* Quick actions for student profile card */}
        <div className="mt-8 grid grid-cols-2 gap-3 w-full relative z-10">
          <button 
            onClick={handlePrintIdMock}
            className="flex items-center justify-center space-x-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition text-xs py-2.5 font-bold"
            id="print-card-btn"
          >
            <Download className="h-4 w-4" />
            <span>KTM Digital</span>
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center justify-center space-x-1.5 rounded-lg bg-red-650 hover:bg-red-700 bg-red-600 font-bold text-white transition text-xs py-2.5"
            id="logout-card-btn"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Akun</span>
          </button>
        </div>

      </div>

      {/* Untirta Credentials stamp mark */}
      <div className="mt-6 flex items-center justify-center space-x-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
        <ShieldCheck className="h-4.5 w-4.5 text-lime-600" />
        <span>Terverifikasi Sistim Kemahasiswaan Untirta</span>
      </div>
    </div>
  );
}
