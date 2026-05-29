# Panduan Sinkronisasi Real-Time Google Spreadsheet & Google Drive - GateTI

Dokumen ini menjelaskan cara menyusun **Google Spreadsheet** sebagai database utama GateTI menggunakan **Google Apps Script** (tanpa memerlukan set-up akun Google Cloud Console) serta cara mengunggah dan menampilkan berkas gambar poster langsung dari **Google Drive**.

---

## 📅 Bagian 1: Struktur Tabel Google Spreadsheet

Buat sebuah file Google Spreadsheet baru, lalu tambahkan **6 buah tab (Sheet)** dengan nama persis sebagai berikut:

### 1. Tab Sheet: `users`
Digunakan untuk mengelola akun mahasiswa dan admin.
* **Kolom A:** `nim` (misal: `3333230000` atau `admin`)
* **Kolom B:** `name` (misal: `Justin Bieber`)
* **Kolom C:** `jurusan` (misal: `S1 Teknik Industri`)
* **Kolom D:** `angkatan` (misal: `2023`)
* **Kolom E:** `role` (nilai wajib: `user` atau `admin`)
* **Kolom F:** `passwordHash` (6 digit belakang NIM untuk mhs, atau password kustom untuk admin)
* **Kolom G:** `photoUrl` (Tautan foto profil atau kosongkan untuk gambar default)

### 2. Tab Sheet: `lombas`
Digunakan untuk mengelola daftar kompetisi/lomba.
* **Kolom A:** `id` (misal: `L01`)
* **Kolom B:** `title` (Nama Lomba)
* **Kolom C:** `category` (misal: `Nasional` / `Internasional`)
* **Kolom D:** `description` (Deskripsi singkat kartu)
* **Kolom E:** `deadline` (Tanggal format `YYYY-MM-DD`)
* **Kolom F:** `prize` (Total Hadiah, misal: `Rp. 25.000.000`)
* **Kolom G:** `image` (Tautan Google Drive gambar poster)
* **Kolom H:** `registerLink` (Link pendaftaran eksternal)
* **Kolom I:** `deskripsi` (Detail lengkap lomba)
* **Kolom J:** `temaSubtema` (Tema & Subtema)
* **Kolom K:** `timeline` (Urutan timeline baris baru menggunakan Alt+Enter)
* **Kolom L:** `syaratKetentuan` (Syarat dan dokumen)
* **Kolom M:** `faq` (Pertanyaan umum seputar lomba)

### 3. Tab Sheet: `prestasis`
Digunakan untuk database prestasi mahasiswa TI (Halaman Dashboard & Database Prestasi).
* **Kolom A:** `id` (misal: `P01`)
* **Kolom B:** `name` (Nama Mahasiswa / Tim)
* **Kolom C:** `title` (Judul Karya)
* **Kolom D:** `category` (Jenis Lomba: `Essay`, `Inovasi Produk`, `KTI`, dll)
* **Kolom E:** `level` (Tingkat: `Nasional` / `Internasional` / `Regional`)
* **Kolom F:** `year` (Tahun pencapaian)
* **Kolom G:** `organizer` (Pihak Penyelenggara)
* **Kolom H:** `rank` (Juara keberapa: `Juara 1`, `Juara 3`, dsb)

### 4. Tab Sheet: `beasiswas`
Digunakan untuk mengelola pendaftaran beasiswa mahasiswa.
* **Kolom A:** `id` (misal: `B01`)
* **Kolom B:** `title` (Nama Beasiswa)
* **Kolom C:** `provider` (Sponsor / Instansi penyedia)
* **Kolom D:** `description` (Deskripsi singkat)
* **Kolom E:** `image` (Tautan Google Drive gambar poster beasiswa)
* **Kolom F:** `registerLink` (Link pendaftaran)
* **Kolom G:** `timeline` (Timeline seleksi; isi per baris contoh: `Seleksi Administrasi: Maret - Mei 2026`)
* **Kolom H:** `requirements` (Persyaratan utama)
### 5. Tab Sheet: `webinars`
Digunakan untuk mengelola info Webinar.
* **Kolom A:** `id` (misal: `W01`)
* **Kolom B:** `title` (Judul Utama)
* **Kolom C:** `subtitle` (Sub-judul detail)
* **Kolom D:** `dateStr` (Tanggal teks, misal: `20 Juli, 2026`)
* **Kolom E:** `timeStr` (Waktu teks, misal: `10:00 - Selesai`)
* **Kolom F:** `speakerName` (Nama-nama Narasumber)
* **Kolom G:** `speakerTitle` (Jabatan/Keterangan Narasumber)
* **Kolom H:** `location` (Tempat/Media, misal: `Zoom Webinar`)
* **Kolom I:** `image` (Link poster)
* **Kolom J:** `registerLink` (Link pendaftaran)
* **Kolom K:** `status` (Nilai: `Terbuka` atau `Selesai`)
* **Kolom L:** `description` (Deskripsi detail)
* **Kolom M:** `benefits` (Benefit dipisah koma, misal: `E-Sertifikat,Materi PDF,Networking`)

