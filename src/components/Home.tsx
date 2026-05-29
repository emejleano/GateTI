import React, { useState, useEffect } from 'react';
import { Mail, Instagram, Send, HelpCircle, PhoneCall, ChevronDown, CheckCircle2, MessageSquare } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
  subTab?: 'home' | 'faq' | 'kontak';
}

export default function Home({ onNavigate, subTab = 'home' }: HomeProps) {
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'faq' | 'kontak'>(subTab);
  
  // Sync the external subTab navigation if passed from parent
  useEffect(() => {
    setActiveSubTab(subTab);
  }, [subTab]);

  // FAQ Expand state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Contact form input states
  const [contactName, setContactName] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactMessage) {
      setFormSubmitted(true);
      setTimeout(() => {
        setContactName('');
        setContactMessage('');
        setFormSubmitted(false);
      }, 3500);
    }
  };

  const faqData = [
    {
      q: "Apa itu GateTI?",
      a: "GateTI adalah platform informasi yang menyediakan berbagai update lomba, webinar, dan beasiswa untuk mahasiswa Teknik Industri S1 Universitas Sultan Ageng Tirtayasa (Untirta). Website ini berfungsi sebagai pusat informasi koordinasi, bukan penyelenggara utama."
    },
    {
      q: "Apakah GateTI memberikan beasiswa secara langsung?",
      a: "Tidak. GateTI tidak menyalurkan dana beasiswa secara langsung, melainkan hanya merangkum, membagikan, dan mengomunikasikan informasi beasiswa resmi dari berbagai penyelenggara terpercaya."
    },
    {
      q: "Dari mana sumber informasi lomba, webinar, dan beasiswa?",
      a: "Tautan informasi dihimpun dari: website penyedia resmi, media sosial resmi lembaga penyelenggara publik, serta edaran kerja sama resmi program studi Teknik Industri Untirta."
    },
    {
      q: "Bagaimana cara mendaftar lomba, webinar, dan beasiswa?",
      a: "Setiap program memiliki link pendaftaran mandiri. Anda cukup mengklik tombol 'Daftar Sekarang' di poster, meninjau syarat resmi di situs asal, lalu mendaftar langsung di halaman penyedia program."
    },
    {
      q: "Apakah GateTI bertanggung jawab atas proses seleksi?",
      a: "Tidak. Seluruh rangkaian pendaftaran, seleksi berkas, wawancara, hingga pengumuman akhir adalah hak mutlak dari masing-masing pihak penyelenggara eksternal."
    },
    {
      q: "Apakah saya bisa merekomendasikan info lomba atau webinar?",
      a: "Tentu bisa! Anda bisa mengirim rincian pamflet atau poster kegiatan ke email resmi Himpunan atau bagian kemahasiswaan TI Untirta untuk divalidasi dan diunggah oleh admin."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="home-view-wrapper">
      
      {/* ---------------- SUB PAGE 1: HOME (VISI MISI & BENTO GRID) ---------------- */}
      {activeSubTab === 'home' && (
        <section className="flex-1 mx-auto max-w-7xl px-4 py-10 sm:px-6 w-full" id="section-home-visi-misi">
          {/* Bento Grid Layout Wrapper */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" id="home-bento-grid">
            
            {/* Tile 1: Main Welcome Banner (Spans 2-3 columns depending on screen size) */}
            <div 
              className="md:col-span-2 lg:col-span-3 min-h-[340px] rounded-3xl p-8 md:p-12 text-white relative flex flex-col justify-between shadow-xl overflow-hidden group border border-blue-950/20"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.92) 20%, rgba(30, 58, 138, 0.8) 100%), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              id="bento-tile-hero"
            >
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay pointer-events-none" />
              {/* Decorative Subtle Corner Aura */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/20 rounded-full filter blur-3xl opacity-40 -mr-20 -mt-20 pointer-events-none transition-all duration-700 group-hover:scale-110" />
              
              <div className="relative z-10 max-w-2xl space-y-4">
                <span className="inline-flex text-[10px] font-bold uppercase tracking-widest text-lime-400 bg-lime-400/10 px-3 py-1.5 rounded-full border border-lime-400/20">
                  Pusat Informasi Terintegrasi • Teknik Industri
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-display uppercase leading-tight">
                  Teknik Industri <br />
                  <span className="text-amber-400">Untirta</span> Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-xl">
                  Satu wadah untuk mengeksplorasi kompetisi bergengsi, webinar peningkatan hard & soft skills, beasiswa sarjana, dan sertifikasi profesi internasional untuk mendukung lulusan Teknik Industri yang unggul.
                </p>
              </div>

              <div className="relative z-10 mt-8 flex flex-wrap gap-3">
                <button 
                  onClick={() => onNavigate('lomba')} 
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] text-white font-extrabold text-xs px-6 py-3.5 shadow-md active:scale-95 transition"
                >
                  TEMUKAN LOMBA
                </button>
                <button 
                  onClick={() => onNavigate('beasiswa')} 
                  className="rounded-xl bg-lime-400 hover:bg-lime-500 hover:scale-[1.02] text-slate-900 font-extrabold text-xs px-6 py-3.5 shadow-md active:scale-95 transition"
                >
                  CARI BEASISWA
                </button>
              </div>
            </div>

            {/* Tile 2: Platform Feature Counters (Dark Sleek Block) */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xl border border-slate-800" id="bento-tile-stats">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">Akses Data Portal</span>
                <h3 className="text-lg font-bold font-display mt-1 text-amber-400">STATUS SINKRON</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Data lomba, beasiswa & webinar disinkronisasi berkala dari database real-time prodi.
                </p>
              </div>
              
              <div className="my-6 space-y-3">
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                  <span className="text-slate-400">Kompetisi & Lomba</span>
                  <span className="font-mono font-bold text-lime-400">Aktif</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                  <span className="text-slate-400">Beasiswa Keuangan</span>
                  <span className="font-mono font-bold text-lime-400">Update</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-b border-white/10">
                  <span className="text-slate-400">Sertifikasi Keahlian</span>
                  <span className="font-mono font-bold text-amber-400">Nasional</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Terhubung via App Script</span>
              </div>
            </div>

            {/* Tile 3: VISI JURUSAN (White Elegant Bento Card with rich typography watermark) */}
            <div 
              className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition relative overflow-hidden flex flex-col justify-between"
              id="bento-tile-visi"
            >
              <div className="absolute right-4 bottom-[-10px] font-display text-[150px] font-black leading-none text-slate-100/50 pointer-events-none select-none">
                V
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-900">V</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Jurusan Teknik Industri S1 & S2</span>
                </div>
                <h3 className="mt-3 text-xl font-bold text-blue-950 font-display">VISI JURUSAN UNTIRTA</h3>
                <p className="mt-4 text-xs leading-relaxed text-slate-600 text-justify max-w-lg">
                  Menjadi Jurusan Teknik Industri yang unggul dalam hal penelitian di bidang optimasi sistem, membangun civitas yang berkarakter, dan keterlibatan mendalam dengan mitra baik dari sektor pemerintah, swasta, maupun organisasi non-profit.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Visi Misi Resmi FT. Untirta</span>
                <span className="font-mono">ID: VISI-2026</span>
              </div>
            </div>

            {/* Tile 4: JAWARA core value block (Solid Warm Color Card) */}
            <div className="bg-gradient-to-tr from-amber-500 to-amber-600 rounded-3xl p-8 flex flex-col justify-between text-slate-950 shadow-md relative overflow-hidden" id="bento-tile-jawara">
              <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                <svg className="h-44 w-44 text-slate-950" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800">FILOSOFI JURUSAN</span>
                <h3 className="text-3xl font-black font-display tracking-tight text-slate-950 mt-1 uppercase">JAWARA</h3>
              </div>

              <p className="text-xs leading-relaxed text-slate-900 font-semibold my-4">
                Membangun daya dukung tata kelola jurusan berbasis karakter luhur lokal banten yang bersahaja, mandiri, dan bermartabat tinggi.
              </p>

              <div className="text-[9px] font-bold bg-slate-950/10 rounded-lg p-2 flex flex-wrap gap-1 border border-slate-950/10">
                <span>Jujur • Adil • Wibawa • Amanah • Religius • Akuntabel</span>
              </div>
            </div>

            {/* Tile 5: S1 / S2 Academic Programs Shortcut (Nice soft tinted card) */}
            <div className="bg-sky-50 border border-sky-100 rounded-3xl p-6 flex flex-col justify-between text-sky-950" id="bento-tile-programs">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-sky-800">Kurikulum TI</span>
                <h3 className="text-base font-bold font-display text-sky-950 mt-1">JENJANG STUDI</h3>
                <p className="text-xs text-sky-800/80 mt-2 leading-relaxed">
                  Mengembangkan kerangka berpikir analitis sistematis yang siap kerja maupun penelitian akademis lanjut.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-100/50 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold bg-white/70 p-2 rounded-lg">
                  <span>S1 Teknik Industri</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px]">Terakreditasi</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold bg-white/70 p-2 rounded-lg">
                  <span>S2 Teknik Industri</span>
                  <span className="text-blue-750 bg-blue-50 px-1.5 py-0.5 rounded text-[9px]">Unggulan</span>
                </div>
              </div>
            </div>

            {/* Tile 6: MISI JURUSAN (White Multi-Layer block - spans remaining spot beautifully) */}
            <div 
              className="md:col-span-3 lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
              id="bento-tile-misi"
            >
              <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">M</span>
                <h3 className="text-lg font-bold text-blue-950 font-display">MISI JURUSAN TEKNIK INDUSTRI</h3>
              </div>

              <div className="grid gap-6 md:grid-cols-3 mt-6">
                <div className="flex items-start space-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-900 border border-blue-100">1</span>
                  <p className="text-xs leading-relaxed text-slate-600 text-justify">
                    Meningkatkan mutu, relevansi, dan daya saing pendidikan berbasis <b>outcome based education</b> untuk menghasilkan lulusan yang kompetitif dan memiliki jiwa berdaya juang tinggi.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-900 border border-blue-100">2</span>
                  <p className="text-xs leading-relaxed text-slate-600 text-justify">
                    Meningkatkan kualitas dan kuantitas riset akademis serta pengabdian masyarakat Jurusan Teknik Industri yang inovatif, komprehensif, aplikatif, dan berdampak luas.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-900 border border-blue-100">3</span>
                  <p className="text-xs leading-relaxed text-slate-600 text-justify">
                    Meningkatkan daya dukung tatakelola Jurusan sebagai wujud Jurusan Teknik Industri yang berkarakter Jujur, Adil, Wibawa, Amanah, Religius, dan Akuntabel (JAWARA).
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ---------------- SUB PAGE 2: FAQ ---------------- */}
      {activeSubTab === 'faq' && (
        <section className="flex-1 max-w-7xl mx-auto px-4 py-12 sm:px-6 w-full" id="section-faq">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              Pusat Pertanyaan
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl font-display uppercase">
              Pertanyaan Umum (FAQ)
            </h2>
            <p className="mt-2 text-xs text-slate-500 max-w-xl mx-auto">
              Simak ringkasan jawaban atas kendala dan pertanyaan umum dari civitas akademika Teknik Industri Untirta.
            </p>
          </div>

          {/* Bento-style FAQ elements block grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="faq-blocks-grid">
            {faqData.map((item, idx) => (
              <div 
                key={idx}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-900 mb-4 border border-blue-100">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mb-2 font-display">
                    {item.q}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500 text-justify">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- SUB PAGE 3: KONTAK ---------------- */}
      {activeSubTab === 'kontak' && (
        <section className="flex-1 max-w-7xl mx-auto px-4 py-12 sm:px-6 w-full" id="section-kontak">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              Saluran Hubungi Kami
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl font-display uppercase">
              Kontak & Hub Program Studi
            </h2>
            <p className="mt-2 text-xs text-slate-500 max-w-xl mx-auto">
              Hubungi sekretariat atau himpunan mahasiswa untuk pengajuan program, kemitraan, atau verifikasi publikasi beasiswa.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-stretch" id="kontak-panels">
            {/* Left Box: Info of Sekretariat - Bento Dark themed */}
            <div className="lg:col-span-5 rounded-3xl bg-slate-950 p-8 text-white shadow-xl flex flex-col justify-between border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full filter blur-2xl pointer-events-none" />
              
              <div>
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">Sekretariat Resmi</span>
                <h3 className="text-xl font-bold font-display uppercase tracking-wide text-amber-400 mt-1">
                  IDS Teknik Industri Untirta
                </h3>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Fakultas Teknik, Universitas Sultan Ageng Tirtayasa.<br />
                  Cilegon / Serang, Provinsi Banten.
                </p>

                <div className="mt-8 space-y-4">
                  <a 
                    href="mailto:ids.hmtiuntirta@gmail.com" 
                    className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-400">Surel Resmi</span>
                      <span className="text-xs font-semibold truncate block">{`ids.hmtiuntirta@gmail.com`}</span>
                    </div>
                  </a>

                  <a 
                    href="https://instagram.com/ids_hmti" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-400">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-400">Instagram Resmi</span>
                      <span className="text-xs font-semibold truncate block">@ids_hmti</span>
                    </div>
                  </a>

                  <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-400">
                      <Send className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-400">Telegram Hub</span>
                      <span className="text-xs font-semibold truncate block">IDS HMTI FT. UNTIRTA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Little vector logo accent */}
              <div className="mt-8 opacity-15 flex justify-end">
                <svg className="h-16 w-16 text-white animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
            </div>

            {/* Right Box: Interactive Feedbacks - White Bento Styled */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-900" />
                  <span>KIRIM REKOMENDASI INFO / PERTANYAAN</span>
                </h3>
                <p className="mt-1.5 text-xs text-slate-500">
                  Punya info lomba, beasiswa, atau webinar bermutu? Bagikan di sini untuk ditinjau oleh redaksi GateTI.
                </p>

                {formSubmitted ? (
                  <div className="mt-8 rounded-2xl bg-emerald-50 p-6 border border-emerald-100 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mb-3 border border-emerald-200">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-emerald-950">Terima Kasih Atas Partisipasi Anda!</h4>
                    <p className="mt-1.5 text-xs text-emerald-700 max-w-sm mx-auto">
                      Rekomendasi Anda telah masuk ke antrean database review Admin GateTI. Kami akan segera mendeploy info tersebut secepatnya.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="mt-6 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Nama / Komunitas Pengirim</label>
                      <input 
                        type="text" 
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Misal: HMTI Untirta atau nama alumni..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold focus:border-blue-900 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-1.5">Detail & Tautan Poster / Informasi Program</label>
                      <textarea 
                        required
                        rows={5}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Contoh: Deskripsi kegiatan, tenggat waktu pendaftaran, link google drive or social media..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold focus:border-blue-900 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs py-4 shadow hover:scale-[1.01] active:scale-95 transition-all"
                      id="submit-recommendation-btn"
                    >
                      Kirim Diskusi / Program Baru
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- COMPACT BLUE SUB-NAV BAR (matching PDF Footer bar) ---------------- */}
      <footer className="mt-12 bg-blue-900 py-6 text-white" id="home-subnavigation-tabbar">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 sm:flex-row sm:px-6">
          <p className="text-[11px] font-medium text-slate-300">
            © 2026 GateTI – IDS Teknik Industri Untirta
          </p>

          <div className="mt-4 flex space-x-8 sm:mt-0">
            <button 
              onClick={() => {
                setActiveSubTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition ${
                activeSubTab === 'home' 
                  ? 'border-amber-400 text-amber-400 font-extrabold' 
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              Visi & Misi
            </button>

            <button 
              onClick={() => {
                setActiveSubTab('faq');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition ${
                activeSubTab === 'faq' 
                  ? 'border-amber-400 text-amber-400 font-extrabold' 
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              FAQ
            </button>

            <button 
              onClick={() => {
                setActiveSubTab('kontak');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition ${
                activeSubTab === 'kontak' 
                  ? 'border-amber-400 text-amber-400 font-extrabold' 
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              Kontak
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
