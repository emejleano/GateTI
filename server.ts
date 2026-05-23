import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDatabase, saveDatabase, convertGoogleDriveUrl } from './src/db/db_store';
import { User, Lomba, Prestasi, Beasiswa, BeasiswaTimeline, Webinar, Certification } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit expanded to accommodate image submissions
  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Auth: Student Login (NIM & Password)
  app.post('/api/auth/login', (req, res) => {
    const { nim, password } = req.body;
    if (!nim || !password) {
      return res.status(400).json({ message: 'NIM dan Password harus diisi.' });
    }

    const db = getDatabase();
    const user = db.users.find(u => String(u.nim) === String(nim));

    if (!user) {
      return res.status(401).json({ message: 'NIM tidak terdaftar.' });
    }

    // Passwords are plain text or direct matching for simplicty of Apps Script compatibility
    if (String(user.passwordHash) !== String(password)) {
      return res.status(401).json({ message: 'Password salah.' });
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

  // Users CRUD (Admin)
  app.get('/api/users', (req, res) => {
    const db = getDatabase();
    res.json(db.users.map(user => ({
      nim: String(user.nim),
      name: user.name,
      jurusan: user.jurusan,
      angkatan: String(user.angkatan),
      role: user.role,
      photoUrl: user.photoUrl,
      passwordHash: String(user.passwordHash || '')
    })));
  });

  app.post('/api/users', (req, res) => {
    const db = getDatabase();
    const user: User = {
      ...req.body,
      nim: String(req.body.nim || '').trim(),
      name: String(req.body.name || '').trim(),
      jurusan: String(req.body.jurusan || '').trim(),
      angkatan: String(req.body.angkatan || '').trim(),
      role: req.body.role === 'admin' ? 'admin' : 'user',
      passwordHash: String(req.body.passwordHash || '').trim(),
      photoUrl: String(req.body.photoUrl || '').trim()
    };

    if (!user.nim || !user.name || !user.passwordHash) {
      return res.status(400).json({ message: 'NIM/username, nama, dan password wajib diisi.' });
    }

    const idx = db.users.findIndex(u => String(u.nim) === String(user.nim));
    if (idx > -1) {
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      db.users.push(user);
    }
    saveDatabase(db);
    res.json({ success: true, users: db.users });
  });

  app.delete('/api/users/:nim', (req, res) => {
    const db = getDatabase();
    if (db.users.length <= 1) {
      return res.status(400).json({ message: 'Minimal harus ada satu user tersisa.' });
    }
    db.users = db.users.filter(u => String(u.nim) !== String(req.params.nim));
    saveDatabase(db);
    res.json({ success: true, users: db.users });
  });

  // Auth: Check/Get NIM Info
  app.get('/api/users/:nim', (req, res) => {
    const { nim } = req.params;
    const db = getDatabase();
    const user = db.users.find(u => String(u.nim) === String(nim));
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
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

  // Get active competitions
  app.get('/api/lombas', (req, res) => {
    try {
      const db = getDatabase();
      res.json(db.lombas);
    } catch (e) {
      res.status(500).json({ message: 'Gagal mengambil data lomba' });
    }
  });

  // Create or Update Competition (Admin)
  app.post('/api/lombas', (req, res) => {
    try {
      const db = getDatabase();
      const newLomba: Lomba = req.body;
      
      if (!newLomba.title || !newLomba.deadline) {
        return res.status(400).json({ message: 'Judul dan batas pendaftaran wajib diisi.' });
      }

      // Convert image URL if it is Google Drive link
      if (newLomba.image) {
        newLomba.image = convertGoogleDriveUrl(newLomba.image);
      }

      const existingIndex = db.lombas.findIndex(l => l.id === newLomba.id);
      if (existingIndex > -1) {
        db.lombas[existingIndex] = { ...db.lombas[existingIndex], ...newLomba };
      } else {
        newLomba.id = newLomba.id || 'LOMB_' + Date.now();
        db.lombas.push(newLomba);
      }
      
      saveDatabase(db);
      res.json({ success: true, lombas: db.lombas });
    } catch (e) {
      res.status(500).json({ message: 'Gagal menyimpan data lomba.' });
    }
  });

  // Delete Competition (Admin)
  app.delete('/api/lombas/:id', (req, res) => {
    try {
      const db = getDatabase();
      db.lombas = db.lombas.filter(l => l.id !== req.params.id);
      saveDatabase(db);
      res.json({ success: true, lombas: db.lombas });
    } catch (e) {
      res.status(500).json({ message: 'Gagal menghapus data lomba' });
    }
  });

  // Get achievements
  app.get('/api/prestasis', (req, res) => {
    const db = getDatabase();
    res.json(db.prestasis);
  });

  // Create/Update Achievement
  app.post('/api/prestasis', (req, res) => {
    const db = getDatabase();
    const prest: Prestasi = req.body;
    if (!prest.name || !prest.title) {
      return res.status(400).json({ message: 'Nama dan judul karya wajib diisi' });
    }
    const idx = db.prestasis.findIndex(p => p.id === prest.id);
    if (idx > -1) {
      db.prestasis[idx] = prest;
    } else {
      prest.id = prest.id || 'PRES_' + Date.now();
      db.prestasis.push(prest);
    }
    saveDatabase(db);
    res.json({ success: true, prestasis: db.prestasis });
  });

  // Delete Achievement
  app.delete('/api/prestasis/:id', (req, res) => {
    const db = getDatabase();
    db.prestasis = db.prestasis.filter(p => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, prestasis: db.prestasis });
  });

  // Get scholarships
  app.get('/api/beasiswas', (req, res) => {
    const db = getDatabase();
    res.json(db.beasiswas);
  });

  // Create/Update Scholarship
  app.post('/api/beasiswas', (req, res) => {
    const db = getDatabase();
    const beasiswa: Beasiswa = req.body;
    if (!beasiswa.title || !beasiswa.provider) {
      return res.status(400).json({ message: 'Judul dan penyelenggara wajib diisi' });
    }
    if (beasiswa.image) {
      beasiswa.image = convertGoogleDriveUrl(beasiswa.image);
    }
    const idx = db.beasiswas.findIndex(b => b.id === beasiswa.id);
    if (idx > -1) {
      db.beasiswas[idx] = beasiswa;
    } else {
      beasiswa.id = beasiswa.id || 'BEAS_' + Date.now();
      db.beasiswas.push(beasiswa);
    }
    saveDatabase(db);
    res.json({ success: true, beasiswas: db.beasiswas });
  });

  // Delete Scholarship
  app.delete('/api/beasiswas/:id', (req, res) => {
    const db = getDatabase();
    db.beasiswas = db.beasiswas.filter(b => b.id !== req.params.id);
    db.beasiswa_timelines = (db.beasiswa_timelines || []).filter(t => t.beasiswaId !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, beasiswas: db.beasiswas });
  });

  // Get scholarship timeline rows
  app.get('/api/beasiswa-timelines', (req, res) => {
    const db = getDatabase();
    const rows = (db.beasiswa_timelines || []).sort((a, b) => {
      if (a.beasiswaId !== b.beasiswaId) return a.beasiswaId.localeCompare(b.beasiswaId);
      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    });
    res.json(rows);
  });

  // Create/Update scholarship timeline row
  app.post('/api/beasiswa-timelines', (req, res) => {
    const db = getDatabase();
    const timeline: BeasiswaTimeline = {
      id: String(req.body.id || '').trim(),
      beasiswaId: String(req.body.beasiswaId || '').trim(),
      phase: String(req.body.phase || '').trim(),
      date: String(req.body.date || '').trim(),
      description: String(req.body.description || '').trim(),
      sortOrder: Number(req.body.sortOrder || 1)
    };

    if (!timeline.beasiswaId || !timeline.phase || !timeline.date) {
      return res.status(400).json({ message: 'Beasiswa, tahap, dan tanggal wajib diisi.' });
    }

    db.beasiswa_timelines = db.beasiswa_timelines || [];
    const idx = db.beasiswa_timelines.findIndex(t => t.id === timeline.id);
    if (idx > -1) {
      db.beasiswa_timelines[idx] = timeline;
    } else {
      timeline.id = timeline.id || 'BT_' + Date.now();
      db.beasiswa_timelines.push(timeline);
    }

    saveDatabase(db);
    res.json({ success: true, beasiswa_timelines: db.beasiswa_timelines });
  });

  // Delete scholarship timeline row
  app.delete('/api/beasiswa-timelines/:id', (req, res) => {
    const db = getDatabase();
    db.beasiswa_timelines = (db.beasiswa_timelines || []).filter(t => t.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, beasiswa_timelines: db.beasiswa_timelines });
  });

  // Get Webinars
  app.get('/api/webinars', (req, res) => {
    const db = getDatabase();
    res.json(db.webinars);
  });

  // Create/Update Webinar
  app.post('/api/webinars', (req, res) => {
    const db = getDatabase();
    const webinar: Webinar = req.body;
    if (!webinar.title || !webinar.speakerName) {
      return res.status(400).json({ message: 'Judul dan Pembicara wajib diisi' });
    }
    if (webinar.image) {
      webinar.image = convertGoogleDriveUrl(webinar.image);
    }
    const idx = db.webinars.findIndex(w => w.id === webinar.id);
    if (idx > -1) {
      db.webinars[idx] = webinar;
    } else {
      webinar.id = webinar.id || 'WEB_' + Date.now();
      db.webinars.push(webinar);
    }
    saveDatabase(db);
    res.json({ success: true, webinars: db.webinars });
  });

  // Delete Webinar
  app.delete('/api/webinars/:id', (req, res) => {
    const db = getDatabase();
    db.webinars = db.webinars.filter(w => w.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, webinars: db.webinars });
  });

  // Get Certifications
  app.get('/api/certifications', (req, res) => {
    const db = getDatabase();
    res.json(db.certifications);
  });

  // Create/Update Certification
  app.post('/api/certifications', (req, res) => {
    const db = getDatabase();
    const cert: Certification = req.body;
    if (!cert.title || !cert.provider) {
      return res.status(400).json({ message: 'Judul dan provider wajib diisi' });
    }
    if (cert.image) {
      cert.image = convertGoogleDriveUrl(cert.image);
    }
    const idx = db.certifications.findIndex(c => c.id === cert.id);
    if (idx > -1) {
      db.certifications[idx] = cert;
    } else {
      cert.id = cert.id || 'CERT_' + Date.now();
      db.certifications.push(cert);
    }
    saveDatabase(db);
    res.json({ success: true, certifications: db.certifications });
  });

  // Delete Certification
  app.delete('/api/certifications/:id', (req, res) => {
    const db = getDatabase();
    db.certifications = db.certifications.filter(c => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, certifications: db.certifications });
  });

  // Get Admin Sync Settings
  app.get('/api/settings', (req, res) => {
    const db = getDatabase();
    res.json(db.settings);
  });

  // Update Settings
  app.post('/api/settings', (req, res) => {
    const db = getDatabase();
    db.settings = { ...db.settings, ...req.body };
    saveDatabase(db);
    res.json(db.settings);
  });

  // Manual Trigger Synchronize with Apps Script Web App
  app.post('/api/settings/sync', async (req, res) => {
    const db = getDatabase();
    const scriptUrl = db.settings.spreadsheetUrl;
    
    if (!scriptUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google Apps Script Web App URL belum didaftarkan di Pengaturan Admin.' 
      });
    }

    try {
      db.settings.status = 'syncing';
      saveDatabase(db);

      // We make a GET request to the user's Google Apps Script web app
      // Specifying action=getAll
      const syncUrl = `${scriptUrl.trim()}?action=getAll`;
      console.log(`Sending sync GET request to Apps Script URL: ${syncUrl}`);
      
      const response = await fetch(syncUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const rawResult = await response.text();
      let payload: any;
      
      try {
        payload = JSON.parse(rawResult);
      } catch (parserErr) {
        throw new Error('Respons dari Google Apps Script bukan format JSON yang valid. Pastikan Apps Script telah di-deploy ulang sebagai Web App (Anyone/Anonim).');
      }

      // Validate spreadsheet fields
      if (payload && (payload.lombas || payload.beasiswas || payload.beasiswa_timelines || payload.webinars || payload.prestasis || payload.users || payload.certifications)) {
        // Successful spreadsheet sync! Let's update each non-empty synchronized category
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
          db.beasiswa_timelines = payload.beasiswa_timelines.map((item: any) => ({
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

        db.settings.status = 'success';
        db.settings.lastSyncTime = new Date().toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          dateStyle: 'medium',
          timeStyle: 'medium'
        });
        db.settings.errorMessage = undefined;
        saveDatabase(db);

        // Also push back local data to ensure bidirectional sync
        try {
          await fetch(scriptUrl.trim(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'syncAll', data: db })
          });
        } catch (pushErr) {
          console.warn('Bidirectional synchronization push back warning:', pushErr);
        }

        return res.json({ 
          success: true, 
          message: 'Sinkronisasi real-time dengan Spreadsheet Google sukses!', 
          settings: db.settings 
        });
      } else {
        throw new Error('Struktur data JSON Spreadsheet tidak valid. Pastikan nama sheet sesuai dengan format panduan.');
      }

    } catch (e: any) {
      console.error('Error synchronizing spreadsheet:', e);
      db.settings.status = 'error';
      db.settings.errorMessage = e.message || 'Koneksi gagal atau runtime error dari Apps Script.';
      saveDatabase(db);
      res.status(500).json({ 
        success: false, 
        message: db.settings.errorMessage,
        settings: db.settings
      });
    }
  });

  // Automated background scheduler - loops as a periodic sync simulator
  setInterval(async () => {
    const db = getDatabase();
    if (db.settings.autoSyncEnabled && db.settings.spreadsheetUrl) {
      console.log('AutoSync trigger: checking external spreadsheet updates...');
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
              loadedDb.beasiswa_timelines = payload.beasiswa_timelines.map((item: any) => ({
                ...item,
                sortOrder: Number(item.sortOrder || 1)
              }));
            }
            if (payload.webinars && payload.webinars.length) loadedDb.webinars = payload.webinars;
            if (payload.certifications && payload.certifications.length) loadedDb.certifications = payload.certifications;
            
            loadedDb.settings.lastSyncTime = new Date().toLocaleString('id-ID', {
              timeZone: 'Asia/Jakarta',
              dateStyle: 'medium',
              timeStyle: 'medium'
            });
            loadedDb.settings.status = 'success';
            loadedDb.settings.errorMessage = undefined;
            saveDatabase(loadedDb);
            console.log('AutoSync periodic background check: completed successfully.');
          }
        }
      } catch (err) {
        console.warn('AutoSync periodic background sync failed silently:', err);
      }
    }
  }, 90000); // Check every 90 seconds if autosync enabled

  // Serve static assets or mount Vite under dev environment
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GateTI Backend Server] Running and ready on http://localhost:${PORT}`);
  });
}

startServer();
