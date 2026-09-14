import React, { useState } from 'react';
import { PhotoItem, Collection, PhotoAdjustments } from '../types';
import { 
  X, 
  Star, 
  Trash2, 
  Sparkles, 
  Camera, 
  MapPin, 
  Sliders, 
  Tag, 
  Calendar, 
  Check,
  Folder,
  RotateCcw
} from 'lucide-react';

interface PhotoDetailModalProps {
  photo: PhotoItem;
  collections: Collection[];
  onClose: () => void;
  onUpdatePhoto: (updated: PhotoItem) => void;
  onDeletePhoto: (id: string) => void;
  onOpenFrameStudio: (photo: PhotoItem) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  collections,
  onClose,
  onUpdatePhoto,
  onDeletePhoto,
  onOpenFrameStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'adjustments' | 'exif'>('info');
  
  // Editable fields
  const [title, setTitle] = useState(photo.title);
  const [collectionId, setCollectionId] = useState(photo.collectionId || '');
  const [notes, setNotes] = useState(photo.notes || '');
  const [tagsInput, setTagsInput] = useState(photo.tags.join(', '));
  const [rating, setRating] = useState(photo.rating);
  const [isFavorite, setIsFavorite] = useState(photo.isFavorite);

  // EXIF state
  const [camera, setCamera] = useState(photo.exif.camera || '');
  const [lens, setLens] = useState(photo.exif.lens || '');
  const [aperture, setAperture] = useState(photo.exif.aperture || '');
  const [shutterSpeed, setShutterSpeed] = useState(photo.exif.shutterSpeed || '');
  const [iso, setIso] = useState(photo.exif.iso || '');
  const [location, setLocation] = useState(photo.exif.location || '');
  const [year, setYear] = useState(photo.exif.year || '');
  const [filmStock, setFilmStock] = useState(photo.exif.filmStock || '');

  // Adjustments
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(
    photo.adjustments || {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      warmth: 0,
      sepia: 0,
      grain: 0,
      vignette: 0,
    }
  );

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    const updatedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: PhotoItem = {
      ...photo,
      title,
      collectionId: collectionId || undefined,
      notes,
      tags: updatedTags,
      rating,
      isFavorite,
      adjustments,
      exif: {
        camera,
        lens,
        aperture,
        shutterSpeed,
        iso,
        location,
        year,
        filmStock,
      },
    };

