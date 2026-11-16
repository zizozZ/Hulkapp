import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  CreditCard,
  Droplets,
  Dumbbell,
  Flame,
  Scale,
  TrendingUp,
  Utensils,
} from 'lucide-react';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { uploadPrivateProgressPhoto } from '../../services/storageService';
import {
  BodyMeasurement,
  FoodLog,
  NutritionPlan,
  ProgressPhoto,
  TraineeProfile,
  WorkoutPlan,
} from '../../types';

export const TraineeDashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const [trainee, setTrainee] = useState<TraineeProfile | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
  const [activeNutrition, setActiveNutrition] = useState<NutritionPlan | null>(null);
  const [todayLog, setTodayLog] = useState<FoodLog | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!profile?.id) return;
    const u1 = onSnapshot(doc(db, 'trainees', profile.id), (s) => {
      if (s.exists()) setTrainee({ id: s.id, ...s.data() } as TraineeProfile);
    });
    const u2 = onSnapshot(
      query(collection(db, 'workoutPlans'), where('traineeId', '==', profile.id)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutPlan));
        setActiveWorkout(list.find((p) => p.isActive) || list[0] || null);
      }
    );
    const u3 = onSnapshot(
      query(collection(db, 'nutritionPlans'), where('traineeId', '==', profile.id)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as NutritionPlan));
        setActiveNutrition(list.find((p) => p.isActive) || list[0] || null);
      }
    );
    const u4 = onSnapshot(doc(db, 'foodLogs', `${profile.id}_${todayStr}`), (s) => {
      if (s.exists()) setTodayLog({ id: s.id, ...s.data() } as FoodLog);
    });
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [profile?.id, todayStr]);

  return (
    <div className="space-y-6">
      <div className="hulk-card p-6 bg-gradient-to-l from-[#14532D]/40 to-[#1C2420] border-[#39FF14]/30">
        <p className="text-xs font-extrabold tracking-widest text-[#39FF14] uppercase">
          NO EXCUSES. JUST PROGRESS.
        </p>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">
          جاهز للتحدي اليوم يا {trainee?.fullName || profile?.fullName}؟ 💪
        </h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/trainee/workout"
            className="hulk-btn-primary px-6 py-3 text-sm inline-flex items-center gap-2"
          >
            <Dumbbell className="w-5 h-5" />
            <span>ابدأ التمرين اليومي</span>
          </Link>
          <Link
            to="/trainee/measurements"
            className="px-4 py-3 rounded-xl bg-[#111713] border border-[#29352D] hover:border-[#39FF14]/40 text-xs sm:text-sm font-bold"
          >
            تحديث الوزن والقياسات
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="hulk-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#929B95]">التغذية والسعرات اليوم</span>
            <Flame className="w-5 h-5 text-[#39FF14]" />
          </div>
          <p className="text-3xl font-black text-[#39FF14]">
            {todayLog?.consumedCalories || 0}{' '}
            <span className="text-sm text-[#929B95] font-bold">
              / {activeNutrition?.targetCalories || 2200} سعرة
            </span>
          </p>
          <p className="text-xs text-[#929B95]">
            البروتين: {todayLog?.consumedProtein || 0}g / {activeNutrition?.proteinGrams || 160}g
          </p>
          <Link
            to="/trainee/nutrition"
            className="inline-block text-xs font-bold text-[#39FF14] pt-1"
          >
            تسجيل وجبات اليوم ←
          </Link>
        </div>

        <div className="hulk-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#929B95]">الوزن والهدف</span>
            <Scale className="w-5 h-5 text-[#39FF14]" />
          </div>
          <p className="text-3xl font-black">
            {trainee?.currentWeight || 0}{' '}
            <span className="text-sm text-[#929B95] font-bold">كجم</span>
          </p>
          <p className="text-xs text-[#929B95]">
            الوزن المستهدف: {trainee?.targetWeight || 0} كجم • البرنامج:{' '}
            {activeWorkout?.title || 'بانتظار الجدول'}
          </p>
          <Link
            to="/trainee/progress"
            className="inline-block text-xs font-bold text-[#39FF14] pt-1"
          >
            عرض منحنى التطور والصور ←
          </Link>
        </div>
      </div>

      {/* Coach Note */}
      {trainee?.coachNotes && (
        <div className="hulk-card p-5 border-r-4 border-r-[#39FF14]">
          <h2 className="text-xs font-extrabold text-[#39FF14]">ملاحظة الكوتش لك اليوم:</h2>
          <p className="text-sm mt-1.5 leading-relaxed">{trainee.coachNotes}</p>
        </div>
      )}
    </div>
  );
};

