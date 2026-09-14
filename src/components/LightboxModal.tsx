import React, { useState, useEffect } from 'react';
import { PhotoItem } from '../types';
import { X, ChevronLeft, ChevronRight, Play, Pause, Star } from 'lucide-react';

interface LightboxModalProps {
  photos: PhotoItem[];
  initialIndex?: number;
  onClose: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  initialIndex = 0,
  onClose,
  onToggleFavorite,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const currentPhoto = photos[currentIndex] || photos[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length]);

  // Slideshow interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(handleNext, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, photos.length]);

  if (!currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 select-none">
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#8F8982]">
            {currentIndex + 1} / {photos.length}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1A18] hover:bg-[#282420] text-xs text-[#EDE8E1] border border-[#332F2A] transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 text-[#B8976C]" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#B8976C] fill-[#B8976C]" />
                <span>Play</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-[#8F8982] hover:text-[#EDE8E1] hover:bg-white/10 rounded-full transition-colors"
          title="Exit Lightbox (Esc)"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Stage with Navigation Chevrons */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 my-4">
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-[#EDE8E1] border border-white/10 transition-all hover:scale-105 backdrop-blur-sm"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="max-h-full max-w-full flex items-center justify-center">
          <img
            key={currentPhoto.id}
            src={currentPhoto.src}
            alt={currentPhoto.title}
            className="max-h-[75vh] max-w-[88vw] object-contain rounded-sm shadow-2xl animate-fade-in"
            style={{
              filter: `
                brightness(${100 + (currentPhoto.adjustments?.brightness || 0)}%)
                contrast(${100 + (currentPhoto.adjustments?.contrast || 0)}%)
                saturate(${100 + (currentPhoto.adjustments?.saturation || 0)}%)
                sepia(${currentPhoto.adjustments?.sepia || 0}%)
              `,
            }}
          />
        </div>

        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/40 hover:bg-black/80 text-[#EDE8E1] border border-white/10 transition-all hover:scale-105 backdrop-blur-sm"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Floating Curatorial Plaque */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#141211]/90 backdrop-blur-md border border-[#2B2824] px-6 py-3.5 rounded-2xl max-w-3xl mx-auto w-full z-10">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-lg font-semibold text-[#EDE8E1]">
              {currentPhoto.title}
            </h3>
            {currentPhoto.exif.year && (
              <span className="font-mono text-xs text-[#8F8982]">
                {currentPhoto.exif.year}
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-[#8F8982] mt-0.5">
            {[
              currentPhoto.exif.camera,
              currentPhoto.exif.filmStock,
              currentPhoto.exif.lens,
              currentPhoto.exif.location,
            ]
              .filter(Boolean)
              .join(' • ')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Palette Dots */}
          <div className="flex items-center gap-1">
            {currentPhoto.palette.map((swatch, idx) => (
              <div
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-black/40"
                style={{ backgroundColor: swatch.hex }}
                title={`${swatch.name} (${swatch.hex})`}
              />
            ))}
          </div>

          <button
            onClick={(e) => onToggleFavorite(currentPhoto.id, e)}
            className="p-1.5 rounded-lg bg-[#221F1C] hover:bg-[#2C2824] text-[#EDE8E1] transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                currentPhoto.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-[#8F8982]'
              }`}
            />
          </button>
        </div>
      </div>

    </div>
  );
};
