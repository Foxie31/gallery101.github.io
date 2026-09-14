import React from 'react';
import { PhotoItem, ColorSwatch } from '../types';
import { Sparkles, Palette, Star } from 'lucide-react';

interface ChromaticViewProps {
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
  onSelectColorFamily: (family: ColorSwatch['family']) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

const FAMILY_CONFIG: Record<
  ColorSwatch['family'],
  { title: string; subtitle: string; sampleHex: string; borderHex: string }
> = {
  monochrome: {
    title: 'Noir, Slate & Silver',
    subtitle: 'Timeless chiaroscuro, graphite shadows, and structural contrast',
    sampleHex: '#1E1D1B',
    borderHex: '#423F3B',
  },
  amber: {
    title: 'Amber & Honey Ochre',
    subtitle: 'Golden hour luminescence, low raking sun, and desert heat',
    sampleHex: '#C87D38',
    borderHex: '#8C5625',
  },
  sage: {
    title: 'Olive Sage & Forest Mist',
    subtitle: 'Botanical stillness, mossy dampness, and evergreen silence',
    sampleHex: '#526955',
    borderHex: '#384B3B',
  },
  azure: {
    title: 'Aegean Azure & Indigo',
    subtitle: 'Nautical twilight, deep sea foam, and horizon gradients',
    sampleHex: '#2C4F70',
    borderHex: '#1C344A',
  },
  crimson: {
    title: 'Crimson Dusk & Burgundy',
    subtitle: 'Nightfall neon, rich oxide clays, and vivid lantern embers',
    sampleHex: '#9E2A32',
    borderHex: '#6B1B21',
  },
  earth: {
    title: 'Raw Umber & Terracotta',
    subtitle: 'Tactile clay, weathered bark, volcanic grit, and dried foliage',
    sampleHex: '#7C482B',
    borderHex: '#54301B',
  },
  warm: {
    title: 'Golden Parchment & Sunlit Linen',
    subtitle: 'Warm architectural limestone, morning dust motes, and soft silk',
    sampleHex: '#D4AA64',
    borderHex: '#91713B',
  },
};

export const ChromaticView: React.FC<ChromaticViewProps> = ({
  photos,
  onSelectPhoto,
  onSelectColorFamily,
  onToggleFavorite,
}) => {
  // Group photos by dominant family
  const grouped: Partial<Record<ColorSwatch['family'], PhotoItem[]>> = {};
  for (const photo of photos) {
    const fam = photo.dominantFamily || 'monochrome';
    if (!grouped[fam]) grouped[fam] = [];
    grouped[fam]!.push(photo);
  }

  const families = Object.keys(FAMILY_CONFIG) as ColorSwatch['family'][];
  const activeFamilies = families.filter((f) => grouped[f] && grouped[f]!.length > 0);

  if (activeFamilies.length === 0) {
    return (
      <div className="py-20 text-center text-[#8F8982]">
        <Palette className="w-8 h-8 mx-auto mb-2 text-[#B8976C] opacity-70" />
        <p className="font-serif text-lg">No chromatic groups match the current filter.</p>
      </div>
    );
  }

  return (
    <div id="chromatic-view-container" className="space-y-12">
      {/* Intro Header */}
      <div className="bg-[#161413] border border-[#2A2825] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#EDE8E1] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#B8976C]" />
            Harmonic Chromatic Spectrum
          </h2>
          <p className="text-xs text-[#8F8982] mt-1">
            Organized automatically by algorithmic canvas pixel extraction and tone clustering.
          </p>
        </div>

        {/* Quick Hue Navigation Swatches */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeFamilies.map((fam) => (
            <button
              key={fam}
              onClick={() => onSelectColorFamily(fam)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#201D1A] hover:bg-[#2A2622] border border-[#36322C] text-[11px] text-[#EDE8E1] transition-all"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: FAMILY_CONFIG[fam].sampleHex }}
              />
              <span>{fam}</span>
              <span className="font-mono text-[9px] text-[#8F8982]">
                ({grouped[fam]?.length || 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sections by Color Family */}
      {activeFamilies.map((fam) => {
        const familyPhotos = grouped[fam] || [];
        const config = FAMILY_CONFIG[fam];

        return (
          <section key={fam} id={`color-section-${fam}`} className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-[#282522] pb-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                  style={{ backgroundColor: config.sampleHex }}
                />
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#EDE8E1] capitalize">
                    {config.title}
                  </h3>
                  <p className="text-xs text-[#8F8982]">{config.subtitle}</p>
                </div>
              </div>

              <span className="font-mono text-xs text-[#A89F91] bg-[#1E1C1A] px-2.5 py-1 rounded-md border border-[#2F2C28]">
                {familyPhotos.length} {familyPhotos.length === 1 ? 'Photograph' : 'Photographs'}
              </span>
            </div>

            {/* Photos in this chromatic family */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {familyPhotos.map((photo) => (
                <div
                  key={photo.id}
                  id={`chromatic-card-${photo.id}`}
                  onClick={() => onSelectPhoto(photo)}
                  className="group bg-[#171514] border border-[#282522] hover:border-[#B8976C]/60 rounded-xl overflow-hidden p-3 transition-all hover:shadow-xl cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-black mb-3">
                    <img
                      src={photo.src}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => onToggleFavorite(photo.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black text-[#EDE8E1] transition-colors z-10"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          photo.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-[#8F8982]'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#EDE8E1] truncate group-hover:text-[#B8976C] transition-colors">
                      {photo.title}
                    </h4>
                    <p className="text-[11px] font-mono text-[#8F8982] truncate mt-0.5">
                      {photo.exif.camera || photo.exif.location || 'Archival Study'}
                    </p>
                  </div>

                  {/* Palette Swatch Ribbon */}
                  <div className="mt-3 pt-2 border-t border-[#24211E] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {photo.palette.map((swatch, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-sm border border-black/30"
                          style={{ backgroundColor: swatch.hex }}
                          title={`${swatch.name}: ${swatch.hex}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-[#6E6862]">
                      {photo.palette[0]?.hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
