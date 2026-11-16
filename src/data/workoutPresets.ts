import { ExerciseItem, WorkoutTemplate } from '../types';

export const MUSCLE_LABELS_AR: Record<ExerciseItem['muscleGroup'] | 'ALL', string> = {
  ALL: 'جميع العضلات',
  Chest: 'صدر (Chest)',
  Back: 'ظهر (Back)',
  Shoulders: 'أكتاف (Shoulders)',
  Biceps: 'بايسبس (Biceps)',
  Triceps: 'ترايسبس (Triceps)',
  Legs: 'أرجل (Legs)',
  Abs: 'بطن وكور (Abs)',
  Cardio: 'كارديو ولياقة (Cardio)',
};

export const ENTRANCE_PRESETS = [
  'بدون دخلات',
  '1 دخلة تسخين (15 عدة بوزن خفيف)',
  '2 دخلات تسخين (15 ثم 10 عدات)',
  '2 دخلات تصاعدية (12 ثم 8 عدات)',
  '3 دخلات تسخين وتدرج بالأوزان (15-12-8)',
  'إطالات ديناميكية + 2 دخلة خفيفة',
];

export const BUILTIN_EXERCISES: ExerciseItem[] = [
  // Chest (10)
  { id: 'chest_flat_bb', name: 'بنش برس بار مستوي - Flat Barbell Bench Press', muscleGroup: 'Chest', equipment: 'بار أوليمبي + بنش مستوي', instructions: 'ثبت لوحي الكتف على البنش وانزل بالبار لمنتصف الصدر بتحكم ثم ادفع لأعلى.', defaultEntrances: '2 دخلات تسخين (15 ثم 10 عدات)', defaultSets: 4, defaultReps: '8-10', defaultRestSeconds: 120, isGlobal: true },
  { id: 'chest_incline_bb', name: 'بنش برس بار عالي - Incline Barbell Bench Press', muscleGroup: 'Chest', equipment: 'بار أوليمبي + بنش مائل 30°', instructions: 'اضبط زاوية البنش 30 درجة لاستهداف الصدر العلوي دون تحميل زائد على الكتف الأمامي.', defaultEntrances: '2 دخلات تسخين (15 ثم 10 عدات)', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isGlobal: true },
  { id: 'chest_incline_db', name: 'تجميع دمبل عالي - Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'دمبل + بنش مائل 30°', instructions: 'انزل بالدمبل بمدى حركي كامل مع ثبات الكوع بزاوية 45 درجة.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 90, isGlobal: true },
  { id: 'chest_flat_db', name: 'تجميع دمبل مستوي - Flat Dumbbell Press', muscleGroup: 'Chest', equipment: 'دمبل + بنش مستوي', instructions: 'ادفع الدمبل لأعلى مع عصر الصدر في القمة دون اصطدام الأوزان.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 90, isGlobal: true },
  { id: 'chest_decline', name: 'تجميع سفلي بار أو جهاز - Decline Chest Press', muscleGroup: 'Chest', equipment: 'بنش سفلي / جهاز', instructions: 'تركيز على الألياف السفلية للصدر مع تحكم كامل في النزول.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 90, isGlobal: true },
  { id: 'chest_incline_fly', name: 'تفتيح دمبل عالي - Incline Dumbbell Fly', muscleGroup: 'Chest', equipment: 'دمبل + بنش مائل', instructions: 'حافظ على انثناء بسيط ثابت في الكوع وافتح الصدر للإطالة الكاملة.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'chest_cable_high', name: 'تفتيح كيبل من أعلى لأسفل - High-to-Low Cable Crossover', muscleGroup: 'Chest', equipment: 'جهاز الكيبل كروس', instructions: 'اسحب القبضتين لأسفل وأمام الخصر مع عصر الصدر السفلي ثانية.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'chest_cable_low', name: 'تفتيح كيبل من أسفل لأعلى - Low-to-High Cable Fly', muscleGroup: 'Chest', equipment: 'جهاز الكيبل كروس', instructions: 'ارفع القبضتين لأعلى بمستوى الذقن لعزل الصدر العلوي.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'chest_pec_deck', name: 'تجميع جهاز الفراشة - Pec Deck Machine Fly', muscleGroup: 'Chest', equipment: 'جهاز الفراشة (Pec Deck)', instructions: 'ثبت ظهرك بالكامل على المسند واجمع الذراعين أمام الصدر ببطء.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'chest_dips', name: 'متوازي للصدر - Chest Dips', muscleGroup: 'Chest', equipment: 'جهاز المتوازي', instructions: 'مل بجذعك للأمام قليلاً أثناء النزول لزيادة تفعيل الصدر السفلي.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '8-12', defaultRestSeconds: 90, isGlobal: true },

  // Back (9)
  { id: 'back_lat_wide', name: 'سحب أمامي قبضة واسعة - Wide-Grip Lat Pulldown', muscleGroup: 'Back', equipment: 'جهاز السحب العلوي', instructions: 'اسحب البار لأعلى الصدر مع إنزال لوحي الكتف وتجنب المرجحة بالظهر.', defaultEntrances: '2 دخلات تسخين (15 ثم 10 عدات)', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 90, isGlobal: true },
  { id: 'back_lat_close', name: 'سحب أمامي قبضة ضيقة - V-Bar Close-Grip Pulldown', muscleGroup: 'Back', equipment: 'جهاز السحب العلوي + مقبض V', instructions: 'اسحب المقبض لمنتصف الصدر مع عصر عضلات المجنص السفلية.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 90, isGlobal: true },
  { id: 'back_bb_row', name: 'تجديف بالبار حر - Barbell Bent-Over Row', muscleGroup: 'Back', equipment: 'بار أوليمبي', instructions: 'حافظ على استقامة الظهر بزاوية 45 درجة واسحب البار نحو أسفل البطن.', defaultEntrances: '2 دخلات تصاعدية (12 ثم 8 عدات)', defaultSets: 4, defaultReps: '8-10', defaultRestSeconds: 120, isGlobal: true },
  { id: 'back_seated_row', name: 'سحب أرضي بالكيبل - Seated Cable Row', muscleGroup: 'Back', equipment: 'جهاز السحب الأرضي', instructions: 'افرد صدرك واسحب المقبض نحو البطن مع ضم لوحي الكتف للخلف.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 90, isGlobal: true },
  { id: 'back_db_row', name: 'منشار / تجديف بالدمبل فردي - Single-Arm Dumbbell Row', muscleGroup: 'Back', equipment: 'دمبل + بنش', instructions: 'اسحب الدمبل نحو الحوض بمسار قوسي وعصر المجنص في القمة.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 75, isGlobal: true },
  { id: 'back_tbar', name: 'سحب تي بار - T-Bar Row', muscleGroup: 'Back', equipment: 'جهاز T-Bar', instructions: 'ثبت الجذع واسحب الوزن بقوة لزيادة سماكة منتصف الظهر.', defaultEntrances: '2 دخلات تسخين (15 ثم 10 عدات)', defaultSets: 4, defaultReps: '8-10', defaultRestSeconds: 90, isGlobal: true },
  { id: 'back_straight_arm', name: 'سحب كيبل ذراع مستقيم - Straight-Arm Cable Pulldown', muscleGroup: 'Back', equipment: 'كيبل علوي + مسطرة', instructions: 'حافظ على استقامة الذراعين واسحب البار للفخذ لعزل اللاتس بالكامل.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'back_deadlift', name: 'ديدليفت تقليدي - Conventional Barbell Deadlift', muscleGroup: 'Back', equipment: 'بار أوليمبي', instructions: 'شد الكور وحافظ على استقامة العمود الفقري وارفع البار بالقرب من الساقين.', defaultEntrances: '3 دخلات تسخين وتدرج بالأوزان (15-12-8)', defaultSets: 3, defaultReps: '5-8', defaultRestSeconds: 150, isGlobal: true },
  { id: 'back_hyper', name: 'قطنية على الجهاز - Back Hyperextensions', muscleGroup: 'Back', equipment: 'بنش القطنية 45°', instructions: 'انزل ببطء واصعد حتى استقامة الجسم فقط دون تقويس مفرط للخلف.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },

  // Shoulders (8)
  { id: 'sh_db_press', name: 'ضغط كتف بالدمبل جالس - Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', equipment: 'دمبل + بنش بمسند', instructions: 'ادفع الدمبل لأعلى مع إبقاء الكوعين أمام مستوى الكتف قليلاً.', defaultEntrances: '2 دخلات تسخين (15 ثم 10 عدات)', defaultSets: 4, defaultReps: '8-12', defaultRestSeconds: 90, isGlobal: true },
  { id: 'sh_bb_press', name: 'ضغط كتف بالبار أمامي - Overhead Barbell Press', muscleGroup: 'Shoulders', equipment: 'بار أوليمبي', instructions: 'شد البطن والأرداف وادفع البار في خط مستقيم فوق الرأس.', defaultEntrances: '2 دخلات تسخين (15 ثم 10 عدات)', defaultSets: 4, defaultReps: '8-10', defaultRestSeconds: 120, isGlobal: true },
  { id: 'sh_db_lat', name: 'رفرفة جانبي بالدمبل - Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'دمبل', instructions: 'ارفع الدمبل للجانب حتى مستوى الكتف مع قيادة الحركة بالكوع.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'sh_cable_lat', name: 'رفرفة جانبي بالكيبل فردي - Cable Lateral Raise', muscleGroup: 'Shoulders', equipment: 'جهاز الكيبل السفلي', instructions: 'توتر مستمر على الرأس الجانبي للكتف طوال المدى الحركي.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'sh_front', name: 'رفرفة أمامي دمبل أو كيبل - Front Raise', muscleGroup: 'Shoulders', equipment: 'دمبل / كيبل', instructions: 'ارفع الوزن أمام الجسم حتى مستوى الكتف دون تأرجح.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12', defaultRestSeconds: 60, isGlobal: true },
  { id: 'sh_rear_pec', name: 'رفرفة خلفي على الفراشة المقلوب - Reverse Pec Deck', muscleGroup: 'Shoulders', equipment: 'جهاز الفراشة المقلوب', instructions: 'ادفع الذراعين للخلف لعزل الكتف الخلفي مع تثبيت الصدر على المسند.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'sh_face_pull', name: 'سحب للوجه بالحبل - Cable Rope Face Pull', muscleGroup: 'Shoulders', equipment: 'كيبل علوي + حبل', instructions: 'اسحب الحبل نحو الجبهة مع تدوير اليدين للخارج لتقوية الكتف الخلفي والكفة المدورة.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'sh_shrugs', name: 'ترابيس بالدمبل أو البار - Dumbbell / Barbell Shrugs', muscleGroup: 'Shoulders', equipment: 'دمبل / بار', instructions: 'ارفع الكتفين لأعلى نحو الأذنين واثبت ثانية في القمة.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },

  // Biceps (6)
  { id: 'bi_ez_curl', name: 'بايسبس بار زجزاج واقف - EZ-Bar Standing Curl', muscleGroup: 'Biceps', equipment: 'بار زجزاج (EZ-Bar)', instructions: 'ثبت الكوعين بجانب الجذع وارفع البار بعصر كامل للبايسبس.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isGlobal: true },
  { id: 'bi_alt_db', name: 'تبادل دمبل واقف مع التدوير - Alternating Dumbbell Curl', muscleGroup: 'Biceps', equipment: 'دمبل', instructions: 'لف المعصم للخارج أثناء الصعود لتفعيل الرأس القصير للبايسبس.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isGlobal: true },
  { id: 'bi_incline_db', name: 'بايسبس دمبل على بنش مائل - Incline Dumbbell Curl', muscleGroup: 'Biceps', equipment: 'دمبل + بنش مائل 45°', instructions: 'يوفر إطالة قصوى للرأس الطويل للبايسبس؛ انزل ببطء كامل.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isGlobal: true },
  { id: 'bi_preacher', name: 'ارتكاز لاري / بريتشر كيرل - Preacher Curl', muscleGroup: 'Biceps', equipment: 'بنش ارتكاز + بار زجزاج', instructions: 'عزل تام للبايسبس دون أي مساعدة من الكتف أو الظهر.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isGlobal: true },
  { id: 'bi_hammer', name: 'هامر كيرل / شاكوش بالدمبل - Dumbbell Hammer Curl', muscleGroup: 'Biceps', equipment: 'دمبل', instructions: 'قبضة متعادلة لاستهداف عضلة البراكياليس والساعد وزيادة عرض الذراع.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isGlobal: true },
  { id: 'bi_cable', name: 'بايسبس بالكيبل مسطرة - Cable Bicep Curl', muscleGroup: 'Biceps', equipment: 'كيبل سفلي + مسطرة', instructions: 'مقاومة مستمرة في كل زاوية مع عصر قوي في القمة.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },

  // Triceps (5)
  { id: 'tri_rope', name: 'سحب ترايسبس بالحبل - Cable Rope Pushdown', muscleGroup: 'Triceps', equipment: 'كيبل علوي + حبل', instructions: 'ثبت الكوعين وافتح طرفي الحبل للخارج في نهاية الحركة لعصر الرأس الجانبي.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'tri_bar', name: 'سحب ترايسبس بالمسطرة - Straight-Bar Pushdown', muscleGroup: 'Triceps', equipment: 'كيبل علوي + مسطرة', instructions: 'ادفع المسطرة لأسفل حتى فرد الكوع بالكامل دون تحريك الكتف.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isGlobal: true },
  { id: 'tri_skull', name: 'تجميع فرنساوي بار زجزاج نائم - EZ-Bar Skull Crushers', muscleGroup: 'Triceps', equipment: 'بار زجزاج + بنش مستوي', instructions: 'انزل بالبار خلف الجبهة قليلاً لإطالة الرأس الطويل للترايسبس.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 75, isGlobal: true },
  { id: 'tri_overhead', name: 'فرنساوي دمبل خلف الرأس - Overhead Dumbbell Extension', muscleGroup: 'Triceps', equipment: 'دمبل / كيبل', instructions: 'انزل بالدمبل خلف الرأس لأقصى إطالة للرأس الطويل ثم افرد لأعلى.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 60, isGlobal: true },
  { id: 'tri_kickback', name: 'كيك باك بالكيبل فردي - Cable Kickback', muscleGroup: 'Triceps', equipment: 'جهاز الكيبل', instructions: 'حافظ على ثبات العضد موازياً للأرض وافرد الساعد للخلف بالكامل.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isGlobal: true },

  // Legs (9)
  { id: 'legs_squat', name: 'سكوات حر بالبار - Barbell Back Squat', muscleGroup: 'Legs', equipment: 'بار أوليمبي + راك', instructions: 'افتح القدمين بعرض الكتفين وانزل بعمق مع الحفاظ على استقامة الظهر.', defaultEntrances: '3 دخلات تسخين وتدرج بالأوزان (15-12-8)', defaultSets: 4, defaultReps: '6-10', defaultRestSeconds: 150, isGlobal: true },
  { id: 'legs_press', name: 'دفع أرجل على الجهاز 45 - Leg Press', muscleGroup: 'Legs', equipment: 'جهاز Leg Press', instructions: 'لا تقفل الركبتين بالكامل في القمة وانزل بعمق دون رفع أسفل الظهر عن المقعد.', defaultEntrances: '2 دخلات تسخين (15 ثم 10 عدات)', defaultSets: 4, defaultReps: '10-12', defaultRestSeconds: 120, isGlobal: true },
  { id: 'legs_hack', name: 'هاك سكوات - Hack Squat Machine', muscleGroup: 'Legs', equipment: 'جهاز Hack Squat', instructions: 'تركيز عالٍ على عضلات الفخذ الأمامية (Quads) مع أمان للظهر.', defaultEntrances: '2 دخلات تسخين (15 ثم 10 عدات)', defaultSets: 3, defaultReps: '8-12', defaultRestSeconds: 120, isGlobal: true },
  { id: 'legs_ext', name: 'رفرفة أمامي / إكستنشن - Leg Extension', muscleGroup: 'Legs', equipment: 'جهاز Leg Extension', instructions: 'اثبت ثانية في القمة لعصر العضلة الرباعية وانزل ببطء.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'legs_rdl', name: 'رومانيان ديدليفت للخلفيات - Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'بار أوليمبي / دمبل', instructions: 'ادفع الحوض للخلف مع انثناء طفيف بالركبتين حتى تشعر بإطالة الخلفيات.', defaultEntrances: '2 دخلات تصاعدية (12 ثم 8 عدات)', defaultSets: 4, defaultReps: '8-10', defaultRestSeconds: 120, isGlobal: true },
  { id: 'legs_lying_curl', name: 'رفرفة خلفي نائم - Lying Leg Curl', muscleGroup: 'Legs', equipment: 'جهاز Leg Curl نائم', instructions: 'ثبت الحوض على البنش واسحب الكعبين نحو الأرداف بتحكم.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '10-12', defaultRestSeconds: 75, isGlobal: true },
  { id: 'legs_seated_curl', name: 'رفرفة خلفي جالس - Seated Leg Curl', muscleGroup: 'Legs', equipment: 'جهاز Leg Curl جالس', instructions: 'يوفر إطالة ممتازة للهامسترينج أثناء الجلوس.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 75, isGlobal: true },
  { id: 'legs_lunges', name: 'طعن / لانجز بالدمبل - Walking Dumbbell Lunges', muscleGroup: 'Legs', equipment: 'دمبل', instructions: 'خطوة واسعة ومتوازنة لاستهداف الفخذين والأرداف معاً.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12 لكل رجل', defaultRestSeconds: 90, isGlobal: true },
  { id: 'legs_calf_stand', name: 'سمانة واقف - Standing Calf Raise', muscleGroup: 'Legs', equipment: 'جهاز السمانة واقف', instructions: 'انزل بالكعب لأقصى إطالة في الأسفل واصعد على أطراف الأصابع بثبات.', defaultEntrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', defaultSets: 4, defaultReps: '12-15', defaultRestSeconds: 60, isGlobal: true },
  { id: 'legs_calf_seat', name: 'سمانة جالس - Seated Calf Raise', muscleGroup: 'Legs', equipment: 'جهاز السمانة جالس', instructions: 'يستهدف عضلة السوليوس العميقة في السمانة بمدى حركي كامل.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 60, isGlobal: true },

  // Abs & Cardio (7)
  { id: 'abs_cable', name: 'كرانش على الكيبل - Kneeling Cable Crunch', muscleGroup: 'Abs', equipment: 'كيبل علوي + حبل', instructions: 'اثنِ العمود الفقري لأسفل بعصر عضلات البطن دون سحب بالذراعين.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '15-20', defaultRestSeconds: 45, isGlobal: true },
  { id: 'abs_leg_raise', name: 'رفع أرجل معلق - Hanging Leg Raise', muscleGroup: 'Abs', equipment: 'بار العقلة / المتوازي', instructions: 'ارفع الحوض والأرجل لأعلى لاستهداف أسفل البطن دون تأرجح.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '12-15', defaultRestSeconds: 45, isGlobal: true },
  { id: 'abs_plank', name: 'بلانك ثابت - Forearm Plank', muscleGroup: 'Abs', equipment: 'وزن الجسم', instructions: 'حافظ على استقامة الجسم بالكامل مع شد البطن والأرداف.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '45-60 ثانية', defaultRestSeconds: 45, isGlobal: true },
  { id: 'abs_twist', name: 'تويست روسي للخواصر - Russian Twist', muscleGroup: 'Abs', equipment: 'طارة وزن / دمبل', instructions: 'لف الجذع يميناً ويساراً بتحكم لتقوية عضلات البطن الجانبية.', defaultEntrances: 'بدون دخلات', defaultSets: 3, defaultReps: '20 عدة', defaultRestSeconds: 45, isGlobal: true },
  { id: 'cardio_treadmill', name: 'مشاية مائلة (LISS) - Incline Treadmill Walk', muscleGroup: 'Cardio', equipment: 'جهاز المشاية', instructions: 'ميل 10-12% وسرعة متوسطة 5-6 كم/س لحرق الدهون والحفاظ على الكتلة العضلية.', defaultEntrances: 'بدون دخلات', defaultSets: 1, defaultReps: '20-30 دقيقة', defaultRestSeconds: 0, isGlobal: true },
  { id: 'cardio_hiit', name: 'كارديو متقطع (HIIT) - Treadmill / Bike HIIT', muscleGroup: 'Cardio', equipment: 'مشاية / عجلة', instructions: '30 ثانية سرعة قصوى + 60 ثانية راحة نشطة بالتبادل.', defaultEntrances: 'بدون دخلات', defaultSets: 1, defaultReps: '15 دقيقة', defaultRestSeconds: 0, isGlobal: true },
  { id: 'cardio_stairs', name: 'جهاز السلم - StairMaster Climber', muscleGroup: 'Cardio', equipment: 'جهاز السلم', instructions: 'صعود منتظم دون الاتكاء الكامل بالوزن على المقابض.', defaultEntrances: 'بدون دخلات', defaultSets: 1, defaultReps: '15-20 دقيقة', defaultRestSeconds: 0, isGlobal: true },
];

export const BUILTIN_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'tpl_ppl_6',
    trainerId: 'system',
    title: 'Push / Pull / Legs (PPL) - 6 أيام تضخيم وقوة',
    category: 'تضخيم عضلي (Hypertrophy)',
    level: 'متوسط - متقدم',
    description: 'دفع / سحب / أرجل مرتين أسبوعياً مع الدخلات والعدات الهرمية.',
    daysPerWeek: 6,
    isGlobal: true,
    days: [
      {
        dayNumber: 1,
        title: 'اليوم 1: Push A (صدر + أكتاف + ترايسبس)',
        exercises: [
          { exerciseId: 'chest_flat_bb', name: 'بنش برس بار مستوي - Flat Barbell Bench Press', muscleGroup: 'Chest', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '8-10', restSeconds: 120, notes: 'أداء متحكم مع ثبات الكتف' },
          { exerciseId: 'chest_incline_db', name: 'تجميع دمبل عالي - Incline Dumbbell Press', muscleGroup: 'Chest', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'chest_cable_high', name: 'تفتيح كيبل من أعلى لأسفل - High-to-Low Cable Crossover', muscleGroup: 'Chest', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'sh_db_press', name: 'ضغط كتف بالدمبل جالس - Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'sh_db_lat', name: 'رفرفة جانبي بالدمبل - Dumbbell Lateral Raise', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'tri_rope', name: 'سحب ترايسبس بالحبل - Cable Rope Pushdown', muscleGroup: 'Triceps', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 2,
        title: 'اليوم 2: Pull A (ظهر + كتف خلفي + بايسبس)',
        exercises: [
          { exerciseId: 'back_lat_wide', name: 'سحب أمامي قبضة واسعة - Wide-Grip Lat Pulldown', muscleGroup: 'Back', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'back_bb_row', name: 'تجديف بالبار حر - Barbell Bent-Over Row', muscleGroup: 'Back', entrances: '2 دخلات تصاعدية (12 ثم 8 عدات)', sets: 4, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'back_seated_row', name: 'سحب أرضي بالكيبل - Seated Cable Row', muscleGroup: 'Back', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'sh_rear_pec', name: 'رفرفة خلفي على الفراشة المقلوب - Reverse Pec Deck', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'bi_ez_curl', name: 'بايسبس بار زجزاج واقف - EZ-Bar Standing Curl', muscleGroup: 'Biceps', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'bi_hammer', name: 'هامر كيرل / شاكوش بالدمبل - Dumbbell Hammer Curl', muscleGroup: 'Biceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 3,
        title: 'اليوم 3: Legs A (أرجل كامل + سمانة وبطن)',
        exercises: [
          { exerciseId: 'legs_squat', name: 'سكوات حر بالبار - Barbell Back Squat', muscleGroup: 'Legs', entrances: '3 دخلات تسخين وتدرج بالأوزان (15-12-8)', sets: 4, reps: '6-10', restSeconds: 150 },
          { exerciseId: 'legs_press', name: 'دفع أرجل على الجهاز 45 - Leg Press', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 120 },
          { exerciseId: 'legs_ext', name: 'رفرفة أمامي / إكستنشن - Leg Extension', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'legs_lying_curl', name: 'رفرفة خلفي نائم - Lying Leg Curl', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'legs_calf_stand', name: 'سمانة واقف - Standing Calf Raise', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'abs_cable', name: 'كرانش على الكيبل - Kneeling Cable Crunch', muscleGroup: 'Abs', entrances: 'بدون دخلات', sets: 3, reps: '15-20', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 4,
        title: 'اليوم 4: Push B (تركيز صدر علوي + كتف جانبي + تراي)',
        exercises: [
          { exerciseId: 'chest_incline_bb', name: 'بنش برس بار عالي - Incline Barbell Bench Press', muscleGroup: 'Chest', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '8-12', restSeconds: 90 },
          { exerciseId: 'chest_pec_deck', name: 'تجميع جهاز الفراشة - Pec Deck Machine Fly', muscleGroup: 'Chest', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'sh_cable_lat', name: 'رفرفة جانبي بالكيبل فردي - Cable Lateral Raise', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'tri_skull', name: 'تجميع فرنساوي بار زجزاج نائم - EZ-Bar Skull Crushers', muscleGroup: 'Triceps', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'tri_overhead', name: 'فرنساوي دمبل خلف الرأس - Overhead Dumbbell Extension', muscleGroup: 'Triceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 5,
        title: 'اليوم 5: Pull B (سماكة الظهر + ترابيس + بايسبس)',
        exercises: [
          { exerciseId: 'back_tbar', name: 'سحب تي بار - T-Bar Row', muscleGroup: 'Back', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '8-10', restSeconds: 90 },
          { exerciseId: 'back_lat_close', name: 'سحب أمامي قبضة ضيقة - V-Bar Close-Grip Pulldown', muscleGroup: 'Back', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'back_straight_arm', name: 'سحب كيبل ذراع مستقيم - Straight-Arm Cable Pulldown', muscleGroup: 'Back', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'sh_face_pull', name: 'سحب للوجه بالحبل - Cable Rope Face Pull', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: 'bi_incline_db', name: 'بايسبس دمبل على بنش مائل - Incline Dumbbell Curl', muscleGroup: 'Biceps', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 6,
        title: 'اليوم 6: Legs B (تركيز خلفيات وجلوتس + سمانة)',
        exercises: [
          { exerciseId: 'legs_rdl', name: 'رومانيان ديدليفت للخلفيات - Romanian Deadlift (RDL)', muscleGroup: 'Legs', entrances: '2 دخلات تصاعدية (12 ثم 8 عدات)', sets: 4, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'legs_hack', name: 'هاك سكوات - Hack Squat Machine', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 120 },
          { exerciseId: 'legs_seated_curl', name: 'رفرفة خلفي جالس - Seated Leg Curl', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 75 },
          { exerciseId: 'legs_lunges', name: 'طعن / لانجز بالدمبل - Walking Dumbbell Lunges', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 3, reps: '12 لكل رجل', restSeconds: 90 },
          { exerciseId: 'legs_calf_seat', name: 'سمانة جالس - Seated Calf Raise', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 4, reps: '15-20', restSeconds: 60 },
        ],
      },
    ],
  },
  {
    id: 'tpl_upper_lower_4',
    trainerId: 'system',
    title: 'Upper / Lower - علوي / سفلي 4 أيام متوازن',
    category: 'تضخيم وقوة (Strength & Size)',
    level: 'جميع المستويات',
    description: 'تدريب كل عضلة مرتين أسبوعياً مع 3 أيام راحة للاستشفاء الكامل.',
    daysPerWeek: 4,
    isGlobal: true,
    days: [
      {
        dayNumber: 1,
        title: 'اليوم 1: Upper A (علوي - قوة)',
        exercises: [
          { exerciseId: 'chest_flat_bb', name: 'بنش برس بار مستوي - Flat Barbell Bench Press', muscleGroup: 'Chest', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '6-8', restSeconds: 120 },
          { exerciseId: 'back_bb_row', name: 'تجديف بالبار حر - Barbell Bent-Over Row', muscleGroup: 'Back', entrances: '2 دخلات تصاعدية (12 ثم 8 عدات)', sets: 4, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'sh_db_press', name: 'ضغط كتف بالدمبل جالس - Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseId: 'back_lat_wide', name: 'سحب أمامي قبضة واسعة - Wide-Grip Lat Pulldown', muscleGroup: 'Back', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'bi_ez_curl', name: 'بايسبس بار زجزاج واقف - EZ-Bar Standing Curl', muscleGroup: 'Biceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'tri_bar', name: 'سحب ترايسبس بالمسطرة - Straight-Bar Pushdown', muscleGroup: 'Triceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 2,
        title: 'اليوم 2: Lower A (سفلي - أماميات)',
        exercises: [
          { exerciseId: 'legs_squat', name: 'سكوات حر بالبار - Barbell Back Squat', muscleGroup: 'Legs', entrances: '3 دخلات تسخين وتدرج بالأوزان (15-12-8)', sets: 4, reps: '6-10', restSeconds: 150 },
          { exerciseId: 'legs_rdl', name: 'رومانيان ديدليفت للخلفيات - Romanian Deadlift (RDL)', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'legs_ext', name: 'رفرفة أمامي / إكستنشن - Leg Extension', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'legs_calf_stand', name: 'سمانة واقف - Standing Calf Raise', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'abs_cable', name: 'كرانش على الكيبل - Kneeling Cable Crunch', muscleGroup: 'Abs', entrances: 'بدون دخلات', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 3,
        title: 'اليوم 3: Upper B (علوي - زوايا وتضخيم)',
        exercises: [
          { exerciseId: 'chest_incline_db', name: 'تجميع دمبل عالي - Incline Dumbbell Press', muscleGroup: 'Chest', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'back_seated_row', name: 'سحب أرضي بالكيبل - Seated Cable Row', muscleGroup: 'Back', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'chest_pec_deck', name: 'تجميع جهاز الفراشة - Pec Deck Machine Fly', muscleGroup: 'Chest', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'sh_db_lat', name: 'رفرفة جانبي بالدمبل - Dumbbell Lateral Raise', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'bi_hammer', name: 'هامر كيرل / شاكوش بالدمبل - Dumbbell Hammer Curl', muscleGroup: 'Biceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'tri_rope', name: 'سحب ترايسبس بالحبل - Cable Rope Pushdown', muscleGroup: 'Triceps', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 4,
        title: 'اليوم 4: Lower B (سفلي - خلفيات)',
        exercises: [
          { exerciseId: 'legs_press', name: 'دفع أرجل على الجهاز 45 - Leg Press', muscleGroup: 'Legs', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '10-12', restSeconds: 120 },
          { exerciseId: 'legs_lying_curl', name: 'رفرفة خلفي نائم - Lying Leg Curl', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 4, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'legs_lunges', name: 'طعن / لانجز بالدمبل - Walking Dumbbell Lunges', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 3, reps: '12 لكل رجل', restSeconds: 90 },
          { exerciseId: 'legs_calf_seat', name: 'سمانة جالس - Seated Calf Raise', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 4, reps: '15-20', restSeconds: 60 },
          { exerciseId: 'abs_leg_raise', name: 'رفع أرجل معلق - Hanging Leg Raise', muscleGroup: 'Abs', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    id: 'tpl_fullbody_4x',
    trainerId: 'system',
    title: 'Full Body - جسم كامل 4 أيام (تردد 3 مرات للعضلة)',
    category: 'تضخيم عالي التردد (High Frequency)',
    level: 'متوسط - متقدم',
    description: 'تدريب كل عضلة 3 مرات أسبوعياً خلال 4 أيام جيم لتحفيز البناء العضلي المستمر.',
    daysPerWeek: 4,
    isGlobal: true,
    days: [
      {
        dayNumber: 1,
        title: 'اليوم 1: Full Body A',
        exercises: [
          { exerciseId: 'chest_flat_bb', name: 'بنش برس بار مستوي - Flat Barbell Bench Press', muscleGroup: 'Chest', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 3, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'legs_squat', name: 'سكوات حر بالبار - Barbell Back Squat', muscleGroup: 'Legs', entrances: '2 دخلات تصاعدية (12 ثم 8 عدات)', sets: 3, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'back_lat_wide', name: 'سحب أمامي قبضة واسعة - Wide-Grip Lat Pulldown', muscleGroup: 'Back', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'sh_db_lat', name: 'رفرفة جانبي بالدمبل - Dumbbell Lateral Raise', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'bi_ez_curl', name: 'بايسبس بار زجزاج واقف - EZ-Bar Standing Curl', muscleGroup: 'Biceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 2,
        title: 'اليوم 2: Full Body B',
        exercises: [
          { exerciseId: 'back_bb_row', name: 'تجديف بالبار حر - Barbell Bent-Over Row', muscleGroup: 'Back', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 3, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'legs_rdl', name: 'رومانيان ديدليفت للخلفيات - Romanian Deadlift (RDL)', muscleGroup: 'Legs', entrances: '2 دخلات تصاعدية (12 ثم 8 عدات)', sets: 3, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'chest_incline_db', name: 'تجميع دمبل عالي - Incline Dumbbell Press', muscleGroup: 'Chest', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'tri_rope', name: 'سحب ترايسبس بالحبل - Cable Rope Pushdown', muscleGroup: 'Triceps', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'abs_cable', name: 'كرانش على الكيبل - Kneeling Cable Crunch', muscleGroup: 'Abs', entrances: 'بدون دخلات', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 3,
        title: 'اليوم 3: Full Body C',
        exercises: [
          { exerciseId: 'sh_db_press', name: 'ضغط كتف بالدمبل جالس - Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 3, reps: '8-12', restSeconds: 90 },
          { exerciseId: 'legs_press', name: 'دفع أرجل على الجهاز 45 - Leg Press', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 120 },
          { exerciseId: 'back_seated_row', name: 'سحب أرضي بالكيبل - Seated Cable Row', muscleGroup: 'Back', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'bi_hammer', name: 'هامر كيرل / شاكوش بالدمبل - Dumbbell Hammer Curl', muscleGroup: 'Biceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'tri_skull', name: 'تجميع فرنساوي بار زجزاج نائم - EZ-Bar Skull Crushers', muscleGroup: 'Triceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 4,
        title: 'اليوم 4: Upper Angles & Pump',
        exercises: [
          { exerciseId: 'chest_pec_deck', name: 'تجميع جهاز الفراشة - Pec Deck Machine Fly', muscleGroup: 'Chest', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'back_lat_close', name: 'سحب أمامي قبضة ضيقة - V-Bar Close-Grip Pulldown', muscleGroup: 'Back', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'sh_cable_lat', name: 'رفرفة جانبي بالكيبل فردي - Cable Lateral Raise', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'sh_rear_pec', name: 'رفرفة خلفي على الفراشة المقلوب - Reverse Pec Deck', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'legs_calf_stand', name: 'سمانة واقف - Standing Calf Raise', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 4, reps: '12-15', restSeconds: 60 },
        ],
      },
    ],
  },
  {
    id: 'tpl_bro_5',
    trainerId: 'system',
    title: 'Pro Bodybuilding Split - عضلة يومياً (5 أيام)',
    category: 'كمال أجسام وتفصيل عضلي',
    level: 'متوسط - متقدم',
    description: 'تركيز كامل على كل عضلة بجميع أشكالها وزواياها مع الدخلات والعدات الهرمية.',
    daysPerWeek: 5,
    isGlobal: true,
    days: [
      {
        dayNumber: 1,
        title: 'اليوم 1: صدر كامل (Chest)',
        exercises: [
          { exerciseId: 'chest_flat_bb', name: 'بنش برس بار مستوي - Flat Barbell Bench Press', muscleGroup: 'Chest', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'chest_incline_db', name: 'تجميع دمبل عالي - Incline Dumbbell Press', muscleGroup: 'Chest', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'chest_decline', name: 'تجميع سفلي بار أو جهاز - Decline Chest Press', muscleGroup: 'Chest', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'chest_pec_deck', name: 'تجميع جهاز الفراشة - Pec Deck Machine Fly', muscleGroup: 'Chest', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'chest_cable_high', name: 'تفتيح كيبل من أعلى لأسفل - High-to-Low Cable Crossover', muscleGroup: 'Chest', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 2,
        title: 'اليوم 2: ظهر وقطنية (Back)',
        exercises: [
          { exerciseId: 'back_lat_wide', name: 'سحب أمامي قبضة واسعة - Wide-Grip Lat Pulldown', muscleGroup: 'Back', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'back_bb_row', name: 'تجديف بالبار حر - Barbell Bent-Over Row', muscleGroup: 'Back', entrances: '2 دخلات تصاعدية (12 ثم 8 عدات)', sets: 4, reps: '8-10', restSeconds: 120 },
          { exerciseId: 'back_db_row', name: 'منشار / تجديف بالدمبل فردي - Single-Arm Dumbbell Row', muscleGroup: 'Back', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'back_seated_row', name: 'سحب أرضي بالكيبل - Seated Cable Row', muscleGroup: 'Back', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseId: 'back_hyper', name: 'قطنية على الجهاز - Back Hyperextensions', muscleGroup: 'Back', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 3,
        title: 'اليوم 3: أكتاف وترابيس (Shoulders)',
        exercises: [
          { exerciseId: 'sh_db_press', name: 'ضغط كتف بالدمبل جالس - Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', entrances: '2 دخلات تسخين (15 ثم 10 عدات)', sets: 4, reps: '8-12', restSeconds: 90 },
          { exerciseId: 'sh_db_lat', name: 'رفرفة جانبي بالدمبل - Dumbbell Lateral Raise', muscleGroup: 'Shoulders', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'sh_front', name: 'رفرفة أمامي دمبل أو كيبل - Front Raise', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: 'sh_rear_pec', name: 'رفرفة خلفي على الفراشة المقلوب - Reverse Pec Deck', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'sh_shrugs', name: 'ترابيس بالدمبل أو البار - Dumbbell / Barbell Shrugs', muscleGroup: 'Shoulders', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 4,
        title: 'اليوم 4: أرجل وسمانة (Legs)',
        exercises: [
          { exerciseId: 'legs_squat', name: 'سكوات حر بالبار - Barbell Back Squat', muscleGroup: 'Legs', entrances: '3 دخلات تسخين وتدرج بالأوزان (15-12-8)', sets: 4, reps: '8-10', restSeconds: 150 },
          { exerciseId: 'legs_press', name: 'دفع أرجل على الجهاز 45 - Leg Press', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 4, reps: '10-12', restSeconds: 120 },
          { exerciseId: 'legs_ext', name: 'رفرفة أمامي / إكستنشن - Leg Extension', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'legs_lying_curl', name: 'رفرفة خلفي نائم - Lying Leg Curl', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 4, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'legs_calf_stand', name: 'سمانة واقف - Standing Calf Raise', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 4, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayNumber: 5,
        title: 'اليوم 5: ذراعين (بايسبس + ترايسبس وبطن)',
        exercises: [
          { exerciseId: 'bi_ez_curl', name: 'بايسبس بار زجزاج واقف - EZ-Bar Standing Curl', muscleGroup: 'Biceps', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'tri_rope', name: 'سحب ترايسبس بالحبل - Cable Rope Pushdown', muscleGroup: 'Triceps', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'bi_incline_db', name: 'بايسبس دمبل على بنش مائل - Incline Dumbbell Curl', muscleGroup: 'Biceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'tri_skull', name: 'تجميع فرنساوي بار زجزاج نائم - EZ-Bar Skull Crushers', muscleGroup: 'Triceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 75 },
          { exerciseId: 'bi_hammer', name: 'هامر كيرل / شاكوش بالدمبل - Dumbbell Hammer Curl', muscleGroup: 'Biceps', entrances: 'بدون دخلات', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseId: 'abs_cable', name: 'كرانش على الكيبل - Kneeling Cable Crunch', muscleGroup: 'Abs', entrances: 'بدون دخلات', sets: 3, reps: '15-20', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    id: 'tpl_cut_beginner_3',
    trainerId: 'system',
    title: 'برنامج التأسيس وحرق الدهون للمبتدئين - 3 أيام',
    category: 'تأسيس وتنشيف (Beginner & Fat Loss)',
    level: 'مبتدئ',
    description: 'تهيئة شاملة لكل عضلات الجسم مع كارديو مائل لحرق الدهون.',
    daysPerWeek: 3,
    isGlobal: true,
    days: [
      {
        dayNumber: 1,
        title: 'اليوم 1: تأسيس شامل A + كارديو',
        exercises: [
          { exerciseId: 'legs_press', name: 'دفع أرجل على الجهاز 45 - Leg Press', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: 'chest_flat_db', name: 'تجميع دمبل مستوي - Flat Dumbbell Press', muscleGroup: 'Chest', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: 'back_lat_wide', name: 'سحب أمامي قبضة واسعة - Wide-Grip Lat Pulldown', muscleGroup: 'Back', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: 'sh_db_lat', name: 'رفرفة جانبي بالدمبل - Dumbbell Lateral Raise', muscleGroup: 'Shoulders', entrances: 'بدون دخلات', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'cardio_treadmill', name: 'مشاية مائلة (LISS) - Incline Treadmill Walk', muscleGroup: 'Cardio', entrances: 'بدون دخلات', sets: 1, reps: '20 دقيقة', restSeconds: 0 },
        ],
      },
      {
        dayNumber: 2,
        title: 'اليوم 2: تأسيس شامل B + بطن',
        exercises: [
          { exerciseId: 'legs_ext', name: 'رفرفة أمامي / إكستنشن - Leg Extension', muscleGroup: 'Legs', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseId: 'legs_lying_curl', name: 'رفرفة خلفي نائم - Lying Leg Curl', muscleGroup: 'Legs', entrances: 'بدون دخلات', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: 'back_seated_row', name: 'سحب أرضي بالكيبل - Seated Cable Row', muscleGroup: 'Back', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: 'sh_db_press', name: 'ضغط كتف بالدمبل جالس - Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: 'abs_plank', name: 'بلانك ثابت - Forearm Plank', muscleGroup: 'Abs', entrances: 'بدون دخلات', sets: 3, reps: '45 ثانية', restSeconds: 45 },
        ],
      },
      {
        dayNumber: 3,
        title: 'اليوم 3: تأسيس شامل C + ذراعين وكارديو',
        exercises: [
          { exerciseId: 'chest_incline_db', name: 'تجميع دمبل عالي - Incline Dumbbell Press', muscleGroup: 'Chest', entrances: '1 دخلة تسخين (15 عدة بوزن خفيف)', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: 'back_lat_close', name: 'سحب أمامي قبضة ضيقة - V-Bar Close-Grip Pulldown', muscleGroup: 'Back', entrances: 'بدون دخلات', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: 'bi_alt_db', name: 'تبادل دمبل واقف مع التدوير - Alternating Dumbbell Curl', muscleGroup: 'Biceps', entrances: 'بدون دخلات', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: 'tri_rope', name: 'سحب ترايسبس بالحبل - Cable Rope Pushdown', muscleGroup: 'Triceps', entrances: 'بدون دخلات', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: 'cardio_stairs', name: 'جهاز السلم - StairMaster Climber', muscleGroup: 'Cardio', entrances: 'بدون دخلات', sets: 1, reps: '15 دقيقة', restSeconds: 0 },
        ],
      },
    ],
  },
];
