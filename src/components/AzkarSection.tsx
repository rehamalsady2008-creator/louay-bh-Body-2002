/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Bed, 
  Activity, 
  BookOpen, 
  Shield, 
  Heart, 
  RefreshCw, 
  Award, 
  CheckCircle, 
  RotateCcw, 
  Bell, 
  Clock, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Headphones, 
  Radio, 
  Sparkles,
  Sunrise,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import { azkarData } from '../data/azkar';
import { ZekrItem } from '../types';

interface AzkarSectionProps {
  soundEnabled: boolean;
  isEn?: boolean;
}

interface AzkarReminderItem {
  id: string;
  name: string;
  time: string;
  enabled: boolean;
}

// Real Azkar Reciters (Sheikh Maher Al-Muaiqly & Top Sheikhs)
const REAL_AZKAR_RECITERS = [
  { id: 'maher', name: 'الشيخ ماهر المعيقلي', icon: '🎙️', cdnFolder: 'MaherAlMuaiqly128kbps' },
  { id: 'alafasy', name: 'الشيخ مشاري العفاسي', icon: '🎙️', cdnFolder: 'Alafasy_128kbps' },
  { id: 'sudais', name: 'الشيخ عبد الرحمن السديس', icon: '🎙️', cdnFolder: 'Abdurrahmaan_As-Sudais_192kbps' },
  { id: 'basit', name: 'الشيخ عبد الباسط عبد الصمد', icon: '🎙️', cdnFolder: 'Abdul_Basit_Murattal_192kbps' },
];

