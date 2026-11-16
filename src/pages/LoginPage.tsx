import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Cloud, Flame, Lock, Mail, ShieldAlert } from 'lucide-react';
import { isFirebaseConfigured } from '../config/firebase';
import { isCloudinaryConfigured } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import { HulkLogo } from '../components/HulkLogo';

export const LoginPage: React.FC = () => {
  const { firebaseUser, profile, loading, error, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!loading && firebaseUser && profile) {
    if (profile.role === 'admin') return <Navigate to="/admin" replace />;
    if (profile.role === 'trainer') return <Navigate to="/trainer" replace />;
    return <Navigate to="/trainee" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!isFirebaseConfigured) {
      setLocalError('يرجى إضافة مفاتيح Firebase في ملف .env أولاً لتفعيل تسجيل الدخول.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const code = err?.code || '';
      if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        setLocalError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else {
        setLocalError(err?.message || 'حدث خطأ أثناء تسجيل الدخول.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090B0A] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#39FF14]/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#14532D]/30 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <HulkLogo />
          <p className="text-sm text-[#929B95] max-w-xs">
            نظام إدارة التدريب الشخصي والتغذية والمتابعة الذكية — الإصدار المجاني المتكامل
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="p-4 rounded-2xl bg-[#FF9F1C]/10 border border-[#FF9F1C]/40 text-[#FF9F1C] text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-extrabold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>تنبيه إعداد البيئة (Environment Setup)</span>
            </div>
            <p className="leading-relaxed">
              انسخ ملف <code className="bg-black/40 px-1 rounded">.env.example</code> إلى{' '}
              <code className="bg-black/40 px-1 rounded">.env</code> وأضف مفاتيح مشروعك في Firebase
              وحساب Cloudinary المجاني.
            </p>
          </div>
        )}

        {isFirebaseConfigured && !isCloudinaryConfigured && (
          <div className="p-3 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs flex items-center gap-2">
            <Cloud className="w-4 h-4 shrink-0" />
            <span>نصيحة: أضف مفاتيح Cloudinary المجانية في .env لتفعيل رفع الصور (25GB مجاناً).</span>
          </div>
        )}

        <div className="hulk-card p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-[#F5F7F5]">تسجيل الدخول</h1>
            <p className="text-xs text-[#929B95] mt-1">
              الدخول مخصص للحسابات المعتمدة من الإدارة أو المدرب
            </p>
          </div>

          {(localError || error) && (
            <div className="mb-4 p-3 rounded-xl bg-[#FF4141]/15 border border-[#FF4141]/40 text-[#FF4141] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#929B95] mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#929B95] absolute right-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="coach@hulkfitness.com"
                  className="hulk-input w-full pr-10 text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#929B95] mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#929B95] absolute right-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="hulk-input w-full pr-10 text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="hulk-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2"
            >
              <Flame className="w-4 h-4" />
              <span>{submitting ? 'جاري التحقق والدخول...' : 'دخول إلى المنصة'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#29352D] text-center">
            <p className="text-[11px] text-[#929B95]">
              لا يوجد تسجيل ذاتي مفتوح لحماية خصوصية المدربين والمتدربين.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
