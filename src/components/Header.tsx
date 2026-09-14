import React from 'react';
import { ViewMode, StorageStats } from '../types';
import { 
  LayoutGrid, 
  Film, 
  Palette, 
  Play, 
  Upload, 
  Plus, 
  Search, 
  HardDrive, 
  FolderPlus,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  storageStats: StorageStats;
  onOpenUpload: () => void;
  onOpenNewCollection: () => void;
  onOpenStorageInfo: () => void;
  onStartSlideshow: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  storageStats,
  onOpenUpload,
  onOpenNewCollection,
  onOpenStorageInfo,
  onStartSlideshow,
}) => {
  return (
    <header id="gallery-header" className="sticky top-0 z-30 bg-[#121110]/95 backdrop-blur-md border-b border-[#282522] px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Curator Title */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#B8976C]/60 flex items-center justify-center bg-[#1A1816] text-[#B8976C]">
              <span className="font-serif italic text-lg leading-none font-bold">A</span>
            </div>
            <div>
              <h1 className="font-serif text-xl tracking-wide font-semibold text-[#EDE8E1] flex items-center gap-2">
                Atelier Archive
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B8976C] bg-[#B8976C]/10 px-1.5 py-0.5 rounded border border-[#B8976C]/20">
                  Local Vault
                </span>
              </h1>
              <p className="text-xs text-[#8F8982] hidden sm:block">
                Personal Photographic Collection & Curatorial Storage
              </p>
            </div>
          </div>

          {/* Quick Storage Badge on Mobile */}
          <button
            id="mobile-storage-button"
            onClick={onOpenStorageInfo}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#A89F91] bg-[#1C1A18] hover:bg-[#25221F] border border-[#322E2A] rounded-md transition-colors"
            title="Local Storage Status"
          >
            <HardDrive className="w-3.5 h-3.5 text-[#B8976C]" />
            <span className="font-mono text-[11px]">{storageStats.formattedSize}</span>
          </button>
        </div>

        {/* Center: Search & Curatorial View Modes */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl justify-center">
          {/* Search Box */}
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8982]" />
            <input
              id="gallery-search-input"
              type="text"
              placeholder="Search title, tag, camera, place..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#181614] border border-[#2B2824] focus:border-[#B8976C] text-[#EDE8E1] placeholder-[#6E6862] text-xs rounded-full pl-8 pr-3 py-1.5 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8F8982] hover:text-[#EDE8E1] px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Segmented Controls */}
          <div className="inline-flex bg-[#181614] p-0.5 rounded-lg border border-[#2B2824] shadow-inner">
            <button
              id="view-mode-exhibition"
              onClick={() => onViewModeChange('exhibition')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
                viewMode === 'exhibition'
                  ? 'bg-[#2A2723] text-[#EDE8E1] shadow-sm'
                  : 'text-[#8F8982] hover:text-[#EDE8E1]'
              }`}
              title="Exhibition Salon Wall"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salon</span>
            </button>

            <button
              id="view-mode-contact"
              onClick={() => onViewModeChange('contact-sheet')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
                viewMode === 'contact-sheet'
                  ? 'bg-[#2A2723] text-[#EDE8E1] shadow-sm'
                  : 'text-[#8F8982] hover:text-[#EDE8E1]'
              }`}
              title="35mm Film Contact Sheet with Curator Loupe"
            >
              <Film className="w-3.5 h-3.5 text-[#B8976C]" />
              <span className="hidden sm:inline">Contact Sheet</span>
            </button>

            <button
              id="view-mode-chromatic"
              onClick={() => onViewModeChange('chromatic')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
                viewMode === 'chromatic'
                  ? 'bg-[#2A2723] text-[#EDE8E1] shadow-sm'
                  : 'text-[#8F8982] hover:text-[#EDE8E1]'
              }`}
              title="Chromatic Spectrum by Color Palette"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chromatic</span>
            </button>
          </div>
        </div>

        {/* Right Side: Storage stats, Slideshow, and Add Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Storage Footprint Badge (Desktop) */}
          <button
            id="desktop-storage-button"
            onClick={onOpenStorageInfo}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs text-[#A89F91] bg-[#181614] hover:bg-[#201D1A] border border-[#2B2824] rounded-lg transition-colors cursor-pointer"
            title="Local Storage Capacity & Backup"
          >
            <HardDrive className="w-3.5 h-3.5 text-[#B8976C]" />
            <span className="font-mono text-[11px]">{storageStats.formattedSize}</span>
            <span className="text-[#65605A] text-[10px]">({storageStats.photoCount} works)</span>
          </button>

          {/* Slideshow button */}
          <button
            id="gallery-slideshow-button"
            onClick={onStartSlideshow}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#EDE8E1] bg-[#1C1A18] hover:bg-[#262320] border border-[#322E2A] rounded-lg transition-colors"
            title="Start Ambient Lightbox Slideshow"
          >
            <Play className="w-3.5 h-3.5 text-[#B8976C] fill-[#B8976C]" />
            <span className="hidden sm:inline">Lightbox</span>
          </button>

          {/* New Collection */}
          <button
            id="new-collection-button"
            onClick={onOpenNewCollection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C8BFB4] bg-[#1E1B18] hover:bg-[#282420] border border-[#38332D] rounded-lg transition-colors"
            title="Create Archival Collection"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#B8976C]" />
            <span className="hidden sm:inline">Album</span>
          </button>

          {/* Upload Photos Primary CTA */}
          <button
            id="upload-photo-button"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#121110] bg-[#B8976C] hover:bg-[#C9A97E] active:scale-95 rounded-lg shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Store Photos</span>
          </button>
        </div>

      </div>
    </header>
  );
};
