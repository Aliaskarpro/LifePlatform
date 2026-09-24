import { create } from 'zustand';
import { 
  LifeData, 
  Anthropometry, 
  WeightRecord, 
  VitalRecord, 
  ChronicCondition, 
  Allergy, 
  PastIllness, 
  Medication, 
  LabResult, 
  DoctorVisit, 
  SleepRecord, 
  SleepGoal, 
  WorkoutRecord, 
  ActivityGoal, 
  Habit, 
  PersonalGoal, 
  CalendarEvent, 
  Note,
  Task,
  FinanceData,
  FinanceAccount,
  FinanceTransaction,
  BudgetLimit,
  SavingsGoal,
  CurrencyCode
} from '../types';
import { INITIAL_LIFE_DATA } from '../utils/initialLifeData';

const STORAGE_KEY = 'eduplatform_life_data_v1';
const THEME_KEY = 'eduplatform_theme';

export interface BmiInfo {
  bmi: number;
  category: string;
  color: string;
  description: string;
}

export const calculateBmi = (weightKg: number, heightCm: number): BmiInfo => {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return { bmi: 0, category: '—', color: 'text-slate-400', description: 'Недостаточно данных' };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return { bmi, category: 'Дефицит массы', color: 'text-amber-500', description: 'Ниже нормы (<18.5)' };
  } else if (bmi < 25) {
    return { bmi, category: 'Нормальный вес', color: 'text-emerald-500', description: 'Оптимальный диапазон (18.5–24.9)' };
  } else if (bmi < 30) {
    return { bmi, category: 'Избыточный вес', color: 'text-amber-500', description: 'Предожирение (25.0–29.9)' };
  } else {
    return { bmi, category: 'Ожирение', color: 'text-rose-500', description: 'Выше нормы (≥30.0)' };
  }
};

interface LifeStoreState extends LifeData {
  theme: 'dark' | 'light';
  isLoaded: boolean;
  
  // Theme
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Anthropometry & Weight
  updateAnthropometry: (data: Partial<Anthropometry>) => void;
  addWeightRecord: (record: { weightKg: number; date?: string; notes?: string; bodyFatPercent?: number }) => void;
  deleteWeightRecord: (id: string) => void;

  // Vitals
  addVitalRecord: (record: Omit<VitalRecord, 'id'>) => void;
  deleteVitalRecord: (id: string) => void;

  // Medical Card
  addChronicCondition: (item: Omit<ChronicCondition, 'id'>) => void;
  deleteChronicCondition: (id: string) => void;
  addAllergy: (item: Omit<Allergy, 'id'>) => void;
  deleteAllergy: (id: string) => void;
  addPastIllness: (item: Omit<PastIllness, 'id'>) => void;
  deletePastIllness: (id: string) => void;
  addMedication: (item: Omit<Medication, 'id'>) => void;
  toggleMedicationActive: (id: string) => void;
  deleteMedication: (id: string) => void;
  addLabResult: (item: Omit<LabResult, 'id'>) => void;
  deleteLabResult: (id: string) => void;
  addDoctorVisit: (item: Omit<DoctorVisit, 'id'>) => void;
  deleteDoctorVisit: (id: string) => void;

  // Sleep
  addSleepRecord: (record: Omit<SleepRecord, 'id'>) => void;
  deleteSleepRecord: (id: string) => void;
  updateSleepGoal: (goal: Partial<SleepGoal>) => void;

  // Workouts
  addWorkoutRecord: (workout: Omit<WorkoutRecord, 'id'>) => void;
  deleteWorkoutRecord: (id: string) => void;
  updateActivityGoal: (goal: Partial<ActivityGoal>) => void;

  // Habits
  addHabit: (habit: Omit<Habit, 'id' | 'completedDates' | 'currentStreak' | 'bestStreak' | 'createdAt'>) => void;
  toggleHabit: (habitId: string, dateStr: string) => void;
  deleteHabit: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<PersonalGoal, 'id' | 'progressPercent' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<PersonalGoal>) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (id: string) => void;

  // Calendar
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Tasks & Tagging System
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  // Finance & Wealth
  setFinanceCurrency: (currency: CurrencyCode) => void;
  addTransaction: (tx: Omit<FinanceTransaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  addFinanceAccount: (account: Omit<FinanceAccount, 'id'>) => void;
  updateAccountBalance: (id: string, newBalance: number) => void;
  deleteFinanceAccount: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  contributeToSavingsGoal: (id: string, amount: number, accountId?: string) => void;
  deleteSavingsGoal: (id: string) => void;
  updateBudgetLimit: (id: string, monthlyLimit: number) => void;

  // System
  resetToDefaultData: () => void;
}