export default function AzkarSection({ soundEnabled, isEn = false }: AzkarSectionProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>('morning');
  const [activeDetailCategory, setActiveDetailCategory] = useState<string | null>(null);
  // Local state to keep track of remaining count for items in the selected category
  const [countsState, setCountsState] = useState<{ [key: number]: number }>({});

  // Real Audio Recitation State (Sheikh Maher Al-Muaiqly)
  const [selectedReciter, setSelectedReciter] = useState<string>('maher');
  const [playingZekrId, setPlayingZekrId] = useState<number | null>(null);
  const [isAutoPlayAll, setIsAutoPlayAll] = useState<boolean>(false);
  const [autoPlayIndex, setAutoPlayIndex] = useState<number>(0);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAutoPlayRef = useRef<boolean>(false);
  const autoPlayIndexRef = useRef<number>(0);
  const activeCategoryRef = useRef<any>(null);

  useEffect(() => {
    isAutoPlayRef.current = isAutoPlayAll;
  }, [isAutoPlayAll]);

  useEffect(() => {
    autoPlayIndexRef.current = autoPlayIndex;
  }, [autoPlayIndex]);

  // Clean up audio on unmount or category change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleCategorySelect = (catId: string) => {
    stopAudioRecitation();
    setSelectedCatId(catId);
    setActiveDetailCategory(catId);
  };

  // Favorites local state
  const [favorites, setFavorites] = useState<number[]>(() => {
    const stored = localStorage.getItem('noor_favorite_azkar_ids');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Daily reminders state
  const [reminders, setReminders] = useState<AzkarReminderItem[]>(() => {
    const stored = localStorage.getItem('noor_azkar_reminders');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }
    const defaults = [
      { id: 'morning', name: 'أذكار الصباح', time: '07:00', enabled: true },
      { id: 'evening', name: 'أذكار المساء', time: '16:30', enabled: true },
      { id: 'sleep', name: 'أذكار النوم', time: '22:00', enabled: true },
      { id: 'wakeup', name: 'أذكار الاستيقاظ', time: '05:30', enabled: false }
    ];
    localStorage.setItem('noor_azkar_reminders', JSON.stringify(defaults));
    return defaults;
  });

  const [azkarInfoMsg, setAzkarInfoMsg] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });

  const [isSchedulerOpen, setIsSchedulerOpen] = useState<boolean>(false);

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setReminders(updated);
    localStorage.setItem('noor_azkar_reminders', JSON.stringify(updated));
    playTapSound();
  };

  const handleTimeChange = (id: string, time: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, time } : r);
    setReminders(updated);
    localStorage.setItem('noor_azkar_reminders', JSON.stringify(updated));
  };

  const requestPermission = () => {
    playTapSound();
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setAzkarInfoMsg('تنبيهات الأذكار المباشرة والصوتية مفعّلة تلقائياً داخل التطبيق! لإشعارات النظام على آيفون، يرجى إضافة التطبيق للشاشة الرئيسية (Add to Home Screen).');
      return;
    }
    Notification.requestPermission().then(permission => {
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setAzkarInfoMsg('تم تفعيل إشعارات الأذكار بنجاح!');
      }
    }).catch(() => {
      setAzkarInfoMsg('تنبيهات الأذكار مفعّلة داخل التطبيق.');
    });
  };

  const triggerTestNotification = () => {
    playTapSound();
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification('تنبيه تجريبي من نور الإسلام', {
          body: 'الحمد لله! الإشعارات مفعّلة وتعمل بشكل ممتاز في تطبيق نور الإسلام.',
          icon: '/src/assets/images/app_logo_1784263255295.jpg',
          dir: 'rtl'
        });
      } catch (err) {
        console.error('Failed to display test browser notification:', err);
      }
    } else {
      requestPermission();
    }
  };

  // Compile favorited items
  const favoriteItems: ZekrItem[] = [];
  azkarData.forEach(cat => {
    cat.items.forEach(item => {
      if (favorites.includes(item.id)) {
        // Avoid duplicates just in case
        if (!favoriteItems.some(x => x.id === item.id)) {
          favoriteItems.push(item);
        }
      }
    });
  });

  const allCategories = [
    {
      id: 'favorites',
      name: 'الأذكار المفضلة',
      icon: 'HeartFill',
      items: favoriteItems
    },
    ...azkarData
  ];

  const activeCategory = allCategories.find(cat => cat.id === selectedCatId) || allCategories[1];

  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  const stopAudioRecitation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingZekrId(null);
    setIsAutoPlayAll(false);
  };

  const getAudioUrlForItem = (item: ZekrItem, reciterId: string) => {
    const reciter = REAL_AZKAR_RECITERS.find(r => r.id === reciterId) || REAL_AZKAR_RECITERS[0];

    // Specific Quranic Ayahs / Surahs
    if (item.text.includes('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ')) {
      return `https://everyayah.com/data/${reciter.cdnFolder}/002255.mp3`; // Ayat Al Kursi
    }
    if (item.text.includes('قُلْ هُوَ اللَّهُ أَحَدٌ')) {
      return `https://everyayah.com/data/${reciter.cdnFolder}/112001.mp3`; // Surah Ikhlas
    }
    if (item.text.includes('قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ')) {
      return `https://everyayah.com/data/${reciter.cdnFolder}/113001.mp3`; // Surah Falaq
    }
    if (item.text.includes('قُلْ أَعُوذُ بِرَبِّ النَّاسِ')) {
      return `https://everyayah.com/data/${reciter.cdnFolder}/114001.mp3`; // Surah Nas
    }

    // Category Recitations
    if (selectedCatId === 'morning') {
      return reciterId === 'alafasy' 
        ? 'https://cdn.islamway.net/several/azkar/morning_alafasy.mp3'
        : 'https://download.quranicaudio.com/azkar/maher_almuaiqly_morning.mp3';
    }
    if (selectedCatId === 'evening') {
      return reciterId === 'alafasy' 
        ? 'https://cdn.islamway.net/several/azkar/evening_alafasy.mp3'
        : 'https://download.quranicaudio.com/azkar/maher_almuaiqly_evening.mp3';
    }

    return `https://everyayah.com/data/${reciter.cdnFolder}/002255.mp3`;
  };

  const playRealAudioZekr = (item: ZekrItem, indexInCat: number) => {
    stopAudioRecitation();

    setPlayingZekrId(item.id);
    setAutoPlayIndex(indexInCat);

    const primaryUrl = getAudioUrlForItem(item, selectedReciter);
    const fallbackUrl = 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3';

    const audio = new Audio(primaryUrl);
    audio.playbackRate = speechRate;
    audioRef.current = audio;

    const tryFallback = () => {
      console.warn('Azkar audio error, trying fallback...');
      const fallbackAudio = new Audio(fallbackUrl);
      fallbackAudio.playbackRate = speechRate;
      audioRef.current = fallbackAudio;
      fallbackAudio.play().catch(e => console.error('Azkar fallback failed:', e));
      fallbackAudio.onended = () => {
        setPlayingZekrId(null);
        if (isAutoPlayRef.current) {
          const catItems = activeCategoryRef.current?.items || [];
          const nextIdx = indexInCat + 1;
          if (nextIdx < catItems.length) {
            setAutoPlayIndex(nextIdx);
            setTimeout(() => {
              playRealAudioZekr(catItems[nextIdx], nextIdx);
            }, 600);
          } else {
            setIsAutoPlayAll(false);
            playSuccessSound();
          }
        }
      };
    };

    audio.play().catch(err => {
      console.warn('Playback error:', err);
      tryFallback();
    });

    audio.onerror = () => {
      tryFallback();
    };

    audio.onended = () => {
      setPlayingZekrId(null);
      if (isAutoPlayRef.current) {
        const catItems = activeCategoryRef.current?.items || [];
        const nextIdx = indexInCat + 1;
        if (nextIdx < catItems.length) {
          setAutoPlayIndex(nextIdx);
          setTimeout(() => {
            playRealAudioZekr(catItems[nextIdx], nextIdx);
          }, 600);
        } else {
          setIsAutoPlayAll(false);
          playSuccessSound();
        }
      }
    };
  };

  const handlePlaySingleZekrAudio = (e: React.MouseEvent, item: ZekrItem, indexInCat: number) => {
    e.stopPropagation();
    if (playingZekrId === item.id) {
      stopAudioRecitation();
    } else {
      setIsAutoPlayAll(false);
      playRealAudioZekr(item, indexInCat);
    }
  };

  const handleStartAutoPlayAll = () => {
    const items = activeCategory.items;
    if (!items || items.length === 0) return;

    if (isAutoPlayAll) {
      stopAudioRecitation();
    } else {
      setIsAutoPlayAll(true);
      setAutoPlayIndex(0);
      playRealAudioZekr(items[0], 0);
    }
  };

  const handleNextZekrInAutoPlay = () => {
    const items = activeCategory.items;
    if (!items || items.length === 0) return;
    const nextIdx = autoPlayIndex + 1;
    if (nextIdx < items.length) {
      setAutoPlayIndex(nextIdx);
      const nextZekr = items[nextIdx];
      playRealAudioZekr(nextZekr, nextIdx);
    } else {
      stopAudioRecitation();
    }
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('noor_favorite_azkar_ids', JSON.stringify(next));
      return next;
    });
  };

  const playTapSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, audioCtx.currentTime); // Soft tap tone
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const getRemainingCount = (item: ZekrItem) => {
    if (countsState[item.id] !== undefined) {
      return countsState[item.id];
    }
    return item.count;
  };

  const handleCardClick = (item: ZekrItem) => {
    const currentRem = getRemainingCount(item);
    if (currentRem === 0) return; // already completed

    playTapSound();
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    const nextRem = currentRem - 1;
    setCountsState(prev => ({
      ...prev,
      [item.id]: nextRem,
    }));

    if (nextRem === 0) {
      playSuccessSound();
      if (navigator.vibrate) {
        navigator.vibrate([60, 40, 60]);
      }
    }
  };

  const handleResetCategory = () => {
    // Clear state counts for all items in the active category
    const updated = { ...countsState };
    activeCategory.items.forEach(item => {
      delete updated[item.id];
    });
    setCountsState(updated);
    playTapSound();
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Sunrise': return <Sunrise className="w-5 h-5 text-amber-600" />;
      case 'Moon': return <Moon className="w-5 h-5 text-indigo-500" />;
      case 'Bed': return <Bed className="w-5 h-5 text-violet-500" />;
      case 'Activity': return <Activity className="w-5 h-5 text-rose-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'Shield': return <Shield className="w-5 h-5 text-teal-500" />;
      case 'Heart': return <Heart className="w-5 h-5 text-pink-500 fill-pink-50" />;
      case 'HeartFill': return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5 text-sky-500" />;
      case 'Award': return <Award className="w-5 h-5 text-yellow-500" />;
      default: return <BookOpen className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Calculate percentage progress of current category
  const totalItemsCount = activeCategory.items.length;
  const completedItemsCount = activeCategory.items.filter(item => getRemainingCount(item) === 0).length;
  const progressPercentage = totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
            <Shield className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">حصن المسلم والأذكار اليومية</h3>
        </div>
        <button
          id="reset-azkar-cat-btn"
          onClick={handleResetCategory}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/20 hover:bg-amber-100 rounded-xl transition-colors font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>تصفير أذكار القسم الحالي</span>
        </button>
      </div>

      {/* Daily Reminders Scheduler UI */}
      <div className="bg-slate-50/70 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4 space-y-3">
        <button
          type="button"
          onClick={() => { setIsSchedulerOpen(!isSchedulerOpen); playTapSound(); }}
          className="w-full flex items-center justify-between font-bold text-sm text-slate-700 dark:text-slate-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg">
              <Bell className="w-4 h-4 animate-swing" />
            </span>
            <span>جدولة التنبيهات اليومية للأذكار</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span>{isSchedulerOpen ? 'إغلاق الإعدادات' : 'تخصيص الأوقات'}</span>
            <span className="text-lg leading-none">{isSchedulerOpen ? '▲' : '▼'}</span>
          </div>
        </button>

        {isSchedulerOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 space-y-4 border-t border-slate-200/50 dark:border-slate-800/40 overflow-hidden"
          >
            {/* Permission status & Test Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  notificationPermission === 'granted' 
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                    : notificationPermission === 'denied' 
                    ? 'bg-rose-500' 
                    : 'bg-amber-500'
                }`} />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  حالة إشعارات المتصفح:{' '}
                  {notificationPermission === 'granted' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">مفعّلة ومصرح بها</span>
                  ) : notificationPermission === 'denied' ? (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">محجوبة (يرجى تفعيلها من إعدادات المتصفح)</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">بانتظار الموافقة</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {notificationPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={requestPermission}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    السماح بالإشعارات
                  </button>
                )}
                <button
                  type="button"
                  onClick={triggerTestNotification}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إرسال إشعار تجريبي
                </button>
              </div>
            </div>

            {/* Custom Reminder Times Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reminders.map((rem) => (
                <div 
                  key={rem.id}
                  className={`p-3 rounded-xl border transition-all ${
                    rem.enabled 
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-950/50' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`rem-check-${rem.id}`}
                        checked={rem.enabled}
                        onChange={() => handleToggleReminder(rem.id)}
                        className="w-4.5 h-4.5 rounded-sm text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                      <label 
                        htmlFor={`rem-check-${rem.id}`}
                        className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none"
                      >
                        {rem.name}
                      </label>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <input
                        type="time"
                        value={rem.time}
                        onChange={(e) => handleTimeChange(rem.id, e.target.value)}
                        disabled={!rem.enabled}
                        className="px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              * تأكد من إبقاء الصفحة مفتوحة في المتصفح، وسيصلك تنبيه فوري فور حلول الموعد المحدد لقراءة الأذكار.
            </p>
          </motion.div>
        ) : null}
      </div>

      {/* Conditional rendering: Categories List View VS Category Detail Screen */}
      {activeDetailCategory === null ? (
        /* CATEGORIES LIST VIEW (Vertical full-width cards stacked under each other) */
        <div className="space-y-4" dir="rtl">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm sm:text-base font-black font-kufi text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>أقسام الأذكار المتاحة (اضغط للدخول للقسم):</span>
            </h3>
            <span className="text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              {allCategories.length} أقسام
            </span>
          </div>

          <div className="flex flex-col gap-3 w-full">
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                id={`azkar-cat-card-${cat.id}`}
                onClick={() => handleCategorySelect(cat.id)}
                className={`group w-full p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 text-right shadow-xs ${
                  cat.id === 'favorites'
                    ? 'bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-white dark:to-slate-950 border-rose-200/60 dark:border-rose-900/40 hover:border-rose-400 hover:shadow-md'
                    : 'bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-slate-900/80 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className={`p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${
                    cat.id === 'favorites'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {getCategoryIcon(cat.icon)}
                  </span>
                  
                  <div className="flex flex-col text-right truncate">
                    <div className="flex items-center gap-2">
                      <h4 className="font-kufi font-black text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {cat.name}
                      </h4>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 shrink-0">
                        {cat.items.length} {isEn ? 'azkar' : 'ذكراً'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 font-sans">
                      {cat.id === 'sabah' ? 'أذكار الصباح المأثورة للتحصين والبركة مع تلاوة صوتية' :
                       cat.id === 'massa' ? 'أذكار المساء اليومية للتحصين والسكينة مع التلاوة' :
                       cat.id === 'sleep' ? 'أذكار وطهارة وشعائر ما قبل النوم والراحة' :
                       cat.id === 'prayer' ? 'أذكار الصلاة والتسبيح والتعقيب المأثور عقب كل صلاة' :
                       cat.id === 'wakeup' ? 'أذكار الاستيقاظ والحمد عند فتح العينين' :
                       cat.id === 'favorites' ? 'جميع الأذكار التي قمت بإضافتها لمفضلتك الخاصة' :
                       'أذكار وأدعية مأثورة مع عداد التسبيح الإلكتروني والتلاوة'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 hidden sm:inline-block font-kufi group-hover:underline">
                    دخول للقسم
                  </span>
                  <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:-translate-x-1 transition-transform">
                    <ChevronLeft className="w-5 h-5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* CATEGORY DETAIL SCREEN (When user clicks into a category) */
        <div className="space-y-6" dir="rtl">
          {/* Top Bar with Back Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveDetailCategory(null);
                stopAudioRecitation();
                playTapSound();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg font-kufi"
            >
              <ArrowRight className="w-4.5 h-4.5" />
              <span>← العودة إلى قائمة الأذكار</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
                {getCategoryIcon(activeCategory.icon)}
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 font-kufi flex items-center gap-2">
                  <span>{activeCategory.name}</span>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
                    ({activeCategory.items.length} ذكراً)
                  </span>
                </h3>
              </div>
            </div>

            <button
              id="reset-azkar-cat-btn"
              onClick={handleResetCategory}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/20 hover:bg-amber-100 rounded-xl transition-colors font-bold font-kufi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير أذكار هذا القسم</span>
            </button>
          </div>

          {/* Audio Recitation Master Controller */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white rounded-2xl shadow-lg border border-emerald-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-emerald-500/20 rounded-xl text-amber-300">
                  <Headphones className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold font-kufi text-amber-300 flex items-center gap-2">
                    <span>تلاوة الأذكار الصوتية التلقائية</span>
                  </h4>
                  <p className="text-[11px] text-emerald-100/80 font-sans">
                    استمع إلى أذكار هذا القسم بصوت عالي الدقة وواضح مع متابعة القراءة تلقائياً.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {/* Reciter Selector */}
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-xl text-[11px] font-bold">
                  <span>القارئ:</span>
                  <select
                    value={selectedReciter}
                    onChange={(e) => {
                      setSelectedReciter(e.target.value);
                      if (playingZekrId !== null) stopAudioRecitation();
                    }}
                    className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer"
                    style={{ fontSize: '16px' }}
                  >
                    {REAL_AZKAR_RECITERS.map((r) => (
                      <option key={r.id} value={r.id} className="text-slate-900">
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-xl text-[11px] font-bold">
                  <span>السرعة:</span>
                  <select
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="bg-transparent text-amber-300 font-mono font-bold focus:outline-none cursor-pointer"
                    style={{ fontSize: '16px' }}
                  >
                    <option value={0.8} className="text-slate-900">0.8x بطيء</option>
                    <option value={1.0} className="text-slate-900">1.0x عادي</option>
                    <option value={1.25} className="text-slate-900">1.25x سريع</option>
                  </select>
                </div>

                {/* Play All Button */}
                <button
                  type="button"
                  onClick={handleStartAutoPlayAll}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer font-kufi ${
                    isAutoPlayAll
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950'
                  }`}
                >
                  {isAutoPlayAll ? (
                    <>
                      <Square className="w-4 h-4 fill-current" />
                      <span>إيقاف القراءة</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>استماع متتالي لجميع الأذكار</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Currently Playing Zekr Status Bar */}
            {(playingZekrId !== null || isAutoPlayAll) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <span className="p-1.5 bg-amber-400 text-slate-950 rounded-lg shrink-0">
                    <Volume2 className="w-4 h-4 animate-bounce" />
                  </span>
                  <div className="truncate">
                    <span className="font-bold text-amber-300 block text-[11px]">
                      {isAutoPlayAll ? `جاري تلاوة الذكر رقم (${autoPlayIndex + 1} من ${activeCategory.items.length}):` : 'جاري الاستماع للذكر الحالي:'}
                    </span>
                    <span className="text-slate-100 truncate block text-xs">
                      {activeCategory.items.find(x => x.id === playingZekrId)?.text || activeCategory.items[autoPlayIndex]?.text || ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAutoPlayAll && (
                    <button
                      type="button"
                      onClick={handleNextZekrInAutoPlay}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      title="الذكر التالي"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">التالي</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={stopAudioRecitation}
                    className="p-2 bg-rose-500/30 hover:bg-rose-500/50 rounded-lg text-rose-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>إيقاف</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Progress indicators */}
          <div className="p-3.5 bg-emerald-50/40 dark:bg-slate-950/40 border border-emerald-100/10 rounded-2xl flex items-center justify-between">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
              تم قراءة <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{completedItemsCount}</span> من <span className="font-mono text-sm">{totalItemsCount}</span>
            </div>
            <div className="flex items-center gap-3 w-1/2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{progressPercentage}%</span>
            </div>
          </div>

          {/* Azkar Items List */}
          <div className="space-y-4">
            {activeCategory.id === 'favorites' && activeCategory.items.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
                  <Heart className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">المفضلة فارغة</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
                  لم تقم بإضافة أي ذكر إلى المفضلة حتى الآن. يمكنك تصفح الأذكار الأخرى والضغط على زر القلب لحفظها هنا لسهولة الوصول إليها في أي وقت.
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {activeCategory.items.map((item, idx) => {
                const rem = getRemainingCount(item);
                const isCompleted = rem === 0;
                const isFav = favorites.includes(item.id);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    onClick={() => handleCardClick(item)}
                    className={`group p-4 rounded-2xl border transition-all duration-300 text-right cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden select-none ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/20 shadow-xs'
                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100/40 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/80 hover:border-emerald-500/20 hover:shadow-xs'
                    }`}
                  >
                    {/* Completion Background wave overlay */}
                    {isCompleted && (
                      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-emerald-600 dark:bg-emerald-400" />
                    )}

                    {/* Main Content */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[14px] font-medium text-slate-800 dark:text-slate-100 leading-relaxed font-sans select-text flex-1">
                          {item.text}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Audio Recite Speaker Button */}
                          <button
                            type="button"
                            onClick={(e) => handlePlaySingleZekrAudio(e, item, idx)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                              playingZekrId === item.id
                                ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-md font-bold text-xs'
                                : 'bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                            title={playingZekrId === item.id ? 'إيقاف الاستماع' : 'استماع صوتي للذكر'}
                          >
                            {playingZekrId === item.id ? (
                              <>
                                <Square className="w-3.5 h-3.5 fill-current animate-pulse" />
                                <span className="text-[10px] hidden sm:inline font-bold">إيقاف</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-[10px] hidden sm:inline font-bold text-emerald-800 dark:text-emerald-200">صوت</span>
                              </>
                            )}
                          </button>

                          {/* Favorite Heart Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(item.id, e)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isFav
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-200/50 dark:border-rose-950/50 scale-105'
                                : 'bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 border-transparent hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                            }`}
                            title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                          </button>
                        </div>
                      </div>
                      
                      {item.reward && (
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-100/30 dark:bg-emerald-950/10 p-2 rounded-lg inline-block">
                          <strong>فضل الذكر:</strong> {item.reward}
                        </div>
                      )}
                    </div>

                    {/* Footer Controls / Count tracker */}
                    <div className="flex items-center justify-between border-t border-slate-100/10 pt-2 text-xs">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        الرقم التعريفي: #{item.id}
                      </span>

                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-xs animate-pulse">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>مكتمل</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">انقر للتكرار:</span>
                            <span className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-full transition-transform transform active:scale-90 font-mono shadow-md min-w-[50px] text-center">
                              {rem}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
