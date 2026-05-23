var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/db/db_store.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
function convertGoogleDriveUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  let fileId = "";
  const dRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const idRegex = /[?&]id=([a-zA-Z0-9_-]+)/;
  const dMatch = trimmed.match(dRegex);
  if (dMatch && dMatch[1]) {
    fileId = dMatch[1];
  } else {
    const idMatch = trimmed.match(idRegex);
    if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    }
  }
  if (fileId) {
    return `https://docs.google.com/uc?export=view&id=${fileId}`;
  }
  return trimmed;
}
var DB_FILE_PATH = import_path.default.join(process.cwd(), "src", "db", "db.json");
var dir = import_path.default.dirname(DB_FILE_PATH);
if (!import_fs.default.existsSync(dir)) {
  import_fs.default.mkdirSync(dir, { recursive: true });
}
var INITIAL_DB = {
  users: [
    {
      nim: "3333230000",
      name: "Justin Bieber",
      jurusan: "S1 Teknik Industri",
      angkatan: "2023",
      role: "user",
      passwordHash: "230000",
      // Last 6 digits of NIM: "3333230000" -> "230000"
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300"
    },
    {
      nim: "admin",
      name: "Admin GateTI",
      jurusan: "Fakultas Teknik Untirta",
      angkatan: "Staff",
      role: "admin",
      passwordHash: "admin123",
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
    }
  ],
  lombas: [
    {
      id: "L01",
      title: "Business Case Competition",
      category: "Nasional",
      description: "Kompetisi tingkat nasional bagi mahasiswa dalam bidang inovasi dan problem solving industri.",
      deadline: "2026-05-20",
      prize: "Rp. 25.000.000",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/sample-business-case",
      deskripsi: "Kompetisi ini bertujuan untuk mendorong mahasiswa dalam menghasilkan solusi inovatif terhadap permasalahan industri nyata. Peserta akan bekerja dalam tim untuk menganalisis, merancang solusi, dan mempresentasikan ide terbaik mereka.",
      temaSubtema: "Optimasi Rantai Pasok Hijau Berbasis Digital Twin",
      timeline: "Pendaftaran gelombang 1: 1 Maret - 20 Maret 2026\nPendaftaran gelombang 2: 21 Maret - 20 April 2026\nPengumuman TOP 30: 8 Mei 2026\nTahap Proposal: 9 Mei 2026\nPengumuman TOP 10: 14 Juni 2026\nPresentasi dan Pengumuman: 14 Juni 2026",
      syaratKetentuan: "1. Mahasiswa aktif S1/D4/D3 seluruh Indonesia.\n2. Satu tim terdiri dari 2-3 mahasiswa dari perguruan tinggi yang sama.\n3. Mengikuti akun media sosial penyelenggara.\n4. Proposal orisinal dan belum pernah memenangkan kompetisi sejenis.",
      faq: "Q: Apakah boleh berbeda jurusan?\nA: Boleh, asalkan berada di perguruan tinggi yang sama."
    },
    {
      id: "L02",
      title: "World Case Competition",
      category: "Internasional",
      description: "Navigating Green Law: Managing Risks and Opportunities in Modern Commercial Practices.",
      deadline: "2026-04-10",
      prize: "1,778 USD / Rp 30.000.000",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/sample-world-case",
      deskripsi: "Presented by DWDG UGM x Penn IBEC, with Case Partner Unilever and Microsoft.",
      temaSubtema: "Industrial Sustainability and Legal Compliance",
      timeline: "Early Bird Registration: 1 March - 15 March 2026\nRegular Registration: 16 March - 10 April 2026",
      syaratKetentuan: "International college/university students globally.",
      faq: "Q: Is there any registration fee?\nA: Free for Early Bird registrants."
    },
    {
      id: "L03",
      title: "Lomba Poster Ilustrasi Nasional",
      category: "Nasional",
      description: "Aksi Generasi Muda untuk Transportasi Ramah Lingkungan - Funtatonik 2026.",
      deadline: "2026-04-20",
      prize: "Uang Tunai + Sertifikat",
      image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/sample-poster",
      deskripsi: "Kompetisi pembuatan infografis/poster kreatif bertemakan transisi energi dan transportasi zero-emission.",
      temaSubtema: "Transportasi Ramah Lingkungan untuk Indonesia Maju",
      timeline: "Batas akhir pengunggahan poster: 20 April 2026",
      syaratKetentuan: "Pelajar SMA/SMK sederajat dan Mahasiswa D3/D4/S1 aktif nasional.",
      faq: "Q: Format file apa yang diperbolehkan?\nA: JPG/PNG dengan resolusi minimal 300 DPI."
    },
    {
      id: "L04",
      title: "Business Model Canvas (BMC) Competition",
      category: "Nasional",
      description: "Build Your Personal Brand, Build Your Future in Business Innovation.",
      deadline: "2026-04-17",
      prize: "Uang Tunai + E-Sertifikat",
      image: "https://images.unsplash.com/photo-1542744095-291853a069fc?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/sample-bmc",
      deskripsi: "Membantu mahasiswa memetakan ide bisnis kreatif menjadi model bisnis yang matang dan siap dipresentasikan.",
      temaSubtema: "Inovasi Kreatif dalam Menghadapi Resesi Global",
      timeline: "Batch 1: 1 - 9 Maret 2026\nBatch 2: 4 April - 17 April 2026",
      syaratKetentuan: "Umum / Mahasiswa Nasional.",
      faq: "Q: Apakah perorangan diperbolehkan?\nA: Boleh, peserta bisa tim (maksimal 3 orang) atau individu."
    },
    {
      id: "L05",
      title: "Geodefest 2026 (Paper & Poster)",
      category: "Nasional",
      description: "Rare Earth Elements: Essential Resources for Energy Transition and Sustainable Development Goals.",
      deadline: "2026-04-22",
      prize: "Free Registration & Cash Prizes",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/sample-geodefest",
      deskripsi: "Paper Competition organized by UPN Veteran Yogyakarta targeting geoscience and industrial integration.",
      temaSubtema: "Rare Earth Elements Value Chain Optimization",
      timeline: "Registration & Abstract submission: 11 March - 22 April 2026",
      syaratKetentuan: "Undergraduate active students in Geoscience, Materials, and Industrial Engineering.",
      faq: "Q: What language should be used?\nA: English or Bahasa Indonesia."
    },
    {
      id: "L06",
      title: "Green Scientific Competition 2026",
      category: "Nasional",
      description: "Karya Tulis Ilmiah dan Esai Tingkat Nasional - Transformasi Pembangunan Berbasis SDGs.",
      deadline: "2026-04-30",
      prize: "Piala + Jutaan Rupiah + Sertifikat",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/sample-green-scientific",
      deskripsi: "Kompetisi riset ilmiah guna mengusung ide pelestarian lingkungan dan rekayasa industri ramah lingkungan.",
      temaSubtema: "Infrastruktur Hijau, Transportasi Berkelanjutan, Energi Bersih",
      timeline: "Pengiriman Kertas Kerja: 30 April 2026",
      syaratKetentuan: "Mahasiswa D3/D4/S1 seluruh Indonesia.",
      faq: "Q: Di mana tahap presentasi dilakukan?\nA: Dilakukan secara hybrid di kampus."
    }
  ],
  prestasis: [
    {
      id: "P01",
      name: "Tim Optima",
      title: "OptFlow : Optimasi Aliran Produksi dengan Simulasi Digital Twin",
      category: "Essay",
      level: "Nasional",
      year: "2026",
      organizer: "Kementrian Perindustrian RI",
      rank: "Juara 1"
    },
    {
      id: "P02",
      name: "Dwi Putri A.",
      title: "ErgoLift : Inovasi Alat Bantu Angkat Beban Berbasis Ergonomi",
      category: "Inovasi Produk",
      level: "Nasional",
      year: "2025",
      organizer: "Industri Maju Indonesia",
      rank: "Juara 3"
    },
    {
      id: "P03",
      name: "Untirta Industrial Rangers",
      title: "Simulation-Based Facility Layout Design for SMEs in Cilegon",
      category: "Business Case",
      level: "Internasional",
      year: "2026",
      organizer: "APCHI Conference",
      rank: "Juara 2"
    },
    {
      id: "P04",
      name: "Farhan & Team",
      title: "Redesigning Assembly Line Layout Using Arena Simulation Software",
      category: "Paper Competition",
      level: "Nasional",
      year: "2025",
      organizer: "ITS Surabaya",
      rank: "Juara 1"
    }
  ],
  beasiswas: [
    {
      id: "B01",
      title: "Beasiswa ASTRA",
      provider: "Astra Internasional",
      description: "Astra1st 2026 is open for application. Strengthen your path for Sustainable Growth.",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/astra-scholarship",
      timeline: "Seleksi Administrasi: Maret - Mei 2026\nTest Online: April - Mei 2026\nInterview: Mei 2026\nVideo Case Study: Mei 2026\nOnboarding: Juni 2026",
      requirements: "1. Mahasiswa S1 Aktif Universitas Mitra (termasuk Untirta) Jurusan Teknik\n2. IPK Minimal 3.00\n3. Aktif berorganisasi dan bersedia mengikuti masa magang.",
      qrCode: "https://example.com/qr-astra"
    },
    {
      id: "B02",
      title: "BSI Scholarship Unggulan 2026",
      provider: "Bank Syariah Indonesia",
      description: "Pembukaan Pendaftaran Batch 1 Jalur Undangan. UKT Full Cover, uang saku khusus, magang terstruktur.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/bsi-scholarship",
      timeline: "Pendaftaran: 25 Maret - 15 Mei 2026",
      requirements: "Mahasiswa aktif semester 2 dengan IPK minimal 3.25, berasal dari latar belakang ekonomi tertentu/berprestasi."
    },
    {
      id: "B03",
      title: "Beasiswa BAZNAS Kutai Timur",
      provider: "Badan Amil Zakat Nasional",
      description: "Pendaftaran Beasiswa BAZNAS Kutai Timur dan Wilayah Kerja 2026 Telah Dibuka.",
      image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/baznas-scholarship",
      timeline: "Pendaftaran: 1 April - 30 April 2026",
      requirements: "Mahasiswa asal Kutai Timur atau mahasiswa di PTN mitra yang berhak menerimanya sesuai kriteria syariah."
    },
    {
      id: "B04",
      title: "Pendaftaran KIP Kuliah 2026",
      provider: "Kemdikbudristek RI",
      description: "Jalur UTBK-SNBT Tahun 2026. Raih Masa Depan dengan KIP Kuliah.",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://kip-kuliah.kemendikbud.go.id/",
      timeline: "Pendaftaran: 25 Maret - 07 April 2026",
      requirements: "Lulusan SMA/SMK sederajat tahun berjalan atau maksimal 2 tahun sebelumnya, lolos jalur seleksi PTN."
    },
    {
      id: "B05",
      title: "Djarum Beasiswa Plus TAHUN 2026",
      provider: "Djarum Foundation",
      description: "Pemberian tunjangan prestasi dan pembekalan materi Soft Skills yang prestisius.",
      image: "https://images.unsplash.com/photo-1491845316042-6d44e25c8402?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://djarumbeasiswaplus.org",
      timeline: "Pendaftaran Online: 30 Maret - 3 Juni 2026\nTes Tulis Online: Juni 2026\nWawancara: Juli - Agustus 2026",
      requirements: "Mahasiswa aktif S1 semester 4, IPK minimal 3.00, aktif organisasi, tidak sedang menerima beasiswa lain."
    }
  ],
  beasiswa_timelines: [
    {
      id: "BT01",
      beasiswaId: "B01",
      phase: "Seleksi Administrasi",
      date: "Maret - Mei 2026",
      sortOrder: 1
    },
    {
      id: "BT02",
      beasiswaId: "B01",
      phase: "Test Online",
      date: "April - Mei 2026",
      sortOrder: 2
    },
    {
      id: "BT03",
      beasiswaId: "B01",
      phase: "Interview",
      date: "Mei 2026",
      sortOrder: 3
    },
    {
      id: "BT04",
      beasiswaId: "B01",
      phase: "Studi Kasus Video",
      date: "Mei 25-28, 2026",
      sortOrder: 4
    },
    {
      id: "BT05",
      beasiswaId: "B01",
      phase: "Onboarding Magang",
      date: "Juni 2026",
      sortOrder: 5
    }
  ],
  webinars: [
    {
      id: "W01",
      title: "SATELIT",
      subtitle: "Seminar Nasional Terpadu Keilmuan Teknik Industri",
      dateStr: "20 Juli, 2026",
      timeStr: "10:00 - Selesai",
      speakerName: "Achmad Aditya, Ph.D & Drs. Andrinof A. Chaniago, MSi",
      speakerTitle: "Senior Manager Sustainable Sourcing at Unilever & Wakil Komisaris Utama Bank Mandiri",
      location: "Zoom Meeting / Hybrid Untirta",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://satelit-ti-untirta.id",
      status: "Terbuka",
      description: "Webinar ini akan membahas perkembangan terbaru dalam teknik industri, dengan fokus pada \u201CErgonomi, Perancangan Sistem Kerja dan Perancangan Produk. Sistem Produk dan manajemen Kualitas. Penelitian Operasional dan Pemodelan Sistem. Manajemen Industri, Kewirausahaan, dan Inovaasi. Sistem Informasi dan Keputusan. Logistik dan Manajemen Rantai Pasok. serta topik lainnya yang bermanfaat dan relevan dengan keilmuan teknik industri.\u201D",
      benefits: ["E-Sertifikat", "Materi PDF", "Networking", "Doorprize Menarik"]
    },
    {
      id: "W02",
      title: "Webinar Bisnis & Industri Kreatif",
      subtitle: "Build a Resilient Digital Brand and Operations",
      dateStr: "15 Juni, 2026",
      timeStr: "13:00 - 15:30 WIB",
      speakerName: "Neil Tran & Chidi Eze",
      speakerTitle: "Digital Marketing Strategist & Operations Specialist",
      location: "Zoom Webinar",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/sample-webinar-nis",
      status: "Terbuka",
      description: "Menyajikan materi optimasi operasional perusahaan rintisan / startup di kancah global.",
      benefits: ["E-Sertifikat", "Recording Akses"]
    },
    {
      id: "W03",
      title: "Re-engineering Your Business Process",
      subtitle: "Sustaining Process Optimization in Manufacturing Sector",
      dateStr: "27 Juni, 2026",
      timeStr: "09:00 - 11:30 WIB",
      speakerName: "Yuli Agusti, S.T., M.Eng.",
      speakerTitle: "Supply Chain & Re-engineering Consultant at PMI",
      location: "Microsoft Teams",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=600",
      registerLink: "https://forms.gle/sample-webinar-reeng",
      status: "Terbuka",
      description: "Bagaimana restrukturisasi sistem manufaktur dapat menghemat pengeluaran logistik hingga 40%.",
      benefits: ["Free Entry", "E-Sertifikat", "Soft File Handbook"]
    }
  ],
  certifications: [
    {
      id: "C01",
      title: "Sertifikasi Ahli K3 Umum",
      provider: "BNSP (Badan Nasional Sertifikasi Profesi)",
      category: "K3 & Lingkungan",
      description: "Sertifikasi untuk profesional yang bertanggung jawab dalam penerapan Kesehatan dan Keselamatan Kerja (K3) di tempat kerja perusahaan.",
      deadline: "01 Mei - 30 Jun 2026",
      fee: "Rp 1.500.000",
      registerLink: "https://example.com/daftar-k3"
    },
    {
      id: "C02",
      title: "Microsoft Excel Expert (MO-201)",
      provider: "Microsoft",
      category: "Analisis & Data",
      description: "Kuasai fitur lanjutan Excel untuk analisis data makro, spreadsheet finansial, dan pengambilan keputusan berbasis data.",
      deadline: "15 Mei - 15 Jul 2026",
      fee: "Rp 500.000",
      registerLink: "https://example.com/daftar-excel"
    },
    {
      id: "C03",
      title: "Lean Six Sigma Green Belt",
      provider: "IASSC",
      category: "Manajemen & Operasional",
      description: "Tingkatkan efisiensi proses manufaktur dan kualitas dengan metodologi statistika modern Lean Six Sigma.",
      deadline: "10 Mei - 10 Jul 2026",
      fee: "Rp 5.000.000",
      registerLink: "https://example.com/daftar-six-sigma"
    }
  ],
  settings: {
    spreadsheetUrl: "",
    autoSyncEnabled: false,
    lastSyncTime: "Belum Pernah",
    status: "idle"
  }
};
function getDatabase() {
  try {
    if (import_fs.default.existsSync(DB_FILE_PATH)) {
      const content = import_fs.default.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed.lombas) {
        parsed.lombas = parsed.lombas.map((l) => ({ ...l, image: convertGoogleDriveUrl(l.image) }));
      }
      if (parsed.beasiswas) {
        parsed.beasiswas = parsed.beasiswas.map((b) => ({ ...b, image: convertGoogleDriveUrl(b.image) }));
      }
      if (!parsed.beasiswa_timelines) {
        parsed.beasiswa_timelines = [];
      }
      if (parsed.webinars) {
        parsed.webinars = parsed.webinars.map((w) => ({ ...w, image: convertGoogleDriveUrl(w.image) }));
      }
      if (parsed.certifications) {
        parsed.certifications = parsed.certifications.map((c) => ({ ...c, image: convertGoogleDriveUrl(c.image) }));
      }
      return parsed;
    }
  } catch (error) {
    console.error("Error reading database file, using fallback", error);
  }
  saveDatabase(INITIAL_DB);
  return INITIAL_DB;
}
function saveDatabase(db) {
  try {
    import_fs.default.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file", error);
  }
}

