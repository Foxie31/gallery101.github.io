import React, { useState, useRef } from 'react';
import { PhotoItem, FrameStyle } from '../types';
import { X, Download, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

interface FrameStudioModalProps {
  photo: PhotoItem;
  onClose: () => void;
  onSaveFrameStyle: (style: FrameStyle) => void;
}

export const FrameStudioModal: React.FC<FrameStudioModalProps> = ({
  photo,
  onClose,
  onSaveFrameStyle,
}) => {
  const [frameStyle, setFrameStyle] = useState<FrameStyle>(photo.frameStyle || 'museum-mat');
  const [matColor, setMatColor] = useState<string>('#F3EFEA'); // Ivory Alabaster
  const [caption, setCaption] = useState<string>(photo.title || 'Untitled Photograph');
  const [subCaption, setSubCaption] = useState<string>(
    `${photo.exif.location ? photo.exif.location + ' • ' : ''}${photo.exif.year || '2024'} • Archival Print 1/1`
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const MAT_COLORS = [
    { name: 'Ivory Alabaster', hex: '#F3EFEA', text: '#2A2825' },
    { name: 'Warm Cream', hex: '#EBE4D5', text: '#2F2B26' },
    { name: 'Sand Linen', hex: '#DDD4C3', text: '#332E27' },
    { name: 'Sage Mist', hex: '#D7DDD4', text: '#283126' },
    { name: 'Obsidian Noir', hex: '#1C1B1A', text: '#EDE8E1' },
  ];

  // Render to canvas and download
  const handleExportCanvas = async () => {
    setIsExporting(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = photo.src;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');

      const imgWidth = img.naturalWidth || 1200;
      const imgHeight = img.naturalHeight || 800;

      // Define frame geometries based on selected style
      if (frameStyle === 'museum-mat') {
        const matPadding = Math.round(imgWidth * 0.12);
        const bottomBonus = Math.round(imgWidth * 0.08); // extra bottom margin for plaque
        const frameBorder = Math.round(imgWidth * 0.025);

        canvas.width = imgWidth + (matPadding * 2) + (frameBorder * 2);
        canvas.height = imgHeight + (matPadding * 2) + bottomBonus + (frameBorder * 2);

        // Frame Outer Bezel
        ctx.fillStyle = '#261F1A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Mat board
        ctx.fillStyle = matColor;
        ctx.fillRect(
          frameBorder,
          frameBorder,
          canvas.width - frameBorder * 2,
          canvas.height - frameBorder * 2
        );

        // Photo drawing
        const photoX = frameBorder + matPadding;
        const photoY = frameBorder + matPadding;
        ctx.drawImage(img, photoX, photoY, imgWidth, imgHeight);

        // Subtle inner shadow stroke around photo
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;
        ctx.strokeRect(photoX, photoY, imgWidth, imgHeight);

        // Plaque / Museum Typography
        ctx.fillStyle = matColor === '#1C1B1A' ? '#EDE8E1' : '#2A2825';
        ctx.textAlign = 'center';
        ctx.font = `italic 600 ${Math.round(imgWidth * 0.03)}px 'Cormorant Garamond', Georgia, serif`;
        ctx.fillText(
          caption,
          canvas.width / 2,
          photoY + imgHeight + Math.round(bottomBonus * 0.55)
        );

        ctx.fillStyle = matColor === '#1C1B1A' ? '#8F8982' : '#68615A';
        ctx.font = `400 ${Math.round(imgWidth * 0.018)}px 'Space Mono', monospace`;
        ctx.fillText(
          subCaption,
          canvas.width / 2,
          photoY + imgHeight + Math.round(bottomBonus * 0.85)
        );
      } else if (frameStyle === 'polaroid') {
        const borderX = Math.round(imgWidth * 0.08);
        const borderTop = Math.round(imgWidth * 0.08);
        const borderBottom = Math.round(imgWidth * 0.28);

        canvas.width = imgWidth + borderX * 2;
        canvas.height = imgHeight + borderTop + borderBottom;

        // Polaroid paper
        ctx.fillStyle = '#F6F3EC';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Photo
        ctx.drawImage(img, borderX, borderTop, imgWidth, imgHeight);

        // Handwritten-style caption
        ctx.fillStyle = '#22201E';
        ctx.textAlign = 'center';
        ctx.font = `italic 500 ${Math.round(imgWidth * 0.045)}px 'Cormorant Garamond', Georgia, serif`;
        ctx.fillText(caption, canvas.width / 2, borderTop + imgHeight + Math.round(borderBottom * 0.5));

        ctx.font = `400 ${Math.round(imgWidth * 0.02)}px 'Space Mono', monospace`;
        ctx.fillStyle = '#787066';
        ctx.fillText(subCaption, canvas.width / 2, borderTop + imgHeight + Math.round(borderBottom * 0.78));
      } else if (frameStyle === 'slide-mount') {
        const border = Math.round(imgWidth * 0.15);
        canvas.width = imgWidth + border * 2;
        canvas.height = imgHeight + border * 2;

        ctx.fillStyle = '#DFD9CE';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, border, border, imgWidth, imgHeight);

        ctx.fillStyle = '#8F282B';
        ctx.font = `bold ${Math.round(imgWidth * 0.025)}px monospace`;
        ctx.fillText('35mm TRANSPARENCY', border, border - 15);

        ctx.fillStyle = '#4D473F';
        ctx.textAlign = 'right';
        ctx.font = `bold ${Math.round(imgWidth * 0.025)}px monospace`;
        ctx.fillText('ATELIER ARCHIVE', canvas.width - border, border - 15);
      } else {
        // walnut / minimal
        const frameBorder = Math.round(imgWidth * 0.04);
        canvas.width = imgWidth + frameBorder * 2;
        canvas.height = imgHeight + frameBorder * 2;

        ctx.fillStyle = frameStyle === 'walnut-frame' ? '#3B271B' : '#141312';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, frameBorder, frameBorder, imgWidth, imgHeight);
      }

      // Convert to blob and trigger download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeTitle = caption.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        a.download = `${safeTitle}-archival-framed.png`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      alert('Failed to generate framed print. The image may be protected by cross-origin security.');
      setIsExporting(false);
    }
  };

  const handleApplyStyle = () => {
    onSaveFrameStyle(frameStyle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div 
        id="frame-studio-dialog"
        className="bg-[#161413] border border-[#2E2B27] rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282522] bg-[#141211]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#B8976C]/10 text-[#B8976C] border border-[#B8976C]/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#EDE8E1]">
                Archival Matte & Framing Lab
              </h2>
              <p className="text-xs text-[#8F8982]">
                Custom exhibition presentation and high-resolution framed print export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8F8982] hover:text-[#EDE8E1] hover:bg-[#221F1C] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Framing Stage & Options */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto min-h-0">
          
          {/* Left: Interactive Framing Mockup */}
          <div className="lg:col-span-8 bg-[#0C0B0A] p-8 flex items-center justify-center overflow-auto min-h-[360px]">
            <div
              ref={previewContainerRef}
              className="max-w-md w-full transition-all duration-300 shadow-2xl"
            >
              {/* Frame Container */}
              {frameStyle === 'museum-mat' && (
                <div
                  className="p-8 pb-10 rounded-sm border-8 border-[#2E241E] shadow-2xl flex flex-col items-center"
                  style={{ backgroundColor: matColor }}
                >
                  <img
                    src={photo.src}
                    alt={caption}
                    className="w-full h-auto object-contain shadow-md rounded-xs"
                  />
                  <div className="mt-5 text-center">
                    <h4
                      className="font-serif italic font-semibold text-base"
                      style={{ color: matColor === '#1C1B1A' ? '#EDE8E1' : '#2A2825' }}
                    >
                      {caption}
                    </h4>
                    <p
                      className="font-mono text-[10px] tracking-wide mt-1"
                      style={{ color: matColor === '#1C1B1A' ? '#8F8982' : '#68615A' }}
                    >
                      {subCaption}
                    </p>
                  </div>
                </div>
              )}

              {frameStyle === 'polaroid' && (
                <div className="pt-4 px-4 pb-12 bg-[#F6F3EC] rounded shadow-2xl flex flex-col items-center">
                  <img
                    src={photo.src}
                    alt={caption}
                    className="w-full aspect-square object-cover shadow-inner"
                  />
                  <div className="mt-6 text-center">
                    <p className="font-serif italic text-base text-[#22201E] font-medium">
                      {caption}
                    </p>
                    <p className="font-mono text-[10px] text-[#787066] mt-1">
                      {subCaption}
                    </p>
                  </div>
                </div>
              )}

              {frameStyle === 'slide-mount' && (
                <div className="p-8 bg-[#DFD9CE] border-4 border-[#C7BEB0] rounded shadow-2xl flex flex-col items-center">
                  <div className="w-full flex justify-between text-[9px] font-mono font-bold text-[#8F282B] mb-2">
                    <span>35mm ARCHIVAL SLIDE</span>
                    <span className="text-[#4D473F]">#2024-EXHIBIT</span>
                  </div>
                  <img
                    src={photo.src}
                    alt={caption}
                    className="w-full h-auto object-cover border border-black/40"
                  />
                  <div className="w-full flex justify-between text-[9px] font-mono text-[#544D44] mt-3">
                    <span className="truncate max-w-[160px]">{caption}</span>
                    <span>{photo.exif.year || '2024'}</span>
                  </div>
                </div>
              )}

              {frameStyle === 'walnut-frame' && (
                <div className="p-5 bg-[#3B271B] border-4 border-[#22160E] rounded shadow-2xl">
                  <img
                    src={photo.src}
                    alt={caption}
                    className="w-full h-auto object-cover rounded-xs shadow"
                  />
                </div>
              )}

              {frameStyle === 'minimal' && (
                <div className="p-0 shadow-2xl">
                  <img
                    src={photo.src}
                    alt={caption}
                    className="w-full h-auto object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Studio Controls */}
          <div className="lg:col-span-4 p-6 bg-[#161413] border-t lg:border-t-0 lg:border-l border-[#282522] flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Frame Archetype Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#8F8982] mb-2">
                  Archival Frame Presentation
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'museum-mat', name: 'Museum Passe-Partout Mat', desc: 'Fine art exhibition mat with plaque typography' },
                    { id: 'polaroid', name: 'Vintage Instant 600', desc: 'Classic warm border with bottom written caption' },
                    { id: 'slide-mount', name: '35mm Film Slide Mount', desc: 'Cardboard transparency frame with stamp' },
                    { id: 'walnut-frame', name: 'Dark Walnut Moulding', desc: 'Solid wood bevel framing' },
                    { id: 'minimal', name: 'Raw Float / Borderless', desc: 'Pure contemporary borderless edge' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setFrameStyle(style.id as FrameStyle)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                        frameStyle === style.id
                          ? 'border-[#B8976C] bg-[#221F1C] text-[#EDE8E1]'
                          : 'border-[#292622] hover:border-[#38332C] text-[#8F8982] hover:text-[#EDE8E1]'
                      }`}
                    >
                      <div className="font-serif font-semibold text-sm flex items-center justify-between">
                        <span>{style.name}</span>
                        {frameStyle === style.id && <Check className="w-3.5 h-3.5 text-[#B8976C]" />}
                      </div>
                      <p className="text-[10px] text-[#78716A] mt-0.5">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mat Color (if museum mat) */}
              {frameStyle === 'museum-mat' && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#8F8982] mb-2">
                    Acid-Free Mat Board Tint
                  </label>
                  <div className="flex items-center gap-2">
                    {MAT_COLORS.map((mc) => (
                      <button
                        key={mc.hex}
                        onClick={() => setMatColor(mc.hex)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          matColor === mc.hex ? 'border-[#B8976C] scale-110' : 'border-black/40'
                        }`}
                        style={{ backgroundColor: mc.hex }}
                        title={mc.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Inscription Inputs */}
              {(frameStyle === 'museum-mat' || frameStyle === 'polaroid') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                      Frame Title Inscription
                    </label>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-3 py-1.5 text-[#EDE8E1] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#8F8982] mb-1">
                      Secondary Archival Plaque Note
                    </label>
                    <input
                      type="text"
                      value={subCaption}
                      onChange={(e) => setSubCaption(e.target.value)}
                      className="w-full bg-[#1C1A18] border border-[#2F2B26] text-xs rounded px-3 py-1.5 text-[#EDE8E1] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-[#282522] flex flex-col gap-2">
              <button
                id="download-framed-art-btn"
                onClick={handleExportCanvas}
                disabled={isExporting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#B8976C] hover:bg-[#C9A97E] text-[#121110] font-medium text-xs flex items-center justify-center gap-2 shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Rendering Print...' : 'Download Framed Print (PNG)'}</span>
              </button>

              <button
                id="apply-frame-style-btn"
                onClick={handleApplyStyle}
                className="w-full py-2 px-4 rounded-lg bg-[#201D1A] hover:bg-[#282420] text-[#A89F91] hover:text-[#EDE8E1] border border-[#2F2B26] text-xs transition-colors"
              >
                Set as Default Frame in Gallery
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
