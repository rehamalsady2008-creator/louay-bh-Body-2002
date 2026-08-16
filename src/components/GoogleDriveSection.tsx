import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  FileText, 
  Trash2, 
  RefreshCw, 
  LogOut, 
  FolderPlus, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  HardDrive
} from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, getAccessToken } from '../utils/firebase';

interface GoogleDriveSectionProps {
  isEn?: boolean;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export default function GoogleDriveSection({ isEn = false }: GoogleDriveSectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Confirmation modal state for destructive operations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setNeedsAuth(false);
        fetchDriveFiles(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
        setStatusMessage({
          type: 'success',
          text: isEn ? 'Successfully connected to Google Drive!' : 'تم الاتصال بجوجل درايف بنجاح!'
        });
        fetchDriveFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || (isEn ? 'Failed to sign in with Google' : 'حدث خطأ أثناء تسجيل الدخول بـ Google')
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
    setDriveFiles([]);
    setStatusMessage({
      type: 'info',
      text: isEn ? 'Signed out from Google Drive' : 'تم تسجيل الخروج من جوجل درايف'
    });
  };

  const fetchDriveFiles = async (token?: string) => {
    const activeToken = token || accessToken || getAccessToken();
    if (!activeToken) return;

    setIsSyncing(true);
    try {
      const res = await fetch(
        'https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc',
        {
          headers: { Authorization: `Bearer ${activeToken}` }
        }
      );

      if (!res.ok) {
        throw new Error(`Google API returned ${res.status}`);
      }

      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Create full backup of LocalStorage to Google Drive
  const handleBackupToDrive = async () => {
    const activeToken = accessToken || getAccessToken();
    if (!activeToken) {
      setNeedsAuth(true);
      return;
    }

    setIsSyncing(true);
    setStatusMessage(null);

    try {
      // Gather all app state
      const backupData = {
        appName: 'Noor Al-Islam',
        exportedAt: new Date().toISOString(),
        settings: localStorage.getItem('noor_settings'),
        azkarReminders: localStorage.getItem('noor_azkar_reminders'),
        dailyPrayersChecked: localStorage.getItem('noor_daily_prayers_checked'),
        tasbihCount: localStorage.getItem('noor_quick_tasbih_count'),
        streakCount: localStorage.getItem('noor_streak_count'),
      };

      const fileName = `NoorAlIslam_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      const fileContent = JSON.stringify(backupData, null, 2);

      const metadata = {
        name: fileName,
        mimeType: 'application/json',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`
        },
        body: form
      });

      if (!res.ok) {
        throw new Error(isEn ? 'Failed to upload backup file' : 'فشل رفع ملف النسخة الاحتياطية');
      }

      const createdFile = await res.json();
      setStatusMessage({
        type: 'success',
        text: isEn 
          ? `Backup uploaded successfully to Google Drive! (${createdFile.name})` 
          : `تم حفظ النسخة الاحتياطية بنجاح على جوجل درايف! (${createdFile.name})`
      });

      fetchDriveFiles(activeToken);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || (isEn ? 'Error creating backup' : 'حدث خطأ أثناء إنشاء النسخة الاحتياطية')
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete file with MANDATORY user confirmation
  const requestDeleteFile = (file: DriveFile) => {
    setConfirmModal({
      isOpen: true,
      title: isEn ? 'Delete File from Google Drive' : 'تأكيد حذف الملف من جوجل درايف',
      message: isEn 
        ? `Are you sure you want to permanently delete "${file.name}" from your Google Drive? This action cannot be undone.`
        : `هل أنت متأكد من حذف الملف "${file.name}" نهائياً من حسابك في جوجل درايف؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => deleteFileFromDrive(file.id)
    });
  };

  const deleteFileFromDrive = async (fileId: string) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    const activeToken = accessToken || getAccessToken();
    if (!activeToken) return;

    setIsSyncing(true);
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` }
      });

      if (!res.ok) {
        throw new Error(isEn ? 'Failed to delete file' : 'فشل حذف الملف من جوجل درايف');
      }

      setStatusMessage({
        type: 'success',
        text: isEn ? 'File deleted successfully from Drive' : 'تم حذف الملف بنجاح من جوجل درايف'
      });

      fetchDriveFiles(activeToken);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredFiles = driveFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <HardDrive className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-kufi text-amber-300">
              {isEn ? 'Google Drive Integration' : 'ربط ومزامنة جوجل درايف'}
            </h2>
            <p className="text-sm text-emerald-100 font-medium mt-1">
              {isEn 
                ? 'Safely store your Quran notes, daily worship logs, and settings on your personal Google Drive.' 
                : 'احفظ نسخك الاحتياطية، أذكارك المخصصة وسجلات عبادتك بامان تام على حسابك الشخصي في جوجل درايف.'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-bold ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' 
            : statusMessage.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
            : 'bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-300'
        }`}>
          {statusMessage.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />}
          {statusMessage.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
          {statusMessage.type === 'info' && <ShieldCheck className="w-5 h-5 shrink-0 text-sky-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Unauthenticated View */}
      {needsAuth || !user ? (
        <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-amber-400/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-400/20">
            <Cloud className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-black font-kufi text-emerald-950 dark:text-emerald-300">
              {isEn ? 'Connect Your Google Account' : 'ربط حسابك بجوجل درايف'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isEn 
                ? 'Sign in with your Google account to enable cloud backups, file syncing, and storage directly to your Google Drive.' 
                : 'قم بتسجيل الدخول باستخدام حساب جوجل الخاص بك للتمكن من حفظ نسخ احتياطية واستعراض ملفاتك بأمان.'}
            </p>
          </div>

          {/* Official Sign in with Google Material Button */}
          <button
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className="inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-6 py-3.5 rounded-2xl font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span className="text-sm font-semibold">
              {isLoggingIn 
                ? (isEn ? 'Signing in...' : 'جاري الاتصال...') 
                : (isEn ? 'Sign in with Google' : 'تسجيل الدخول باستخدام جوجل')}
            </span>
          </button>
        </div>
      ) : (
        /* Authenticated View */
        <div className="space-y-6">
          {/* User Account Card */}
          <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-3xl p-6 flex items-center justify-between gap-4 flex-wrap shadow-xs">
            <div className="flex items-center gap-3.5">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Google User'} className="w-12 h-12 rounded-2xl border border-emerald-500/30 object-cover" />
              ) : (
                <div className="w-12 h-12 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center text-lg">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-300 font-kufi">
                    {user.displayName || (isEn ? 'Google Account' : 'حساب جوجل')}
                  </h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {isEn ? 'Connected' : 'متصل'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackupToDrive}
                disabled={isSyncing}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4" />
                <span>{isEn ? 'Backup App Data' : 'إنشاء نسخة احتياطية'}</span>
              </button>

              <button
                onClick={() => fetchDriveFiles()}
                disabled={isSyncing}
                className="p-2.5 bg-slate-100 dark:bg-[#122225] text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all hover:bg-slate-200 cursor-pointer active:scale-95"
                title={isEn ? 'Refresh files' : 'تحديث القائمة'}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>

              <button
                onClick={handleSignOut}
                className="p-2.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                title={isEn ? 'Sign Out' : 'تسجيل الخروج'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drive Files Browser */}
          <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-base font-black font-kufi text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span>{isEn ? 'Your Google Drive Files' : 'ملفاتك في جوجل درايف'}</span>
              </h3>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute top-3 right-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? 'Search files...' : 'بحث في الملفات...'}
                  className="w-full pr-9 pl-3 py-2 bg-[#F9F7F3] dark:bg-[#070D0E] border border-[#E9E1D2] dark:border-[#16272A] rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Files List */}
            {isSyncing && driveFiles.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                <p className="text-xs font-bold">{isEn ? 'Loading files from Drive...' : 'جاري تحميل الملفات من جوجل درايف...'}</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Cloud className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-bold">{isEn ? 'No files found on Google Drive' : 'لم يتم العثور على ملفات في جوجل درايف'}</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0EBE1] dark:divide-[#132326]">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-50/50 dark:hover:bg-[#0D191B] px-2 rounded-xl transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 transition-colors">
                          {file.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString(isEn ? 'en-US' : 'ar-SA') : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-[#122426] rounded-xl transition-all"
                          title={isEn ? 'Open in Drive' : 'فتح في جوجل درايف'}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      
                      <button
                        onClick={() => requestDeleteFile(file)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                        title={isEn ? 'Delete file' : 'حذف الملف'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANDATORY Confirmation Dialog for Destructive Actions */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#142326] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-500/10 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black font-kufi text-slate-900 dark:text-slate-100">
                {confirmModal.title}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-[#132326] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                {isEn ? 'Cancel' : 'إلغاء'}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shadow-xs active:scale-95"
              >
                {isEn ? 'Yes, Delete' : 'نعم، تأكيد الحذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
