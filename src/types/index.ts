export type UserRole = 'admin' | 'trainer' | 'trainee';
export type AccountStatus = 'active' | 'suspended';
export type ComplianceLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  trainerId?: string;
  avatarUrl?: string;
  fcmToken?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  specialty: string;
  bio?: string;
  avatarUrl?: string;
  status: AccountStatus;
  clientsCount?: number;
  createdAt?: any;
}

export interface FollowUpConfig {
  workoutIntervalDays: number;
  weightIntervalDays: number;
  measurementsIntervalDays: number;
  photosIntervalDays: number;
}

export interface TraineeProfile {
  id: string;
  userId: string;
  trainerId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  age: number;
  height: number;
  currentWeight: number;
  startWeight: number;
  targetWeight: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  goal: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  subscriptionStatus: 'Active' | 'Expiring Soon' | 'Expired';
  complianceLevel: ComplianceLevel;
  status: AccountStatus;
  coachNotes?: string;
  followUpConfig: FollowUpConfig;
  lastUpdateAt?: any;
  lastWorkoutAt?: any;
  lastWeightAt?: any;
  lastMeasurementAt?: any;
  lastPhotoAt?: any;
  createdAt?: any;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Legs' | 'Abs' | 'Cardio';
  equipment: string;
  instructions: string;
  defaultEntrances?: string;
  defaultSets?: number;
  defaultReps?: string;
  defaultRestSeconds?: number;
  videoUrl?: string;
  imageUrl?: string;
  isGlobal?: boolean;
  trainerId?: string;
}

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  entrances?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  tempo?: string;
  notes?: string;
}

export interface WorkoutDayBlock {
  dayNumber: number;
  title: string;
  isRestDay?: boolean;
  exercises: PlannedExercise[];
}

export interface WorkoutPlan {
  id: string;
  traineeId: string;
  trainerId: string;
  title: string;
  goal: string;
  durationWeeks: number;
  daysPerWeek: number;
  isActive: boolean;
  days: WorkoutDayBlock[];
  createdAt?: any;
  updatedAt?: any;
}

export interface WorkoutTemplate {
  id: string;
  trainerId: string;
  title: string;
  category: string;
  level?: string;
  description?: string;
  daysPerWeek: number;
  days: WorkoutDayBlock[];
  isGlobal?: boolean;
  createdAt?: any;
}

export interface LoggedSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  name: string;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  traineeId: string;
  trainerId: string;
  planId: string;
  dayTitle: string;
  exercises: LoggedExercise[];
  durationMinutes: number;
  notes?: string;
  completedAt: any;
}

export interface MealFoodItem {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealBlock {
  mealNumber: number;
  title: string;
  timeHint?: string;
  items: MealFoodItem[];
}

export interface NutritionPlan {
  id: string;
  traineeId: string;
  trainerId: string;
  title: string;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  waterLiters: number;
  meals: MealBlock[];
  notes?: string;
  isActive: boolean;
  createdAt?: any;
}

export interface FoodLog {
  id: string;
  traineeId: string;
  trainerId: string;
  date: string;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFats: number;
  waterLiters: number;
  completedMeals: number[];
  updatedAt?: any;
}

export interface BodyMeasurement {
  id: string;
  traineeId: string;
  trainerId: string;
  date: string;
  weightKg: number;
  bodyFatPercent?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  notes?: string;
  createdAt?: any;
}

export interface ProgressPhoto {
  id: string;
  traineeId: string;
  trainerId: string;
  date: string;
  angle: 'front' | 'side' | 'back';
  imageUrl: string;
  weightAtTime?: number;
  createdAt?: any;
}

export interface Conversation {
  id: string;
  trainerId: string;
  traineeId: string;
  traineeName: string;
  traineeAvatar?: string;
  lastMessage: string;
  lastMessageAt: any;
  unreadByTrainer: number;
  unreadByTrainee: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  trainerId: string;
  traineeId: string;
  senderId: string;
  senderRole: UserRole;
  text: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  attachmentName?: string;
  read: boolean;
  createdAt: any;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'message' | 'workout' | 'nutrition' | 'subscription' | 'compliance' | 'system';
  read: boolean;
  link?: string;
  createdAt: any;
}

export interface SubscriptionRecord {
  id: string;
  traineeId: string;
  traineeName: string;
  trainerId: string;
  durationMonths: number;
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  status: 'Active' | 'Expiring Soon' | 'Expired';
  notes?: string;
  createdAt?: any;
}
