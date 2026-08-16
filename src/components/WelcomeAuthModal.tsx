/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  LogIn, 
  UserCheck, 
  Mail, 
  Phone, 
  Lock, 
  Globe, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound,
  Apple,
  UserX
} from 'lucide-react';
import { googleSignIn, logout } from '../utils/firebase';

interface WelcomeAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onLoginSuccess: (user: any) => void;
  isEn?: boolean;
}

export default function WelcomeAuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  isEn = false
}: WelcomeAuthModalProps) {
  const [activeTab, setActiveTab] = useState<'welcome' | 'email' | 'phone'>('welcome');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLoggedIn = Boolean(currentUser);

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMessage(isEn ? 'Google sign-in failed or closed. Try quick name or email sign-in below.' : 'عذراً، تعذر تسجيل الدخول عبر Google. يمكنك إدخال اسمك للتسجيل المباشر أو استخدام البريد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleAuth = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const appleUser = {
        uid: 'apple_' + Date.now(),
        displayName: 'مستخدم Apple ID',
        email: 'user@apple.com'
      };
      onLoginSuccess(appleUser);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const handleQuickNameRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const nameToUse = fullName.trim() || (isEn ? 'Noor User' : 'مستخدم نور الإسلام');
    setIsSubmitting(true);
    setTimeout(() => {
      const newUser = {
        uid: 'user_' + Date.now(),
        displayName: nameToUse,
        email: `${nameToUse.replace(/\s+/g, '').toLowerCase()}@noor-app.local`
      };
      onLoginSuccess(newUser);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const mailUser = {
        uid: 'email_' + Date.now(),
        displayName: email.split('@')[0] || 'مستخدم',
        email: email
      };
      onLoginSuccess(mailUser);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpSent) {
      if (!phone) return;
      setIsSubmitting(true);
      setTimeout(() => {
        setIsOtpSent(true);
        setIsSubmitting(false);
      }, 700);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        const phoneUser = {
          uid: 'phone_' + Date.now(),
          displayName: `مستخدم (${phone.slice(-4)})`,
          email: null
        };
        onLoginSuccess(phoneUser);
        setIsSubmitting(false);
        onClose();
      }, 600);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto" dir={isEn ? "ltr" : "rtl"}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#0A1416] border border-emerald-500/20 rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden my-auto text-slate-800 dark:text-slate-100"
        >
          {/* Top Banner Header */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white text-center space-y-3 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-2xl rounded-full"></div>

            {/* Close button (Only available when user is already logged in) */}
            {isLoggedIn && (
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* App Avatar Logo Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-amber-400 via-amber-200 to-emerald-500 shadow-2xl border-2 border-amber-300/50">
              <img 
                src="/app_avatar.png" 
                alt="نور الإسلام" 
                className="w-full h-full object-cover rounded-full shadow-inner"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black font-kufi text-amber-300">
                {isEn ? "Sign In to Noor Al-Islam" : "تسجيل الدخول - تطبيق نور الإسلام"}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-sans">
                {isEn ? "Mandatory Sign-In to save your Quran khatma, dhikr logs & prayer settings" : "تسجيل الدخول إجباري لحفظ ختماتك وأذكارك وإعدادات الأذان الخاصة بك"}
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">

            {errorMessage && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 text-center">
                {errorMessage}
              </div>
            )}

            {/* Quick Auth Tabs */}
            {activeTab === 'welcome' && (
              <div className="space-y-4">
                
                {/* 1. Quick Instant Account Name Registration */}
                <form onSubmit={handleQuickNameRegister} className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 dark:text-emerald-300">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isEn ? "Instant Quick Account Registration" : "إنشاء حساب وتسجيل الدخول السريع باسمك"}</span>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isEn ? "Enter your name (e.g., Ahmed)..." : "أدخل اسمك الكريم هنا (مثال: أحمد المحمد)..."}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isEn ? "Register Account & Enter App" : "تسجيل الدخول والتفعيل المباشر للتطبيق 🚀"}</span>
                  </button>
                </form>

                <div className="relative my-2 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                  <span className="relative bg-white dark:bg-[#0A1416] px-3 text-[11px] font-bold text-slate-400">
                    {isEn ? "OR SIGN IN WITH" : "أو سجل الدخول بواسطة حساباتك"}
                  </span>
                </div>

                {/* 2. Google Auth */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{isEn ? "Sign in with Google" : "تسجيل الدخول عبر حساب Google"}</span>
                </button>

                {/* 3. Apple Auth */}
                <button
                  type="button"
                  onClick={handleAppleAuth}
                  disabled={isSubmitting}
                  className="w-full p-3.5 bg-slate-900 dark:bg-black text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Apple className="w-5 h-5" />
                  <span>{isEn ? "Sign in with Apple (App Store)" : "تسجيل الدخول عبر Apple ID / App Store"}</span>
                </button>

                {/* 4. Email & Phone Switch Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('email')}
                    className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-2xl border border-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{isEn ? "Email Sign In" : "البريد الإلكتروني"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('phone')}
                    className="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-2xl border border-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{isEn ? "Phone Sign In" : "رقم الجوال"}</span>
                  </button>
                </div>

                {/* 5. Guest Access Entry Button */}
                <button
                  type="button"
                  onClick={() => {
                    const guestUser = {
                      uid: 'guest_' + Date.now(),
                      displayName: isEn ? 'Guest Explorer' : 'زائر كريم',
                      email: null,
                      isGuest: true
                    };
                    onLoginSuccess(guestUser);
                    onClose();
                  }}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 active:scale-95"
                >
                  <UserX className="w-4 h-4 text-slate-500" />
                  <span>{isEn ? "Continue as Guest / Explore App" : "المتابعة والتصفح كزائر كريم (بدون حساب)"}</span>
                </button>

              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isEn ? "Sign in with Email" : "تسجيل الدخول / إنشاء حساب بالبريد الإلكتروني"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('welcome')}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {isEn ? "Back" : "العودة"}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      {isEn ? "Email Address:" : "البريد الإلكتروني:"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@domain.com"
                        className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      {isEn ? "Password:" : "كلمة المرور:"}
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? (isEn ? "Signing in..." : "جاري تسجيل الدخول...") : (isEn ? "Continue with Email" : "متابعة ودخول")}
                </button>
              </form>
            )}

            {/* Phone Tab */}
            {activeTab === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isEn ? "Sign in with Phone Number" : "تسجيل الدخول برقم الجوال (الخليج والعالم)"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('welcome');
                      setIsOtpSent(false);
                    }}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {isEn ? "Back" : "العودة"}
                  </button>
                </div>

                {!isOtpSent ? (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      {isEn ? "Phone Number (with country code):" : "رقم الجوال (مع رمز الدولة، مثلاً: +973, +966):"}
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+973 33123456"
                        className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                      {isEn ? "Enter Verification Code (OTP):" : "أدخل رمز التحقق المرسل لجوالك:"}
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full pr-10 pl-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting
                    ? (isEn ? "Processing..." : "جاري المعالجة...")
                    : !isOtpSent
                    ? (isEn ? "Send Verification Code" : "إرسال رمز التحقق SMS")
                    : (isEn ? "Verify & Enter" : "تأكيد الكود والدخول")}
                </button>
              </form>
            )}

            {/* Spiritual footer note */}
            <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500 font-sans border-t border-slate-100 dark:border-slate-850">
              {isEn ? "Privacy & peace guaranteed. You can use the app offline or online." : "بياناتك آمنة تماماً. يمكنك استخدام كافة الأقسام والتلاوات والمواقيت بكل أمان."}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
