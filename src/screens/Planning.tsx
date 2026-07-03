import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, animate, type Variants } from 'framer-motion'
import AppShell from '../components/AppShell'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import SectionHeader from '../components/SectionHeader'
import WeekSelector from '../components/WeekSelector'
import PlanningCourseCard from '../components/PlanningCourseCard'
import Modal from '../components/Modal'
import { GENERATED_COURSE } from '../mocks/courseData'
import { getCurrentWeekDays, getSessionDateLabel, getTodayISODate, getWeekLabel, formatShortDate } from '../utils/dates'

interface PlanningCourse {
  id: string
  title: string
  school: string
  dateLabel: string
  status: 'generated' | 'missing-brief' | 'to-prepare'
  targetDuration: string
  estimatedDuration?: string
}

interface PlanningProps {
  onOpenCourse: () => void
  onCalibrateProfile: () => void
  onAddBrief: () => void
  onCreateCourse: () => void
  isLoggedIn?: boolean
}

function DocIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="3" width="20" height="26" rx="3"/>
      <path d="M11 10h10M11 15h10M11 20h7"/>
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 3l2.4 7.2L26 12l-7.6 2.4L16 22l-2.4-7.6L6 12l7.6-2.8L16 3z"/>
    </svg>
  )
}

// Stagger entry configurations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    }
  }
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 18
    }
  }
}

