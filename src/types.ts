export type ViewMode = 'exhibition' | 'contact-sheet' | 'chromatic' | 'timeline';

export type FrameStyle = 'minimal' | 'museum-mat' | 'walnut-frame' | 'polaroid' | 'slide-mount' | 'noir-border';

export interface ColorSwatch {
  hex: string;
  rgb: [number, number, number];
  name: string;
  family: 'warm' | 'amber' | 'sage' | 'azure' | 'crimson' | 'monochrome' | 'earth';
}

export interface ExifData {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  location?: string;
  year?: string;
  filmStock?: string;
}

export interface PhotoAdjustments {
  brightness: number; // -100 to 100, default 0
  contrast: number;   // -100 to 100, default 0
  saturation: number; // -100 to 100, default 0
  warmth: number;     // -100 to 100, default 0
  sepia: number;      // 0 to 100, default 0
  grain: number;      // 0 to 100, default 0
  vignette: number;   // 0 to 100, default 0
}

export interface PhotoItem {
  id: string;
  title: string;
  src: string;
  thumbnail?: string;
  aspectRatio: number; // width / height
  dateAdded: number; // timestamp
  dateTaken?: string;
  collectionId?: string;
  tags: string[];
  notes?: string;
  palette: ColorSwatch[];
  dominantFamily: ColorSwatch['family'];
  exif: ExifData;
  adjustments: PhotoAdjustments;
  rating: number; // 0 to 5
  isFavorite: boolean;
  frameStyle: FrameStyle;
  fileSize?: number; // in bytes
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverPhotoId?: string;
  createdAt: number;
  curatorNote?: string;
}

export interface StorageStats {
  usedBytes: number;
  formattedSize: string;
  photoCount: number;
  collectionCount: number;
}
