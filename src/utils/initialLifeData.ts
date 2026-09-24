import { LifeData } from '../types';

const now = new Date();
const formatDate = (offsetDays: number = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_LIFE_DATA: LifeData = {
  anthropometry: {
    heightCm: 178,
    currentWeightKg: 72.4,
    targetWeightKg: 70.0,
    bloodType: 'A (II)',
    rhesusFactor: '+',
    birthDate: '1995-05-14',
    gender: 'male',
  },
  weightHistory: [
    { id: 'w-1', date: formatDate(-60), weightKg: 75.8, bmi: 23.9, notes: 'Старт программы контроля веса' },
    { id: 'w-2', date: formatDate(-45), weightKg: 74.9, bmi: 23.6, notes: 'Включение кардио 3 раза в неделю' },
    { id: 'w-3', date: formatDate(-30), weightKg: 74.1, bmi: 23.4, notes: 'Коррекция рациона, снижение сахара' },
    { id: 'w-4', date: formatDate(-20), weightKg: 73.5, bmi: 23.2, notes: 'Стабильный прогресс' },
    { id: 'w-5', date: formatDate(-10), weightKg: 73.0, bmi: 23.0, notes: 'Хорошее самочувствие' },
    { id: 'w-6', date: formatDate(-5), weightKg: 72.7, bmi: 22.9, notes: 'После утренней тренировки' },
    { id: 'w-7', date: formatDate(-1), weightKg: 72.5, bmi: 22.9, notes: 'Вечерний замер' },
    { id: 'w-8', date: formatDate(0), weightKg: 72.4, bmi: 22.8, notes: 'Текущий результат' },
  ],
  vitalsHistory: [
    {
      id: 'v-1',
      date: formatDate(-4),
      time: '08:30',
      systolicBp: 120,
      diastolicBp: 80,
      pulseBpm: 68,
      temperatureC: 36.6,
      oxygenPercent: 99,
      notes: 'Утреннее измерение в покое'
    },
    {
      id: 'v-2',
      date: formatDate(-3),
      time: '08:15',
      systolicBp: 118,
      diastolicBp: 78,
      pulseBpm: 66,
      temperatureC: 36.5,
      oxygenPercent: 99,
      notes: 'Перед пробежкой'
    },
    {
      id: 'v-3',
      date: formatDate(-2),
      time: '08:20',
      systolicBp: 122,
      diastolicBp: 81,
      pulseBpm: 72,
      temperatureC: 36.6,
      oxygenPercent: 98,
      notes: 'После чашки кофе'
    },
    {
      id: 'v-4',
      date: formatDate(-1),
      time: '08:45',
      systolicBp: 119,
      diastolicBp: 79,
      pulseBpm: 67,
      temperatureC: 36.6,
      oxygenPercent: 99,
      notes: 'Отличное состояние'
    },
    {
      id: 'v-5',
      date: formatDate(0),
      time: '08:00',
      systolicBp: 118,
      diastolicBp: 78,
      pulseBpm: 65,
      temperatureC: 36.6,
      oxygenPercent: 99,
      bloodGlucoseMmol: 4.8,
      notes: 'Базовый утренний чекап'
    },
  ],
  chronicConditions: [
    {
      id: 'cc-1',
      title: 'Сезонный поллиноз (аллергический ринит)',
      diagnosisDate: '2021-04-12',
      severity: 'mild',
      status: 'controlled',
      doctor: 'Д-р Васильева Е.Н., аллерголог',
      notes: 'Симптомы проявляются в мае-июне при цветении березы. Контролируется антигистаминными.'
    }
  ],
  allergies: [
    {
      id: 'al-1',
      allergen: 'Пыльца берёзы и ольхи',
      reaction: 'Слезотечение, заложенность носа, чихание',
      severity: 'moderate',
      diagnosedYear: '2021',
      notes: 'Рекомендовано ношение маски и промывание носа в пик пыления.'
    },
    {
      id: 'al-2',
      allergen: 'Пенициллин (антибиотики пенициллинового ряда)',
      reaction: 'Кожная сыпь, крапивница',
      severity: 'severe',
      diagnosedYear: '2016',
      notes: 'Категорически противопоказано применение пенициллинов.'
    }
  ],
  pastIllnesses: [
    {
      id: 'pi-1',
      title: 'Аппендэктомия (удаление аппендицита)',
      year: '2018',
      hospital: 'Городская клиническая больница №1',
      notes: 'Лапароскопическая операция, заживление первичное, без осложнений.'
    },
    {
      id: 'pi-2',
      title: 'Ветряная оспа',
      year: '2008',
      notes: 'Детская инфекция, перенесена в легкой форме, стойкий иммунитет.'
    }
  ],
  medications: [
    {
      id: 'med-1',
      name: 'Омега-3 концентрат 1000 мг',
      dosage: '1 капсула',
      frequency: '1 раз в день утром',
      timeOfDay: ['morning'],
      startDate: '2026-01-15',
      prescribedBy: 'Терапевт',
      isActive: true,
      notes: 'Поддержка липидного обмена и сосудов'
    },
    {
      id: 'med-2',
      name: 'Витамин D3 (Холекальциферол)',
      dosage: '2000 МЕ (4 капли)',
      frequency: 'Ежедневно во время завтрака',
      timeOfDay: ['morning'],
      startDate: '2026-02-01',
      prescribedBy: 'Эндокринолог',
      isActive: true,
      notes: 'Профилактическая доза при недостатке инсоляции'
    },
    {
      id: 'med-3',
      name: 'Магний В6 Форте',
      dosage: '1 таблетка',
      frequency: 'Вечером перед сном',
      timeOfDay: ['evening'],
      startDate: '2026-03-01',
      isActive: true,
      notes: 'Улучшение качества фазы глубокого сна'
    }
  ],
  labResults: [
    {
      id: 'lab-1',
      date: formatDate(-14),
      testName: 'Клинический анализ крови с лейкоцитарной формулой',
      category: 'blood',
      value: 'Гемоглобин: 148, Эритроциты: 4.8, Лейкоциты: 6.2, СОЭ: 4',
      unit: 'комплекс',
      referenceRange: 'Все показатели в пределах нормы',
      isNormal: true,
      clinic: 'Лаборатория Инвитро',
      doctorNotes: 'Анемии и признаков воспаления нет.'
    },
    {
      id: 'lab-2',
      date: formatDate(-14),
      testName: 'Глюкоза плазмы венозной крови натощак',
      category: 'biochem',
      value: '4.8',
      unit: 'ммоль/л',
      referenceRange: '4.1 — 5.9',
      isNormal: true,
      clinic: 'Лаборатория Инвитро',
      doctorNotes: 'Углеводный обмен в норме.'
    },
    {
      id: 'lab-3',
      date: formatDate(-35),
      testName: '25-OH Витамин D (суммарный)',
      category: 'hormones',
      value: '42.5',
      unit: 'нг/мл',
      referenceRange: '30.0 — 100.0 (Оптимальный уровень)',
      isNormal: true,
      clinic: 'Гемотест',
      doctorNotes: 'Дефицит устранен, продолжать поддерживающую дозу.'
    },
    {
      id: 'lab-4',
      date: formatDate(-35),
      testName: 'Липидограмма (Липидный профиль)',
      category: 'biochem',
      value: 'Холестерин общий: 4.4, ЛПВП: 1.55, ЛПНП: 2.3, Триглицериды: 1.1',
      unit: 'ммоль/л',
      referenceRange: 'Низкий сердечно-сосудистый риск',
      isNormal: true,
      clinic: 'Гемотест'
    }
  ],
  doctorVisits: [
    {
      id: 'dv-1',
      date: formatDate(-14),
      doctorName: 'Д-р Смирнова Елена Владимировна',
      specialty: 'Врач-терапевт высшей категории',
      clinic: 'Клинический диагностический центр',
      complaints: 'Плановый ежегодный профилактический осмотр',
      diagnosis: 'Практически здоров. Индекс массы тела в норме (22.8).',
      recommendations: 'Продолжать тренировочный режим 3-4 раза в неделю. Контроль артериального давления. Повторный осмотр через 1 год.',
      nextVisitDate: formatDate(350)
    },
    {
      id: 'dv-2',
      date: formatDate(-80),
      doctorName: 'Д-р Мельников Андрей Сергеевич',
      specialty: 'Врач-офтальмолог',
      clinic: 'Центр лазерной коррекции и микрохирургии глаза',
      complaints: 'Проверка остроты зрения при длительной работе за компьютером',
      diagnosis: 'Миопия слабой степени правого глаза (-0.75), эмметропия левого глаза.',
      recommendations: 'Компьютерные очки с фильтром синего света. Зрительная гимнастика по правилу 20-20-20.'
    }
  ],
  sleepHistory: [
    { id: 'sl-1', date: formatDate(-6), bedTime: '23:15', wakeTime: '07:15', durationHours: 8.0, quality: 5, deepSleepMinutes: 110, notes: 'Глубокий спокойный сон' },
    { id: 'sl-2', date: formatDate(-5), bedTime: '23:40', wakeTime: '07:10', durationHours: 7.5, quality: 4, deepSleepMinutes: 95, notes: 'Быстро уснул' },
    { id: 'sl-3', date: formatDate(-4), bedTime: '00:10', wakeTime: '07:30', durationHours: 7.3, quality: 3, deepSleepMinutes: 80, notes: 'Поздний отбой из-за чтения' },
    { id: 'sl-4', date: formatDate(-3), bedTime: '23:05', wakeTime: '07:15', durationHours: 8.2, quality: 5, deepSleepMinutes: 125, notes: 'Отличное восстановление' },
    { id: 'sl-5', date: formatDate(-2), bedTime: '23:30', wakeTime: '07:30', durationHours: 8.0, quality: 4, deepSleepMinutes: 105, notes: 'Проветренная спальня' },
    { id: 'sl-6', date: formatDate(-1), bedTime: '23:20', wakeTime: '07:10', durationHours: 7.8, quality: 5, deepSleepMinutes: 115, notes: 'Легкий подъем без будильника' },
    { id: 'sl-7', date: formatDate(0), bedTime: '23:10', wakeTime: '07:20', durationHours: 8.15, quality: 5, deepSleepMinutes: 120, notes: 'Максимальный заряд энергии' },
  ],
  sleepGoal: {
    targetHours: 8.0,
    targetBedTime: '23:15',
    targetWakeTime: '07:15'
  },
  workoutsHistory: [
    {
      id: 'wk-1',
      date: formatDate(-5),
      time: '19:00',
      type: 'running',
      title: 'Вечерняя темповая пробежка в парке',
      durationMinutes: 45,
      caloriesBurned: 460,
      intensity: 'moderate',
      distanceKm: 6.8,
      avgHeartRate: 142,
      notes: 'Легкий темп 5:40 мин/км, дыхание ровное'
    },
    {
      id: 'wk-2',
      date: formatDate(-3),
      time: '18:30',
      type: 'gym',
      title: 'Силовая тренировка: Верх тела и кор',
      durationMinutes: 65,
      caloriesBurned: 520,
      intensity: 'high',
      avgHeartRate: 135,
      notes: 'Жим лежа, подтягивания с весом, планка'
    },
    {
      id: 'wk-3',
      date: formatDate(-2),
      time: '08:00',
      type: 'swimming',
      title: 'Утреннее плавание брассом и кролем',
      durationMinutes: 45,
      caloriesBurned: 380,
      intensity: 'moderate',
      distanceKm: 1.5,
      avgHeartRate: 128,
      notes: 'Фокус на длинный гребок и дыхание'
    },
    {
      id: 'wk-4',
      date: formatDate(0),
      time: '07:30',
      type: 'running',
      title: 'Утренний легкий кросс',
      durationMinutes: 35,
      caloriesBurned: 340,
      intensity: 'moderate',
      distanceKm: 5.2,
      avgHeartRate: 138,
      notes: 'Отличная зарядка на весь рабочий день'
    }
  ],
  activityGoal: {
    weeklyWorkoutsTarget: 4,
    weeklyMinutesTarget: 220,
    dailyStepsTarget: 10000
  },
  habits: [
    {
      id: 'h-1',
      title: 'Водный баланс: 2.0+ литра чистой воды',
      description: 'Стакан теплой воды сразу после пробуждения и равномерно в течение дня',
      category: 'health',
      targetDaysPerWeek: 7,
      completedDates: [formatDate(-6), formatDate(-5), formatDate(-4), formatDate(-3), formatDate(-2), formatDate(-1), formatDate(0)],
      currentStreak: 18,
      bestStreak: 24,
      color: '#0284c7',
      icon: 'Droplets',
      createdAt: formatDate(-30)
    },
    {
      id: 'h-2',
      title: 'Утренняя гимнастика и мобильность суставов (15 мин)',
      description: 'Комплекс упражнений для позвоночника, шеи и тазобедренных суставов',
      category: 'fitness',
      targetDaysPerWeek: 7,
      completedDates: [formatDate(-6), formatDate(-5), formatDate(-4), formatDate(-2), formatDate(-1), formatDate(0)],
      currentStreak: 3,
      bestStreak: 14,
      color: '#10b981',
      icon: 'Activity',
      createdAt: formatDate(-30)
    },
    {
      id: 'h-3',
      title: 'Чтение литературы по развитию и здоровью (25 мин)',
      description: 'Книги по физиологии, привычкам и когнитивной продуктивности',
      category: 'mind',
      targetDaysPerWeek: 6,
      completedDates: [formatDate(-5), formatDate(-4), formatDate(-3), formatDate(-2), formatDate(-1), formatDate(0)],
      currentStreak: 6,
      bestStreak: 21,
      color: '#8b5cf6',
      icon: 'BookOpen',
      createdAt: formatDate(-30)
    },
    {
      id: 'h-4',
      title: 'Цифровой детокс: без экранов за 45 минут до сна',
      description: 'Никаких смартфонов и ноутбуков в постели, мягкий желтый свет',
      category: 'sleep',
      targetDaysPerWeek: 7,
      completedDates: [formatDate(-5), formatDate(-4), formatDate(-3), formatDate(-1), formatDate(0)],
      currentStreak: 2,
      bestStreak: 12,
      color: '#f59e0b',
      icon: 'Moon',
      createdAt: formatDate(-30)
    },
    {
      id: 'h-5',
      title: '10 000 шагов на свежем воздухе',
      description: 'Пешие прогулки в обед и после рабочего дня',
      category: 'fitness',
      targetDaysPerWeek: 6,
      completedDates: [formatDate(-6), formatDate(-5), formatDate(-4), formatDate(-3), formatDate(-2), formatDate(-1), formatDate(0)],
      currentStreak: 9,
      bestStreak: 19,
      color: '#06b6d4',
      icon: 'Footprints',
      createdAt: formatDate(-30)
    }
  ],
  goals: [
    {
      id: 'g-1',
      title: 'Достичь целевой спортивной формы: 70.0 кг и 14% жира',
      description: 'Снизить вес с 75.8 кг до 70.0 кг за счет сбалансированного питания и регулярных силовых тренировок.',
      category: 'health',
      startDate: formatDate(-60),
      targetDate: formatDate(45),
      status: 'in_progress',
      progressPercent: 65,
      milestones: [
        { id: 'm-1-1', title: 'Пройти стартовый чекап и биоимпеданс', isCompleted: true },
        { id: 'm-1-2', title: 'Преодолеть планку 74.0 кг', isCompleted: true },
        { id: 'm-1-3', title: 'Преодолеть планку 72.5 кг', isCompleted: true },
        { id: 'm-1-4', title: 'Достичь стабильного веса 70.0 кг', isCompleted: false },
        { id: 'm-1-5', title: 'Закрепить результат в течение 30 дней', isCompleted: false },
      ],
      createdAt: formatDate(-60),
      history: [
        { date: formatDate(-60), progressPercent: 0 },
        { date: formatDate(-48), progressPercent: 20 },
        { date: formatDate(-35), progressPercent: 40 },
        { date: formatDate(-20), progressPercent: 55 },
        { date: formatDate(-8), progressPercent: 60 },
        { date: formatDate(0), progressPercent: 65 },
      ]
    },
    {
      id: 'g-2',
      title: 'Подготовка и преодоление полумарафона (21.1 км)',
      description: 'Построить кардио-выносливость по 12-недельному плану беговых тренировок с целевым темпом 5:30 мин/км.',
      category: 'fitness',
      startDate: formatDate(-30),
      targetDate: formatDate(60),
      status: 'in_progress',
      progressPercent: 45,
      milestones: [
        { id: 'm-2-1', title: 'Пробежать 10 км без остановки', isCompleted: true },
        { id: 'm-2-2', title: 'Выполнить длительный кросс 15 км', isCompleted: true },
        { id: 'm-2-3', title: 'Контрольный забег на 18 км', isCompleted: false },
        { id: 'm-2-4', title: 'Участие в официальном городском забеге', isCompleted: false },
      ],
      createdAt: formatDate(-30),
      history: [
        { date: formatDate(-30), progressPercent: 0 },
        { date: formatDate(-22), progressPercent: 15 },
        { date: formatDate(-14), progressPercent: 25 },
        { date: formatDate(-7), progressPercent: 35 },
        { date: formatDate(0), progressPercent: 45 },
      ]
    },
    {
      id: 'g-3',
      title: 'Оптимизация глубокой фазы сна (8+ часов, индекс 85+)',
      description: 'Внедрить строгий режим циркадных ритмов, снизить уровень стресса и кофеина во второй половине дня.',
      category: 'personal',
      startDate: formatDate(-45),
      targetDate: formatDate(15),
      status: 'in_progress',
      progressPercent: 80,
      milestones: [
        { id: 'm-3-1', title: 'Исключить кофеин после 14:00', isCompleted: true },
        { id: 'm-3-2', title: 'Установить блэкаут-шторы и температуру 19°C', isCompleted: true },
        { id: 'm-3-3', title: 'Держать среднюю продолжительность 7.8+ часов 14 дней подряд', isCompleted: true },
        { id: 'm-3-4', title: 'Добиться 120+ минут глубокого сна каждую ночь', isCompleted: false },
      ],
      createdAt: formatDate(-45),
      history: [
        { date: formatDate(-45), progressPercent: 0 },
        { date: formatDate(-36), progressPercent: 25 },
        { date: formatDate(-25), progressPercent: 50 },
        { date: formatDate(-15), progressPercent: 70 },
        { date: formatDate(-5), progressPercent: 75 },
        { date: formatDate(0), progressPercent: 80 },
      ]
    }
  ],
  calendarEvents: [
    {
      id: 'ce-1',
      title: 'Утренняя кардио-пробежка',
      description: '5.5 км в аэробной пульсовой зоне',
      category: 'workout',
      startTime: `${formatDate(0)}T07:30:00`,
      endTime: `${formatDate(0)}T08:15:00`,
      status: 'completed',
      location: 'Городской парк'
    },
    {
      id: 'ce-2',
      title: 'Прием витамина D3 и Омега-3',
      description: 'Во время завтрака',
      category: 'habit_task',
      startTime: `${formatDate(0)}T08:45:00`,
      endTime: `${formatDate(0)}T09:00:00`,
      status: 'completed'
    },
    {
      id: 'ce-3',
      title: 'Силовая тренировка: Спина и плечи',
      description: 'Зал: разминка, базовая тяга, подтягивания',
      category: 'workout',
      startTime: `${formatDate(0)}T18:30:00`,
      endTime: `${formatDate(0)}T19:45:00`,
      status: 'planned',
      location: 'Фитнес-клуб "Olympus"'
    },
    {
      id: 'ce-4',
      title: 'Вечерний цифровой детокс и подготовка ко сну',
      description: 'Проветривание, чтение книги, отбой в 23:15',
      category: 'sleep_rest',
      startTime: `${formatDate(0)}T22:30:00`,
      endTime: `${formatDate(0)}T23:15:00`,
      status: 'planned'
    },
    {
      id: 'ce-5',
      title: 'Консультация с врачом-диетологом',
      description: 'Анализ рациона, баланс белков и микронутриентов',
      category: 'doctor_visit',
      startTime: `${formatDate(2)}T14:00:00`,
      endTime: `${formatDate(2)}T15:00:00`,
      status: 'planned',
      location: 'МедЦентр Премиум, каб. 304'
    },
    {
      id: 'ce-6',
      title: 'Интервальная тренировка на велотренажере',
      description: 'HIIT сессия 30 минут',
      category: 'workout',
      startTime: `${formatDate(3)}T10:00:00`,
      endTime: `${formatDate(3)}T10:45:00`,
      status: 'planned'
    },
    {
      id: 'ce-7',
      title: 'Сдача контрольного анализа крови (ОАК, ферритин)',
      description: 'Натощак до 10:00',
      category: 'doctor_visit',
      startTime: `${formatDate(5)}T08:30:00`,
      endTime: `${formatDate(5)}T09:00:00`,
      status: 'planned',
      location: 'Лаборатория Инвитро'
    }
  ],
  notes: [
    {
      id: 'nt-1',
      userId: 'demo-user-1',
      title: 'Рекомендации кардиолога по пульсовым зонам',
      content: 'Зона 1 (восстановление): 105-122 уд/мин\nЗона 2 (жиросжигание/базовая выносливость): 123-140 уд/мин\nЗона 3 (аэробная): 141-158 уд/мин\nЗона 4 (анаэробный порог): 159-172 уд/мин\nМаксимальный расчетный пульс: 190 уд/мин.',
      category: 'Здоровье',
      tags: ['пульс', 'кардио', 'тренировки'],
      isPinned: true,
      createdAt: formatDate(-20),
      updatedAt: formatDate(-5)
    },
    {
      id: 'nt-2',
      userId: 'demo-user-1',
      title: 'Правило гигиены сна профессора Уокера',
      content: '1. Строго одинаковое время подъема 7 дней в неделю.\n2. Температура в комнате 18-19 градусов.\n3. Полная темнота (блэкаут).\n4. Никакого алкоголя за 4 часа до сна.\n5. Горячий душ за 90 минут до сна способствует снижению внутренней температуры тела.',
      category: 'Сон',
      tags: ['сон', 'биохакинг', 'восстановление'],
      isPinned: true,
      createdAt: formatDate(-15),
      updatedAt: formatDate(-2)
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Сдать контрольные анализы крови (ОАК, биохимия, витамин D)',
      description: 'Натощак до 10:00 в лаборатории МедЦентр',
      isCompleted: false,
      tags: ['Health'],
      priority: 'high',
      dueDate: formatDate(1),
      createdAt: formatDate(-2),
    },
    {
      id: 'task-2',
      title: 'Подготовить ежеквартальный отчет по продуктовой аналитике',
      description: 'Свести ключевые метрики в дашборд и согласовать с командой',
      isCompleted: false,
      tags: ['Work'],
      priority: 'high',
      dueDate: formatDate(0),
      createdAt: formatDate(-1),
    },
    {
      id: 'task-3',
      title: 'Интервальная пробежка 5 км и растяжка',
      description: 'Пульсовая зона 2-3, контроль дыхания',
      isCompleted: true,
      tags: ['Fitness', 'Health'],
      priority: 'medium',
      dueDate: formatDate(0),
      createdAt: formatDate(-1),
      completedAt: formatDate(0),
    },
    {
      id: 'task-4',
      title: 'Забронировать билеты и подтвердить отель на отпуск',
      description: 'Сверить даты и проверить бронирование',
      isCompleted: false,
      tags: ['Personal'],
      priority: 'medium',
      dueDate: formatDate(3),
      createdAt: formatDate(-3),
    },
    {
      id: 'task-5',
      title: 'Оплатить страховку и коммунальные счета',
      description: 'Проверить личный кабинет и квитанции',
      isCompleted: true,
      tags: ['Finance', 'Personal'],
      priority: 'low',
      dueDate: formatDate(-1),
      createdAt: formatDate(-4),
      completedAt: formatDate(-1),
    },
    {
      id: 'task-6',
      title: 'Проветрить спальню и включить увлажнитель за час до сна',
      description: 'Температура 18-19°C для глубокой фазы сна',
      isCompleted: false,
      tags: ['Health', 'Personal'],
      priority: 'medium',
      dueDate: formatDate(0),
      createdAt: formatDate(0),
    }
  ],
  finance: {
    currency: 'KZT',
    accounts: [
      {
        id: 'acc-1',
        name: 'Kaspi Gold / Карта на каждый день',
        type: 'card',
        balance: 485000,
        currency: 'KZT',
        color: 'from-amber-500 to-red-500'
      },
      {
        id: 'acc-2',
        name: 'Накопительный депозит (Подушка безопасности)',
        type: 'savings',
        balance: 1850000,
        currency: 'KZT',
        color: 'from-emerald-500 to-teal-600'
      },
      {
        id: 'acc-3',
        name: 'Инвестиционный брокер (Акции & ETF)',
        type: 'investment',
        balance: 3200000,
        currency: 'KZT',
        color: 'from-indigo-600 to-purple-600'
      },
      {
        id: 'acc-4',
        name: 'Наличный резерв',
        type: 'cash',
        balance: 95000,
        currency: 'KZT',
        color: 'from-slate-600 to-slate-800'
      }
    ],
    transactions: [
      {
        id: 'tx-1',
        date: formatDate(0),
        type: 'expense',
        amount: 18500,
        category: 'health_meds',
        accountId: 'acc-1',
        title: 'Комплекс Омега-3, Магний B6 и витамин D3',
        note: 'Аптека Europharma',
        tags: ['Здоровье', 'Биохакинг'],
        createdAt: formatDate(0)
      },
      {
        id: 'tx-2',
        date: formatDate(-1),
        type: 'expense',
        amount: 24300,
        category: 'food_groceries',
        accountId: 'acc-1',
        title: 'Супермаркет: свежие овощи, зелень, рыба',
        note: 'Здоровое сбалансированное питание',
        tags: ['Питание'],
        createdAt: formatDate(-1)
      },
      {
        id: 'tx-3',
        date: formatDate(-3),
        type: 'income',
        amount: 850000,
        category: 'salary',
        accountId: 'acc-1',
        title: 'Основной доход / Зарплата за текущий месяц',
        note: 'IT Консалтинг & Разработка',
        tags: ['Доход', 'Работа'],
        createdAt: formatDate(-3)
      },
      {
        id: 'tx-4',
        date: formatDate(-4),
        type: 'expense',
        amount: 65000,
        category: 'sports_fitness',
        accountId: 'acc-1',
        title: 'Продление абонемента Invictus Fitness + бассейн',
        note: 'Ежемесячный членский взнос',
        tags: ['Спорт', 'Фитнес'],
        createdAt: formatDate(-4)
      },
      {
        id: 'tx-5',
        date: formatDate(-6),
        type: 'expense',
        amount: 45000,
        category: 'education_books',
        accountId: 'acc-1',
        title: 'Курс по превентивной медицине и оптимизации сна',
        note: 'Самообразование',
        tags: ['Обучение', 'Сон'],
        createdAt: formatDate(-6)
      },
      {
        id: 'tx-6',
        date: formatDate(-7),
        type: 'income',
        amount: 140000,
        category: 'freelance',
        accountId: 'acc-1',
        title: 'Гонорар за аудит архитектуры мобильного приложения',
        note: 'Контрактный проект',
        tags: ['Фриланс'],
        createdAt: formatDate(-7)
      },
      {
        id: 'tx-7',
        date: formatDate(-9),
        type: 'expense',
        amount: 32000,
        category: 'housing_bills',
        accountId: 'acc-1',
        title: 'Коммунальные услуги и оптоволоконный интернет',
        note: 'Ежемесячный платеж',
        tags: ['Жилье'],
        createdAt: formatDate(-9)
      },
      {
        id: 'tx-8',
        date: formatDate(-11),
        type: 'income',
        amount: 48000,
        category: 'investments',
        accountId: 'acc-3',
        title: 'Квартальные дивиденды по ETF портфелю',
        note: 'Реинвестирование',
        tags: ['Инвестиции'],
        createdAt: formatDate(-11)
      }
    ],
    budgets: [
      {
        id: 'bg-1',
        category: 'health_meds',
        categoryName: 'Здоровье и медицина',
        monthlyLimit: 60000,
        spentCurrentMonth: 18500,
        color: 'emerald'
      },
      {
        id: 'bg-2',
        category: 'sports_fitness',
        categoryName: 'Спорт и фитнес',
        monthlyLimit: 80000,
        spentCurrentMonth: 65000,
        color: 'cyan'
      },
      {
        id: 'bg-3',
        category: 'food_groceries',
        categoryName: 'Питание и супермаркеты',
        monthlyLimit: 120000,
        spentCurrentMonth: 58400,
        color: 'amber'
      },
      {
        id: 'bg-4',
        category: 'education_books',
        categoryName: 'Обучение и книги',
        monthlyLimit: 50000,
        spentCurrentMonth: 45000,
        color: 'indigo'
      },
      {
        id: 'bg-5',
        category: 'housing_bills',
        categoryName: 'Жилье и счета',
        monthlyLimit: 40000,
        spentCurrentMonth: 32000,
        color: 'purple'
      }
    ],
    savingsGoals: [
      {
        id: 'sg-1',
        title: 'Подушка безопасности (6 месяцев расходов)',
        targetAmount: 2500000,
        currentAmount: 1850000,
        targetDate: formatDate(120),
        category: 'safety_cushion',
        color: 'emerald'
      },
      {
        id: 'sg-2',
        title: 'Инвестиционный капитал (Passive Income)',
        targetAmount: 5000000,
        currentAmount: 3200000,
        targetDate: formatDate(240),
        category: 'investment',
        color: 'indigo'
      },
      {
        id: 'sg-3',
        title: 'Оздоровительный ретрит в горах (Алтай / Альпы)',
        targetAmount: 700000,
        currentAmount: 510000,
        targetDate: formatDate(60),
        category: 'health',
        color: 'cyan'
      },
      {
        id: 'sg-4',
        title: 'Рабочая станция и эргономичное рабочее место',
        targetAmount: 900000,
        currentAmount: 720000,
        targetDate: formatDate(45),
        category: 'tech',
        color: 'purple'
      }
    ]
  }
};
