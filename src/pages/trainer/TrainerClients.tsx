import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, UserPlus, Users } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { createManagedUserFn } from '../../services/functionsService';
import { TraineeProfile } from '../../types';
import { computeComplianceLevel, getComplianceBadgeMeta } from '../../utils/calculations';

export const TrainerClients: React.FC = () => {
  const { profile } = useAuth();
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    age: '25',
    height: '175',
    currentWeight: '80',
    targetWeight: '75',
    gender: 'male',
    goal: 'تضخيم عضلي صافي',
    durationMonths: '1',
    subscriptionAmount: '800',
    paymentStatus: 'Paid',
  });

  useEffect(() => {
    if (!profile?.id) return;
    return onSnapshot(
      query(collection(db, 'trainees'), where('trainerId', '==', profile.id)),
      (s) => setTrainees(s.docs.map((d) => ({ id: d.id, ...d.data() } as TraineeProfile)))
    );
  }, [profile?.id]);

  const handleCreateTrainee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + Number(form.durationMonths || 1));

      await createManagedUserFn({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        targetRole: 'trainee',
        profileData: {
          trainerId: profile.id,
          age: Number(form.age),
          height: Number(form.height),
          currentWeight: Number(form.currentWeight),
          targetWeight: Number(form.targetWeight),
          gender: form.gender,
          goal: form.goal,
          durationMonths: Number(form.durationMonths),
          subscriptionStart: start.toISOString().split('T')[0],
          subscriptionEnd: end.toISOString().split('T')[0],
          subscriptionAmount: Number(form.subscriptionAmount),
          paymentStatus: form.paymentStatus,
        },
      });
      setShowModal(false);
      setForm({
        ...form,
        fullName: '',
        email: '',
        password: '',
        phone: '',
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء إنشاء حساب المتدرب.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = trainees.filter(
    (t) =>
      t.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Users className="w-6 h-6 text-[#39FF14]" />
            <span>إدارة المتدربين ({trainees.length})</span>
          </h1>
          <p className="text-xs text-[#929B95] mt-1">
            إنشاء حسابات الأبطال ومتابعة أوزانهم واشتراكاتهم ومستوى التزامهم
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="hulk-btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة متدرب جديد</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#929B95] absolute right-3.5 top-3.5" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          className="hulk-input w-full pr-10 text-sm"
        />
      </div>

      {/* Clients Grid */}
      {filtered.length === 0 ? (
        <div className="hulk-card p-10 text-center space-y-3">
          <p className="text-base font-extrabold">لا يوجد متدربون مطابقون حالياً</p>
          <p className="text-xs text-[#929B95]">اضغط على "إضافة متدرب جديد" لإنشاء أول حساب بطل.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => {
            const level = computeComplianceLevel(client);
            const badge = getComplianceBadgeMeta(level);
            return (
              <Link
                key={client.id}
                to={`/trainer/clients/${client.id}`}
                className="hulk-card p-5 block space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold">{client.fullName}</h3>
                    <p className="text-xs text-[#929B95]">{client.goal}</p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}
                  >
                    {badge.short}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#111713] border border-[#29352D] text-center">
                  <div>
                    <p className="text-[10px] text-[#929B95]">الوزن الحالي</p>
                    <p className="text-sm font-black text-[#39FF14]">{client.currentWeight} كجم</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#929B95]">الهدف</p>
                    <p className="text-sm font-black">{client.targetWeight} كجم</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#929B95]">ينتهي في</p>
                    <p className="text-[11px] font-bold mt-0.5">{client.subscriptionEnd}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Add Trainee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="hulk-card w-full max-w-xl p-6 space-y-4 my-8">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#39FF14]" />
              <span>إنشاء حساب متدرب جديد</span>
            </h2>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#FF4141]/15 border border-[#FF4141]/40 text-[#FF4141] text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateTrainee} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#929B95]">اسم المتدرب</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="أحمد محمود"
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">رقم الواتساب (بالكود الدولي)</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="2010xxxxxxxx"
                  dir="ltr"
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">البريد الإلكتروني للدخول</label>
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
                <label className="text-xs font-bold text-[#929B95]">كلمة المرور</label>
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
                <label className="text-xs font-bold text-[#929B95]">العمر</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">الطول (سم)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">الوزن الحالي (كجم)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.currentWeight}
                  onChange={(e) => setForm({ ...form, currentWeight: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">الوزن المستهدف (كجم)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.targetWeight}
                  onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">الهدف التدريبي</label>
                <input
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">مدة الاشتراك (بالشهور)</label>
                <select
                  value={form.durationMonths}
                  onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                >
                  <option value="1">شهر واحد</option>
                  <option value="3">3 شهور</option>
                  <option value="6">6 شهور</option>
                  <option value="12">سنة كاملة</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">قيمة الاشتراك (جنيه)</label>
                <input
                  type="number"
                  value={form.subscriptionAmount}
                  onChange={(e) => setForm({ ...form, subscriptionAmount: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#929B95]">حالة الدفع</label>
                <select
                  value={form.paymentStatus}
                  onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                  className="hulk-input w-full text-sm mt-1"
                >
                  <option value="Paid">مدفوع بالكامل</option>
                  <option value="Partial">مدفوع جزئياً</option>
                  <option value="Pending">قيد التحصيل</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="hulk-btn-primary flex-1 py-3 text-sm"
                >
                  {submitting ? 'جاري إنشاء الحساب...' : 'حفظ وإنشاء الحساب'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 rounded-xl bg-[#111713] border border-[#29352D] text-sm font-bold"
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
