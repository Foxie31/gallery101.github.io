import React, { useState } from 'react';
import { Collection } from '../types';
import { X, FolderPlus, Check } from 'lucide-react';

interface CollectionModalProps {
  onClose: () => void;
  onCreateCollection: (col: Collection) => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  onClose,
  onCreateCollection,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [curatorNote, setCuratorNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      curatorNote: curatorNote.trim() || undefined,
      createdAt: Date.now(),
    };

    onCreateCollection(newCol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6">
      <div 
        id="collection-modal-dialog"
        className="bg-[#161413] border border-[#2E2B27] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282522] bg-[#141211]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#B8976C]/10 text-[#B8976C] border border-[#B8976C]/20">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#EDE8E1]">
                New Archival Collection
              </h2>
              <p className="text-xs text-[#8F8982]">Curate a themed exhibition or album</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8F8982] hover:text-[#EDE8E1] hover:bg-[#221F1C] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#8F8982] mb-1">
              Collection Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nordic Winter 35mm, Tokyo Neon, Monochrome Forms"
              className="w-full bg-[#1C1A18] border border-[#2F2B26] focus:border-[#B8976C] text-[#EDE8E1] text-xs rounded-lg px-3 py-2 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#8F8982] mb-1">
              Curatorial Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Theme, aesthetic focus, or chronological scope..."
              className="w-full bg-[#1C1A18] border border-[#2F2B26] focus:border-[#B8976C] text-[#EDE8E1] text-xs rounded-lg px-3 py-2 outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-[#8F8982] mb-1">
              Curator's Inscription / Film Note
            </label>
            <input
              type="text"
              value={curatorNote}
              onChange={(e) => setCuratorNote(e.target.value)}
              placeholder="e.g. Kodak Tri-X 400 pushed 1 stop"
              className="w-full bg-[#1C1A18] border border-[#2F2B26] focus:border-[#B8976C] text-[#EDE8E1] text-xs rounded-lg px-3 py-2 outline-none transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-[#282522] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8F8982] hover:text-[#EDE8E1] transition-colors"
            >
              Cancel
            </button>
            <button
              id="create-collection-submit-btn"
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg bg-[#B8976C] hover:bg-[#C9A97E] text-[#121110] font-medium text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Collection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
