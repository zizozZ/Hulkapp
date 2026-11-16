import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  Dumbbell,
  Edit3,
  FileSpreadsheet,
  Library,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Utensils,
} from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import {
  BUILTIN_EXERCISES,
  BUILTIN_TEMPLATES,
  ENTRANCE_PRESETS,
  MUSCLE_LABELS_AR,
} from '../../data/workoutPresets';
import { uploadExerciseMedia } from '../../services/storageService';
import {
  ExerciseItem,
  MealBlock,
  PlannedExercise,
  SubscriptionRecord,
  TraineeProfile,
  WorkoutDayBlock,
  WorkoutTemplate,
} from '../../types';
import { calculateBMR, calculateSmartMacros, calculateTDEE } from '../../utils/calculations';

export const TrainerWorkoutBuilderPage: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);
  const [customTemplates, setCustomTemplates] = useState<WorkoutTemplate[]>([]);
  const [customExercises, setCustomExercises] = useState<ExerciseItem[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState('');
  const [title, setTitle] = useState('Upper / Lower - علوي / سفلي 4 أيام متوازن');
  const [goal, setGoal] = useState('تضخيم عضلي');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [days, setDays] = useState<WorkoutDayBlock[]>(
    JSON.parse(JSON.stringify(BUILTIN_TEMPLATES[1].days))
  );
  const [pickerDayIdx, setPickerDayIdx] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerMuscle, setPickerMuscle] = useState<ExerciseItem['muscleGroup'] | 'ALL'>('ALL');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const incomingTpl = (location.state as any)?.template as WorkoutTemplate | undefined;
    if (incomingTpl) {
      setTitle(incomingTpl.title);
      setGoal(incomingTpl.category || 'تضخيم عضلي');
      setDays(JSON.parse(JSON.stringify(incomingTpl.days)));
      setSavedMsg(`تم تحميل القالب "${incomingTpl.title}" - يمكنك تعديل أي شكل أو عدات أو دخلات الآن!`);
      setTimeout(() => setSavedMsg(''), 4500);
    }
  }, [location.state]);

  useEffect(() => {
    if (!profile?.id) return;
    const u1 = onSnapshot(
      query(collection(db, 'trainees'), where('trainerId', '==', profile.id)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as TraineeProfile));
        setTrainees(list);
        if (list.length > 0 && !selectedTrainee) setSelectedTrainee(list[0].id);
      }
    );
    const u2 = onSnapshot(
      query(collection(db, 'workoutTemplates'), where('trainerId', '==', profile.id)),
      (s) => setCustomTemplates(s.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate)))
    );
    const u3 = onSnapshot(collection(db, 'exercises'), (s) =>
      setCustomExercises(s.docs.map((d) => ({ id: d.id, ...d.data() } as ExerciseItem)))
    );
    return () => {
      u1();
      u2();
      u3();
    };
  }, [profile?.id]);

  const allTemplates = [...BUILTIN_TEMPLATES, ...customTemplates];
  const allExercises = [...customExercises, ...BUILTIN_EXERCISES];

  const handleLoadTemplate = (tplId: string) => {
    const found = allTemplates.find((t) => t.id === tplId);
    if (!found) return;
    setTitle(found.title);
    setGoal(found.category);
    setDays(JSON.parse(JSON.stringify(found.days)));
    setSavedMsg(`تم استيراد جدول "${found.title}" للتعديل`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const addDay = () => {
    const nextNum = days.length + 1;
    setDays([
      ...days,
      { dayNumber: nextNum, title: `اليوم ${nextNum}: حصة تدريبية جديدة`, exercises: [] },
    ]);
  };

  const removeDay = (idx: number) => {
    if (days.length <= 1) return;
    const updated = days
      .filter((_, i) => i !== idx)
      .map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setDays(updated);
  };

  const updateDayTitle = (idx: number, val: string) => {
    const copy = [...days];
    copy[idx].title = val;
    setDays(copy);
  };

  const addExerciseToDay = (dayIdx: number, ex: ExerciseItem) => {
    const copy = [...days];
    const planned: PlannedExercise = {
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      entrances: ex.defaultEntrances || '1 دخلة تسخين (15 عدة بوزن خفيف)',
      sets: ex.defaultSets || 3,
      reps: ex.defaultReps || '10-12',
      restSeconds: ex.defaultRestSeconds ?? 90,
      notes: '',
    };
    copy[dayIdx].exercises.push(planned);
    setDays(copy);
    setPickerDayIdx(null);
  };

  const updateExerciseField = (
    dayIdx: number,
    exIdx: number,
    field: keyof PlannedExercise,
    value: any
  ) => {
    const copy = [...days];
    (copy[dayIdx].exercises[exIdx] as any)[field] = value;
    setDays(copy);
  };

  const moveExercise = (dayIdx: number, exIdx: number, dir: -1 | 1) => {
    const copy = [...days];
    const list = copy[dayIdx].exercises;
    const target = exIdx + dir;
    if (target < 0 || target >= list.length) return;
    [list[exIdx], list[target]] = [list[target], list[exIdx]];
    setDays(copy);
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const copy = [...days];
    copy[dayIdx].exercises.splice(exIdx, 1);
    setDays(copy);
  };

  const handleSaveAsTemplate = async () => {
    if (!profile?.id || !title.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'workoutTemplates'), {
        trainerId: profile.id,
        title: title.trim(),
        category: goal,
        level: 'مخصص',
        description: `قالب مخصص (${days.length} أيام أسبوعياً)`,
        daysPerWeek: days.length,
        days,
        isGlobal: false,
        createdAt: serverTimestamp(),
      });
      setSavedMsg('تم حفظ الجدول كقالب جديد في مكتبتك بنجاح!');
      setTimeout(() => setSavedMsg(''), 3500);
    } catch (err: any) {
      alert(err?.message || 'تعذر حفظ القالب');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignToTrainee = async () => {
    if (!profile?.id || !selectedTrainee) {
      alert('اختر المتدرب أولاً');
      return;
    }
    setSaving(true);
    try {
      const existingSnap = await getDocs(
        query(collection(db, 'workoutPlans'), where('trainerId', '==', profile.id), where('traineeId', '==', selectedTrainee))
      );
      for (const d of existingSnap.docs) {
        if (d.data().isActive) {
          await updateDoc(doc(db, 'workoutPlans', d.id), { isActive: false });
        }
      }

      await addDoc(collection(db, 'workoutPlans'), {
        traineeId: selectedTrainee,
        trainerId: profile.id,
        title: title.trim() || 'برنامج تدريبي مخصص',
        goal,
        durationWeeks: Number(durationWeeks) || 4,
        daysPerWeek: days.length,
        isActive: true,
        days,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'notifications'), {
        userId: selectedTrainee,
        title: 'جدول تدريبي جديد من الكوتش!',
        body: `تم تحديث جدولك التدريبي إلى: ${title}`,
        type: 'workout',
        read: false,
        link: '/trainee/workouts',
        createdAt: serverTimestamp(),
      });

      setSavedMsg('تم اعتماد وإرسال الجدول التدريبي للمتدرب بنجاح!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء حفظ الجدول');
    } finally {
      setSaving(false);
    }
  };

  const filteredPickerExercises = allExercises.filter((ex) => {
    const matchMuscle = pickerMuscle === 'ALL' || ex.muscleGroup === pickerMuscle;
    const q = pickerSearch.trim().toLowerCase();
    const matchText =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q);
    return matchMuscle && matchText;
  });

  return (
    <div className="space-y-5">
      <div className="hulk-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-black flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#39FF14]" />
              منشئ الجداول التدريبية الاحترافي
            </h1>
            <p className="text-xs text-[#929B95] mt-0.5">
              اختر قالباً جاهزاً أو ابنِ جدولك من الصفر مع التحكم الكامل في الأشكال والدخلات والعدات
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) handleLoadTemplate(e.target.value);
              }}
              defaultValue=""
              className="hulk-input text-xs font-bold border-[#39FF14]/40"
            >
              <option value="" disabled>
                ⚡ استيراد جدول جاهز للتعديل...
              </option>
              {allTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.daysPerWeek} أيام)
                </option>
              ))}
            </select>
          </div>
        </div>

        {savedMsg && (
          <div className="p-3 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-xs font-bold text-[#39FF14] flex items-center gap-2 animate-card-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold text-[#929B95] block mb-1">المتدرب</label>
            <select
              value={selectedTrainee}
              onChange={(e) => setSelectedTrainee(e.target.value)}
              className="hulk-input w-full text-xs"
            >
              <option value="">-- اختر متدرباً --</option>
              {trainees.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#929B95] block mb-1">اسم الجدول</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="hulk-input w-full text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#929B95] block mb-1">الهدف</label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="hulk-input w-full text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#929B95] block mb-1">المدة (أسابيع)</label>
            <input
              type="number"
              min={1}
              max={52}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              className="hulk-input w-full text-xs"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {days.map((day, dIdx) => (
          <div key={dIdx} className="hulk-card p-4 space-y-3 animate-card-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#29352D] pb-3">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <span className="px-2.5 py-1 rounded-lg bg-[#39FF14]/15 text-[#39FF14] text-xs font-black">
                  يوم {day.dayNumber}
                </span>
                <input
                  value={day.title}
                  onChange={(e) => updateDayTitle(dIdx, e.target.value)}
                  className="hulk-input flex-1 text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPickerDayIdx(dIdx);
                    setPickerSearch('');
                    setPickerMuscle('ALL');
                  }}
                  className="hulk-btn-primary px-3 py-2 text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة شكل / تمرين
                </button>
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(dIdx)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    title="حذف اليوم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {day.exercises.length === 0 ? (
              <p className="text-center text-xs text-[#929B95] py-5">
                لا توجد تمارين في هذا اليوم بعد. اضغط "إضافة شكل / تمرين" للاختيار من المكتبة.
              </p>
            ) : (
              <div className="space-y-2.5">
                {day.exercises.map((ex, exIdx) => (
                  <div
                    key={`${ex.exerciseId}_${exIdx}`}
                    className="p-3 rounded-xl bg-[#111713] border border-[#29352D] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-black text-[#39FF14]">#{exIdx + 1}</span>
                        <p className="text-xs font-extrabold truncate">{ex.name}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1C2420] text-[#929B95] shrink-0">
                          {ex.muscleGroup}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveExercise(dIdx, exIdx, -1)}
                          className="p-1.5 rounded-lg hover:bg-[#1C2420] text-[#929B95]"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(dIdx, exIdx, 1)}
                          className="p-1.5 rounded-lg hover:bg-[#1C2420] text-[#929B95]"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExercise(dIdx, exIdx)}
                          className="p-1.5 rounded-lg hover:bg-red-500/15 text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-[#FF9F1C] font-bold block mb-1">
                          الدخلات (Warm-up / Feeder Sets)
                        </label>
                        <input
                          list={`entrances_list_${dIdx}_${exIdx}`}
                          value={ex.entrances || ''}
                          onChange={(e) =>
                            updateExerciseField(dIdx, exIdx, 'entrances', e.target.value)
                          }
                          placeholder="اختر أو اكتب الدخلات..."
                          className="hulk-input w-full text-xs py-1.5"
                        />
                        <datalist id={`entrances_list_${dIdx}_${exIdx}`}>
                          {ENTRANCE_PRESETS.map((preset) => (
                            <option key={preset} value={preset} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="text-[10px] text-[#929B95] font-bold block mb-1">
                          المجموعات الفعلية
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={15}
                          value={ex.sets}
                          onChange={(e) =>
                            updateExerciseField(dIdx, exIdx, 'sets', Number(e.target.value))
                          }
                          className="hulk-input w-full text-xs py-1.5"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#929B95] font-bold block mb-1">
                          العدات
                        </label>
                        <input
                          value={ex.reps}
                          onChange={(e) =>
                            updateExerciseField(dIdx, exIdx, 'reps', e.target.value)
                          }
                          placeholder="10-12"
                          className="hulk-input w-full text-xs py-1.5"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#929B95] font-bold block mb-1">
                          الراحة (ثانية)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={600}
                          value={ex.restSeconds}
                          onChange={(e) =>
                            updateExerciseField(dIdx, exIdx, 'restSeconds', Number(e.target.value))
                          }
                          className="hulk-input w-full text-xs py-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        value={ex.notes || ''}
                        onChange={(e) =>
                          updateExerciseField(dIdx, exIdx, 'notes', e.target.value)
                        }
                        placeholder="ملاحظة للكوتش على الأداء أو التمبو (اختياري)..."
                        className="hulk-input w-full text-[11px] py-1.5 text-[#929B95]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addDay}
          className="px-4 py-2.5 rounded-xl bg-[#1C2420] border border-[#29352D] hover:border-[#39FF14]/50 text-xs font-bold flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4 text-[#39FF14]" />
          إضافة يوم تدريبي جديد
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAsTemplate}
            className="px-4 py-2.5 rounded-xl bg-[#1C2420] border border-[#39FF14]/40 text-[#39FF14] text-xs font-extrabold flex items-center gap-2 hover:bg-[#39FF14]/10 transition"
          >
            <Copy className="w-4 h-4" />
            حفظ كقالب في مكتبتي
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleAssignToTrainee}
            className="hulk-btn-primary px-5 py-2.5 text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'اعتماد وإرسال الجدول للمتدرب'}
          </button>
        </div>
      </div>

      {pickerDayIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="hulk-card w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-modal-in">
            <div className="p-4 border-b border-[#29352D] flex items-center justify-between">
              <h3 className="font-black text-sm">
                اختر شكلاً / تمريناً لإضافته إلى {days[pickerDayIdx]?.title}
              </h3>
              <button
                type="button"
                onClick={() => setPickerDayIdx(null)}
                className="text-xs text-[#929B95] hover:text-white px-2 py-1"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="p-3 border-b border-[#29352D] space-y-2.5 bg-[#111713]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#929B95] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="ابحث باسم التمرين بالعربي أو الإنجليزي أو الجهاز..."
                  className="hulk-input w-full pr-9 text-xs"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(Object.keys(MUSCLE_LABELS_AR) as Array<ExerciseItem['muscleGroup'] | 'ALL'>).map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPickerMuscle(m)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                        pickerMuscle === m
                          ? 'bg-[#39FF14] text-[#090B0A]'
                          : 'bg-[#1C2420] text-[#929B95] hover:text-white'
                      }`}
                    >
                      {MUSCLE_LABELS_AR[m]}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredPickerExercises.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => addExerciseToDay(pickerDayIdx, ex)}
                  className="w-full text-right p-3 rounded-xl bg-[#111713] border border-[#29352D] hover:border-[#39FF14] transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold">{ex.name}</p>
                    <p className="text-[11px] text-[#929B95] mt-0.5">
                      {ex.equipment} • {ex.defaultSets || 3} مجموعات × {ex.defaultReps || '10-12'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#39FF14]/15 text-[#39FF14] text-[11px] font-bold shrink-0">
                    + إضافة
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TrainerTemplatesPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [customTemplates, setCustomTemplates] = useState<WorkoutTemplate[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    return onSnapshot(
      query(collection(db, 'workoutTemplates'), where('trainerId', '==', profile.id)),
      (s) => setCustomTemplates(s.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate)))
    );
  }, [profile?.id]);

  const allTemplates = [...BUILTIN_TEMPLATES, ...customTemplates];

  const handleUseTemplate = (tpl: WorkoutTemplate) => {
    navigate('workouts', { state: { template: tpl } });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('حذف هذا القالب المخصص؟')) return;
    await deleteDoc(doc(db, 'workoutTemplates', id));
  };

  return (
    <div className="space-y-5">
      <div className="hulk-card p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#39FF14]" />
            مكتبة الجداول والقوالب الجاهزة ({allTemplates.length})
          </h1>
          <p className="text-xs text-[#929B95] mt-0.5">
            اختر أي جدول جاهز لفتحه في منشئ الجداول وتعديل الأشكال والدخلات والعدات قبل إرساله للمتدرب
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTemplates.map((tpl) => (
          <div key={tpl.id} className="hulk-card p-5 flex flex-col justify-between gap-4 animate-card-in">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#39FF14]/15 text-[#39FF14] text-[11px] font-bold mb-1.5">
                    {tpl.category} • {tpl.daysPerWeek} أيام
                  </span>
                  <h3 className="font-black text-sm">{tpl.title}</h3>
                </div>
                {!tpl.isGlobal && (
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {tpl.description && (
                <p className="text-xs text-[#929B95] leading-relaxed">{tpl.description}</p>
              )}

              <div className="space-y-1.5 pt-2 border-t border-[#29352D]">
                {tpl.days.map((d) => (
                  <div
                    key={d.dayNumber}
                    className="text-[11px] bg-[#111713] px-3 py-2 rounded-xl flex items-center justify-between"
                  >
                    <span className="font-bold truncate">{d.title}</span>
                    <span className="text-[#39FF14] font-bold shrink-0">
                      {d.exercises.length} أشكال
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleUseTemplate(tpl)}
              className="hulk-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              تعديل الجدول وتعيينه لمتدرب
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrainerExerciseLibraryPage: React.FC = () => {
  const { profile } = useAuth();
  const [customExercises, setCustomExercises] = useState<ExerciseItem[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<ExerciseItem['muscleGroup'] | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<ExerciseItem['muscleGroup']>('Chest');
  const [equipment, setEquipment] = useState('');
  const [defaultEntrances, setDefaultEntrances] = useState(ENTRANCE_PRESETS[1]);
  const [defaultSets, setDefaultSets] = useState(3);
  const [defaultReps, setDefaultReps] = useState('10-12');
  const [instructions, setInstructions] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, 'exercises'), (s) =>
      setCustomExercises(s.docs.map((d) => ({ id: d.id, ...d.data() } as ExerciseItem)))
    );
  }, []);

  const allExercises = [...customExercises, ...BUILTIN_EXERCISES];

  const filtered = allExercises.filter((ex) => {
    const matchMuscle = selectedMuscle === 'ALL' || ex.muscleGroup === selectedMuscle;
    const q = search.trim().toLowerCase();
    const matchText =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q) ||
      ex.instructions.toLowerCase().includes(q);
    return matchMuscle && matchText;
  });

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !name.trim()) return;
    setSaving(true);
    try {
      let imageUrl = '';
      if (mediaFile) {
        const uploaded = await uploadExerciseMedia(mediaFile);
        imageUrl = uploaded;
      }
      await addDoc(collection(db, 'exercises'), {
        name: name.trim(),
        muscleGroup,
        equipment: equipment.trim() || 'وزن حر / جهاز',
        defaultEntrances,
        defaultSets: Number(defaultSets) || 3,
        defaultReps: defaultReps.trim() || '10-12',
        defaultRestSeconds: 90,
        instructions: instructions.trim() || 'أداء بتحكم كامل مع الحفاظ على المدى الحركي الصحيح.',
        ...(imageUrl ? { imageUrl } : {}),
        isGlobal: false,
        trainerId: profile.id,
      });
      setName('');
      setEquipment('');
      setInstructions('');
      setMediaFile(null);
      setShowAddForm(false);
    } catch (err: any) {
      alert(err?.message || 'تعذر إضافة التمرين');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="hulk-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-black flex items-center gap-2">
              <Library className="w-5 h-5 text-[#39FF14]" />
              مكتبة التمارين والأشكال الشاملة ({allExercises.length} شكل)
            </h1>
            <p className="text-xs text-[#929B95] mt-0.5">
              تصفح جميع أشكال التمارين لكل عضلة مع الدخلات والعدات المقترحة أو أضف أشكالك الخاصة
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="hulk-btn-primary px-4 py-2.5 text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'إغلاق النموذج' : 'إضافة شكل / تمرين جديد'}
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleCreateExercise}
            className="p-4 rounded-2xl bg-[#111713] border border-[#39FF14]/30 space-y-3 animate-card-in"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#929B95] block mb-1">اسم التمرين / الشكل</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: تجميع دمبل مائل بزاوية 30"
                  className="hulk-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#929B95] block mb-1">العضلة المستهدفة</label>
                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value as ExerciseItem['muscleGroup'])}
                  className="hulk-input w-full text-xs"
                >
                  {(Object.keys(MUSCLE_LABELS_AR) as Array<ExerciseItem['muscleGroup'] | 'ALL'>)
                    .filter((k) => k !== 'ALL')
                    .map((k) => (
                      <option key={k} value={k}>
                        {MUSCLE_LABELS_AR[k]}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#929B95] block mb-1">الأداة / الجهاز</label>
                <input
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="دمبل / بار / كيبل"
                  className="hulk-input w-full text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#FF9F1C] block mb-1">الدخلات الافتراضية</label>
                <select
                  value={defaultEntrances}
                  onChange={(e) => setDefaultEntrances(e.target.value)}
                  className="hulk-input w-full text-xs"
                >
                  {ENTRANCE_PRESETS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#929B95] block mb-1">المجموعات الافتراضية</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={defaultSets}
                  onChange={(e) => setDefaultSets(Number(e.target.value))}
                  className="hulk-input w-full text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#929B95] block mb-1">العدات الافتراضية</label>
                <input
                  value={defaultReps}
                  onChange={(e) => setDefaultReps(e.target.value)}
                  placeholder="10-12"
                  className="hulk-input w-full text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="شرح الأداء الصحيح للتمرين..."
                className="hulk-input w-full text-xs"
              />
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="hulk-input w-full text-xs"
              />
            </div>

            <button type="submit" disabled={saving} className="hulk-btn-primary px-5 py-2 text-xs">
              {saving ? 'جاري الحفظ...' : 'حفظ الشكل في المكتبة'}
            </button>
          </form>
        )}

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#929B95] absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن أي تمرين أو شكل..."
              className="hulk-input w-full pr-9 text-xs"
            />
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {(Object.keys(MUSCLE_LABELS_AR) as Array<ExerciseItem['muscleGroup'] | 'ALL'>).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedMuscle === m
                  ? 'bg-[#39FF14] text-[#090B0A]'
                  : 'bg-[#111713] text-[#929B95] hover:text-white border border-[#29352D]'
              }`}
            >
              {MUSCLE_LABELS_AR[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex) => (
          <div key={ex.id} className="hulk-card p-4 space-y-2.5 animate-card-in">
            <div className="flex items-start justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#39FF14]/15 text-[#39FF14] text-[11px] font-bold">
                {MUSCLE_LABELS_AR[ex.muscleGroup]}
              </span>
              {!ex.isGlobal && (
                <button
                  type="button"
                  onClick={() => deleteDoc(doc(db, 'exercises', ex.id))}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <h3 className="font-extrabold text-xs leading-relaxed">{ex.name}</h3>
            <p className="text-[11px] text-[#929B95]">الأداة: {ex.equipment}</p>

            {ex.defaultEntrances && (
              <p className="text-[11px] text-[#FF9F1C] font-bold">
                الدخلات: {ex.defaultEntrances}
              </p>
            )}

            <p className="text-[11px] text-[#39FF14] font-bold">
              العدات المقترحة: {ex.defaultSets || 3} مجموعات × {ex.defaultReps || '10-12'}
            </p>

            <p className="text-[11px] text-[#929B95] leading-relaxed border-t border-[#29352D] pt-2">
              {ex.instructions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TrainerNutritionBuilderPage: React.FC = () => {
  const { profile } = useAuth();
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);
  const [selectedTraineeId, setSelectedTraineeId] = useState('');
  const [goalType, setGoalType] = useState<'cut' | 'maintain' | 'bulk'>('cut');
  const [title, setTitle] = useState('نظام غذائي محسوب الماكروز');
  const [targetCalories, setTargetCalories] = useState(2400);
  const [proteinGrams, setProteinGrams] = useState(180);
  const [carbsGrams, setCarbsGrams] = useState(250);
  const [fatsGrams, setFatsGrams] = useState(70);
  const [waterLiters, setWaterLiters] = useState(3.5);
  const [meals, setMeals] = useState<MealBlock[]>([
    {
      mealNumber: 1,
      title: 'الوجبة الأولى (الإفطار)',
      items: [{ name: 'شوفان + 4 بيضات كاملة', grams: 250, calories: 520, protein: 32, carbs: 55, fats: 18 }],
    },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    return onSnapshot(
      query(collection(db, 'trainees'), where('trainerId', '==', profile.id)),
      (s) => {
        const list = s.docs.map((d) => ({ id: d.id, ...d.data() } as TraineeProfile));
        setTrainees(list);
        if (list[0] && !selectedTraineeId) setSelectedTraineeId(list[0].id);
      }
    );
  }, [profile?.id]);

  const handleAutoCalculate = () => {
    const client = trainees.find((t) => t.id === selectedTraineeId);
    if (!client) return;
    const bmr = calculateBMR(client.currentWeight, client.height, client.age, client.gender);
    const tdee = calculateTDEE(bmr, client.activityLevel || 'moderate');
    const macros = calculateSmartMacros(tdee, client.currentWeight, goalType);
    setTargetCalories(macros.targetCalories);
    setProteinGrams(macros.proteinGrams);
    setCarbsGrams(macros.carbsGrams);
    setFatsGrams(macros.fatsGrams);
    setWaterLiters(macros.waterLiters);
  };

  const handleAssignNutrition = async () => {
    if (!profile?.id || !selectedTraineeId) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'nutritionPlans'), {
        traineeId: selectedTraineeId,
        trainerId: profile.id,
        title,
        targetCalories,
        proteinGrams,
        carbsGrams,
        fatsGrams,
        waterLiters,
        meals,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'notifications'), {
        userId: selectedTraineeId,
        title: 'تم تحديث خطتك الغذائية 🥗',
        body: `السعرات المستهدفة: ${targetCalories} سعرة حرارية`,
        type: 'nutrition',
        read: false,
        link: '/trainee/nutrition',
        createdAt: serverTimestamp(),
      });
      alert('تم إسناد النظام الغذائي للمتدرب بنجاح!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Utensils className="w-6 h-6 text-[#39FF14]" />
          <span>منشئ الأنظمة الغذائية وحاسبة الماكروز</span>
        </h1>
        <button
          onClick={handleAssignNutrition}
          disabled={saving || !selectedTraineeId}
          className="hulk-btn-primary px-5 py-2.5 text-xs sm:text-sm"
        >
          {saving ? 'جاري الحفظ...' : 'إسناد النظام الغذائي'}
        </button>
      </div>

      {/* Smart Macro Calculator */}
      <div className="hulk-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs font-bold text-[#929B95]">المتدرب</label>
            <select
              value={selectedTraineeId}
              onChange={(e) => setSelectedTraineeId(e.target.value)}
              className="hulk-input w-full text-sm mt-1"
            >
              {trainees.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.currentWeight} كجم)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-[#929B95]">الهدف الغذائي</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as any)}
              className="hulk-input w-full text-sm mt-1"
            >
              <option value="cut">تنشيف وخسارة دهون (Cut)</option>
              <option value="maintain">ثبات وتحسين تكوين الجسم</option>
              <option value="bulk">تضخيم وبناء عضلي (Bulk)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-[#929B95]">اسم الخطة</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="hulk-input w-full text-sm mt-1"
            />
          </div>
          <button
            type="button"
            onClick={handleAutoCalculate}
            className="py-2.5 px-4 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] text-xs font-extrabold flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>حساب السعرات والماكروز تلقائياً</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#111713] border border-[#29352D]">
            <label className="text-[11px] text-[#929B95]">السعرات</label>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Number(e.target.value))}
              className="w-full bg-transparent text-lg font-black text-[#39FF14] outline-none mt-1"
            />
          </div>
          <div className="p-3 rounded-xl bg-[#111713] border border-[#29352D]">
            <label className="text-[11px] text-[#929B95]">البروتين (جم)</label>
            <input
              type="number"
              value={proteinGrams}
              onChange={(e) => setProteinGrams(Number(e.target.value))}
              className="w-full bg-transparent text-lg font-black outline-none mt-1"
            />
          </div>
          <div className="p-3 rounded-xl bg-[#111713] border border-[#29352D]">
            <label className="text-[11px] text-[#929B95]">الكارب (جم)</label>
            <input
              type="number"
              value={carbsGrams}
              onChange={(e) => setCarbsGrams(Number(e.target.value))}
              className="w-full bg-transparent text-lg font-black outline-none mt-1"
            />
          </div>
          <div className="p-3 rounded-xl bg-[#111713] border border-[#29352D]">
            <label className="text-[11px] text-[#929B95]">الدهون (جم)</label>
            <input
              type="number"
              value={fatsGrams}
              onChange={(e) => setFatsGrams(Number(e.target.value))}
              className="w-full bg-transparent text-lg font-black outline-none mt-1"
            />
          </div>
          <div className="p-3 rounded-xl bg-[#111713] border border-[#29352D]">
            <label className="text-[11px] text-[#929B95]">الماء (لتر)</label>
            <input
              type="number"
              step="0.5"
              value={waterLiters}
              onChange={(e) => setWaterLiters(Number(e.target.value))}
              className="w-full bg-transparent text-lg font-black text-cyan-400 outline-none mt-1"
            />
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {meals.map((meal, mIdx) => (
          <div key={mIdx} className="hulk-card p-5 space-y-3">
            <input
              value={meal.title}
              onChange={(e) => {
                const copy = [...meals];
                copy[mIdx].title = e.target.value;
                setMeals(copy);
              }}
              className="hulk-input font-extrabold text-sm w-full sm:w-80"
            />
            {meal.items.map((item, iIdx) => (
              <div key={iIdx} className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-[#111713] p-3 rounded-xl">
                <input
                  value={item.name}
                  onChange={(e) => {
                    const copy = [...meals];
                    copy[mIdx].items[iIdx].name = e.target.value;
                    setMeals(copy);
                  }}
                  placeholder="الصنف الغذائي"
                  className="hulk-input text-xs col-span-2"
                />
                <input
                  type="number"
                  value={item.grams}
                  onChange={(e) => {
                    const copy = [...meals];
                    copy[mIdx].items[iIdx].grams = Number(e.target.value);
                    setMeals(copy);
                  }}
                  placeholder="الكمية (جم)"
                  className="hulk-input text-xs"
                />
                <input
                  type="number"
                  value={item.calories}
                  onChange={(e) => {
                    const copy = [...meals];
                    copy[mIdx].items[iIdx].calories = Number(e.target.value);
                    setMeals(copy);
                  }}
                  placeholder="سعرات"
                  className="hulk-input text-xs"
                />
                <input
                  type="number"
                  value={item.protein}
                  onChange={(e) => {
                    const copy = [...meals];
                    copy[mIdx].items[iIdx].protein = Number(e.target.value);
                    setMeals(copy);
                  }}
                  placeholder="بروتين"
                  className="hulk-input text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const copy = [...meals];
                    copy[mIdx].items.push({ name: 'صدر دجاج مشوي', grams: 200, calories: 330, protein: 62, carbs: 0, fats: 7 });
                    setMeals(copy);
                  }}
                  className="text-xs font-bold text-[#39FF14]"
                >
                  + صنف
                </button>
              </div>
            ))}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setMeals([
              ...meals,
              {
                mealNumber: meals.length + 1,
                title: `الوجبة ${meals.length + 1}`,
                items: [{ name: 'أرز بسمتي + لحم صافي', grams: 300, calories: 550, protein: 45, carbs: 65, fats: 10 }],
              },
            ])
          }
          className="w-full py-3 rounded-2xl border-2 border-dashed border-[#29352D] text-xs font-bold text-[#929B95] hover:text-[#39FF14]"
        >
          + إضافة وجبة جديدة
        </button>
      </div>
    </div>
  );
};

export const TrainerSubscriptionsPage: React.FC = () => {
  const { profile } = useAuth();
  const [subs, setSubs] = useState<SubscriptionRecord[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    return onSnapshot(
      query(collection(db, 'subscriptions'), where('trainerId', '==', profile.id)),
      (s) => setSubs(s.docs.map((d) => ({ id: d.id, ...d.data() } as SubscriptionRecord)))
    );
  }, [profile?.id]);

  const renewOneMonth = async (sub: SubscriptionRecord) => {
    const currentEnd = new Date(sub.endDate || Date.now());
    const nextEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + 30 * 86400000);
    const nextEndStr = nextEnd.toISOString().split('T')[0];
    await updateDoc(doc(db, 'subscriptions', sub.id), {
      endDate: nextEndStr,
      status: 'Active',
      paymentStatus: 'Paid',
    });
    await updateDoc(doc(db, 'trainees', sub.traineeId), {
      subscriptionEnd: nextEndStr,
      subscriptionStatus: 'Active',
    }).catch(() => null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-[#39FF14]" />
        <span>إدارة الاشتراكات والتحصيل ({subs.length})</span>
      </h1>

      <div className="hulk-card overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#111713] text-[#929B95] border-b border-[#29352D]">
            <tr>
              <th className="p-3.5">المتدرب</th>
              <th className="p-3.5">البداية</th>
              <th className="p-3.5">النهاية</th>
              <th className="p-3.5">المبلغ</th>
              <th className="p-3.5">الدفع</th>
              <th className="p-3.5">تجديد سريع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#29352D]">
            {subs.map((sub) => (
              <tr key={sub.id}>
                <td className="p-3.5 font-bold">{sub.traineeName}</td>
                <td className="p-3.5">{sub.startDate}</td>
                <td className="p-3.5 text-[#39FF14] font-bold">{sub.endDate}</td>
                <td className="p-3.5">{sub.amount} {sub.currency}</td>
                <td className="p-3.5">{sub.paymentStatus}</td>
                <td className="p-3.5">
                  <button
                    onClick={() => renewOneMonth(sub)}
                    className="px-3 py-1.5 rounded-lg bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] font-bold"
                  >
                    + تجديد شهر
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TrainerSettingsPage: React.FC = () => {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    await updateDoc(doc(db, 'users', profile.id), { fullName, phone });
    await updateDoc(doc(db, 'trainers', profile.id), { fullName, phone }).catch(() => null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-black flex items-center gap-2">
        <Settings className="w-6 h-6 text-[#39FF14]" />
        <span>إعدادات حساب المدرب</span>
      </h1>
      <form onSubmit={handleSave} className="hulk-card p-6 space-y-4">
        <div>
          <label className="text-xs font-bold text-[#929B95]">الاسم التجاري / اسم الكوتش</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="hulk-input w-full text-sm mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-[#929B95]">رقم الهاتف للتواصل</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            className="hulk-input w-full text-sm mt-1"
          />
        </div>
        <button type="submit" className="hulk-btn-primary px-6 py-2.5 text-sm">
          حفظ التعديلات
        </button>
        {saved && <p className="text-xs text-[#39FF14] font-bold">تم تحديث ملفك الشخصي بنجاح!</p>}
      </form>
    </div>
  );
};
