import React from 'react';
import { Collection, ColorSwatch, StorageStats } from '../types';
import { 
  Folder, 
  FolderPlus, 
  Star, 
  Sparkles, 
  Tag, 
  Download, 
  UploadCloud, 
  RotateCcw, 
  Trash2,
  Layers,
  ChevronRight,
  FilterX
} from 'lucide-react';

interface SidebarProps {
  collections: Collection[];
  activeCollectionId: string | null;
  onSelectCollection: (id: string | null) => void;
  onDeleteCollection: (id: string) => void;
  onOpenNewCollection: () => void;
  selectedColorFamily: ColorSwatch['family'] | null;
  onSelectColorFamily: (family: ColorSwatch['family'] | null) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  availableTags: { tag: string; count: number }[];
  collectionPhotoCounts: Record<string, number>;
  totalPhotosCount: number;
  favoritesCount: number;
  onExportArchive: () => void;
  onImportArchive: () => void;
  onResetSampleData: () => void;
  onClearData: () => void;
  onClearAllFilters: () => void;
  isFilterActive: boolean;
}

const COLOR_FAMILIES: { family: ColorSwatch['family']; label: string; colorClass: string; bgClass: string }[] = [
  { family: 'monochrome', label: 'Noir & Slate', colorClass: '#8F8982', bgClass: 'bg-[#66625D]' },
  { family: 'amber', label: 'Warm Amber', colorClass: '#C87D38', bgClass: 'bg-[#C87D38]' },
  { family: 'sage', label: 'Olive Sage', colorClass: '#607963', bgClass: 'bg-[#607963]' },
  { family: 'azure', label: 'Aegean Azure', colorClass: '#3A6890', bgClass: 'bg-[#3A6890]' },
  { family: 'crimson', label: 'Crimson Dusk', colorClass: '#A82D36', bgClass: 'bg-[#A82D36]' },
  { family: 'earth', label: 'Earth Ochre', colorClass: '#8E5A36', bgClass: 'bg-[#8E5A36]' },
  { family: 'warm', label: 'Golden Parchment', colorClass: '#CCA35E', bgClass: 'bg-[#CCA35E]' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collections,
  activeCollectionId,
  onSelectCollection,
  onDeleteCollection,
  onOpenNewCollection,
  selectedColorFamily,
  onSelectColorFamily,
  selectedTag,
  onSelectTag,
  onlyFavorites,
  onToggleFavorites,
  availableTags,
  collectionPhotoCounts,
  totalPhotosCount,
  favoritesCount,
  onExportArchive,
  onImportArchive,
  onResetSampleData,
  onClearData,
  onClearAllFilters,
  isFilterActive,
}) => {
  return (
    <aside id="gallery-sidebar" className="w-full lg:w-64 shrink-0 space-y-6 text-[#EDE8E1]">
      
      {/* Active Filter Clear Notice */}
      {isFilterActive && (
        <div className="bg-[#1C1917] border border-[#B8976C]/30 p-2.5 rounded-lg flex items-center justify-between">
          <span className="text-xs text-[#C8BFB4] flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8976C] animate-pulse" />
            Active Filter Applied
          </span>
          <button
            id="clear-filters-btn"
            onClick={onClearAllFilters}
            className="text-[11px] text-[#B8976C] hover:text-[#D4B387] flex items-center gap-1 font-mono transition-colors"
          >
            <FilterX className="w-3 h-3" />
            Reset
          </button>
        </div>
      )}

      {/* Primary Archives Navigation */}
      <div className="space-y-1">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#8F8982] px-3 pb-1">
          Vault Views
        </div>

        <button
          id="sidebar-all-photos"
          onClick={() => {
            onSelectCollection(null);
            if (onlyFavorites) onToggleFavorites();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
            activeCollectionId === null && !onlyFavorites
              ? 'bg-[#2A2723] text-[#EDE8E1] font-medium shadow-sm'
              : 'text-[#A89F91] hover:bg-[#1A1816] hover:text-[#EDE8E1]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-[#B8976C]" />
            <span>Complete Archive</span>
          </div>
          <span className="text-[11px] font-mono text-[#78716A]">{totalPhotosCount}</span>
        </button>

        <button
          id="sidebar-favorites"
          onClick={onToggleFavorites}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
            onlyFavorites
              ? 'bg-[#2A2723] text-[#EDE8E1] font-medium shadow-sm'
              : 'text-[#A89F91] hover:bg-[#1A1816] hover:text-[#EDE8E1]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className={`w-4 h-4 ${onlyFavorites ? 'text-amber-400 fill-amber-400' : 'text-amber-400/70'}`} />
            <span>Curator's Picks</span>
          </div>
          <span className="text-[11px] font-mono text-[#78716A]">{favoritesCount}</span>
        </button>
      </div>

      {/* Archival Collections / Albums */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-3">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#8F8982]">
            Collections
          </div>
          <button
            id="sidebar-add-collection-btn"
            onClick={onOpenNewCollection}
            className="text-[#8F8982] hover:text-[#B8976C] transition-colors p-0.5"
            title="Create New Collection"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          {collections.length === 0 ? (
            <div className="text-xs text-[#6B655F] px-3 py-2 italic">
              No collections created yet.
            </div>
          ) : (
            collections.map((col) => {
              const isSelected = activeCollectionId === col.id;
              const count = collectionPhotoCounts[col.id] || 0;
              return (
                <div
                  key={col.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    isSelected
                      ? 'bg-[#2A2723] text-[#EDE8E1] font-medium'
                      : 'text-[#A89F91] hover:bg-[#1A1816] hover:text-[#EDE8E1]'
                  }`}
                >
                  <button
                    onClick={() => onSelectCollection(isSelected ? null : col.id)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                  >
                    <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#B8976C]' : 'text-[#6E6862]'}`} />
                    <span className="truncate">{col.name}</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[11px] font-mono text-[#78716A]">{count}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove collection "${col.name}"? (Photos will remain in library)`)) {
                          onDeleteCollection(col.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[#78716A] hover:text-red-400 p-0.5 transition-opacity"
                      title="Delete collection"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chromatic Palette Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-3">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#8F8982]">
            Chromatic Spectrum
          </div>
          {selectedColorFamily && (
            <button
              onClick={() => onSelectColorFamily(null)}
              className="text-[10px] text-[#B8976C] hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 px-2">
          {COLOR_FAMILIES.map((cf) => {
            const isSelected = selectedColorFamily === cf.family;
            return (
              <button
                key={cf.family}
                onClick={() => onSelectColorFamily(isSelected ? null : cf.family)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] transition-all border ${
                  isSelected
                    ? 'border-[#B8976C] bg-[#2A2723] text-[#EDE8E1] font-medium shadow-sm'
                    : 'border-transparent hover:border-[#332F2A] hover:bg-[#181614] text-[#8F8982] hover:text-[#EDE8E1]'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cf.bgClass}`} />
                <span className="truncate">{cf.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#8F8982]">
              Tags & Genres
            </div>
            {selectedTag && (
              <button
                onClick={() => onSelectTag(null)}
                className="text-[10px] text-[#B8976C] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 px-2">
            {availableTags.slice(0, 10).map(({ tag, count }) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`text-[11px] px-2 py-1 rounded-md transition-colors flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-[#B8976C]/20 border-[#B8976C] text-[#EDE8E1] font-medium'
                      : 'bg-[#181614] border-[#2A2723] text-[#8F8982] hover:text-[#EDE8E1] hover:border-[#3E3A34]'
                  }`}
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  <span>{tag}</span>
                  <span className="font-mono text-[9px] text-[#635D56]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Archival Maintenance & Local Storage Tools */}
      <div className="pt-4 border-t border-[#25221F] space-y-2 px-2">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#6B655F] px-1">
          Archival Management
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            id="export-archive-btn"
            onClick={onExportArchive}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[#A89F91] hover:text-[#EDE8E1] bg-[#181614] hover:bg-[#221F1C] border border-[#2B2824] transition-colors"
            title="Download full JSON archive backup"
          >
            <Download className="w-3 h-3 text-[#B8976C]" />
            <span>Export Vault</span>
          </button>

          <button
            id="import-archive-btn"
            onClick={onImportArchive}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[#A89F91] hover:text-[#EDE8E1] bg-[#181614] hover:bg-[#221F1C] border border-[#2B2824] transition-colors"
            title="Restore from JSON archive backup"
          >
            <UploadCloud className="w-3 h-3 text-[#B8976C]" />
            <span>Restore</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            id="reset-sample-btn"
            onClick={onResetSampleData}
            className="text-[10px] text-[#8F8982] hover:text-[#B8976C] transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset Sample Art</span>
          </button>

          <button
            id="clear-all-data-btn"
            onClick={onClearData}
            className="text-[10px] text-[#8F8982] hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-2.5 h-2.5" />
            <span>Wipe Vault</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
