/**
 * GateTI Client-Side API Layer
 * 
 * Communicates directly with Google Apps Script (hardcoded URL).
 * Replaces the Express server backend for Vercel deployment.
 * All data is fetched from Google Spreadsheet via Apps Script.
 */

import { User, Lomba, Prestasi, Beasiswa, BeasiswaTimeline, Webinar, Certification } from './types';

// ========== HARDCODED APPS SCRIPT URL ==========
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPmza3YGdtt8xXRN-1jufhS8K1ZxViCWjnYrY1BTPndrGgBQ5VeGgq65wHn36MevSNDQ/exec';

// ========== DATABASE SCHEMA ==========
export interface DatabaseSchema {
  users: User[];
  lombas: Lomba[];
  prestasis: Prestasi[];
  beasiswas: Beasiswa[];
  beasiswa_timelines: BeasiswaTimeline[];
  webinars: Webinar[];
  certifications: Certification[];
}

// ========== IN-MEMORY CACHE ==========
let _cache: DatabaseSchema | null = null;
let _lastFetchTime = 0;
const CACHE_TTL = 300_000; // 5 minutes — data is cached to avoid constant refetching

// ========== GOOGLE DRIVE URL CONVERTER ==========
export function convertGoogleDriveUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  const dRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const idRegex = /[?&]id=([a-zA-Z0-9_-]+)/;

  const dMatch = trimmed.match(dRegex);
  if (dMatch && dMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${dMatch[1]}`;
  }

  const idMatch = trimmed.match(idRegex);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return trimmed;
}

// ========== CORE DATA FETCHING ==========

/**
 * Fetch all data from Google Apps Script.
 * Returns cached data if still fresh (< CACHE_TTL).
 * @param forceRefresh - bypass cache and always fetch from server
 */
export async function fetchAllData(forceRefresh = false): Promise<DatabaseSchema> {
  const now = Date.now();

  // Return cached data if still valid
  if (!forceRefresh && _cache && (now - _lastFetchTime) < CACHE_TTL) {
    return _cache;
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getAll`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawText = await response.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error('Respons dari Google Apps Script bukan JSON valid. Pastikan sudah deploy ulang sebagai Web App.');
    }

    // Normalize and convert Google Drive URLs
    _cache = {
      users: (data.users || []).map((u: any) => ({
        ...u,
        nim: String(u.nim || ''),
        angkatan: String(u.angkatan || ''),
        passwordHash: String(u.passwordHash || ''),
      })),
      lombas: (data.lombas || []).map((l: any) => ({
        ...l,
        image: convertGoogleDriveUrl(l.image),
      })),
      prestasis: data.prestasis || [],
      beasiswas: (data.beasiswas || []).map((b: any) => ({
        ...b,
        image: convertGoogleDriveUrl(b.image),
      })),
      beasiswa_timelines: (data.beasiswa_timelines || []).map((t: any) => ({
        ...t,
        sortOrder: Number(t.sortOrder || 1),
      })),
      webinars: (data.webinars || []).map((w: any) => ({
        ...w,
        image: convertGoogleDriveUrl(w.image),
        benefits: Array.isArray(w.benefits)
          ? w.benefits
          : typeof w.benefits === 'string'
            ? w.benefits.split(',').map((s: string) => s.trim())
            : [],
      })),
      certifications: (data.certifications || []).map((c: any) => ({
        ...c,
        image: convertGoogleDriveUrl(c.image),
      })),
    };

    _lastFetchTime = now;
    return _cache;
  } catch (error: any) {
    console.error('Error fetching data from Apps Script:', error);

    // Return stale cache if available
    if (_cache) {
      console.warn('Returning stale cached data');
      return _cache;
    }

    throw new Error(error.message || 'Gagal mengambil data. Periksa koneksi internet Anda.');
  }
}

/**
 * Invalidate the cache so next fetchAllData call will refetch
 */
export function invalidateCache(): void {
  _lastFetchTime = 0;
}

// ========== AUTHENTICATION ==========

/**
 * Login user by validating credentials against data from Apps Script.
 * Returns the user object if credentials match.
 */
export async function loginUser(nim: string, password: string): Promise<User> {
  // Use cached data if available, only fetch if no cache exists yet
  const data = await fetchAllData();

  const user = data.users.find(u => String(u.nim) === String(nim));
  if (!user) {
    throw new Error('NIM tidak terdaftar.');
  }

  if (String(user.passwordHash) !== String(password)) {
    throw new Error('Password salah.');
  }

  return {
    nim: String(user.nim),
    name: user.name,
    jurusan: user.jurusan,
    angkatan: String(user.angkatan),
    role: user.role,
    passwordHash: String(user.passwordHash),
    photoUrl: user.photoUrl || '',
  };
}

// ========== SYNC TO SPREADSHEET ==========

/**
 * Push all local data back to Google Spreadsheet via Apps Script POST.
 * Uses no-cors mode to avoid preflight CORS issues with Apps Script.
 */