const getStoredData = (): LifeData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const tasks = parsed.tasks && parsed.tasks.length > 0 ? parsed.tasks : (INITIAL_LIFE_DATA.tasks || []);
      const finance = parsed.finance && parsed.finance.accounts && parsed.finance.accounts.length > 0
        ? parsed.finance
        : INITIAL_LIFE_DATA.finance;
      return { ...INITIAL_LIFE_DATA, ...parsed, tasks, finance };
    }
  } catch (e) {
    console.error('Failed to load life data from localStorage:', e);
  }
  return INITIAL_LIFE_DATA;
};

const getInitialTheme = (): 'dark' | 'light' => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // fallback
  }
  return 'dark';
};

const saveToStorage = (state: LifeData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save life data to localStorage:', e);
  }
};

export const useLifeStore = create<LifeStoreState>((set, get) => {
  const initial = getStoredData();
  const initialTheme = getInitialTheme();

  // Apply theme to document element
  if (typeof document !== 'undefined') {
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }

  return {
    ...initial,
    theme: initialTheme,
    isLoaded: true,

    toggleTheme: () => {
      const current = get().theme;
      const next = current === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
      set({ theme: next });
    },

    setTheme: (theme) => {
      if (typeof document !== 'undefined') {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {}
      set({ theme });
    },

    updateAnthropometry: (updates) => {
      set((state) => {
        const nextAnthropometry = { ...state.anthropometry, ...updates };
        const next = { ...state, anthropometry: nextAnthropometry };
        saveToStorage(next);
        return { anthropometry: nextAnthropometry };
      });
    },

    addWeightRecord: ({ weightKg, date, notes, bodyFatPercent }) => {
      set((state) => {
        const recordDate = date || new Date().toISOString().split('T')[0];
        const height = state.anthropometry.heightCm;
        const bmi = calculateBmi(weightKg, height).bmi;
        const newRecord: WeightRecord = {
          id: `w-${Date.now()}`,
          date: recordDate,
          weightKg,
          bmi,
          bodyFatPercent,
          notes,
        };

        const updatedHistory = [...state.weightHistory.filter(w => w.date !== recordDate), newRecord]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const updatedAnth = { ...state.anthropometry, currentWeightKg: weightKg };
        const next = { ...state, weightHistory: updatedHistory, anthropometry: updatedAnth };
        saveToStorage(next);
        return { weightHistory: updatedHistory, anthropometry: updatedAnth };
      });
    },

    deleteWeightRecord: (id) => {
      set((state) => {
        const updated = state.weightHistory.filter((w) => w.id !== id);
        const last = updated[updated.length - 1];
        const updatedAnth = last ? { ...state.anthropometry, currentWeightKg: last.weightKg } : state.anthropometry;
        const next = { ...state, weightHistory: updated, anthropometry: updatedAnth };
        saveToStorage(next);
        return { weightHistory: updated, anthropometry: updatedAnth };
      });
    },

    addVitalRecord: (record) => {
      set((state) => {
        const newRecord: VitalRecord = {
          id: `v-${Date.now()}`,
          ...record,
        };
        const updated = [newRecord, ...state.vitalsHistory].sort(
          (a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
        );
        const next = { ...state, vitalsHistory: updated };
        saveToStorage(next);
        return { vitalsHistory: updated };
      });
    },

    deleteVitalRecord: (id) => {
      set((state) => {
        const updated = state.vitalsHistory.filter((v) => v.id !== id);
        const next = { ...state, vitalsHistory: updated };
        saveToStorage(next);
        return { vitalsHistory: updated };
      });
    },

    addChronicCondition: (item) => {
      set((state) => {
        const newRecord: ChronicCondition = { id: `cc-${Date.now()}`, ...item };
        const updated = [newRecord, ...state.chronicConditions];
        const next = { ...state, chronicConditions: updated };
        saveToStorage(next);
        return { chronicConditions: updated };
      });
    },

    deleteChronicCondition: (id) => {
      set((state) => {
        const updated = state.chronicConditions.filter((c) => c.id !== id);
        const next = { ...state, chronicConditions: updated };
        saveToStorage(next);
        return { chronicConditions: updated };
      });
    },

    addAllergy: (item) => {
      set((state) => {
        const newRecord: Allergy = { id: `al-${Date.now()}`, ...item };
        const updated = [newRecord, ...state.allergies];
        const next = { ...state, allergies: updated };
        saveToStorage(next);
        return { allergies: updated };
      });
    },

    deleteAllergy: (id) => {
      set((state) => {
        const updated = state.allergies.filter((a) => a.id !== id);
        const next = { ...state, allergies: updated };
        saveToStorage(next);
        return { allergies: updated };
      });
    },

    addPastIllness: (item) => {
      set((state) => {
        const newRecord: PastIllness = { id: `pi-${Date.now()}`, ...item };
        const updated = [newRecord, ...state.pastIllnesses];
        const next = { ...state, pastIllnesses: updated };
        saveToStorage(next);
        return { pastIllnesses: updated };
      });
    },

    deletePastIllness: (id) => {
      set((state) => {
        const updated = state.pastIllnesses.filter((p) => p.id !== id);
        const next = { ...state, pastIllnesses: updated };
        saveToStorage(next);
        return { pastIllnesses: updated };
      });
    },

    addMedication: (item) => {
      set((state) => {
        const newRecord: Medication = { id: `med-${Date.now()}`, ...item };
        const updated = [newRecord, ...state.medications];
        const next = { ...state, medications: updated };
        saveToStorage(next);
        return { medications: updated };
      });
    },

    toggleMedicationActive: (id) => {
      set((state) => {
        const updated = state.medications.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m));
        const next = { ...state, medications: updated };
        saveToStorage(next);
        return { medications: updated };
      });
    },

    deleteMedication: (id) => {
      set((state) => {
        const updated = state.medications.filter((m) => m.id !== id);
        const next = { ...state, medications: updated };
        saveToStorage(next);
        return { medications: updated };
      });
    },

    addLabResult: (item) => {
      set((state) => {
        const newRecord: LabResult = { id: `lab-${Date.now()}`, ...item };
        const updated = [newRecord, ...state.labResults];
        const next = { ...state, labResults: updated };
        saveToStorage(next);
        return { labResults: updated };
      });
    },

    deleteLabResult: (id) => {
      set((state) => {
        const updated = state.labResults.filter((l) => l.id !== id);
        const next = { ...state, labResults: updated };
        saveToStorage(next);
        return { labResults: updated };
      });
    },

    addDoctorVisit: (item) => {
      set((state) => {
        const newRecord: DoctorVisit = { id: `dv-${Date.now()}`, ...item };
        const updated = [newRecord, ...state.doctorVisits].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const next = { ...state, doctorVisits: updated };
        saveToStorage(next);
        return { doctorVisits: updated };
      });
    },

    deleteDoctorVisit: (id) => {
      set((state) => {
        const updated = state.doctorVisits.filter((d) => d.id !== id);
        const next = { ...state, doctorVisits: updated };
        saveToStorage(next);
        return { doctorVisits: updated };
      });
    },

    addSleepRecord: (record) => {
      set((state) => {
        const newRecord: SleepRecord = { id: `sl-${Date.now()}`, ...record };
        const updated = [...state.sleepHistory.filter((s) => s.date !== record.date), newRecord].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const next = { ...state, sleepHistory: updated };
        saveToStorage(next);
        return { sleepHistory: updated };
      });
    },

    deleteSleepRecord: (id) => {
      set((state) => {
        const updated = state.sleepHistory.filter((s) => s.id !== id);
        const next = { ...state, sleepHistory: updated };
        saveToStorage(next);
        return { sleepHistory: updated };
      });
    },

    updateSleepGoal: (goalUpdates) => {
      set((state) => {
        const nextGoal = { ...state.sleepGoal, ...goalUpdates };
        const next = { ...state, sleepGoal: nextGoal };
        saveToStorage(next);
        return { sleepGoal: nextGoal };
      });
    },

    addWorkoutRecord: (workout) => {
      set((state) => {
        const newRecord: WorkoutRecord = { id: `wk-${Date.now()}`, ...workout };
        const updated = [newRecord, ...state.workoutsHistory].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const next = { ...state, workoutsHistory: updated };
        saveToStorage(next);
        return { workoutsHistory: updated };
      });
    },

    deleteWorkoutRecord: (id) => {
      set((state) => {
        const updated = state.workoutsHistory.filter((w) => w.id !== id);
        const next = { ...state, workoutsHistory: updated };
        saveToStorage(next);
        return { workoutsHistory: updated };
      });
    },

    updateActivityGoal: (goalUpdates) => {
      set((state) => {
        const nextGoal = { ...state.activityGoal, ...goalUpdates };
        const next = { ...state, activityGoal: nextGoal };
        saveToStorage(next);
        return { activityGoal: nextGoal };
      });
    },

    addHabit: (habit) => {
      set((state) => {
        const newHabit: Habit = {
          id: `h-${Date.now()}`,
          ...habit,
          completedDates: [],
          currentStreak: 0,
          bestStreak: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        const updated = [...state.habits, newHabit];
        const next = { ...state, habits: updated };
        saveToStorage(next);
        return { habits: updated };
      });
    },

    toggleHabit: (habitId, dateStr) => {
      set((state) => {
        const updated = state.habits.map((habit) => {
          if (habit.id !== habitId) return habit;
          const exists = habit.completedDates.includes(dateStr);
          const nextDates = exists
            ? habit.completedDates.filter((d) => d !== dateStr)
            : [...habit.completedDates, dateStr].sort();

          // Calculate current streak
          let streak = 0;
          const today = new Date();
          const checkDate = new Date(today);
          const todayStr = checkDate.toISOString().split('T')[0];
          const hasToday = nextDates.includes(todayStr);

          if (!hasToday) {
            checkDate.setDate(checkDate.getDate() - 1);
          }

          while (true) {
            const curStr = checkDate.toISOString().split('T')[0];
            if (nextDates.includes(curStr)) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }

          const bestStreak = Math.max(habit.bestStreak, streak);
          return {
            ...habit,
            completedDates: nextDates,
            currentStreak: streak,
            bestStreak,
          };
        });

        const next = { ...state, habits: updated };
        saveToStorage(next);
        return { habits: updated };
      });
    },

    deleteHabit: (id) => {
      set((state) => {
        const updated = state.habits.filter((h) => h.id !== id);
        const next = { ...state, habits: updated };
        saveToStorage(next);
        return { habits: updated };
      });
    },

    addGoal: (goal) => {
      set((state) => {
        const completedCount = goal.milestones.filter((m) => m.isCompleted).length;
        const total = goal.milestones.length;
        const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        const todayStr = new Date().toISOString().split('T')[0];

        const initialHistory = goal.history && goal.history.length > 0 
          ? goal.history 
          : [
              { date: goal.startDate || todayStr, progressPercent: 0 },
              { date: todayStr, progressPercent }
            ];

        const newGoal: PersonalGoal = {
          id: `g-${Date.now()}`,
          ...goal,
          progressPercent,
          createdAt: todayStr,
          history: initialHistory,
        };
        const updated = [...state.goals, newGoal];
        const next = { ...state, goals: updated };
        saveToStorage(next);
        return { goals: updated };
      });
    },

    updateGoal: (id, updates) => {
      set((state) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const updated = state.goals.map((g) => {
          if (g.id !== id) return g;
          const merged = { ...g, ...updates };
          if (merged.milestones) {
            const completedCount = merged.milestones.filter((m) => m.isCompleted).length;
            merged.progressPercent = merged.milestones.length > 0 ? Math.round((completedCount / merged.milestones.length) * 100) : 0;
          }
          if (updates.progressPercent !== undefined || updates.milestones) {
            const hist = merged.history ? [...merged.history] : [{ date: merged.startDate || todayStr, progressPercent: 0 }];
            const existingIdx = hist.findIndex(h => h.date === todayStr);
            if (existingIdx >= 0) {
              hist[existingIdx] = { date: todayStr, progressPercent: merged.progressPercent };
            } else {
              hist.push({ date: todayStr, progressPercent: merged.progressPercent });
            }
            hist.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            merged.history = hist;
          }
          return merged;
        });
        const next = { ...state, goals: updated };
        saveToStorage(next);
        return { goals: updated };
      });
    },

    toggleMilestone: (goalId, milestoneId) => {
      set((state) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const updated = state.goals.map((g) => {
          if (g.id !== goalId) return g;
          const milestones = g.milestones.map((m) => (m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m));
          const completedCount = milestones.filter((m) => m.isCompleted).length;
          const progressPercent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
          const status = progressPercent === 100 ? ('completed' as const) : g.status;
          
          const hist = g.history && g.history.length > 0 
            ? [...g.history] 
            : [{ date: g.startDate || todayStr, progressPercent: 0 }];
          const existingIdx = hist.findIndex(h => h.date === todayStr);
          if (existingIdx >= 0) {
            hist[existingIdx] = { date: todayStr, progressPercent };
          } else {
            hist.push({ date: todayStr, progressPercent });
          }
          hist.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          return { ...g, milestones, progressPercent, status, history: hist };
        });
        const next = { ...state, goals: updated };
        saveToStorage(next);
        return { goals: updated };
      });
    },

    deleteGoal: (id) => {
      set((state) => {
        const updated = state.goals.filter((g) => g.id !== id);
        const next = { ...state, goals: updated };
        saveToStorage(next);
        return { goals: updated };
      });
    },

    addCalendarEvent: (event) => {
      set((state) => {
        const newEvent: CalendarEvent = { id: `ce-${Date.now()}`, ...event };
        const updated = [...state.calendarEvents, newEvent].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        const next = { ...state, calendarEvents: updated };
        saveToStorage(next);
        return { calendarEvents: updated };
      });
    },

    updateCalendarEvent: (id, updates) => {
      set((state) => {
        const updated = state.calendarEvents.map((e) => (e.id === id ? { ...e, ...updates } : e));
        const next = { ...state, calendarEvents: updated };
        saveToStorage(next);
        return { calendarEvents: updated };
      });
    },

    deleteCalendarEvent: (id) => {
      set((state) => {
        const updated = state.calendarEvents.filter((e) => e.id !== id);
        const next = { ...state, calendarEvents: updated };
        saveToStorage(next);
        return { calendarEvents: updated };
      });
    },

    addNote: (note) => {
      set((state) => {
        const newNote: Note = {
          id: `nt-${Date.now()}`,
          userId: 'user-1',
          ...note,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = [newNote, ...state.notes];
        const next = { ...state, notes: updated };
        saveToStorage(next);
        return { notes: updated };
      });
    },

    updateNote: (id, updates) => {
      set((state) => {
        const updated = state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
        );
        const next = { ...state, notes: updated };
        saveToStorage(next);
        return { notes: updated };
      });
    },

    deleteNote: (id) => {
      set((state) => {
        const updated = state.notes.filter((n) => n.id !== id);
        const next = { ...state, notes: updated };
        saveToStorage(next);
        return { notes: updated };
      });
    },

    addTask: (task) => {
      set((state) => {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          ...task,
          createdAt: new Date().toISOString(),
        };
        const updated = [newTask, ...(state.tasks || [])];
        const next = { ...state, tasks: updated };
        saveToStorage(next);
        return { tasks: updated };
      });
    },

    toggleTask: (id) => {
      set((state) => {
        const currentTasks = state.tasks || [];
        const updated = currentTasks.map((t) =>
          t.id === id
            ? {
                ...t,
                isCompleted: !t.isCompleted,
                completedAt: !t.isCompleted ? new Date().toISOString() : undefined,
              }
            : t
        );
        const next = { ...state, tasks: updated };
        saveToStorage(next);
        return { tasks: updated };
      });
    },

    deleteTask: (id) => {
      set((state) => {
        const currentTasks = state.tasks || [];
        const updated = currentTasks.filter((t) => t.id !== id);
        const next = { ...state, tasks: updated };
        saveToStorage(next);
        return { tasks: updated };
      });
    },

    updateTask: (id, updates) => {
      set((state) => {
        const currentTasks = state.tasks || [];
        const updated = currentTasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
        const next = { ...state, tasks: updated };
        saveToStorage(next);
        return { tasks: updated };
      });
    },

    // ==================== FINANCE IMPLEMENTATION ====================
    setFinanceCurrency: (currency) => {
      set((state) => {
        const finance = { ...state.finance, currency };
        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    addTransaction: (tx) => {
      set((state) => {
        const newTx: FinanceTransaction = {
          id: `tx-${Date.now()}`,
          ...tx,
          createdAt: new Date().toISOString(),
        };

        const updatedTxList = [newTx, ...(state.finance.transactions || [])];

        // Update account balance
        const updatedAccounts = state.finance.accounts.map((acc) => {
          if (acc.id === tx.accountId) {
            const diff = tx.type === 'income' ? tx.amount : -tx.amount;
            return { ...acc, balance: acc.balance + diff };
          }
          return acc;
        });

        // If expense, update budget spentCurrentMonth
        const updatedBudgets = state.finance.budgets.map((b) => {
          if (tx.type === 'expense' && b.category === tx.category) {
            return { ...b, spentCurrentMonth: b.spentCurrentMonth + tx.amount };
          }
          return b;
        });

        const finance = {
          ...state.finance,
          transactions: updatedTxList,
          accounts: updatedAccounts,
          budgets: updatedBudgets,
        };

        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    deleteTransaction: (id) => {
      set((state) => {
        const target = state.finance.transactions.find((t) => t.id === id);
        if (!target) return state;

        const updatedTxList = state.finance.transactions.filter((t) => t.id !== id);

        // Revert account balance
        const updatedAccounts = state.finance.accounts.map((acc) => {
          if (acc.id === target.accountId) {
            const revertDiff = target.type === 'income' ? -target.amount : target.amount;
            return { ...acc, balance: acc.balance + revertDiff };
          }
          return acc;
        });

        // Revert budget spentCurrentMonth
        const updatedBudgets = state.finance.budgets.map((b) => {
          if (target.type === 'expense' && b.category === target.category) {
            return { ...b, spentCurrentMonth: Math.max(0, b.spentCurrentMonth - target.amount) };
          }
          return b;
        });

        const finance = {
          ...state.finance,
          transactions: updatedTxList,
          accounts: updatedAccounts,
          budgets: updatedBudgets,
        };

        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    addFinanceAccount: (account) => {
      set((state) => {
        const newAcc: FinanceAccount = {
          id: `acc-${Date.now()}`,
          ...account,
        };
        const finance = {
          ...state.finance,
          accounts: [...state.finance.accounts, newAcc],
        };
        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    updateAccountBalance: (id, newBalance) => {
      set((state) => {
        const updatedAccounts = state.finance.accounts.map((a) =>
          a.id === id ? { ...a, balance: newBalance } : a
        );
        const finance = { ...state.finance, accounts: updatedAccounts };
        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    deleteFinanceAccount: (id) => {
      set((state) => {
        const updatedAccounts = state.finance.accounts.filter((a) => a.id !== id);
        const finance = { ...state.finance, accounts: updatedAccounts };
        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    addSavingsGoal: (goal) => {
      set((state) => {
        const newGoal: SavingsGoal = {
          id: `sg-${Date.now()}`,
          ...goal,
        };
        const finance = {
          ...state.finance,
          savingsGoals: [...state.finance.savingsGoals, newGoal],
        };
        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    contributeToSavingsGoal: (id, amount, accountId) => {
      set((state) => {
        const updatedGoals = state.finance.savingsGoals.map((g) =>
          g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
        );

        let updatedAccounts = state.finance.accounts;
        if (accountId) {
          updatedAccounts = state.finance.accounts.map((a) =>
            a.id === accountId ? { ...a, balance: Math.max(0, a.balance - amount) } : a
          );
        }

        const finance = {
          ...state.finance,
          savingsGoals: updatedGoals,
          accounts: updatedAccounts,
        };
        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    deleteSavingsGoal: (id) => {
      set((state) => {
        const updatedGoals = state.finance.savingsGoals.filter((g) => g.id !== id);
        const finance = { ...state.finance, savingsGoals: updatedGoals };
        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    updateBudgetLimit: (id, monthlyLimit) => {
      set((state) => {
        const updatedBudgets = state.finance.budgets.map((b) =>
          b.id === id ? { ...b, monthlyLimit } : b
        );
        const finance = { ...state.finance, budgets: updatedBudgets };
        const next = { ...state, finance };
        saveToStorage(next);
        return { finance };
      });
    },

    resetToDefaultData: () => {
      saveToStorage(INITIAL_LIFE_DATA);
      set({ ...INITIAL_LIFE_DATA });
    },
  };
});
