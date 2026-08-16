/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Minus, 
  Plus, 
  BookOpenCheck, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Headphones,
  Award,
  Target,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Share2,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { quranMetadata } from '../data/quran_metadata';
import { offlineSurahs } from '../data/quran_text';
import { SurahMetadata, SurahDetail, Ayah } from '../types';

const RECITERS = [
  { 
    id: 'maher', 
    name: 'ماهر المعيقلي', 
    url: 'https://server12.mp3quran.net/maher/',
    fallbackUrl: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/'
  },
  { 
    id: 'alafasy', 
    name: 'مشاري بن راشد العفاسي', 
    url: 'https://server8.mp3quran.net/afs/',
    fallbackUrl: 'https://everyayah.com/data/Alafasy_128kbps/'
  },
  { 
    id: 'basit_murattal', 
    name: 'عبد الباسط عبد الصمد (مرتل)', 
    url: 'https://server7.mp3quran.net/basit/',
    fallbackUrl: 'https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.com/'
  },
  { 
    id: 'ghamdi', 
    name: 'سعد الغامدي', 
    url: 'https://server7.mp3quran.net/s_gmd/',
    fallbackUrl: 'https://everyayah.com/data/Ghamadi_40kbps/'
  },
  { 
    id: 'sudais', 
    name: 'عبد الرحمن السديس', 
    url: 'https://server11.mp3quran.net/sds/',
    fallbackUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/'
  }
];

const FONT_FAMILIES = [
  { id: 'amiri', name: 'خط حفص / عثماني (الأميري)', class: 'font-amiri' },
  { id: 'scheherazade', name: 'خط النسخ (شهرزاد)', class: 'font-scheherazade' },
  { id: 'kufi', name: 'خط كوفي (ريم كوفي)', class: 'font-kufi' },
  { id: 'cairo', name: 'خط حديث (كايرو)', class: 'font-cairo' },
  { id: 'sans', name: 'خط النظام الافتراضي', class: 'font-sans' }
];

interface QuranSectionProps {
  isEn?: boolean;
}

