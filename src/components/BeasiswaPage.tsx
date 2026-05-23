import { useState, useEffect } from 'react';
import { Beasiswa, BeasiswaTimeline } from '../types';
import { ArrowLeft, ExternalLink, Calendar, CheckSquare, QrCode, ClipboardList, GraduationCap, Clock, Award } from 'lucide-react';

interface BeasiswaPageProps {
  onNavigate: (page: string) => void;
  initialViewMode?: 'landing' | 'grid' | 'details';
}

export default function BeasiswaPage({ onNavigate, initialViewMode = 'landing' }: BeasiswaPageProps) {
  const [viewMode, setViewMode] = useState<'landing' | 'grid' | 'details'>(initialViewMode);
  const [beasiswas, setBeasiswas] = useState<Beasiswa[]>([]);
  const [beasiswaTimelines, setBeasiswaTimelines] = useState<BeasiswaTimeline[]>([]);
  const [selectedBeasiswa, setSelectedBeasiswa] = useState<Beasiswa | null>(null);
  const [loading, setLoading] = useState(true);

  // Retrieve scholarships from server API
  useEffect(() => {
    const fetchBeasiswas = async () => {
      try {
        setLoading(true);
        const [res, timelineRes] = await Promise.all([
          fetch('/api/beasiswas'),
          fetch('/api/beasiswa-timelines')
        ]);
        const data = await res.json();
        const timelineData = await timelineRes.json();
        setBeasiswas(data);
        setBeasiswaTimelines(timelineData);
      } catch (err) {
        console.error('Error loading scholarships', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBeasiswas();
  }, []);

  const handleOpenDetails = (b: Beasiswa) => {
    setSelectedBeasiswa(b);
    setViewMode('details');
  };

  const getTimelineRows = (beasiswa: Beasiswa): BeasiswaTimeline[] => {
    const structuredRows = beasiswaTimelines
      .filter((item) => item.beasiswaId === beasiswa.id)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

    if (structuredRows.length > 0) {
      return structuredRows;
    }

    return (beasiswa.timeline || '')
      .split('\n')
      .map((line, index) => {
        const [phase, ...dateParts] = line.split(':');
        return {
          id: `${beasiswa.id}-legacy-${index}`,
          beasiswaId: beasiswa.id,
          phase: (dateParts.length ? phase : line).trim(),
          date: dateParts.join(':').trim(),
          sortOrder: index + 1
        };
      })
      .filter((item) => item.phase);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full" id="beasiswa-section-page">
      
      {/* ----------------- SUB-VIEW MODE: LANDING (Page 11 & 12) ----------------- */}
      {viewMode === 'landing' && (
        <div className="space-y-8 animate-fade-in" id="beasiswa-landing">
          
          {/* Bento-style landing container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tile 1: Hero Welcome Banner (spans 2 columns on large viewports) */}
            <div 
              className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-cover bg-center h-[24rem] flex flex-col justify-between p-8 sm:p-12 shadow-xl border border-blue-950/10 group"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.6)), url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200')`
              }}
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-lime-400/20 rounded-full filter blur-2xl pointer-events-none" />
              
              <div>
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-[#a3e635] bg-lime-400/10 px-3 py-1.5 rounded-full border border-lime-400/20">
                  Peluang Pendanaan Kuliah • Jurusan TI
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight font-display uppercase leading-tight text-white">
                  Raih Impian<br />
                  <span className="text-amber-400">Pendidikanmu</span>
                </h2>
                <p className="mt-2 text-xs text-slate-200 font-medium leading-relaxed max-w-md">
                  Temukan ratusan info beasiswa sarjana terbaik di Indonesia dari BUMN, swasta, yayasan sosial, hingga jalur prestasi prodi khusus mahasiswa Teknik Industri.
                </p>
              </div>

              <div>
                <button 
                  onClick={() => setViewMode('grid')}
                  className="rounded-xl bg-lime-400 hover:bg-lime-500 hover:scale-[1.02] text-slate-900 font-extrabold text-xs px-6 py-3.5 shadow-md active:scale-95 transition-all"
                >
                  TEMUKAN BEASISWA SEKARANG
                </button>
              </div>
            </div>

            {/* Tile 2: S1 scholarship focus widget (Right Bento Box) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between text-center lg:text-left hover:shadow-md transition-all duration-300" id="beasiswa-categories">
              <div className="space-y-4">
                <div className="mx-auto lg:mx-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 shadow-inner border border-blue-100">
                  <GraduationCap className="h-8 w-8 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-950 font-display uppercase">
                    Beasiswa untuk S1
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed text-center lg:text-left">
                    Konsolidasi pendaftaran program beasiswa eksklusif jenjang Sarjana (S1). Kami merangkum penyedia terpercaya untuk mempercepat akses mahasiswa.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewMode('grid')}
                className="mt-6 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 shadow transition-all duration-300"
              >
                SELENGKAPNYA →
              </button>
            </div>

          </div>

          {/* Quick Informational Bento Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">Kriteria Rata-Rata</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                IPK minimal 3.00, aktif organisasi, dan diutamakan berkelakuan baik serta berasal dari program studi Teknik Industri.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">Penyusun Terlama</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Informasi dikumpulkan oleh tim HMTI Untirta lewat verifikasi dari portal dikti, kemitraan internal, dan pamflet resmi.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:col-span-2 lg:col-span-1">
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">Peringatan Seleksi</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Waspada penipuan! Pengajuan beasiswa resmi tidak dipungut biaya apapun di setiap tahap pendaftaran/seleksi berkas.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ----------------- SUB-VIEW MODE: GRID (Page 13) ----------------- */}
      {viewMode === 'grid' && (
        <div className="space-y-6 animate-fade-in" id="beasiswa-grid">
          {/* Header Action toolbar */}
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
              <GraduationCap className="h-5.5 w-5.5 text-blue-900" />
              <span>Daftar Beasiswa Sarjana (S1)</span>
            </h2>
          </div>

          {/* Card list representing Page 13 grid */}
          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
              Memuat data beasiswa...
            </div>
          ) : beasiswas.length === 0 ? (
            <div className="py-24 text-center text-slate-400 border border-slate-200 rounded-3xl bg-white text-xs font-bold uppercase tracking-wider">
              Tidak ada beasiswa yang tersedia.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="beasiswa-cards-list">
              {beasiswas.map((item) => (
                <div 
                  key={item.id}
                  className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 flex flex-col justify-between overflow-hidden p-2"
                >
                  <div className="relative h-44 w-full bg-slate-50 overflow-hidden rounded-2xl border border-slate-100">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 rounded-lg bg-slate-900 px-2.5 py-1 text-[8px] font-extrabold text-white tracking-wider uppercase shadow">
                      {item.provider}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-2 font-display line-clamp-1 group-hover:text-blue-900 transition">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={() => handleOpenDetails(item)}
                        className="rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-4 py-2.5 shadow-sm transition"
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

      {/* ----------------- SUB-VIEW MODE: DETAILS (Page 14) ----------------- */}
      {viewMode === 'details' && selectedBeasiswa && (
        <div className="space-y-8 animate-fade-in" id="beasiswa-details">
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
              KODE SCHOLARSHIP: {selectedBeasiswa.id}
            </span>
          </div>

          {/* Split view: Poster vs Info (including Horizontal Timeline tree matching Page 14) */}
          <div className="grid gap-8 md:grid-cols-12 items-start" id="beasiswa-details-layout">
            
            {/* Poster picture block on Left */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 shadow">
              <img 
                src={selectedBeasiswa.image} 
                alt={selectedBeasiswa.title}
                className="w-full h-auto rounded-xl object-contain max-h-[28rem] bg-slate-50"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Core scholarship details on Right */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <span className="inline-block rounded bg-blue-900 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider mb-2">
                  DIPERSEMBAHKAN OLEH {selectedBeasiswa.provider.toUpperCase()}
                </span>
                <h1 className="text-2xl font-black text-blue-950 font-display sm:text-3xl leading-tight uppercase">
                  {selectedBeasiswa.title}
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {selectedBeasiswa.description}
                </p>
              </div>

              {/* Requirement Bullet points from Page 14 */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                  <ClipboardList className="h-4 w-4 text-slate-400" />
                  <span>Kriteria & Persyaratan Utama</span>
                </span>
                <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 rounded-lg p-3 text-justify">
                  {selectedBeasiswa.requirements}
                </div>
              </div>

              {/* QR Code and Apply link display from Page 14 */}
              <div className="grid gap-4 sm:grid-cols-12 items-center bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
                {/* QR block code in desktop */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-3.5 bg-white border border-slate-150 rounded-xl">
                  {/* Decorative CSS QR code frame */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm p-1">
                    <QrCode className="h-16 w-16 text-amber-400" />
                  </div>
                  <span className="mt-2 text-[9px] font-semibold text-slate-400 uppercase tracking-wide text-center">
                    Scan Detail QR
                  </span>
                </div>

                <div className="sm:col-span-8 space-y-3 text-center sm:text-left">
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Arahkan kamera ponsel Anda pada kode QR di sebelah kiri untuk melihat rilis dokumen panduan resmi pendaftaran beasiswa ini.
                  </p>
                  <a 
                    href={selectedBeasiswa.registerLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-lime-500 hover:bg-lime-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-950 shadow transition"
                  >
                    <span>Link Pendaftaran</span>
                    <ExternalLink className="h-4.5 w-4.5" />
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Timeline Tree Board (Page 14 representation) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-2 pb-4 border-b border-slate-100">
              <Clock className="h-5 w-5 text-blue-900" />
              <span>Timeline Seleksi Penerimaan</span>
            </h3>

            {getTimelineRows(selectedBeasiswa).length > 0 ? (
              <div className="mt-8 relative" id="timeline-interactive-tree">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-250 -translate-y-1/2 hidden md:block" />

                <div className="grid gap-6 md:grid-cols-5 relative z-10 text-center">
                  
                  {getTimelineRows(selectedBeasiswa).map((pt, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2 bg-slate-50 md:bg-transparent rounded-xl p-4 md:p-0 border border-slate-100 md:border-transparent">
                      {/* Node Bullet */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-white font-bold text-xs ring-4 ring-offset-2 ring-blue-900/10">
                        {i + 1}
                      </div>
                      <span className="block text-xs font-bold text-slate-900 mt-2">{pt.phase}</span>
                      <span className="block text-[10px] font-bold font-mono text-lime-700 bg-lime-50 px-2.5 py-1.5 rounded-full uppercase tracking-wide mt-1">
                        {pt.date}
                      </span>
                      {pt.description && (
                        <span className="block text-[10px] leading-relaxed text-slate-500 mt-1">
                          {pt.description}
                        </span>
                      )}
                    </div>
                  ))}

                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 text-xs font-mono font-bold leading-relaxed text-slate-700 whitespace-pre-line">
                Timeline belum tersedia.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