export const TraineeWorkoutPage: React.FC = () => {
  const { profile } = useAuth();
  const [trainee, setTrainee] = useState<TraineeProfile | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [repsInput, setRepsInput] = useState<Record<string, number>>({});
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    const u0 = onSnapshot(doc(db, 'trainees', profile.id), (s) => {
      if (s.exists()) setTrainee({ id: s.id, ...s.data() } as TraineeProfile);
    });
    const u1 = onSnapshot(
      query(collection(db, 'workoutPlans'), where('traineeId', '==', profile.id)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutPlan));
        setPlan(list.find((p) => p.isActive) || list[0] || null);
      }
    );
    return () => { u0(); u1(); };
  }, [profile?.id]);

  if (!plan) {
    return (
      <div className="hulk-card p-8 text-center">
        <p className="font-extrabold">لم يتم إسناد جدول تدريبي لك بعد.</p>
        <p className="text-xs text-[#929B95] mt-1">سيقوم الكوتش بإرسال برنامجك قريباً!</p>
      </div>
    );
  }

  const currentDay = plan.days[selectedDayIdx];

  const handleFinishWorkout = async () => {
    if (!profile?.id || !currentDay) return;
    setSubmitting(true);
    try {
      const targetTrainerId = plan.trainerId || profile.trainerId || '';
      await addDoc(collection(db, 'workoutLogs'), {
        traineeId: profile.id,
        trainerId: targetTrainerId,
        planId: plan.id,
        dayTitle: currentDay.title,
        exercises: currentDay.exercises.map((ex, idx) => {
          const defRep = Number(String(ex.reps).split('-')[0]) || 10;
          return {
            exerciseId: ex.exerciseId,
            name: ex.name,
            sets: Array.from({ length: ex.sets }).map((_, sIdx) => {
              const k = `${idx}_${sIdx}`;
              const wVal = Number(weights[k]) || 0;
              return {
                setNumber: sIdx + 1,
                weightKg: wVal,
                reps: Number(repsInput[k]) || defRep,
                completed: Boolean(completedSets[k]) || wVal > 0,
              };
            }),
          };
        }),
        durationMinutes: 55,
        completedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'trainees', profile.id), {
        lastUpdateAt: serverTimestamp(),
        lastWorkoutAt: serverTimestamp(),
        complianceLevel: 'GREEN',
      }).catch(() => null);
      if (targetTrainerId) {
        await addDoc(collection(db, 'notifications'), {
          userId: targetTrainerId,
          title: `أنهى ${profile.fullName} تمرينه 💪`,
          body: `تم تسجيل ${currentDay.title}`,
          type: 'workout',
          read: false,
          link: `/trainer/clients/${profile.id}`,
          createdAt: serverTimestamp(),
        }).catch(() => null);

        if (trainee?.phone) {
          const prevSnap = await getDocs(
            query(collection(db, 'workoutLogs'), where('traineeId', '==', profile.id))
          ).catch(() => null);
          const prevMaxByEx: Record<string, number> = {};
          prevSnap?.docs.forEach((d) => {
            (d.data().exercises || []).forEach((ex: any) => {
              const key = ex.exerciseId || ex.name;
              const maxW = Math.max(0, ...(ex.sets || []).map((s: any) => Number(s.weightKg) || 0));
              if (maxW > (prevMaxByEx[key] || 0)) prevMaxByEx[key] = maxW;
            });
          });

          const brokenPRs: string[] = [];
          currentDay.exercises.forEach((ex, idx) => {
            const key = ex.exerciseId || ex.name;
            const todayMax = Math.max(
              0,
              ...Array.from({ length: ex.sets }).map((_, sIdx) => Number(weights[`${idx}_${sIdx}`]) || 0)
            );
            const oldMax = prevMaxByEx[key] || 0;
            if (todayMax > oldMax && oldMax > 0) {
              brokenPRs.push(`${ex.name}: ${todayMax} كجم (بدل ${oldMax} كجم)`);
            }
          });

          const firstName = String(profile.fullName || 'بطل').split(' ')[0];
          const waText =
            brokenPRs.length > 0
              ? `🔥 وحش يا كابتن ${firstName}! كسرت رقم قياسي جديد النهاردة في تمرينة ${currentDay.title}:\n🏆 ${brokenPRs.join('\n🏆 ')}\nعاش على الوحشنة، استمر بنفس القوة! 💪`
              : `💪 عاش يا بطل ${firstName}! تم تسجيل إنجازك في تمرينة (${currentDay.title}) بنجاح. خطوة جديدة ناحية هدفك! 🔥`;

          await addDoc(collection(db, 'whatsappQueue'), {
            trainerId: targetTrainerId,
            traineeId: profile.id,
            traineeName: profile.fullName,
            toPhone: trainee.phone,
            text: waText,
            isAutomated: true,
            category: brokenPRs.length > 0 ? 'weight_pr' : 'workout_done',
            status: 'pending',
            createdAt: serverTimestamp(),
          }).catch(() => null);
        }
      }
      alert('عاش يا بطل! تم تسجيل تمرينك بأوزانه وعداته وإبلاغ الكوتش بنجاح 🔥');
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء تسجيل التمرين');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">{plan.title}</h1>
        <p className="text-xs text-[#929B95] mt-1">اختر يوم التمرين وسجّل أوزانك لكل مجموعة</p>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {plan.days.map((d, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIdx(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap border ${
              selectedDayIdx === idx
                ? 'bg-[#39FF14] text-[#090B0A] border-[#39FF14]'
                : 'bg-[#1C2420] text-[#929B95] border-[#29352D]'
            }`}
          >
            {d.title}
          </button>
        ))}
      </div>

      {currentDay && (
        <div className="space-y-4">
          {currentDay.exercises.map((ex, exIdx) => (
            <div key={exIdx} className="hulk-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base">{ex.name}</h3>
                  {ex.entrances && ex.entrances !== 'بدون دخلات' && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-[#FF9F1C]/15 border border-[#FF9F1C]/35 text-[11px] font-bold text-[#FF9F1C]">
                          الدخلات: {ex.entrances}
                        </span>
                      )}
                      <p className="text-xs text-[#39FF14] mt-1">
                        {ex.sets} مجموعات فعلية × {ex.reps} تكرار • راحة {ex.restSeconds} ثانية
                      </p>
                </div>
              </div>
              {ex.notes && <p className="text-xs text-[#929B95]">{ex.notes}</p>}

              <div className="space-y-2 pt-2">
                {Array.from({ length: ex.sets }).map((_, sIdx) => {
                  const key = `${exIdx}_${sIdx}`;
                  return (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#111713] border border-[#29352D]"
                    >
                      <span className="text-xs font-bold text-[#929B95]">مجموعة {sIdx + 1}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="الوزن كجم"
                          value={weights[key] || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setWeights({ ...weights, [key]: val });
                            if (val > 0) setCompletedSets((p) => ({ ...p, [key]: true }));
                          }}
                          className="hulk-input w-24 py-1 text-xs text-center"
                        />
                        <input
                          type="number"
                          placeholder="العدات"
                          value={repsInput[key] || ''}
                          onChange={(e) =>
                            setRepsInput({ ...repsInput, [key]: Number(e.target.value) })
                          }
                          className="hulk-input w-20 py-1 text-xs text-center"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setCompletedSets({ ...completedSets, [key]: !completedSets[key] })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                            completedSets[key]
                              ? 'bg-[#39FF14] text-[#090B0A]'
                              : 'bg-[#1C2420] text-[#929B95]'
                          }`}
                        >
                          {completedSets[key] ? 'تم ✓' : 'إتمام'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={handleFinishWorkout}
            disabled={submitting}
            className="hulk-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{submitting ? 'جاري الحفظ...' : 'إنهاء التمرين وتسجيل الإنجاز'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const TraineeNutritionPage: React.FC = () => {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [completedMeals, setCompletedMeals] = useState<number[]>([]);
  const [waterLiters, setWaterLiters] = useState(1);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!profile?.id) return;
    const u1 = onSnapshot(
      query(collection(db, 'nutritionPlans'), where('traineeId', '==', profile.id)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as NutritionPlan));
        setPlan(list.find((p) => p.isActive) || list[0] || null);
      }
    );
    const u2 = onSnapshot(doc(db, 'foodLogs', `${profile.id}_${todayStr}`), (s) => {
      if (s.exists()) {
        const data = s.data() as FoodLog;
        setCompletedMeals(data.completedMeals || []);
        setWaterLiters(data.waterLiters || 0);
      }
    });
    return () => {
      u1();
      u2();
    };
  }, [profile?.id, todayStr]);

  if (!plan) {
    return (
      <div className="hulk-card p-8 text-center">
        <p className="font-extrabold">لم يتم إسناد خطة غذائية لك بعد.</p>
      </div>
    );
  }

  const toggleMeal = async (mealNum: number) => {
    if (!profile?.id) return;
    const next = completedMeals.includes(mealNum)
      ? completedMeals.filter((m) => m !== mealNum)
      : [...completedMeals, mealNum];
    setCompletedMeals(next);

    let cals = 0;
    let prot = 0;
    let carbs = 0;
    let fats = 0;
    plan.meals.forEach((m) => {
      if (next.includes(m.mealNumber)) {
        m.items.forEach((it) => {
          cals += it.calories;
          prot += it.protein;
          carbs += it.carbs;
          fats += it.fats;
        });
      }
    });

    await setDoc(
      doc(db, 'foodLogs', `${profile.id}_${todayStr}`),
      {
        traineeId: profile.id,
        trainerId: plan.trainerId,
        date: todayStr,
        consumedCalories: cals,
        consumedProtein: prot,
        consumedCarbs: carbs,
        consumedFats: fats,
        waterLiters,
        completedMeals: next,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Utensils className="w-6 h-6 text-[#39FF14]" />
          <span>{plan.title}</span>
        </h1>
        <p className="text-xs text-[#929B95] mt-1">
          الهدف: {plan.targetCalories} سعرة • بروتين {plan.proteinGrams}g • كارب {plan.carbsGrams}g • دهون {plan.fatsGrams}g
        </p>
      </div>

      {/* Water Tracker */}
      <div className="hulk-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-bold">شرب الماء اليوم: {waterLiters} / {plan.waterLiters} لتر</span>
        </div>
        <button
          onClick={async () => {
            if (!profile?.id) return;
            const nextW = Number((waterLiters + 0.5).toFixed(1));
            setWaterLiters(nextW);
            await setDoc(
              doc(db, 'foodLogs', `${profile.id}_${todayStr}`),
              {
                traineeId: profile.id,
                trainerId: plan.trainerId,
                date: todayStr,
                waterLiters: nextW,
                completedMeals,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          }}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold"
        >
          + 0.5 لتر
        </button>
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        {plan.meals.map((meal) => {
          const done = completedMeals.includes(meal.mealNumber);
          return (
            <div key={meal.mealNumber} className="hulk-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base">{meal.title}</h3>
                <button
                  onClick={() => toggleMeal(meal.mealNumber)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold ${
                    done
                      ? 'bg-[#39FF14] text-[#090B0A]'
                      : 'bg-[#111713] border border-[#29352D] text-[#929B95]'
                  }`}
                >
                  {done ? 'تم تناولها ✓' : 'تسجيل الوجبة'}
                </button>
              </div>
              <div className="space-y-1.5">
                {meal.items.map((item, i) => (
                  <div key={i} className="text-xs text-[#929B95] flex justify-between">
                    <span>
                      • {item.name} ({item.grams} جم)
                    </span>
                    <span className="text-[#F5F7F5]">{item.calories} سعرة</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TraineeMeasurementsPage: React.FC = () => {
  const { profile } = useAuth();
  const [trainee, setTrainee] = useState<TraineeProfile | null>(null);
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [armsCm, setArmsCm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    return onSnapshot(doc(db, 'trainees', profile.id), (s) => {
      if (s.exists()) setTrainee({ id: s.id, ...s.data() } as TraineeProfile);
    });
  }, [profile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    try {
      const w = Number(weightKg);
      const targetTrainerId = trainee?.trainerId || profile.trainerId || '';
      await addDoc(collection(db, 'bodyMeasurements'), {
        traineeId: profile.id,
        trainerId: targetTrainerId,
        date: new Date().toISOString().split('T')[0],
        weightKg: w,
        waistCm: Number(waistCm) || null,
        chestCm: Number(chestCm) || null,
        armsCm: Number(armsCm) || null,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'trainees', profile.id), {
        currentWeight: w,
        lastUpdateAt: serverTimestamp(),
        lastWeightAt: serverTimestamp(),
        complianceLevel: 'GREEN',
      }).catch(() => null);
      if (targetTrainerId) {
        await addDoc(collection(db, 'notifications'), {
          userId: targetTrainerId,
          title: `تحديث وزن جديد من ${profile.fullName}`,
          body: `الوزن الحالي: ${w} كجم`,
          type: 'compliance',
          read: false,
          link: `/trainer/clients/${profile.id}`,
          createdAt: serverTimestamp(),
        }).catch(() => null);

        if (trainee?.phone) {
          const firstName = String(profile.fullName || 'بطل').split(' ')[0];
          const isLossGoal = (trainee.targetWeight || 0) < (trainee.startWeight || w);
          const prevW = trainee.currentWeight || trainee.startWeight || w;
          const brokeRecord = isLossGoal ? w < prevW : w > prevW;
          const diff = Math.abs(Number((w - prevW).toFixed(1)));

          const waText = brokeRecord
            ? `🏆 مبروك يا بطل ${firstName}! كسرت رقم جديد في وزنك ووصلت ${w} كجم (تغير ${diff} كجم عن آخر وزن)! استمر يا وحش، النتيجة بتتكلم 💪🔥`
            : `💪 عاش يا ${firstName}! تم تسجيل تحديث وزنك الجديد (${w} كجم) بنجاح. الالتزام بالمتابعة هو سر النجاح! ⚡`;

          await addDoc(collection(db, 'whatsappQueue'), {
            trainerId: targetTrainerId,
            traineeId: profile.id,
            traineeName: profile.fullName,
            toPhone: trainee.phone,
            text: waText,
            isAutomated: true,
            category: brokeRecord ? 'bodyweight_milestone' : 'weight_update',
            status: 'pending',
            createdAt: serverTimestamp(),
          }).catch(() => null);
        }
      }
      setWeightKg('');
      setWaistCm('');
      setChestCm('');
      setArmsCm('');
      alert('تم تحديث وزنك وقياساتك وإرسالها للكوتش بنجاح!');
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء حفظ الوزن.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <Scale className="w-6 h-6 text-[#39FF14]" />
        <span>تسجيل الوزن والقياسات الدورية</span>
      </h1>
      <form onSubmit={handleSubmit} className="hulk-card p-6 space-y-4">
        <div>
          <label className="text-xs font-bold text-[#929B95]">الوزن الحالي (كجم) *</label>
          <input
            type="number"
            step="0.1"
            required
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="hulk-input w-full text-sm mt-1"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-[#929B95]">الخصر (سم)</label>
            <input
              type="number"
              step="0.5"
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              className="hulk-input w-full text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#929B95]">الصدر (سم)</label>
            <input
              type="number"
              step="0.5"
              value={chestCm}
              onChange={(e) => setChestCm(e.target.value)}
              className="hulk-input w-full text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#929B95]">الذراع (سم)</label>
            <input
              type="number"
              step="0.5"
              value={armsCm}
              onChange={(e) => setArmsCm(e.target.value)}
              className="hulk-input w-full text-sm mt-1"
            />
          </div>
        </div>
        <button type="submit" disabled={saving} className="hulk-btn-primary w-full py-3 text-sm">
          {saving ? 'جاري الحفظ...' : 'حفظ التحديث'}
        </button>
      </form>
    </div>
  );
};

export const TraineeProgressPage: React.FC = () => {
  const { profile } = useAuth();
  const [trainee, setTrainee] = useState<TraineeProfile | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [angle, setAngle] = useState<'front' | 'side' | 'back'>('front');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    const u1 = onSnapshot(doc(db, 'trainees', profile.id), (s) => {
      if (s.exists()) setTrainee({ id: s.id, ...s.data() } as TraineeProfile);
    });
    const u2 = onSnapshot(
      query(collection(db, 'bodyMeasurements'), where('traineeId', '==', profile.id)),
      (s) => setMeasurements(s.docs.map((d) => ({ id: d.id, ...d.data() } as BodyMeasurement)))
    );
    const u3 = onSnapshot(
      query(collection(db, 'progressPhotos'), where('traineeId', '==', profile.id)),
      (s) => setPhotos(s.docs.map((d) => ({ id: d.id, ...d.data() } as ProgressPhoto)))
    );
    return () => {
      u1();
      u2();
      u3();
    };
  }, [profile?.id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id || !trainee) return;
    setUploading(true);
    try {
      const imageUrl = await uploadPrivateProgressPhoto(
        trainee.trainerId,
        profile.id,
        angle,
        file
      );
      await addDoc(collection(db, 'progressPhotos'), {
        traineeId: profile.id,
        trainerId: trainee.trainerId,
        date: new Date().toISOString().split('T')[0],
        angle,
        imageUrl,
        weightAtTime: trainee.currentWeight,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'trainees', profile.id), {
        lastUpdateAt: serverTimestamp(),
        lastPhotoAt: serverTimestamp(),
      });
      alert('تم رفع صورة التطور بنجاح ومشاركتها مع الكوتش فقط!');
    } catch (err: any) {
      alert(err?.message || 'فشل رفع الصورة.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-[#39FF14]" />
        <span>منحنى التطور وصور التحول</span>
      </h1>

      {/* Weight Chart */}
      <div className="hulk-card p-5 space-y-3">
        <h2 className="text-sm font-extrabold">تطور الوزن (كجم)</h2>
        {measurements.length === 0 ? (
          <p className="text-xs text-[#929B95]">سجّل وزنك من صفحة القياسات لعرض الرسم البياني.</p>
        ) : (
          <div className="h-56 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurements}>
                <XAxis dataKey="date" stroke="#929B95" fontSize={11} />
                <YAxis stroke="#929B95" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111713',
                    borderColor: '#29352D',
                    borderRadius: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="#39FF14"
                  strokeWidth={3}
                  dot={{ fill: '#39FF14' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Private Progress Photos Upload */}
      <div className="hulk-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#39FF14]" />
              <span>صور التطور الخاصة (تظهر للكوتش فقط)</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={angle}
              onChange={(e) => setAngle(e.target.value as any)}
              className="hulk-input text-xs py-1.5"
            >
              <option value="front">أمامي (Front)</option>
              <option value="side">جانبي (Side)</option>
              <option value="back">خلفي (Back)</option>
            </select>
            <label className="hulk-btn-primary px-4 py-2 text-xs cursor-pointer">
              {uploading ? 'جاري الرفع...' : '+ رفع صورة'}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="rounded-xl overflow-hidden border border-[#29352D]">
              <img src={p.imageUrl} alt={p.angle} className="w-full h-36 object-cover" />
              <div className="p-2 bg-[#111713] text-[11px] flex justify-between">
                <span>{p.date}</span>
                <span className="text-[#39FF14] font-bold">{p.angle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TraineeSubscriptionPage: React.FC = () => {
  const { profile } = useAuth();
  const [trainee, setTrainee] = useState<TraineeProfile | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    return onSnapshot(doc(db, 'trainees', profile.id), (s) => {
      if (s.exists()) setTrainee({ id: s.id, ...s.data() } as TraineeProfile);
    });
  }, [profile?.id]);

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-[#39FF14]" />
        <span>تفاصيل اشتراكي التدريبي</span>
      </h1>
      <div className="hulk-card p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#929B95]">حالة الاشتراك:</span>
          <span className="font-extrabold text-[#39FF14]">
            {trainee?.subscriptionStatus || 'Active'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#929B95]">تاريخ البداية:</span>
          <span className="font-bold">{trainee?.subscriptionStart || '-'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#929B95]">تاريخ الانتهاء:</span>
          <span className="font-bold text-[#39FF14]">{trainee?.subscriptionEnd || '-'}</span>
        </div>
      </div>
    </div>
  );
};