export default function Planning({ onOpenCourse, onCalibrateProfile, onAddBrief, onCreateCourse, isLoggedIn }: PlanningProps) {
  const weekDays    = getCurrentWeekDays()
  const sessionDate = getSessionDateLabel()
  const todayDate   = getTodayISODate()
  const weekLabel   = getWeekLabel()

  const tue = new Date(weekDays[1].date + 'T12:00:00')
  const fri = new Date(weekDays[4].date + 'T12:00:00')

  // Live recalculation states
  const [estimatedMinutes, setEstimatedMinutes] = useState(132) // Starts at 2h12
  const [animatedMinutes, setAnimatedMinutes] = useState(132)
  const [suggestionAccepted, setSuggestionAccepted] = useState(false)

  // Animated odometer countdown
  useEffect(() => {
    const controls = animate(animatedMinutes, estimatedMinutes, {
      type: 'spring',
      stiffness: 70,
      damping: 16,
      onUpdate: (value) => setAnimatedMinutes(Math.round(value))
    })
    return () => controls.stop()
  }, [estimatedMinutes])

  const formatTime = (totalMin: number) => {
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${h}h${String(m).padStart(2, '0')}`
  }

  // Synchronized course plan
  const currentPlan = [
    { title: "Introduction aux concepts de l'IA", duration: '30 min' },
    { title: "Atelier pratique : prompt engineering", duration: suggestionAccepted ? '31 min' : '45 min' },
    { title: "Pause et networking", duration: '15 min' },
    { title: "Cas client : automatisation marketing", duration: '30 min' },
    { title: "Q&A et conclusion", duration: '12 min' },
  ]

  // Reactive State for courses list
  const [courses, setCourses] = useState<PlanningCourse[]>([
    { id: 'ia-marketing', title: 'IA & marketing digital',             school: 'ESD Bordeaux', dateLabel: sessionDate,                                       status: 'generated'      as const, estimatedDuration: '2h12', targetDuration: '2h00' },
    { id: 'data-viz',     title: 'Visualisation de données',           school: 'ESD Bordeaux', dateLabel: `${formatShortDate(tue)} · 14h00 – 16h00`,         status: 'missing-brief'  as const, targetDuration: '2h00' },
    { id: 'ml-intro',     title: 'Introduction au Machine Learning',   school: 'ESD Bordeaux', dateLabel: `${formatShortDate(fri)} · 09h00 – 11h00`,         status: 'to-prepare'     as const, targetDuration: '2h00' },
  ])

  // Synchronize dynamic duration changes in list state
  useEffect(() => {
    setCourses(prev =>
      prev.map(c =>
        c.id === 'ia-marketing'
          ? { ...c, estimatedDuration: formatTime(estimatedMinutes) }
          : c
      )
    )
  }, [estimatedMinutes])

  // UI View States
  const [viewMode, setViewMode] = useState<'timeline' | 'board'>('timeline')
  const [selectedCourse, setSelectedCourse] = useState('ia-marketing')
  const [selectedDate,   setSelectedDate]   = useState(todayDate)

  // Modals States
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBoardDetailModal, setShowBoardDetailModal] = useState(false)
  const [selectedBoardCourse, setSelectedBoardCourse] = useState<string | null>(null)

  // Form States for New Course
  const [newTitle, setNewTitle] = useState('')
  const [newSchool, setNewSchool] = useState('ESD Bordeaux')
  const [newDate, setNewDate] = useState('Lun 10 mars · 10h00 - 12h00')
  const [newStatus, setNewStatus] = useState<'generated' | 'missing-brief' | 'to-prepare'>('to-prepare')

  const course = GENERATED_COURSE
  const selected = courses.find(c => c.id === selectedCourse)

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newId = `course-${Date.now()}`
    const newCourseObj = {
      id: newId,
      title: newTitle,
      school: newSchool,
      dateLabel: newDate,
      status: newStatus,
      targetDuration: '2h00',
      estimatedDuration: newStatus === 'generated' ? '2h04' : undefined,
    }

    setCourses(prev => [...prev, newCourseObj])
    setSelectedCourse(newId)
    setNewTitle('')
    setShowAddModal(false)
  }

  function getPrimaryAction(status: typeof courses[0]['status']) {
    if (status === 'generated')     return { label: 'Ouvrir le cours',  action: onOpenCourse }
    if (status === 'missing-brief') return { label: 'Ajouter un brief', action: onAddBrief }
    return { label: 'Créer le cours', action: onCreateCourse }
  }

  function renderRightPanel() {
    if (!selected) return null

    if (selected.status === 'generated') {
      return (
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col gap-6 h-full border border-slate-100/50 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col gap-6 flex-1 h-full"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-ink tracking-tight">IA &amp; marketing digital</h2>
                  <p className="text-sm text-slate-500 font-semibold">{selected.school} · {sessionDate}</p>
                </div>
                <Badge label="Cours généré" variant="success" />
              </div>

              {/* Duration strip */}
              <div className="flex items-center gap-6 bg-slate-50/50 border border-slate-100/40 rounded-2xl p-5 flex-wrap shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Objectif</span>
                  <span className="text-xl font-extrabold text-ink leading-none">2h00</span>
                </div>
                <span className="text-slate-200 hidden sm:block">|</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estimation</span>
                  <span className="text-xl font-extrabold text-primary leading-none font-mono">
                    {formatTime(animatedMinutes)}
                  </span>
                </div>
                <span className="text-slate-200 hidden sm:block">|</span>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut Timing</span>
                  <div className="h-6 flex items-center">
                    {/* Morphing Status Pill */}
                    <motion.div
                      layout
                      className={`flex items-center px-3 py-1 rounded-full text-xs font-bold gap-1 border transition-colors duration-500 shadow-sm ${
                        animatedMinutes > 120
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}
                    >
                      <motion.span
                        key={animatedMinutes > 120 ? 'depassement' : 'maitrise'}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {animatedMinutes > 120 ? 'DÉPASSEMENT (+12 min)' : 'TIMING MAÎTRISÉ'}
                      </motion.span>
                    </motion.div>
                  </div>
                </div>
                <div className="ml-auto">
                  <Button variant="secondary" size="sm" onClick={onCalibrateProfile}>
                    Calibrer mon profil
                  </Button>
                </div>
              </div>

              {/* Suggestion IA Bento Widget */}
              <AnimatePresence>
                {!suggestionAccepted && selected.id === 'ia-marketing' && (
                  <motion.div
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92, y: 15 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                    className="bg-gradient-to-r from-primary/5 to-indigo-50/60 border border-primary/10 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg flex-shrink-0 shadow-inner">
                        🪄
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-ink leading-tight">Optimisation IA Disponible</h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
                          L'atelier pratique déborde. Réduire l'exercice de 14 min pour respecter le timing cible.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setEstimatedMinutes(118)
                        setSuggestionAccepted(true)
                      }}
                      className="flex-shrink-0 shadow-sm"
                    >
                      Accepter (-14 MIN)
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Plan du cours */}
              <div className="flex-1 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Plan du cours</p>
                <div className="space-y-1">
                  {currentPlan.map((section, index) => (
                    <div key={section.title} className="flex items-center gap-4 py-3.5 px-4 border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 rounded-2xl transition-all duration-300 ease-out group">
                      <span className="text-xs font-bold text-slate-300 w-5 flex-shrink-0 font-mono tracking-tight group-hover:text-primary transition-colors duration-300">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm text-slate-700 flex-1 leading-snug font-semibold">{section.title}</span>
                      <span className="text-sm font-extrabold text-primary flex-shrink-0">{section.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom actions */}
              <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(getTodayISODate())}>← Voir toutes les semaines</Button>
                <Button variant="primary" size="md" onClick={onOpenCourse}>Ouvrir le cours →</Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )
    }

    if (selected.status === 'missing-brief') {
      return (
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgba(15,23,42,0.04)] h-full flex flex-col items-center justify-center text-center gap-6 border border-slate-100/50 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col items-center justify-center text-center gap-6 flex-1 h-full"
            >
              <div className="text-slate-300 bg-slate-50 p-6 rounded-full shadow-inner"><DocIcon /></div>
              <div>
                <p className="text-lg font-extrabold text-ink mb-1 tracking-tight">Brief manquant</p>
                <p className="text-sm text-slate-500 font-semibold leading-relaxed">Ajoutez un brief pour générer ce cours.</p>
              </div>
              <Button variant="primary" size="lg" onClick={onAddBrief}>Ajouter un brief</Button>
            </motion.div>
          </AnimatePresence>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgba(15,23,42,0.04)] h-full flex flex-col items-center justify-center text-center gap-6 border border-slate-100/50 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-col items-center justify-center text-center gap-6 flex-1 h-full"
          >
            <div className="text-slate-300 bg-slate-50 p-6 rounded-full shadow-inner"><SparkleIcon /></div>
            <div>
              <p className="text-lg font-extrabold text-ink mb-1 tracking-tight">Cours à préparer</p>
              <p className="text-sm text-slate-500 font-semibold leading-relaxed">Commencez par définir le type de cours et importer votre brief.</p>
            </div>
            <Button variant="primary" size="lg" onClick={onCreateCourse}>Créer ce cours</Button>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // Kanban view Column Renderer
  const renderBoardColumn = (title: string, status: 'to-prepare' | 'missing-brief' | 'generated', badgeVariant: 'neutral' | 'warning' | 'success') => {
    const filteredCourses = courses.filter(c => c.status === status)
    return (
      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col h-full border border-slate-100/50 min-h-[480px]">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-ink tracking-tight">{title}</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full shadow-inner">
              {filteredCourses.length}
            </span>
          </div>
          <Badge label={status === 'generated' ? 'Prêt' : 'Action requis'} variant={badgeVariant} />
        </div>

        {/* List of Cards */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center opacity-65">
              <span className="text-3xl mb-2">📁</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aucun cours</p>
            </div>
          ) : (
            filteredCourses.map(c => {
              const { label, action } = getPrimaryAction(c.status)
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedBoardCourse(c.id)
                    setShowBoardDetailModal(true)
                  }}
                  className="group relative"
                >
                  <PlanningCourseCard
                    title={c.title}
                    school={c.school}
                    dateLabel={c.dateLabel}
                    status={c.status}
                    estimatedDuration={c.id === 'ia-marketing' ? formatTime(estimatedMinutes) : ('estimatedDuration' in c ? c.estimatedDuration : undefined)}
                    targetDuration={c.targetDuration}
                    isSelected={false}
                    onClick={undefined}
                    primaryActionLabel={label}
                    onPrimaryAction={action}
                  />
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // Selected Board Course Details for Modal
  const boardSelectedObj = courses.find(c => c.id === selectedBoardCourse)

  return (
    <AppShell activeSidebarItem="planning" stepLabel="Mon planning" showDemoStatus={true} isLoggedIn={isLoggedIn} userInitials="JB" userName="Julien">
      <div className="flex flex-col gap-6 h-full">

        {/* Header Row with View Toggles and Add Button */}
        <SectionHeader
          eyebrow={weekLabel}
          title="Planning Pédagogique"
          subtitle={`${courses.length} interventions planifiées`}
          className="mb-2"
          action={
            <div className="flex items-center gap-4">
              {/* Sliding Toggle View Selector */}
              <div className="bg-slate-100 p-1 rounded-full flex items-center shadow-inner">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    viewMode === 'timeline'
                      ? 'bg-white text-primary shadow-sm scale-105'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Vue Semaine
                </button>
                <button
                  onClick={() => setViewMode('board')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                    viewMode === 'board'
                      ? 'bg-white text-primary shadow-sm scale-105'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Vue Statut (Kanban)
                </button>
              </div>

              {/* Add Course Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 shadow-sm shadow-primary/20"
              >
                <span className="text-sm font-black">+</span>
                <span>Intervention</span>
              </Button>
            </div>
          }
        />

        {/* Dynamic interchangeable views with cascade loaders */}
        {viewMode === 'timeline' ? (
          /* Vue Chronologique Staggered */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 gap-6 flex-1 min-h-0"
          >
            {/* Left Column Bento Container */}
            <motion.div
              variants={cardVariants}
              className="col-span-1 bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col h-full border border-slate-100/50"
            >
              <WeekSelector days={weekDays} selectedDate={selectedDate} onSelectDate={setSelectedDate} className="mb-6" />
              <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
                {courses.map(c => {
                  const { label, action } = getPrimaryAction(c.status)
                  return (
                    <PlanningCourseCard
                      key={c.id}
                      title={c.title}
                      school={c.school}
                      dateLabel={c.dateLabel}
                      status={c.status}
                      estimatedDuration={c.id === 'ia-marketing' ? formatTime(estimatedMinutes) : ('estimatedDuration' in c ? c.estimatedDuration : undefined)}
                      targetDuration={c.targetDuration}
                      isSelected={selectedCourse === c.id}
                      onClick={() => setSelectedCourse(c.id)}
                      primaryActionLabel={label}
                      onPrimaryAction={action}
                    />
                  )
                })}
              </div>
            </motion.div>

            {/* Right Column Bento Details */}
            <motion.div variants={cardVariants} className="col-span-2">
              {renderRightPanel()}
            </motion.div>
          </motion.div>
        ) : (
          /* Vue Kanban Board Staggered */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0"
          >
            <motion.div variants={cardVariants}>
              {renderBoardColumn('À préparer', 'to-prepare', 'neutral')}
            </motion.div>
            <motion.div variants={cardVariants}>
              {renderBoardColumn('Brief manquant', 'missing-brief', 'warning')}
            </motion.div>
            <motion.div variants={cardVariants}>
              {renderBoardColumn('Cours généré', 'generated', 'success')}
            </motion.div>
          </motion.div>
        )}

      </div>

      {/* Add Course Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter une intervention">
        <form onSubmit={handleAddCourseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Intitulé de l'intervention</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="ex: Design System Avancé"
              className="w-full border border-slate-200 bg-slate-50/20 rounded-btn px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/80 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">École / Organisme</label>
            <input
              type="text"
              required
              value={newSchool}
              onChange={e => setNewSchool(e.target.value)}
              placeholder="ex: ESD Bordeaux"
              className="w-full border border-slate-200 bg-slate-50/20 rounded-btn px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/80 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date et Horaires</label>
            <input
              type="text"
              required
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              placeholder="ex: Ven 15 mars · 14h00 - 16h00"
              className="w-full border border-slate-200 bg-slate-50/20 rounded-btn px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/80 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Statut de départ</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as any)}
              className="w-full border border-slate-200 bg-slate-50/20 rounded-btn px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/80 transition-all duration-300"
            >
              <option value="to-prepare">À préparer</option>
              <option value="missing-brief">Brief manquant</option>
              <option value="generated">Cours généré</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-3">
            <Button variant="secondary" onClick={() => setShowAddModal(false)} fullWidth>Annuler</Button>
            <Button variant="primary" type="submit" fullWidth>Enregistrer</Button>
          </div>
        </form>
      </Modal>

      {/* Board Course Detail Drawer Modal */}
      <Modal
        open={showBoardDetailModal}
        onClose={() => setShowBoardDetailModal(false)}
        title={boardSelectedObj ? boardSelectedObj.title : "Détails de l'intervention"}
      >
        {boardSelectedObj && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-bold">{boardSelectedObj.school}</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{boardSelectedObj.dateLabel}</p>
              </div>
              <Badge
                label={boardSelectedObj.status === 'generated' ? 'Prêt' : boardSelectedObj.status === 'missing-brief' ? 'Brief manquant' : 'À préparer'}
                variant={boardSelectedObj.status === 'generated' ? 'success' : boardSelectedObj.status === 'missing-brief' ? 'warning' : 'neutral'}
              />
            </div>

            {boardSelectedObj.status === 'generated' && (
              <>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl shadow-sm border border-slate-100/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Objectif</span>
                    <span className="text-base font-extrabold text-ink">2h00</span>
                  </div>
                  <span className="text-slate-200">|</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estimation</span>
                    <span className="text-base font-extrabold text-primary font-mono">
                      {boardSelectedObj.id === 'ia-marketing' ? formatTime(animatedMinutes) : ('estimatedDuration' in boardSelectedObj ? boardSelectedObj.estimatedDuration : undefined)}
                    </span>
                  </div>
                  <span className="text-slate-200">|</span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Débit</span>
                    <span className="text-xs font-bold text-slate-500">Non calibré</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Aperçu du plan de cours</p>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {currentPlan.map((section, index) => (
                      <div key={section.title} className="flex items-center gap-2 py-2 px-3 border-b border-slate-50 last:border-0 text-xs rounded-xl hover:bg-slate-50">
                        <span className="font-bold text-slate-300 font-mono">{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-slate-700 flex-1 truncate font-medium">{section.title}</span>
                        <span className="font-extrabold text-primary">{section.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setShowBoardDetailModal(false)} fullWidth>Fermer</Button>
              {boardSelectedObj.status === 'generated' ? (
                <Button variant="primary" onClick={() => { setShowBoardDetailModal(false); onOpenCourse(); }} fullWidth>Ouvrir le cours →</Button>
              ) : boardSelectedObj.status === 'missing-brief' ? (
                <Button variant="primary" onClick={() => { setShowBoardDetailModal(false); onAddBrief(); }} fullWidth>Ajouter un brief</Button>
              ) : (
                <Button variant="primary" onClick={() => { setShowBoardDetailModal(false); onCreateCourse(); }} fullWidth>Créer le cours</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  )
}
