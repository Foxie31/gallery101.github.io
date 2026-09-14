import { PhotoItem, Collection, StorageStats } from '../types';

const DB_NAME = 'atelier_photo_gallery_db';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';
const COLLECTION_STORE = 'collections';

// Memory/localStorage fallback in case IndexedDB is restricted
const LOCAL_STORAGE_PHOTO_KEY = 'atelier_photos_backup';
const LOCAL_STORAGE_COLLECTION_KEY = 'atelier_collections_backup';

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        const photoStore = db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
        photoStore.createIndex('collectionId', 'collectionId', { unique: false });
        photoStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        photoStore.createIndex('dominantFamily', 'dominantFamily', { unique: false });
      }
      if (!db.objectStoreNames.contains(COLLECTION_STORE)) {
        db.createObjectStore(COLLECTION_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.warn('IndexedDB failed to open, fallback to localStorage', event);
      reject(new Error('Failed to open IndexedDB'));
    };
  });
}

export async function getAllPhotos(): Promise<PhotoItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readonly');
      const store = tx.objectStore(PHOTO_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = (request.result || []) as PhotoItem[];
        // Sort newest first
        results.sort((a, b) => b.dateAdded - a.dateAdded);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PHOTO_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PhotoItem[];
        return parsed.sort((a, b) => b.dateAdded - a.dateAdded);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }
}

export async function savePhoto(photo: PhotoItem): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      const request = store.put(photo);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage
    try {
      const existing = await getAllPhotos();
      const idx = existing.findIndex((p) => p.id === photo.id);
      if (idx >= 0) {
        existing[idx] = photo;
      } else {
        existing.unshift(photo);
      }
      localStorage.setItem(LOCAL_STORAGE_PHOTO_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }
}

export async function bulkSavePhotos(photos: PhotoItem[]): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      for (const photo of photos) {
        store.put(photo);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    try {
      const existing = await getAllPhotos();
      const map = new Map(existing.map((p) => [p.id, p]));
      photos.forEach((p) => map.set(p.id, p));
      localStorage.setItem(LOCAL_STORAGE_PHOTO_KEY, JSON.stringify(Array.from(map.values())));
    } catch (e) {
      console.error(e);
    }
  }
}

export async function deletePhoto(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    try {
      const existing = await getAllPhotos();
      const filtered = existing.filter((p) => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_PHOTO_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
  }
}

export async function getAllCollections(): Promise<Collection[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(COLLECTION_STORE, 'readonly');
      const store = tx.objectStore(COLLECTION_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const results = (request.result || []) as Collection[];
        results.sort((a, b) => a.createdAt - b.createdAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_COLLECTION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
  }
}

export async function saveCollection(collection: Collection): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(COLLECTION_STORE, 'readwrite');
      const store = tx.objectStore(COLLECTION_STORE);
      const request = store.put(collection);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    try {
      const existing = await getAllCollections();
      const idx = existing.findIndex((c) => c.id === collection.id);
      if (idx >= 0) {
        existing[idx] = collection;
      } else {
        existing.push(collection);
      }
      localStorage.setItem(LOCAL_STORAGE_COLLECTION_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error(e);
    }
  }
}

export async function deleteCollection(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(COLLECTION_STORE, 'readwrite');
      const store = tx.objectStore(COLLECTION_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    try {
      const existing = await getAllCollections();
      const filtered = existing.filter((c) => c.id !== id);
      localStorage.setItem(LOCAL_STORAGE_COLLECTION_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
  }
}

export async function getStorageStats(): Promise<StorageStats> {
  const photos = await getAllPhotos();
  const collections = await getAllCollections();

  let bytes = 0;
  for (const p of photos) {
    if (p.fileSize) {
      bytes += p.fileSize;
    } else {
      bytes += (p.src ? p.src.length : 0) + 500;
    }
  }

  const formatSize = (b: number): string => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  };

  return {
    usedBytes: bytes,
    formattedSize: formatSize(bytes),
    photoCount: photos.length,
    collectionCount: collections.length,
  };
}

export async function exportArchiveJSON(): Promise<string> {
  const photos = await getAllPhotos();
  const collections = await getAllCollections();
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: 'Local Photo Gallery & Archive',
    collections,
    photos,
  };
  return JSON.stringify(payload, null, 2);
}

export async function importArchiveJSON(jsonString: string): Promise<{ photosAdded: number; collectionsAdded: number }> {
  const data = JSON.parse(jsonString);
  if (!data || !Array.isArray(data.photos)) {
    throw new Error('Invalid archive format. Missing photos array.');
  }

  const collections = Array.isArray(data.collections) ? data.collections : [];
  const photos = data.photos;

  for (const col of collections) {
    await saveCollection(col);
  }
  await bulkSavePhotos(photos);

  return {
    photosAdded: photos.length,
    collectionsAdded: collections.length,
  };
}

export async function clearAllData(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([PHOTO_STORE, COLLECTION_STORE], 'readwrite');
      tx.objectStore(PHOTO_STORE).clear();
      tx.objectStore(COLLECTION_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error(e);
  }
  localStorage.removeItem(LOCAL_STORAGE_PHOTO_KEY);
  localStorage.removeItem(LOCAL_STORAGE_COLLECTION_KEY);
}
