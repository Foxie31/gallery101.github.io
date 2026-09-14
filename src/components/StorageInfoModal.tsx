import React from 'react';
import { StorageStats } from '../types';
import { X, HardDrive, Download, UploadCloud, ShieldCheck, Database, Trash2 } from 'lucide-react';

interface StorageInfoModalProps {
  stats: StorageStats;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onClearAll: () => void;
}

export const StorageInfoModal: React.FC<StorageInfoModalProps> = ({
  stats,
  onClose,
  onExport,
  onImport,
  onClearAll,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6">
      <div 
        id="storage-info-dialog"
        className="bg-[#161413] border border-[#2E2B27] rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282522] bg-[#141211]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#B8976C]/10 text-[#B8976C] border border-[#B8976C]/20">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#EDE8E1]">
                Local Storage Vault Diagnostics
              </h2>
              <p className="text-xs text-[#8F8982]">Private on-device storage & archival backups</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8F8982] hover:text-[#EDE8E1] hover:bg-[#221F1C] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Storage Meter */}
          <div className="bg-[#1C1A18] border border-[#2B2824] p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#A89F91] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#B8976C]" />
                IndexedDB Vault Usage
              </span>
              <span className="font-mono text-[#EDE8E1] font-medium">{stats.formattedSize}</span>
            </div>

            <div className="w-full bg-[#141211] h-2 rounded-full overflow-hidden border border-[#2B2824]">
              <div 
                className="bg-gradient-to-r from-[#B8976C] to-[#E3C69D] h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(8, (stats.usedBytes / (50 * 1024 * 1024)) * 100))}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-[#78716A] font-mono">
              <span>{stats.photoCount} stored photographs</span>
              <span>{stats.collectionCount} curatorial collections</span>
            </div>
          </div>

          {/* Privacy & Durability Note */}
          <div className="flex items-start gap-3 bg-[#1B1917] p-3.5 rounded-xl border border-[#2F2B26] text-xs text-[#A89F91]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-[#EDE8E1] block mb-0.5">100% Client-Side & Private</span>
              Your photographs never leave this device. They are kept safely in your browser's persistent database with unlimited local capacity.
            </div>
          </div>

          {/* Vault Export & Restore Operations */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#8F8982]">
              Vault Archival Operations
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="modal-export-btn"
                onClick={() => {
                  onExport();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#201D1A] hover:bg-[#282420] border border-[#332F2A] text-xs text-[#EDE8E1] transition-all"
              >
                <Download className="w-4 h-4 text-[#B8976C]" />
                <div className="text-left">
                  <span className="font-medium block">Export Vault Backup</span>
                  <span className="text-[10px] text-[#8F8982]">Full JSON archive</span>
                </div>
              </button>

              <button
                id="modal-restore-btn"
                onClick={() => {
                  onImport();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#201D1A] hover:bg-[#282420] border border-[#332F2A] text-xs text-[#EDE8E1] transition-all"
              >
                <UploadCloud className="w-4 h-4 text-[#B8976C]" />
                <div className="text-left">
                  <span className="font-medium block">Restore Backup</span>
                  <span className="text-[10px] text-[#8F8982]">Load JSON archive</span>
                </div>
              </button>
            </div>
          </div>

          {/* Wipe Vault danger */}
          <div className="pt-2 flex justify-between items-center border-t border-[#282522]">
            <span className="text-xs text-[#8F8982]">Need a fresh start?</span>
            <button
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="text-xs text-red-400/80 hover:text-red-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Entire Vault</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
