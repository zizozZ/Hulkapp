import React, { useEffect, useState } from 'react';
import {
  Activity,
  Ban,
  CheckCircle2,
  Plus,
  Settings,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { createManagedUserFn, setAccountStatusFn } from '../../services/functionsService';
import { TraineeProfile, TrainerProfile } from '../../types';
import { QuickReplies } from '../../components/QuickReplies';

export const AdminDashboardPage: React.FC = () => {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'trainers'), (s) =>
      setTrainers(s.docs.map((d) => ({ id: d.id, ...d.data() } as TrainerProfile)))
    );
    const u2 = onSnapshot(collection(db, 'trainees'), (s) =>
      setTrainees(s.docs.map((d) => ({ id: d.id, ...d.data() } as TraineeProfile)))
    );
    const u3 = onSnapshot(
      query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(15)),
      (s) => setLogs(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  const activeTrainers = trainers.filter((t) => t.status === 'active').length;
  const activeTrainees = trainees.filter((t) => t.status === 'active').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#F5F7F5] flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-[#39FF14]" />
          <span>لوحة الإدارة العامة (Super Admin)</span>
        </h1>
        <p className="text-xs text-[#929B95] mt-1">
          مراقبة كاملة للمدربين والمتدربين وسجلات الأمان على منصة HULK
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hulk-card p-5">
          <p className="text-xs text-[#929B95] font-bold">إجمالي المدربين</p>
          <p className="text-3xl font-black text-[#39FF14] mt-2">{trainers.length}</p>
          <p className="text-[11px] text-[#929B95] mt-1">نشط حالياً: {activeTrainers}</p>
        </div>
        <div className="hulk-card p-5">
          <p className="text-xs text-[#929B95] font-bold">إجمالي المتدربين بالمنصة</p>
          <p className="text-3xl font-black text-[#F5F7F5] mt-2">{trainees.length}</p>
          <p className="text-[11px] text-[#39FF14] mt-1">نشط: {activeTrainees}</p>
        </div>
        <div className="hulk-card p-5">
          <p className="text-xs text-[#929B95] font-bold">حالة الخطة السحابية</p>
          <p className="text-xl font-black text-[#39FF14] mt-2">100% مجانية (Free)</p>
          <p className="text-[11px] text-[#929B95] mt-1">Firebase Spark + Cloudinary</p>
        </div>
        <div className="hulk-card p-5">
          <p className="text-xs text-[#929B95] font-bold">سجل العمليات المسجلة</p>
          <p className="text-3xl font-black text-[#F5F7F5] mt-2">{logs.length}+</p>
          <p className="text-[11px] text-[#929B95] mt-1">مراقبة فورية</p>
        </div>
      </div>

      <div className="hulk-card p-6">
        <h2 className="text-base font-extrabold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#39FF14]" />
          <span>أحدث سجلات النشاط والأمان</span>
        </h2>
        {logs.length === 0 ? (
          <p className="text-xs text-[#929B95]">لا توجد سجلات نشاط بعد.</p>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#111713] border border-[#29352D] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-extrabold text-[#39FF14] ml-2">[{log.action}]</span>
                  <span className="text-[#F5F7F5]">{log.details}</span>
                </div>
                <span className="text-[#929B95]">{log.actorRole}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Replies WhatsApp Section */}
      <QuickReplies clients={trainees} />
    </div>
  );
};