### 6. Tab Sheet: `certifications`
Digunakan untuk mengelola sertifikasi keahlian Teknik Industri.
* **Kolom A:** `id`
* **Kolom B:** `title` (Nama Sertifikasi)
* **Kolom C:** `provider` (Penyelenggara, misal: `BNSP`)
* **Kolom D:** `category` (Pilih salah satu: `Manajemen & Operasional`, `Analisis & Data`, `K3 & Lingkungan`, `Rantai Pasok`, `Sistem & Proses`, `Lainnya`)
* **Kolom E:** `description` (Penjelasan singkat)
* **Kolom F:** `deadline` (Tanggal pendaftaran dibuka-tutup)
* **Kolom G:** `fee` (Biaya, misal: `Rp 1.500.000`)
* **Kolom H:** `registerLink` (Tautan pendaftaran)

---

## 🛠️ Bagian 2: Memasang Google Apps Script

Untuk mengintegrasikan Google Spreadsheet di atas dengan website GateTI secara real-time dan bekerja dua arah (bidirectional):

1. Di Google Spreadsheet Anda, klik **Ekstensi (Extensions)** pada menu bar atas.
2. Pilih **Apps Script**.
3. Hapus seluruh kode default di dalam editor `gcode.gs` (jika ada), lalu tempelkan (copy-paste) seluruh kode Apps Script di bawah ini:

```javascript
// --- KODE GOOGLE APPS SCRIPT UNTUK DATABASE GATETI ---

// Fungsi menangani request GET untuk menyuplai data ke website
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === "getAll") {
    return handleGetData();
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Action tidak valid" }))
                       .setMimeType(ContentService.MimeType.JSON);
}

// Fungsi menangani request POST untuk sinkronisasi dari website ke Google Sheets
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    
    if (action === "syncAll") {
      return handleSyncAll(postData.data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Action tidak dikenali" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// Membaca seluruh data dari 6 sheet aktif
function handleGetData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {};
  
  var sheets = ["users", "lombas", "prestasis", "beasiswas", "webinars", "certifications"];
  
  sheets.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result[sheetName] = [];
      return;
    }
    
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) {
      result[sheetName] = [];
      return;
    }
    
    var range = sheet.getRange(1, 1, lastRow, lastCol);
    var values = range.getValues();
    var headers = values[0];
    var dataRows = [];
    
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      var entry = {};
      var hasValue = false;
      
      for (var j = 0; j < headers.length; j++) {
        var val = row[j];
        // Jika format tanggal, ubah ke format ISO YYYY-MM-DD
        if (val instanceof Date) {
          val = val.toISOString().split('T')[0];
        }
        entry[headers[j]] = val;
        if (val !== null && val !== "") {
          hasValue = true;
        }
      }
      if (hasValue) {
        // Melakukan handling khusus untuk split data array seperti benefits webinar
        if (sheetName === "webinars" && entry.benefits) {
          if (typeof entry.benefits === "string") {
            entry.benefits = entry.benefits.split(",").map(function(s) { return s.trim(); });
          }
        }
        dataRows.push(entry);
      }
    }
    result[sheetName] = dataRows;
  });
  
  return ContentService.createTextOutput(JSON.stringify(result))
                       .setMimeType(ContentService.MimeType.JSON);
}

// Mengupdate Spreadsheet dari data terbaru di Website
function handleSyncAll(dbData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheets = ["users", "lombas", "prestasis", "beasiswas", "webinars", "certifications"];
  
  sheets.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet || !dbData[sheetName]) return;
    
    var list = dbData[sheetName];
    
    // Ambil header baris pertama
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) return;
    
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // Clear isi data di bawah Header
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).clearContent();
    }
    
    // Susun array dua dimensi baru berdasarkan urutan header
    var newRows = [];
    list.forEach(function(item) {
      var row = [];
      headers.forEach(function(header) {
        var value = item[header];
        if (value === undefined || value === null) {
          row.push("");
        } else if (Array.isArray(value)) {
          row.push(value.join(", ")); // khusus webinar benefits array
        } else {
          row.push(value);
        }
      });
      newRows.push(row);
    });
    
    if (newRows.length > 0) {
      sheet.getRange(2, 1, newRows.length, headers.length).setValues(newRows);
    }
  });
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Spreadsheet terupdate!" }))
                       .setMimeType(ContentService.MimeType.JSON);
}
```

