/**
 * Domain Types for GateTI Portal
 */

export interface User {
  nim: string;
  name: string;
  jurusan: string;
  angkatan: string;
  role: 'admin' | 'user';
  photoUrl?: string;
  passwordHash: string; // Initially, password is last 6 digits of NIM
}

export interface Lomba {
  id: string;
  title: string;
  category: string; // e.g., 'Nasional', 'Internasional', 'Regional'
  description: string;
  deadline: string; // YYYY-MM-DD
  prize: string; // e.g., 'Rp. 25.000.000'
  image: string; // GDrive or static URL
  registerLink: string;
  deskripsi: string;
  temaSubtema: string;
  timeline: string; // Detailed milestones
  syaratKetentuan: string;
  faq: string; // Competition Specific FAQ
}

export interface Prestasi {
  id: string;
  name: string; // Nama Peserta/Tim
  title: string; // Judul Karya
  category: string; // Jenis Lomba
  level: string; // Tingkat: Nasional, Internasional, etc.
  year: string; // Tahun
  organizer: string; // Penyelenggara
  rank: string; // Juara 1, Juara 2, etc.
}

export interface Beasiswa {
  id: string;
  title: string;
  provider: string; // Penyelenggara: Astra, BSI, etc.
  description: string;
  image: string;
  registerLink: string;
  timeline: string; // JSON or markdown details
  qrCode?: string; // QR target / scan link
  requirements: string;
}

export interface BeasiswaTimeline {
  id: string;
  beasiswaId: string;
  phase: string;
  date: string;
  description?: string;
  sortOrder: number;
}

export interface Webinar {
  id: string;
  title: string;
  subtitle: string;
  dateStr: string; // e.g. "20 Juli, 2026"
  timeStr: string; // e.g. "10:00 - Selesai"
  speakerName: string;
  speakerTitle: string;
  location: string;
  image: string;
  registerLink: string;
  status: 'Terbuka' | 'Selesai';
  description: string;
  benefits: string[]; // e.g. ["E-Sertifikat", "Materi PDF", "Networking", "Doorprize Menarik"]
}

export interface Certification {
  id: string;
  title: string;
  provider: string; // BNSP, Microsoft, IASSC, etc.
  category: string; // "Manajemen & Operasional", "Analisis & Data", "K3 & Lingkungan", "Rantai Pasok", "Sistem & Proses", "Lainnya"
  description: string;
  deadline: string;
  fee: string;
  registerLink: string;
  image?: string;
}

export interface SystemSettings {
  spreadsheetUrl: string;
  autoSyncEnabled: boolean;
  lastSyncTime: string;
  status: 'idle' | 'syncing' | 'error' | 'success';
  errorMessage?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}