export const AdminTrainersPage: React.FC = () => {
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialty: 'كمال أجسام وتنشيف وتضخيم',
  });

  useEffect(() => {
    return onSnapshot(collection(db, 'trainers'), (s) =>
      setTrainers(s.docs.map((d) => ({ id: d.id, ...d.data() } as TrainerProfile)))
    );
  }, []);

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await createManagedUserFn({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        targetRole: 'trainer',
        profileData: { specialty: form.specialty },
      });
      setForm({ fullName: '', email: '', password: '', phone: '', specialty: 'كمال أجسام وتغذية' });
      setShowModal(false);
      setFeedback('تم إنشاء حساب المدرب بنجاح!');
    } catch (err: any) {
      setFeedback(err?.message || 'فشل إنشاء حساب المدرب.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (trainer: TrainerProfile) => {
    const next = trainer.status === 'active' ? 'suspended' : 'active';
    await setAccountStatusFn(trainer.id, next);
  };

  const handleDelete = async (trainerId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف ملف هذا المدرب نهائياً؟')) return;
    await setAccountStatusFn(trainerId, 'delete');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#39FF14]" />
            <span>إدارة المدربين المعتمدين</span>
          </h1>
          <p className="text-xs text-[#929B95] mt-1">
            إنشاء وتفعيل أو إيقاف حسابات المدربين على المنصة
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="hulk-btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مدرب جديد</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.map((t) => (
          <div key={t.id} className="hulk-card p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    t.status === 'active'
                      ? 'bg-[#39FF14]/15 border-[#39FF14]/40 text-[#39FF14]'
                      : 'bg-[#FF4141]/15 border-[#FF4141]/40 text-[#FF4141]'
                  }`}
                >
                  {t.status === 'active' ? 'نشط' : 'موقوف'}
                </span>
                <span className="text-xs text-[#929B95]">{t.specialty}</span>
              </div>
              <h3 className="text-lg font-extrabold mt-3">{t.fullName}</h3>
              <p className="text-xs text-[#929B95]" dir="ltr">
                {t.email}
              </p>
              {t.phone && <p className="text-xs text-[#929B95] mt-1">{t.phone}</p>}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-[#29352D]">
              <button
                onClick={() => toggleStatus(t)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#111713] border border-[#29352D] hover:border-[#39FF14]/40 flex items-center justify-center gap-1.5"
              >
                {t.status === 'active' ? (
                  <>
                    <Ban className="w-3.5 h-3.5 text-[#FF9F1C]" />
                    <span>إيقاف الحساب</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>تفعيل الحساب</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2 rounded-xl bg-[#FF4141]/10 text-[#FF4141] border border-[#FF4141]/30 hover:bg-[#FF4141]/20"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hulk-card w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-black">إنشاء حساب مدرب جديد</h2>
            <form onSubmit={handleCreateTrainer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#929B95]">الاسم الكامل للمدرب</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="مثال: كوتش زياد طارق"
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">كلمة المرور (6 أحرف على الأقل)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  dir="ltr"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">رقم الهاتف / واتساب</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="2010xxxxxxxx"
                  dir="ltr"
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">التخصص</label>
                <input
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="hulk-btn-primary flex-1 py-2.5 text-sm"
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#111713] border border-[#29352D] text-sm font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminTraineesOverviewPage: React.FC = () => {
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);

  useEffect(() => {
    return onSnapshot(collection(db, 'trainees'), (s) =>
      setTrainees(s.docs.map((d) => ({ id: d.id, ...d.data() } as TraineeProfile)))
    );
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <Users className="w-6 h-6 text-[#39FF14]" />
        <span>جميع المتدربين بالمنصة ({trainees.length})</span>
      </h1>
      <div className="hulk-card overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#111713] text-[#929B95] border-b border-[#29352D]">
            <tr>
              <th className="p-3.5">المتدرب</th>
              <th className="p-3.5">الهدف</th>
              <th className="p-3.5">الوزن الحالي</th>
              <th className="p-3.5">نهاية الاشتراك</th>
              <th className="p-3.5">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29352D]">
            {trainees.map((tr) => (
              <tr key={tr.id} className="hover:bg-[#111713]/60">
                <td className="p-3.5 font-bold">{tr.fullName}</td>
                <td className="p-3.5 text-[#929B95]">{tr.goal}</td>
                <td className="p-3.5 font-bold text-[#39FF14]">{tr.currentWeight} كجم</td>
                <td className="p-3.5">{tr.subscriptionEnd}</td>
                <td className="p-3.5">{tr.status === 'active' ? 'نشط' : 'موقوف'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(50)),
      (s) => setLogs(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">سجل النشاط والأمان الكامل</h1>
      <div className="hulk-card p-5 space-y-2">
        {logs.map((l) => (
          <div key={l.id} className="p-3 rounded-xl bg-[#111713] border border-[#29352D] text-xs flex justify-between">
            <span>
              <strong className="text-[#39FF14] ml-2">{l.action}</strong>
              {l.details}
            </span>
            <span className="text-[#929B95]">{l.actorRole}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminSettingsPage: React.FC = () => {
  const [slogan, setSlogan] = useState('TRAIN HARD. TRACK SMART.');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDoc(
      doc(db, 'appSettings', 'global'),
      { slogan, updatedAt: serverTimestamp() },
      { merge: true }
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <Settings className="w-6 h-6 text-[#39FF14]" />
        <span>إعدادات المنصة العامة</span>
      </h1>
      <form onSubmit={handleSave} className="hulk-card p-6 space-y-4">
        <div>
          <label className="text-xs font-bold text-[#929B95]">شعار المنصة (Slogan)</label>
          <input
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            className="hulk-input w-full text-sm mt-1"
            dir="ltr"
          />
        </div>
        <button type="submit" className="hulk-btn-primary px-6 py-2.5 text-sm">
          حفظ الإعدادات
        </button>
        {saved && <p className="text-xs text-[#39FF14] font-bold">تم حفظ الإعدادات بنجاح!</p>}
      </form>
    </div>
  );
};
