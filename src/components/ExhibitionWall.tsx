import React from 'react';
import { PhotoItem } from '../types';
import { Star, Eye, Sparkles, MapPin, Camera } from 'lucide-react';

interface ExhibitionWallProps {
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenFrameStudio: (photo: PhotoItem, e: React.MouseEvent) => void;
}

export const ExhibitionWall: React.FC<ExhibitionWallProps> = ({
  photos,
  onSelectPhoto,
  onToggleFavorite,
  onOpenFrameStudio,
}) => {
  if (photos.length === 0) {
    return (
      <div className="py-24 text-center border border-dashed border-[#2E2B27] rounded-2xl p-8 bg-[#161413]/50">
        <div className="w-12 h-12 rounded-full border border-[#B8976C]/30 bg-[#1C1A18] flex items-center justify-center mx-auto mb-3 text-[#B8976C]">
          <Camera className="w-5 h-5 opacity-80" />
        </div>
        <h3 className="font-serif text-lg text-[#EDE8E1] mb-1">No photographs found in this view</h3>
        <p className="text-xs text-[#8F8982] max-w-sm mx-auto">
          Try adjusting your search criteria, switching active collections, or adding new photographs from your computer.
        </p>
      </div>
    );
  }

  return (
    <div id="exhibition-wall-grid" className="columns-1 sm:columns-2 xl:columns-3 gap-6 space-y-6">
      {photos.map((photo) => {
        return (
          <div
            key={photo.id}
            id={`artwork-card-${photo.id}`}
            onClick={() => onSelectPhoto(photo)}
            className="break-inside-avoid group relative bg-[#181614] border border-[#2B2824] hover:border-[#B8976C]/50 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Archival Frame Wrapper */}
            <div className="p-3.5 pb-2 bg-[#141211]">
              <div 
                className={`relative overflow-hidden rounded-md transition-transform duration-300 ${
                  photo.frameStyle === 'museum-mat'
                    ? 'p-4 bg-[#EDE8DF] shadow-inner'
                    : photo.frameStyle === 'walnut-frame'
                    ? 'p-3 bg-[#422A1D] border-2 border-[#2B1B12]'
                    : photo.frameStyle === 'polaroid'
                    ? 'pt-3 px-3 pb-8 bg-[#F4F1EA] shadow-md'
                    : photo.frameStyle === 'slide-mount'
                    ? 'p-3 bg-[#D8D2C6] border border-[#B8B1A2]'
                    : 'p-0'
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-auto object-cover rounded-sm group-hover:scale-[1.01] transition-transform duration-500"
                  style={{
                    filter: `
                      brightness(${100 + (photo.adjustments?.brightness || 0)}%)
                      contrast(${100 + (photo.adjustments?.contrast || 0)}%)
                      saturate(${100 + (photo.adjustments?.saturation || 0)}%)
                      sepia(${photo.adjustments?.sepia || 0}%)
                    `,
                  }}
                />

                {/* Favorite Star Button floating over artwork */}
                <button
                  onClick={(e) => onToggleFavorite(photo.id, e)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#141211]/80 hover:bg-[#141211] text-[#EDE8E1] backdrop-blur-sm transition-all z-10"
                  title={photo.isFavorite ? 'Curator Pick' : 'Mark as Pick'}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      photo.isFavorite
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-[#A89F91] group-hover:text-amber-300'
                    }`}
                  />
                </button>

                {/* Hover Quick Curate Bar */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  <span className="px-3 py-1.5 bg-[#121110]/90 text-xs text-[#EDE8E1] rounded-full border border-[#B8976C]/40 backdrop-blur-md flex items-center gap-1.5 font-medium shadow-lg">
                    <Eye className="w-3.5 h-3.5 text-[#B8976C]" />
                    Inspect Details
                  </span>
                </div>
              </div>
            </div>

            {/* Museum Plaque / Metadata Label */}
            <div className="p-4 pt-2 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-semibold text-[#EDE8E1] group-hover:text-[#B8976C] transition-colors leading-snug">
                    {photo.title}
                  </h3>
                  {photo.exif.year && (
                    <span className="font-mono text-[11px] text-[#8F8982] shrink-0">
                      {photo.exif.year}
                    </span>
                  )}
                </div>

                {/* Camera / Film details */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-[#8F8982] font-mono">
                  {photo.exif.camera && <span>{photo.exif.camera}</span>}
                  {photo.exif.filmStock && (
                    <span className="text-[#B8976C]">• {photo.exif.filmStock}</span>
                  )}
                  {photo.exif.lens && (
                    <span>• {photo.exif.lens}</span>
                  )}
                </div>

                {/* Location / Notes snippet */}
                {photo.exif.location && (
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#78716A]">
                    <MapPin className="w-2.5 h-2.5 text-[#B8976C]/80 shrink-0" />
                    <span className="truncate">{photo.exif.location}</span>
                  </div>
                )}
              </div>

              {/* Bottom palette ribbon & archival actions */}
              <div className="mt-3 pt-2.5 border-t border-[#23201D] flex items-center justify-between">
                {/* 4-Color Swatch Strip */}
                <div className="flex items-center gap-1">
                  {photo.palette.slice(0, 4).map((c, i) => (
                    <span
                      key={i}
                      className="w-3 h-3 rounded-full border border-black/30 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                      title={`${c.name} (${c.hex})`}
                    />
                  ))}
                  <span className="text-[10px] text-[#6E6862] font-mono ml-1">
                    {photo.dominantFamily}
                  </span>
                </div>

                {/* Frame Studio Quick Trigger */}
                <button
                  onClick={(e) => onOpenFrameStudio(photo, e)}
                  className="text-[11px] text-[#A89F91] hover:text-[#B8976C] font-serif italic hover:underline flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-[#B8976C]" />
                  Matte Studio
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
