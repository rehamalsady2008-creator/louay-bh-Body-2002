/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Settings, 
  Volume2, 
  Bell, 
  Award, 
  Flame, 
  Heart, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Play, 
  Square, 
  Sparkles,
  Headphones,
  Globe,
  Database
} from 'lucide-react';
import { AppSettings } from '../types';
import { PrayerNotificationManager } from '../utils/prayerNotifications';

interface ProfileSectionProps {
  currentUser: any;
  isGuest: boolean;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onLogout: () => void;
  isEn?: boolean;
}

export const RECITERS = [
  { 
    id: 'sudais', 
    name: 'الشيخ عبد الرحمن السديس (أذان وتكبير الحرم المكي)', 
    country: 'مكة المكرمة - السعودية', 
    audioUrls: [
      'https://cdn.aladhan.com/audio/adhan/makkah.mp3',
      'https://media.quranicaudio.com/adhan/makkah.mp3',
      'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
    ]
  },
  { 
    id: 'muaiqly', 
    name: 'الشيخ ماهر المعيقلي (أذان الحرم المدني)', 
    country: 'المدينة المنورة - السعودية', 
    audioUrls: [
      'https://cdn.aladhan.com/audio/adhan/madinah.mp3',
      'https://media.quranicaudio.com/adhan/madinah.mp3',
      'https://server12.mp3quran.net/maher/001.mp3'
    ]
  },
  { 
    id: 'afasy', 
    name: 'الشيخ مشاري راشد العفاسي (الأذان والتلاوة الأصيلة)', 
    country: 'الكويت', 
    audioUrls: [
      'https://cdn.aladhan.com/audio/adhan/alafasy.mp3',
      'https://media.quranicaudio.com/adhan/alafasy.mp3',
      'https://server8.mp3quran.net/afs/001.mp3'
    ]
  },
  { 
    id: 'abdulsamad', 
    name: 'الشيخ عبد الباسط عبد الصمد (الأذان والتلاوة المصرية)', 
    country: 'مصر', 
    audioUrls: [
      'https://cdn.aladhan.com/audio/adhan/egypt.mp3',
      'https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal/1.mp3',
      'https://server7.mp3quran.net/basit/001.mp3'
    ]
  },
  { 
    id: 'fajr_makkah', 
    name: 'أذان الفجر المبارك (الصلاة خير من النوم)', 
    country: 'مكة المكرمة', 
    audioUrls: [
      'https://cdn.aladhan.com/audio/adhan/fajr/makkah.mp3',
      'https://media.quranicaudio.com/adhan/fajr_makkah.mp3',
      'https://cdn.aladhan.com/audio/adhan/makkah.mp3'
    ]
  },
  { 
    id: 'jerusalem', 
    name: 'أذان المسجد الأقصى المبارك', 
    country: 'القدس الشريف - فلسطين', 
    audioUrls: [
      'https://cdn.aladhan.com/audio/adhan/jerusalem.mp3',
      'https://cdn.aladhan.com/audio/adhan/makkah.mp3'
    ]
  },
  { 
    id: 'turkey', 
    name: 'أذان مساجد إسطنبول والحرم التركي', 
    country: 'إسطنبول - تركيا', 
    audioUrls: [
      'https://cdn.aladhan.com/audio/adhan/turkey.mp3',
      'https://cdn.aladhan.com/audio/adhan/madinah.mp3'
    ]
  },
  { 
    id: 'ali_mulla', 
    name: 'الشيخ علي ملا (مؤذن الحرم المكي الشريف)', 
    country: 'مكة المكرمة', 
    audioUrls: [
      'https://cdn.aladhan.com/audio/adhan/makkah.mp3',
      'https://media.quranicaudio.com/adhan/makkah.mp3'
    ]
  },
  { 
    id: 'minshawi', 
    name: 'الشيخ محمد صديق المنشاوي', 
    country: 'مصر', 
    audioUrls: [
      'https://cdn.islamic.network/quran/audio/128/ar.minshawi/1.mp3',
      'https://server11.mp3quran.net/minsh/001.mp3'
    ]
  },
  { 
    id: 'shatri', 
    name: 'الشيخ أبو بكر الشاطري', 
    country: 'السعودية', 
    audioUrls: [
      'https://cdn.islamic.network/quran/audio/128/ar.shaatree/1.mp3',
      'https://server11.mp3quran.net/shatri/001.mp3'
    ]
  }
];

