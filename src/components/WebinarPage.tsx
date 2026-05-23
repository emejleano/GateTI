import { useState, useEffect } from 'react';
import { fetchAllData } from '../api';
import { Webinar } from '../types';
import { ArrowLeft, ExternalLink, Calendar, Users, Tv, Clock, Check, BellRing } from 'lucide-react';

interface WebinarPageProps {
  onNavigate: (page: string) => void;
  initialViewMode?: 'landing' | 'grid' | 'details';
}

export default function WebinarPage({ onNavigate, initialViewMode = 'landing' }: WebinarPageProps) {
  const [viewMode, setViewMode] = useState<'landing' | 'grid' | 'details'>(initialViewMode);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [loading, setLoading] = useState(true);

  // Retrieve webinars dataset from API
  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        setLoading(true);
        const data = await fetchAllData();
        setWebinars(data.webinars);
      } catch (err) {
        console.error('Error fetching webinars', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWebinars();
  }, []);

  const handleOpenDetails = (w: Webinar) => {
    setSelectedWebinar(w);
    setViewMode('details');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full" id="webinar-section-page">
      
      {/* ----------------- SUB-VIEW MODE: LANDING (Page 15) ----------------- */}
      {viewMode === 'landing' && (
        <div className="space-y-8 animate-fade-in" id="webinar-landing">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tile 1: Hero welcome banner (Spans 2 columns on lg screen) */}
            <div 
              className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-cover bg-center h-[24rem] flex flex-col justify-between p-8 sm:p-12 shadow-xl border border-blue-950/10 group"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.55)), url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200')`
              }}
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-lime-400/20 rounded-full filter blur-2xl pointer-events-none" />
              
              <div>
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-lime-400 bg-lime-400/10 px-3 py-1.5 rounded-full border border-lime-400/20">
                  Peningkatan Soft & Hard Skills • Jurusan TI
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight font-display uppercase leading-tight text-white">
                  Webinar<br />
                  <span className="text-amber-400">Teknik Industri</span>
                </h2>
                <p className="mt-2 text-xs text-slate-200 font-medium leading-relaxed max-w-md">
                  Temukan berbagai webinar interaktif untuk menambah khazanah wawasan, kajian studi kasus keilmuan manufaktur, serta keterampilan rekayasa sistem industri langsung dari pakar industri.
                </p>
              </div>

              <div>
                <button 
                  onClick={() => setViewMode('grid')}
                  className="rounded-xl bg-lime-400 hover:bg-lime-500 hover:scale-[1.02] text-slate-900 font-extrabold text-xs px-6 py-3.5 shadow-md active:scale-95 transition-all"
                >
                  TEMUKAN WEBINAR SEKARANG
                </button>
              </div>
            </div>

            {/* Tile 2: S1/S2 Webinar highlight widget (Right bento box) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between text-center lg:text-left hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="mx-auto lg:mx-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-900 shadow-inner border border-blue-105">
                  <Tv className="h-6 w-6 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-950 font-display uppercase">
                    WAKTU BELAJAR
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed text-center lg:text-left">
                    Webinar kami berfokus pada Supply Chain Management, Lean Manufacturing, Kerja Praktik Industri, Ergonomi Kerja, dan K3 Lingkungan.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewMode('grid')}
                className="mt-6 w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 shadow transition"
              >
                MASUK WEBINAR →
              </button>
            </div>
          </div>

          {/* Quick Informational Cards Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Kategori Pemateri</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Menghadirkan pembicara terkemuka dari korporat nasional (BUMN, FMCG, Consulting) dan jajaran dosen ahli Teknik Industri Untirta.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Fasilitas Sertifikat</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Tersedia e-sertifikat keikutsertaan resmi prodi yang diakui sebagai syarat poin berkas SKPI mahasiswa Teknik Industri S1 Untirta.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:col-span-2 lg:col-span-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Pengajuan Poster</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Hubungi administrator HMTI lewat surel atau instagram prodi untuk mengunggah poster webinar eksternal universitas lainnya.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ----------------- SUB-VIEW MODE: GRID (Page 16) ----------------- */}
      {viewMode === 'grid' && (
        <div className="space-y-6 animate-fade-in" id="webinar-grid">
          {/* Header toolbar */}
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
              <Tv className="h-5.5 w-5.5 text-blue-900" />
              <span>Daftar Webinar & Seminar Keilmuan</span>
            </h2>
          </div>

          {/* Webinar Grid lists */}
          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
              Memuat data webinar...
            </div>
          ) : webinars.length === 0 ? (
            <div className="py-24 text-center text-slate-400 border border-slate-200 rounded-3xl bg-white text-xs font-bold uppercase tracking-wider">
              Tidak ada webinar yang dijadwalkan.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="webinar-cards-list">
              {webinars.map((item) => (
                <div 
                  key={item.id}
                  className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-350 flex flex-col justify-between overflow-hidden p-2"
                >
                  <div className="relative h-44 w-full bg-slate-50 overflow-hidden rounded-2xl border border-slate-100">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Status badge Overlay */}
                    <span className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-[8px] font-extrabold tracking-wider text-white uppercase shadow ${
                      item.status === 'Terbuka' ? 'bg-emerald-600' : 'bg-slate-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between font-sans">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1 font-display line-clamp-1 group-hover:text-blue-900 transition text-justify">
                        {item.title}
                      </h3>
                      <p className="text-[10px] font-bold text-blue-900 mb-2 uppercase tracking-wide">
                        {item.subtitle}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed text-justify mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[10px] text-slate-450">
                        <span className="block font-bold">AGENDA</span>
                        <span className="font-mono text-slate-800 font-semibold">{item.dateStr}</span>
                      </div>
                      <button 
                        onClick={() => handleOpenDetails(item)}
                        className="rounded-lg bg-lime-400 hover:bg-lime-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-4 py-2"
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

      {/* ----------------- SUB-VIEW MODE: DETAILS (Page 17) ----------------- */}
      {viewMode === 'details' && selectedWebinar && (
        <div className="space-y-8 animate-fade-in" id="webinar-details">
          {/* Header navigation bar */}
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
              ID KEY: {selectedWebinar.id}
            </span>
          </div>

          {/* Details Card Layout Split */}
          <div className="grid gap-8 md:grid-cols-12 items-start" id="webinar-details-layout">
            
            {/* Poster Thumbnail Left Block */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden border border-slate-200 bg-white p-2 shadow">
              <img 
                src={selectedWebinar.image} 
                alt={selectedWebinar.title}
                className="w-full h-auto rounded-xl object-contain max-h-[28rem] bg-slate-50"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Core documentation Right block */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Dynamic Status pulse badge from Page 17 */}
              <div className="flex">
                <span className={`inline-flex items-center space-x-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm border ${
                  selectedWebinar.status === 'Terbuka' 
                    ? 'bg-emerald-50 text-emerald-850 border-emerald-200' 
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    selectedWebinar.status === 'Terbuka' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-450'
                  }`} />
                  <span>Status : {selectedWebinar.status === 'Terbuka' ? 'Terbuka (Pendaftaran Dibuka)' : 'Pendaftaran Ditutup'}</span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-black text-blue-950 font-display sm:text-3xl leading-tight uppercase">
                  {selectedWebinar.title}
                </h1>
                <h2 className="text-xs font-bold text-lime-700 uppercase tracking-widest mt-1">
                  {selectedWebinar.subtitle}
                </h2>
              </div>

              {/* Speaker card and date details grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-150 bg-white p-4 text-xs">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Narasumber Pemateri</span>
                  <p className="font-bold text-slate-900">{selectedWebinar.speakerName}</p>
                  <p className="text-slate-500 italic mt-0.5">{selectedWebinar.speakerTitle}</p>
                </div>

                <div className="rounded-xl border border-slate-150 bg-white p-4 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Calendar className="h-4.5 w-4.5 text-blue-700 shrink-0" />
                    <span className="font-semibold font-mono">{selectedWebinar.dateStr}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Clock className="h-4.5 w-4.5 text-blue-700 shrink-0" />
                    <span className="font-semibold font-mono">{selectedWebinar.timeStr}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Tv className="h-4.5 w-4.5 text-blue-700 shrink-0" />
                    <span className="font-semibold">{selectedWebinar.location}</span>
                  </div>
                </div>
              </div>

              {/* Description box */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tentang Webinar</span>
                <p className="text-xs leading-relaxed text-slate-600 text-justify bg-white rounded-xl border border-slate-150 p-4 whitespace-pre-line">
                  {selectedWebinar.description}
                </p>
              </div>

              {/* Checklist details Benefit from Page 17 */}
              <div className="rounded-xl border border-slate-150 bg-white p-5 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <BellRing className="h-4 w-4 text-slate-400" />
                  <span>Benefit Peserta</span>
                </span>
                <div className="grid gap-2 grid-cols-2">
                  {(selectedWebinar.benefits && selectedWebinar.benefits.length ? selectedWebinar.benefits : ['E-Sertifikat', 'Materi PDF', 'Networking', 'Doorprize Menarik']).map((b, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-lg p-2.5 border border-slate-200/50">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-100 text-lime-800">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* large violet apply button */}
              {selectedWebinar.status === 'Terbuka' && (
                <a 
                  href={selectedWebinar.registerLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-lime-500 hover:bg-lime-600 text-slate-900 py-4 text-xs font-black uppercase tracking-widest shadow-md transition"
                  id="details-apply-btn"
                >
                  <span>DAFTAR SEKARANG</span>
                  <ExternalLink className="h-4.5 w-4.5" />
                </a>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