// server.ts
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.post("/api/auth/login", (req, res) => {
    const { nim, password } = req.body;
    if (!nim || !password) {
      return res.status(400).json({ message: "NIM dan Password harus diisi." });
    }
    const db = getDatabase();
    const user = db.users.find((u) => String(u.nim) === String(nim));
    if (!user) {
      return res.status(401).json({ message: "NIM tidak terdaftar." });
    }
    if (String(user.passwordHash) !== String(password)) {
      return res.status(401).json({ message: "Password salah." });
    }
    res.json({
      success: true,
      user: {
        nim: String(user.nim),
        name: user.name,
        jurusan: user.jurusan,
        angkatan: String(user.angkatan),
        role: user.role,
        photoUrl: user.photoUrl
      }
    });
  });
  app.get("/api/users", (req, res) => {
    const db = getDatabase();
    res.json(db.users.map((user) => ({
      nim: String(user.nim),
      name: user.name,
      jurusan: user.jurusan,
      angkatan: String(user.angkatan),
      role: user.role,
      photoUrl: user.photoUrl,
      passwordHash: String(user.passwordHash || "")
    })));
  });
  app.post("/api/users", (req, res) => {
    const db = getDatabase();
    const user = {
      ...req.body,
      nim: String(req.body.nim || "").trim(),
      name: String(req.body.name || "").trim(),
      jurusan: String(req.body.jurusan || "").trim(),
      angkatan: String(req.body.angkatan || "").trim(),
      role: req.body.role === "admin" ? "admin" : "user",
      passwordHash: String(req.body.passwordHash || "").trim(),
      photoUrl: String(req.body.photoUrl || "").trim()
    };
    if (!user.nim || !user.name || !user.passwordHash) {
      return res.status(400).json({ message: "NIM/username, nama, dan password wajib diisi." });
    }
    const idx = db.users.findIndex((u) => String(u.nim) === String(user.nim));
    if (idx > -1) {
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      db.users.push(user);
    }
    saveDatabase(db);
    res.json({ success: true, users: db.users });
  });
  app.delete("/api/users/:nim", (req, res) => {
    const db = getDatabase();
    if (db.users.length <= 1) {
      return res.status(400).json({ message: "Minimal harus ada satu user tersisa." });
    }
    db.users = db.users.filter((u) => String(u.nim) !== String(req.params.nim));
    saveDatabase(db);
    res.json({ success: true, users: db.users });
  });
  app.get("/api/users/:nim", (req, res) => {
    const { nim } = req.params;
    const db = getDatabase();
    const user = db.users.find((u) => String(u.nim) === String(nim));
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({
      nim: user.nim,
      name: user.name,
      jurusan: user.jurusan,
      angkatan: user.angkatan,
      role: user.role,
      photoUrl: user.photoUrl
    });
  });
  app.get("/api/lombas", (req, res) => {
    try {
      const db = getDatabase();
      res.json(db.lombas);
    } catch (e) {
      res.status(500).json({ message: "Gagal mengambil data lomba" });
    }
  });
  app.post("/api/lombas", (req, res) => {
    try {
      const db = getDatabase();
      const newLomba = req.body;
      if (!newLomba.title || !newLomba.deadline) {
        return res.status(400).json({ message: "Judul dan batas pendaftaran wajib diisi." });
      }
      if (newLomba.image) {
        newLomba.image = convertGoogleDriveUrl(newLomba.image);
      }
      const existingIndex = db.lombas.findIndex((l) => l.id === newLomba.id);
      if (existingIndex > -1) {
        db.lombas[existingIndex] = { ...db.lombas[existingIndex], ...newLomba };
      } else {
        newLomba.id = newLomba.id || "LOMB_" + Date.now();
        db.lombas.push(newLomba);
      }
      saveDatabase(db);
      res.json({ success: true, lombas: db.lombas });
    } catch (e) {
      res.status(500).json({ message: "Gagal menyimpan data lomba." });
    }
  });
  app.delete("/api/lombas/:id", (req, res) => {
    try {
      const db = getDatabase();
      db.lombas = db.lombas.filter((l) => l.id !== req.params.id);
      saveDatabase(db);
      res.json({ success: true, lombas: db.lombas });
    } catch (e) {
      res.status(500).json({ message: "Gagal menghapus data lomba" });
    }
  });
  app.get("/api/prestasis", (req, res) => {
    const db = getDatabase();
    res.json(db.prestasis);
  });
  app.post("/api/prestasis", (req, res) => {
    const db = getDatabase();
    const prest = req.body;
    if (!prest.name || !prest.title) {
      return res.status(400).json({ message: "Nama dan judul karya wajib diisi" });
    }
    const idx = db.prestasis.findIndex((p) => p.id === prest.id);
    if (idx > -1) {
      db.prestasis[idx] = prest;
    } else {
      prest.id = prest.id || "PRES_" + Date.now();
      db.prestasis.push(prest);
    }
    saveDatabase(db);
    res.json({ success: true, prestasis: db.prestasis });
  });
  app.delete("/api/prestasis/:id", (req, res) => {
    const db = getDatabase();
    db.prestasis = db.prestasis.filter((p) => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, prestasis: db.prestasis });
  });
  app.get("/api/beasiswas", (req, res) => {
    const db = getDatabase();
    res.json(db.beasiswas);
  });
  app.post("/api/beasiswas", (req, res) => {
    const db = getDatabase();
    const beasiswa = req.body;
    if (!beasiswa.title || !beasiswa.provider) {
      return res.status(400).json({ message: "Judul dan penyelenggara wajib diisi" });
    }
    if (beasiswa.image) {
      beasiswa.image = convertGoogleDriveUrl(beasiswa.image);
    }
    const idx = db.beasiswas.findIndex((b) => b.id === beasiswa.id);
    if (idx > -1) {
      db.beasiswas[idx] = beasiswa;
    } else {
      beasiswa.id = beasiswa.id || "BEAS_" + Date.now();
      db.beasiswas.push(beasiswa);
    }
    saveDatabase(db);
    res.json({ success: true, beasiswas: db.beasiswas });
  });
  app.delete("/api/beasiswas/:id", (req, res) => {
    const db = getDatabase();
    db.beasiswas = db.beasiswas.filter((b) => b.id !== req.params.id);
    db.beasiswa_timelines = (db.beasiswa_timelines || []).filter((t) => t.beasiswaId !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, beasiswas: db.beasiswas });
  });
  app.get("/api/beasiswa-timelines", (req, res) => {
    const db = getDatabase();
    const rows = (db.beasiswa_timelines || []).sort((a, b) => {
      if (a.beasiswaId !== b.beasiswaId) return a.beasiswaId.localeCompare(b.beasiswaId);
      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    });
    res.json(rows);
  });
  app.post("/api/beasiswa-timelines", (req, res) => {
    const db = getDatabase();
    const timeline = {
      id: String(req.body.id || "").trim(),
      beasiswaId: String(req.body.beasiswaId || "").trim(),
      phase: String(req.body.phase || "").trim(),
      date: String(req.body.date || "").trim(),
      description: String(req.body.description || "").trim(),
      sortOrder: Number(req.body.sortOrder || 1)
    };
    if (!timeline.beasiswaId || !timeline.phase || !timeline.date) {
      return res.status(400).json({ message: "Beasiswa, tahap, dan tanggal wajib diisi." });
    }
    db.beasiswa_timelines = db.beasiswa_timelines || [];
    const idx = db.beasiswa_timelines.findIndex((t) => t.id === timeline.id);
    if (idx > -1) {
      db.beasiswa_timelines[idx] = timeline;
    } else {
      timeline.id = timeline.id || "BT_" + Date.now();
      db.beasiswa_timelines.push(timeline);
    }
    saveDatabase(db);
    res.json({ success: true, beasiswa_timelines: db.beasiswa_timelines });
  });
  app.delete("/api/beasiswa-timelines/:id", (req, res) => {
    const db = getDatabase();
    db.beasiswa_timelines = (db.beasiswa_timelines || []).filter((t) => t.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, beasiswa_timelines: db.beasiswa_timelines });
  });
  app.get("/api/webinars", (req, res) => {
    const db = getDatabase();
    res.json(db.webinars);
  });
  app.post("/api/webinars", (req, res) => {
    const db = getDatabase();
    const webinar = req.body;
    if (!webinar.title || !webinar.speakerName) {
      return res.status(400).json({ message: "Judul dan Pembicara wajib diisi" });
    }
    if (webinar.image) {
      webinar.image = convertGoogleDriveUrl(webinar.image);
    }
    const idx = db.webinars.findIndex((w) => w.id === webinar.id);
    if (idx > -1) {
      db.webinars[idx] = webinar;
    } else {
      webinar.id = webinar.id || "WEB_" + Date.now();
      db.webinars.push(webinar);
    }
    saveDatabase(db);
    res.json({ success: true, webinars: db.webinars });
  });
  app.delete("/api/webinars/:id", (req, res) => {
    const db = getDatabase();
    db.webinars = db.webinars.filter((w) => w.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, webinars: db.webinars });
  });
  app.get("/api/certifications", (req, res) => {
    const db = getDatabase();
    res.json(db.certifications);
  });
  app.post("/api/certifications", (req, res) => {
    const db = getDatabase();
    const cert = req.body;
    if (!cert.title || !cert.provider) {
      return res.status(400).json({ message: "Judul dan provider wajib diisi" });
    }
    if (cert.image) {
      cert.image = convertGoogleDriveUrl(cert.image);
    }
    const idx = db.certifications.findIndex((c) => c.id === cert.id);
    if (idx > -1) {
      db.certifications[idx] = cert;
    } else {
      cert.id = cert.id || "CERT_" + Date.now();
      db.certifications.push(cert);
    }
    saveDatabase(db);
    res.json({ success: true, certifications: db.certifications });
  });
  app.delete("/api/certifications/:id", (req, res) => {
    const db = getDatabase();
    db.certifications = db.certifications.filter((c) => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, certifications: db.certifications });
  });
  app.get("/api/settings", (req, res) => {
    const db = getDatabase();
    res.json(db.settings);
  });
  app.post("/api/settings", (req, res) => {
    const db = getDatabase();
    db.settings = { ...db.settings, ...req.body };
    saveDatabase(db);
    res.json(db.settings);
  });
  app.post("/api/settings/sync", async (req, res) => {
    const db = getDatabase();
    const scriptUrl = db.settings.spreadsheetUrl;
    if (!scriptUrl) {
      return res.status(400).json({
        success: false,
        message: "Google Apps Script Web App URL belum didaftarkan di Pengaturan Admin."
      });
    }
    try {
      db.settings.status = "syncing";
      saveDatabase(db);
      const syncUrl = `${scriptUrl.trim()}?action=getAll`;
      console.log(`Sending sync GET request to Apps Script URL: ${syncUrl}`);
      const response = await fetch(syncUrl, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      const rawResult = await response.text();
      let payload;
      try {
        payload = JSON.parse(rawResult);
      } catch (parserErr) {
        throw new Error("Respons dari Google Apps Script bukan format JSON yang valid. Pastikan Apps Script telah di-deploy ulang sebagai Web App (Anyone/Anonim).");
      }
      if (payload && (payload.lombas || payload.beasiswas || payload.beasiswa_timelines || payload.webinars || payload.prestasis || payload.users || payload.certifications)) {
        if (payload.users && payload.users.length) {
          db.users = payload.users;
        }
        if (payload.lombas && payload.lombas.length) {
          db.lombas = payload.lombas;
        }
        if (payload.prestasis && payload.prestasis.length) {
          db.prestasis = payload.prestasis;
        }
        if (payload.beasiswas && payload.beasiswas.length) {
          db.beasiswas = payload.beasiswas;
        }
        if (Array.isArray(payload.beasiswa_timelines)) {
          db.beasiswa_timelines = payload.beasiswa_timelines.map((item) => ({
            ...item,
            sortOrder: Number(item.sortOrder || 1)
          }));
        }
        if (payload.webinars && payload.webinars.length) {
          db.webinars = payload.webinars;
        }
        if (payload.certifications && payload.certifications.length) {
          db.certifications = payload.certifications;
        }
        db.settings.status = "success";
        db.settings.lastSyncTime = (/* @__PURE__ */ new Date()).toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          dateStyle: "medium",
          timeStyle: "medium"
        });
        db.settings.errorMessage = void 0;
        saveDatabase(db);
        try {
          await fetch(scriptUrl.trim(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "syncAll", data: db })
          });
        } catch (pushErr) {
          console.warn("Bidirectional synchronization push back warning:", pushErr);
        }
        return res.json({
          success: true,
          message: "Sinkronisasi real-time dengan Spreadsheet Google sukses!",
          settings: db.settings
        });
      } else {
        throw new Error("Struktur data JSON Spreadsheet tidak valid. Pastikan nama sheet sesuai dengan format panduan.");
      }
    } catch (e) {
      console.error("Error synchronizing spreadsheet:", e);
      db.settings.status = "error";
      db.settings.errorMessage = e.message || "Koneksi gagal atau runtime error dari Apps Script.";
      saveDatabase(db);
      res.status(500).json({
        success: false,
        message: db.settings.errorMessage,
        settings: db.settings
      });
    }
  });
  setInterval(async () => {
    const db = getDatabase();
    if (db.settings.autoSyncEnabled && db.settings.spreadsheetUrl) {
      console.log("AutoSync trigger: checking external spreadsheet updates...");
      try {
        const scriptUrl = db.settings.spreadsheetUrl.trim();
        const response = await fetch(`${scriptUrl}?action=getAll`);
        if (response.ok) {
          const payload = await response.json();
          if (payload && (payload.lombas || payload.beasiswas || payload.beasiswa_timelines || payload.webinars || payload.prestasis || payload.users || payload.certifications)) {
            const loadedDb = getDatabase();
            if (payload.users && payload.users.length) loadedDb.users = payload.users;
            if (payload.lombas && payload.lombas.length) loadedDb.lombas = payload.lombas;
            if (payload.prestasis && payload.prestasis.length) loadedDb.prestasis = payload.prestasis;
            if (payload.beasiswas && payload.beasiswas.length) loadedDb.beasiswas = payload.beasiswas;
            if (Array.isArray(payload.beasiswa_timelines)) {
              loadedDb.beasiswa_timelines = payload.beasiswa_timelines.map((item) => ({
                ...item,
                sortOrder: Number(item.sortOrder || 1)
              }));
            }
            if (payload.webinars && payload.webinars.length) loadedDb.webinars = payload.webinars;
            if (payload.certifications && payload.certifications.length) loadedDb.certifications = payload.certifications;
            loadedDb.settings.lastSyncTime = (/* @__PURE__ */ new Date()).toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
              dateStyle: "medium",
              timeStyle: "medium"
            });
            loadedDb.settings.status = "success";
            loadedDb.settings.errorMessage = void 0;
            saveDatabase(loadedDb);
            console.log("AutoSync periodic background check: completed successfully.");
          }
        }
      } catch (err) {
        console.warn("AutoSync periodic background sync failed silently:", err);
      }
    }
  }, 9e4);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GateTI Backend Server] Running and ready on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