async function syncToSpreadsheet(data: DatabaseSchema): Promise<void> {
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'syncAll', data }),
      redirect: 'follow',
    });
  } catch (err) {
    console.warn('Sync to spreadsheet warning (data was still saved locally):', err);
  }
}

// ========== CRUD OPERATIONS ==========

/**
 * Generic add or update for collections that use 'id' field.
 */
export async function addOrUpdateItem(
  collection: keyof DatabaseSchema,
  item: any,
  idPrefix: string
): Promise<DatabaseSchema> {
  const data = await fetchAllData();
  const list = data[collection] as any[];

  if (item.id) {
    const idx = list.findIndex((x: any) => x.id === item.id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.push(item);
    }
  } else {
    item.id = `${idPrefix}_${Date.now()}`;
    list.push(item);
  }

  // Convert Google Drive URLs for image fields
  if (item.image) {
    item.image = convertGoogleDriveUrl(item.image);
  }

  _cache = data;
  _lastFetchTime = Date.now();
  await syncToSpreadsheet(data);
  return { ...data };
}

/**
 * Generic delete for collections that use 'id' field.
 */
export async function deleteItem(
  collection: keyof DatabaseSchema,
  id: string
): Promise<DatabaseSchema> {
  const data = await fetchAllData();
  (data as any)[collection] = (data[collection] as any[]).filter((x: any) => x.id !== id);

  // Also delete related beasiswa_timelines when deleting a beasiswa
  if (collection === 'beasiswas') {
    data.beasiswa_timelines = data.beasiswa_timelines.filter(t => t.beasiswaId !== id);
  }

  _cache = data;
  _lastFetchTime = Date.now();
  await syncToSpreadsheet(data);
  return { ...data };
}

// ========== USER-SPECIFIC CRUD (uses 'nim' instead of 'id') ==========

export async function addOrUpdateUser(user: User, isEdit = false): Promise<DatabaseSchema> {
  const data = await fetchAllData();
  const idx = data.users.findIndex(u => String(u.nim).trim().toLowerCase() === String(user.nim).trim().toLowerCase());

  if (!isEdit && idx > -1) {
    throw new Error('NIM / Username sudah terdaftar.');
  }

  const normalizedUser: User = {
    ...user,
    nim: String(user.nim).trim(),
    name: String(user.name).trim(),
    jurusan: String(user.jurusan).trim(),
    angkatan: String(user.angkatan).trim(),
    role: user.role === 'admin' ? 'admin' : 'user',
    passwordHash: String(user.passwordHash).trim(),
    photoUrl: String(user.photoUrl || '').trim(),
  };

  if (idx > -1) {
    data.users[idx] = { ...data.users[idx], ...normalizedUser };
  } else {
    data.users.push(normalizedUser);
  }

  _cache = data;
  _lastFetchTime = Date.now();
  await syncToSpreadsheet(data);
  return { ...data };
}

export async function deleteUser(nim: string): Promise<DatabaseSchema> {
  const data = await fetchAllData();
  if (data.users.length <= 1) {
    throw new Error('Minimal harus ada satu user tersisa.');
  }
  data.users = data.users.filter(u => String(u.nim) !== String(nim));

  _cache = data;
  _lastFetchTime = Date.now();
  await syncToSpreadsheet(data);
  return { ...data };
}

// ========== BEASISWA TIMELINE CRUD ==========

export async function addOrUpdateTimeline(timeline: BeasiswaTimeline): Promise<DatabaseSchema> {
  const data = await fetchAllData();

  const normalized: BeasiswaTimeline = {
    id: String(timeline.id || '').trim(),
    beasiswaId: String(timeline.beasiswaId || '').trim(),
    phase: String(timeline.phase || '').trim(),
    date: String(timeline.date || '').trim(),
    description: String(timeline.description || '').trim(),
    sortOrder: Number(timeline.sortOrder || 1),
  };

  if (!normalized.beasiswaId || !normalized.phase || !normalized.date) {
    throw new Error('Beasiswa, tahap, dan tanggal wajib diisi.');
  }

  if (normalized.id) {
    const idx = data.beasiswa_timelines.findIndex(t => t.id === normalized.id);
    if (idx > -1) {
      data.beasiswa_timelines[idx] = normalized;
    } else {
      data.beasiswa_timelines.push(normalized);
    }
  } else {
    normalized.id = `BT_${Date.now()}`;
    data.beasiswa_timelines.push(normalized);
  }

  _cache = data;
  _lastFetchTime = Date.now();
  await syncToSpreadsheet(data);
  return { ...data };
}

export async function deleteTimeline(id: string): Promise<DatabaseSchema> {
  const data = await fetchAllData();
  data.beasiswa_timelines = data.beasiswa_timelines.filter(t => t.id !== id);

  _cache = data;
  _lastFetchTime = Date.now();
  await syncToSpreadsheet(data);
  return { ...data };
}

// ========== QR CODE HELPER ==========

/**
 * Generate a QR code image URL for a given text/URL.
 * Uses the free goqr.me API.
 */
export function generateQRCodeUrl(data: string, size = 200): string {
  if (!data) return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=0f172a&margin=8`;
}
