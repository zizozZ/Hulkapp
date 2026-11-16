import React, { useEffect, useState } from 'react';
import { CheckCircle2, Copy, KeyRound, Link2Off, Loader2, MessageCircle, RefreshCw, Send, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export const WhatsAppLinkCard: React.FC = () => {
  const { profile } = useAuth();
  const [phone, setPhone] = useState('');
  const [session, setSession] = useState<any>(null);
  const [queueStats, setQueueStats] = useState({ sentToday: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    const u1 = onSnapshot(doc(db, 'whatsappSessions', profile.id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSession(data);
        if (data.phoneNumber && !phone) setPhone(data.phoneNumber);
      } else {
        setSession(null);
      }
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const u2 = onSnapshot(
      query(collection(db, 'whatsappQueue'), where('trainerId', '==', profile.id)),
      (snap) => {
        let sentToday = 0;
        let pending = 0;
        snap.docs.forEach((d) => {
          const item = d.data();
          if (item.status === 'pending') pending++;
          if (item.status === 'sent' && item.sentAt?.toMillis && item.sentAt.toMillis() >= todayStart.getTime()) {
            sentToday++;
          }
        });
        setQueueStats({ sentToday, pending });
      }
    );

    return () => {
      u1();
      u2();
    };
  }, [profile?.id]);

  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile?.id || !phone.trim()) return;
    setLoading(true);
    try {
      await setDoc(
        doc(db, 'whatsappSessions', profile.id),
        {
          trainerId: profile.id,
          phoneNumber: phone.trim(),
          status: 'pairing_requested',
          pairingCode: null,
          error: null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoMotivation = async () => {
    if (!profile?.id) return;
    const current = session?.autoMotivationEnabled !== false;
    await setDoc(
      doc(db, 'whatsappSessions', profile.id),
      { autoMotivationEnabled: !current, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const handleDisconnect = async () => {
    if (!profile?.id || !window.confirm('هل تريد فصل حساب واتساب عن المنصة؟')) return;
    await setDoc(
      doc(db, 'whatsappSessions', profile.id),
      { status: 'disconnect_requested', updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const handleTestMessage = async () => {
    if (!profile?.id || !session?.connectedNumber) return;
    await addDoc(collection(db, 'whatsappQueue'), {
      trainerId: profile.id,
      toPhone: session.connectedNumber,
      text: '💪 تم ربط رقم واتساب الخاص بك بنجاح مع نظام التحفيز التلقائي في منصة HULK!',
      isAutomated: false,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    alert('تمت إضافة الرسالة التجريبية إلى طابور الإرسال الآمن!');
  };

  const copyCode = () => {
    if (!session?.pairingCode) return;
    navigator.clipboard.writeText(session.pairingCode.replace('-', ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const status = session?.status || 'disconnected';
  const autoEnabled = session?.autoMotivationEnabled !== false;

  return (
    <div className="hulk-card p-6 space-y-5 border-[#39FF14]/25">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[#39FF14]/15 text-[#39FF14]">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black">ربط واتساب ويب والتحفيز التلقائي</h2>
            <p className="text-xs text-[#929B95]">
              تشجيع تلقائي عند كسر الأوزان وتحديث القياسات مع نظام حماية ضد الحظر
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
            status === 'connected'
              ? 'bg-[#39FF14]/15 text-[#39FF14] border-[#39FF14]/40'
              : status === 'waiting_for_code' || status === 'generating_code' || status === 'pairing_requested'
              ? 'bg-[#FF9F1C]/15 text-[#FF9F1C] border-[#FF9F1C]/40'
              : 'bg-[#111713] text-[#929B95] border-[#29352D]'
          }`}
        >
          {status === 'connected'
            ? '● متصل ومربوط'
            : status === 'waiting_for_code'
            ? '● في انتظار إدخال الكود'
            : status === 'generating_code' || status === 'pairing_requested'
            ? '● جاري توليد الكود...'
            : '○ غير مربوط'}
        </span>
      </div>

      {session?.error && (
        <div className="p-3 rounded-xl bg-[#FF4141]/15 border border-[#FF4141]/40 text-xs text-[#FF4141]">
          {session.error}
        </div>
      )}

      {status === 'connected' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#111713] border border-[#39FF14]/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#39FF14]" />
              <div>
                <p className="text-sm font-black">جلسة واتساب ويب نشطة الآن</p>
                <p className="text-xs text-[#929B95]" dir="ltr">+{session.connectedNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestMessage}
                className="px-3.5 py-2 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>رسالة تجريبية</span>
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3.5 py-2 rounded-xl bg-[#FF4141]/15 border border-[#FF4141]/40 text-[#FF4141] text-xs font-bold flex items-center gap-1.5"
              >
                <Link2Off className="w-3.5 h-3.5" />
                <span>فصل الربط</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111713] border border-[#29352D] flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-extrabold flex items-center gap-1.5 text-[#F5F7F5]">
                <Sparkles className="w-4 h-4 text-[#39FF14]" />
                <span>رسائل التحفيز وكسر الأوزان التلقائية</span>
              </p>
              <p className="text-[11px] text-[#929B95] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>حماية الحظر: فاصل 25-60 ثانية • اليوم: {queueStats.sentToday}/35 • في الطابور: {queueStats.pending}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAutoMotivation}
              className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                autoEnabled
                  ? 'bg-[#39FF14] text-[#090B0A]'
                  : 'bg-[#1C2420] text-[#929B95] border border-[#29352D]'
              }`}
            >
              {autoEnabled ? 'مفعّل تلقائياً ✓' : 'متوقف حالياً'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRequestCode} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-[#929B95] block mb-1">
                رقم الواتساب المراد ربطه (بكود الدولة أو 01xxxxxxxxx)
              </label>
              <input
                type="tel"
                dir="ltr"
                required
                placeholder="201012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="hulk-input w-full text-sm text-left"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="hulk-btn-primary px-5 py-2.5 text-xs sm:self-end flex items-center justify-center gap-2"
            >
              {status === 'generating_code' || status === 'pairing_requested' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحضير...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>طلب كود التحقق</span>
                </>
              )}
            </button>
          </div>

          {session?.pairingCode && status === 'waiting_for_code' && (
            <div className="p-5 rounded-2xl bg-[#111713] border border-[#39FF14]/50 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#929B95]">كود الربط الخاص بك (أدخله في الهاتف الثاني):</p>
                  <p className="text-3xl font-black font-mono tracking-widest text-[#39FF14] mt-1" dir="ltr">
                    {session.pairingCode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyCode}
                    className="px-4 py-2 rounded-xl bg-[#1C2420] border border-[#29352D] hover:border-[#39FF14] text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4 text-[#39FF14]" />
                    <span>{copied ? 'تم النسخ ✓' : 'نسخ الكود'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestCode()}
                    className="px-4 py-2 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>كود جديد</span>
                  </button>
                </div>
              </div>
              <div className="text-xs text-[#929B95] space-y-1 border-t border-[#29352D] pt-3">
                <p className="font-bold text-[#F5F7F5] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#39FF14]" />
                  افتح واتساب ← الأجهزة المرتبطة ← ربط جهاز ← الربط برقم الهاتف وأدخل الكود.
                </p>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
