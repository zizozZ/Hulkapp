import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, WifiOff } from 'lucide-react';

export const OfflineSyncBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true || !!(window as any).Capacitor;
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };
    const handleBeforeInstall = (e: Event) => {
      if (isStandalone) return;
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  if (isOnline && !justReconnected && !installPrompt) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 flex flex-col gap-2 pointer-events-none max-w-md mx-auto">
      {!isOnline && (
        <div className="pointer-events-auto px-4 py-2.5 rounded-2xl bg-[#1C2420] border border-[#FF9F1C]/60 shadow-xl flex items-center gap-2.5 text-xs">
          <WifiOff className="w-4 h-4 text-[#FF9F1C] shrink-0" />
          <span className="text-[#F5F7F5] font-bold">
            وضع الأوفلاين نشط — بياناتك محفوظة محلياً وستُزامن أونلاين تلقائياً.
          </span>
        </div>
      )}

      {justReconnected && (
        <div className="pointer-events-auto px-4 py-2.5 rounded-2xl bg-[#14532D] border border-[#39FF14]/60 shadow-xl flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0" />
          <span className="text-white font-bold">
            عاد الاتصال أونلاين — جاري مزامنة جميع التحديثات تلقائياً ✓
          </span>
        </div>
      )}

      {installPrompt && (
        <div className="pointer-events-auto px-4 py-3 rounded-2xl bg-[#111713] border border-[#39FF14]/50 shadow-2xl flex items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-black text-[#F5F7F5]">تثبيت تطبيق HULK على هاتفك</p>
            <p className="text-[11px] text-[#929B95]">يعمل بسرعة فائقة ويدعم الكاش أوفلاين</p>
          </div>
          <button
            type="button"
            onClick={handleInstallApp}
            className="hulk-btn-primary px-3.5 py-2 text-xs flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت الآن</span>
          </button>
        </div>
      )}
    </div>
  );
};
