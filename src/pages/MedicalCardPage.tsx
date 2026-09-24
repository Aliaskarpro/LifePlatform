import React, { useState } from 'react';
import { 
  FileHeart, 
  AlertTriangle, 
  Pill, 
  FileText, 
  Stethoscope, 
  Plus, 
  Trash2, 
  Lock, 
  ShieldCheck, 
  CheckCircle,
  Calendar,
  Building,
  User,
  Activity,
  FileCheck
} from 'lucide-react';
import { useLifeStore } from '../store/lifeStore';

type SectionKey = 'chronic' | 'allergies' | 'past' | 'medications' | 'labs' | 'visits';

export const MedicalCardPage: React.FC = () => {
  const {
    chronicConditions,
    addChronicCondition,
    deleteChronicCondition,
    allergies,
    addAllergy,
    deleteAllergy,
    pastIllnesses,
    addPastIllness,
    deletePastIllness,
    medications,
    addMedication,
    toggleMedicationActive,
    deleteMedication,
    labResults,
    addLabResult,
    deleteLabResult,
    doctorVisits,
    addDoctorVisit,
    deleteDoctorVisit
  } = useLifeStore();

  const [activeSection, setActiveSection] = useState<SectionKey>('medications');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);

  // Forms state
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('1 раз в день');
  const [medNotes, setMedNotes] = useState('');

  const [allergyName, setAllergyName] = useState('');
  const [allergyReaction, setAllergyReaction] = useState('');
  const [allergySeverity, setAllergySeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');

  const [chronicTitle, setChronicTitle] = useState('');
  const [chronicSeverity, setChronicSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [chronicNotes, setChronicNotes] = useState('');

  const [pastTitle, setPastTitle] = useState('');
  const [pastYear, setPastYear] = useState('2020');
  const [pastNotes, setPastNotes] = useState('');

  const [labName, setLabName] = useState('');
  const [labValue, setLabValue] = useState('');
  const [labUnit, setLabUnit] = useState('');
  const [labRef, setLabRef] = useState('');
  const [labClinic, setLabClinic] = useState('');

  const [doctorName, setDoctorName] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [doctorClinic, setDoctorClinic] = useState('');
  const [doctorDiagnosis, setDoctorDiagnosis] = useState('');
  const [doctorRecs, setDoctorRecs] = useState('');

  const handleOpenAdd = () => {
    setModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];

    if (activeSection === 'medications') {
      if (medName) {
        addMedication({
          name: medName,
          dosage: medDosage || 'По назначению',
          frequency: medFrequency,
          timeOfDay: ['morning'],
          startDate: todayStr,
          isActive: true,
          notes: medNotes,
        });
        setMedName('');
        setMedDosage('');
        setMedNotes('');
      }
    } else if (activeSection === 'allergies') {
      if (allergyName) {
        addAllergy({
          allergen: allergyName,
          reaction: allergyReaction || 'Аллергическая реакция',
          severity: allergySeverity,
          diagnosedYear: new Date().getFullYear().toString(),
        });
        setAllergyName('');
        setAllergyReaction('');
      }
    } else if (activeSection === 'chronic') {
      if (chronicTitle) {
        addChronicCondition({
          title: chronicTitle,
          diagnosisDate: todayStr,
          severity: chronicSeverity,
          status: 'controlled',
          notes: chronicNotes,
        });
        setChronicTitle('');
        setChronicNotes('');
      }
    } else if (activeSection === 'past') {
      if (pastTitle) {
        addPastIllness({
          title: pastTitle,
          year: pastYear,
          notes: pastNotes,
        });
        setPastTitle('');
        setPastNotes('');
      }
    } else if (activeSection === 'labs') {
      if (labName) {
        addLabResult({
          date: todayStr,
          testName: labName,
          category: 'blood',
          value: labValue,
          unit: labUnit,
          referenceRange: labRef || 'В норме',
          isNormal: true,
          clinic: labClinic || 'Лаборатория',
        });
        setLabName('');
        setLabValue('');
        setLabUnit('');
        setLabRef('');
      }
    } else if (activeSection === 'visits') {
      if (doctorName && doctorDiagnosis) {
        addDoctorVisit({
          date: todayStr,
          doctorName,
          specialty: doctorSpecialty || 'Врач',
          clinic: doctorClinic || 'Клиника',
          diagnosis: doctorDiagnosis,
          recommendations: doctorRecs || 'Рекомендации соблюдены',
        });
        setDoctorName('');
        setDoctorDiagnosis('');
        setDoctorRecs('');
      }
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={14} />
            <span>Конфиденциальный медицинский профиль</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Персональная медицинская карта
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Хранение истории болезней, аллергий, курсов препаратов, лабораторных анализов и посещений врачей.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 text-xs self-start sm:self-auto">
          <Lock size={13} />
          <span>Доступ только владельцу профиля</span>
        </div>
      </div>

      {/* Navigation tabs for sections */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => setActiveSection('medications')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeSection === 'medications'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Pill size={14} />
          <span>Препараты и курсы ({medications.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('allergies')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeSection === 'allergies'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle size={14} />
          <span>Аллергии ({allergies.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('chronic')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeSection === 'chronic'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={14} />
          <span>Хронические диагнозы ({chronicConditions.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('past')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeSection === 'past'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={14} />
          <span>Перенесенные болезни ({pastIllnesses.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('labs')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeSection === 'labs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck size={14} />
          <span>Анализы и чекапы ({labResults.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('visits')}
          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeSection === 'visits'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Stethoscope size={14} />
          <span>Визиты к врачам ({doctorVisits.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">
              {activeSection === 'medications' && 'Принимаемые лекарства и витаминные курсы'}
              {activeSection === 'allergies' && 'Аллергические реакции и непереносимости'}
              {activeSection === 'chronic' && 'Хронические заболевания под наблюдением'}
              {activeSection === 'past' && 'Перенесенные заболевания и хирургические операции'}
              {activeSection === 'labs' && 'Результаты лабораторных исследований'}
              {activeSection === 'visits' && 'Записи консультаций и осмотров врачей'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Поддерживайте актуальность записей для качественного медицинского сопровождения
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center space-x-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Добавить запись</span>
          </button>
        </div>

        {/* 1. Medications list */}
        {activeSection === 'medications' && (
          <div className="space-y-3">
            {medications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Нет активных курсов лекарств</p>
            ) : (
              medications.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white">{med.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        med.isActive ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {med.isActive ? 'Активный курс' : 'Завершен'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                      <span>Дозировка: <strong className="text-slate-200">{med.dosage}</strong></span>
                      <span>·</span>
                      <span>Частота: <strong className="text-slate-200">{med.frequency}</strong></span>
                      {med.prescribedBy && (
                        <>
                          <span>·</span>
                          <span>Назначил: {med.prescribedBy}</span>
                        </>
                      )}
                    </div>
                    {med.notes && <p className="text-xs text-slate-500 pt-1">{med.notes}</p>}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => toggleMedicationActive(med.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {med.isActive ? 'Завершить курс' : 'Возобновить'}
                    </button>
                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. Allergies list */}
        {activeSection === 'allergies' && (
          <div className="space-y-3">
            {allergies.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Аллергии не зарегистрированы</p>
            ) : (
              allergies.map((al) => (
                <div
                  key={al.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white">{al.allergen}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        al.severity === 'severe'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                      }`}>
                        {al.severity === 'severe' ? 'Высокая опасность' : 'Умеренная'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">Реакция: {al.reaction}</p>
                    {al.notes && <p className="text-xs text-slate-500">{al.notes}</p>}
                  </div>
                  <button
                    onClick={() => deleteAllergy(al.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. Chronic conditions */}
        {activeSection === 'chronic' && (
          <div className="space-y-3">
            {chronicConditions.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">{c.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-950/60 text-indigo-400 border border-indigo-800/50">
                      Статус: {c.status}
                    </span>
                  </div>
                  {c.doctor && <p className="text-xs text-slate-400">Наблюдающий врач: {c.doctor}</p>}
                  {c.notes && <p className="text-xs text-slate-400">{c.notes}</p>}
                </div>
                <button
                  onClick={() => deleteChronicCondition(c.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 4. Past illnesses */}
        {activeSection === 'past' && (
          <div className="space-y-3">
            {pastIllnesses.map((pi) => (
              <div
                key={pi.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">{pi.title}</span>
                    <span className="text-xs text-slate-400 font-mono">({pi.year} г.)</span>
                  </div>
                  {pi.hospital && <p className="text-xs text-slate-400">Медучреждение: {pi.hospital}</p>}
                  {pi.notes && <p className="text-xs text-slate-500">{pi.notes}</p>}
                </div>
                <button
                  onClick={() => deletePastIllness(pi.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 5. Lab results */}
        {activeSection === 'labs' && (
          <div className="space-y-3">
            {labResults.map((lab) => (
              <div
                key={lab.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">{lab.testName}</span>
                    <span className="text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded font-mono">
                      Норма
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Значение: <strong className="text-white">{lab.value}</strong> {lab.unit}
                    <span className="text-slate-500 ml-2">(Референс: {lab.referenceRange})</span>
                  </p>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-2 pt-1">
                    <span>{new Date(lab.date).toLocaleDateString('ru-RU')}</span>
                    {lab.clinic && (
                      <>
                        <span>·</span>
                        <span>{lab.clinic}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteLabResult(lab.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 6. Doctor visits */}
        {activeSection === 'visits' && (
          <div className="space-y-3">
            {doctorVisits.map((dv) => (
              <div
                key={dv.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">{dv.specialty}</span>
                    <span className="text-xs text-slate-400">· {dv.doctorName}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong>Диагноз:</strong> {dv.diagnosis}
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong>Рекомендации:</strong> {dv.recommendations}
                  </p>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-2 pt-1">
                    <span className="font-mono">{new Date(dv.date).toLocaleDateString('ru-RU')}</span>
                    <span>·</span>
                    <span>{dv.clinic}</span>
                    {dv.nextVisitDate && (
                      <>
                        <span>·</span>
                        <span className="text-indigo-400">
                          Следующий визит: {new Date(dv.nextVisitDate).toLocaleDateString('ru-RU')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteDoctorVisit(dv.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unified Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Добавить запись в медицинскую карту</h3>
            <form onSubmit={handleSaveModal} className="space-y-3">
              {activeSection === 'medications' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Название препарата / БАДа
                    </label>
                    <input
                      type="text"
                      placeholder="Магний B6, Омега-3 и т.д."
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Дозировка</label>
                    <input
                      type="text"
                      placeholder="1 таб. / 500 мг"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Периодичность приема
                    </label>
                    <input
                      type="text"
                      placeholder="1 раз в день утром"
                      value={medFrequency}
                      onChange={(e) => setMedFrequency(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {activeSection === 'allergies' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Аллерген / вещество
                    </label>
                    <input
                      type="text"
                      placeholder="Пенициллин, орехи, пыльца..."
                      value={allergyName}
                      onChange={(e) => setAllergyName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Характер реакции
                    </label>
                    <input
                      type="text"
                      placeholder="Крапивница, отек, ринит..."
                      value={allergyReaction}
                      onChange={(e) => setAllergyReaction(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {activeSection === 'chronic' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Диагноз / заболевание
                    </label>
                    <input
                      type="text"
                      placeholder="Поллиноз, гипертония 1 ст..."
                      value={chronicTitle}
                      onChange={(e) => setChronicTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Особенности и поддерживающая терапия
                    </label>
                    <input
                      type="text"
                      placeholder="Периоды обострения, диета..."
                      value={chronicNotes}
                      onChange={(e) => setChronicNotes(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {activeSection === 'past' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Заболевание или операция
                    </label>
                    <input
                      type="text"
                      placeholder="Аппендэктомия, пневмония..."
                      value={pastTitle}
                      onChange={(e) => setPastTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Год</label>
                    <input
                      type="text"
                      placeholder="2018"
                      value={pastYear}
                      onChange={(e) => setPastYear(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              {activeSection === 'labs' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Название анализа
                    </label>
                    <input
                      type="text"
                      placeholder="Общий анализ крови, Витамин D..."
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Значение</label>
                      <input
                        type="text"
                        placeholder="148"
                        value={labValue}
                        onChange={(e) => setLabValue(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Ед. изм.</label>
                      <input
                        type="text"
                        placeholder="г/л, ммоль/л..."
                        value={labUnit}
                        onChange={(e) => setLabUnit(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'visits' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      ФИО врача
                    </label>
                    <input
                      type="text"
                      placeholder="Д-р Смирнова Е.В."
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Специализация
                    </label>
                    <input
                      type="text"
                      placeholder="Терапевт, кардиолог, невролог..."
                      value={doctorSpecialty}
                      onChange={(e) => setDoctorSpecialty(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Заключение / диагноз
                    </label>
                    <input
                      type="text"
                      placeholder="Осмотр проведен, патологий не выявлено"
                      value={doctorDiagnosis}
                      onChange={(e) => setDoctorDiagnosis(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
