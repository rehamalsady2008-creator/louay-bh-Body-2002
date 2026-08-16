/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Download, Upload, ShieldCheck, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onRestoreSettings: (newSettings: AppSettings) => void;
}

export default function BackupModal({ isOpen, onClose, settings, onRestoreSettings }: BackupModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEn = settings.language === 'en';

  if (!isOpen) return null;

  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'Noor Al-Islam App',
        version: '2.5.0',
        exportedAt: new Date().toISOString(),
        settings,
        khatma: {
          currentPage: localStorage.getItem('khatma_current_page') || '0',
          targetPagesPerDay: localStorage.getItem('khatma_target_pages_per_day') || '20',
          history: JSON.parse(localStorage.getItem('khatma_history') || '[]')
        },
        tasbihCounts: JSON.parse(localStorage.getItem('tasbih_counts') || '{}')
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `noor_al_islam_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export backup failed:', e);
      alert(isEn ? 'Export failed. Please try again.' : 'تعذر تصدير النسخة الاحتياطية. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || !parsed.app) {
          alert(isEn ? 'Invalid backup file format.' : 'ملف النسخة الاحتياطية غير صالح.');
          return;
        }

        if (parsed.settings) {
          onRestoreSettings(parsed.settings);
        }
        if (parsed.favorites) {
          localStorage.setItem('noor_favorites', JSON.stringify(parsed.favorites));
        }
        if (parsed.khatma) {
          if (parsed.khatma.currentPage) localStorage.setItem('khatma_current_page', parsed.khatma.currentPage);
          if (parsed.khatma.targetPagesPerDay) localStorage.setItem('khatma_target_pages_per_day', parsed.khatma.targetPagesPerDay);
          if (parsed.khatma.history) localStorage.setItem('khatma_history', JSON.stringify(parsed.khatma.history));
        }
        if (parsed.tasbihCounts) {
          localStorage.setItem('tasbih_counts', JSON.stringify(parsed.tasbihCounts));
        }

        alert(isEn ? 'Backup restored successfully!' : 'تم استعادة كافة البيانات والنسخة الاحتياطية بنجاح!');
        onClose();
      } catch (err) {
        console.error('Import backup failed:', err);
        alert(isEn ? 'Failed to parse backup file.' : 'تعذر قراءة ملف النسخة الاحتياطية.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-500/20 bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEn ? 'Settings & Data Backup' : 'النسخة الاحتياطية للإعدادات'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEn ? 'Save or restore your personal settings' : 'حفظ واستعادة الإعدادات والمفضلة والختمة'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-800/50 border border-emerald-500/10 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              {isEn
                ? 'Export a JSON backup of your settings, location choices, favorites, reading progress, and tasbih counts to restore on any new device.'
                : 'تتيح لك النسخة الاحتياطية حفظ تفضيلاتك ومفضلتك وختمة القرآن وأذكارك كملف آمن يمكنك استعادته عند تغيير هاتفك أو متصفحك.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/30 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              {isEn ? 'Export Backup' : 'تصدير نسخة'}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-emerald-500/30 rounded-xl font-bold text-sm transition active:scale-95"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              {isEn ? 'Restore Backup' : 'استعادة نسخة'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
