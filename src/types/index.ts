// ==================== USER ====================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'student' | 'teacher' | 'admin';
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  createdAt: string;
}

// ==================== HEALTH & ANTHROPOMETRY ====================
export interface Anthropometry {
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  bloodType?: string;
  rhesusFactor?: '+' | '-';
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bmi: number;
  bodyFatPercent?: number;
  notes?: string;
}

export interface VitalRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  systolicBp?: number; // mmHg
  diastolicBp?: number; // mmHg
  pulseBpm?: number; // bpm
  temperatureC?: number; // °C
  oxygenPercent?: number; // SpO2 %
  bloodGlucoseMmol?: number; // mmol/L
  notes?: string;
}

// ==================== MEDICAL CARD ====================
export interface ChronicCondition {
  id: string;
  title: string;
  diagnosisDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'remission' | 'controlled';
  doctor?: string;
  notes?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  diagnosedYear?: string;
  notes?: string;
}

export interface PastIllness {
  id: string;
  title: string;
  year: string;
  treatment?: string;
  hospital?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "2 раза в день"
  timeOfDay: string[]; // ['morning', 'evening']
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  isActive: boolean;
  notes?: string;
}

export interface LabResult {
  id: string;
  date: string;
  testName: string;
  category: 'blood' | 'biochem' | 'urine' | 'hormones' | 'imaging' | 'other';
  value: string;
  unit: string;
  referenceRange: string;
  isNormal: boolean;
  clinic?: string;
  doctorNotes?: string;
  fileAttachment?: string;
}

export interface DoctorVisit {
  id: string;
  date: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  complaints?: string;
  diagnosis: string;
  recommendations: string;
  nextVisitDate?: string;
}

// ==================== SLEEP & RECOVERY ====================
export interface SleepRecord {
  id: string;
  date: string; // Night of YYYY-MM-DD
  bedTime: string; // e.g. "23:15"
  wakeTime: string; // e.g. "07:30"
  durationHours: number; // e.g. 8.25
  quality: 1 | 2 | 3 | 4 | 5; // 1-5 stars
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  awakeningsCount?: number;
  notes?: string;
}

export interface SleepGoal {
  targetHours: number;
  targetBedTime: string;
  targetWakeTime: string;
}

// ==================== PHYSICAL ACTIVITY & WORKOUTS ====================
export type WorkoutType = 
  | 'running' 
  | 'gym' 
  | 'swimming' 
  | 'cycling' 
  | 'walking' 
  | 'yoga' 
  | 'hiit' 
  | 'pilates' 
  | 'martial_arts' 
  | 'team_sports' 
  | 'other';

export interface WorkoutRecord {
  id: string;
  date: string;
  time?: string;
  type: WorkoutType;
  title: string;
  durationMinutes: number;
  caloriesBurned: number;
  intensity: 'low' | 'moderate' | 'high' | 'extreme';
  distanceKm?: number;
  avgHeartRate?: number;
  notes?: string;
}

export interface ActivityGoal {
  weeklyWorkoutsTarget: number;
  weeklyMinutesTarget: number;
  dailyStepsTarget: number;
}

// ==================== HABITS & SELF-DEVELOPMENT ====================
export type HabitCategory = 'health' | 'mind' | 'productivity' | 'fitness' | 'nutrition' | 'sleep' | 'other';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  targetDaysPerWeek: number;
  completedDates: string[]; // Array of YYYY-MM-DD
  currentStreak: number;
  bestStreak: number;
  color?: string;
  icon?: string;
  createdAt: string;
}

// ==================== PERSONAL GOALS ====================
export type GoalCategory = 'health' | 'career' | 'personal' | 'fitness' | 'education' | 'finance';
export type GoalStatus = 'in_progress' | 'completed' | 'on_hold';

export interface GoalMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface PersonalGoal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  milestones: GoalMilestone[];
  progressPercent: number; // 0 - 100
  notes?: string;
  createdAt: string;
  history?: { date: string; progressPercent: number }[];
}

// ==================== CALENDAR & SCHEDULE ====================
export type EventCategory = 
  | 'doctor_visit' 
  | 'workout' 
  | 'sleep_rest' 
  | 'habit_task' 
  | 'goal_milestone' 
  | 'personal' 
  | 'work' 
  | 'education'
  | 'other';

export type CalendarCategory = EventCategory;
export type EventStatus = 'planned' | 'in_progress' | 'completed' | 'missed' | 'cancelled';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  startTime: string; // ISO string
  endTime: string; // ISO string
  allDay?: boolean;
  status: EventStatus;
  location?: string;
  reminderMinutesBefore?: number;
  color?: string;
  relatedEntityId?: string; // id of workout, doctor visit, or goal
}