export default function QuranSection({ isEn = false }: QuranSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [fontSize, setFontSize] = useState<number>(24);
  const [activeFontFamily, setActiveFontFamily] = useState<string>('amiri');
  
  // Display View Modes: 'text' (Interactive Uthmani)
  const [viewMode, setViewMode] = useState<'text'>('text');

  // Top level main directory tab: 'surahs' (114 Surahs)
  const [directoryTab, setDirectoryTab] = useState<'surahs'>('surahs');

  // Page metadata lookup helpers
  const getSurahForPage = (pageNum: number) => {
    let matched = quranMetadata[0];
    for (const s of quranMetadata) {
      if (s.startPage && s.startPage <= pageNum) {
        matched = s;
      } else if (s.startPage && s.startPage > pageNum) {
        break;
      }
    }
    return matched;
  };

  // Loaded Surahs Cache Map (stores dynamically fetched full Uthmani Ayahs for all 114 Surahs)
  const [loadedSurahsMap, setLoadedSurahsMap] = useState<Record<number, SurahDetail>>({});
  const [isLoadingSurahText, setIsLoadingSurahText] = useState<boolean>(false);

  // Khatma Syncing States
  const totalKhatmaPages = 604;
  const [khatmaCurrentPage, setKhatmaCurrentPage] = useState<number>(() => {
    return Number(localStorage.getItem('khatma_current_page') || '0');
  });

  const [khatmaTargetPagesPerDay, setKhatmaTargetPagesPerDay] = useState<number>(() => {
    return Number(localStorage.getItem('khatma_target_pages_per_day') || '20');
  });

  const [khatmaHistoryLogs, setKhatmaHistoryLogs] = useState<any[]>(() => {
    const stored = localStorage.getItem('khatma_history');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  });

  // Local storage writers for Khatma tracking
  useEffect(() => {
    localStorage.setItem('khatma_current_page', khatmaCurrentPage.toString());
  }, [khatmaCurrentPage]);

  useEffect(() => {
    localStorage.setItem('khatma_target_pages_per_day', khatmaTargetPagesPerDay.toString());
    const days = Math.ceil(totalKhatmaPages / khatmaTargetPagesPerDay);
    localStorage.setItem('khatma_target_days', days.toString());
  }, [khatmaTargetPagesPerDay]);

  useEffect(() => {
    localStorage.setItem('khatma_history', JSON.stringify(khatmaHistoryLogs));
  }, [khatmaHistoryLogs]);

  const updateKhatmaProgress = (pageNum: number) => {
    const sanitized = Math.max(0, Math.min(totalKhatmaPages, pageNum));
    setKhatmaCurrentPage(sanitized);

    const todayStr = new Date().toLocaleDateString('ar-SA', { month: 'long', day: 'numeric', year: 'numeric' });
    const existingIdx = khatmaHistoryLogs.findIndex(log => log.date === todayStr);
    
    if (existingIdx !== -1) {
      const updated = [...khatmaHistoryLogs];
      updated[existingIdx].page = sanitized;
      updated[existingIdx].timestamp = Date.now();
      setKhatmaHistoryLogs(updated);
    } else {
      setKhatmaHistoryLogs(prev => [{ date: todayStr, page: sanitized, timestamp: Date.now() }, ...prev]);
    }
  };

  const incrementKhatmaProgress = (amount: number) => {
    updateKhatmaProgress(khatmaCurrentPage + amount);
  };
  
  // Audio Player states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeReciterId, setActiveReciterId] = useState<string>('maher');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Tafsir request state
  const [isLoadingTafsir, setIsLoadingTafsir] = useState<boolean>(false);
  const [tafsirResult, setTafsirResult] = useState<string | null>(null);
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<number | null>(null);

  // Manual specific ayah lookup state
  const [lookupSurah, setLookupSurah] = useState<number>(18);
  const [lookupAyah, setLookupAyah] = useState<number>(1);
  const [lookupResult, setLookupResult] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);

  const filteredSurahs = quranMetadata.filter((surah) => {
    return (
      surah.name.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString() === searchQuery
    );
  });

  const handleSelectSurah = async (surahMeta: SurahMetadata) => {
    setTafsirResult(null);
    setActiveTafsirAyah(null);

    // 1. Check offline hardcoded surahs
    if (offlineSurahs[surahMeta.number]) {
      setSelectedSurah(offlineSurahs[surahMeta.number]);
      return;
    }

    // 2. Check component cache map
    if (loadedSurahsMap[surahMeta.number]) {
      setSelectedSurah(loadedSurahsMap[surahMeta.number]);
      return;
    }

    // 3. Set placeholder metadata while fetching complete text
    const placeholderDetail: SurahDetail = {
      ...surahMeta,
      ayahs: []
    };
    setSelectedSurah(placeholderDetail);
    setIsLoadingSurahText(true);

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahMeta.number}`);
      const json = await res.json();
      if (json.code === 200 && json.data && Array.isArray(json.data.ayahs)) {
        const fetchedAyahs: Ayah[] = json.data.ayahs.map((a: any) => ({
          number: a.numberInSurah,
          text: a.text,
          translation: '',
          tafsir: ''
        }));

        const fullDetail: SurahDetail = {
          ...surahMeta,
          ayahs: fetchedAyahs
        };

        setLoadedSurahsMap(prev => ({
          ...prev,
          [surahMeta.number]: fullDetail
        }));

        setSelectedSurah(fullDetail);
        return;
      }
    } catch (e) {
      console.warn("Primary Quran API slow/failed, trying secondary CDN fallback:", e);
    }

    // Secondary Fallback API for 100% availability
    try {
      const res2 = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranuthmani/${surahMeta.number}.json`);
      const json2 = await res2.json();
      if (json2 && Array.isArray(json2.quran)) {
        const fetchedAyahs: Ayah[] = json2.quran.map((a: any) => ({
          number: a.verse,
          text: a.text,
          translation: '',
          tafsir: ''
        }));

        const fullDetail: SurahDetail = {
          ...surahMeta,
          ayahs: fetchedAyahs
        };

        setLoadedSurahsMap(prev => ({
          ...prev,
          [surahMeta.number]: fullDetail
        }));

        setSelectedSurah(fullDetail);
      }
    } catch (err2) {
      console.error("Secondary Quran API error:", err2);
    } finally {
      setIsLoadingSurahText(false);
    }
  };

  const handleFetchSurahTafsir = async (surahNum: number, name: string) => {
    setIsLoadingTafsir(true);
    setTafsirResult(null);
    try {
      const res = await fetch('/api/gemini/tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surahNumber: surahNum, surahName: name }),
      });
      const data = await res.json();
      if (data.error) {
        setTafsirResult(`⚠️ خطأ: ${data.error}`);
      } else {
        setTafsirResult(data.text);
      }
    } catch (e) {
      setTafsirResult('⚠️ عذراً، تعذر الاتصال بخادم التفسير. يرجى مراجعة الاتصال بالإنترنت.');
    } finally {
      setIsLoadingTafsir(false);
    }
  };

  const handleFetchAyahTafsir = async (surahNum: number, surahName: string, ayahNum: number) => {
    setIsLoadingTafsir(true);
    setActiveTafsirAyah(ayahNum);
    setTafsirResult(null);
    try {
      const res = await fetch('/api/gemini/tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surahNumber: surahNum, surahName, ayahNumber: ayahNum }),
      });
      const data = await res.json();
      if (data.error) {
        setTafsirResult(`⚠️ خطأ: ${data.error}`);
      } else {
        setTafsirResult(data.text);
      }
    } catch (e) {
      setTafsirResult('⚠️ تعذر تحميل التفسير حالياً.');
    } finally {
      setIsLoadingTafsir(false);
    }
  };

  const handleManualAyahLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLookingUp(true);
    setLookupResult(null);
    
    const surahMeta = quranMetadata.find(s => s.number === Number(lookupSurah));
    const sName = surahMeta ? surahMeta.name : `سورة رقم ${lookupSurah}`;

    try {
      const res = await fetch('/api/gemini/tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber: lookupSurah,
          surahName: sName,
          ayahNumber: lookupAyah,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setLookupResult(`⚠️ خطأ: ${data.error}`);
      } else {
        setLookupResult(data.text);
      }
    } catch (err) {
      setLookupResult('⚠️ عذراً، تعذر جلب التفسير لهذه الآية حالياً.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const changeFontSize = (delta: number) => {
    setFontSize(prev => Math.min(Math.max(prev + delta, 14), 36));
  };

  // Audio player handlers & effects
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsAudioLoading(false);
      
      if (selectedSurah) {
        const padded = String(selectedSurah.number).padStart(3, '0');
        const reciter = RECITERS.find(r => r.id === activeReciterId);
        if (reciter) {
          audioRef.current.src = `${reciter.url}${padded}.mp3`;
          audioRef.current.load();
        }
      }
    }
  }, [selectedSurah]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleReciterChange = (reciterId: string) => {
    setActiveReciterId(reciterId);
    if (!selectedSurah) return;

    const wasPlaying = isPlaying;
    setIsAudioLoading(true);

    const padded = String(selectedSurah.number).padStart(3, '0');
    const reciter = RECITERS.find(r => r.id === reciterId);
    if (reciter && audioRef.current) {
      audioRef.current.src = `${reciter.url}${padded}.mp3`;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Audio play failed:", err);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsAudioLoading(true);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsAudioLoading(false);
      }).catch(err => {
        console.error("Failed to play audio:", err);
        setIsPlaying(false);
        setIsAudioLoading(false);
      });
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const activeFontClass = FONT_FAMILIES.find(f => f.id === activeFontFamily)?.class || 'font-amiri';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setIsAudioLoading(false);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onWaiting={() => setIsAudioLoading(true)}
        onCanPlay={() => setIsAudioLoading(false)}
        onError={() => {
          if (selectedSurah && audioRef.current) {
            const padded = String(selectedSurah.number).padStart(3, '0');
            const reciter = RECITERS.find(r => r.id === activeReciterId);
            if (reciter && reciter.fallbackUrl && !audioRef.current.src.includes('everyayah.com')) {
              console.warn("Primary mp3quran server failed, switching to EveryAyah CDN...");
              audioRef.current.src = `${reciter.fallbackUrl}${padded}.mp3`;
              audioRef.current.load();
              audioRef.current.play().catch(e => console.error("Fallback audio play error:", e));
            } else {
              setIsAudioLoading(false);
              setIsPlaying(false);
            }
          }
        }}
      />
      
      {/* 1. Main Quran Directory or Selected Surah */}
      {!selectedSurah ? (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">المصحف الشريف وتفسير السور (114 سورة)</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تصفح سور القرآن كاملة بالصفحات والنصوص والتلاوة بصوت الشريف ماهر المعيقلي والعفاسي
            </p>
          </div>

          <div className="space-y-6">
            {/* Quick Specific Ayah Lookup Form */}
          <div className="p-4 bg-gradient-to-br from-emerald-600/5 to-teal-600/5 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-500/10 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <h4 className="text-xs font-bold">مستكشف آيات وتفاسير القرآن الفوري بالذكاء الاصطناعي</h4>
            </div>
            <form onSubmit={handleManualAyahLookup} className="flex flex-wrap gap-2.5 items-end">
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-bold">حدد السورة:</span>
                <select
                  id="lookup-surah-select"
                  value={lookupSurah}
                  onChange={(e) => setLookupSurah(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-lg text-xs font-bold cursor-pointer"
                  style={{ fontSize: '16px' }}
                >
                  {quranMetadata.map(s => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name} ({s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-bold">رقم الآية:</span>
                <input
                  id="lookup-ayah-input"
                  type="number"
                  min="1"
                  max={quranMetadata.find(s => s.number === lookupSurah)?.numberOfAyahs || 286}
                  value={lookupAyah}
                  onChange={(e) => setLookupAyah(Number(e.target.value))}
                  className="w-20 px-2.5 py-1 bg-white dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-lg text-xs font-bold text-center"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <button
                id="lookup-ayah-submit-btn"
                type="submit"
                disabled={isLookingUp}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 h-8 cursor-pointer"
              >
                {isLookingUp ? 'جاري جلب التفسير...' : 'جلب آية وتفسيرها'}
              </button>
            </form>

            {lookupResult && (
              <div className="mt-3 p-4 bg-white dark:bg-slate-950 border border-emerald-100/50 dark:border-slate-800/80 rounded-xl space-y-2 text-sm leading-relaxed max-h-[300px] overflow-y-auto pr-2 text-slate-800 dark:text-slate-200 shadow-inner">
                <div className="markdown-body text-xs leading-relaxed">
                  <ReactMarkdown>{lookupResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Directory Search */}
          <div className="relative">
            <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="quran-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم السورة (مثلاً: البقرة، الكهف، يس، الفاتحة) أو برقمها..."
              className="w-full pr-10 pl-4 py-2 text-xs bg-emerald-50/30 dark:bg-slate-950 border border-emerald-100/50 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Vertical List of All 114 Surahs */}
          <div className="flex flex-col gap-2.5">
            {filteredSurahs.map((surah) => {
              return (
                <button
                  key={surah.number}
                  id={`surah-card-btn-${surah.number}`}
                  onClick={() => handleSelectSurah(surah)}
                  className="p-3.5 sm:p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100/60 dark:border-slate-850 hover:border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right transition-all duration-200 hover:shadow-md group relative overflow-hidden cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-sm font-extrabold rounded-2xl flex items-center justify-center border border-emerald-200/30 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {surah.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          سورة {surah.name}
                        </h4>
                        <span className="px-2 py-0.5 bg-emerald-700 text-white font-semibold text-[9px] rounded-md">
                          قراءة وتفسير كامل
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                        {surah.englishName} • صفحة {surah.startPage || 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium self-end sm:self-center">
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl text-[11px] font-bold">
                      {surah.revelationType === 'Meccan' ? '🕋 مكية' : '🕌 مدنية'}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/30 rounded-xl text-[11px] font-extrabold">
                      {surah.numberOfAyahs} آيات
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      ) : (
        /* 2. Selected Surah Reader & Viewer Mode */
        <div className="space-y-6">
          
          {/* Back Button and View Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/40">
            <button
              id="back-to-quran-btn"
              onClick={() => setSelectedSurah(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لقائمة السور</span>
            </button>

            {/* Font & Sizing Options */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 font-bold px-1">نوع الخط:</span>
                <select
                  value={activeFontFamily}
                  onChange={(e) => setActiveFontFamily(e.target.value)}
                  className="bg-transparent dark:bg-slate-950 text-slate-850 dark:text-slate-100 text-xs font-bold focus:outline-none cursor-pointer border-none py-0.5"
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font.id} value={font.id} className="dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] text-slate-400 pr-1">حجم الخط</span>
                <button
                  id="font-size-dec-btn"
                  onClick={() => changeFontSize(-2)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold font-mono px-1.5">{fontSize}</span>
                <button
                  id="font-size-inc-btn"
                  onClick={() => changeFontSize(2)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Surah Header Banner */}
          <div className="text-center p-6 bg-gradient-to-b from-emerald-800 to-teal-950 text-white rounded-3xl space-y-2 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-200">
              السورة رقم {selectedSurah.number} • {selectedSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • تبدأ بصفحة {selectedSurah.startPage || 1}
            </span>
            <h3 className="text-3xl font-extrabold text-amber-300 mt-2 font-amiri">سورة {selectedSurah.name}</h3>
            <p className="text-xs text-emerald-100/80">{selectedSurah.numberOfAyahs} آيات كريمة كاملة</p>
            
            {/* Quick Tafsir Button */}
            <button
              id="get-surah-tafsir-btn"
              onClick={() => handleFetchSurahTafsir(selectedSurah.number, selectedSurah.name)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              طلب تفسير وشرح كامل السورة بالذكاء الاصطناعي
            </button>
          </div>

          {/* Reciter Audio Player */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/55 text-emerald-800 dark:text-emerald-300 rounded-lg">
                  <Headphones className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">التلاوة العطرة بصوت الشيخ ماهر المعيقلي والنخبة</span>
              </div>
              
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span className="text-[10px] text-slate-400 font-bold">القارئ:</span>
                <select
                  value={activeReciterId}
                  onChange={(e) => handleReciterChange(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-lg px-2 py-1 focus:border-emerald-500 focus:ring-emerald-500 cursor-pointer"
                >
                  {RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 justify-between" dir="rtl">
              <div className="flex items-center gap-3 w-full md:w-auto justify-start">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  disabled={isAudioLoading}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 text-white cursor-pointer ${
                    isPlaying 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAudioLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white translate-x-[-1px]" />
                  )}
                </button>

                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">حالة التلاوة</span>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                    {isAudioLoading ? 'جاري التحميل...' : isPlaying ? 'يُرتل الآن...' : 'جاهز للاستماع'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full flex-1">
                <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 min-w-[32px] text-left">
                  {formatTime(currentTime)}
                </span>
                
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleProgressChange}
                  disabled={isAudioLoading || !duration}
                  className="flex-1 h-1.5 rounded-lg appearance-none bg-slate-200 dark:bg-slate-800 accent-emerald-600 dark:accent-emerald-400 cursor-pointer disabled:opacity-50"
                />

                <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 min-w-[32px] text-right">
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1 w-full md:w-32 justify-end md:justify-start">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1.5 rounded-lg appearance-none bg-slate-200 dark:bg-slate-800 accent-emerald-600 dark:accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Tafsir results display */}
          {isLoadingTafsir && (
            <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                يقوم مستشار نور الإسلام بطلب التفسير الصحيح من الكتب المعتمدة...
              </p>
            </div>
          )}

          {tafsirResult && (
            <div className="p-5 bg-emerald-50 dark:bg-slate-950/80 border border-emerald-500/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-emerald-700" />
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    {activeTafsirAyah ? `تفسير الآية رقم ${activeTafsirAyah}` : `تفسير وبيان سورة ${selectedSurah.name}`}
                  </h4>
                </div>
                <button
                  id="clear-tafsir-btn"
                  onClick={() => {
                    setTafsirResult(null);
                    setActiveTafsirAyah(null);
                  }}
                  className="text-xs text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  إغلاق التفسير
                </button>
              </div>

              <div className="markdown-body text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-[400px] overflow-y-auto pr-1">
                <ReactMarkdown>{tafsirResult}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Interactive Uthmani Text View */}
          <div className="space-y-6">
            {isLoadingSurahText && (
              <div className="p-8 text-center bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-sm font-bold text-emerald-950 dark:text-emerald-300 font-kufi">
                  جاري تحميل النص العثماني والآيات لـ سورة {selectedSurah.name}...
                </p>
              </div>
            )}

            <div className="p-6 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100/40 dark:border-slate-850 rounded-2xl space-y-6 text-center">
              
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                <p className={`text-2xl ${activeFontClass} text-slate-800 dark:text-slate-100 py-2 border-b border-slate-100/5 drop-shadow-xs`}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              )}

              {selectedSurah.ayahs && selectedSurah.ayahs.length > 0 ? (
                selectedSurah.ayahs.map((ayah) => (
                  <div
                    key={ayah.number}
                    className="py-4 border-b border-slate-100/5 last:border-none space-y-3 group text-center"
                  >
                    <p
                      className={`text-slate-900 dark:text-slate-100 leading-loose tracking-wide ${activeFontClass} text-center transition-all duration-200 hover:text-emerald-700 dark:hover:text-emerald-400`}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {ayah.text}{' '}
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-emerald-600/30 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 select-none mr-2 bg-emerald-50 dark:bg-emerald-950/30">
                        {ayah.number}
                      </span>
                    </p>

                    {ayah.translation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic max-w-2xl mx-auto">
                        {ayah.translation}
                      </p>
                    )}

                    <div className="flex justify-center gap-2 pt-2">
                      <button
                        id={`ayah-tafsir-btn-${ayah.number}`}
                        onClick={() => handleFetchAyahTafsir(selectedSurah.number, selectedSurah.name, ayah.number)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-lg text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50/50 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                        <span>تفسير مفصل بالذكاء الاصطناعي</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : !isLoadingSurahText && (
                <div className="py-6 space-y-3">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    جاري تحميل النص العثماني والآيات لـ سورة {selectedSurah.name}...
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
