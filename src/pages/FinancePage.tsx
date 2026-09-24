import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  ShieldCheck, 
  CreditCard, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Filter, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  ChevronRight, 
  PieChart, 
  RefreshCw,
  X,
  Target,
  Edit2
} from 'lucide-react';
import { useLifeStore } from '../store/lifeStore';
import { 
  CurrencyCode, 
  TransactionType, 
  ExpenseCategory, 
  IncomeCategory, 
  FinanceAccount, 
  SavingsGoal 
} from '../types';

export const EXPENSE_CATEGORIES = [
  { id: 'health_meds', name: 'Здоровье и медицина', color: 'emerald', icon: '🩺' },
  { id: 'sports_fitness', name: 'Спорт и фитнес', color: 'cyan', icon: '🏋️' },
  { id: 'food_groceries', name: 'Питание и супермаркеты', color: 'amber', icon: '🥗' },
  { id: 'housing_bills', name: 'Жилье и ЖКУ', color: 'purple', icon: '🏠' },
  { id: 'education_books', name: 'Образование и книги', color: 'indigo', icon: '📚' },
  { id: 'transport', name: 'Транспорт и авто', color: 'blue', icon: '🚗' },
  { id: 'entertainment', name: 'Развлечения и кафе', color: 'rose', icon: '☕' },
  { id: 'shopping', name: 'Покупки и одежда', color: 'violet', icon: '🛍️' },
  { id: 'other', name: 'Другое', color: 'slate', icon: '🏷️' },
] as const;

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Зарплата / Оклад', color: 'emerald', icon: '💼' },
  { id: 'freelance', name: 'Проекты и фриланс', color: 'indigo', icon: '💻' },
  { id: 'investments', name: 'Инвестиции и дивиденды', color: 'purple', icon: '📈' },
  { id: 'cashback_gifts', name: 'Кэшбэк и подарки', color: 'cyan', icon: '🎁' },
  { id: 'other', name: 'Прочие доходы', color: 'slate', icon: '💰' },
] as const;

export function formatCurrency(amount: number, currency: CurrencyCode = 'KZT'): string {
  const formattedNumber = new Intl.NumberFormat('ru-RU').format(Math.round(amount));
  switch (currency) {
    case 'KZT':
      return `${formattedNumber} ₸`;
    case 'RUB':
      return `${formattedNumber} ₽`;
    case 'USD':
      return `$${formattedNumber}`;
    case 'EUR':
      return `€${formattedNumber}`;
    default:
      return `${formattedNumber} ${currency}`;
  }
}

