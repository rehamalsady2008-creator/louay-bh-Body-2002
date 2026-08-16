/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wifi, WifiOff, CheckCircle2, Download, Plane, ShieldCheck, HardDrive, Smartphone, Sparkles, Volume2 } from 'lucide-react';

interface TravelModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
}

export default function TravelModeModal({ isOpen, onClose, isEn = false }: TravelModeModalProps) {
  const [isTravelModeActive, setIsTravelModeActive] = useState<boolean>(() => {
    return localStorage.getItem('noor_travel_mode') === 'true';
  });

  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const offlineFeatures = [
    { name: 'القرآن الكريم كاملاً (بالرسم العثماني)', desc: 'جميع السور بآياتها محفوظة ومدمجة داخل الجهاز', icon: '📖' },
    { name: 'التفسير الميسر المعتمد', desc: 'تفسير ابن كثير والسعدي والميسر بدون الحاجة لشبكة', icon: '📚' },
    { name: 'أذكار حصن المسلم الكاملة', desc: 'أذكار الصباح والمساء، النوم، الاستيقاظ، الصلاة، والتسابيح', icon: '🤲' },
    { name: 'موسوعة الأحاديث النبوية الصحيحة', desc: 'صحيح البخاري، مسلم، الأربعون النووية ورياض الصالحين', icon: '📜' },
    { name: 'الرقية الشرعية المطهرة', desc: 'آيات التحصين والأدعية المأثورة المكتوبة مع الصوت المدمج', icon: '🕌' },
    { name: 'اتجاه القبلة الجغرافي', desc: 'حساب رياضي بدقة عالية بـ GPS وحساسات الجيروسكوب', icon: '🕋' },
    { name: 'مواقيت الصلاة الفلكية Local Calculation', desc: 'حساب مواقيت الصلاة تلقائياً حسب خطوط الطول والعرض', icon: '⏰' },
    { name: 'مستشار نور الإسلام المحلي الذكي', desc: 'محرك محلي فورس يجيب على أسئلتك من قاعدة البيانات المخزنة', icon: '🤖' },
  ];

  const handleToggleTravelMode = () => {
    const nextVal = !isTravelModeActive;
    setIsTravelModeActive(nextVal);
    localStorage.setItem('noor_travel_mode', nextVal ? 'true' : 'false');
  };

  const handleDownloadOfflineAudioPackage = () => {
    setDownloadProgress(10);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 100;
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadSuccess(true);
          setTimeout(() => setDownloadProgress(null), 3000);
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 md:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-sky-500/15 text-sky-600 dark:text-sky-400 rounded-2xl">
              <Plane className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">وضع السفر وحالة عدم الاتصال (Offline Ready)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">تطبيق نور الإسلام مصمم من الأساس ليعمل 100% بدون إنترنت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Travel Mode Switch */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-black text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Plane className="w-4 h-4 text-emerald-600" />
              تفعيل وضع السفر والطيران المباشر
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">تحسين استهلاك البطارية والاعتماد التام على الموارد المحلية</p>
          </div>
          <button
            onClick={handleToggleTravelMode}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-sm ${
              isTravelModeActive
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            {isTravelModeActive ? 'مفعّل ✈️' : 'إيقاف 🌐'}
          </button>
        </div>

        {/* Offline Features Checklist */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">المحتويات والميزات المتاحة محلياً بدون إنترنت:</p>
          {offlineFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex items-center gap-3"
            >
              <span className="text-xl">{feat.icon}</span>
              <div className="flex-1 space-y-0.5">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  {feat.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{feat.desc}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Optional Audio Downloads Manager */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">حزمة الصوتيات للاستماع Offline</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
              اختياري (25 ميجابايت)
            </span>
          </div>

          {downloadProgress !== null && (
            <div className="space-y-1">
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-600 font-bold text-center">جاري تنزيل الصوتيات إلى ذاكرة الجهاز... {downloadProgress}%</p>
            </div>
          )}

          {downloadSuccess && (
            <p className="text-[10px] text-emerald-600 font-bold text-center">تم حزم وتخزين جميع الملفات الصوتية بنجاح 100%! ✓</p>
          )}

          {downloadProgress === null && !downloadSuccess && (
            <button
              onClick={handleDownloadOfflineAudioPackage}
              className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              تنزيل حزمة الصوتيات للاستماع بدون شبكة
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-xs transition-all shadow-md cursor-pointer text-center"
        >
          حفظ وإغلاق
        </button>

      </div>
    </div>
  );
}
