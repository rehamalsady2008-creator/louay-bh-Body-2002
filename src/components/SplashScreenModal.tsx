/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, Compass, ArrowLeft } from 'lucide-react';

// @ts-ignore
import defaultLogo from '../assets/images/app_logo_1784266160080.jpg';

interface SplashScreenModalProps {
  onFinish: () => void;
  isEn?: boolean;
  logoUrl?: string;
}

export default function SplashScreenModal({ onFinish, isEn = false, logoUrl }: SplashScreenModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const displayLogo = logoUrl || defaultLogo;

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden"
        dir="rtl"
      >
        {/* Background Islamic Geometric Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header / Bismillah */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center z-10 space-y-2 pt-4"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-bold text-amber-300 font-kufi shadow-sm backdrop-blur-md">
            ﷽
          </div>
          <p className="text-xs text-emerald-200/80 font-sans tracking-wide">
            {isEn ? 'In the Name of Allah, the Most Gracious, the Most Merciful' : 'بسم الله الرحمن الرحيم'}
          </p>
        </motion.div>

        {/* Center Main Hero Logo & Greeting */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col items-center text-center space-y-6 z-10 max-w-md my-auto"
        >
          {/* Logo Icon with Glowing Circle */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-500 to-amber-300 blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-amber-300 via-emerald-600 to-amber-500 p-1.5 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 border-2 border-amber-300/60 flex items-center justify-center shadow-inner">
                <img
                  src={displayLogo}
                  alt="شعار نور الإسلام"
                  className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* App Title & Greeting */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black font-kufi text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-emerald-200 drop-shadow-md">
              {isEn ? 'Welcome to Noor Al-Islam' : 'أهلاً بك في تطبيق نور الإسلام'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans px-4">
              {isEn
                ? 'Your comprehensive Islamic companion for Prayer Times, Azkar, Holy Quran, and AI Islamic Guidance.'
                : 'رفيقك اليومي الشامل للعبادة، مواقيت الصلاة والأذان، الأذكار والقرآن الكريم، والمستشار الإسلامي الذكي.'}
            </p>
          </div>

          {/* Quick Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[11px] text-amber-200 border border-white/10 font-kufi">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>القرآن الكريم والتفسير</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[11px] text-emerald-200 border border-white/10 font-kufi">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>مواقيت الصلاة والأذان</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[11px] text-teal-200 border border-white/10 font-kufi">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>الذكاء الاصطناعي الإسلامي</span>
            </span>
          </div>
        </motion.div>

        {/* Bottom Countdown Timer & Skip Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-sm space-y-4 z-10 pb-4 text-center"
        >
          {/* Progress Bar & Countdown text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-200/90 font-kufi px-1">
              <span>جاري الدخول إلى التطبيق...</span>
              <span className="font-mono text-amber-300 text-sm font-extrabold">{timeLeft} ثوانٍ</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / 5) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Skip Button */}
          <button
            id="splash-skip-button"
            onClick={onFinish}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 font-kufi active:scale-98"
          >
            <span>التخطي والدخول للتطبيق الآن</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
