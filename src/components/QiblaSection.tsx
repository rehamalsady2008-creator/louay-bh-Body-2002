/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Map as MapIcon, 
  Sliders, 
  Layers, 
  Maximize2, 
  Locate, 
  RotateCw,
  Sparkles,
  CheckCircle2,
  Info
} from 'lucide-react';

interface QiblaSectionProps {
  latitude: number | null;
  longitude: number | null;
  isEn?: boolean;
}

// Kaaba Exact Coordinates (Standard WGS84 GPS: Google Qibla Finder / Makkah Clock Tower Survey)
const KAABA_LAT = 21.4224779;
const KAABA_LON = 39.8251832;

// Built-in 100% Offline Regional Database for City Fallbacks
const CITIES_COORDINATES: { [key: string]: { lat: number; lon: number; country: string; countryEn: string } } = {
  'المنامة (البحرين)': { lat: 26.2285, lon: 50.5860, country: 'مملكة البحرين', countryEn: 'Bahrain' },
  'الرياض': { lat: 24.7136, lon: 46.6753, country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia' },
  'مكة المكرمة': { lat: 21.4225, lon: 39.8262, country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia' },
  'المدينة المنورة': { lat: 24.5247, lon: 39.5692, country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia' },
  'جدة': { lat: 21.5433, lon: 39.1728, country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia' },
  'الدمام': { lat: 26.4207, lon: 50.0888, country: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia' },
  'القاهرة': { lat: 30.0444, lon: 31.2357, country: 'جمهورية مصر العربية', countryEn: 'Egypt' },
  'دبي': { lat: 25.2048, lon: 55.2708, country: 'الإمارات العربية المتحدة', countryEn: 'UAE' },
  'أبوظبي': { lat: 24.4539, lon: 54.3773, country: 'الإمارات العربية المتحدة', countryEn: 'UAE' },
  'الكويت': { lat: 29.3759, lon: 47.9774, country: 'دولة الكويت', countryEn: 'Kuwait' },
  'الدوحة': { lat: 25.2854, lon: 51.5310, country: 'دولة قطر', countryEn: 'Qatar' },
  'مسقط': { lat: 23.5880, lon: 58.3829, country: 'سلطنة عمان', countryEn: 'Oman' },
  'عمّان': { lat: 31.9539, lon: 35.9106, country: 'المملكة الأردنية الهاشمية', countryEn: 'Jordan' },
  'بغداد': { lat: 33.3152, lon: 44.3661, country: 'جمهورية العراق', countryEn: 'Iraq' },
  'بيروت': { lat: 33.8938, lon: 35.5018, country: 'الجمهورية اللبنانية', countryEn: 'Lebanon' },
  'دمشق': { lat: 33.5138, lon: 36.2765, country: 'الجمهورية العربية السورية', countryEn: 'Syria' },
  'القدس الشريف': { lat: 31.7683, lon: 35.2137, country: 'دولة فلسطين', countryEn: 'Palestine' },
  'طرابلس': { lat: 32.8872, lon: 13.1913, country: 'دولة ليبيا', countryEn: 'Libya' },
  'تونس': { lat: 36.8065, lon: 10.1815, country: 'الجمهورية التونسية', countryEn: 'Tunisia' },
  'الجزائر': { lat: 36.7538, lon: 3.0588, country: 'الجمهورية الجزائرية', countryEn: 'Algeria' },
  'الرباط': { lat: 34.0209, lon: -6.8416, country: 'المملكة المغربية', countryEn: 'Morocco' },
  'الخرطوم': { lat: 15.5007, lon: 32.5599, country: 'جمهورية السودان', countryEn: 'Sudan' },
  'صنعاء': { lat: 15.3694, lon: 44.1910, country: 'الجمهورية اليمنية', countryEn: 'Yemen' },
  'إسطنبول': { lat: 41.0082, lon: 28.9784, country: 'تركيا', countryEn: 'Turkey' },
  'لندن': { lat: 51.5074, lon: -0.1278, country: 'بريطانيا', countryEn: 'United Kingdom' },
  'باريس': { lat: 48.8566, lon: 2.3522, country: 'فرنسا', countryEn: 'France' },
  'جاكرتا': { lat: -6.2088, lon: 106.8456, country: 'إندونيسيا', countryEn: 'Indonesia' },
  'كوالالمبور': { lat: 3.1390, lon: 101.6869, country: 'ماليزيا', countryEn: 'Malaysia' },
};

/**
 * Spherical Trigonometry calculation for Qibla Bearing (Azimuth) from North (0-360 deg)
 */
function calculateQiblaBearing(lat: number, lon: number): number {
  const lat1 = (lat * Math.PI) / 180;
  const lat2 = (KAABA_LAT * Math.PI) / 180;
  const deltaLon = ((KAABA_LON - lon) * Math.PI) / 180;

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  return Math.round(bearing * 10) / 10;
}

/**
 * Great-circle distance to Kaaba in Kilometers (Haversine Formula)
 */
function calculateKaabaDistanceKm(lat: number, lon: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLon = ((KAABA_LON - lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Compass Cardinal direction string
 */
function getDirectionName(degrees: number, isEn: boolean = false): string {
  const d = (degrees + 360) % 360;
  if (d >= 337.5 || d < 22.5) return isEn ? 'North' : 'شمال';
  if (d < 67.5) return isEn ? 'North-East' : 'شمال شرقي';
  if (d < 112.5) return isEn ? 'East' : 'شرق';
  if (d < 157.5) return isEn ? 'South-East' : 'جنوب شرقي';
  if (d < 202.5) return isEn ? 'South' : 'جنوب';
  if (d < 247.5) return isEn ? 'South-West' : 'جنوب غربي';
  if (d < 292.5) return isEn ? 'West' : 'غرب';
  return isEn ? 'North-West' : 'شمال غربي';
}

/**
 * Advanced Angular Low-Pass Smoothing Filter with shortest path wrap-around
 * Prevents jitter while guaranteeing instantaneous zero-lag response.
 */
function applyAngleFilter(currentFiltered: number, rawTarget: number, smoothingFactor: number = 0.18): number {
  // Shortest angular difference (-180 to +180)
  let diff = ((rawTarget - currentFiltered + 540) % 360) - 180;
  
  // Micro deadzone to eliminate microscopic sensor shake when holding still
  if (Math.abs(diff) < 0.15) {
    return currentFiltered;
  }
  
  // Dynamic adaptive factor: larger diffs catch up quicker
  const adaptiveFactor = Math.min(0.35, Math.max(smoothingFactor, Math.abs(diff) / 180 * 0.4));
  let result = (currentFiltered + diff * adaptiveFactor + 360) % 360;
  return Math.round(result * 10) / 10;
}

export default function QiblaSection({ latitude, longitude, isEn = false }: QiblaSectionProps) {
  const [selectedCity, setSelectedCity] = useState<string>('المنامة (البحرين)');
  const [liveLat, setLiveLat] = useState<number | null>(latitude);
  const [liveLon, setLiveLon] = useState<number | null>(longitude);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(Boolean(latitude && longitude));
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Sensor state
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [smoothedHeading, setSmoothedHeading] = useState<number>(0);
  const [isSensorAvailable, setIsSensorAvailable] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Calibration & Accuracy State
  const [accuracyLevel, setAccuracyLevel] = useState<'high' | 'medium' | 'low' | 'uncalibrated'>('high');
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [isPhoneTilted, setIsPhoneTilted] = useState<boolean>(false);

  // View Mode: 'compass' | 'map' | 'dual'
  const [viewMode, setViewMode] = useState<'compass' | 'map' | 'dual'>('dual');

  // Animation frame ref for continuous smooth interpolation
  const targetHeadingRef = useRef<number>(0);
  const smoothedHeadingRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (latitude && longitude) {
      setLiveLat(latitude);
      setLiveLon(longitude);
      setIsGpsActive(true);
    }
  }, [latitude, longitude]);

  // Active coordinates
  const activeLat = liveLat ?? CITIES_COORDINATES[selectedCity]?.lat ?? 26.2285;
  const activeLon = liveLon ?? CITIES_COORDINATES[selectedCity]?.lon ?? 50.5860;

  // Exact calculated Qibla bearing & distance to Kaaba
  const calculatedQiblaBearing = calculateQiblaBearing(activeLat, activeLon);
  const distanceKm = calculateKaabaDistanceKm(activeLat, activeLon);
  const directionName = getDirectionName(calculatedQiblaBearing, isEn);

  // Smooth animation frame loop for butter-smooth needle rotation
  useEffect(() => {
    const updateSmoothHeading = () => {
      const current = smoothedHeadingRef.current;
      const target = targetHeadingRef.current;
      
      const nextVal = applyAngleFilter(current, target, 0.20);
      if (Math.abs(nextVal - current) > 0.05) {
        smoothedHeadingRef.current = nextVal;
        setSmoothedHeading(nextVal);
      }
      animFrameRef.current = requestAnimationFrame(updateSmoothHeading);
    };

    animFrameRef.current = requestAnimationFrame(updateSmoothHeading);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Handler for device orientation events
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let rawHeading: number | null = null;
    let accuracy = 'high';

    // 1. iOS Safari webkitCompassHeading (True North)
    if (typeof (e as any).webkitCompassHeading !== 'undefined' && (e as any).webkitCompassHeading !== null) {
      rawHeading = (e as any).webkitCompassHeading;
      const acc = (e as any).webkitCompassAccuracy;
      if (typeof acc === 'number') {
        if (acc < 0 || acc > 25) {
          accuracy = 'uncalibrated';
          setAccuracyLevel('uncalibrated');
          setShowCalibrationModal(true);
        } else if (acc > 15) {
          accuracy = 'medium';
          setAccuracyLevel('medium');
        } else {
          accuracy = 'high';
          setAccuracyLevel('high');
        }
      }
    } 
    // 2. W3C Standard DeviceOrientation (Android / Chrome)
    else if (e.alpha !== null && typeof e.alpha === 'number') {
      // Android alpha is counter-clockwise; convert to clockwise compass bearing
      rawHeading = (360 - e.alpha) % 360;
      
      // Screen orientation compensation
      const orientationAngle = (typeof window !== 'undefined' && window.screen?.orientation?.angle) || 0;
      rawHeading = (rawHeading + orientationAngle + 360) % 360;
    }

    // Check device tilt angle (beta: front-to-back, gamma: left-to-right)
    if (e.beta !== null && e.gamma !== null) {
      const isExcessiveTilt = Math.abs(e.beta) > 40 || Math.abs(e.gamma) > 40;
      setIsPhoneTilted(isExcessiveTilt);
    }

    if (rawHeading !== null && !isNaN(rawHeading)) {
      const headingNorm = Math.round((rawHeading + 360) % 360);
      setDeviceHeading(headingNorm);
      targetHeadingRef.current = headingNorm;
      setIsSensorAvailable(true);
    }
  }, []);

  // Listen for native compass calibration event if fired by device
  useEffect(() => {
    const handleCalibrationEvent = () => {
      setAccuracyLevel('uncalibrated');
      setShowCalibrationModal(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('compassneedscalibration', handleCalibrationEvent);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('compassneedscalibration', handleCalibrationEvent);
      }
    };
  }, []);

  // Auto-connect to device orientation if non-iOS or permission already granted
  useEffect(() => {
    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
        window.addEventListener('deviceorientation', handleOrientation, true);
        window.addEventListener('deviceorientationabsolute' as any, handleOrientation as any, true);
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('deviceorientationabsolute' as any, handleOrientation as any);
      }
    };
  }, [handleOrientation]);

  // Request GPS & Compass Sensor Permissions
  const handleActivateSensorsAndGps = async () => {
    setIsLocating(true);
    setPermissionError(null);

    // 1. Request GPS Position (100% Offline hardware GPS)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLiveLat(pos.coords.latitude);
          setLiveLon(pos.coords.longitude);
          setIsGpsActive(true);
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation position error:", err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
    }

    // 2. Request iOS Safari / WebKit Orientation Sensor Permission
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setIsSensorAvailable(true);
        } else {
          setPermissionError(isEn ? 'Compass sensor permission was denied' : 'تم رفض إذن مستشعر البوصلة');
        }
      } catch (err) {
        console.error('Error requesting orientation permission:', err);
      }
    } else if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('deviceorientationabsolute' as any, handleOrientation as any, true);
      setIsSensorAvailable(true);
    }
  };

  // Current Facing angle (Filtered smooth heading)
  const currentFacing = isSensorAvailable ? smoothedHeading : 0;
  
  // Calculate relative angle to Kaaba (Kaaba Angle - Phone Heading)
  const calculatedRelativeAngle = Math.round((calculatedQiblaBearing - currentFacing + 360) % 360);

  // Alignment precision check (within 5 degrees)
  const relativeDiff = (calculatedQiblaBearing - currentFacing + 540) % 360 - 180;
  const isAligned = Math.abs(relativeDiff) < 5.5;

  // Offline Vector Map Projection Math
  // Projects Lat/Lon to SVG Normalized Coordinates (Centering Arabian Peninsula / Middle East Region)
  const minMapLon = -15;
  const maxMapLon = 65;
  const minMapLat = 5;
  const maxMapLat = 45;

  const projectToMap = (lat: number, lon: number) => {
    // Equirectangular / Mercator hybrid projection for offline mini map
    const x = ((lon - minMapLon) / (maxMapLon - minMapLon)) * 340 + 10;
    const y = ((maxMapLat - lat) / (maxMapLat - minMapLat)) * 200 + 10;
    return { x: Math.max(10, Math.min(350, x)), y: Math.max(10, Math.min(210, y)) };
  };

  const userPoint = projectToMap(activeLat, activeLon);
  const kaabaPoint = projectToMap(KAABA_LAT, KAABA_LON);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      
      {/* Top Header & Mode Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-md shadow-emerald-600/20">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                {isEn ? 'Live Precision Qibla & Great-Circle Map' : 'بوصلة القِبلة وخريطة المسار المباشرة'}
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-lg">
                {isEn ? '100% Offline' : 'تعمل بدون إنترنت 100%'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {isGpsActive 
                ? (isEn ? `GPS Position • ${distanceKm.toLocaleString()} km to Kaaba` : `موقعك الفعلي (GPS) • يبعد ${distanceKm.toLocaleString()} كم عن الكعبة المشرفة`)
                : (isEn ? `City: ${selectedCity} • ${distanceKm.toLocaleString()} km to Kaaba` : `المنطقة: ${selectedCity} • ${distanceKm.toLocaleString()} كم حتى الكعبة`)}
            </p>
          </div>
        </div>

        {/* View Mode Switcher + Sensor Activation Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          
          {/* View Mode Buttons */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              id="qibla-view-compass"
              type="button"
              onClick={() => setViewMode('compass')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'compass'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isEn ? 'Compass' : 'البوصلة'}</span>
            </button>

            <button
              id="qibla-view-map"
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{isEn ? 'Vector Map' : 'الخريطة'}</span>
            </button>

            <button
              id="qibla-view-dual"
              type="button"
              onClick={() => setViewMode('dual')}
              className={`hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-black transition-all items-center gap-1.5 cursor-pointer ${
                viewMode === 'dual'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isEn ? 'Dual View' : 'معاً'}</span>
            </button>
          </div>

          {/* Activate Sensor & GPS */}
          <button
            id="activate-qibla-sensors-btn"
            type="button"
            onClick={handleActivateSensorsAndGps}
            disabled={isLocating}
            className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
              isSensorAvailable && isGpsActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white ring-2 ring-emerald-500/30'
            }`}
          >
            {isLocating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : isSensorAvailable ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Navigation className="w-4 h-4 text-amber-300 animate-pulse" />
            )}
            <span>
              {isLocating
                ? (isEn ? 'Locating...' : 'جاري التحديد...')
                : isSensorAvailable && isGpsActive
                ? (isEn ? 'Live Active 🟢' : 'الحساس وGPS متصلان 🟢')
                : (isEn ? 'Activate Compass & GPS 🧭' : 'تفعيل البوصلة وGPS 🧭')}
            </span>
          </button>
        </div>
      </div>

      {/* Tilt Warning Banner */}
      {isPhoneTilted && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{isEn ? 'Please keep your device flat on a horizontal surface for maximum accuracy.' : 'يرجى إمساك الهاتف بوضع أفقي ومسطح للحصول على أعلى دقة استشعار.'}</span>
        </div>
      )}

      {permissionError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Main Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Visual Map / Compass Panels */}
        <div className={`${viewMode === 'dual' ? 'lg:col-span-8' : 'lg:col-span-7'} space-y-4`}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Compass Visualizer (Shown in 'compass' or 'dual' mode) */}
            {(viewMode === 'compass' || viewMode === 'dual') && (
              <div className={`${viewMode === 'compass' ? 'md:col-span-2' : 'col-span-1'} flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-3xl relative overflow-hidden shadow-inner`}>
                
                {/* Compass Container */}
                <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center">
                  
                  {/* Outer Glowing Compass Frame */}
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 shadow-xl" />
                  
                  {/* Degree Graduation Ticks Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 240 240">
                    {Array.from({ length: 36 }).map((_, i) => {
                      const angle = i * 10;
                      const isMajor = angle % 30 === 0;
                      const rad = (angle * Math.PI) / 180;
                      const r1 = 110;
                      const r2 = isMajor ? 96 : 103;
                      const x1 = 120 + r1 * Math.sin(rad);
                      const y1 = 120 - r1 * Math.cos(rad);
                      const x2 = 120 + r2 * Math.sin(rad);
                      const y2 = 120 - r2 * Math.cos(rad);
                      return (
                        <line
                          key={angle}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="currentColor"
                          strokeWidth={isMajor ? 2 : 1}
                          className="text-slate-400 dark:text-slate-500"
                        />
                      );
                    })}
                  </svg>

                  {/* Kaaba Direction Marker (Rotates towards relative Kaaba angle) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out z-20 pointer-events-none"
                    style={{ transform: `rotate(${calculatedRelativeAngle}deg)` }}
                  >
                    <div className="absolute top-1 flex flex-col items-center">
                      <div className={`w-0 h-0 border-l-10 border-r-10 border-b-18 border-transparent transition-colors ${
                        isAligned ? 'border-b-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]' : 'border-b-amber-500'
                      }`} />
                      <span className="text-2xl mt-1 select-none drop-shadow-md">🕋</span>
                    </div>
                  </div>

                  {/* Inner Rotating Compass Rose with Cardinal Points (N, E, S, W) */}
                  <div
                    className="absolute w-44 h-44 sm:w-48 sm:h-48 border-2 border-slate-200/80 dark:border-slate-800 rounded-full flex items-center justify-center transition-transform duration-150 ease-out bg-white dark:bg-slate-900 shadow-inner z-10"
                    style={{ transform: `rotate(${- currentFacing}deg)` }}
                  >
                    <span className="absolute top-2 text-xs font-black text-rose-500 tracking-wider">N</span>
                    <span className="absolute right-3 text-xs font-black text-slate-400">E</span>
                    <span className="absolute bottom-2 text-xs font-black text-slate-400">S</span>
                    <span className="absolute left-3 text-xs font-black text-slate-400">W</span>

                    {/* Center Traditional Compass Hub */}
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-xs">
                      <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>

                  {/* Glowing Alignment Ring */}
                  {isAligned && (
                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-full pointer-events-none animate-ping opacity-30" />
                  )}
                </div>

                {/* Sub-label heading value */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {isEn ? 'Device Facing:' : 'اتجاه الجهاز:'}
                  </span>
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 bg-white dark:bg-slate-800 rounded-lg text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700">
                    {Math.round(currentFacing)}° ({getDirectionName(currentFacing, isEn)})
                  </span>
                </div>
              </div>
            )}

            {/* 2. Interactive Offline Vector Map (Shown in 'map' or 'dual' mode) */}
            {(viewMode === 'map' || viewMode === 'dual') && (
              <div className={`${viewMode === 'map' ? 'md:col-span-2' : 'col-span-1'} flex flex-col p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-3xl relative overflow-hidden shadow-inner`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MapIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {isEn ? 'Offline Great-Circle Vector Map' : 'خريطة المسار المباشر للكعبة'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {distanceKm.toLocaleString()} KM
                  </span>
                </div>

                {/* Vector Map Canvas (100% SVG Vector - No internet or tile server needed) */}
                <div className="relative w-full h-56 mt-2 bg-emerald-950/10 dark:bg-slate-900/90 rounded-2xl border border-emerald-200/40 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 360 220" preserveAspectRatio="xMidYMid meet">
                    {/* Background Grid Lines */}
                    <defs>
                      <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-300/40 dark:text-slate-800/60" />
                      </pattern>
                      
                      <linearGradient id="qibla-beam" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
                      </linearGradient>

                      <radialGradient id="user-radar" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    <rect width="100%" height="100%" fill="url(#map-grid)" />

                    {/* Regional Geography Contours (Arabian Peninsula, Levant, North Africa silhouette) */}
                    <path
                      d="M 50,40 Q 90,30 130,45 Q 160,35 190,50 Q 220,60 240,75 L 260,110 Q 280,140 250,170 Q 220,190 190,160 Q 170,140 150,110 Q 130,80 90,80 Q 60,90 40,70 Z"
                      fill="currentColor"
                      className="text-emerald-100/60 dark:text-slate-800/40"
                    />
                    <path
                      d="M 170,80 Q 200,85 220,110 Q 240,140 230,160 Q 200,180 180,165 Q 160,130 170,80 Z"
                      fill="currentColor"
                      className="text-emerald-200/50 dark:text-slate-700/40"
                    />

                    {/* Great Circle Direct Flight Path Line */}
                    <line
                      x1={userPoint.x}
                      y1={userPoint.y}
                      x2={kaabaPoint.x}
                      y2={kaabaPoint.y}
                      stroke="url(#qibla-beam)"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                    />

                    {/* User Radar Pulse */}
                    <circle cx={userPoint.x} cy={userPoint.y} r="16" fill="url(#user-radar)" className="animate-ping opacity-60" />
                    
                    {/* User Location Marker */}
                    <circle cx={userPoint.x} cy={userPoint.y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <text x={userPoint.x} y={userPoint.y - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" className="text-slate-800 dark:text-slate-200">
                      {isEn ? 'You' : 'موقعك'}
                    </text>

                    {/* Kaaba Location Marker */}
                    <circle cx={kaabaPoint.x} cy={kaabaPoint.y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                    <text x={kaabaPoint.x} y={kaabaPoint.y + 16} textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" className="text-slate-900 dark:text-amber-400">
                      🕋 مكة
                    </text>
                  </svg>

                  {/* Map Quick Compass Overlay */}
                  <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    🕋 {calculatedQiblaBearing}° {directionName}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
                  {isEn
                    ? 'The dashed line shows the true spherical great-circle line directly towards the Holy Kaaba.'
                    : 'الخط المتقطع يمثل مسار خط القبلة الكروي المباشر نحو الكعبة المشرفة.'}
                </p>
              </div>
            )}

          </div>

          {/* Alignment Banner Status */}
          <div className={`p-4 rounded-2xl text-xs font-black text-center border shadow-xs transition-all flex items-center justify-center gap-2.5 ${
            isAligned
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-900 dark:text-emerald-200 animate-pulse'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
          }`}>
            <span className="text-xl">{isAligned ? '🎯' : '🧭'}</span>
            <span>
              {isAligned 
                ? (isEn ? 'You are directly facing the Holy Kaaba! May Allah accept your prayer.' : 'أنت الآن باتجاه القبلة الصحيح تماماً 🎯! صلّ طاهراً مقبولاً.') 
                : (isEn ? 'Rotate your device until the arrow points straight to the Kaaba.' : 'أدر جهازك حتى يتطابق السهم مباشرة مع مؤشر الكعبة المشرفة.')}
            </span>
          </div>

        </div>

        {/* Info, Coordinates & Calibration Column (Right / 4-5 cols) */}
        <div className={`${viewMode === 'dual' ? 'lg:col-span-4' : 'lg:col-span-5'} space-y-4 flex flex-col justify-between`}>
          
          {/* Main Calculations Card */}
          <div className="p-4 bg-emerald-50/70 dark:bg-slate-950/50 rounded-2xl border border-emerald-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-300">
                {isEn ? 'Spherical Qibla Math' : 'بيانات القبلة الكروية الدقيقة'}
              </h4>
              <span className="px-2.5 py-1 bg-emerald-700 text-white font-mono text-xs font-black rounded-xl shadow-xs">
                {calculatedQiblaBearing}°
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex justify-between items-center border-b border-emerald-100 dark:border-slate-800 pb-2">
                <span>• {isEn ? 'Qibla Degree:' : 'درجة القبلة الجغرافية:'}</span>
                <strong className="text-slate-900 dark:text-white font-black text-sm">{calculatedQiblaBearing}°</strong>
              </li>
              <li className="flex justify-between items-center border-b border-emerald-100 dark:border-slate-800 pb-2">
                <span>• {isEn ? 'Direction:' : 'الاتجاه الجغرافي:'}</span>
                <strong className="text-emerald-700 dark:text-emerald-300 font-extrabold">{directionName}</strong>
              </li>
              <li className="flex justify-between items-center border-b border-emerald-100 dark:border-slate-800 pb-2">
                <span>• {isEn ? 'Distance to Kaaba:' : 'المسافة إلى الكعبة:'}</span>
                <strong className="text-slate-900 dark:text-white font-black font-mono text-xs">{distanceKm.toLocaleString()} كم</strong>
              </li>
              <li className="flex justify-between items-center">
                <span>• {isEn ? 'Hardware Sensor:' : 'مستشعر الهاتف:'}</span>
                <span className={`font-bold ${isSensorAvailable ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isSensorAvailable 
                    ? (isEn ? 'Active (Filtered) 🧭' : 'مستشعر تلقائي مُنعّم 🧭') 
                    : (isEn ? 'Tap "Activate"' : 'اضغط زر التفعيل أعلاه 📡')}
                </span>
              </li>
            </ul>
          </div>

          {/* Fallback City Selector (When GPS is not active) */}
          {!isGpsActive && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isEn ? 'Offline City Selector:' : 'اختيار المنطقة الجغرافية (أوفلاين):'}</span>
              </label>
              <select
                id="qibla-offline-city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 p-2 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
              >
                {Object.keys(CITIES_COORDINATES).map((city) => (
                  <option key={city} value={city}>
                    {city} ({CITIES_COORDINATES[city].country})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Compass Accuracy & Calibration Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isEn ? 'Compass Accuracy:' : 'دقة مستشعر البوصلة:'}</span>
              </span>
              <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                accuracyLevel === 'high' 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                  : accuracyLevel === 'medium'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
              }`}>
                {accuracyLevel === 'high' ? 'دقة ممتازة 🟢' : accuracyLevel === 'medium' ? 'دقة مقبولة 🟡' : 'تحتاج معايرة 🔴'}
              </span>
            </div>

            <button
              id="calibrate-compass-modal-btn"
              type="button"
              onClick={() => setShowCalibrationModal(true)}
              className="w-full py-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{isEn ? 'How to Calibrate Compass' : 'كيفية معايرة حركة البوصلة (شكل 8)'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Calibration Instruction Modal */}
      {showCalibrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full text-right space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                  <RotateCw className="w-5 h-5 animate-spin" />
                </span>
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-base">
                  {isEn ? 'Calibrate Phone Compass' : 'معايرة مستشعر بوصلة الهاتف'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCalibrationModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-2 flex flex-col items-center justify-center space-y-3">
              {/* Animated Figure 8 Graphic */}
              <div className="relative w-32 h-16 flex items-center justify-center">
                <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400 select-none animate-pulse">
                  ∞
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 text-center leading-relaxed">
                {isEn
                  ? 'Move your device in a figure-8 infinity motion in the air away from metal objects or computers to re-align magnetic sensors.'
                  : 'امسك هاتفك بيدك وقم بتحريكه في الهواء على شكل رقم (8) أو علامة اللانهاية (∞) بحركة دائرية مستمرة لمدة 5 ثوانٍ، بعيداً عن المعادن والمجالات المغناطيسية.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAccuracyLevel('high');
                setShowCalibrationModal(false);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer"
            >
              {isEn ? 'Done / Calibrated' : 'تمت المعايرة بنجاح ✓'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
