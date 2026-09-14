import React, { useState, useRef } from 'react';
import { PhotoItem } from '../types';
import { Search, Star, ZoomIn, Eye } from 'lucide-react';

interface ContactSheetViewProps {
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const ContactSheetView: React.FC<ContactSheetViewProps> = ({
  photos,
  onSelectPhoto,
  onToggleFavorite,
}) => {
  const [loupeActive, setLoupeActive] = useState<boolean>(true);
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; relX: number; relY: number }>({
    x: 0,
    y: 0,
    relX: 0.5,
    relY: 0.5,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (photoId: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    setHoveredPhotoId(photoId);
    setCursorPos({
      x: e.clientX,
      y: e.clientY,
      relX: Math.max(0, Math.min(1, relX)),
      relY: Math.max(0, Math.min(1, relY)),
    });
  };

  const activePhoto = photos.find((p) => p.id === hoveredPhotoId);

  return (
    <div id="contact-sheet-wrapper" className="space-y-4" ref={containerRef}>
      {/* Contact Sheet Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161413] border border-[#2B2824] p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs uppercase tracking-widest text-[#B8976C] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B8976C]" />
            35mm Archival Proof Sheet
          </div>
          <span className="text-xs text-[#78716A] hidden sm:inline font-mono">
            KODAK SAFETY FILM • ROLL #2024-C
          </span>
        </div>

        {/* Loupe Toggle */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-loupe-btn"
            onClick={() => setLoupeActive(!loupeActive)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all font-mono ${
              loupeActive
                ? 'bg-[#B8976C] text-[#121110] font-semibold shadow-sm'
                : 'bg-[#221F1D] text-[#8F8982] hover:text-[#EDE8E1]'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Curator's Loupe: {loupeActive ? 'Active' : 'Off'}</span>
          </button>
        </div>
      </div>

      {/* The Physical Contact Sheet Canvas */}
      <div className="bg-[#0D0C0B] border-4 border-[#1F1D1B] rounded-xl p-4 sm:p-8 shadow-2xl relative select-none">
        
        {/* Top Roll Film Header Info */}
        <div className="flex justify-between items-center text-[10px] font-mono text-[#4A4540] tracking-widest uppercase border-b border-[#22201D] pb-3 mb-6">
          <span>KODAK SAFETY FILM 5063</span>
          <span className="text-[#8F8982]">ATELIER PROOF SHEET • APERTURE ARCHIVE</span>
          <span>ISO 400 • EMULSION #882</span>
        </div>

        {/* Grid of Film Strips */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo, index) => {
            const frameNum = String(index + 1).padStart(2, '0');
            return (
              <div
                key={photo.id}
                id={`contact-frame-${photo.id}`}
                onMouseEnter={() => setHoveredPhotoId(photo.id)}
                onMouseLeave={() => setHoveredPhotoId(null)}
                onMouseMove={(e) => handleMouseMove(photo.id, e)}
                onClick={() => onSelectPhoto(photo)}
                className="group relative bg-[#171514] border-2 border-[#292623] hover:border-[#B8976C] rounded p-2 transition-all cursor-crosshair flex flex-col"
              >
                {/* 35mm Frame Header Numbers */}
                <div className="flex justify-between items-center text-[9px] font-mono text-[#6E6862] pb-1 px-1">
                  <span className="group-hover:text-[#B8976C] transition-colors">▶ {frameNum}</span>
                  <span className="opacity-70">{frameNum}A</span>
                </div>

                {/* Film Image Box */}
                <div className="relative aspect-3/2 w-full bg-black overflow-hidden border border-[#2D2A26]">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover grayscale-[30%] contrast-110 group-hover:grayscale-0 transition-all duration-300"
                  />

                  {/* Red Grease Pencil Pick Circle if favorite */}
                  {photo.isFavorite && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-2 border-red-500/80 -rotate-12 flex items-center justify-center shadow-sm">
                        <span className="text-[10px] font-mono font-bold text-red-400 tracking-wider uppercase bg-black/40 px-1 rounded">
                          PICK
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Frame Star Action */}
                  <button
                    onClick={(e) => onToggleFavorite(photo.id, e)}
                    className="absolute top-1 right-1 p-1 rounded bg-black/60 hover:bg-black text-[#EDE8E1] transition-colors z-10"
                    title="Toggle Pick"
                  >
                    <Star
                      className={`w-3 h-3 ${
                        photo.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-[#8F8982]'
                      }`}
                    />
                  </button>
                </div>

                {/* Film Frame Footer Notes */}
                <div className="pt-2 px-1 flex flex-col justify-between flex-1">
                  <p className="font-mono text-[10px] text-[#EDE8E1] truncate font-medium group-hover:text-[#B8976C] transition-colors">
                    {photo.title}
                  </p>
                  <div className="flex items-center justify-between text-[9px] font-mono text-[#6E6862] mt-1">
                    <span className="truncate max-w-[90px]">
                      {photo.exif.filmStock || photo.exif.camera || '35mm'}
                    </span>
                    <span className="text-[#8F8982]">{photo.exif.shutterSpeed || '1/250'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Roll Film Footer */}
        <div className="flex justify-between items-center text-[10px] font-mono text-[#4A4540] tracking-widest uppercase border-t border-[#22201D] pt-3 mt-6">
          <span>● ● ● ARCHIVAL GRADE FIBER BASE ● ● ●</span>
          <span>FRAME COUNT: {photos.length}</span>
        </div>
      </div>

      {/* The Floating Curator's Loupe Magnifier */}
      {loupeActive && activePhoto && hoveredPhotoId && (
        <div
          className="fixed pointer-events-none z-50 rounded-full overflow-hidden shadow-2xl border-4 border-[#C7A87E] bg-black"
          style={{
            width: 170,
            height: 170,
            left: cursorPos.x - 85,
            top: cursorPos.y - 85,
            boxShadow: '0 0 0 1px #5C4831, 0 12px 35px rgba(0,0,0,0.85)',
          }}
        >
          {/* Zoomed portion of the active photo */}
          <div
            className="w-full h-full relative"
            style={{
              backgroundImage: `url(${activePhoto.src})`,
              backgroundPosition: `${cursorPos.relX * 100}% ${cursorPos.relY * 100}%`,
              backgroundSize: '350%',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Loupe Optical Crosshair and Lens Ring Effect */}
            <div className="absolute inset-0 border border-white/10 rounded-full" />
            <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-red-500/40" />
            <div className="absolute top-0 bottom-0 left-1/2 w-[0.5px] bg-red-500/40" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-[#EDE8E1]">
              2.5× GRAIN LOUPE
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
