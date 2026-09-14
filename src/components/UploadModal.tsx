import React, { useState, useRef } from 'react';
import { PhotoItem, Collection } from '../types';
import { extractPaletteFromImage } from '../lib/colorExtractor';
import { X, Upload, Image as ImageIcon, Check, Loader2, Sparkles } from 'lucide-react';

interface UploadModalProps {
  collections: Collection[];
  activeCollectionId: string | null;
  onClose: () => void;
  onPhotosUploaded: (photos: PhotoItem[]) => void;
}

interface PendingFile {
  file: File;
  previewUrl: string;
  title: string;
  tags: string;
  camera: string;
  location: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  collections,
  activeCollectionId,
  onClose,
  onPhotosUploaded,
}) => {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [targetCollectionId, setTargetCollectionId] = useState<string>(activeCollectionId || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPending: PendingFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const previewUrl = URL.createObjectURL(file);
      // derive clean title from filename
      const rawName = file.name.replace(/\.[^/.]+$/, '');
      const cleanTitle = rawName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      newPending.push({
        file,
        previewUrl,
        title: cleanTitle,
        tags: 'Personal Archive',
        camera: '',
        location: '',
      });
    }

    setPendingFiles((prev) => [...prev, ...newPending]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePending = (index: number) => {
    setPendingFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleStorePhotos = async () => {
    if (pendingFiles.length === 0) return;
    setIsProcessing(true);

    try {
      const createdPhotos: PhotoItem[] = [];

      for (const item of pendingFiles) {
        // Read file as base64 data URL for IndexedDB storage
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(item.file);
        });

        // Algorithmic palette extraction
        const { palette, dominantFamily, aspectRatio } = await extractPaletteFromImage(base64Data);

        const tagsArray = item.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        const currentYear = new Date().getFullYear().toString();

        const newPhoto: PhotoItem = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          title: item.title || 'Untitled Photograph',
          src: base64Data,
          aspectRatio,
          dateAdded: Date.now(),
          dateTaken: new Date().toISOString().split('T')[0],
          collectionId: targetCollectionId || undefined,
          tags: tagsArray.length > 0 ? tagsArray : ['Local Vault'],
          palette,
          dominantFamily,
          exif: {
            camera: item.camera || undefined,
            location: item.location || undefined,
            year: currentYear,
          },
          adjustments: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            warmth: 0,
            sepia: 0,
            grain: 0,
            vignette: 0,
          },
          rating: 4,
          isFavorite: false,
          frameStyle: 'museum-mat',
          fileSize: item.file.size,
        };

        createdPhotos.push(newPhoto);
      }

      onPhotosUploaded(createdPhotos);
      onClose();
    } catch (err) {
      console.error('Failed to store photos:', err);
      alert('An error occurred while saving photos into local storage.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div 
        id="upload-modal-dialog"
        className="bg-[#161413] border border-[#2E2B27] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282522] bg-[#141211]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#B8976C]/10 text-[#B8976C] border border-[#B8976C]/20">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#EDE8E1]">
                Store Photographs in Local Vault
              </h2>
              <p className="text-xs text-[#8F8982]">
                Stored securely on your device using IndexedDB browser storage
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Target Collection Selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1C1A18] p-3.5 rounded-xl border border-[#2B2824]">
            <div>
              <span className="text-xs font-medium text-[#EDE8E1] block">
                Assign to Curatorial Collection
              </span>
              <span className="text-[11px] text-[#8F8982]">
                Group imported photos under a specific archival album
              </span>
            </div>

            <select
              value={targetCollectionId}
              onChange={(e) => setTargetCollectionId(e.target.value)}
              className="bg-[#141211] border border-[#332F2A] focus:border-[#B8976C] text-[#EDE8E1] text-xs rounded-lg px-3 py-1.5 outline-none"
            >
              <option value="">General Archive (No Collection)</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            id="drag-drop-zone"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-[#B8976C] bg-[#B8976C]/5'
                : 'border-[#332F2A] hover:border-[#4D463E] bg-[#141211]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="w-12 h-12 rounded-full bg-[#1F1C1A] text-[#B8976C] border border-[#3A352F] flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-5 h-5 opacity-90" />
            </div>

            <h4 className="font-serif text-base font-semibold text-[#EDE8E1]">
              Drop your photographs here or browse files
            </h4>
            <p className="text-xs text-[#8F8982] mt-1 max-w-sm mx-auto">
              Supports high-resolution JPEG, PNG, WebP, and AVIF. Stored in high fidelity in local storage.
            </p>
          </div>

          {/* Staged Uploads List */}
          {pendingFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-[#8F8982]">
                  Staged Photographs ({pendingFiles.length})
                </span>
                <span className="text-xs text-[#B8976C] flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3" />
                  Auto-palettes will be generated
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {pendingFiles.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 bg-[#181614] border border-[#2B2824] rounded-lg"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded border border-black/50 shrink-0"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const copy = [...pendingFiles];
                          copy[idx].title = e.target.value;
                          setPendingFiles(copy);
                        }}
                        placeholder="Photograph Title"
                        className="bg-[#141211] border border-[#2D2A26] text-xs rounded px-2 py-1 text-[#EDE8E1] outline-none truncate"
                      />

                      <input
                        type="text"
                        value={item.camera}
                        onChange={(e) => {
                          const copy = [...pendingFiles];
                          copy[idx].camera = e.target.value;
                          setPendingFiles(copy);
                        }}
                        placeholder="Camera / Film (optional)"
                        className="bg-[#141211] border border-[#2D2A26] text-xs rounded px-2 py-1 text-[#8F8982] outline-none truncate"
                      />
                    </div>

                    <button
                      onClick={() => removePending(idx)}
                      className="text-[#6E6862] hover:text-red-400 p-1 transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#282522] bg-[#141211] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#8F8982] hover:text-[#EDE8E1] transition-colors"
          >
            Cancel
          </button>

          <button
            id="commit-upload-button"
            onClick={handleStorePhotos}
            disabled={pendingFiles.length === 0 || isProcessing}
            className="px-5 py-2 rounded-lg bg-[#B8976C] hover:bg-[#C9A97E] text-[#121110] font-medium text-xs flex items-center gap-2 shadow transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Palettes & Storing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Store {pendingFiles.length} {pendingFiles.length === 1 ? 'Photo' : 'Photos'} in Vault</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
