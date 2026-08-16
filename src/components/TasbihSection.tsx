/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Plus, 
  Trash2, 
  Sparkles, 
  ChevronDown, 
  Check, 
  BarChart2, 
  Award, 
  Calendar,
  X,
  Target,
  Flame
} from 'lucide-react';

interface TasbihSectionProps {
  soundEnabled: boolean;
  isEn?: boolean;
}

interface DhikrItem {
  id: string;
  text: string;
  virtue: string;
  target: number | 'open';
}

interface DailyHistory {
  [dateKey: string]: number;
}

const DEFAULT_ADHKAR_LIST: DhikrItem[] = [
  { id: '1', text: 'سُبْحَانَ اللَّهِ', virtue: 'غراس الجنة وتمحو الخطايا', target: 33 },
  { id: '2', text: 'الْحَمْدُ لِلَّهِ', virtue: 'تملأ الميزان', target: 33 },
  { id: '3', text: 'اللَّهُ أَكْبَرُ', virtue: 'أحب الكلام إلى الله', target: 34 },
  { id: '4', text: 'لَا إِلَهَ إِلَّا اللَّهُ', virtue: 'أفضل الذكر وخير ما قال النبيون', target: 100 },
  { id: '5', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', virtue: 'مغفرة للذنوب وتفريج للهموم', target: 100 },
  { id: '6', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', virtue: 'من صلى علي صلاة صلى الله عليه بها عشراً', target: 10 },
  { id: '7', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', virtue: 'كنز من كنوز الجنة', target: 33 },
  { id: '8', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ', virtue: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان', target: 100 },
];

const getTodayKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Global AudioContext singleton to prevent stalling CPU/Audio thread on rapid taps
let globalAudioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

export default function TasbihSection({ soundEnabled, isEn = false }: TasbihSectionProps) {
  // Tab state: 'tasbih' (السبحة الإلكترونية) or 'stats' (سجل الورد والإحصائيات)
  const [activeSubTab, setActiveSubTab] = useState<'tasbih' | 'stats'>('tasbih');

  // Adhkar List state (stored in localStorage)
  const [adhkarList, setAdhkarList] = useState<DhikrItem[]>(() => {
    const saved = localStorage.getItem('noor_adhkar_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_ADHKAR_LIST;
  });

  // Selected Dhikr
  const [selectedAdhkar, setSelectedAdhkar] = useState<DhikrItem>(() => {
    const saved = localStorage.getItem('noor_selected_adhkar');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_ADHKAR_LIST[0];
  });

  // Target count: 33, 99, 100, or 'open'
  const [targetCount, setTargetCount] = useState<number | 'open'>(() => {
    const saved = localStorage.getItem('noor_tasbih_target');
    if (saved) {
      return saved === 'open' ? 'open' : Number(saved);
    }
    return selectedAdhkar.target;
  });

  // Counter states
  const [tasbihCount, setTasbihCount] = useState<number>(0);
  const [completedCycles, setCompletedCycles] = useState<number>(() => {
    return Number(localStorage.getItem('noor_completed_cycles') || '0');
  });

  // Modals
  const [isAdhkarModalOpen, setIsAdhkarModalOpen] = useState<boolean>(false);
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [customVirtue, setCustomVirtue] = useState<string>('');
  const [customTarget, setCustomTarget] = useState<number | 'open'>(33);
  const [showCelebrate, setShowCelebrate] = useState<boolean>(false);

  // Daily and All-time stats
  const [dailyHistory, setDailyHistory] = useState<DailyHistory>(() => {
    const stored = localStorage.getItem('tasbih_daily_history');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    const mock: DailyHistory = {};
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const temp = new Date();
      temp.setDate(d.getDate() - i);
      const year = temp.getFullYear();
      const month = String(temp.getMonth() + 1).padStart(2, '0');
      const day = String(temp.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      mock[key] = i === 0 ? 10 : Math.floor(Math.random() * 80) + 33;
    }
    return mock;
  });

  const [totalCount, setTotalCount] = useState<number>(() => {
    return Number(localStorage.getItem('tasbih_total_count') || '10');
  });

  const todayKey = getTodayKey();
  const totalToday = dailyHistory[todayKey] || 0;

  // Debounced storage sync
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastVibrateRef = useRef<number>(0);

  const syncStorageDebounced = useCallback((newTotal: number, newHistory: DailyHistory, newCycles: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('tasbih_total_count', newTotal.toString());
      localStorage.setItem('tasbih_daily_history', JSON.stringify(newHistory));
      localStorage.setItem('noor_completed_cycles', newCycles.toString());
    }, 400);
  }, []);

  // Save selected dhikr & target
  useEffect(() => {
    localStorage.setItem('noor_selected_adhkar', JSON.stringify(selectedAdhkar));
  }, [selectedAdhkar]);

  useEffect(() => {
    localStorage.setItem('noor_tasbih_target', String(targetCount));
  }, [targetCount]);

  useEffect(() => {
    localStorage.setItem('noor_adhkar_list', JSON.stringify(adhkarList));
  }, [adhkarList]);

  // Audio click sound
  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {}
  }, [soundEnabled]);

  // Celebration sound on cycle completion
  const playCompleteSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.07);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime + index * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + index * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + index * 0.07);
        osc.stop(audioCtx.currentTime + index * 0.07 + 0.22);
      });
    } catch (e) {}
  }, [soundEnabled]);

  // Handle Tasbih Tap
  const handleTasbihClick = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      if (e.type === 'touchstart' || e.type === 'pointerdown') {
        if (e.cancelable) e.preventDefault();
      }
    }

    playClickSound();

    // Haptic vibration
    const now = Date.now();
    if (navigator.vibrate && now - lastVibrateRef.current > 30) {
      lastVibrateRef.current = now;
      try { navigator.vibrate(25); } catch (e) {}
    }

    const nextCount = tasbihCount + 1;
    let newCycles = completedCycles;

    if (targetCount !== 'open' && nextCount >= Number(targetCount)) {
      newCycles = completedCycles + 1;
      setCompletedCycles(newCycles);
      setTasbihCount(0);
      playCompleteSound();
      setShowCelebrate(true);
      if (navigator.vibrate) {
        try { navigator.vibrate([80, 40, 80]); } catch (e) {}
      }
      setTimeout(() => setShowCelebrate(false), 2000);
    } else {
      setTasbihCount(nextCount);
    }

    const key = getTodayKey();
    const newTotal = totalCount + 1;
    setTotalCount(newTotal);

    setDailyHistory(prev => {
      const updated = {
        ...prev,
        [key]: (prev[key] || 0) + 1
      };
      syncStorageDebounced(newTotal, updated, newCycles);
      return updated;
    });
  }, [tasbihCount, targetCount, completedCycles, totalCount, playClickSound, playCompleteSound, syncStorageDebounced]);

  // Reset current counter
  const handleReset = () => {
    setTasbihCount(0);
    playClickSound();
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) {}
    }
  };

  // Add custom dhikr
  const handleAddCustomDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const newItem: DhikrItem = {
      id: Date.now().toString(),
      text: customText.trim(),
      virtue: customVirtue.trim() || 'ذكر مبارك وأجر عظيم',
      target: customTarget
    };

    setAdhkarList(prev => [...prev, newItem]);
    setSelectedAdhkar(newItem);
    setTargetCount(newItem.target);
    setTasbihCount(0);
    setCustomText('');
    setCustomVirtue('');
    setIsAddCustomModalOpen(false);
    setIsAdhkarModalOpen(false);
  };

  // Delete custom dhikr
  const handleDeleteDhikr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAdhkarList(prev => prev.filter(item => item.id !== id));
    if (selectedAdhkar.id === id) {
      setSelectedAdhkar(DEFAULT_ADHKAR_LIST[0]);
      setTargetCount(DEFAULT_ADHKAR_LIST[0].target);
      setTasbihCount(0);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 font-sans select-none text-right" dir="rtl">
      
      {/* 1. Top Segmented Navigation (السبحة الإلكترونية | سجل الورد والإحصائيات) */}
      <div className="flex items-center justify-between p-1.5 bg-[#121620] border border-gray-800 rounded-2xl shadow-md">
        
        {/* Tab 1: السبحة الإلكترونية (Right / First tab) */}
        <button
          id="tasbih-tab-main"
          type="button"
          onClick={() => setActiveSubTab('tasbih')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'tasbih'
              ? 'bg-amber-500 text-gray-950 shadow-md scale-[1.02]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-base">📿</span>
          <span>{isEn ? 'Electronic Tasbih' : 'السبحة الإلكترونية'}</span>
        </button>

        {/* Tab 2: سجل الورد والإحصائيات (Left / Second tab) */}
        <button
          id="tasbih-tab-stats"
          type="button"
          onClick={() => setActiveSubTab('stats')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'stats'
              ? 'bg-amber-500 text-gray-950 shadow-md scale-[1.02]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart2 size={16} />
          <span>{isEn ? 'Stats & Daily Log' : 'سجل الورد والإحصائيات'}</span>
        </button>

      </div>

      {activeSubTab === 'tasbih' ? (
        <div className="space-y-4">
          
          {/* 2. Selected Dhikr Card (Top Card with dropdown chevron) */}
          <div 
            id="open-adhkar-modal-card"
            onClick={() => setIsAdhkarModalOpen(true)}
            className="p-4 sm:p-5 rounded-3xl bg-[#121620] border border-gray-800 shadow-md cursor-pointer hover:border-amber-500/40 transition relative group"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                الذكر المختار • الهدف: {targetCount === 'open' ? 'مفتوح' : targetCount}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-800/70 group-hover:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white transition">
                <ChevronDown size={18} />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white text-center my-2.5 font-serif leading-relaxed">
              {selectedAdhkar.text}
            </h3>

            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
              <Sparkles size={13} className="text-amber-400 shrink-0" />
              <span>{selectedAdhkar.virtue}</span>
            </p>
          </div>

          {/* 3. Center Giant Amber Circular Counter */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121620] border border-gray-800 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
            
            {/* Interactive Round Button */}
            <div className="my-2 relative flex items-center justify-center">
              
              {/* Outer decorative soft glow ring */}
              <div className="absolute -inset-2 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

              <button 
                id="tasbih-main-tap-button"
                onPointerDown={handleTasbihClick}
                onClick={(e) => {
                  if (e.detail !== 0) return;
                  handleTasbihClick(e);
                }}
                className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-gray-950 font-bold shadow-2xl shadow-amber-500/30 flex flex-col items-center justify-center border-4 border-amber-300/40 active:scale-95 transition-transform duration-100 cursor-pointer select-none touch-manipulation focus:outline-none"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Count Display */}
                <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-gray-950 drop-shadow-sm select-none">
                  {tasbihCount}
                </span>

                {/* Subtitle */}
                <span className="text-xs sm:text-sm font-bold text-amber-950 mt-1 select-none">
                  اضغط للتسبيح
                </span>

                {/* Progress badge / Pill (e.g. 33 / 0) */}
                <div className="mt-2.5 px-3 py-1 rounded-full bg-black/20 text-gray-950 text-xs font-bold border border-black/10 select-none">
                  {targetCount === 'open' ? 'مفتوح' : `${targetCount} / ${tasbihCount}`}
                </div>
              </button>

              {/* Celebrate popup overlay */}
              <AnimatePresence>
                {showCelebrate && (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute inset-0 bg-[#0e121a]/95 rounded-full flex flex-col items-center justify-center p-4 text-center z-20 pointer-events-none border-2 border-amber-500"
                  >
                    <Sparkles className="w-10 h-10 text-amber-400 animate-bounce mb-2" />
                    <h4 className="text-base font-bold text-amber-300">تقبل الله طاعتكم ✨</h4>
                    <p className="text-xs text-gray-300 mt-1">اكتملت دورة التسبيح ({targetCount})</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Target Options & Reset Button Row */}
            <div className="w-full flex items-center justify-between gap-2 mt-6">
              
              {/* Reset Button (Left / Start) */}
              <button 
                id="tasbih-reset-counter-btn"
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gray-900/90 hover:bg-gray-800 text-xs font-bold text-gray-300 border border-gray-800 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <RotateCcw size={15} className="text-amber-400" />
                <span>تصفير</span>
              </button>

              {/* Target Pills: [33, 99, 100, مفتوح] */}
              <div className="flex items-center p-1 bg-gray-900/90 border border-gray-800 rounded-2xl gap-1">
                {[33, 99, 100, 'open'].map((val) => {
                  const label = val === 'open' ? 'مفتوح' : val;
                  const isSelected = targetCount === val;
                  return (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => {
                        setTargetCount(val as any);
                        playClickSound();
                      }}
                      className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

            </div>

          </div>

          {/* 4. Bottom Stats (Completed Cycles & Total Today) */}
          <div className="grid grid-cols-2 gap-3 text-center">
            
            {/* Right Box: الدورات المكتملة */}
            <div className="p-4 rounded-3xl bg-[#121620] border border-gray-800 shadow-sm flex flex-col items-center justify-center">
              <span className="text-xs text-gray-400 block mb-1 font-medium">الدورات المكتملة</span>
              <span className="text-3xl font-black text-amber-400 font-mono">{completedCycles}</span>
            </div>

            {/* Left Box: إجمالي تسبيحات اليوم */}
            <div className="p-4 rounded-3xl bg-[#121620] border border-gray-800 shadow-sm flex flex-col items-center justify-center">
              <span className="text-xs text-gray-400 block mb-1 font-medium">إجمالي تسبيحات اليوم</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">{totalToday}</span>
            </div>

          </div>

        </div>
      ) : (
        /* 5. Tab: سجل الورد والإحصائيات */
        <div className="space-y-4">
          
          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3.5 bg-[#121620] border border-gray-800 rounded-2xl">
              <span className="text-[11px] text-gray-400 block mb-1">تسبيحات اليوم</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{totalToday}</span>
            </div>
            <div className="p-3.5 bg-[#121620] border border-gray-800 rounded-2xl">
              <span className="text-[11px] text-gray-400 block mb-1">الدورات المكتملة</span>
              <span className="text-xl font-black text-amber-400 font-mono">{completedCycles}</span>
            </div>
            <div className="p-3.5 bg-[#121620] border border-gray-800 rounded-2xl">
              <span className="text-[11px] text-gray-400 block mb-1">المجموع الكلي</span>
              <span className="text-xl font-black text-white font-mono">{totalCount}</span>
            </div>
          </div>

          {/* 7 Days History Bar Chart */}
          <div className="p-4 rounded-3xl bg-[#121620] border border-gray-800 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-gray-200">سجل الأيام السبعة الماضية</h4>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">آخر 7 أيام</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
              {Object.keys(dailyHistory).slice(-7).map((dateKey) => {
                const countVal = dailyHistory[dateKey] || 0;
                const maxVal = Math.max(...Object.values(dailyHistory), 100);
                const heightPct = Math.max(8, Math.min(100, (countVal / maxVal) * 100));
                const isCurrentToday = dateKey === todayKey;

                return (
                  <div key={dateKey} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono text-gray-400">{countVal}</span>
                    <div className="w-full max-w-[28px] bg-gray-800 rounded-t-lg overflow-hidden flex items-end h-full">
                      <div 
                        className={`w-full transition-all duration-300 rounded-t-lg ${
                          isCurrentToday ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={`text-[10px] truncate max-w-[36px] ${isCurrentToday ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                      {isCurrentToday ? 'اليوم' : dateKey.slice(8)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset All History Option */}
          <div className="p-4 rounded-3xl bg-[#121620] border border-gray-800 flex items-center justify-between">
            <div>
              <h5 className="text-xs font-bold text-gray-200">تصفير سجل التسبيح الكلي</h5>
              <p className="text-[10px] text-gray-400">إعادة ضبط العداد الإجمالي والدورات</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('هل تريد بالتأكيد تصفير كافة إحصائيات التسبيح؟')) {
                  setTotalCount(0);
                  setCompletedCycles(0);
                  setTasbihCount(0);
                  const cleared: DailyHistory = { [todayKey]: 0 };
                  setDailyHistory(cleared);
                  localStorage.setItem('tasbih_total_count', '0');
                  localStorage.setItem('noor_completed_cycles', '0');
                  localStorage.setItem('tasbih_daily_history', JSON.stringify(cleared));
                }
              }}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              تصفير الكل
            </button>
          </div>

        </div>
      )}

      {/* 6. قائمة الأذكار والتسبيحات Modal (Matching IMG_0331.jpeg exactly) */}
      <AnimatePresence>
        {isAdhkarModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#11141d] border border-gray-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
            >
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">
                    📿
                  </div>
                  <h3 className="font-bold text-white text-base">قائمة الأذكار والتسبيحات</h3>
                </div>

                <button 
                  type="button"
                  onClick={() => setIsAdhkarModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Adhkar List (Scrollable) */}
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pl-1">
                {adhkarList.map((item) => {
                  const isSelected = selectedAdhkar.text === item.text;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => {
                        setSelectedAdhkar(item);
                        setTargetCount(item.target);
                        setTasbihCount(0);
                        setIsAdhkarModalOpen(false);
                        playClickSound();
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex justify-between items-center gap-3 ${
                        isSelected 
                          ? 'bg-[#1a1712] border-amber-500 text-amber-300 shadow-md' 
                          : 'bg-[#151922] border-gray-800/80 text-gray-200 hover:bg-[#191f2b] hover:border-gray-700'
                      }`}
                    >
                      {/* Dhikr Target Badge and Checkmark (Left side) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center text-xs font-bold">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-xl font-bold font-mono ${
                          isSelected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {item.target === 'open' ? 'مفتوح' : item.target}
                        </span>

                        {/* Delete button if custom */}
                        {Number(item.id) > 10 && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDhikr(item.id, e)}
                            className="p-1 text-gray-500 hover:text-rose-400"
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Dhikr text and virtue (Right side) */}
                      <div className="flex-1 text-right">
                        <p className={`font-bold text-sm sm:text-base leading-snug font-serif ${
                          isSelected ? 'text-amber-300' : 'text-white'
                        }`}>
                          {item.text}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                          {item.virtue}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Bottom Button: + إضافة ذكر مخصص */}
              <div className="pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomModalOpen(true)}
                  className="w-full py-3 bg-[#181d27] hover:bg-[#202735] text-amber-400 border border-gray-700/70 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Plus size={16} />
                  <span>إضافة ذكر مخصص</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Modal to Add Custom Dhikr */}
      <AnimatePresence>
        {isAddCustomModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#11141d] border border-gray-800 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl text-right"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <h4 className="font-bold text-white text-sm sm:text-base">إضافة ذكر وتسبيح مخصص</h4>
                <button 
                  type="button"
                  onClick={() => setIsAddCustomModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddCustomDhikr} className="space-y-3.5">
                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-bold">نص الذكر المبارك:</label>
                  <input
                    type="text"
                    required
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="مثال: لا إله إلا الله الملك الحق المبين"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-bold">الفضل أو المعنى (اختياري):</label>
                  <input
                    type="text"
                    value={customVirtue}
                    onChange={(e) => setCustomVirtue(e.target.value)}
                    placeholder="مثال: أمان من الفقر وأنس في القبر"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1 font-bold">الهدف الافتراضي:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[33, 99, 100, 'open'].map((val) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setCustomTarget(val as any)}
                        className={`py-2 rounded-xl text-xs font-bold transition ${
                          customTarget === val
                            ? 'bg-amber-500 text-gray-950 font-black'
                            : 'bg-gray-900 text-gray-400 border border-gray-800'
                        }`}
                      >
                        {val === 'open' ? 'مفتوح' : val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    حفظ وإضافة الذكر
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddCustomModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