    onUpdatePhoto(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const resetAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      warmth: 0,
      sepia: 0,
      grain: 0,
      vignette: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div 
        id="photo-detail-dialog"
        className="bg-[#161413] border border-[#2E2B27] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282522] bg-[#141211]">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-lg font-semibold text-[#EDE8E1] truncate max-w-md">
              {title || 'Photograph Inspector'}
            </h2>
            {photo.collectionId && (
              <span className="text-[11px] font-mono text-[#B8976C] bg-[#B8976C]/10 px-2 py-0.5 rounded border border-[#B8976C]/20">
                {collections.find((c) => c.id === photo.collectionId)?.name || 'In Collection'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFrameStudio(photo)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#EDE8E1] bg-[#221F1C] hover:bg-[#2C2824] border border-[#3A352F] rounded-lg transition-colors font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B8976C]" />
              <span>Matte & Frame Studio</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8F8982] hover:text-[#EDE8E1] hover:bg-[#221F1C] rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
          
          {/* Left: Artwork Preview Stage */}
          <div className="lg:col-span-7 bg-[#0E0D0C] p-6 flex flex-col items-center justify-center relative select-none">
            <div className="relative max-h-[55vh] flex items-center justify-center">
              <img
                src={photo.src}
                alt={title}
                className="max-h-[52vh] max-w-full object-contain rounded shadow-2xl transition-all duration-200"
                style={{
                  filter: `
                    brightness(${100 + adjustments.brightness}%)
                    contrast(${100 + adjustments.contrast}%)
                    saturate(${100 + adjustments.saturation}%)
                    sepia(${adjustments.sepia}%)
                  `,
                }}
              />
            </div>

            {/* Extracted Palette Strip */}
            <div className="mt-4 flex items-center gap-3 bg-[#161413] px-4 py-2 rounded-full border border-[#2B2824]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8F8982]">
                Palette:
              </span>
              <div className="flex items-center gap-1.5">
                {photo.palette.map((swatch, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full border border-black/40 shadow-sm"
                    style={{ backgroundColor: swatch.hex }}
                    title={`${swatch.name} • ${swatch.hex}`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-[#A89F91]">
                ({photo.dominantFamily})
              </span>
            </div>
          </div>

          {/* Right: Curatorial Metadata & Controls */}
          <div className="lg:col-span-5 p-6 bg-[#161413] flex flex-col justify-between overflow-y-auto border-t lg:border-t-0 lg:border-l border-[#282522]">
            
            {/* Tabs */}
            <div>
              <div className="flex border-b border-[#2A2724] mb-5">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all ${
                    activeTab === 'info'
                      ? 'border-[#B8976C] text-[#EDE8E1]'
                      : 'border-transparent text-[#8F8982] hover:text-[#EDE8E1]'
                  }`}
                >
                  Curatorial Info
                </button>
                <button
                  onClick={() => setActiveTab('exif')}
                  className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all ${
                    activeTab === 'exif'
                      ? 'border-[#B8976C] text-[#EDE8E1]'
                      : 'border-transparent text-[#8F8982] hover:text-[#EDE8E1]'
                  }`}
                >
                  EXIF & Camera
                </button>
                <button
                  onClick={() => setActiveTab('adjustments')}
                  className={`pb-2 px-3 text-xs font-medium border-b-2 transition-all ${
                    activeTab === 'adjustments'
                      ? 'border-[#B8976C] text-[#EDE8E1]'
                      : 'border-transparent text-[#8F8982] hover:text-[#EDE8E1]'
                  }`}
                >
                  Adjust Tone
                </button>
              </div>

              {/* Tab 1: Curatorial Info */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  {/* Rating & Favorite */}
                  <div className="flex items-center justify-between bg-[#1D1A18] p-3 rounded-xl border border-[#2D2925]">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 text-[#8F8982] hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-[#524E48]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                        isFavorite
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-[#262320] text-[#8F8982] hover:text-[#EDE8E1]'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400' : ''}`} />
                      <span>{isFavorite ? "Curator's Pick" : 'Mark as Pick'}</span>
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#8F8982] mb-1">
                      Artwork Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#1C1A18] border border-[#2F2B26] focus:border-[#B8976C] text-[#EDE8E1] text-xs rounded-lg px-3 py-2 outline-none transition-colors"
                    />
                  </div>

                  {/* Collection Select */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#8F8982] mb-1">
                      Assigned Collection
                    </label>
                    <select
                      value={collectionId}
                      onChange={(e) => setCollectionId(e.target.value)}
                      className="w-full bg-[#1C1A18] border border-[#2F2B26] focus:border-[#B8976C] text-[#EDE8E1] text-xs rounded-lg px-3 py-2 outline-none transition-colors"
                    >
                      <option value="">(No specific collection)</option>
                      {collections.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#8F8982] mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. Architecture, Shadows, 35mm, Minimal"
                      className="w-full bg-[#1C1A18] border border-[#2F2B26] focus:border-[#B8976C] text-[#EDE8E1] text-xs rounded-lg px-3 py-2 outline-none transition-colors"
                    />
                  </div>

                  {/* Curatorial Notes */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#8F8982] mb-1">
                      Curator's Notes & Field Diary
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Subject context, lighting conditions, or printing thoughts..."
                      className="w-full bg-[#1C1A18] border border-[#2F2B26] focus:border-[#B8976C] text-[#EDE8E1] text-xs rounded-lg px-3 py-2 outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: EXIF & Camera */}
              {activeTab === 'exif' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                        Camera Body
                      </label>
                      <input
                        type="text"
                        value={camera}
                        onChange={(e) => setCamera(e.target.value)}
                        placeholder="e.g. Leica M6"
                        className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-2.5 py-1.5 text-[#EDE8E1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                        Lens
                      </label>
                      <input
                        type="text"
                        value={lens}
                        onChange={(e) => setLens(e.target.value)}
                        placeholder="e.g. Summicron 35mm f/2"
                        className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-2.5 py-1.5 text-[#EDE8E1] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                        Aperture
                      </label>
                      <input
                        type="text"
                        value={aperture}
                        onChange={(e) => setAperture(e.target.value)}
                        placeholder="f/4"
                        className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-2 py-1.5 text-[#EDE8E1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                        Shutter
                      </label>
                      <input
                        type="text"
                        value={shutterSpeed}
                        onChange={(e) => setShutterSpeed(e.target.value)}
                        placeholder="1/250s"
                        className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-2 py-1.5 text-[#EDE8E1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                        ISO
                      </label>
                      <input
                        type="text"
                        value={iso}
                        onChange={(e) => setIso(e.target.value)}
                        placeholder="400"
                        className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-2 py-1.5 text-[#EDE8E1] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                        Film Stock / Preset
                      </label>
                      <input
                        type="text"
                        value={filmStock}
                        onChange={(e) => setFilmStock(e.target.value)}
                        placeholder="e.g. Kodak Portra 400"
                        className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-2.5 py-1.5 text-[#EDE8E1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                        Year Captured
                      </label>
                      <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="2024"
                        className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-2.5 py-1.5 text-[#EDE8E1] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                      Location / Region
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kyoto, Japan"
                      className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-2.5 py-1.5 text-[#EDE8E1] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Adjust Tone */}
              {activeTab === 'adjustments' && (
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#8F8982]">Non-destructive tone grading</span>
                    <button
                      onClick={resetAdjustments}
                      className="text-[10px] text-[#B8976C] hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Reset Sliders
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#8F8982] mb-1">
                      <span>Brightness</span>
                      <span>{adjustments.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={adjustments.brightness}
                      onChange={(e) =>
                        setAdjustments({ ...adjustments, brightness: parseInt(e.target.value) })
                      }
                      className="w-full accent-[#B8976C]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#8F8982] mb-1">
                      <span>Contrast</span>
                      <span>{adjustments.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={adjustments.contrast}
                      onChange={(e) =>
                        setAdjustments({ ...adjustments, contrast: parseInt(e.target.value) })
                      }
                      className="w-full accent-[#B8976C]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#8F8982] mb-1">
                      <span>Saturation</span>
                      <span>{adjustments.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="50"
                      value={adjustments.saturation}
                      onChange={(e) =>
                        setAdjustments({ ...adjustments, saturation: parseInt(e.target.value) })
                      }
                      className="w-full accent-[#B8976C]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-[#8F8982] mb-1">
                      <span>Sepia Tone</span>
                      <span>{adjustments.sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adjustments.sepia}
                      onChange={(e) =>
                        setAdjustments({ ...adjustments, sepia: parseInt(e.target.value) })
                      }
                      className="w-full accent-[#B8976C]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-[#2A2724] flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm('Delete this photograph from local storage vault?')) {
                    onDeletePhoto(photo.id);
                    onClose();
                  }
                }}
                className="text-xs text-[#8F8982] hover:text-red-400 p-2 transition-colors flex items-center gap-1.5"
                title="Remove from archive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>

              <div className="flex items-center gap-2">
                {savedNotice && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3" />
                    Saved
                  </span>
                )}
                <button
                  id="save-metadata-btn"
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-medium text-[#121110] bg-[#B8976C] hover:bg-[#C9A97E] active:scale-95 rounded-lg transition-all shadow-sm"
                >
                  Save Archival Changes
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