### 🚀 Cara Men-Deploy Web App di Google Sheets:
1. Setelah menempel kode di atas, klik tombol **Simpan (Save)** (ikon disket) di atas editor.
2. Klik tombol **Terapkan (Deploy)** di pojok kanan atas -> pilih **Penerapan Baru (New Deployment)**.
3. Klik ikon roda gigi di sebelah "Pilih Jenis (Select type)" lalu pilih **Aplikasi Web (Web App)**.
4. Set konfigurasi berikut:
   * **Deskripsi:** `GateTI Sync API V1`
   * **Jalankan sebagai (Execute as):** `Saya (Your Email)` (Sangat krusial untuk akses sheet)
   * **Siapa yang memiliki akses (Who has access):** **Siapa saja (Anyone)**
   * *Catatan:* Mode "Anyone" diperlukan agar server website Anda dapat me-request data web service Apps Script gratis tanpa kunci OAuth konvensional.
5. Klik **Terapkan (Deploy)**, setujui perizinan akun jika diminta (*klik "Advanced" -> "Go to GateTI V1 (unsafe)" untuk menyetujui izin baca-tulis sheet*).
6. Salin **URL Aplikasi Web (Web App URL)** yang dihasilkan. Formatnya akan seperti:
   `https://script.google.com/macros/s/AKfycb.../exec`
7. Tempelkan URL di atas pada **Halaman Admin GateTI -> Pengaturan** di website Anda untuk mengaktifkan sinkronisasi otomatis!

---

## 🖼️ Bagian 3: Penggunaan & Auto-Convert Google Drive gambar Poster

Aplikasi GateTI telah dilengkapi fitur **Auto-Convert Tautan Google Drive**. Anda tidak perlu membongkar link gambar secara manual:

### Cara Mengambil Gambar dari Google Drive:
1. Upload file poster (.png/.jpg) Anda ke Google Drive.
2. Klik kanan pada file di Google Drive -> klik **Bagikan (Share)** -> pilih **Dapatkan Tautan (Get Link)**.
3. Ubah hak akses dari "Dibatasi (Restricted)" menjadi **"Siapa saja yang memiliki tautan" (Anyone with the link)** sebagai "Pelihat (Viewer)".
4. Salin tautannya. Formatnya akan terlihat seperti ini:
   `https://drive.google.com/file/d/1X-aBc123XyZ-kLMo/view?usp=sharing`
5. Langsung tempelkan tautan utuh tersebut ke dalam kolom **`image`** di Google Sheets (pada sheet `lombas`, `beasiswas`, `webinars`), atau masukkan lewat form pembuatan Lomba di halaman Admin GateTI.
6. **Sistem GateTI secara otomatis mendeteksi Format tautan tersebut**, mengekstrak ID berkas (`1X-aBc123XyZ-kLMo`), dan mengubahnya langsung menjadi format raw rendering direct:
   `https://docs.google.com/uc?export=view&id=1X-aBc123XyZ-kLMo`
   Ini membuat gambar langsung muncul jernih dan responsif di UI website!

---

## ⏰ Bagian 4: Otomasi Sinkronisasi Real-Time

Website GateTI memiliki sistem background scheduler otomatis:
* Setiap **90 detik**, jika fitur "Auto Sync" dicentang di halaman Admin, server Express akan melakukan trigger fetch ke Apps Script Web App untuk menyamakan data terupdate di Google Sheets.
* Kapan saja, Admin juga dapat masuk ke `/admin/dashboard` dan menekan tombol **"SINKRONISASI SEKARANG"** untuk melakukan penarikan data instan (Real-time force fetch).