export const FinancePage: React.FC = () => {
  const { 
    finance, 
    setFinanceCurrency, 
    addTransaction, 
    deleteTransaction, 
    addFinanceAccount, 
    addSavingsGoal, 
    contributeToSavingsGoal, 
    deleteSavingsGoal, 
    updateBudgetLimit 
  } = useLifeStore();

  const { currency, accounts = [], transactions = [], budgets = [], savingsGoals = [] } = finance;

  // Modals state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);

  // Transaction form state
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txTitle, setTxTitle] = useState('');
  const [txCategory, setTxCategory] = useState<string>('health_meds');
  const [txAccountId, setTxAccountId] = useState<string>(accounts[0]?.id || '');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txNote, setTxNote] = useState('');

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccountId, setDepositAccountId] = useState(accounts[0]?.id || '');

  // Account form state
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'card' | 'savings' | 'investment' | 'cash'>('card');
  const [accBalance, setAccBalance] = useState('');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [goalCategory, setGoalCategory] = useState<'safety_cushion' | 'vacation' | 'investment' | 'tech' | 'health' | 'other'>('safety_cushion');

  // Transactions list filters
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterAccountId, setFilterAccountId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ================= CALCULATED KPIS =================
  const totalNetWorth = useMemo(() => {
    return accounts.reduce((acc, a) => acc + a.balance, 0);
  }, [accounts]);

  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // e.g. "2026-09"

  const monthlyIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthPrefix]);

  const monthlyExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonthPrefix]);

  const netSavings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;

  // Emergency Fund autonomy in months
  const emergencyFundTotal = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'savings' || a.type === 'cash')
      .reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const avgMonthlyExpense = monthlyExpense > 0 ? monthlyExpense : 150000;
  const emergencyFundMonths = (emergencyFundTotal / avgMonthlyExpense).toFixed(1);

  // Financial Health Score (0-100)
  const healthScore = useMemo(() => {
    let score = 50;
    // Savings rate score (up to +25)
    if (savingsRate >= 30) score += 25;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 10;
    else if (savingsRate < 0) score -= 20;

    // Emergency fund months (up to +25)
    const m = parseFloat(emergencyFundMonths);
    if (m >= 6) score += 25;
    else if (m >= 3) score += 15;
    else if (m >= 1) score += 5;

    return Math.min(100, Math.max(10, score));
  }, [savingsRate, emergencyFundMonths]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterAccountId !== 'all' && t.accountId !== filterAccountId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchNote = t.note?.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        if (!matchTitle && !matchNote && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterAccountId, searchQuery]);

  // Handlers
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0 || !txTitle.trim() || !txAccountId) return;

    addTransaction({
      type: txType,
      amount: amt,
      title: txTitle.trim(),
      category: txCategory,
      accountId: txAccountId,
      date: txDate,
      note: txNote.trim() || undefined,
    });

    setTxAmount('');
    setTxTitle('');
    setTxNote('');
    setTxModalOpen(false);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(accBalance);
    if (isNaN(bal) || !accName.trim()) return;

    addFinanceAccount({
      name: accName.trim(),
      type: accType,
      balance: bal,
      currency: currency,
      color: accType === 'savings' ? 'from-emerald-500 to-teal-600' : 'from-indigo-600 to-purple-600',
    });

    setAccName('');
    setAccBalance('');
    setAccountModalOpen(false);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTargetAmount);
    const curr = parseFloat(goalCurrentAmount) || 0;
    if (isNaN(target) || target <= 0 || !goalTitle.trim()) return;

    addSavingsGoal({
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: curr,
      targetDate: goalTargetDate,
      category: goalCategory,
      color: goalCategory === 'safety_cushion' ? 'emerald' : 'indigo',
    });

    setGoalTitle('');
    setGoalTargetAmount('');
    setGoalCurrentAmount('');
    setGoalModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForDeposit) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    contributeToSavingsGoal(selectedGoalForDeposit.id, amt, depositAccountId);
    setDepositAmount('');
    setDepositModalOpen(false);
    setSelectedGoalForDeposit(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Hero Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles size={14} className="animate-pulse" />
              <span>Финансовый баланс & Биохакинг благополучия</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
              Финансы и Капитал 💳
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Контролируйте денежные потоки, подушку безопасности, инвестиционные цели и бюджеты на здоровье и саморазвитие.
            </p>
          </div>

          {/* Right Toolbar: Currency Switcher & Quick Add Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Selector Pill */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs">
              {(['KZT', 'RUB', 'USD', 'EUR'] as CurrencyCode[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => setFinanceCurrency(cur)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition-all ${
                    currency === cur
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cur === 'KZT' ? '₸ KZT' : cur === 'RUB' ? '₽ RUB' : cur === 'USD' ? '$ USD' : '€ EUR'}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setTxType('expense');
                setTxModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
            >
              <Plus size={15} />
              <span>Новая операция</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid (4 Top Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Общий капитал (Net Worth)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums font-display">
              {formatCurrency(totalNetWorth, currency)}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>Счетов: {accounts.length}</span>
              <span className="text-emerald-500 font-medium flex items-center space-x-0.5">
                <TrendingUp size={12} />
                <span>+8.4% за месяц</span>
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Доходы за месяц</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums font-display">
              +{formatCurrency(monthlyIncome, currency)}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>Стабильный поток</span>
              <span className="text-slate-400 font-mono">Текущий месяц</span>
            </div>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Расходы за месяц</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums font-display">
              -{formatCurrency(monthlyExpense, currency)}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>В пределах лимитов</span>
              <span className="text-slate-400 font-mono">Контроль трат</span>
            </div>
          </div>
        </div>

        {/* Net Savings & Flow */}
        <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Свободный денежный поток</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 tabular-nums font-display">
              {netSavings >= 0 ? `+${formatCurrency(netSavings, currency)}` : formatCurrency(netSavings, currency)}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>Норма сбережений:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold font-mono">{savingsRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Financial Health & 50/30/20 Rule Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score & Emergency Fund (2 cols) */}
        <div className="lg:col-span-2 relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Индекс финансовой безопасности
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Анализ устойчивости к стрессам и готовности к непредвиденным расходам
                </p>
              </div>
            </div>
            <div className="flex items-baseline space-x-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80">
              <span className="text-xl font-extrabold font-mono">{healthScore}</span>
              <span className="text-xs opacity-75">/ 100</span>
            </div>
          </div>

          {/* Progress gauge bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Оценка устойчивости: <strong className="text-emerald-600 dark:text-emerald-400">Превосходная</strong></span>
              <span className="font-mono">{healthScore}%</span>
            </div>
            <div className="relative w-full bg-slate-100 dark:bg-slate-950/80 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 relative overflow-hidden"
                style={{ width: `${healthScore}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* 3 Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Подушка безопасности</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                {emergencyFundMonths} мес. автономии
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Доля накоплений</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {savingsRate}% от дохода
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Инвестиции & Капитал</span>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                {formatCurrency(totalNetWorth - emergencyFundTotal, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* 50/30/20 Rule Breakdown (1 col) */}
        <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display flex items-center space-x-1.5">
                <PieChart size={16} className="text-indigo-500" />
                <span>Правило 50 / 30 / 20</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                Идеально
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Золотой стандарт финансового баланса: базовые нужды, комфорт и инвестиции в будущее.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Обязательные нужды (Needs)</span>
                  <span className="font-mono font-semibold">45% <span className="text-slate-400 font-normal">/ 50%</span></span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Желания и комфорт (Wants)</span>
                  <span className="font-mono font-semibold">22% <span className="text-slate-400 font-normal">/ 30%</span></span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Сбережения и инвестиции (Savings)</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">33% <span className="text-slate-400 font-normal">/ 20%</span></span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '33%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Статус:</span>
            <span className="text-emerald-500 font-medium">Перевыполнение плана сбережений</span>
          </div>
        </div>
      </div>

      {/* 4. Accounts Section */}
      <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Мои счета и балансы
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Банковские карты, накопительные счета, брокерские аккаунты и наличные
            </p>
          </div>
          <button
            onClick={() => setAccountModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center space-x-1"
          >
            <Plus size={14} />
            <span>Добавить счет</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 capitalize">{acc.type}</span>
                <CreditCard size={16} className="text-indigo-500" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {acc.name}
                </h4>
                <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums font-mono mt-0.5">
                  {formatCurrency(acc.balance, currency)}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Валюта счета</span>
                <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{acc.currency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Budgets & Savings Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budgets Limit Tracker */}
        <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Месячные лимиты и бюджеты
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Контроль расходов по ключевым категориям
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {budgets.map((b) => {
              const pct = Math.min(100, Math.round((b.spentCurrentMonth / b.monthlyLimit) * 100));
              const isOver = b.spentCurrentMonth > b.monthlyLimit;

              return (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{b.categoryName}</span>
                    <span className="font-mono">
                      <strong className={isOver ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}>
                        {formatCurrency(b.spentCurrentMonth, currency)}
                      </strong>{' '}
                      <span className="text-slate-400">/ {formatCurrency(b.monthlyLimit, currency)}</span>
                    </span>
                  </div>

                  <div className="relative w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : pct > 80
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {isOver ? (
                        <span className="text-rose-500 font-medium">Перерасход на {formatCurrency(b.spentCurrentMonth - b.monthlyLimit, currency)}</span>
                      ) : (
                        <span>Осталось: {formatCurrency(b.monthlyLimit - b.spentCurrentMonth, currency)}</span>
                      )}
                    </span>
                    <span className="font-mono">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Savings Goals / Копилки */}
        <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Финансовые цели и копилки
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Накопления на подушку безопасности, ретрит и инвестиционный капитал
              </p>
            </div>
            <button
              onClick={() => setGoalModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Новая цель</span>
            </button>
          </div>

          <div className="space-y-3">
            {savingsGoals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));

              return (
                <div
                  key={g.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {g.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Срок: {new Date(g.targetDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedGoalForDeposit(g);
                        setDepositModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors"
                    >
                      + Пополнить
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatCurrency(g.currentAmount, currency)}
                      </span>
                      <span className="text-slate-400">
                        из {formatCurrency(g.targetAmount, currency)}
                      </span>
                    </div>

                    <div className="relative w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-emerald-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Накоплено: {pct}%</span>
                    <span>Осталось: {formatCurrency(Math.max(0, g.targetAmount - g.currentAmount), currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Transactions Feed & Filters */}
      <div className="relative overflow-hidden bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              История транзакций
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Полный аудит доходов и расходов по счетам
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
              />
            </div>

            {/* Type toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterType === 'expense'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Расходы
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterType === 'income'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Доходы
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table / List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <Wallet size={36} className="mx-auto mb-2 opacity-30 animate-pulse" />
            <p className="text-sm font-medium">Транзакций не найдено</p>
            <p className="text-xs text-slate-400 mt-1">Добавьте новую операцию или сбросьте фильтры поиска</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const account = accounts.find((a) => a.id === tx.accountId);

              return (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {tx.title}
                        </span>
                        {tx.tags?.map((t) => (
                          <span
                            key={t}
                            className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{new Date(tx.date).toLocaleDateString('ru-RU')}</span>
                        <span>·</span>
                        <span>{account?.name || 'Основной счет'}</span>
                        {tx.note && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-xs">{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 ml-3">
                    <span
                      className={`text-sm sm:text-base font-bold font-mono ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isIncome ? `+${formatCurrency(tx.amount, currency)}` : `-${formatCurrency(tx.amount, currency)}`}
                    </span>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      title="Удалить операцию"
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD TRANSACTION ================= */}
      {txModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Новая финансовая операция
              </h3>
              <button
                onClick={() => setTxModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    txType === 'expense'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Расход (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    txType === 'income'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Доход (+)
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Сумма операции ({currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Название операции *
                </label>
                <input
                  type="text"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  placeholder="Например: Аптека, витамины и добавки"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Category & Account */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Категория
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    {txType === 'expense'
                      ? EXPENSE_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.name}
                          </option>
                        ))
                      : INCOME_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.name}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Счет списания/пополнения
                  </label>
                  <select
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatCurrency(a.balance, currency)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Note */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Дата
                  </label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Заметка (опционально)
                  </label>
                  <input
                    type="text"
                    value={txNote}
                    onChange={(e) => setTxNote(e.target.value)}
                    placeholder="Чек, адрес..."
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTxModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all active:scale-95"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DEPOSIT TO SAVINGS GOAL ================= */}
      {depositModalOpen && selectedGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Пополнить копилку
            </h3>
            <p className="text-xs text-slate-500">
              Цель: <strong className="text-indigo-600 dark:text-indigo-400">{selectedGoalForDeposit.title}</strong>
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Сумма пополнения ({currency}) *
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Списать со счета
                </label>
                <select
                  value={depositAccountId}
                  onChange={(e) => setDepositAccountId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all"
                >
                  Внести
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD ACCOUNT ================= */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Добавить новый счет
            </h3>

            <form onSubmit={handleSaveAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Название счета *
                </label>
                <input
                  type="text"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Например: Депозит Halyk Bank"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Тип счета
                </label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="card">Банковская карта</option>
                  <option value="savings">Накопительный депозит</option>
                  <option value="investment">Инвестиционный счет</option>
                  <option value="cash">Наличные</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Текущий остаток ({currency}) *
                </label>
                <input
                  type="number"
                  value={accBalance}
                  onChange={(e) => setAccBalance(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all"
                >
                  Создать счет
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD SAVINGS GOAL ================= */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Новая финансовая цель
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Название цели *
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Например: Подушка безопасности"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Целевая сумма ({currency}) *
                  </label>
                  <input
                    type="number"
                    value={goalTargetAmount}
                    onChange={(e) => setGoalTargetAmount(e.target.value)}
                    placeholder="1000000"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Уже накоплено
                  </label>
                  <input
                    type="number"
                    value={goalCurrentAmount}
                    onChange={(e) => setGoalCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Категория
                </label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="safety_cushion">🛡️ Подушка безопасности</option>
                  <option value="investment">📈 Инвестиционный капитал</option>
                  <option value="health">🧘 Оздоровление и ретрит</option>
                  <option value="tech">💻 Оборудование и гаджеты</option>
                  <option value="vacation">✈️ Путешествие и отпуск</option>
                  <option value="other">🎯 Другое</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Целевой дедлайн
                </label>
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all"
                >
                  Создать цель
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
