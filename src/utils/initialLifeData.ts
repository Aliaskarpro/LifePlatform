import { LifeData } from '../types';

/** A new account starts with empty personal records and neutral preferences. */
export const INITIAL_LIFE_DATA: LifeData = {
  anthropometry: {
    heightCm: 0,
    currentWeightKg: 0,
    targetWeightKg: 0,
  },
  weightHistory: [],
  vitalsHistory: [],
  chronicConditions: [],
  allergies: [],
  pastIllnesses: [],
  medications: [],
  labResults: [],
  doctorVisits: [],
  sleepHistory: [],
  sleepGoal: {
    targetHours: 8,
    targetBedTime: '23:00',
    targetWakeTime: '07:00',
  },
  workoutsHistory: [],
  activityGoal: {
    weeklyWorkoutsTarget: 3,
    weeklyMinutesTarget: 150,
    dailyStepsTarget: 8000,
  },
  habits: [],
  goals: [],
  calendarEvents: [],
  notes: [],
  tasks: [],
  finance: {
    currency: 'KZT',
    accounts: [],
    transactions: [],
    budgets: [],
    savingsGoals: [],
  },
};
