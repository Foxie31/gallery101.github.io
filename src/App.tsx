/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PhotoItem, 
  Collection, 
  ViewMode, 
  ColorSwatch, 
  StorageStats, 
  FrameStyle 
} from './types';
import { 
  getAllPhotos, 
  getAllCollections, 
  savePhoto, 
  bulkSavePhotos, 
  deletePhoto, 
  saveCollection, 
  deleteCollection, 
  getStorageStats,
  exportArchiveJSON,
  importArchiveJSON,
  clearAllData
} from './lib/storage';
import { INITIAL_PHOTOS, INITIAL_COLLECTIONS } from './lib/samplePhotos';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ExhibitionWall } from './components/ExhibitionWall';
import { ContactSheetView } from './components/ContactSheetView';
import { ChromaticView } from './components/ChromaticView';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { FrameStudioModal } from './components/FrameStudioModal';
import { UploadModal } from './components/UploadModal';
import { CollectionModal } from './components/CollectionModal';
import { StorageInfoModal } from './components/StorageInfoModal';
import { LightboxModal } from './components/LightboxModal';

export default function App() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('exhibition');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedColorFamily, setSelectedColorFamily] = useState<ColorSwatch['family'] | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  const [storageStats, setStorageStats] = useState<StorageStats>({
    usedBytes: 0,
    formattedSize: '0 KB',
    photoCount: 0,
    collectionCount: 0,
  });

  // Modals state
  const [inspectPhoto, setInspectPhoto] = useState<PhotoItem | null>(null);
  const [framingPhoto, setFramingPhoto] = useState<PhotoItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState<boolean>(false);
  const [isStorageInfoOpen, setIsStorageInfoOpen] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize data from local storage
  useEffect(() => {
    async function initData() {
      try {
        let loadedPhotos = await getAllPhotos();
        let loadedCollections = await getAllCollections();

        // Seed with curated photography on first launch if empty
        if (loadedPhotos.length === 0 && loadedCollections.length === 0) {
          await bulkSavePhotos(INITIAL_PHOTOS);
          for (const col of INITIAL_COLLECTIONS) {
            await saveCollection(col);
          }
          loadedPhotos = INITIAL_PHOTOS;
          loadedCollections = INITIAL_COLLECTIONS;
        }

        setPhotos(loadedPhotos);
        setCollections(loadedCollections);

        const stats = await getStorageStats();
        setStorageStats(stats);
      } catch (err) {
        console.error('Failed to initialize archive storage:', err);
        setPhotos(INITIAL_PHOTOS);
        setCollections(INITIAL_COLLECTIONS);
      }
    }

    initData();
  }, []);

  // Update storage stats whenever photos or collections change
  const refreshStorageStats = async () => {
    const stats = await getStorageStats();
    setStorageStats(stats);
  };

  // Filtered photos based on all active criteria
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      // Collection filter
      if (selectedCollectionId && photo.collectionId !== selectedCollectionId) {
        return false;
      }

      // Favorites filter
      if (onlyFavorites && !photo.isFavorite) {
        return false;
      }

      // Color Family filter
      if (selectedColorFamily && photo.dominantFamily !== selectedColorFamily) {
        return false;
      }

      // Tag filter
      if (selectedTag && !photo.tags.includes(selectedTag)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = photo.title.toLowerCase().includes(q);
        const matchesNotes = photo.notes?.toLowerCase().includes(q) || false;
        const matchesTag = photo.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCamera = photo.exif.camera?.toLowerCase().includes(q) || false;
        const matchesLocation = photo.exif.location?.toLowerCase().includes(q) || false;
        const matchesFilm = photo.exif.filmStock?.toLowerCase().includes(q) || false;

        if (!matchesTitle && !matchesNotes && !matchesTag && !matchesCamera && !matchesLocation && !matchesFilm) {
          return false;
        }
      }

      return true;
    });
  }, [photos, selectedCollectionId, onlyFavorites, selectedColorFamily, selectedTag, searchQuery]);

  // Derived Tag counts
  const availableTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of photos) {
      for (const t of p.tags) {
        map.set(t, (map.get(t) || 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [photos]);

  // Derived Collection counts
  const collectionPhotoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of photos) {
      if (p.collectionId) {
        counts[p.collectionId] = (counts[p.collectionId] || 0) + 1;
      }
    }
    return counts;
  }, [photos]);

  const favoritesCount = useMemo(() => {
    return photos.filter((p) => p.isFavorite).length;
  }, [photos]);

  // Photo actions
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = photos.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    setPhotos(updated);
    const target = updated.find((p) => p.id === id);
    if (target) {
      await savePhoto(target);
    }
  };

  const handleUpdatePhoto = async (updated: PhotoItem) => {
    const newPhotos = photos.map((p) => (p.id === updated.id ? updated : p));
    setPhotos(newPhotos);
    setInspectPhoto(updated);
    await savePhoto(updated);
    await refreshStorageStats();
  };

  const handleDeletePhoto = async (id: string) => {
    const newPhotos = photos.filter((p) => p.id !== id);
    setPhotos(newPhotos);
    await deletePhoto(id);
    await refreshStorageStats();
  };

  const handlePhotosUploaded = async (newPhotos: PhotoItem[]) => {
    await bulkSavePhotos(newPhotos);
    const all = [...newPhotos, ...photos];
    setPhotos(all);
    await refreshStorageStats();
  };

  const handleSaveFrameStyle = async (newStyle: FrameStyle) => {
    if (!framingPhoto) return;
    const updated = { ...framingPhoto, frameStyle: newStyle };
    await handleUpdatePhoto(updated);
  };

  // Collection actions
  const handleCreateCollection = async (col: Collection) => {
    await saveCollection(col);
    setCollections((prev) => [...prev, col]);
    setSelectedCollectionId(col.id);
    await refreshStorageStats();
  };

  const handleDeleteCollection = async (id: string) => {
    await deleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (selectedCollectionId === id) setSelectedCollectionId(null);
    await refreshStorageStats();
  };

  // Vault backup / restore
  const handleExportArchive = async () => {
    try {
      const jsonStr = await exportArchiveJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `atelier-photo-vault-backup-${dateStr}.json`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export vault backup.');
    }
  };

  const handleImportFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await importArchiveJSON(text);
      const reloadedPhotos = await getAllPhotos();
      const reloadedCollections = await getAllCollections();
      setPhotos(reloadedPhotos);
      setCollections(reloadedCollections);
      await refreshStorageStats();
      alert(`Restored ${res.photosAdded} photographs and ${res.collectionsAdded} collections!`);
    } catch (err) {
      console.error(err);
      alert('Failed to restore archive file. Please ensure it is a valid JSON backup.');
    } finally {
      if (importFileInputRef.current) importFileInputRef.current.value = '';
    }
  };

  const handleResetSampleData = async () => {
    if (confirm('Reset gallery with curated sample photography works?')) {
      await clearAllData();
      await bulkSavePhotos(INITIAL_PHOTOS);
      for (const col of INITIAL_COLLECTIONS) {
        await saveCollection(col);
      }
      setPhotos(INITIAL_PHOTOS);
      setCollections(INITIAL_COLLECTIONS);
      setSelectedCollectionId(null);
      setSelectedColorFamily(null);
      setSelectedTag(null);
      setOnlyFavorites(false);
      await refreshStorageStats();
    }
  };

  const handleClearData = async () => {
    if (confirm('Clear all photographs and collections from local storage? This cannot be undone.')) {
      await clearAllData();
      setPhotos([]);
      setCollections([]);
      setSelectedCollectionId(null);
      setSelectedColorFamily(null);
      setSelectedTag(null);
      setOnlyFavorites(false);
      await refreshStorageStats();
    }
  };

  const handleClearAllFilters = () => {
    setSelectedCollectionId(null);
    setSelectedColorFamily(null);
    setSelectedTag(null);
    setOnlyFavorites(false);
    setSearchQuery('');
  };

  const isFilterActive = Boolean(
    selectedCollectionId || selectedColorFamily || selectedTag || onlyFavorites || searchQuery
  );

  const activeCollection = collections.find((c) => c.id === selectedCollectionId);

  return (
    <div id="atelier-gallery-app" className="min-h-screen bg-[#121110] text-[#EDE8E1] flex flex-col">
      {/* Hidden File Input for Vault Backup Restore */}
      <input
        ref={importFileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFileSelected}
      />

      {/* Top Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        storageStats={storageStats}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenNewCollection={() => setIsNewCollectionOpen(true)}
        onOpenStorageInfo={() => setIsStorageInfoOpen(true)}
        onStartSlideshow={() => {
          if (filteredPhotos.length > 0) {
            setLightboxIndex(0);
            setIsLightboxOpen(true);
          } else {
            alert('No photographs available to present in slideshow.');
          }
        }}
      />

      {/* Main Exhibition Hall */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Curation Sidebar */}
        <Sidebar
          collections={collections}
          activeCollectionId={selectedCollectionId}
          onSelectCollection={setSelectedCollectionId}
          onDeleteCollection={handleDeleteCollection}
          onOpenNewCollection={() => setIsNewCollectionOpen(true)}
          selectedColorFamily={selectedColorFamily}
          onSelectColorFamily={setSelectedColorFamily}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          onlyFavorites={onlyFavorites}
          onToggleFavorites={() => setOnlyFavorites(!onlyFavorites)}
          availableTags={availableTags}
          collectionPhotoCounts={collectionPhotoCounts}
          totalPhotosCount={photos.length}
          favoritesCount={favoritesCount}
          onExportArchive={handleExportArchive}
          onImportArchive={() => importFileInputRef.current?.click()}
          onResetSampleData={handleResetSampleData}
          onClearData={handleClearData}
          onClearAllFilters={handleClearAllFilters}
          isFilterActive={isFilterActive}
        />

        {/* Right Gallery Presentation Canvas */}
        <section id="gallery-presentation-canvas" className="flex-1 min-w-0 space-y-6">
          
          {/* Active Collection Curatorial Header Banner */}
          {activeCollection && (
            <div className="bg-[#181614] border border-[#2E2A26] p-6 rounded-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B8976C] bg-[#B8976C]/10 px-2 py-0.5 rounded border border-[#B8976C]/20">
                    Archival Exhibition
                  </span>
                  <h2 className="font-serif text-2xl font-semibold text-[#EDE8E1] mt-1.5">
                    {activeCollection.name}
                  </h2>
                  {activeCollection.description && (
                    <p className="text-xs text-[#A89F91] mt-1 max-w-xl">
                      {activeCollection.description}
                    </p>
                  )}
                  {activeCollection.curatorNote && (
                    <p className="text-[11px] font-serif italic text-[#78716A] mt-2">
                      “{activeCollection.curatorNote}”
                    </p>
                  )}
                </div>

                <div className="shrink-0 font-mono text-xs text-[#8F8982]">
                  {collectionPhotoCounts[activeCollection.id] || 0} Works
                </div>
              </div>
            </div>
          )}

          {/* Render Active Curatorial View */}
          {viewMode === 'exhibition' && (
            <ExhibitionWall
              photos={filteredPhotos}
              onSelectPhoto={(photo) => setInspectPhoto(photo)}
              onToggleFavorite={handleToggleFavorite}
              onOpenFrameStudio={(photo, e) => {
                e.stopPropagation();
                setFramingPhoto(photo);
              }}
            />
          )}

          {viewMode === 'contact-sheet' && (
            <ContactSheetView
              photos={filteredPhotos}
              onSelectPhoto={(photo) => setInspectPhoto(photo)}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {viewMode === 'chromatic' && (
            <ChromaticView
              photos={filteredPhotos}
              onSelectPhoto={(photo) => setInspectPhoto(photo)}
              onSelectColorFamily={(family) => setSelectedColorFamily(family)}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

        </section>
      </main>

      {/* Footer status bar */}
      <footer className="border-t border-[#23201D] py-4 px-6 text-center text-xs text-[#6B655F]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Atelier Archive • Offline-first private photo collection</span>
          <span className="font-mono text-[11px] text-[#8F8982]">
            IndexedDB Local Storage • {storageStats.formattedSize} Used • {photos.length} Works
          </span>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {inspectPhoto && (
        <PhotoDetailModal
          photo={inspectPhoto}
          collections={collections}
          onClose={() => setInspectPhoto(null)}
          onUpdatePhoto={handleUpdatePhoto}
          onDeletePhoto={handleDeletePhoto}
          onOpenFrameStudio={(photo) => {
            setInspectPhoto(null);
            setFramingPhoto(photo);
          }}
        />
      )}

      {framingPhoto && (
        <FrameStudioModal
          photo={framingPhoto}
          onClose={() => setFramingPhoto(null)}
          onSaveFrameStyle={handleSaveFrameStyle}
        />
      )}

      {isUploadOpen && (
        <UploadModal
          collections={collections}
          activeCollectionId={selectedCollectionId}
          onClose={() => setIsUploadOpen(false)}
          onPhotosUploaded={handlePhotosUploaded}
        />
      )}

      {isNewCollectionOpen && (
        <CollectionModal
          onClose={() => setIsNewCollectionOpen(false)}
          onCreateCollection={handleCreateCollection}
        />
      )}

      {isStorageInfoOpen && (
        <StorageInfoModal
          stats={storageStats}
          onClose={() => setIsStorageInfoOpen(false)}
          onExport={handleExportArchive}
          onImport={() => importFileInputRef.current?.click()}
          onClearAll={handleClearData}
        />
      )}

      {isLightboxOpen && (
        <LightboxModal
          photos={filteredPhotos.length > 0 ? filteredPhotos : photos}
          initialIndex={lightboxIndex}
          onClose={() => setIsLightboxOpen(false)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

    </div>
  );
}
