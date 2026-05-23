import React, { useState, useEffect } from 'react';
import { 
  getDatabase, saveDatabase 
} from '../db/db_store';
import { 
  Lomba, Prestasi, Beasiswa, BeasiswaTimeline, Webinar, Certification, SystemSettings, User 
} from '../types';
import { 
  Settings, RefreshCw, Plus, Trash2, ShieldCheck, Database, Calendar, Award, 
  Tv, GraduationCap, Link2, AlertTriangle, CheckCircle, Info, Edit, KeyRound 
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ currentUser, onNavigate, onLogout }: AdminDashboardProps) {
  // Tabs for the Dashboard layout
  type ManageSection = 'users' | 'lombas' | 'beasiswas' | 'webinars' | 'certifications' | 'prestasis' | 'sync-settings';
  const [activeTab, setActiveTab] = useState<ManageSection>('sync-settings');

  // Datasets from API
  const [users, setUsers] = useState<User[]>([]);
  const [lombas, setLombas] = useState<Lomba[]>([]);
  const [beasiswas, setBeasiswas] = useState<Beasiswa[]>([]);
  const [beasiswaTimelines, setBeasiswaTimelines] = useState<BeasiswaTimeline[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [prestasis, setPrestasis] = useState<Prestasi[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    spreadsheetUrl: '',
    autoSyncEnabled: false,
    lastSyncTime: 'Belum Pernah',
    status: 'idle'
  });

  // Loading states
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Forms states
  const [gdriveInputInfo, setGdriveInputInfo] = useState('');
  
  // Specific Form Templates:
  const [newLomba, setNewLomba] = useState<Partial<Lomba>>({
    title: '', category: 'Nasional', prize: '', deadline: '', registerLink: '', description: '',
    deskripsi: '', temaSubtema: '', timeline: '', syaratKetentuan: '', faq: ''
  });
  const [newBeasiswa, setNewBeasiswa] = useState<Partial<Beasiswa>>({
    title: '', provider: '', description: '', image: '', registerLink: '', timeline: '', requirements: ''
  });
  const [newBeasiswaTimeline, setNewBeasiswaTimeline] = useState<Partial<BeasiswaTimeline>>({
    beasiswaId: '', phase: '', date: '', description: '', sortOrder: 1
  });
  const [newUser, setNewUser] = useState<Partial<User>>({
    nim: '', name: '', jurusan: 'S1 Teknik Industri', angkatan: '2026', role: 'user', passwordHash: '', photoUrl: ''
  });
  const [editingUserNim, setEditingUserNim] = useState<string | null>(null);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [newWebinar, setNewWebinar] = useState<Partial<Webinar>>({
    title: '', subtitle: '', dateStr: '', timeStr: '', speakerName: '', speakerTitle: '', location: '',
    image: '', registerLink: '', status: 'Terbuka', description: '', benefits: []
  });
  const [newCert, setNewCert] = useState<Partial<Certification>>({
    title: '', provider: '', category: 'Manajemen & Operasional', description: '', deadline: '', fee: '', registerLink: ''
  });
  const [newPrest, setNewPrest] = useState<Partial<Prestasi>>({
    name: '', title: '', category: 'Essay', level: 'Nasional', year: '2026', organizer: '', rank: 'Juara 1'
  });

  // Pull all database arrays on initialization
  const reloadAllData = async () => {
    try {
      setDataLoading(true);
      const [uRes, lRes, bRes, btRes, wRes, cRes, pRes, sRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/lombas'),
        fetch('/api/beasiswas'),
        fetch('/api/beasiswa-timelines'),
        fetch('/api/webinars'),
        fetch('/api/certifications'),
        fetch('/api/prestasis'),
        fetch('/api/settings')
      ]);

      setUsers(await uRes.json());
      setLombas(await lRes.json());
      setBeasiswas(await bRes.json());
      setBeasiswaTimelines(await btRes.json());
      setWebinars(await wRes.json());
      setCertifications(await cRes.json());
      setPrestasis(await pRes.json());
      setSettings(await sRes.json());
    } catch (err) {
      console.error('Error reloading database lists', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    reloadAllData();
  }, []);

  // Post trigger manual sync with external Apps Script web app
  const handleTriggerSync = async () => {
    try {
      setActionLoading(true);
      setFeedback(null);

      const res = await fetch('/api/settings/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Koneksi ke Apps Script ditolak.');
      }

      setFeedback({ type: 'success', text: result.message || 'Sinkronisasi Spreadsheet berhasil!' });
      setSettings(result.settings);
      
      // Reload updated datasets
      await reloadAllData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSettings = async (url: string, enabled: boolean) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetUrl: url, autoSyncEnabled: enabled })
      });
      const updated = await res.json();
      setSettings(updated);
      setFeedback({ type: 'success', text: 'Konfigurasi sinkronisasi sukses disimpan!' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Gagal memperbarui pengaturan.' });
    } finally {
      setActionLoading(false);
    }
  };

  // --- CREATE ACTIONS ---

  const resetUserForm = () => {
    setNewUser({ nim: '', name: '', jurusan: 'S1 Teknik Industri', angkatan: '2026', role: 'user', passwordHash: '', photoUrl: '' });
    setEditingUserNim(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nim || !newUser.name || !newUser.passwordHash) {
      setFeedback({ type: 'error', text: 'NIM/username, nama, dan password wajib diisi.' });
      return;
    }

    try {
      setActionLoading(true);
      const wasEditing = Boolean(editingUserNim);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal menyimpan user.');

      resetUserForm();
      await reloadAllData();
      setFeedback({ type: 'success', text: wasEditing ? 'User berhasil diperbarui.' : 'User baru berhasil ditambahkan.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal menyimpan user.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setNewUser({
      ...user,
      nim: String(user.nim),
      angkatan: String(user.angkatan),
      passwordHash: String(user.passwordHash || '')
    });
    setEditingUserNim(String(user.nim));
    setFeedback(null);
  };

  const handleDeleteUser = async (nim: string) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/users/${encodeURIComponent(nim)}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal menghapus user.');
      await reloadAllData();
      if (editingUserNim === nim) resetUserForm();
      setFeedback({ type: 'success', text: 'User berhasil dihapus.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal menghapus user.' });
    } finally {
      setActionLoading(false);
    }
  };

  const resetBeasiswaTimelineForm = () => {
    setNewBeasiswaTimeline({ beasiswaId: '', phase: '', date: '', description: '', sortOrder: 1 });
    setEditingTimelineId(null);
  };

  const handleSaveBeasiswaTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeasiswaTimeline.beasiswaId || !newBeasiswaTimeline.phase || !newBeasiswaTimeline.date) {
      setFeedback({ type: 'error', text: 'Beasiswa, tahap, dan tanggal timeline wajib diisi.' });
      return;
    }

    try {
      setActionLoading(true);
      const wasEditing = Boolean(editingTimelineId);
      const res = await fetch('/api/beasiswa-timelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBeasiswaTimeline)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal menyimpan timeline beasiswa.');

      resetBeasiswaTimelineForm();
      await reloadAllData();
      setFeedback({ type: 'success', text: wasEditing ? 'Timeline beasiswa berhasil diperbarui.' : 'Timeline beasiswa berhasil ditambahkan.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal menyimpan timeline beasiswa.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBeasiswaTimeline = (timeline: BeasiswaTimeline) => {
    setNewBeasiswaTimeline({ ...timeline, sortOrder: Number(timeline.sortOrder || 1) });
    setEditingTimelineId(timeline.id);
    setFeedback(null);
  };

  const handleDeleteBeasiswaTimeline = async (id: string) => {
    if (!confirm('Hapus tahap timeline beasiswa ini?')) return;
    try {
      setActionLoading(true);
      await fetch(`/api/beasiswa-timelines/${id}`, { method: 'DELETE' });
      await reloadAllData();
      if (editingTimelineId === id) resetBeasiswaTimelineForm();
      setFeedback({ type: 'success', text: 'Timeline beasiswa berhasil dihapus.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddLomba = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLomba.title || !newLomba.deadline) {
      alert('Judul dan tanggal wajib diisi.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await fetch('/api/lombas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLomba)
      });
      if (res.ok) {
        setNewLomba({
          title: '', category: 'Nasional', prize: '', deadline: '', registerLink: '', description: '',
          deskripsi: '', temaSubtema: '', timeline: '', syaratKetentuan: '', faq: ''
        });
        reloadAllData();
        setFeedback({ type: 'success', text: 'Lomba baru sukses ditambahkan!' });
      }
    } catch {
      alert('Gagal menyimpan lomba.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLomba = async (id: string) => {
    if (!confirm('Apakah harian menghapus lomba ini?')) return;
    try {
      setActionLoading(true);
      await fetch(`/api/lombas/${id}`, { method: 'DELETE' });
      reloadAllData();
      setFeedback({ type: 'success', text: 'Lomba telah dihapus.' });
    } catch {
      alert('Gagal menghapus.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBeasiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeasiswa.title || !newBeasiswa.provider) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/beasiswas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBeasiswa)
      });
      if (res.ok) {
        setNewBeasiswa({ title: '', provider: '', description: '', image: '', registerLink: '', timeline: '', requirements: '' });
        reloadAllData();
        setFeedback({ type: 'success', text: 'Beasiswa sukses ditambahkan!' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBeasiswa = async (id: string) => {
    if (!confirm('Hapus beasiswa ini?')) return;
    await fetch(`/api/beasiswas/${id}`, { method: 'DELETE' });
    reloadAllData();
  };

  const handleAddWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebinar.title || !newWebinar.speakerName) return;
    try {
      setActionLoading(true);
      const payload = {
        ...newWebinar,
        benefits: typeof newWebinar.benefits === 'string' 
          ? (newWebinar.benefits as string).split(',').map(s => s.trim()) 
          : newWebinar.benefits
      };
      const res = await fetch('/api/webinars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewWebinar({ title: '', subtitle: '', dateStr: '', timeStr: '', speakerName: '', speakerTitle: '', location: '', image: '', registerLink: '', status: 'Terbuka', description: '', benefits: [] });
        reloadAllData();
        setFeedback({ type: 'success', text: 'Webinar sukses disimpan!' });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWebinar = async (id: string) => {
    if (!confirm('Hapus webinar ini?')) return;
    await fetch(`/api/webinars/${id}`, { method: 'DELETE' });
    reloadAllData();
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.title || !newCert.provider) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert)
      });
      if (res.ok) {
        setNewCert({ title: '', provider: '', category: 'Manajemen & Operasional', description: '', deadline: '', fee: '', registerLink: '' });
        reloadAllData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Hapus sertifikasi ini?')) return;
    await fetch(`/api/certifications/${id}`, { method: 'DELETE' });
    reloadAllData();
  };

  const handleAddPrest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrest.name || !newPrest.title) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/prestasis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrest)
      });
      if (res.ok) {
        setNewPrest({ name: '', title: '', category: 'Essay', level: 'Nasional', year: '2026', organizer: '', rank: 'Juara 1' });
        reloadAllData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePrest = async (id: string) => {
    if (!confirm('Hapus rekam prestasi ini?')) return;
    await fetch(`/api/prestasis/${id}`, { method: 'DELETE' });
    reloadAllData();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full animate-fade-in" id="admin-dashboard-page">
      
      {/* Header Panel metadata */}
      <div className="flex flex-col md:flex-row items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white">
            <Database className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display flex items-baseline">
              GateTI Control Panel
            </h1>
            <p className="text-xs text-slate-500">
              Pengurus database beasiswa, lomba, webinar, & otomasi sinkronisasi spreadsheet.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs bg-lime-50 text-lime-800 font-bold px-3 py-1.5 rounded-full border border-lime-200">
            Akses Staf Staf: <b>{currentUser?.name || 'Administrator'}</b>
          </span>
          <button 
            onClick={() => onNavigate('home')}
            className="rounded-lg border border-slate-200 hover:bg-slate-55 px-4.5 py-2 text-xs font-bold text-slate-700 bg-white transition hover:bg-slate-50"
          >
            Kembali ke Portal
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`mb-6 flex items-center space-x-2.5 rounded-xl p-4 text-xs font-semibold border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 items-start" id="admin-dashboard-body">
        
        {/* Navigation panel list Left */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'sync-settings', label: 'Sinkronisasi Sheets', icon: Settings, color: 'text-amber-500' },
            { id: 'users', label: 'Tabel User', icon: KeyRound, color: 'text-emerald-500' },
            { id: 'lombas', label: 'Tabel Lomba', icon: Calendar, color: 'text-indigo-500' },
            { id: 'beasiswas', label: 'Tabel Beasiswa', icon: GraduationCap, color: 'text-blue-500' },
            { id: 'webinars', label: 'Tabel Webinar', icon: Tv, color: 'text-teal-500' },
            { id: 'certifications', label: 'Tabel Sertifikasi', icon: Award, color: 'text-purple-500' },
            { id: 'prestasis', label: 'Tabel Prestasi', icon: ShieldCheck, color: 'text-rose-500' },
          ].map((item) => {
            const target = item.id as ManageSection;
            const isCurrent = activeTab === target;
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(target);
                  setFeedback(null);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl border text-left cursor-pointer transition ${
                  isCurrent 
                    ? 'bg-blue-900 border-blue-900 text-white shadow' 
                    : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <IconComp className={`h-4.5 w-4.5 shrink-0 ${isCurrent ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Management panel Right */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* SINKRONISASI SPREADSHEETS VIEW */}
          {activeTab === 'sync-settings' && (
            <div className="space-y-6 animate-fade-in" id="settings-management-tab">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 font-display uppercase tracking-wide">
                    Otomasi Google Sheets Integration
                  </h3>
                  <span className="text-[10px] font-bold font-mono text-slate-400">
                    REAL-TIME SYNC ENGINE
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed text-justify">
                  Sesuai permintaan Anda, database beasiswa, lomba, webinar, dan prestasi ini disimpan penuh di file Google Spreadsheet Anda. Website akan melakukan sync berkala melalui extension <b>Google Apps Script</b> tanpa batasan API keys Google Cloud Console!
                </p>

                {/* Setup URL configuration */}
                <div className="space-y-4 bg-slate-50 rounded-xl p-5 border border-slate-200/70">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 pb-1.5 flex items-center space-x-1">
                      <Link2 className="h-4 w-4 text-slate-500" />
                      <span>URL Google Apps Script Web App</span>
                    </label>
                    <input 
                      type="text"
                      value={settings.spreadsheetUrl}
                      onChange={(e) => setSettings({ ...settings, spreadsheetUrl: e.target.value })}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs font-mono text-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-slate-150">
                    <div className="space-y-0.5">
                      <span className="block text-xs font-bold text-slate-750">Eksplorasi Sinkronisasi Otomatis</span>
                      <span className="block text-[10px] text-slate-405 text-slate-400">Pindai perbandingan data Sheets secara berkala setiap 90 detik.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.autoSyncEnabled} 
                        onChange={(e) => setSettings({ ...settings, autoSyncEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500" />
                    </label>
                  </div>

                  <button
                    onClick={() => handleUpdateSettings(settings.spreadsheetUrl, settings.autoSyncEnabled)}
                    className="w-full rounded-lg bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-3.5 shadow-sm transition"
                  >
                    Simpan Konfigurasi
                  </button>
                </div>

                {/* Actions Synchronization block */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-amber-50 rounded-xl border border-amber-200/50">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">STATUS SINKRONISASI AKTIF:</span>
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        settings.status === 'success' 
                          ? 'bg-emerald-500' 
                          : settings.status === 'syncing' 
                            ? 'bg-blue-500 animate-pulse' 
                            : 'bg-red-500'
                      }`} />
                      <span className="uppercase">{settings.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Terakhir Diperbarui: <b>{settings.lastSyncTime || 'Belum Pernah'}</b>
                    </p>
                  </div>

                  <button
                    disabled={actionLoading}
                    onClick={handleTriggerSync}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-extrabold text-xs text-slate-950 px-6 py-4 shadow transition active:scale-98 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4.5 w-4.5 ${actionLoading ? 'animate-spin' : ''}`} />
                    <span>SINKRONISASI SEKARANG</span>
                  </button>
                </div>

                {settings.errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed font-semibold">
                    ⚠️ Error log: {settings.errorMessage}
                  </div>
                )}
              </div>

              {/* Guide section on Google Drive link usage */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center space-x-2 text-blue-900">
                  <Info className="h-5 w-5" />
                  <h4 className="text-sm font-bold font-display uppercase tracking-wide">
                    INFO AUTO-CONVERT GOOGLE DRIVE LINK
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  Sistem GateTI telah dilengkapi converter URL Google Drive langsung! Salin saja link sebar &ldquo;Anyone with link as pelihat&rdquo; seperti di bawah ini, lalu simpan ke kolom Spreadsheet atau formulir website. Sistem akan otomatis menterjemahkan format ini di sisi backend untuk mengunggah dan menampilkan berkas poster jernih:
                </p>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1 pb-3">
                  <span className="block font-bold text-slate-500 font-sans text-[10px] uppercase">Contoh Link Masukan Anda:</span>
                  <span className="block break-all bg-amber-50 p-2 rounded text-red-700 font-semibold select-all">
                    https://drive.google.com/file/d/1X-aBc123XyZ-kLMo/view?usp=sharing
                  </span>
                  <span className="block font-bold text-slate-500 font-sans text-[10px] uppercase pt-2">Konversi Otomatis Sistem (Output rendering):</span>
                  <span className="block break-all bg-emerald-55 bg-emerald-50 p-2 rounded text-emerald-800 font-semibold">
                    https://docs.google.com/uc?export=view&id=1X-aBc123XyZ-kLMo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TABEL USER MANAGEMENT PAGE */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in" id="user-management-tab">
              <form onSubmit={handleSaveUser} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide">
                    {editingUserNim ? 'Edit User' : 'Tambah User Mahasiswa/Admin'}
                  </h3>
                  {editingUserNim && (
                    <button type="button" onClick={resetUserForm} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900">
                      Batal Edit
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">NIM / Username</label>
                    <input
                      type="text"
                      required
                      value={newUser.nim}
                      disabled={!!editingUserNim}
                      onChange={(e) => setNewUser({ ...newUser, nim: e.target.value })}
                      placeholder="3333230000 atau admin"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Nama user"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Jurusan / Unit</label>
                    <input
                      type="text"
                      required
                      value={newUser.jurusan}
                      onChange={(e) => setNewUser({ ...newUser, jurusan: e.target.value })}
                      placeholder="S1 Teknik Industri"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Angkatan / Status</label>
                    <input
                      type="text"
                      required
                      value={newUser.angkatan}
                      onChange={(e) => setNewUser({ ...newUser, angkatan: e.target.value })}
                      placeholder="2026 atau Staff"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-850"
                    >
                      <option value="user">Mahasiswa</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Password</label>
                    <input
                      type="text"
                      required
                      value={newUser.passwordHash}
                      onChange={(e) => setNewUser({ ...newUser, passwordHash: e.target.value })}
                      placeholder="6 digit belakang NIM atau password admin"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">URL Foto Profil</label>
                    <input
                      type="text"
                      value={newUser.photoUrl || ''}
                      onChange={(e) => setNewUser({ ...newUser, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" disabled={actionLoading} className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white flex items-center space-x-1.5 ml-auto disabled:opacity-60">
                  {editingUserNim ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{editingUserNim ? 'Update User' : 'Simpan User'}</span>
                </button>
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">User</th>
                      <th className="px-5 py-4">Jurusan</th>
                      <th className="px-5 py-4">Role</th>
                      <th className="px-5 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {users.map((user) => (
                      <tr key={String(user.nim)} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4">
                          <span className="block font-bold text-slate-900">{user.name}</span>
                          <span className="block text-[10px] font-mono text-slate-400">{String(user.nim)}</span>
                        </td>
                        <td className="px-5 py-4">{user.jurusan} - {String(user.angkatan)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                            {user.role === 'admin' ? 'Admin' : 'Mahasiswa'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEditUser(user)} className="text-blue-600 p-1 rounded hover:bg-blue-50" title="Edit user">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteUser(String(user.nim))} className="text-red-500 p-1 rounded hover:bg-red-50" title="Hapus user">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL LOMBA MANAGEMENT PAGE */}
          {activeTab === 'lombas' && (
            <div className="space-y-6 animate-fade-in" id="lomba-management-tab">
              {/* Form to submit a new Competition */}
              <form onSubmit={handleAddLomba} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide pb-3 border-b border-slate-104 border-b-slate-100">
                  Tambah Kompetisi Baru
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Judul Kompetisi</label>
                    <input 
                      type="text" required
                      value={newLomba.title}
                      onChange={(e) => setNewLomba({ ...newLomba, title: e.target.value })}
                      placeholder="Misal: Business Case Competition 2026..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Kategori Tingkat</label>
                    <select
                      value={newLomba.category}
                      onChange={(e) => setNewLomba({ ...newLomba, category: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-850"
                    >
                      <option value="Nasional">Nasional</option>
                      <option value="Internasional">Internasional</option>
                      <option value="Regional">Regional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Total Nominal Hadiah</label>
                    <input 
                      type="text" required
                      value={newLomba.prize}
                      onChange={(e) => setNewLomba({ ...newLomba, prize: e.target.value })}
                      placeholder="Misal: Rp. 25.000.000"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tanggal Batas Pendaftaran (Deadline)</label>
                    <input 
                      type="date" required
                      value={newLomba.deadline}
                      onChange={(e) => setNewLomba({ ...newLomba, deadline: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tautan Gambar Poster (Salin Link Google Drive)</label>
                    <input 
                      type="text" required
                      value={newLomba.image}
                      onChange={(e) => setNewLomba({ ...newLomba, image: e.target.value })}
                      placeholder="Masukkan link share Google Drive poster..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none placeholder:italic"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tautan Pendaftaran Eksternal (Formulir)</label>
                    <input 
                      type="text" required
                      value={newLomba.registerLink}
                      onChange={(e) => setNewLomba({ ...newLomba, registerLink: e.target.value })}
                      placeholder="https://forms.gle/..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Deskripsi Singkat (Kartu Luar)</label>
                    <textarea 
                      required rows={2}
                      value={newLomba.description}
                      onChange={(e) => setNewLomba({ ...newLomba, description: e.target.value })}
                      placeholder="Deskripsi ringkas pemicu..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Deskripsi Lengkap (Detail Dalam)</label>
                    <textarea 
                      required rows={3}
                      value={newLomba.deskripsi}
                      onChange={(e) => setNewLomba({ ...newLomba, deskripsi: e.target.value })}
                      placeholder="Penjelasan menyeluruh visi lomba..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tema &amp; Subtema</label>
                    <input 
                      type="text" required
                      value={newLomba.temaSubtema}
                      onChange={(e) => setNewLomba({ ...newLomba, temaSubtema: e.target.value })}
                      placeholder="Optimasi Rantai Pasok Hijau..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Timeline (Gunakan koma atau baris baru)</label>
                    <input 
                      type="text" required
                      value={newLomba.timeline}
                      onChange={(e) => setNewLomba({ ...newLomba, timeline: e.target.value })}
                      placeholder="Pendaftaran: Maret - Mei 2026..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Syarat &amp; Dokumen Ketentuan</label>
                    <textarea 
                      required rows={2}
                      value={newLomba.syaratKetentuan}
                      onChange={(e) => setNewLomba({ ...newLomba, syaratKetentuan: e.target.value })}
                      placeholder="1. Mahasiswa S1 Aktif..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white px-5 py-2.5 flex items-center space-x-1.5 cursor-pointer ml-auto"
                >
                  <Plus className="h-4.5 w-4.5" />
                  <span>Tambahkan Lomba</span>
                </button>
              </form>

              {/* Existing Competition list rendering */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Nama Lomba</th>
                      <th className="px-5 py-4">Tingkat</th>
                      <th className="px-5 py-4">Tenggat</th>
                      <th className="px-5 py-4">Hadiah</th>
                      <th className="px-5 py-4 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {lombas.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{l.title}</td>
                        <td className="px-5 py-4 uppercase text-[10px] tracking-wide text-indigo-700 font-bold">{l.category}</td>
                        <td className="px-5 py-4 font-mono text-red-600">{l.deadline}</td>
                        <td className="px-5 py-4">{l.prize}</td>
                        <td className="px-5 py-4 text-center">
                          <button 
                            onClick={() => handleDeleteLomba(l.id)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL BEASISWA MANAGEMENT PAGE */}
          {activeTab === 'beasiswas' && (
            <div className="space-y-6 animate-fade-in" id="beasiswa-management-tab">
              <form onSubmit={handleAddBeasiswa} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide pb-3 border-b border-slate-100">
                  Tambah Beasiswa Baru
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Nama Program Beasiswa</label>
                    <input 
                      type="text" required
                      value={newBeasiswa.title}
                      onChange={(e) => setNewBeasiswa({ ...newBeasiswa, title: e.target.value })}
                      placeholder="Misal: Beasiswa Astra..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Penyelenggara / Sponsor</label>
                    <input 
                      type="text" required
                      value={newBeasiswa.provider}
                      onChange={(e) => setNewBeasiswa({ ...newBeasiswa, provider: e.target.value })}
                      placeholder="Misal: Astra Internasional..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Poster Google Drive</label>
                    <input 
                      type="text" required
                      value={newBeasiswa.image}
                      onChange={(e) => setNewBeasiswa({ ...newBeasiswa, image: e.target.value })}
                      placeholder="Tautan poster Gdrive..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none placeholder:italic"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Pendaftaran (URL)</label>
                    <input 
                      type="text" required
                      value={newBeasiswa.registerLink}
                      onChange={(e) => setNewBeasiswa({ ...newBeasiswa, registerLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Deskripsi Ringkas</label>
                    <textarea 
                      required rows={2}
                      value={newBeasiswa.description}
                      onChange={(e) => setNewBeasiswa({ ...newBeasiswa, description: e.target.value })}
                      placeholder="Intisari info beasiwa..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Syarat dan Kriteria Khusus</label>
                    <textarea 
                      required rows={3}
                      value={newBeasiswa.requirements}
                      onChange={(e) => setNewBeasiswa({ ...newBeasiswa, requirements: e.target.value })}
                      placeholder="1. IPK minimal 3.00..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Timeline Ringkas Legacy</label>
                    <textarea
                      rows={3}
                      value={newBeasiswa.timeline}
                      onChange={(e) => setNewBeasiswa({ ...newBeasiswa, timeline: e.target.value })}
                      placeholder="Pendaftaran: 1-30 Mei 2026&#10;Wawancara: Juni 2026"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="rounded-lg bg-blue-700 hover:bg-blue-850 px-5 py-2.5 text-xs font-bold text-white flex items-center space-x-1.5 ml-auto">
                  <Plus className="h-4 w-4" />
                  <span>Simpan Beasiswa</span>
                </button>
              </form>

              {/* Table rendering existing data beasiswa */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Beasiswa</th>
                      <th className="px-5 py-4">Sponsor</th>
                      <th className="px-5 py-4 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {beasiswas.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{b.title}</td>
                        <td className="px-5 py-4 text-blue-800 font-bold">{b.provider}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeleteBeasiswa(b.id)} className="text-red-500 p-1 rounded hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form onSubmit={handleSaveBeasiswaTimeline} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide">
                    {editingTimelineId ? 'Edit Timeline Beasiswa' : 'Tambah Timeline Beasiswa'}
                  </h3>
                  {editingTimelineId && (
                    <button type="button" onClick={resetBeasiswaTimelineForm} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900">
                      Batal Edit
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Program Beasiswa</label>
                    <select
                      required
                      value={newBeasiswaTimeline.beasiswaId}
                      onChange={(e) => setNewBeasiswaTimeline({ ...newBeasiswaTimeline, beasiswaId: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-850"
                    >
                      <option value="">Pilih beasiswa</option>
                      {beasiswas.map((b) => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Urutan</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newBeasiswaTimeline.sortOrder}
                      onChange={(e) => setNewBeasiswaTimeline({ ...newBeasiswaTimeline, sortOrder: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tahap Seleksi</label>
                    <input
                      type="text"
                      required
                      value={newBeasiswaTimeline.phase}
                      onChange={(e) => setNewBeasiswaTimeline({ ...newBeasiswaTimeline, phase: e.target.value })}
                      placeholder="Seleksi Administrasi"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tanggal / Periode</label>
                    <input
                      type="text"
                      required
                      value={newBeasiswaTimeline.date}
                      onChange={(e) => setNewBeasiswaTimeline({ ...newBeasiswaTimeline, date: e.target.value })}
                      placeholder="Maret - Mei 2026"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Catatan Opsional</label>
                    <textarea
                      rows={2}
                      value={newBeasiswaTimeline.description || ''}
                      onChange={(e) => setNewBeasiswaTimeline({ ...newBeasiswaTimeline, description: e.target.value })}
                      placeholder="Catatan singkat untuk tahap ini"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" disabled={actionLoading} className="rounded-lg bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white flex items-center space-x-1.5 ml-auto disabled:opacity-60">
                  {editingTimelineId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{editingTimelineId ? 'Update Timeline' : 'Simpan Timeline'}</span>
                </button>
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Beasiswa</th>
                      <th className="px-5 py-4">Tahap</th>
                      <th className="px-5 py-4">Periode</th>
                      <th className="px-5 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {beasiswaTimelines.map((timeline) => {
                      const scholarship = beasiswas.find((b) => b.id === timeline.beasiswaId);
                      return (
                        <tr key={timeline.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4 font-bold text-slate-900">{scholarship?.title || timeline.beasiswaId}</td>
                          <td className="px-5 py-4">
                            <span className="block font-bold text-slate-800">{timeline.sortOrder}. {timeline.phase}</span>
                            {timeline.description && <span className="block text-[10px] text-slate-400 mt-1">{timeline.description}</span>}
                          </td>
                          <td className="px-5 py-4 text-lime-700 font-bold">{timeline.date}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleEditBeasiswaTimeline(timeline)} className="text-blue-600 p-1 rounded hover:bg-blue-50" title="Edit timeline">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDeleteBeasiswaTimeline(timeline.id)} className="text-red-500 p-1 rounded hover:bg-red-50" title="Hapus timeline">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL WEBINAR MANAGEMENT PAGE */}
          {activeTab === 'webinars' && (
            <div className="space-y-6 animate-fade-in" id="webinar-management-tab">
              <form onSubmit={handleAddWebinar} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide pb-3 border-b border-slate-100">
                  Tambah Webinar Baru
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Judul Webinar</label>
                    <input 
                      type="text" required
                      value={newWebinar.title}
                      onChange={(e) => setNewWebinar({ ...newWebinar, title: e.target.value })}
                      placeholder="Misal: Webinar SATELIT 2026..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Narasumber / Pembicara</label>
                    <input 
                      type="text" required
                      value={newWebinar.speakerName}
                      onChange={(e) => setNewWebinar({ ...newWebinar, speakerName: e.target.value })}
                      placeholder="Achmad Aditya, Ph.D..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Teks Hari &amp; Tanggal</label>
                    <input 
                      type="text" required
                      value={newWebinar.dateStr}
                      onChange={(e) => setNewWebinar({ ...newWebinar, dateStr: e.target.value })}
                      placeholder="20 Juli, 2026..."
                      className="w-full rounded-lg border border-slate-100 p-2.5 text-xs border-slate-200 text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Teks Alokasi Waktu</label>
                    <input 
                      type="text" required
                      value={newWebinar.timeStr}
                      onChange={(e) => setNewWebinar({ ...newWebinar, timeStr: e.target.value })}
                      placeholder="10:00 - Selesai..."
                      className="w-full rounded-lg border border-slate-100 p-2.5 text-xs border-slate-200 text-slate-700"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Gambar Gambar Gdrive</label>
                    <input 
                      type="text" required
                      value={newWebinar.image}
                      onChange={(e) => setNewWebinar({ ...newWebinar, image: e.target.value })}
                      placeholder="Shareable Gdrive URL..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none placeholder:italic"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Pendaftaran (Form)</label>
                    <input 
                      type="text" required
                      value={newWebinar.registerLink}
                      onChange={(e) => setNewWebinar({ ...newWebinar, registerLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Teks Benefit (pisahkan dangan koma)</label>
                    <input 
                      type="text" required
                      value={newWebinar.benefits as any}
                      onChange={(e) => setNewWebinar({ ...newWebinar, benefits: e.target.value as any })}
                      placeholder="E-Sertifikat, Materi PDF, Networking"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Uraian Deskripsi Acara</label>
                    <textarea 
                      required rows={3}
                      value={newWebinar.description}
                      onChange={(e) => setNewWebinar({ ...newWebinar, description: e.target.value })}
                      placeholder="Webinar ini akan membahas..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="rounded-lg bg-teal-650 hover:bg-teal-700 bg-teal-600 font-bold text-xs text-white px-5 py-2.5 flex items-center space-x-1.5 ml-auto">
                  <Plus className="h-4 w-4" />
                  <span>Simpan Webinar</span>
                </button>
              </form>

              {/* Webinars list */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Nama Webinar</th>
                      <th className="px-5 py-4">Pembicara</th>
                      <th className="px-5 py-4 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {webinars.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{w.title}</td>
                        <td className="px-5 py-4 text-slate-600">{w.speakerName}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeleteWebinar(w.id)} className="text-red-500 p-1 rounded hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL SERTIFIKASI MANAGEMENT PAGE */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 animate-fade-in" id="cert-management-tab">
              <form onSubmit={handleAddCert} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide pb-3 border-b border-slate-100">
                  Tambah Sertifikasi Profesional Baru
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Nama Sertifikasi</label>
                    <input 
                      type="text" required
                      value={newCert.title}
                      onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                      placeholder="Ahli K3 Umum..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Provider / Lembaga Penyelenggara</label>
                    <input 
                      type="text" required
                      value={newCert.provider}
                      onChange={(e) => setNewCert({ ...newCert, provider: e.target.value })}
                      placeholder="BNSP atau Microsoft..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Kategori Rumpun Profesi</label>
                    <select
                      value={newCert.category}
                      onChange={(e) => setNewCert({ ...newCert, category: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-850"
                    >
                      <option value="Manajemen & Operasional">Manajemen &amp; Operasional</option>
                      <option value="Analisis & Data">Analisis &amp; Data</option>
                      <option value="K3 & Lingkungan">K3 &amp; Lingkungan</option>
                      <option value="Rantai Pasok">Rantai Pasok</option>
                      <option value="Sistem & Proses">Sistem &amp; Proses</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Est. Rincian Biaya</label>
                    <input 
                      type="text" required
                      value={newCert.fee}
                      onChange={(e) => setNewCert({ ...newCert, fee: e.target.value })}
                      placeholder="Rp 1.500.000..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Resmi Pendaftaran</label>
                    <input 
                      type="text" required
                      value={newCert.registerLink}
                      onChange={(e) => setNewCert({ ...newCert, registerLink: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Deskripsi Ringkas Target Kompetensi</label>
                    <textarea 
                      required rows={3}
                      value={newCert.description}
                      onChange={(e) => setNewCert({ ...newCert, description: e.target.value })}
                      placeholder="Sertikasi ini melatih siswa untuk..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="rounded-lg bg-purple-700 hover:bg-purple-850 px-5 py-2.5 text-xs font-bold text-white flex items-center space-x-1.5 ml-auto">
                  <Plus className="h-4 w-4" />
                  <span>Simpan Sertifikasi</span>
                </button>
              </form>

              {/* Table rendering cert list */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Nama Sertifikasi</th>
                      <th className="px-5 py-4">Provider</th>
                      <th className="px-5 py-4">Biaya</th>
                      <th className="px-5 py-4 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {certifications.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{c.title}</td>
                        <td className="px-5 py-4 text-purple-700 font-bold">{c.provider}</td>
                        <td className="px-5 py-4 font-bold text-emerald-800">{c.fee}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeleteCert(c.id)} className="text-red-500 p-1.5 rounded hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TABEL DATA PRESTASI MANAGEMENT */}
          {activeTab === 'prestasis' && (
            <div className="space-y-6 animate-fade-in" id="prestasi-management-tab">
              <form onSubmit={handleAddPrest} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide pb-3 border-b border-slate-100">
                  Tambah Rekam Prestasi Mahasiswa Baru
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Nama Penghargaan / Tim Jawara</label>
                    <input 
                      type="text" required
                      value={newPrest.name}
                      onChange={(e) => setNewPrest({ ...newPrest, name: e.target.value })}
                      placeholder="Misal: Tim Optima atau Dwi Putri A..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Judul Karya / Riset Juara</label>
                    <input 
                      type="text" required
                      value={newPrest.title}
                      onChange={(e) => setNewPrest({ ...newPrest, title: e.target.value })}
                      placeholder="OptFlow: Optimasi Aliran Produksi..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Kategori Bidang</label>
                    <input 
                      type="text" required
                      value={newPrest.category}
                      onChange={(e) => setNewPrest({ ...newPrest, category: e.target.value })}
                      placeholder="Essay, KTI, Lean, Business Plan..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Lembaga Penyelenggara</label>
                    <input 
                      type="text" required
                      value={newPrest.organizer}
                      onChange={(e) => setNewPrest({ ...newPrest, organizer: e.target.value })}
                      placeholder="Kementrian Perindustrian RI..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tingkat Penilaian</label>
                    <select
                      value={newPrest.level}
                      onChange={(e) => setNewPrest({ ...newPrest, level: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-850"
                    >
                      <option value="Nasional">Nasional</option>
                      <option value="Internasional">Internasional</option>
                      <option value="Regional">Regional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Urutan Juara (Peringkat)</label>
                    <select
                      value={newPrest.rank}
                      onChange={(e) => setNewPrest({ ...newPrest, rank: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-850"
                    >
                      <option value="Juara 1">Juara 1 🥇</option>
                      <option value="Juara 2">Juara 2 🥈</option>
                      <option value="Juara 3">Juara 3 🥉</option>
                      <option value="Juara Terbaik">Juara Harapan / Finalis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tahun Pencapaian</label>
                    <input 
                      type="text" required
                      value={newPrest.year}
                      onChange={(e) => setNewPrest({ ...newPrest, year: e.target.value })}
                      placeholder="2026..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button type="submit" className="rounded-lg bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white px-5 py-2.5 flex items-center space-x-1.5 ml-auto">
                  <Plus className="h-4 w-4" />
                  <span>Simpan Prestasi</span>
                </button>
              </form>

              {/* Prestasis list */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Penerima</th>
                      <th className="px-5 py-4">Karya</th>
                      <th className="px-5 py-4">Peringkat</th>
                      <th className="px-5 py-4 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {prestasis.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{p.name}</td>
                        <td className="px-5 py-4">{p.title}</td>
                        <td className="px-5 py-4 text-rose-700 font-bold">{p.rank}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeletePrest(p.id)} className="text-red-500 p-1 rounded hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