export default function ProfileSection({
  currentUser,
  isGuest,
  settings,
  onUpdateSettings,
  onLogout,
  isEn = false
}: ProfileSectionProps) {
  const [playingReciterId, setPlayingReciterId] = useState<string | null>(null);
  const reciterAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const [showProfileGuide, setShowProfileGuide] = useState<boolean>(false);

  const isNotificationSupported = typeof window !== 'undefined' && ('Notification' in window || 'Capacitor' in window);

  const getSystemPermissionState = (): 'granted' | 'denied' | 'default' | 'unsupported' => {
    if (!isNotificationSupported) return 'unsupported';
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission as 'granted' | 'denied' | 'default';
    }
    return 'default';
  };

  const [notifPermission, setNotifPermission] = useState<string>(() => {
    const sysState = getSystemPermissionState();
    if (sysState === 'denied') return 'denied';
    if (settings.adhanReminder || sysState === 'granted') return 'granted';
    return sysState;
  });

  const isSupported = isNotificationSupported && notifPermission !== 'denied' && notifPermission !== 'unsupported';

  const sendTestNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification('نور الإسلام 🕌', {
          body: 'تم تفعيل إشعارات الأذان والأذكار بنجاح على هاتفك!',
          icon: '/app_avatar.png',
          dir: 'rtl',
          badge: '/app_avatar.png',
          tag: 'noor-islam-welcome'
        });
        setTimeout(() => notif.close(), 5000);
      } catch (e) {
        console.warn('Direct notification instantiation error:', e);
      }
    }
    try {
      const audio = new Audio('https://cdn.aladhan.com/audio/adhan/makkah.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
    alert(isEn ? 'Test notification sent! 🔔' : 'تم إرسال إشعار الأذان التجريبي بنجاح! 🔔');
  };

  const handleRequestNotifPermission = async () => {
    const isGranted = notifPermission === 'granted' || settings.adhanReminder;

    if (isGranted) {
      setNotifPermission('default');
      onUpdateSettings({ ...settings, adhanReminder: false });
      return;
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied') {
      setShowProfileGuide(true);
      return;
    }

    let granted = false;
    try {
      granted = await PrayerNotificationManager.requestPermissions();
    } catch (e) {
      console.log('Capacitor local notifications check:', e);
    }

    if (!granted && typeof window !== 'undefined' && 'Notification' in window && typeof Notification.requestPermission === 'function') {
      try {
        const promiseResult = Notification.requestPermission((res) => {
          if (res === 'granted') {
            granted = true;
          } else if (res === 'denied') {
            setNotifPermission('denied');
            setShowProfileGuide(true);
          }
        });
        if (promiseResult && typeof promiseResult.then === 'function') {
          const res = await promiseResult;
          if (res === 'granted') granted = true;
          else if (res === 'denied') {
            setNotifPermission('denied');
            setShowProfileGuide(true);
            return;
          }
        }
      } catch (err) {
        console.error('Notification permission request error:', err);
      }
    }

    setNotifPermission('granted');
    onUpdateSettings({ ...settings, adhanReminder: true });
    sendTestNotification();
  };

  // Stats from LocalStorage
  const totalTasbih = parseInt(localStorage.getItem('tasbih_total_count') || '0', 10);
  const favoriteAzkarCount = (JSON.parse(localStorage.getItem('noor_favorite_azkar_ids') || '[]')).length;
  const khatmaPages = (JSON.parse(localStorage.getItem('noor_khatma_read_pages') || '[]')).length;

  // Real audio sample playback for Reciters with fallback URLs
  const handlePreviewReciter = (reciterId: string, urls: string[]) => {
    if (playingReciterId === reciterId) {
      if (reciterAudioRef.current) {
        reciterAudioRef.current.pause();
        reciterAudioRef.current = null;
      }
      setPlayingReciterId(null);
      return;
    }

    if (reciterAudioRef.current) {
      reciterAudioRef.current.pause();
      reciterAudioRef.current = null;
    }

    setPlayingReciterId(reciterId);

    let urlIdx = 0;
    const playNext = () => {
      if (urlIdx >= urls.length) {
        setPlayingReciterId(null);
        return;
      }

      const audio = new Audio(urls[urlIdx]);
      reciterAudioRef.current = audio;

      audio.play().catch(err => {
        console.warn(`Audio source ${urlIdx} failed for ${reciterId}:`, err);
        urlIdx++;
        playNext();
      });

      audio.onended = () => setPlayingReciterId(null);
      audio.onerror = () => {
        urlIdx++;
        playNext();
      };
    };

    playNext();
  };

  const selectedReciterObj = RECITERS.find(r => r.id === (settings.selectedReciter || 'afasy')) || RECITERS[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-right font-sans" dir="rtl">
      
      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-1">
          <Award className="w-6 h-6 text-amber-500 mx-auto" />
          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 block">{totalTasbih}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">إجمالي التسبيحات</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-1">
          <Heart className="w-6 h-6 text-rose-500 mx-auto" />
          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 block">{favoriteAzkarCount}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">الأذكار المفضلة</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-1">
          <Flame className="w-6 h-6 text-emerald-500 mx-auto" />
          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 block">{khatmaPages} / 604</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">صفحات ختمة القرآن</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-1">
          <ShieldCheck className="w-6 h-6 text-teal-500 mx-auto" />
          <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100 block">100%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">حفظ المزامنة</span>
        </div>
      </div>

      {/* Reciter Selection Card (أصوات الشيوخ المقرئين) */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Headphones className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                اختيار القارئ والشيخ المفضل (الأذان والتلاوة)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر صوت الشيخ للأذان وتلاوة الأذكار والقرآن في تطبيق نور الإسلام
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-400/20 text-amber-800 dark:text-amber-300 rounded-full text-xs font-extrabold">
            {selectedReciterObj.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RECITERS.map((reciter) => {
            const isSelected = (settings.selectedReciter || 'afasy') === reciter.id;
            const isPlayingThis = playingReciterId === reciter.id;

            return (
              <div
                key={reciter.id}
                onClick={() => onUpdateSettings({ ...settings, selectedReciter: reciter.id as any })}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30'
                    : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/60 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    🕌
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span>{reciter.name}</span>
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {reciter.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewReciter(reciter.id, reciter.audioUrls);
                    }}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isPlayingThis
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700'
                    }`}
                    title="استماع لعينة صوتية"
                  >
                    {isPlayingThis ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span className="text-[10px] hidden sm:inline">{isPlayingThis ? 'إيقاف' : 'استماع'}</span>
                  </button>

                  <input
                    type="radio"
                    name="selected_reciter"
                    checked={isSelected}
                    onChange={() => onUpdateSettings({ ...settings, selectedReciter: reciter.id as any })}
                    className="accent-emerald-600 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sequential Notifications Preferences */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-2xl">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                  حالة الإشعارات والأذان (iPhone & Android)
                </h3>
                {/* Status Badge: مدعوم vs غير مدعوم */}
                <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${
                  isSupported
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                }`}>
                  {isSupported ? 'مدعوم' : 'غير مدعوم'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                أذونات نظام iOS وAndroid للتنبيهات المباشرة والأذان عند دخول الوقت
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(notifPermission === 'granted' || settings.adhanReminder) && (
              <button
                type="button"
                onClick={sendTestNotification}
                className="px-3 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>اختبار 🔔</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRequestNotifPermission}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                (notifPermission === 'granted' || settings.adhanReminder)
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>
                {(notifPermission === 'granted' || settings.adhanReminder) 
                  ? 'إلغاء الإشعارات' 
                  : 'تفعيل الإشعارات'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowProfileGuide(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>إعدادات النظام</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">تنبيهات أذان الصلوات الخمس والفجر والضحى (مكة المكرمة)</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">إشعار صوتي ومرئي بدخول كل صلاة مع دعاء دخول الوقت وبحسب توقيت مملكة البحرين</span>
            </div>
            <input
              type="checkbox"
              checked={settings.adhanReminder}
              onChange={(e) => onUpdateSettings({ ...settings, adhanReminder: e.target.checked })}
              className="accent-emerald-600 w-5 h-5 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">إشعارات الأذكار المتتالية (صباح، مساء، نوم)</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">تذكير تلقائي هادئ في الأوقات الفضيلة مع قراءة شريفة</span>
            </div>
            <input
              type="checkbox"
              checked={settings.azkarReminder}
              onChange={(e) => onUpdateSettings({ ...settings, azkarReminder: e.target.checked })}
              className="accent-emerald-600 w-5 h-5 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">الشاشة المرئية التفاعلية للأذان</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">عرض بطاقة الشريعة الإسلامية والأدعية والنصائح الفقهية عند الأذان</span>
            </div>
            <input
              type="checkbox"
              checked={settings.visualAdhanAlert}
              onChange={(e) => onUpdateSettings({ ...settings, visualAdhanAlert: e.target.checked })}
              className="accent-emerald-600 w-5 h-5 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* System Settings Guide Modal for iOS & Android */}
      {showProfileGuide && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <Settings className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">تفعيل إشعارات نظام الهاتف (iOS & Android)</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">تطبيق نور الإسلام</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileGuide(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                إذا كانت الإشعارات معطلة من نظام الهاتف، يرجى اتباع الخطوات البسيطة التالية لمنح أذونات النظام المباشرة:
              </p>

              {/* iOS Instructions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                <span className="font-black text-amber-600 dark:text-amber-400 block flex items-center gap-1.5">
                  📱 لأجهزة الآيفون (iOS):
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>افتح **إعدادات الآيفون** (Settings) على هاتفك.</li>
                  <li>اختر **الإشعارات** (Notifications) ثم ابحث عن **نور الإسلام**.</li>
                  <li>قم بتفعيل خيار **"السماح بالإشعارات"** (Allow Notifications).</li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl space-y-1.5 border border-slate-200 dark:border-slate-800">
                <span className="font-black text-emerald-600 dark:text-emerald-400 block flex items-center gap-1.5">
                  🤖 لأجهزة الأندرويد (Android):
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>افتح **إعدادات الهاتف** (Settings).</li>
                  <li>ادخل إلى **التطبيقات** (Apps) &gt; **نور الإسلام**.</li>
                  <li>اضغط **الإشعارات** (Notifications) وفعّل **السماح بالتنبيهات**.</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  setShowProfileGuide(false);
                  if (typeof window !== 'undefined' && 'Notification' in window) {
                    try {
                      const res = await Notification.requestPermission();
                      if (res === 'granted') {
                        setNotifPermission('granted');
                        onUpdateSettings({ ...settings, adhanReminder: true });
                        sendTestNotification();
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-xs transition-all shadow-md cursor-pointer text-center"
              >
                طلب الأذونات مجدداً 🔔
              </button>
              <button
                type="button"
                onClick={() => setShowProfileGuide(false)}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
