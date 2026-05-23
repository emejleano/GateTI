# Instruksi Setup Google Apps Script untuk GateTI

## Langkah-langkah Setup

### 1. Buka Google Spreadsheet
Buka spreadsheet yang terhubung dengan Apps Script deployment ini.

### 2. Pastikan Sheet Berikut Ada
Spreadsheet harus memiliki **7 sheet** dengan nama persis seperti berikut:

| Nama Sheet | Kolom Header (Baris 1) |
|---|---|
| `users` | nim, name, jurusan, angkatan, role, passwordHash, photoUrl |
| `lombas` | id, title, category, description, deadline, prize, image, registerLink, deskripsi, temaSubtema, timeline, syaratKetentuan, faq |
| `prestasis` | id, name, title, category, level, year, organizer, rank |
| `beasiswas` | id, title, provider, description, image, registerLink, timeline, requirements, qrCode |
| `beasiswa_timelines` | id, beasiswaId, phase, date, description, sortOrder |
| `webinars` | id, title, subtitle, dateStr, timeStr, speakerName, speakerTitle, location, image, registerLink, status, description, benefits |
| `certifications` | id, title, provider, category, description, deadline, fee, registerLink, image |

### 3. Apps Script Code
Buka menu **Extensions > Apps Script** di Google Spreadsheet, lalu paste kode berikut:

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

// Membaca seluruh data dari 7 sheet aktif
function handleGetData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {};
  
  var sheets = ["users", "lombas", "prestasis", "beasiswas", "beasiswa_timelines", "webinars", "certifications"];
  
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
        if (sheetName === "beasiswa_timelines" && entry.sortOrder) {
          entry.sortOrder = Number(entry.sortOrder);
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
  
  var sheets = ["users", "lombas", "prestasis", "beasiswas", "beasiswa_timelines", "webinars", "certifications"];
  
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

### 4. Deploy sebagai Web App
1. Klik **Deploy > New Deployment**
2. Pilih type: **Web App**
3. Settings:
   - **Execute as**: Me (akun Google Anda)
   - **Who has access**: Anyone
4. Klik **Deploy**
5. Copy URL yang dihasilkan

### 5. URL yang Digunakan
URL yang sudah di-hardcode di website GateTI:
```
https://script.google.com/macros/s/AKfycbxPmza3YGdtt8xXRN-1jufhS8K1ZxViCWjnYrY1BTPndrGgBQ5VeGgq65wHn36MevSNDQ/exec
```

> **PENTING**: Jika Anda mengubah kode Apps Script, Anda harus membuat **New Deployment** baru. URL deployment lama tetap menjalankan kode versi sebelumnya.

### 6. Verifikasi
Test dengan membuka URL berikut di browser:
```
https://script.google.com/macros/s/AKfycbxPmza3YGdtt8xXRN-1jufhS8K1ZxViCWjnYrY1BTPndrGgBQ5VeGgq65wHn36MevSNDQ/exec?action=getAll
```
Anda harus mendapatkan response JSON berisi data dari semua sheet.