// ==================== NOTES ====================
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== TASKS & TO-DO ====================
export type TaskCategoryTag = 'Health' | 'Work' | 'Personal' | 'Fitness' | 'Finance' | 'Urgent' | string;
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  tags: string[]; // e.g. ['Health'], ['Work', 'Urgent'], ['Personal']
  priority?: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  createdAt: string;
  completedAt?: string;
}

// ==================== FINANCE & WEALTH ====================
export type CurrencyCode = 'KZT' | 'RUB' | 'USD' | 'EUR';
export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'health_meds'     // Здоровье и медицина
  | 'sports_fitness'  // Спорт и фитнес
  | 'food_groceries'  // Питание и супермаркеты
  | 'housing_bills'   // Жилье и ЖКУ
  | 'education_books' // Образование и саморазвитие
  | 'transport'       // Транспорт и авто
  | 'entertainment'   // Развлечения и кафе
  | 'shopping'        // Покупки и одежда
  | 'other';          // Другое

export type IncomeCategory = 
  | 'salary'          // Зарплата
  | 'freelance'       // Проекты и фриланс
  | 'investments'     // Инвестиции и дивиденды
  | 'cashback_gifts'  // Кэшбэк и подарки
  | 'other';

export interface FinanceAccount {
  id: string;
  name: string;
  type: 'card' | 'savings' | 'investment' | 'cash';
  balance: number;
  currency: CurrencyCode;
  color?: string;
}

export interface FinanceTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | IncomeCategory | string;
  accountId: string;
  title: string;
  note?: string;
  tags?: string[];
  createdAt: string;
}

export interface BudgetLimit {
  id: string;
  category: ExpenseCategory | string;
  categoryName: string;
  monthlyLimit: number;
  spentCurrentMonth: number;
  color?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'safety_cushion' | 'vacation' | 'investment' | 'tech' | 'health' | 'other';
  color?: string;
}

export interface FinanceData {
  currency: CurrencyCode;
  accounts: FinanceAccount[];
  transactions: FinanceTransaction[];
  budgets: BudgetLimit[];
  savingsGoals: SavingsGoal[];
}

// ==================== COMPLETE LIFE STORE STATE ====================
export interface LifeData {
  anthropometry: Anthropometry;
  weightHistory: WeightRecord[];
  vitalsHistory: VitalRecord[];
  chronicConditions: ChronicCondition[];
  allergies: Allergy[];
  pastIllnesses: PastIllness[];
  medications: Medication[];
  labResults: LabResult[];
  doctorVisits: DoctorVisit[];
  sleepHistory: SleepRecord[];
  sleepGoal: SleepGoal;
  workoutsHistory: WorkoutRecord[];
  activityGoal: ActivityGoal;
  habits: Habit[];
  goals: PersonalGoal[];
  calendarEvents: CalendarEvent[];
  notes: Note[];
  tasks: Task[];
  finance: FinanceData;
}

// ==================== LEGACY TYPES COMPATIBILITY ====================
export interface Level {
  id: string;
  name: string;
  code: string;
  description: string;
  orderIndex: number;
  minLessonsRequired: number;
}

export interface UserProgress {
  levelId: string;
  levelName: string;
  levelCode: string;
  completedLessons: number;
  totalStudyTime: number;
  currentXp: number;
  progressPercent: number;
  nextLevel?: Level;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  levelId: string;
  levelName?: string;
  totalLessons: number;
  coverImage?: string;
  isPublished: boolean;
  completedLessons?: number;
}

export type LessonStatus = 'planned' | 'in_progress' | 'completed' | 'missed';

export interface Lesson {
  id: string;
  courseId: string;
  courseTitle?: string;
  title: string;
  description: string;
  content: string;
  durationMinutes: number;
  orderIndex: number;
  homework?: string;
  status?: LessonStatus;
  materials?: { type: string; title: string; url: string }[];
}

export type ScheduleStatus = EventStatus;
export type LessonType = 'lesson' | 'exam' | 'consultation' | 'self_study';

export interface ScheduleEntry {
  id: string;
  userId: string;
  lessonId?: string;
  title: string;
  description?: string;
  teacherName?: string;
  levelId?: string;
  levelName?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingUrl?: string;
  lessonType: LessonType;
  status: ScheduleStatus;
  color?: string;
}

export interface Statistics {
  totalLessons: number;
  completedLessons: number;
  missedLessons: number;
  plannedLessons: number;
  completionRate: number;
  totalStudyTime: number;
  currentXp: number;
  levelName: string;
  levelCode: string;
  nextLevelName?: string;
  nextLevelRequired?: number;
  weeklyData: any[];
  monthlyData: any[];
}

export interface NoteForm {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPinned: boolean;
}

export interface ScheduleForm {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  lessonType?: LessonType;
  status?: ScheduleStatus;
  location?: string;
  color?: string;
}
