import { useState, useEffect } from 'react';
import { Lomba, Prestasi } from '../types';
import { 
  ArrowLeft, Calendar, Award, Trophy, Search, ChevronRight, Share2, ExternalLink, Filter, HelpCircle, FileText, Info, Award as AwardIcon, MapPin 
} from 'lucide-react';

interface LombaPageProps {
  onNavigate: (page: string) => void;
  initialViewMode?: 'landing' | 'grid' | 'details' | 'prestasi';
}

export default function LombaPage({ onNavigate, initialViewMode = 'landing' }: LombaPageProps) {
  const [viewMode, setViewMode] = useState<'landing' | 'grid' | 'details' | 'prestasi'>(initialViewMode);
  
  // Data lists from Backend
  const [lombas, setLombas] = useState<Lomba[]>([]);
  const [prestasis, setPrestasis] = useState<Prestasi[]>([]);
  const [selectedLomba, setSelectedLomba] = useState<Lomba | null>(null);
  
  // Loading & Filter states
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDetailsTab, setActiveDetailsTab] = useState<'deskripsi' | 'tema' | 'timeline' | 'syarat' | 'faq'>('deskripsi');
  
  // Custom Date range filter states (Page 8 mock filter)
  const [dateFilter, setDateFilter] = useState({ start: '2026-04-01', end: '2026-04-30' });
  const [filterApplied, setFilterApplied] = useState(false);

  // Pagination states for Achievements (Page 10)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Retrieve Lomba & Prestasi datasets from server API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lombaRes, prestRes] = await Promise.all([
          fetch('/api/lombas'),
          fetch('/api/prestasis')
        ]);
        
        let lombaData = await lombaRes.json();
        let prestData = await prestRes.json();
        
        setLombas(lombaData);
        setPrestasis(prestData);
      } catch (e) {
        console.error('Failed fetching competitions database', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Active Lomba based on date range (mock filter)
  const getFilteredLombas = () => {
    if (!filterApplied) return lombas;
    return lombas.filter(l => {
      // Custom date filter logic
      const deadlineDate = new Date(l.deadline);
      const filterStart = new Date(dateFilter.start);
      const filterEnd = new Date(dateFilter.end);
      return deadlineDate >= filterStart && deadlineDate <= filterEnd;
    });
  };

  // Searching achievements table
  const getFilteredPrestasis = () => {
    if (!searchQuery) return prestasis;
    const q = searchQuery.toLowerCase();
    return prestasis.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.organizer.toLowerCase().includes(q)
    );
  };

  // Pagination bounds calculation
  const filteredPrestList = getFilteredPrestasis();
  const totalPages = Math.ceil(filteredPrestList.length / itemsPerPage) || 1;
  const paginatedPrestList = filteredPrestList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleApplyFilter = () => {
    setFilterApplied(true);
  };

  const handleResetFilter = () => {
    setFilterApplied(false);
  };

  const handleOpenLombaDetails = (lomba: Lomba) => {
    setSelectedLomba(lomba);
    setViewMode('details');
    setActiveDetailsTab('deskripsi');
  };

  // Medal Badge element generators (rendered elegantly on Page 10)
  const renderMedal = (rank: string) => {
    const value = rank.toLowerCase();
    if (value.includes('1')) {
      return (
        <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200 shadow-sm">
          <Trophy className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>Juara 1 🥇</span>
        </span>
      );
    } else if (value.includes('2')) {
      return (
        <span className="inline-flex items-center space-x-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
          <Trophy className="h-3.5 w-3.5 text-slate-400 fill-slate-350" />
          <span>Juara 2 🥈</span>
        </span>
      );
    } else if (value.includes('3')) {
      return (
        <span className="inline-flex items-center space-x-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-850 border border-orange-200">
          <Trophy className="h-3.5 w-3.5 text-orange-600 fill-orange-500" />
          <span>Juara 3 🥉</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 border border-blue-100">
        <Award className="h-3.5 w-3.5 text-blue-500" />
        <span>{rank}</span>
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full" id="lomba-section-page">
      
      {/* ----------------- SELECTION VIEW MODE: LANDING (Page 6 & 7) ----------------- */}
      {viewMode === 'landing' && (
        <div className="space-y-8 animate-fade-in" id="landing-flow">
          {/* Page 6: Hero section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tile 1: Hero welcome banner (Spans 2 columns on lg view) */}
            <div 
              className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-cover bg-center h-[24rem] flex flex-col justify-between p-8 sm:p-12 shadow-xl border border-blue-950/10 group"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.5)), url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200')`
              }}
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-lime-400/20 rounded-full filter blur-2xl pointer-events-none" />
              
              <div>
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-[#a3e635] bg-lime-400/10 px-3 py-1.5 rounded-full border border-lime-400/20">
                  Pusat Kompetensi Mahasiswa • Teknik Industri
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight font-display uppercase leading-tight text-white">
                  Temukan Lomba,<br />
                  <span className="text-lime-400">Wujudkan Ide,</span> Raih Prestasi!
                </h2>
                <p className="mt-2 text-xs text-slate-200 font-medium leading-relaxed max-w-md">
                  Jelajahi berbagai kompetisi tingkat nasional hingga internasional profesional untuk mengasah penalaran rekayasa industri Anda dan memenangkan penghargaan bergengsi.
                </p>
              </div>

              <div>
                <button 
                  onClick={() => setViewMode('grid')}
                  className="rounded-xl bg-lime-400 hover:bg-lime-500 hover:scale-[1.02] text-slate-900 font-extrabold text-xs px-6 py-3.5 shadow-md active:scale-95 transition-all"
                >
                  TEMUKAN LOMBA SEKARANG
                </button>
              </div>
            </div>

            {/* Tile 2: Platform Status Overview (Right Side dark bento box) */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl border border-slate-800" id="bento-tile-stats-lomba">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">Statistik Kompetisi</span>
                <h3 className="text-lg font-bold font-display mt-1 text-amber-400">ARSIP PRESTASI</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Kami merekam gelaran jawara dan kompetisi proaktif secara sitematis untuk meningkatkan daya saing mahasiswa TI.
                </p>
              </div>
              
              <div className="my-6 space-y-3">
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                  <span className="text-slate-400">Total Kompetisi Terbuka</span>
                  <span className="font-mono font-bold text-lime-400">{lombas.length || '24'} Lomba</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                  <span className="text-slate-400">Database Rekap Juara</span>
                  <span className="font-mono font-bold text-lime-400">{prestasis.length || '12'} Karya</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Update Dashboard Berkala</span>
              </div>
            </div>

          </div>

          {/* Page 7: Two big categories selection styled in custom bento */}
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto pt-4" id="dual-landing-actions">
            
            {/* Action 1: Active Competitions summary */}
            <div 
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between hover:border-blue-900/25"
              id="sum-active-lombas"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 border border-blue-100 mb-5">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-blue-950 font-display uppercase">
                  Ringkasan Lomba Aktif
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Akses infografis pamflet jadwal pendaftaran terlengkap dari gelaran Business Plan, Karya Tulis Ilmiah (KTI), hingga Hackathon nasional.
                </p>
                <div className="mt-4 flex items-baseline space-x-1 text-blue-900">
                  <span className="text-4xl font-extrabold tracking-tight font-display">{lombas.length || '24'}</span>
                  <span className="text-xs font-semibold text-slate-400">Lomba Aktif Terdaftar</span>
                </div>
              </div>
              <button 
                onClick={() => setViewMode('grid')}
                className="mt-6 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 shadow transition duration-300"
              >
                JELAJAHI KOMPETISI →
              </button>
            </div>

            {/* Action 2: Achievements Database */}
            <div 
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between hover:border-amber-500/25"
              id="sum-student-achievements"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 mb-5">
                  <AwardIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-blue-950 font-display uppercase">
                  Database Prestasi
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Inspirasi karya mahasiswa. Rekam jejak podium juara kompetisi dari kolektif alumni dan mahasiswa aktif Teknik Industri Untirta.
                </p>
                <div className="mt-4 flex items-baseline space-x-1 text-amber-700">
                  <span className="text-4xl font-extrabold tracking-tight font-display">{prestasis.length || '12'}</span>
                  <span className="text-xs font-semibold text-slate-400 font-sans">Karya Juara</span>
                </div>
              </div>
              <button 
                onClick={() => setViewMode('prestasi')}
                className="mt-6 w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-3.5 shadow transition duration-300"
              >
                LIHAT REKAM PRESTASI →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ----------------- COLLECTION VIEW MODE: GRID (Page 8) ----------------- */}
      {viewMode === 'grid' && (
        <div className="space-y-6 animate-fade-in" id="grid-flow">
          {/* Header & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <button 
              onClick={() => setViewMode('landing')}
              className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-900 transition"
              id="grid-back-btn"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>
            <h2 className="text-xl font-extrabold text-blue-950 font-display flex items-center space-x-2">
              <Calendar className="h-5.5 w-5.5 text-blue-900" />
              <span>Jelajahi Kompetisi Aktif</span>
            </h2>
          </div>

          {/* Date Filter Panel matching Page 8 */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm" id="date-filter-panel">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Pilih Tanggal:</span>
              <div className="flex items-center space-x-2">
                <input 
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                  className="rounded-xl bg-slate-50 border border-slate-200 text-xs p-2.5 focus:outline-none focus:border-blue-900 text-slate-700 font-mono"
                />
                <span className="text-xs text-slate-400">s/d</span>
                <input 
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                  className="rounded-xl bg-slate-50 border border-slate-200 text-xs p-2.5 focus:outline-none focus:border-blue-900 text-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={handleApplyFilter}
                className="rounded-xl bg-lime-400 hover:bg-lime-500 px-5 py-2 text-xs font-extrabold text-slate-900 shadow-sm transition"
              >
                Terapkan Filter
              </button>
              {filterApplied && (
                <button 
                  onClick={handleResetFilter}
                  className="rounded-xl bg-slate-105 hover:bg-slate-200 px-4 py-2 text-xs font-extrabold text-slate-600 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Competitions Grid layout matching Page 8 */}
          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400 font-semibold uppercase tracking-widest">
              Memuat data lomba...
            </div>
          ) : getFilteredLombas().length === 0 ? (
            <div className="py-24 text-center rounded-3xl bg-white border border-slate-200 text-xs text-slate-400 font-bold uppercase tracking-wider">
              Tidak ada lomba yang berakhir pada rentang tanggal tersebut.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="lomba-grid-items">
              {getFilteredLombas().map((lomba) => (
                <div 
                  key={lomba.id}
                  className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 flex flex-col h-full p-2"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden rounded-2xl border border-slate-100">
                    <img 
                      src={lomba.image} 
                      alt={lomba.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                    {/* Category Overlay */}
                    <span className="absolute top-3 left-3 rounded-lg bg-slate-950 px-2.5 py-1 text-[8px] font-extrabold tracking-wider text-white uppercase shadow">
                      {lomba.category}
                    </span>
                  </div>

                  {/* Info body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1.5 font-display group-hover:text-blue-900 transition">
                        {lomba.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {lomba.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        <span className="block font-bold">DEADLINE</span>
                        <span className="font-mono text-xs text-red-650 font-semibold">
                          {new Date(lomba.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleOpenLombaDetails(lomba)}
                        className="rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-955 text-[10px] font-extrabold uppercase tracking-wider px-4 py-2.5 shadow-sm transition"
                      >
                        SELENGKAPNYA...
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- SPECIFIC VIEW MODE: DETAILS (Page 9) ----------------- */}
      {viewMode === 'details' && selectedLomba && (
        <div className="space-y-8 animate-fade-in" id="details-flow">
          {/* Header Action Back */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <button 
              onClick={() => setViewMode('grid')}
              className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-900 transition"
              id="details-back-btn"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Daftar</span>
            </button>
            <span className="text-xs font-mono font-bold text-slate-400">
              KODE LOMBA: {selectedLomba.id}
            </span>
          </div>

          {/* Split Panel: Poster preview vs Key Info */}
          <div className="grid gap-8 md:grid-cols-12 items-start" id="details-panels-split">
            {/* Poster card block */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 shadow">
              <img 
                src={selectedLomba.image} 
                alt={selectedLomba.title}
                className="w-full h-auto rounded-xl object-contain max-h-[28rem] bg-slate-50"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Core facts */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-900 uppercase mb-3">
                  {selectedLomba.category} / Kompetisi Mahasiswa
                </span>
                <h1 className="text-2xl font-black text-blue-950 font-display sm:text-3xl leading-tight uppercase">
                  {selectedLomba.title}
                </h1>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed text-justify">
                  {selectedLomba.description}
                </p>
              </div>

              {/* Deadline & Prizes grid cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-blue-50/50 border border-blue-100/50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Batas Pendaftaran</span>
                  <div className="flex items-center space-x-2 text-blue-900">
                    <Calendar className="h-5 w-5 shrink-0 text-blue-700" />
                    <span className="text-sm font-bold font-mono">
                      {new Date(selectedLomba.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50/50 border border-emerald-100/50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Hadiah</span>
                  <div className="flex items-center space-x-2 text-emerald-900">
                    <Trophy className="h-5 w-5 shrink-0 text-emerald-700" />
                    <span className="text-sm font-bold font-mono text-emerald-800">
                      {selectedLomba.prize}
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration external link */}
              <a 
                href={selectedLomba.registerLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-lime-500 hover:bg-lime-600 py-3.5 text-xs font-extrabold uppercase tracking-widest text-slate-900 shadow-md transition"
                id="details-register-btn"
              >
                <span>Daftar Sekarang</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Tabbed documentation details */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" id="details-markdown-tabs">
            {/* Tab navigation headers */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 overflow-x-auto">
              {[
                { id: 'deskripsi', label: 'Deskripsi', icon: FileText },
                { id: 'tema', label: 'Tema & Subtema', icon: Info },
                { id: 'timeline', label: 'Timeline', icon: Calendar },
                { id: 'syarat', label: 'Syarat & Ketentuan', icon: Award },
                { id: 'faq', label: 'FAQ Lomba', icon: HelpCircle },
              ].map((tab) => {
                const isCurrent = activeDetailsTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailsTab(tab.id as any)}
                    className={`flex items-center space-x-1.5 px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition cursor-pointer ${
                      isCurrent 
                        ? 'border-blue-900 text-blue-900 bg-white' 
                        : 'border-transparent text-slate-500 hover:text-blue-900 bg-slate-50/30'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* active text preview tab */}
            <div className="p-6 text-xs text-slate-600 leading-relaxed text-justify space-y-4">
              {activeDetailsTab === 'deskripsi' && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 font-display">Deskripsi Lengkap Lomba</h4>
                  <p className="whitespace-pre-line bg-slate-50/50 rounded-lg p-4 border border-slate-100 italic">
                    {selectedLomba.deskripsi || selectedLomba.description}
                  </p>
                </div>
              )}

              {activeDetailsTab === 'tema' && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 font-display">Tema Utama & Cakupan Subtema</h4>
                  <div className="rounded-lg bg-blue-50/30 border border-blue-100 p-4">
                    <p className="font-bold text-blue-950 text-sm mb-2">Tema: {selectedLomba.temaSubtema || 'Optimasi Rantai Pasok Berkelanjutan'}</p>
                    <p className="text-slate-550 leading-relaxed">Subtema mencakup integrasi Simulasi Industri (Arena/Promodel), optimasi green logistics, perancangan ergonomis tata letak fasilitas pabrik, dan hilirisasi riset di era society 5.0.</p>
                  </div>
                </div>
              )}

              {activeDetailsTab === 'timeline' && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 font-display">Milestone / Agenda Lomba</h4>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 font-mono whitespace-pre-line leading-relaxed text-slate-700">
                    {selectedLomba.timeline || 'Hubungi panitia penyelenggara terkait rincian gelombang pendaftaran.'}
                  </div>
                </div>
              )}

              {activeDetailsTab === 'syarat' && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 font-display">Persyaratan & Dokumen Utama</h4>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 whitespace-pre-line leading-relaxed">
                    {selectedLomba.syaratKetentuan || 'Umum untuk mahasiswa diploma kualifikasi Sarjana S1.'}
                  </div>
                </div>
              )}

              {activeDetailsTab === 'faq' && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 font-display font-display">FAQ Tambahan Kompetisi</h4>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 whitespace-pre-line italic text-slate-650">
                    {selectedLomba.faq || 'Tidak ada FAQ khusus untuk lomba ini. Sila hubungi panitia melalui portal pendaftaran.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SELECTION VIEW MODE: ACHIEVEMENTS DATABASE (Page 10) ----------------- */}
      {viewMode === 'prestasi' && (
        <div className="space-y-6 animate-fade-in" id="prestasi-flow">
          {/* Header toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <button 
              onClick={() => setViewMode('landing')}
              className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-900 transition"
              id="prestasi-back-btn"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>
            <h2 className="text-xl font-extrabold text-blue-950 font-display flex items-center space-x-2">
              <AwardIcon className="h-5.5 w-5.5 text-blue-900" />
              <span>Database Prestasi Lomba</span>
            </h2>
          </div>

          <p className="text-xs text-slate-550 -mt-2">
            Inspirasi dari prestasi mahasiswa Teknik Industri. Merangkum karya luar biasa jawara civitas di kancah nasional dan departemen.
          </p>

          {/* Search bar layout Page 10 */}
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset page on filter alteration
              }}
              placeholder="Cari nama jawara, judul karya, atau jenis lomba .."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-900 shadow-sm"
              id="prestasi-search-input"
            />
          </div>

          {/* Table representing datagrid from Page 10 */}
          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
              Memuat data prestasi...
            </div>
          ) : paginatedPrestList.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-white border border-slate-200 text-xs text-slate-400 font-bold uppercase tracking-wider">
              Tidak ada data prestasi yang cocok dengan pencarian Anda.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm" id="prestasi-table-wrapper">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Nama Peserta/Tim</th>
                    <th className="px-5 py-4">Judul Karya</th>
                    <th className="px-5 py-4">Jenis Lomba</th>
                    <th className="px-5 py-4">Tingkat</th>
                    <th className="px-5 py-4">Tahun</th>
                    <th className="px-5 py-4">Penyelenggara</th>
                    <th className="px-5 py-4 text-center">Juara Terbaik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                  {paginatedPrestList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition duration-100">
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900">{item.name}</td>
                      <td className="px-5 py-4 max-w-[200px] truncate" title={item.title}>{item.title}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{item.category}</td>
                      <td className="px-5 py-4 whitespace-nowrap uppercase text-[10px] tracking-wide text-slate-500">{item.level}</td>
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-600">{item.year}</td>
                      <td className="px-5 py-4">{item.organizer}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">{renderMedal(item.rank)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginator footer representing `< 1 2 3 ... 10 >` layout */}
          {!loading && paginatedPrestList.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200" id="prestasi-pagination-footer">
              <span className="text-xs text-slate-400 font-medium font-sans">
                Terlihat {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredPrestList.length)} dari {filteredPrestList.length} rekam prestasi
              </span>

              <div className="flex items-center space-x-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 selection:bg-slate-50 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                      currentPage === i + 1
                        ? 'bg-blue-900 text-white font-extrabold shadow'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
