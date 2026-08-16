/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { X, Bell, Volume2, VolumeX, Calendar, Sparkles, Eye, Upload, Trash2, Globe, Moon, Sun, Download, Settings, ShieldCheck, AlertCircle } from 'lucide-react';
import { AppSettings } from '../types';
import { PRAYER_COUNTRIES } from '../data/prayerCities';
import { PrayerNotificationManager } from '../utils/prayerNotifications';
// @ts-ignore
import defaultLogo from '../assets/images/app_logo_1784266160080.jpg';
// @ts-ignore
import defaultBanner from '../assets/images/mosque_banner_1784263300816.jpg';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [showSettingsGuide, setShowSettingsGuide] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingFeature, setPendingFeature] = useState<'adhan' | 'azkar' | 'visual' | 'system' | null>(null);

  // Check notification permission state
  const isNotificationSupported = typeof window !== 'undefined' && ('Notification' in window || 'Capacitor' in window);

  const getSystemPermissionState = (): 'granted' | 'denied' | 'default' | 'unsupported' => {
    if (!isNotificationSupported) return 'unsupported';
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission as 'granted' | 'denied' | 'default';
    }
    return 'default';
  };

  const [permissionStatus, setPermissionStatus] = useState<string>(() => {
    const sysState = getSystemPermissionState();
    if (sysState === 'denied') return 'denied';
    if (settings.adhanReminder || sysState === 'granted') return 'granted';
    return sysState;
  });

  const isSupported = isNotificationSupported && permissionStatus !== 'unsupported';

  // Helper to trigger request permission with interactive confirmation dialog
  const requestNotificationPermissionWithConfirm = (feature: 'adhan' | 'azkar' | 'visual' | 'system') => {
    // Immediately update settings so the UI toggle turns ON reliably
    applyFeatureToggle(feature, true);

    const isNativeGranted = permissionStatus === 'granted' || (typeof Notification !== 'undefined' && Notification.permission === 'granted');
    if (!isNativeGranted) {
      // Show confirmation dialog to allow requesting OS native permissions
      setPendingFeature(feature);
      setShowConfirmModal(true);
    }
  };

  const applyFeatureToggle = (feature: 'adhan' | 'azkar' | 'visual' | 'system', enable: boolean) => {
    if (feature === 'adhan') {
      onUpdateSettings({ ...settings, adhanReminder: enable });
    } else if (feature === 'azkar') {
      onUpdateSettings({ ...settings, azkarReminder: enable });
    } else if (feature === 'visual') {
      onUpdateSettings({ ...settings, visualAdhanAlert: enable });
    } else if (feature === 'system') {
      onUpdateSettings({ ...settings, adhanReminder: enable, azkarReminder: enable, visualAdhanAlert: enable });
    }
  };

  const handleConfirmAndRequestPermission = async () => {
    setShowConfirmModal(false);

    // Make sure pending feature stays enabled in settings
    if (pendingFeature) {
      applyFeatureToggle(pendingFeature, true);
    } else {
      onUpdateSettings({ ...settings, adhanReminder: true, azkarReminder: true, visualAdhanAlert: true });
    }

    let granted = false;

    // 1. Try Capacitor Native local notifications permission
    try {
      granted = await PrayerNotificationManager.requestPermissions();
    } catch (e) {
      console.log('Capacitor local notifications check:', e);
    }

    // 2. Try standard Web Notification API permission
    if (!granted && typeof window !== 'undefined' && 'Notification' in window && typeof Notification.requestPermission === 'function') {
      try {
        if (Notification.permission === 'granted') {
          granted = true;
        } else if (Notification.permission !== 'denied') {
          const result = await Notification.requestPermission();
          if (result === 'granted') {
            granted = true;
          }
        }
      } catch (err) {
        console.error('Error requesting web notification permission:', err);
      }
    }

    if (granted) {
      setPermissionStatus('granted');

      try {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(settings.language === 'en' ? 'Noor Al-Islam 🕌' : 'نور الإسلام 🕌', {
            body: settings.language === 'en'
              ? 'iPhone & Android Notifications enabled successfully!'
              : 'تم تفعيل إشعارات وتنبيهات الأذان والأذكار بنجاح!',
            dir: 'rtl',
            icon: defaultLogo
          });
        }
      } catch (e) {
        console.log('Test notification creation:', e);
      }
    } else {
      // Set status to denied if blocked at OS/browser level
      setPermissionStatus('denied');
    }

    setPendingFeature(null);
  };

  const handleToggleSystemNotification = async () => {
    const isCurrentlyActive = permissionStatus === 'granted' || settings.adhanReminder;

    if (isCurrentlyActive) {
      // User wants to disable
      setPermissionStatus('default');
      onUpdateSettings({ ...settings, adhanReminder: false, azkarReminder: false, visualAdhanAlert: false });
      return;
    }

    requestNotificationPermissionWithConfirm('system');
  };

  const handleSendTestNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(settings.language === 'en' ? 'Test Notification - Noor Al-Islam 🕌' : 'إشعار نظام تجريبي - نور الإسلام 🕌', {
          body: settings.language === 'en'
            ? 'System notifications are working perfectly on your device!'
            : 'إشعارات النظام تعمل بنجاح على هاتفك!',
          dir: 'rtl',
          icon: defaultLogo
        });
      } catch (e) {
        console.error('Failed to trigger test notification:', e);
      }
    }

    try {
      const audio = new Audio('https://cdn.aladhan.com/audio/adhan/makkah.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    alert(settings.language === 'en' ? 'Test notification sent! 🔔' : 'تم إرسال إشعار الأذان التجريبي بنجاح! 🔔');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 3MB to avoid localStorage limit issues
    if (file.size > 3 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 3 ميجابايت.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (type === 'logo') {
          onUpdateSettings({ ...settings, appLogoUrl: result });
        } else {
          onUpdateSettings({ ...settings, headerBgUrl: result });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleAdhan = () => {
    if (!settings.adhanReminder) {
      requestNotificationPermissionWithConfirm('adhan');
    } else {
      onUpdateSettings({ ...settings, adhanReminder: false });
    }
  };

  const toggleVisualAdhan = () => {
    if (!settings.visualAdhanAlert) {
      requestNotificationPermissionWithConfirm('visual');
    } else {
      onUpdateSettings({ ...settings, visualAdhanAlert: false });
    }
  };

  const toggleAzkar = () => {
    if (!settings.azkarReminder) {
      requestNotificationPermissionWithConfirm('azkar');
    } else {
      onUpdateSettings({ ...settings, azkarReminder: false });
    }
  };

  const changeMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      calculationMethod: e.target.value as AppSettings['calculationMethod'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="settings-modal"
        className="w-full max-w-lg bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col text-right font-sans"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 dark:border-slate-800 bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="text-xl font-bold font-sans">إعدادات التطبيق</h3>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Dedication and Developer Details (REQUIRED AT THE TOP) */}
          <div className="p-5 bg-gradient-to-br from-emerald-600/10 to-amber-600/10 dark:from-emerald-950/30 dark:to-slate-950/30 border border-emerald-500/20 rounded-2xl space-y-4">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                صدقة جارية
              </span>
              <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                تطبيق {settings.appName || "نور الإسلام"}
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {settings.dedicationText || (
                  <>
                    هذا التطبيق صدقة جارية بإذن اللّٰه تعالى عن{' '}
                    <strong className="text-emerald-700 dark:text-emerald-300">لؤي بن حسين</strong>
                    <br />
                    وعن والده رحمه اللّٰه وغفر له
                    <br />
                    وجميع المسلمين والمسلمات الأحياء منهم والأموات.
                  </>
                )}
              </p>
            </div>

            <div className="border-t border-emerald-500/10 pt-3 flex flex-col items-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مطور التطبيق: <strong className="text-slate-700 dark:text-slate-300">{settings.developerName || "لؤي بن حسين"}</strong>
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {/* Snapchat Follow */}
                <a
                  id="snapchat-follow-link"
                  href={settings.snapchatUrl || "https://snapchat.com/t/vezdvWWb"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <span className="font-sans font-extrabold">👻</span>
                  تابعني على سناب شات
                </a>

                {/* Download Source Code ZIP */}
                <a
                  id="download-source-zip-btn"
                  href="/api/download-zip"
                  download="Noor_Al_Islam_SourceCode.zip"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  تحميل كود المشروع (ZIP)
                </a>
              </div>
            </div>
          </div>



          {/* Core Configuration Toggles */}
          <div className="space-y-4">
            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 border-r-4 border-emerald-500 pr-2">
              {settings.language === 'en' ? 'App Preferences & Language' : 'تفضيلات التطبيق واللغة والمظهر'}
            </h5>

            {/* Language Selector */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {settings.language === 'en' ? 'App Language' : 'لغة التطبيق'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {settings.language === 'en' ? 'Switch between Arabic & English' : 'التحويل بين العربية والإنجليزية'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  id="settings-lang-ar-btn"
                  onClick={() => onUpdateSettings({ ...settings, language: 'ar' })}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    (settings.language || 'ar') === 'ar'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  العربية
                </button>
                <button
                  id="settings-lang-en-btn"
                  onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    settings.language === 'en'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {settings.language === 'en' ? 'Dark Mode (Appearance)' : 'الوضع الليلي (المظهر)'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {settings.language === 'en' ? 'Toggle dark / light display mode' : 'التبديل بين المظهر الفاتح والداكن'}
                  </p>
                </div>
              </div>
              <button
                id="settings-toggle-theme-btn"
                onClick={() => onUpdateSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.theme === 'dark' ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Country and City Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  الدولة:
                </label>
                <select
                  id="settings-country-select"
                  value={settings.country || 'مملكة البحرين'}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    const countryObj = PRAYER_COUNTRIES.find(c => c.ar === newCountry) || PRAYER_COUNTRIES[0];
                    const firstCity = countryObj.cities[0].ar;
                    onUpdateSettings({ ...settings, country: newCountry, city: firstCity });
                  }}
                  className="w-full px-3 py-2 bg-emerald-50/50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PRAYER_COUNTRIES.map((c) => (
                    <option key={c.ar} value={c.ar}>
                      {c.ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  المدينة:
                </label>
                <select
                  id="settings-city-select"
                  value={settings.city || 'المنامة'}
                  onChange={(e) => onUpdateSettings({ ...settings, city: e.target.value })}
                  className="w-full px-3 py-2 bg-emerald-50/50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(PRAYER_COUNTRIES.find(c => c.ar === (settings.country || 'مملكة البحرين')) || PRAYER_COUNTRIES[0]).cities.map((city) => (
                    <option key={city.ar} value={city.ar}>
                      {city.ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prayer Calculation Method */}
            <div className="flex flex-col gap-1.5 p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                طريقة حساب مواقيت الصلاة:
              </label>
              <select
                id="calculation-method-select"
                value={settings.calculationMethod}
                onChange={changeMethod}
                className="w-full px-3 py-2 bg-emerald-50/50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="UmmAlQura">جامعة أم القرى (مكة المكرمة)</option>
                <option value="MWL">رابطة العالم الإسلامي</option>
                <option value="ISNA">الجمعية الإسلامية لأمريكا الشمالية (ISNA)</option>
                <option value="Egypt">الهيئة العامة المصرية للمساحة</option>
              </select>
            </div>

            {/* Notification Status & Native Permissions Card */}
            <div className="p-4 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-950/60 dark:to-slate-900/40 rounded-2xl border-2 border-emerald-500/20 dark:border-slate-800 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl shadow-xs ${
                    (permissionStatus === 'granted' || settings.adhanReminder)
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : permissionStatus === 'denied'
                      ? 'bg-red-500 text-white shadow-red-500/20'
                      : 'bg-amber-500 text-white shadow-amber-500/20'
                  }`}>
                    <Bell className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h6 className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {settings.language === 'en' ? 'Notification Status' : 'حالة الإشعارات بالنظام'}
                      </h6>
                      {/* Colored Status Indicator Badge (Green for supported, Red for unsupported) */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-black rounded-full border shadow-2xs ${
                        isSupported
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
                          : 'bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                      }`}>
                        <span className={`relative flex h-2 w-2`}>
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isSupported ? 'bg-emerald-400' : 'bg-red-400'
                          }`} />
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${
                            isSupported ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                        </span>
                        <span>
                          {isSupported
                            ? (settings.language === 'en' ? 'Supported (Active)' : 'مدعوم 🟢')
                            : (settings.language === 'en' ? 'Not Supported' : 'غير مدعوم 🔴')}
                        </span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                      {isSupported
                        ? (permissionStatus === 'granted'
                            ? (settings.language === 'en' ? 'Native OS notifications enabled & active' : 'أذونات الإشعارات المباشرة مفعلة ومسموح بها في النظام')
                            : permissionStatus === 'denied'
                            ? (settings.language === 'en' ? 'Disabled in device system settings' : 'الإشعارات معطلة من إعدادات الهاتف بالنظام')
                            : (settings.language === 'en' ? 'Pending native permission' : 'أذونات النظام بانتظار التفعيل'))
                        : (settings.language === 'en' ? 'Notifications are disabled in device settings' : 'الإشعارات معطلة من إعدادات الهاتف بالنظام')}
                    </p>
                  </div>
                </div>

                {/* Status Toggle Badge */}
                <span className={`px-3 py-1 text-[11px] font-black rounded-xl shrink-0 border ${
                  (permissionStatus === 'granted' || settings.adhanReminder)
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  {(permissionStatus === 'granted' || settings.adhanReminder)
                    ? (settings.language === 'en' ? 'Active ✓' : 'مفعل ✓')
                    : (settings.language === 'en' ? 'Inactive' : 'غير مفعل')}
                </span>
              </div>

              {/* Prominent Action Buttons Row */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {/* Prominent Activation Button */}
                <button
                  id="settings-toggle-notifications-btn"
                  type="button"
                  onClick={handleToggleSystemNotification}
                  className={`flex-1 min-w-[160px] py-3 px-4 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-98 ${
                    (permissionStatus === 'granted' || settings.adhanReminder)
                      ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/20'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>
                    {(permissionStatus === 'granted' || settings.adhanReminder)
                      ? (settings.language === 'en' ? 'Disable Notifications' : 'إلغاء الإشعارات')
                      : (settings.language === 'en' ? '🔔 Enable Notifications Now' : '🔔 تفعيل الإشعارات والتنبيهات الآن')}
                  </span>
                </button>

                {/* System Settings Button */}
                <button
                  type="button"
                  onClick={() => setShowSettingsGuide(true)}
                  className="px-3.5 py-3 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                  title="فتح إعدادات النظام للآيفون والأندرويد"
                >
                  <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>إعدادات النظام</span>
                </button>

                {(permissionStatus === 'granted' || settings.adhanReminder) && (
                  <button
                    id="settings-test-notification-btn"
                    type="button"
                    onClick={handleSendTestNotification}
                    className="px-3.5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-xs border border-amber-300"
                  >
                    {settings.language === 'en' ? 'Test 🔔' : 'اختبار الإشعار 🔔'}
                  </button>
                )}
              </div>
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.soundEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">الأصوات والمؤثرات الصوتية</p>
                    {/* Status Indicator */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                      settings.soundEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {settings.soundEnabled ? 'الصوت نشط' : 'مكتوم'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">صوت نقرات التسبيح والتنبيهات</p>
                </div>
              </div>
              <button
                id="toggle-sound-btn"
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.soundEnabled ? '-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Adhan Reminder Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.adhanReminder ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">تذكير مواقيت الصلاة (الأذان)</p>
                    {/* Status Indicator */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                      settings.adhanReminder
                        ? (permissionStatus === 'granted'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800')
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        settings.adhanReminder
                          ? (permissionStatus === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-teal-500')
                          : 'bg-slate-400'
                      }`} />
                      {settings.adhanReminder
                        ? (permissionStatus === 'granted' ? 'مفعل بالنظام (Native)' : 'مفعل بالتطبيق')
                        : 'معطل'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">إشعار صوتي عند دخول وقت الأذان والإقامة</p>
                </div>
              </div>
              <button
                id="toggle-adhan-btn"
                onClick={toggleAdhan}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.adhanReminder ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.adhanReminder ? '-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Visual Adhan Alert Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.visualAdhanAlert ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">تنبيه الأذان المرئي والدعاء</p>
                    {/* Status Indicator */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                      settings.visualAdhanAlert
                        ? (permissionStatus === 'granted'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800')
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        settings.visualAdhanAlert
                          ? (permissionStatus === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-teal-500')
                          : 'bg-slate-400'
                      }`} />
                      {settings.visualAdhanAlert
                        ? (permissionStatus === 'granted' ? 'مفعل بالنظام (Native)' : 'مفعل بالتطبيق')
                        : 'معطل'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">عرض نصائح دينية قصيرة وأدعية مباركة عند كل أذان</p>
                </div>
              </div>
              <button
                id="toggle-visual-adhan-btn"
                onClick={toggleVisualAdhan}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.visualAdhanAlert ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.visualAdhanAlert ? '-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Azkar Reminder Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/40 rounded-xl border border-emerald-100/30 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.azkarReminder ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">تنبيهات الأذكار اليومية</p>
                    {/* Status Indicator */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                      settings.azkarReminder
                        ? (permissionStatus === 'granted'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800')
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        settings.azkarReminder
                          ? (permissionStatus === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-teal-500')
                          : 'bg-slate-400'
                      }`} />
                      {settings.azkarReminder
                        ? (permissionStatus === 'granted' ? 'مفعل بالنظام (Native)' : 'مفعل بالتطبيق')
                        : 'معطل'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">تذكير بقراءة أذكار الصباح والمساء والأدعية</p>
                </div>
              </div>
              <button
                id="toggle-azkar-btn"
                onClick={toggleAzkar}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.azkarReminder ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.azkarReminder ? '-translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-emerald-100 dark:border-slate-800 bg-emerald-50 dark:bg-slate-950/80 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-sans">
          <span>© 2026 - جميع الحقوق محفوظة</span>
          <span>لؤي بن حسين</span>
        </div>
      </div>

      {/* Interactive Permission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Bell className="w-6 h-6 animate-bounce" />
              </span>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  أهمية التنبيهات والإشعارات اليومية 🕌
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">تطبيق نور الإسلام</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/40">
              تفعيل الإشعارات يضمن لك عدم تفويت مواقيت الصلاة والأذان، والاستماع للأدعية والمأثورات، وتلقي أذكار الصباح والمساء في أوقاتها المباركة.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmAndRequestPermission}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-xs transition-all shadow-md cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>موافق، تفعيل الإشعارات 🔔</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingFeature(null);
                }}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Guide Modal for iOS & Android */}
      {showSettingsGuide && (
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
                onClick={() => setShowSettingsGuide(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg text-lg"
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
                  setShowSettingsGuide(false);
                  if (typeof window !== 'undefined' && 'Notification' in window) {
                    try {
                      const res = await Notification.requestPermission();
                      if (res === 'granted') {
                        setPermissionStatus('granted');
                        onUpdateSettings({ ...settings, adhanReminder: true });
                        handleSendTestNotification();
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
                onClick={() => setShowSettingsGuide(false)}
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
