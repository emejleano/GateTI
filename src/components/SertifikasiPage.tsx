import { useState, useEffect } from 'react';
import { Certification } from '../types';
import { 
  ArrowLeft, Brain, Calendar, DollarSign, ExternalLink, Filter, HelpCircle, 
  Award, Briefcase, GraduationCap, Compass, BookOpen, AlertCircle, CheckCircle 
} from 'lucide-react';

interface SertifikasiPageProps {
  onNavigate: (page: string) => void;
  initialViewMode?: 'landing' | 'grid';
}

export default function SertifikasiPage({ onNavigate, initialViewMode = 'landing' }: SertifikasiPageProps) {
  const [viewMode, setViewMode] = useState<'landing' | 'grid'>(initialViewMode);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);

  // Recommendation Quiz states
  const [quizActive, setQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [recommendedCert, setRecommendedCert] = useState<Certification | null>(null);

  const categories = [
    'Semua', 'Manajemen & Operasional', 'Analisis & Data', 'K3 & Lingkungan', 'Rantai Pasok', 'Sistem & Proses', 'Lainnya'
  ];

  // Retrieve certifications from database API
  useEffect(() => {
    const fetchCerts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/certifications');
        const data = await res.json();
        setCertifications(data);
      } catch (err) {
        console.error('Error fetching certificates', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const getFilteredCerts = () => {
    if (activeCategory === 'Semua') return certifications;
    return certifications.filter(c => c.category === activeCategory);
  };

  // Recommendations click handler showing custom dialog guide
  const handleShowRecommendationGuide = (goal: string) => {
    alert(`Rekomendasi Karir ${goal}:\nSila selaraskan bidang ini dengan mengambil Sertifikasi pendukung di daftar Sertifikasi kami! Coba fitur Quiz Cepat di bawah.`);
  };

  // Start the interactive quiz
  const handleStartQuiz = () => {
    setQuizActive(true);
    setQuizStep(1);
    setQuizAnswers({});
    setRecommendedCert(null);
  };

  const handleQuizAnswer = (questionKey: string, answer: string) => {
    const nextAnswers = { ...quizAnswers, [questionKey]: answer };
    setQuizAnswers(nextAnswers);

    if (quizStep < 2) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate Recommendation output
      // If interest is K3 or goals relate to Manufacturing safety -> K3
      // If interest is Data or tools -> Excel Expert
      // If interest is Process/Operations -> Lean Six Sigma
      const interest = nextAnswers['interest'];
      const field = nextAnswers['field'];

      let match: Certification | undefined;
      if (interest === 'k3' || field === 'safety') {
        match = certifications.find(c => c.id === 'C01'); // K3
      } else if (interest === 'data' || field === 'analyst') {
        match = certifications.find(c => c.id === 'C02'); // Excel
      } else {
        match = certifications.find(c => c.id === 'C03'); // Six Sigma
      }

      setRecommendedCert(match || certifications[0] || null);
      setQuizStep(3); // Result step
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full" id="sertifikasi-section-page">
      
      {/* ----------------- SUB-VIEW MODE: LANDING (Page 18) ----------------- */}
      {viewMode === 'landing' && (
        <div className="space-y-8 animate-fade-in" id="sertifikasi-landing">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tile 1: Hero Welcome (Spans 2 columns on lg board) */}
            <div 
              className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-cover bg-center h-[24rem] flex flex-col justify-between p-8 sm:p-12 shadow-xl border border-blue-955/10 group"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.55)), url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200')`
              }}
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-lime-400/20 rounded-full filter blur-2xl pointer-events-none" />
              
              <div>
                <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-[#a3e635] bg-lime-400/10 px-3 py-1.5 rounded-full border border-lime-400/20">
                  Akses Dunia Profesional • Upgrade Keahlian
                </span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight font-display uppercase leading-tight text-white">
                  Sertifikasi Profesi<br />
                  <span className="text-amber-400">Upgrade Karir Anda</span>
                </h2>
                <p className="mt-2 text-xs text-slate-200 font-medium leading-relaxed max-w-md">
                  Temukan berbagai sertifikasi kompetensi industri nasional (BNSP) hingga internasional terkemuka untuk melipatgandakan daya saing purna-studi Anda.
                </p>
              </div>

              <div>
                <button 
                  onClick={() => setViewMode('grid')}
                  className="rounded-xl bg-lime-400 hover:bg-lime-500 hover:scale-[1.02] text-slate-900 font-extrabold text-xs px-6 py-3.5 shadow-md active:scale-95 transition-all"
                >
                  TEMUKAN SERTIFIKASI SEKARANG
                </button>
              </div>
            </div>

            {/* Tile 2: Assessment Quiz Link (Right Bento Box) */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl border border-slate-800" id="sertifikasi-landing-bento-quiz">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-lime-400 uppercase">Interactive Tool</span>
                <h3 className="text-lg font-bold font-display mt-1 text-slate-100 uppercase">Rekomendasi Sertifikat</h3>
                <p className="text-[11px] text-slate-405 mt-2 leading-relaxed text-slate-400">
                  Bingung memilih sertifikasi? Coba asisten kuis bento interaktif kami di menu kelola mandiri untuk merekomendasikan sertifikasi terbaik yang relevan dengan impian karir Anda.
                </p>
              </div>

              <div className="my-3 flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold">Quiz Cepat 3 Pertanyaan</span>
                </div>
                <span className="font-mono text-[9px] text-[#a3e635] font-bold">RECOMMENDED</span>
              </div>

              <button 
                onClick={() => {
                  setViewMode('grid');
                  // Trigger quick quiz start delay elegantly
                  setTimeout(() => {
                    const quizBtn = document.getElementById('start-quiz-btn');
                    if (quizBtn) quizBtn.click();
                  }, 150);
                }}
                className="w-full text-center rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-extrabold text-xs py-3.5 transition shadow"
              >
                MULAI KUIS SEKARANG
              </button>
            </div>
          </div>

          {/* Supportive Skill Categories in Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Standarisasi BNSP</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Menyediakan referensi jadwal sertifikasi kompetensi resmi berlisensi BNSP yang melingkupi Ahli K3 Umum hingga Pengawas Logistik.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Kredensial Global</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Panduan materi sertifikasi berskala global dari vendor terkemuka dunia seperti Microsoft, Google, Lean Six Sigma Society, serta CAPM.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-3 lg:col-span-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">SKPI Mahasiswa</span>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Tiap sertifikasi yang berhasil diselesaikan dapat disubmisikan ke SIAKADY untuk memperoleh poin kelulusan wisuda yang komparatif.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ----------------- SUB-VIEW MODE: GRID & INTERACTIVES (Page 19, 20, 21) ----------------- */}
      {viewMode === 'grid' && (
        <div className="space-y-10 animate-fade-in" id="sertifikasi-grid">
          
          {/* Back Trigger */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <button 
              onClick={() => setViewMode('landing')}
              className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-blue-900 transition"
              id="grid-back-btn"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </button>
            <h2 className="text-xl font-extrabold text-blue-950 font-display">
              Jelajahi Sertifikasi Keahlian TI
            </h2>
          </div>

          {/* Page 19: Horizontal Category filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none" id="cert-categories-row">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat 
                    ? 'bg-blue-900 text-white shadow-sm font-bold' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List of certifications (BNSP, Microsoft, Six Sigma) */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
              Memuat data sertifikasi...
            </div>
          ) : getFilteredCerts().length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-white border border-slate-200 text-xs text-slate-400 font-bold uppercase tracking-wider">
              Tidak ada sertifikasi dalam kategori ini untuk sementara waktu.
            </div>
          ) : (
            <div className="space-y-4" id="certifications-list">
              {getFilteredCerts().map((c) => (
                <div 
                  key={c.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Info Column */}
                  <div className="space-y-2 flex-1">
                    <span className="inline-block rounded bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-900 uppercase">
                      {c.provider} • {c.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-500 text-justify max-w-3xl leading-relaxed">
                      {c.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-medium pt-1 font-mono">
                      <span>DAFTAR: <b className="text-red-600">{c.deadline || 'Buka Sepanjang Tahun'}</b></span>
                      <span>BIAYA: <b className="text-emerald-700">{c.fee}</b></span>
                    </div>
                  </div>

                  {/* Register Trigger button */}
                  <a 
                    href={c.registerLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full md:w-auto shrink-0 inline-flex items-center justify-center space-x-1.5 rounded-xl bg-blue-900 hover:bg-blue-850 px-6 py-3 text-xs font-bold text-white shadow transition-all duration-150 text-center"
                  >
                    <span>Daftar</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Pages 20 & 21: Pilih Sesuai Tujuanmu Grid System */}
          <div className="space-y-6 pt-6 border-t border-slate-250" id="goal-choices-block">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-blue-950 font-display uppercase tracking-wide">
                Pilih Sesuai Tujuanmu
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih kategori sertifikat yang paling mendukung realisasi cita-cita karir Anda.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Persiapan Karier',
                  desc: 'Perkuat portofolio berkas CV dari tingkatan daya saing kuat di ekosistem dunia kerja korporasi.',
                  color: 'border-l-indigo-600 hover:bg-indigo-50/50',
                  icon: Briefcase
                },
                {
                  title: 'Tingkatkan Keahlian',
                  desc: 'Kembangkan kecakapan spesifik secara taktis mengacu pada bidang fokus pemodelan logistik dan manufaktur.',
                  color: 'border-l-teal-600 hover:bg-teal-50/50',
                  icon: Award
                },
                {
                  title: 'Pindah Jalur Karier',
                  desc: 'Siapkan bekal fondasi kuat untuk berpindah kuadran menuju rumpun profesi teknologi modern.',
                  color: 'border-l-amber-600 hover:bg-amber-50/50',
                  icon: Compass
                },
                {
                  title: 'Persyaratan Profesi',
                  desc: 'Penuhi tuntutan regulasi sertifikasi K3 atau standar wajib yang dipersyaratkan oleh industri bersangkutan.',
                  color: 'border-l-purple-600 hover:bg-purple-50/50',
                  icon: GraduationCap
                }
              ].map((g, idx) => {
                const IconComp = g.icon;
                return (
                  <div 
                    key={idx}
                    onClick={() => handleShowRecommendationGuide(g.title)}
                    className={`rounded-xl border border-slate-200 border-l-4 p-5 bg-white shadow-sm cursor-pointer transition select-none flex flex-col justify-between ${g.color}`}
                  >
                    <div className="space-y-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-700 mb-1">
                        <IconComp className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 font-display">{g.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed text-left">{g.desc}</p>
                    </div>
                    <span className="block text-[10px] font-bold text-blue-900 mt-4 hover:underline">
                      Lihat Rekomendasi &rarr;
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Quiz Area from Page 20 */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-950 to-indigo-900 text-white p-8 shadow-xl relative overflow-hidden" id="quiz-career-widget">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 h-44 w-44 bg-blue-500/10 rounded-full blur-3xl" />
            
            {!quizActive ? (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 font-sans">
                <div className="space-y-2 flex-1 text-center md:text-left">
                  <span className="inline-block bg-lime-450/20 text-lime-400 font-semibold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border border-lime-400/20">
                    💡 Rekomendasi Pintar (Skill Matcher)
                  </span>
                  <h3 className="text-xl font-bold font-display uppercase tracking-tight">
                    Belum Tahu Sertifikasi Apa Yang Tepat Untukmu?
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Ikut kuis rekomendasi singkat 2 langkah super cepat untuk menemukan sertifikat profesi TI yang paling relevan dengan profil impian karirmu!
                  </p>
                </div>
                <button
                  onClick={handleStartQuiz}
                  className="w-full md:w-auto shrink-0 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs px-6 py-4 shadow-sm"
                  id="start-quiz-btn"
                >
                  Mulai Kuis Cepat &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-6 relative z-10" id="quiz-live-frame">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <span className="text-xs font-bold text-lime-400 uppercase tracking-widest font-mono">
                    {quizStep < 3 ? `Langkah ${quizStep} dari 2` : 'Hasil Rekomendasi'}
                  </span>
                  <button 
                    onClick={() => setQuizActive(false)}
                    className="text-white/40 hover:text-white text-xs font-semibold"
                  >
                    Batal
                  </button>
                </div>

                {/* Question 1 */}
                {quizStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm font-bold font-display">1. Manakah bidang utama ekspektasi fokus kerja yang paling Anda sukai?</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <button 
                        onClick={() => handleQuizAnswer('interest', 'k3')}
                        className="rounded-xl bg-white/5 hover:bg-white/10 p-4 text-xs font-semibold text-left border border-white/10 hover:border-white/20 transition cursor-pointer"
                      >
                        Kesehatan, Keselamatan Kerja & Lingkungan (K3)
                      </button>
                      <button 
                        onClick={() => handleQuizAnswer('interest', 'data')}
                        className="rounded-xl bg-white/5 hover:bg-white/10 p-4 text-xs font-semibold text-left border border-white/10 hover:border-white/20 transition cursor-pointer"
                      >
                        Analisis Data, Spreadsheet & Visualisasi Makro
                      </button>
                      <button 
                        onClick={() => handleQuizAnswer('interest', 'proses')}
                        className="rounded-xl bg-white/5 hover:bg-white/10 p-4 text-xs font-semibold text-left border border-white/10 hover:border-white/20 transition cursor-pointer"
                      >
                        Optimasi Proses Manufaktur & Kendali Kualitas (QA/QC)
                      </button>
                    </div>
                  </div>
                )}

                {/* Question 2 */}
                {quizStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm font-bold font-display">2. Dimana Anda membayangkan penempatan pekerjaan impian Anda kelak?</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <button 
                        onClick={() => handleQuizAnswer('field', 'safety')}
                        className="rounded-xl bg-white/5 hover:bg-white/10 p-4 text-xs font-semibold text-left border border-white/10 hover:border-white/20 transition cursor-pointer"
                      >
                        Pabrik Kimia, Tambang, Konstruksi atau Lapangan Migas
                      </button>
                      <button 
                        onClick={() => handleQuizAnswer('field', 'analyst')}
                        className="rounded-xl bg-white/5 hover:bg-white/10 p-4 text-xs font-semibold text-left border border-white/10 hover:border-white/20 transition cursor-pointer"
                      >
                        Kantor Konsultan, Perusahaan Startup, atau Departemen Supply Chain
                      </button>
                      <button 
                        onClick={() => handleQuizAnswer('field', 'manufacturing')}
                        className="rounded-xl bg-white/5 hover:bg-white/10 p-4 text-xs font-semibold text-left border border-white/10 hover:border-white/20 transition cursor-pointer"
                      >
                        Industri Manufaktur Otomotif, Makanan/Minuman, atau Pengendalian Mutu
                      </button>
                    </div>
                  </div>
                )}

                {/* Result Step */}
                {quizStep === 3 && recommendedCert && (
                  <div className="space-y-6 animate-fade-in text-center sm:text-left" id="quiz-result-frame">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-lime-450 text-slate-900 bg-lime-400 font-bold p-1">
                        <Award className="h-10 w-10 text-slate-950" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#a3e635]">Sertifikat Yang Paling Cocok:</span>
                        <h4 className="text-lg font-bold font-display">{recommendedCert.title}</h4>
                        <p className="text-xs text-slate-350">{recommendedCert.provider} • Kategori {recommendedCert.category}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                      <p className="text-xs text-slate-300 leading-relaxed text-justify">
                        Berdasarkan minat bidang Anda terhadap hal tersebut, sertifikasi ini akan sangat mendongkrak fungsionalitas dan rekurisvitas keahlian praktikal Anda dan sangat dihargai oleh rekruter industri.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <a 
                        href={recommendedCert.registerLink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs px-5 py-3 transition"
                      >
                        Daftar Sertipikat Sekarang
                      </a>
                      <button 
                        onClick={handleStartQuiz}
                        className="rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-5 py-3 transition"
                      >
                        Kuis Ulang
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
