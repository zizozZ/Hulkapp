import { ComplianceLevel, TraineeProfile } from '../types';

export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number => {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
};

export const calculateTDEE = (
  bmr: number,
  activityLevel: TraineeProfile['activityLevel']
): number => {
  const factors: Record<TraineeProfile['activityLevel'], number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };
  return Math.round(bmr * (factors[activityLevel] || 1.55));
};

export const calculateSmartMacros = (
  tdee: number,
  weightKg: number,
  goalType: 'cut' | 'maintain' | 'bulk'
) => {
  let targetCalories = tdee;
  if (goalType === 'cut') targetCalories = Math.max(1200, tdee - 450);
  if (goalType === 'bulk') targetCalories = tdee + 350;

  const proteinGrams = Math.round(weightKg * (goalType === 'cut' ? 2.2 : 2.0));
  const fatsGrams = Math.round((targetCalories * 0.25) / 9);
  const carbsGrams = Math.max(
    40,
    Math.round((targetCalories - proteinGrams * 4 - fatsGrams * 9) / 4)
  );
  const waterLiters = Number((weightKg * 0.035).toFixed(1));

  return { targetCalories, proteinGrams, carbsGrams, fatsGrams, waterLiters };
};

export const getDaysSinceTimestamp = (ts: any): number => {
  if (!ts) return 0;
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(date.getTime())) return 0;
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
};

export const computeComplianceLevel = (trainee: Partial<TraineeProfile>): ComplianceLevel => {
  const days = getDaysSinceTimestamp(trainee.lastUpdateAt || trainee.createdAt);
  if (days >= 5) return 'RED';
  if (days >= 3) return 'ORANGE';
  if (days >= 1) return 'YELLOW';
  return 'GREEN';
};

export const getComplianceBadgeMeta = (level: ComplianceLevel) => {
  switch (level) {
    case 'RED':
      return {
        label: 'متأخر (+5 أيام)',
        short: 'RED',
        bg: 'bg-[#FF4141]/15 border-[#FF4141]/40 text-[#FF4141]',
        dot: 'bg-[#FF4141]',
      };
    case 'ORANGE':
      return {
        label: 'تنبيه (3-4 أيام)',
        short: 'ORANGE',
        bg: 'bg-[#FF9F1C]/15 border-[#FF9F1C]/40 text-[#FF9F1C]',
        dot: 'bg-[#FF9F1C]',
      };
    case 'YELLOW':
      return {
        label: 'متابعة (1-2 يوم)',
        short: 'YELLOW',
        bg: 'bg-yellow-400/15 border-yellow-400/40 text-yellow-300',
        dot: 'bg-yellow-400',
      };
    default:
      return {
        label: 'ملتزم ونشط',
        short: 'GREEN',
        bg: 'bg-[#39FF14]/15 border-[#39FF14]/40 text-[#39FF14]',
        dot: 'bg-[#39FF14]',
      };
  }
};

export const computeSubscriptionStatus = (
  endDateStr: string
): { status: 'Active' | 'Expiring Soon' | 'Expired'; daysLeft: number } => {
  if (!endDateStr) return { status: 'Active', daysLeft: 30 };
  const end = new Date(endDateStr);
  const diffDays = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { status: 'Expired', daysLeft: diffDays };
  if (diffDays <= 5) return { status: 'Expiring Soon', daysLeft: diffDays };
  return { status: 'Active', daysLeft: diffDays };
};
