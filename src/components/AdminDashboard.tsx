import React, { useState, useEffect } from 'react';
import {
  fetchAllData, addOrUpdateItem, deleteItem, addOrUpdateUser, deleteUser,
  invalidateCache, generateQRCodeUrl, DatabaseSchema
} from '../api';
import {
  Lomba, Prestasi, Beasiswa, Webinar, Certification, User
} from '../types';
import {
  Plus, Trash2, ShieldCheck, Database, Calendar, Award,
  Tv, GraduationCap, AlertTriangle, CheckCircle, Edit, KeyRound,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ currentUser, onNavigate, onLogout }: AdminDashboardProps) {
  // Tabs for the Dashboard layout
  type ManageSection = 'users' | 'lombas' | 'beasiswas' | 'webinars' | 'certifications' | 'prestasis';
  const [activeTab, setActiveTab] = useState<ManageSection>('beasiswas');

  // Datasets
  const [users, setUsers] = useState<User[]>([]);
  const [lombas, setLombas] = useState<Lomba[]>([]);
  const [beasiswas, setBeasiswas] = useState<Beasiswa[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [prestasis, setPrestasis] = useState<Prestasi[]>([]);

  // Loading states
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [tableControls, setTableControls] = useState<Record<ManageSection, { search: string; filter: string; page: number; pageSize: number }>>({
    users: { search: '', filter: 'all', page: 1, pageSize: 5 },
    lombas: { search: '', filter: 'all', page: 1, pageSize: 5 },
    beasiswas: { search: '', filter: 'all', page: 1, pageSize: 5 },
    webinars: { search: '', filter: 'all', page: 1, pageSize: 5 },
    certifications: { search: '', filter: 'all', page: 1, pageSize: 5 },
    prestasis: { search: '', filter: 'all', page: 1, pageSize: 5 },
  });

  // Forms states
  const [newLomba, setNewLomba] = useState<Partial<Lomba>>({
    title: '', category: 'Nasional', prize: '', deadline: '', registerLink: '', description: '',
    deskripsi: '', temaSubtema: '', timeline: '', syaratKetentuan: '', faq: ''
  });
  const [newBeasiswa, setNewBeasiswa] = useState<Partial<Beasiswa>>({
    title: '', provider: '', description: '', image: '', registerLink: '', timeline: '', requirements: ''
  });
  const [editingBeasiswaId, setEditingBeasiswaId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({
    nim: '', name: '', jurusan: 'S1 Teknik Industri', angkatan: '2026', role: 'user', passwordHash: '', photoUrl: ''
  });
  const [editingUserNim, setEditingUserNim] = useState<string | null>(null);
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

  // Pull all data from Apps Script
  const reloadAllData = async () => {
    try {
      setDataLoading(true);
      invalidateCache();
      const data = await fetchAllData(true);
      applyData(data);
    } catch (err) {
      console.error('Error reloading data', err);
      setFeedback({ type: 'error', text: 'Gagal memuat data dari Google Spreadsheet.' });
    } finally {
      setDataLoading(false);
    }
  };

  const applyData = (data: DatabaseSchema) => {
    setUsers(data.users);
    setLombas(data.lombas);
    setBeasiswas(data.beasiswas);
    setWebinars(data.webinars);
    setCertifications(data.certifications);
    setPrestasis(data.prestasis);
  };

  useEffect(() => {
    reloadAllData();
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const updateTableControl = (section: ManageSection, patch: Partial<{ search: string; filter: string; page: number; pageSize: number }>) => {
    setTableControls((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...patch,
        page: patch.page ?? 1,
      },
    }));
  };

  const stringifySearch = (item: unknown) =>
    Object.values(item as Record<string, unknown>)
      .flatMap((value) => Array.isArray(value) ? value : [value])
      .join(' ')
      .toLowerCase();

  const getUniqueOptions = <T,>(items: T[], getValue: (item: T) => string | undefined) =>
    Array.from(new Set(items.map(getValue).filter(Boolean) as string[]));

  const buildTableView = <T,>(
    section: ManageSection,
    items: T[],
    getFilterValue: (item: T) => string | undefined
  ) => {
    const controls = tableControls[section];
    const query = controls.search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch = !query || stringifySearch(item).includes(query);
      const matchesFilter = controls.filter === 'all' || getFilterValue(item) === controls.filter;
      return matchesSearch && matchesFilter;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / controls.pageSize));
    const page = Math.min(controls.page, totalPages);
    const startIndex = (page - 1) * controls.pageSize;

    return {
      rows: filtered.slice(startIndex, startIndex + controls.pageSize),
      filteredCount: filtered.length,
      page,
      totalPages,
      start: filtered.length ? startIndex + 1 : 0,
      end: Math.min(startIndex + controls.pageSize, filtered.length),
    };
  };

  const renderTableControls = (
    section: ManageSection,
    title: string,
    total: number,
    filteredCount: number,
    page: number,
    totalPages: number,
    filterOptions: string[],
    filterLabel = 'Filter'
  ) => {
    const controls = tableControls[section];

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide">{title}</h3>
            <p className="mt-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Menampilkan {filteredCount} dari {total} data
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_11rem_7rem] xl:w-[38rem]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={controls.search}
                onChange={(e) => updateTableControl(section, { search: e.target.value })}
                placeholder="Cari data..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold text-slate-700 focus:outline-none"
              />
            </label>
            <select
              value={controls.filter}
              onChange={(e) => updateTableControl(section, { filter: e.target.value })}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none"
              aria-label={filterLabel}
            >
              <option value="all">Semua {filterLabel}</option>
              {filterOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={controls.pageSize}
              onChange={(e) => updateTableControl(section, { pageSize: Number(e.target.value) })}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none"
              aria-label="Jumlah data per halaman"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>{size}/hal</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateTableControl(section, { page: page - 1 })}
              disabled={page <= 1}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <button
              type="button"
              onClick={() => updateTableControl(section, { page: page + 1 })}
              disabled={page >= totalPages}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- USER CRUD ---
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
      const result = await addOrUpdateUser(newUser as User, wasEditing);
      applyData(result);
      resetUserForm();
      setFeedback({ type: 'success', text: wasEditing ? 'User berhasil diperbarui.' : 'User baru berhasil ditambahkan.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal menyimpan user.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setNewUser({ ...user, nim: String(user.nim), angkatan: String(user.angkatan), passwordHash: String(user.passwordHash || '') });
    setEditingUserNim(String(user.nim));
    setFeedback(null);
  };

  const handleDeleteUser = async (nim: string) => {
    if (!confirm('Hapus user ini?')) return;
    try {
      setActionLoading(true);
      const result = await deleteUser(nim);
      applyData(result);
      if (editingUserNim === nim) resetUserForm();
      setFeedback({ type: 'success', text: 'User berhasil dihapus.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal menghapus user.' });
    } finally {
      setActionLoading(false);
    }
  };

  // --- LOMBA CRUD ---
  const handleAddLomba = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLomba.title || !newLomba.deadline) {
      setFeedback({ type: 'error', text: 'Judul dan tanggal wajib diisi.' });
      return;
    }
    try {
      setActionLoading(true);
      const result = await addOrUpdateItem('lombas', newLomba, 'LOMB');
      applyData(result);
      setNewLomba({ title: '', category: 'Nasional', prize: '', deadline: '', registerLink: '', description: '', deskripsi: '', temaSubtema: '', timeline: '', syaratKetentuan: '', faq: '' });
      setFeedback({ type: 'success', text: 'Lomba baru sukses ditambahkan!' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal menyimpan lomba.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLomba = async (id: string) => {
    if (!confirm('Hapus lomba ini?')) return;
    try {
      setActionLoading(true);
      const result = await deleteItem('lombas', id);
      applyData(result);
      setFeedback({ type: 'success', text: 'Lomba telah dihapus.' });
    } catch { setFeedback({ type: 'error', text: 'Gagal menghapus.' }); }
    finally { setActionLoading(false); }
  };

  // --- BEASISWA CRUD ---
  const resetBeasiswaForm = () => {
    setNewBeasiswa({ title: '', provider: '', description: '', image: '', registerLink: '', timeline: '', requirements: '' });
    setEditingBeasiswaId(null);
  };

  const handleSaveBeasiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeasiswa.title || !newBeasiswa.provider) {
      setFeedback({ type: 'error', text: 'Nama program beasiswa dan penyelenggara wajib diisi.' });
      return;
    }
    try {
      setActionLoading(true);
      const result = await addOrUpdateItem('beasiswas', editingBeasiswaId ? { ...newBeasiswa, id: editingBeasiswaId } : newBeasiswa, 'BEAS');
      applyData(result);
      resetBeasiswaForm();
      setFeedback({ type: 'success', text: editingBeasiswaId ? 'Informasi beasiswa berhasil diperbarui.' : 'Beasiswa sukses ditambahkan!' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Gagal menyimpan beasiswa.' });
    } finally { setActionLoading(false); }
  };

  const handleEditBeasiswa = (beasiswa: Beasiswa) => {
    setNewBeasiswa({ ...beasiswa });
    setEditingBeasiswaId(beasiswa.id);
    setFeedback(null);
  };

  const handleDeleteBeasiswa = async (id: string) => {
    if (!confirm('Hapus beasiswa ini?')) return;
    try {
      setActionLoading(true);
      const result = await deleteItem('beasiswas', id);
      applyData(result);
      if (editingBeasiswaId === id) resetBeasiswaForm();
      setFeedback({ type: 'success', text: 'Beasiswa berhasil dihapus.' });
    } catch { setFeedback({ type: 'error', text: 'Gagal menghapus beasiswa.' }); }
    finally { setActionLoading(false); }
  };

  // --- WEBINAR CRUD ---
  const handleAddWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebinar.title || !newWebinar.speakerName) {
      setFeedback({ type: 'error', text: 'Judul webinar dan nama pembicara wajib diisi.' });
      return;
    }
    try {
      setActionLoading(true);
      const payload = {
        ...newWebinar,
        benefits: typeof newWebinar.benefits === 'string'
          ? (newWebinar.benefits as string).split(',').map(s => s.trim())
          : newWebinar.benefits
      };
      const result = await addOrUpdateItem('webinars', payload, 'WEB');
      applyData(result);
      setNewWebinar({ title: '', subtitle: '', dateStr: '', timeStr: '', speakerName: '', speakerTitle: '', location: '', image: '', registerLink: '', status: 'Terbuka', description: '', benefits: [] });
      setFeedback({ type: 'success', text: 'Webinar sukses disimpan!' });
    } catch { setFeedback({ type: 'error', text: 'Gagal menyimpan webinar.' }); }
    finally { setActionLoading(false); }
  };

  const handleDeleteWebinar = async (id: string) => {
    if (!confirm('Hapus webinar ini?')) return;
    try { setActionLoading(true); const r = await deleteItem('webinars', id); applyData(r); setFeedback({ type: 'success', text: 'Webinar dihapus.' }); }
    catch { setFeedback({ type: 'error', text: 'Gagal menghapus.' }); }
    finally { setActionLoading(false); }
  };

  // --- CERTIFICATION CRUD ---
  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.title || !newCert.provider) {
      setFeedback({ type: 'error', text: 'Nama sertifikasi dan provider wajib diisi.' });
      return;
    }
    try {
      setActionLoading(true);
      const result = await addOrUpdateItem('certifications', newCert, 'CERT');
      applyData(result);
      setNewCert({ title: '', provider: '', category: 'Manajemen & Operasional', description: '', deadline: '', fee: '', registerLink: '' });
      setFeedback({ type: 'success', text: 'Sertifikasi ditambahkan!' });
    } catch { setFeedback({ type: 'error', text: 'Gagal menyimpan sertifikasi.' }); }
    finally { setActionLoading(false); }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Hapus sertifikasi ini?')) return;
    try { setActionLoading(true); const r = await deleteItem('certifications', id); applyData(r); }
    catch { setFeedback({ type: 'error', text: 'Gagal menghapus.' }); }
    finally { setActionLoading(false); }
  };

  // --- PRESTASI CRUD ---
  const handleAddPrest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrest.name || !newPrest.title) {
      setFeedback({ type: 'error', text: 'Nama penerima/tim dan judul karya wajib diisi.' });
      return;
    }
    try {
      setActionLoading(true);
      const result = await addOrUpdateItem('prestasis', newPrest, 'PRES');
      applyData(result);
      setNewPrest({ name: '', title: '', category: 'Essay', level: 'Nasional', year: '2026', organizer: '', rank: 'Juara 1' });
      setFeedback({ type: 'success', text: 'Prestasi ditambahkan!' });
    } catch { setFeedback({ type: 'error', text: 'Gagal menyimpan prestasi.' }); }
    finally { setActionLoading(false); }
  };

  const handleDeletePrest = async (id: string) => {
    if (!confirm('Hapus rekam prestasi ini?')) return;
    try { setActionLoading(true); const r = await deleteItem('prestasis', id); applyData(r); }
    catch { setFeedback({ type: 'error', text: 'Gagal menghapus.' }); }
    finally { setActionLoading(false); }
  };

  const usersView = buildTableView('users', users, (item) => item.role);
  const lombasView = buildTableView('lombas', lombas, (item) => item.category);
  const beasiswasView = buildTableView('beasiswas', beasiswas, (item) => item.provider);
  const webinarsView = buildTableView('webinars', webinars, (item) => item.status);
  const certificationsView = buildTableView('certifications', certifications, (item) => item.category);
  const prestasisView = buildTableView('prestasis', prestasis, (item) => item.level);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full animate-fade-in" id="admin-dashboard-page">
      {feedback && (
        <div className="fixed right-4 top-4 z-[60] w-[min(calc(100vw-2rem),24rem)] animate-fade-in">
          <div className={`flex items-start space-x-3 rounded-xl border p-4 text-xs font-semibold shadow-lg ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider">
                {feedback.type === 'success' ? 'Berhasil Disimpan' : 'Aksi Gagal'}
              </span>
              <span className="mt-1 block leading-relaxed">{feedback.text}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header Panel */}
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
              Kelola data beasiswa, lomba, webinar & sertifikasi langsung dari Google Spreadsheet.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs bg-lime-50 text-lime-800 font-bold px-3 py-1.5 rounded-full border border-lime-200">
            Akses Staf: <b>{currentUser?.name || 'Administrator'}</b>
          </span>
          <button
            onClick={() => onNavigate('home')}
            className="rounded-lg border border-slate-200 hover:bg-slate-50 px-4.5 py-2 text-xs font-bold text-slate-700 bg-white transition"
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

        {/* Navigation panel Left */}
        <div className="lg:col-span-3 space-y-2">
          {[
            { id: 'users', label: 'Tabel User', icon: KeyRound, color: 'text-emerald-500' },
            { id: 'lombas', label: 'Tabel Lomba', icon: Calendar, color: 'text-indigo-500' },
            { id: 'beasiswas', label: 'Beasiswa & Timeline', icon: GraduationCap, color: 'text-blue-500' },
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
                onClick={() => { setActiveTab(target); setFeedback(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl border text-left cursor-pointer transition ${
                  isCurrent
                    ? 'bg-blue-900 border-blue-900 text-white shadow'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <IconComp className={`h-4.5 w-4.5 shrink-0 ${isCurrent ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Sync info badge */}
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200/60 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              🔗 DATA SOURCE
            </span>
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Data dibaca langsung dari Google Spreadsheet via Apps Script. Perubahan akan otomatis tersimpan ke Spreadsheet.
            </p>
            <button
              onClick={reloadAllData}
              disabled={dataLoading}
              className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white py-2.5 transition disabled:opacity-50"
            >
              {dataLoading ? '⟳ Memuat...' : '⟳ Refresh Data'}
            </button>
          </div>
        </div>

        {/* Content Management panel Right */}
        <div className="lg:col-span-9 space-y-6">

          {/* === USERS TAB === */}
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
                    <input type="text" required value={newUser.nim} disabled={!!editingUserNim}
                      onChange={(e) => setNewUser({ ...newUser, nim: e.target.value })}
                      placeholder="3333230000 atau admin"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none disabled:bg-slate-100" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Nama Lengkap</label>
                    <input type="text" required value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Nama user"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Jurusan / Unit</label>
                    <input type="text" required value={newUser.jurusan}
                      onChange={(e) => setNewUser({ ...newUser, jurusan: e.target.value })}
                      placeholder="S1 Teknik Industri"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Angkatan / Status</label>
                    <input type="text" required value={newUser.angkatan}
                      onChange={(e) => setNewUser({ ...newUser, angkatan: e.target.value })}
                      placeholder="2026 atau Staff"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Role</label>
                    <select value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800">
                      <option value="user">Mahasiswa</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Password</label>
                    <input type="text" required value={newUser.passwordHash}
                      onChange={(e) => setNewUser({ ...newUser, passwordHash: e.target.value })}
                      placeholder="6 digit belakang NIM atau password admin"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">URL Foto Profil</label>
                    <input type="text" value={newUser.photoUrl || ''}
                      onChange={(e) => setNewUser({ ...newUser, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={actionLoading} className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white flex items-center space-x-1.5 ml-auto disabled:opacity-60">
                  {editingUserNim ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{editingUserNim ? 'Update User' : 'Simpan User'}</span>
                </button>
              </form>

              {renderTableControls(
                'users',
                'Data User',
                users.length,
                usersView.filteredCount,
                usersView.page,
                usersView.totalPages,
                getUniqueOptions(users, (item) => item.role),
                'Role'
              )}

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
                    {usersView.rows.map((user) => (
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
                            <button onClick={() => handleEditUser(user)} className="text-blue-600 p-1 rounded hover:bg-blue-50" title="Edit user"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDeleteUser(String(user.nim))} className="text-red-500 p-1 rounded hover:bg-red-50" title="Hapus user"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {usersView.rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                          Data user tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === LOMBA TAB === */}
          {activeTab === 'lombas' && (
            <div className="space-y-6 animate-fade-in" id="lomba-management-tab">
              <form onSubmit={handleAddLomba} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide pb-3 border-b border-slate-100">
                  Tambah Kompetisi Baru
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Judul Kompetisi</label>
                    <input type="text" required value={newLomba.title} onChange={(e) => setNewLomba({ ...newLomba, title: e.target.value })} placeholder="Misal: Business Case Competition 2026..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Kategori Tingkat</label>
                    <select value={newLomba.category} onChange={(e) => setNewLomba({ ...newLomba, category: e.target.value })} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800">
                      <option value="Nasional">Nasional</option>
                      <option value="Internasional">Internasional</option>
                      <option value="Regional">Regional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Total Nominal Hadiah</label>
                    <input type="text" required value={newLomba.prize} onChange={(e) => setNewLomba({ ...newLomba, prize: e.target.value })} placeholder="Rp. 25.000.000" className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tanggal Deadline</label>
                    <input type="date" required value={newLomba.deadline} onChange={(e) => setNewLomba({ ...newLomba, deadline: e.target.value })} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none font-mono" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tautan Gambar Poster (Google Drive)</label>
                    <input type="text" required value={newLomba.image} onChange={(e) => setNewLomba({ ...newLomba, image: e.target.value })} placeholder="Link share Google Drive poster..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none placeholder:italic" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tautan Pendaftaran</label>
                    <input type="text" required value={newLomba.registerLink} onChange={(e) => setNewLomba({ ...newLomba, registerLink: e.target.value })} placeholder="https://forms.gle/..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none font-mono" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Deskripsi Singkat</label>
                    <textarea required rows={2} value={newLomba.description} onChange={(e) => setNewLomba({ ...newLomba, description: e.target.value })} placeholder="Deskripsi ringkas..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Deskripsi Lengkap</label>
                    <textarea required rows={3} value={newLomba.deskripsi} onChange={(e) => setNewLomba({ ...newLomba, deskripsi: e.target.value })} placeholder="Penjelasan menyeluruh..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tema &amp; Subtema</label>
                    <textarea
                      required
                      rows={2}
                      value={newLomba.temaSubtema}
                      onChange={(e) => setNewLomba({ ...newLomba, temaSubtema: e.target.value })}
                      placeholder="Tema utama\nSubtema 1\nSubtema 2"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Timeline</label>
                    <textarea
                      required
                      rows={2}
                      value={newLomba.timeline}
                      onChange={(e) => setNewLomba({ ...newLomba, timeline: e.target.value })}
                      placeholder="Pendaftaran: Maret - Mei 2026\nSeleksi: Juni 2026"
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Syarat &amp; Ketentuan</label>
                    <textarea required rows={2} value={newLomba.syaratKetentuan} onChange={(e) => setNewLomba({ ...newLomba, syaratKetentuan: e.target.value })} placeholder="1. Mahasiswa S1 Aktif..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                </div>
                <button type="submit" className="rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white px-5 py-2.5 flex items-center space-x-1.5 cursor-pointer ml-auto">
                  <Plus className="h-4.5 w-4.5" /><span>Tambahkan Lomba</span>
                </button>
              </form>

              {renderTableControls(
                'lombas',
                'Data Lomba',
                lombas.length,
                lombasView.filteredCount,
                lombasView.page,
                lombasView.totalPages,
                getUniqueOptions(lombas, (item) => item.category),
                'Tingkat'
              )}

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
                    {lombasView.rows.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{l.title}</td>
                        <td className="px-5 py-4 uppercase text-[10px] tracking-wide text-indigo-700 font-bold">{l.category}</td>
                        <td className="px-5 py-4 font-mono text-red-600">{l.deadline}</td>
                        <td className="px-5 py-4">{l.prize}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeleteLomba(l.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {lombasView.rows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                          Data lomba tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === BEASISWA & TIMELINE TAB (REDESIGNED) === */}
          {activeTab === 'beasiswas' && (
            <div className="space-y-6 animate-fade-in" id="beasiswa-management-tab">

              {/* Add Beasiswa Form */}
              <form onSubmit={handleSaveBeasiswa} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide">
                    {editingBeasiswaId ? 'Edit Informasi Beasiswa' : 'Tambah Beasiswa Baru'}
                  </h3>
                  {editingBeasiswaId && (
                    <button type="button" onClick={resetBeasiswaForm} className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900">
                      Batal Edit
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Nama Program Beasiswa</label>
                    <input type="text" required value={newBeasiswa.title} onChange={(e) => setNewBeasiswa({ ...newBeasiswa, title: e.target.value })} placeholder="Misal: Beasiswa Astra..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Penyelenggara / Sponsor</label>
                    <input type="text" required value={newBeasiswa.provider} onChange={(e) => setNewBeasiswa({ ...newBeasiswa, provider: e.target.value })} placeholder="Misal: Astra Internasional..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Poster Google Drive</label>
                    <input type="text" value={newBeasiswa.image} onChange={(e) => setNewBeasiswa({ ...newBeasiswa, image: e.target.value })} placeholder="Tautan poster Gdrive..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none placeholder:italic" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Pendaftaran (URL)</label>
                    <input type="text" value={newBeasiswa.registerLink} onChange={(e) => setNewBeasiswa({ ...newBeasiswa, registerLink: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Deskripsi Ringkas</label>
                    <textarea rows={2} value={newBeasiswa.description} onChange={(e) => setNewBeasiswa({ ...newBeasiswa, description: e.target.value })} placeholder="Intisari info beasiswa..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Informasi Jadwal Seleksi</label>
                    <textarea
                      rows={4}
                      value={newBeasiswa.timeline}
                      onChange={(e) => setNewBeasiswa({ ...newBeasiswa, timeline: e.target.value })}
                      placeholder="Contoh: Pendaftaran dibuka Juni - Juli 2026. Seleksi administrasi dan pengumuman akan diinformasikan melalui kanal resmi penyelenggara."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Syarat dan Kriteria</label>
                    <textarea rows={3} value={newBeasiswa.requirements} onChange={(e) => setNewBeasiswa({ ...newBeasiswa, requirements: e.target.value })} placeholder="1. IPK minimal 3.00..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                </div>
                <button type="submit" className="rounded-lg bg-blue-700 hover:bg-blue-800 px-5 py-2.5 text-xs font-bold text-white flex items-center space-x-1.5 ml-auto">
                  {editingBeasiswaId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{editingBeasiswaId ? 'Update Beasiswa' : 'Simpan Beasiswa'}</span>
                </button>
              </form>

              {/* Beasiswa Cards with information management */}
              <div className="space-y-4">
                {renderTableControls(
                  'beasiswas',
                  'Daftar Beasiswa & Informasi',
                  beasiswas.length,
                  beasiswasView.filteredCount,
                  beasiswasView.page,
                  beasiswasView.totalPages,
                  getUniqueOptions(beasiswas, (item) => item.provider),
                  'Penyelenggara'
                )}

                {beasiswasView.rows.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-wider rounded-2xl border border-dashed border-slate-300 bg-white">
                    Data beasiswa tidak ditemukan.
                  </div>
                ) : (
                  beasiswasView.rows.map((b) => {
                    const hasScheduleInfo = Boolean((b.timeline || '').trim());
                    return (
                      <div key={b.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        {/* Beasiswa Header Card */}
                        <div className="flex items-center justify-between p-5 gap-3">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            {/* QR Code preview */}
                            {b.registerLink && (
                              <img
                                src={generateQRCodeUrl(b.registerLink, 80)}
                                alt="QR"
                                className="h-12 w-12 rounded-lg border border-slate-100 shrink-0 hidden sm:block"
                              />
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{b.title}</h4>
                              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{b.provider}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                              {hasScheduleInfo ? 'Info jadwal tersedia' : 'Info jadwal kosong'}
                            </span>
                            <button onClick={() => handleEditBeasiswa(b)} className="text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition" title="Edit informasi beasiswa">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteBeasiswa(b.id)} className="text-red-500 p-2 rounded-lg hover:bg-red-50 transition" title="Hapus beasiswa">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* === WEBINAR TAB === */}
          {activeTab === 'webinars' && (
            <div className="space-y-6 animate-fade-in" id="webinar-management-tab">
              <form onSubmit={handleAddWebinar} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide pb-3 border-b border-slate-100">
                  Tambah Webinar Baru
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Judul Webinar</label>
                    <input type="text" required value={newWebinar.title} onChange={(e) => setNewWebinar({ ...newWebinar, title: e.target.value })} placeholder="Misal: Webinar SATELIT 2026..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Narasumber / Pembicara</label>
                    <input type="text" required value={newWebinar.speakerName} onChange={(e) => setNewWebinar({ ...newWebinar, speakerName: e.target.value })} placeholder="Achmad Aditya, Ph.D..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Hari &amp; Tanggal</label>
                    <input type="text" required value={newWebinar.dateStr} onChange={(e) => setNewWebinar({ ...newWebinar, dateStr: e.target.value })} placeholder="20 Juli, 2026..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Alokasi Waktu</label>
                    <input type="text" required value={newWebinar.timeStr} onChange={(e) => setNewWebinar({ ...newWebinar, timeStr: e.target.value })} placeholder="10:00 - Selesai..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Gambar Gdrive</label>
                    <input type="text" required value={newWebinar.image} onChange={(e) => setNewWebinar({ ...newWebinar, image: e.target.value })} placeholder="Shareable Gdrive URL..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none placeholder:italic" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Pendaftaran</label>
                    <input type="text" required value={newWebinar.registerLink} onChange={(e) => setNewWebinar({ ...newWebinar, registerLink: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Benefit (pisahkan koma)</label>
                    <input type="text" required value={newWebinar.benefits as any} onChange={(e) => setNewWebinar({ ...newWebinar, benefits: e.target.value as any })} placeholder="E-Sertifikat, Materi PDF, Networking" className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Deskripsi Acara</label>
                    <textarea required rows={3} value={newWebinar.description} onChange={(e) => setNewWebinar({ ...newWebinar, description: e.target.value })} placeholder="Webinar ini akan membahas..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                </div>
                <button type="submit" className="rounded-lg bg-teal-600 hover:bg-teal-700 font-bold text-xs text-white px-5 py-2.5 flex items-center space-x-1.5 ml-auto">
                  <Plus className="h-4 w-4" /><span>Simpan Webinar</span>
                </button>
              </form>

              {renderTableControls(
                'webinars',
                'Data Webinar',
                webinars.length,
                webinarsView.filteredCount,
                webinarsView.page,
                webinarsView.totalPages,
                getUniqueOptions(webinars, (item) => item.status),
                'Status'
              )}

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
                    {webinarsView.rows.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{w.title}</td>
                        <td className="px-5 py-4 text-slate-600">{w.speakerName}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeleteWebinar(w.id)} className="text-red-500 p-1 rounded hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {webinarsView.rows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                          Data webinar tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === CERTIFICATION TAB === */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 animate-fade-in" id="cert-management-tab">
              <form onSubmit={handleAddCert} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide pb-3 border-b border-slate-100">
                  Tambah Sertifikasi Profesional Baru
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Nama Sertifikasi</label>
                    <input type="text" required value={newCert.title} onChange={(e) => setNewCert({ ...newCert, title: e.target.value })} placeholder="Ahli K3 Umum..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Provider</label>
                    <input type="text" required value={newCert.provider} onChange={(e) => setNewCert({ ...newCert, provider: e.target.value })} placeholder="BNSP atau Microsoft..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Kategori</label>
                    <select value={newCert.category} onChange={(e) => setNewCert({ ...newCert, category: e.target.value })} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800">
                      <option value="Manajemen & Operasional">Manajemen &amp; Operasional</option>
                      <option value="Analisis & Data">Analisis &amp; Data</option>
                      <option value="K3 & Lingkungan">K3 &amp; Lingkungan</option>
                      <option value="Rantai Pasok">Rantai Pasok</option>
                      <option value="Sistem & Proses">Sistem &amp; Proses</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Biaya</label>
                    <input type="text" required value={newCert.fee} onChange={(e) => setNewCert({ ...newCert, fee: e.target.value })} placeholder="Rp 1.500.000..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Link Pendaftaran</label>
                    <input type="text" required value={newCert.registerLink} onChange={(e) => setNewCert({ ...newCert, registerLink: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Deskripsi</label>
                    <textarea required rows={3} value={newCert.description} onChange={(e) => setNewCert({ ...newCert, description: e.target.value })} placeholder="Sertifikasi ini melatih siswa untuk..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                </div>
                <button type="submit" className="rounded-lg bg-purple-700 hover:bg-purple-800 px-5 py-2.5 text-xs font-bold text-white flex items-center space-x-1.5 ml-auto">
                  <Plus className="h-4 w-4" /><span>Simpan Sertifikasi</span>
                </button>
              </form>

              {renderTableControls(
                'certifications',
                'Data Sertifikasi',
                certifications.length,
                certificationsView.filteredCount,
                certificationsView.page,
                certificationsView.totalPages,
                getUniqueOptions(certifications, (item) => item.category),
                'Kategori'
              )}

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
                    {certificationsView.rows.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{c.title}</td>
                        <td className="px-5 py-4 text-purple-700 font-bold">{c.provider}</td>
                        <td className="px-5 py-4 font-bold text-emerald-800">{c.fee}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeleteCert(c.id)} className="text-red-500 p-1.5 rounded hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {certificationsView.rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                          Data sertifikasi tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === PRESTASI TAB === */}
          {activeTab === 'prestasis' && (
            <div className="space-y-6 animate-fade-in" id="prestasi-management-tab">
              <form onSubmit={handleAddPrest} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wide pb-3 border-b border-slate-100">
                  Tambah Rekam Prestasi Mahasiswa Baru
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Nama Tim / Jawara</label>
                    <input type="text" required value={newPrest.name} onChange={(e) => setNewPrest({ ...newPrest, name: e.target.value })} placeholder="Misal: Tim Optima..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Judul Karya</label>
                    <input type="text" required value={newPrest.title} onChange={(e) => setNewPrest({ ...newPrest, title: e.target.value })} placeholder="OptFlow: Optimasi Aliran Produksi..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Kategori Bidang</label>
                    <input type="text" required value={newPrest.category} onChange={(e) => setNewPrest({ ...newPrest, category: e.target.value })} placeholder="Essay, KTI, Business Plan..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Penyelenggara</label>
                    <input type="text" required value={newPrest.organizer} onChange={(e) => setNewPrest({ ...newPrest, organizer: e.target.value })} placeholder="Kementrian Perindustrian RI..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tingkat</label>
                    <select value={newPrest.level} onChange={(e) => setNewPrest({ ...newPrest, level: e.target.value })} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800">
                      <option value="Nasional">Nasional</option>
                      <option value="Internasional">Internasional</option>
                      <option value="Regional">Regional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Peringkat</label>
                    <select value={newPrest.rank} onChange={(e) => setNewPrest({ ...newPrest, rank: e.target.value })} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800">
                      <option value="Juara 1">Juara 1 🥇</option>
                      <option value="Juara 2">Juara 2 🥈</option>
                      <option value="Juara 3">Juara 3 🥉</option>
                      <option value="Juara Terbaik">Juara Harapan / Finalis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Tahun</label>
                    <input type="text" required value={newPrest.year} onChange={(e) => setNewPrest({ ...newPrest, year: e.target.value })} placeholder="2026..." className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none font-mono" />
                  </div>
                </div>
                <button type="submit" className="rounded-lg bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white px-5 py-2.5 flex items-center space-x-1.5 ml-auto">
                  <Plus className="h-4 w-4" /><span>Simpan Prestasi</span>
                </button>
              </form>

              {renderTableControls(
                'prestasis',
                'Data Prestasi',
                prestasis.length,
                prestasisView.filteredCount,
                prestasisView.page,
                prestasisView.totalPages,
                getUniqueOptions(prestasis, (item) => item.level),
                'Tingkat'
              )}

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
                    {prestasisView.rows.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">{p.name}</td>
                        <td className="px-5 py-4">{p.title}</td>
                        <td className="px-5 py-4 text-rose-700 font-bold">{p.rank}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeletePrest(p.id)} className="text-red-500 p-1 rounded hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {prestasisView.rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                          Data prestasi tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fullscreen Action Loading Overlay */}
      {actionLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs p-6 animate-fade-in">
          <div className="rounded-3xl bg-white p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-xs animate-scale-up">
            {/* Spinning Loader */}
            <div className="relative flex h-14 w-14 items-center justify-center mb-4">
              {/* Outer double ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-900/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-900 border-l-blue-900 animate-spin" />
            </div>
            
            <h4 className="text-sm font-extrabold text-blue-950 uppercase tracking-wider mb-2 font-display">
              Sinkronisasi Data
            </h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Menyimpan perubahan ke Google Sheets. Harap tunggu beberapa saat...
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
