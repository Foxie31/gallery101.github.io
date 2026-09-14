import { ColorSwatch } from '../types';

/**
 * Classifies an RGB color into a distinctive curated color family.
 */
function classifyColorFamily(r: number, g: number, b: number): ColorSwatch['family'] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  // Low saturation = monochrome (greyscale, noir, white, charcoal)
  if (diff < 24) {
    return 'monochrome';
  }

  // Calculate approximate hue in degrees (0 - 360)
  let h = 0;
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  // Calculate lightness
  const l = (max + min) / 2 / 255;

  if (l < 0.18 || l > 0.88) {
    return 'monochrome';
  }

  if (h >= 340 || h < 20) {
    return 'crimson';
  } else if (h >= 20 && h < 50) {
    return l < 0.45 ? 'earth' : 'amber';
  } else if (h >= 50 && h < 90) {
    return 'warm';
  } else if (h >= 90 && h < 170) {
    return 'sage';
  } else if (h >= 170 && h < 260) {
    return 'azure';
  } else if (h >= 260 && h < 340) {
    return 'crimson';
  }

  return 'earth';
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getColorName(family: ColorSwatch['family'], hex: string): string {
  const names: Record<ColorSwatch['family'], string[]> = {
    amber: ['Warm Amber', 'Honey Ochre', 'Golden Hour', 'Terracotta', 'Raw Sienna'],
    sage: ['Olive Sage', 'Muted Moss', 'Eucalyptus', 'Forest Slate', 'Verdant Mint'],
    azure: ['Deep Indigo', 'Cobalt Cyan', 'Aegean Mist', 'Cerulean Dusk', 'Pacific Ink'],
    crimson: ['Cinnabar', 'Burgundy Velvet', 'Rose Oxide', 'Crimson Flame', 'Mulberry'],
    monochrome: ['Charcoal Noir', 'Titanium Slate', 'Silver Grain', 'Pure Obsidian', 'Alabaster'],
    earth: ['Raw Umber', 'Burnt Clay', 'Sepia Dune', 'Espresso Soil', 'Weathered Cedar'],
    warm: ['Parchment Glow', 'Saffron Ray', 'Champagne', 'Warm Ochre', 'Sunlit Linen'],
  };
  const list = names[family] || names.monochrome;
  // Deterministic pick based on hex sum
  let sum = 0;
  for (let i = 1; i < hex.length; i++) {
    sum += hex.charCodeAt(i);
  }
  return list[sum % list.length];
}

/**
 * Extracts 4-5 dominant colors from an image URL / data URL using canvas downsampling.
 */
export async function extractPaletteFromImage(imageSrc: string): Promise<{
  palette: ColorSwatch[];
  dominantFamily: ColorSwatch['family'];
  aspectRatio: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 400;
        const height = img.naturalHeight || img.height || 300;
        const aspectRatio = width / Math.max(1, height);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas context unavailable');
        }

        // Downsample to 48x48 for lightning speed and smooth color clustering
        const sampleSize = 48;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        const colorBuckets: Map<string, { r: number; g: number; b: number; count: number }> = new Map();

        for (let i = 0; i < imgData.length; i += 16) { // sample every 4th pixel
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // skip transparent

          // Quantize to 32 steps per channel
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count += 1;
          } else {
            colorBuckets.set(key, { r, g, b, count: 1 });
          }
        }

        // Sort by frequency
        const sortedBuckets = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

        // Pick 4 distinct colors
        const picked: ColorSwatch[] = [];
        const usedColors: [number, number, number][] = [];

        for (const bucket of sortedBuckets) {
          if (picked.length >= 4) break;

          // Check color distance against already picked to ensure variety
          const isDistinct = usedColors.every(([ur, ug, ub]) => {
            const dr = bucket.r - ur;
            const dg = bucket.g - ug;
            const db = bucket.b - ub;
            const distance = Math.sqrt(dr * dr + dg * dg + db * db);
            return distance > 45;
          });

          if (isDistinct || picked.length === 0) {
            const hex = rgbToHex(bucket.r, bucket.g, bucket.b);
            const family = classifyColorFamily(bucket.r, bucket.g, bucket.b);
            const name = getColorName(family, hex);
            picked.push({
              hex,
              rgb: [bucket.r, bucket.g, bucket.b],
              name,
              family,
            });
            usedColors.push([bucket.r, bucket.g, bucket.b]);
          }
        }

        // Fallback if empty
        if (picked.length === 0) {
          picked.push({
            hex: '#2B2927',
            rgb: [43, 41, 39],
            name: 'Charcoal Noir',
            family: 'monochrome',
          });
        }

        const dominantFamily = picked[0].family;
        resolve({ palette: picked, dominantFamily, aspectRatio });
      } catch {
        resolve({
          palette: [
            { hex: '#2A2825', rgb: [42, 40, 37], name: 'Charcoal Noir', family: 'monochrome' },
            { hex: '#A89F91', rgb: [168, 159, 145], name: 'Parchment Glow', family: 'warm' },
          ],
          dominantFamily: 'monochrome',
          aspectRatio: 1.5,
        });
      }
    };

    img.onerror = () => {
      resolve({
        palette: [
          { hex: '#2A2825', rgb: [42, 40, 37], name: 'Charcoal Noir', family: 'monochrome' },
        ],
        dominantFamily: 'monochrome',
        aspectRatio: 1.5,
      });
    };

    img.src = imageSrc;
  });
}
