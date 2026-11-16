import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Ban,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplets,
  Dumbbell,
  Flame,
  MessageCircle,
  MessageSquare,
  Save,
  Scale,
  Trash2,
  Utensils,
} from 'lucide-react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { sendWhatsAppNotificationFn, setAccountStatusFn } from '../../services/functionsService';
import {
  BodyMeasurement,
  FoodLog,
  NutritionPlan,
  ProgressPhoto,
  TraineeProfile,
  WorkoutLog,
  WorkoutPlan,
} from '../../types';
import { computeComplianceLevel, getComplianceBadgeMeta } from '../../utils/calculations';

type DetailTab = 'workouts' | 'measurements' | 'nutrition' | 'photos';

export const TrainerClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [client, setClient] = useState<TraineeProfile | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [activeNutritionPlan, setActiveNutritionPlan] = useState<NutritionPlan | null>(null);

  const [activeTab, setActiveTab] = useState<DetailTab>('workouts');
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [coachNotes, setCoachNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedMsg, setNotesSavedMsg] = useState(false);

  useEffect(() => {
    if (!clientId || !profile?.id) return;

    const u1 = onSnapshot(doc(db, 'trainees', clientId), (s) => {
      if (s.exists()) {
        const data = { id: s.id, ...s.data() } as TraineeProfile;
        setClient(data);
        setCoachNotes(data.coachNotes || '');
      }
    });

    const u2 = onSnapshot(
      query(collection(db, 'bodyMeasurements'), where('traineeId', '==', clientId)),
      (s) => {
        const list = s.docs
          .map((d) => ({ id: d.id, ...d.data() } as BodyMeasurement))
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setMeasurements(list);
      }
    );

    const u3 = onSnapshot(
      query(collection(db, 'progressPhotos'), where('traineeId', '==', clientId)),
      (s) => {
        const list = s.docs
          .map((d) => ({ id: d.id, ...d.data() } as ProgressPhoto))
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setPhotos(list);
      }
    );

    const u4 = onSnapshot(
      query(collection(db, 'workoutLogs'), where('traineeId', '==', clientId)),
      (s) => {
        const logs = s.docs
          .map((d) => ({ id: d.id, ...d.data() } as WorkoutLog))
          .sort((a, b) => (b.completedAt?.toMillis?.() || 0) - (a.completedAt?.toMillis?.() || 0));
        setWorkoutLogs(logs);
        if (logs.length > 0) {
          setExpandedLogs((prev) =>
            Object.keys(prev).length === 0 ? { [logs[0].id]: true } : prev
          );
        }
      }
    );

    const u5 = onSnapshot(
      query(collection(db, 'foodLogs'), where('traineeId', '==', clientId)),
      (s) => {
        const list = s.docs
          .map((d) => ({ id: d.id, ...d.data() } as FoodLog))
          .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setFoodLogs(list);
      }
    );

    const u6 = onSnapshot(
      query(collection(db, 'workoutPlans'), where('traineeId', '==', clientId)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutPlan));
        setActiveWorkoutPlan(list.find((p) => p.isActive) || list[0] || null);
      }
    );

    const u7 = onSnapshot(
      query(collection(db, 'nutritionPlans'), where('traineeId', '==', clientId)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as NutritionPlan));
        setActiveNutritionPlan(list.find((p) => p.isActive) || list[0] || null);
      }
    );

    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
      u7();
    };
  }, [clientId, profile?.id]);

  if (!client) {
    return <p className="text-sm text-[#929B95]">جاري تحميل ملف المتدرب...</p>;
  }

  const formatTimestamp = (ts: any) => {
    try {
      if (!ts) return 'لم يسجل بعد';
      const d = ts?.toDate ? ts.toDate() : ts?.toMillis ? new Date(ts.toMillis()) : new Date(ts);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const angleLabel = (angle: string) => {
    if (angle === 'front') return 'أمامي';
    if (angle === 'side') return 'جانبي';
    if (angle === 'back') return 'خلفي';
    return angle;
  };

  const toggleExpandLog = (id: string) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await updateDoc(doc(db, 'trainees', client.id), { coachNotes });
    setSavingNotes(false);
    setNotesSavedMsg(true);
    setTimeout(() => setNotesSavedMsg(false), 3000);
  };

  const handleWhatsApp = async () => {
    try {
      await sendWhatsAppNotificationFn({
        traineeId: client.id,
        traineeName: client.fullName,
        phone: client.phone || '',
        messageType: 'template',
        templateName: 'hulk_delayed_update',
      });
    } catch (err: any) {
      alert(err?.message);
    }
  };

  const handleToggleStatus = async () => {
    const next = client.status === 'active' ? 'suspended' : 'active';
    await setAccountStatusFn(client.id, next);
  };

  const handleDeleteClient = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المتدرب نهائياً؟')) return;
    await setAccountStatusFn(client.id, 'delete');
    navigate('/trainer/clients');
  };

  const compliance = computeComplianceLevel(client);
  const badge = getComplianceBadgeMeta(compliance);
  const weightDiff = Number((client.currentWeight - client.startWeight).toFixed(1));

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/trainer/clients')}
            className="p-2.5 rounded-xl bg-[#1C2420] border border-[#29352D] hover:border-[#39FF14]/40 transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black">{client.fullName}</h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-[#929B95] mt-0.5">
              {client.goal} • الطول {client.height} سم • العمر {client.age} سنة
              {client.phone ? ` • ${client.phone}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/trainer/chat"
            className="px-3.5 py-2 rounded-xl bg-[#1C2420] border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold flex items-center gap-1.5 hover:bg-[#39FF14]/10 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>محادثة</span>
          </Link>
          <button
            onClick={handleWhatsApp}
            className="px-3.5 py-2 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب</span>
          </button>
          <button
            onClick={handleToggleStatus}
            className="px-3 py-2 rounded-xl bg-[#1C2420] border border-[#29352D] text-xs font-bold flex items-center gap-1.5"
          >
            {client.status === 'active' ? (
              <>
                <Ban className="w-4 h-4 text-[#FF9F1C]" />
                <span>إيقاف</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                <span>تفعيل</span>
              </>
            )}
          </button>
          <button
            onClick={handleDeleteClient}
            className="p-2 rounded-xl bg-[#FF4141]/15 border border-[#FF4141]/40 text-[#FF4141]"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="hulk-card p-4">
          <p className="text-xs text-[#929B95]">وزن البداية</p>
          <p className="text-2xl font-black mt-1">{client.startWeight} كجم</p>
        </div>
        <div className="hulk-card p-4">
          <p className="text-xs text-[#929B95]">الوزن الحالي</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-black text-[#39FF14]">{client.currentWeight} كجم</p>
            {weightDiff !== 0 && (
              <span
                className={`text-xs font-bold ${
                  weightDiff > 0 ? 'text-[#FF9F1C]' : 'text-[#39FF14]'
                }`}
              >
                ({weightDiff > 0 ? `+${weightDiff}` : weightDiff} كجم)
              </span>
            )}
          </div>
        </div>
        <div className="hulk-card p-4">
          <p className="text-xs text-[#929B95]">الوزن المستهدف</p>
          <p className="text-2xl font-black mt-1">{client.targetWeight} كجم</p>
        </div>
        <div className="hulk-card p-4">
          <p className="text-xs text-[#929B95]">نهاية الاشتراك</p>
          <p className="text-lg font-black mt-1">{client.subscriptionEnd}</p>
        </div>
      </div>

      {/* Active Plans Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="hulk-card p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-[#929B95] flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-[#39FF14]" />
              الجدول التدريبي النشط
            </p>
            <p className="text-sm font-extrabold truncate mt-1">
              {activeWorkoutPlan
                ? `${activeWorkoutPlan.title} (${activeWorkoutPlan.daysPerWeek} أيام)`
                : 'لم يتم إسناد جدول تدريبي بعد'}
            </p>
          </div>
          <Link
            to="/trainer/workouts"
            className="px-3 py-1.5 rounded-xl bg-[#111713] border border-[#29352D] hover:border-[#39FF14]/50 text-xs font-bold shrink-0"
          >
            {activeWorkoutPlan ? 'تعديل' : 'إسناد جدول'}
          </Link>
        </div>

        <div className="hulk-card p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-[#929B95] flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#39FF14]" />
              النظام الغذائي النشط
            </p>
            <p className="text-sm font-extrabold truncate mt-1">
              {activeNutritionPlan
                ? `${activeNutritionPlan.title} (${activeNutritionPlan.targetCalories} سعرة)`
                : 'لم يتم إسناد نظام غذائي بعد'}
            </p>
          </div>
          <Link
            to="/trainer/nutrition"
            className="px-3 py-1.5 rounded-xl bg-[#111713] border border-[#29352D] hover:border-[#39FF14]/50 text-xs font-bold shrink-0"
          >
            {activeNutritionPlan ? 'تعديل' : 'إسناد دايت'}
          </Link>
        </div>
      </div>

      {/* Trainee Updates Section with Tabs */}
      <div className="hulk-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#29352D] pb-3">
          <div>
            <h2 className="text-base font-black flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#39FF14]" />
              تحديثات المتدرب المسجلة (الأوزان، العدات، القياسات، الدايت)
            </h2>
            <p className="text-[11px] text-[#929B95] mt-0.5">
              آخر تمرين مسجل: {formatTimestamp(client.lastWorkoutAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('workouts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'workouts'
                  ? 'bg-[#39FF14] text-[#090B0A]'
                  : 'bg-[#111713] text-[#929B95] border border-[#29352D] hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>الأوزان والعدات ({workoutLogs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('measurements')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'measurements'
                  ? 'bg-[#39FF14] text-[#090B0A]'
                  : 'bg-[#111713] text-[#929B95] border border-[#29352D] hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>الوزن والقياسات ({measurements.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('nutrition')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'nutrition'
                  ? 'bg-[#39FF14] text-[#090B0A]'
                  : 'bg-[#111713] text-[#929B95] border border-[#29352D] hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>التغذية والماء ({foodLogs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === 'photos'
                  ? 'bg-[#39FF14] text-[#090B0A]'
                  : 'bg-[#111713] text-[#929B95] border border-[#29352D] hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>صور التطور ({photos.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Workout Logs (Weights & Reps per Exercise) */}
        {activeTab === 'workouts' && (
          <div className="space-y-3">
            {workoutLogs.length === 0 ? (
              <p className="text-xs text-[#929B95] py-6 text-center">
                لم يقم المتدرب بتسجيل أي تمرين بأوزانه وعداته بعد.
              </p>
            ) : (
              workoutLogs.map((w) => {
                const isOpen = !!expandedLogs[w.id];
                const totalVolume = (w.exercises || []).reduce((acc, ex) => {
                  const exVol = (ex.sets || []).reduce(
                    (sAcc, st) => sAcc + (Number(st.weightKg) || 0) * (Number(st.reps) || 0),
                    0
                  );
                  return acc + exVol;
                }, 0);

                return (
                  <div
                    key={w.id}
                    className="rounded-2xl bg-[#111713] border border-[#29352D] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpandLog(w.id)}
                      className="w-full p-4 flex flex-wrap items-center justify-between gap-2 text-right hover:bg-[#1C2420]/60 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-[#F5F7F5]">{w.dayTitle}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#39FF14]/15 text-[#39FF14] font-bold">
                            {w.exercises?.length || 0} تمارين
                          </span>
                          {totalVolume > 0 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#FF9F1C]/15 text-[#FF9F1C] font-bold">
                              إجمالي الأوزان: {totalVolume.toLocaleString()} كجم
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#929B95] flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>{formatTimestamp(w.completedAt)}</span>
                          <span>• المدة: {w.durationMinutes || 0} دقيقة</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#39FF14] font-bold">
                        <span>{isOpen ? 'إخفاء التفاصيل' : 'عرض الأوزان والعدات'}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-0 border-t border-[#29352D]/70 space-y-3 mt-2">
                        {(!w.exercises || w.exercises.length === 0) ? (
                          <p className="text-xs text-[#929B95]">
                            تم إنهاء الحصة دون تفاصيل مجموعات مسجلة.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {w.exercises.map((ex, idx) => (
                              <div
                                key={`${ex.exerciseId}_${idx}`}
                                className="p-3 rounded-xl bg-[#1C2420] border border-[#29352D] space-y-2"
                              >
                                <p className="text-xs font-extrabold text-[#39FF14]">
                                  #{idx + 1} {ex.name}
                                </p>
                                <div className="space-y-1">
                                  {(ex.sets || []).map((st, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-[#111713]"
                                    >
                                      <span className="text-[#929B95]">
                                        مجموعة {st.setNumber || sIdx + 1}
                                      </span>
                                      <span className="font-black text-[#F5F7F5]">
                                        {st.weightKg} كجم × {st.reps} عدة
                                      </span>
                                      <span
                                        className={`text-[10px] font-bold ${
                                          st.completed ? 'text-[#39FF14]' : 'text-[#929B95]'
                                        }`}
                                      >
                                        {st.completed ? '✓ منجزة' : 'غير مكتملة'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {w.notes && (
                          <div className="p-3 rounded-xl bg-[#1C2420]/70 border border-[#29352D] text-xs">
                            <span className="font-bold text-[#FF9F1C]">ملاحظة المتدرب: </span>
                            <span className="text-[#F5F7F5]">{w.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Body Weight & Measurements */}
        {activeTab === 'measurements' && (
          <div>
            {measurements.length === 0 ? (
              <p className="text-xs text-[#929B95] py-6 text-center">
                لم يقم المتدرب بتسجيل تحديثات الوزن والقياسات بعد.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="text-[#929B95] border-b border-[#29352D]">
                    <tr>
                      <th className="p-2.5">التاريخ</th>
                      <th className="p-2.5">الوزن</th>
                      <th className="p-2.5">الدهون %</th>
                      <th className="p-2.5">الصدر</th>
                      <th className="p-2.5">الخصر</th>
                      <th className="p-2.5">الحوض</th>
                      <th className="p-2.5">الذراع</th>
                      <th className="p-2.5">الفخذ</th>
                      <th className="p-2.5">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#29352D]">
                    {measurements.map((m) => (
                      <tr key={m.id} className="hover:bg-[#111713]/60">
                        <td className="p-2.5 whitespace-nowrap">{m.date}</td>
                        <td className="p-2.5 font-black text-[#39FF14] whitespace-nowrap">
                          {m.weightKg} كجم
                        </td>
                        <td className="p-2.5">{m.bodyFatPercent ? `${m.bodyFatPercent}%` : '-'}</td>
                        <td className="p-2.5">{m.chestCm ? `${m.chestCm} سم` : '-'}</td>
                        <td className="p-2.5">{m.waistCm ? `${m.waistCm} سم` : '-'}</td>
                        <td className="p-2.5">{m.hipsCm ? `${m.hipsCm} سم` : '-'}</td>
                        <td className="p-2.5">{m.armsCm ? `${m.armsCm} سم` : '-'}</td>
                        <td className="p-2.5">{m.thighsCm ? `${m.thighsCm} سم` : '-'}</td>
                        <td className="p-2.5 text-[#929B95]">{m.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Nutrition & Water Logs */}
        {activeTab === 'nutrition' && (
          <div>
            {foodLogs.length === 0 ? (
              <p className="text-xs text-[#929B95] py-6 text-center">
                لا توجد سجلات تغذية يومية مسجلة للمتدرب بعد.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {foodLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-[#111713] border border-[#29352D] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">{log.date}</span>
                      <span className="text-xs font-bold text-[#39FF14]">
                        {log.consumedCalories} سعرة
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded-lg bg-[#1C2420]">
                        <p className="text-[#929B95]">بروتين</p>
                        <p className="font-extrabold mt-0.5">{log.consumedProtein} جم</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1C2420]">
                        <p className="text-[#929B95]">كارب</p>
                        <p className="font-extrabold mt-0.5">{log.consumedCarbs} جم</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1C2420]">
                        <p className="text-[#929B95]">دهون</p>
                        <p className="font-extrabold mt-0.5">{log.consumedFats} جم</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1C2420]">
                        <p className="text-[#929B95] flex items-center justify-center gap-0.5">
                          <Droplets className="w-3 h-3 text-sky-400" />
                          ماء
                        </p>
                        <p className="font-extrabold mt-0.5">{log.waterLiters} لتر</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#929B95]">
                      الوجبات المنجزة: {log.completedMeals?.length || 0} وجبات
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Progress Photos */}
        {activeTab === 'photos' && (
          <div>
            {photos.length === 0 ? (
              <p className="text-xs text-[#929B95] py-6 text-center">
                لم يرفع المتدرب صور تطور بعد.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((p) => (
                  <a
                    key={p.id}
                    href={p.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl overflow-hidden border border-[#29352D] hover:border-[#39FF14] transition bg-[#111713]"
                  >
                    <img src={p.imageUrl} alt={p.angle} className="w-full h-40 object-cover" />
                    <div className="p-2 text-[11px] flex items-center justify-between">
                      <span className="font-bold text-[#39FF14]">{angleLabel(p.angle)}</span>
                      <span className="text-[#929B95]">{p.date}</span>
                    </div>
                    {p.weightAtTime && (
                      <p className="px-2 pb-2 text-[10px] text-[#929B95]">
                        الوزن وقتها: {p.weightAtTime} كجم
                      </p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coach Note to Trainee */}
      <div className="hulk-card p-5 space-y-3">
        <h2 className="text-sm font-extrabold">ملاحظة الكوتش اليومية (تظهر في شاشة المتدرب)</h2>
        <textarea
          rows={3}
          value={coachNotes}
          onChange={(e) => setCoachNotes(e.target.value)}
          placeholder="اكتب توجيهك للبطل اليوم..."
          className="hulk-input w-full text-sm"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="hulk-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{savingNotes ? 'جاري الحفظ...' : 'حفظ وإرسال التوجيه'}</span>
          </button>
          {notesSavedMsg && (
            <span className="text-xs font-bold text-[#39FF14]">✓ تم حفظ التوجيه بنجاح</span>
          )}
        </div>
      </div>
    </div>
  );
};
