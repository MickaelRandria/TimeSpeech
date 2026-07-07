import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/AppShell'
import ChatMessage from '../components/ChatMessage'
import AnswerPill from '../components/AnswerPill'

type Level = 'Débutant' | 'Intermédiaire' | 'Avancé'
type CourseType = 'Théorique' | 'Pratique' | 'Mixte'

interface AIRefinementProps {
  duration: string
  level: Level
  type: CourseType
  onDurationChange: (v: string) => void
  onLevelChange: (v: Level) => void
  onTypeChange: (v: CourseType) => void
  onGenerate: () => void
  onBack: () => void
  isLoggedIn?: boolean
}

const Q1 = ['Cours présentiel', 'Capsule vidéo', 'Formation à distance'] as const
const Q2 = ['Atelier pratique', 'Cours magistral', 'Séminaire workshop'] as const
const Q3 = ['Maîtriser des outils IA', 'Comprendre les enjeux', 'Développer des compétences'] as const

interface PlanSection {
  id: string
  title: string
  duration: string
  slides: number
  icon: string
  isNew?: boolean
}

const BASE: PlanSection[] = [
  { id: 'intro',     title: "Introduction à l'IA générative",  duration: '10 min', slides: 3, icon: '🧠' },
  { id: 'marketing', title: "L'IA au service du marketing",     duration: '30 min', slides: 8, icon: '📊' },
  { id: 'contenu',   title: 'Création de contenu assistée',    duration: '35 min', slides: 6, icon: '✍️' },
  { id: 'cas',       title: 'Cas pratique : campagne IA',      duration: '30 min', slides: 7, icon: '🎯' },
  { id: 'synthese',  title: 'Synthèse et prise en main',       duration: '13 min', slides: 4, icon: '✅' },
]

function computePlan(
  q1: string | null,
  q2: string | null,
  q3: string | null,
): PlanSection[] {
  const s = BASE.map(x => ({ ...x, isNew: false }))

  if (q1 === 'Formation à distance') {
    s.splice(1, 0, { id: 'collab', title: 'Outils collaboratifs online', duration: '15 min', slides: 4, icon: '🤝', isNew: true })
  } else if (q1 === 'Capsule vidéo') {
    s[0] = { id: 'intro-condensed', title: 'Intro IA générative (condensée)', duration: '8 min', slides: 2, icon: '🎬', isNew: true }
  }

  if (q2 === 'Atelier pratique') {
    const synthIdx = s.findIndex(x => x.id === 'synthese')
    s.splice(synthIdx, 0, { id: 'atelier', title: 'Exercices live & prise en main', duration: '20 min', slides: 5, icon: '⚙️', isNew: true })
  } else if (q2 === 'Séminaire workshop') {
    const casIdx = s.findIndex(x => x.id === 'cas')
    if (casIdx !== -1) s[casIdx] = { id: 'workshop', title: 'Workshop interactif', duration: '35 min', slides: 9, icon: '🎪', isNew: true }
  }

  if (q3 === 'Maîtriser des outils IA') {
    const synthIdx = s.findIndex(x => x.id === 'synthese')
    s.splice(synthIdx, 0, { id: 'outils', title: 'Prise en main des outils IA', duration: '18 min', slides: 5, icon: '🔧', isNew: true })
  } else if (q3 === 'Développer des compétences') {
    s.push({ id: 'skills', title: 'Workshop compétences métier', duration: '15 min', slides: 4, icon: '💡', isNew: true })
  }

  return s
}

function computeStats(sections: PlanSection[]) {
  const totalSlides = sections.reduce((a, s) => a + s.slides, 0)
  const totalMin = sections.reduce((a, s) => {
    const n = parseInt(s.duration.split(' ')[0], 10)
    return a + n
  }, 0)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return {
    totalSlides,
    est: h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m} min`,
    modules: sections.length,
  }
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-8 h-8 rounded-xl bg-slate-100/80 animate-pulse flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-2.5 rounded-full bg-slate-100/80 animate-pulse" style={{ width: `${55 + Math.random() * 30}%` }} />
        <div className="h-1.5 rounded-full bg-slate-100/80 animate-pulse w-1/3" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <div className="h-2 rounded-full bg-slate-100/80 animate-pulse w-10" />
        <div className="h-1.5 rounded-full bg-slate-100/80 animate-pulse w-8" />
      </div>
    </div>
  )
}

export default function AIRefinement({ onGenerate, onBack, isLoggedIn }: AIRefinementProps) {
  const [phase, setPhase]     = useState(0)
  const [answer1, setAnswer1] = useState<string | null>(null)
  const [answer2, setAnswer2] = useState<string | null>(null)
  const [answer3, setAnswer3] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState<PlanSection[]>(BASE.map(x => ({ ...x, isNew: false })))
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase > 0) {
      const t = setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120)
      return () => clearTimeout(t)
    }
  }, [phase])

  function triggerUpdate(q1: string | null, q2: string | null, q3: string | null) {
    setIsLoading(true)
    setTimeout(() => {
      const newPlan = computePlan(q1, q2, q3)
      setPlan(newPlan)
      const ids = new Set(newPlan.filter(s => s.isNew).map(s => s.id))
      setNewIds(ids)
      setIsLoading(false)
      setTimeout(() => setNewIds(new Set()), 2200)
    }, 820)
  }

  function pick1(val: string) {
    setAnswer1(val)
    triggerUpdate(val, answer2, answer3)
    setTimeout(() => setPhase(1), 380)
  }
  function pick2(val: string) {
    setAnswer2(val)
    triggerUpdate(answer1, val, answer3)
    setTimeout(() => setPhase(2), 380)
  }
  function pick3(val: string) {
    setAnswer3(val)
    triggerUpdate(answer1, answer2, val)
    setTimeout(() => setPhase(3), 380)
  }

  const stats = computeStats(plan)

  return (
    <AppShell
      activeSidebarItem="ia"
      stepLabel="Dialogue IA"
      showDemoStatus
      stepProgress="Étape 3 sur 6"
      isLoggedIn={isLoggedIn}
      userInitials="JB"
      userName="Julien"
    >
      {/* Split-screen: left chat (44%) + right live preview (56%) */}
      <div className="flex gap-6 h-full min-h-0">

        {/* ── LEFT: AI Chat column ── */}
        <div className="w-[44%] flex flex-col gap-5 overflow-y-auto pb-10 pr-1 min-h-0">
          <button
            onClick={onBack}
            className="self-start flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            <span>←</span> Retour
          </button>

          <ChatMessage text="Bonjour, Julien ! J'ai analysé votre brief sur l'IA Marketing — un brief très riche. Pour générer un cours précisément calibré sur votre créneau de 2h00, j'ai besoin de vous poser 3 questions rapides." />

          <ChatMessage text="Pour quel usage principal préparez-vous ce cours ?">
            <div className="flex flex-wrap gap-2 mt-3">
              {Q1.map(opt => (
                <AnswerPill
                  key={opt}
                  label={opt}
                  selected={answer1 === opt}
                  disabled={answer1 !== null && answer1 !== opt}
                  onClick={() => { if (!answer1) pick1(opt) }}
                />
              ))}
            </div>
          </ChatMessage>

          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                key="q2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <ChatMessage text="Quelle est la nature principale de la session ?">
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Q2.map(opt => (
                      <AnswerPill
                        key={opt}
                        label={opt}
                        selected={answer2 === opt}
                        disabled={answer2 !== null && answer2 !== opt}
                        onClick={() => { if (!answer2) pick2(opt) }}
                      />
                    ))}
                  </div>
                </ChatMessage>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                key="q3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <ChatMessage text="Quel est l'objectif pédagogique principal de vos étudiants ?">
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Q3.map(opt => (
                      <AnswerPill
                        key={opt}
                        label={opt}
                        selected={answer3 === opt}
                        disabled={answer3 !== null && answer3 !== opt}
                        onClick={() => { if (!answer3) pick3(opt) }}
                      />
                    ))}
                  </div>
                </ChatMessage>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                key="cta"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="pt-2"
              >
                <button
                  onClick={onGenerate}
                  className="w-full px-6 py-3.5 bg-primary text-white rounded-btn font-bold text-sm shadow-glow hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(90,87,255,0.35)] active:scale-[0.98] transition-all duration-200"
                >
                  Générer le cours calibré →
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>

        {/* ── RIGHT: Live Preview panel ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Sticky inner wrapper so preview stays visible as left column scrolls */}
          <div className="sticky top-0 flex flex-col gap-3">

            {/* Status chip row */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Aperçu en direct
              </span>
              <AnimatePresence>
                {isLoading && (
                  <motion.span
                    key="updating"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    className="text-[10px] font-semibold text-slate-400"
                  >
                    Mise à jour…
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {!isLoading && answer1 && (
                  <motion.span
                    key="updated"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5"
                  >
                    ✓ Mis à jour
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Preview card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">

              {/* Course header */}
              <div className="px-5 pt-5 pb-4 border-b border-slate-50 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">ESD Bordeaux</p>
                    <h2 className="text-[15px] font-extrabold text-ink leading-tight tracking-tight">IA & Marketing Digital</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Cible : 2h00 · Niveau Intermédiaire</p>
                  </div>
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-lg">
                    🎓
                  </div>
                </div>
              </div>

              {/* Stats bar */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="stats-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex border-b border-slate-50"
                  >
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`flex-1 px-4 py-3 ${i > 0 ? 'border-l border-slate-50' : ''}`}>
                        <div className="h-1.5 bg-slate-100 rounded-full animate-pulse mb-2 w-2/3 mx-auto" />
                        <div className="h-3 bg-slate-100 rounded-full animate-pulse w-1/2 mx-auto" />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="stats-live"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex border-b border-slate-50"
                  >
                    {[
                      { label: 'Durée estimée', value: stats.est },
                      { label: 'Slides', value: String(stats.totalSlides) },
                      { label: 'Modules', value: String(stats.modules) },
                    ].map((stat, i) => (
                      <div key={stat.label} className={`flex-1 px-4 py-3 text-center ${i > 0 ? 'border-l border-slate-50' : ''}`}>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                        <motion.p
                          key={stat.value}
                          initial={{ y: -6, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-sm font-black text-ink"
                        >
                          {stat.value}
                        </motion.p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Section rows with shimmer overlay */}
              <div className="relative">
                {/* Shimmer overlay */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      key="shimmer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 z-10 bg-white/75 backdrop-blur-[1.5px] flex flex-col divide-y divide-slate-50/70"
                    >
                      {Array.from({ length: plan.length + 1 }).map((_, i) => (
                        <SkeletonRow key={i} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Real rows */}
                <div className="flex flex-col divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {plan.map((section, idx) => {
                      const isHighlighted = newIds.has(section.id)
                      return (
                        <motion.div
                          key={section.id}
                          layout
                          initial={{ opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{
                            layout: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.22 },
                            x: { type: 'spring', stiffness: 280, damping: 26, delay: idx * 0.035 },
                          }}
                          className={`flex items-center gap-3 px-4 py-3.5 transition-colors duration-700 ${isHighlighted ? 'bg-emerald-50/70' : 'bg-white'}`}
                        >
                          {/* Left ring when highlighted */}
                          <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r transition-all duration-500 ${isHighlighted ? 'bg-emerald-400' : 'bg-transparent'}`} />

                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base transition-all duration-500 ${isHighlighted ? 'bg-emerald-100 shadow-sm shadow-emerald-200' : 'bg-slate-50'}`}>
                            {section.icon}
                          </div>

                          {/* Title + badge */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-semibold text-ink truncate leading-snug">{section.title}</p>
                              <AnimatePresence>
                                {isHighlighted && (
                                  <motion.span
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.6, opacity: 0 }}
                                    className="flex-shrink-0 text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 rounded-full px-1.5 py-0.5 leading-none"
                                  >
                                    Nouveau
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{section.duration} · {section.slides} slides</p>
                          </div>

                          {/* Index badge */}
                          <div className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isHighlighted ? 'bg-emerald-400 text-white shadow-sm shadow-emerald-300' : 'bg-slate-100 text-slate-400'}`}>
                            {idx + 1}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer hint */}
              <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/60">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={answer3 ? 'done' : answer1 ? 'progress' : 'start'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`text-[10px] font-semibold text-center ${answer3 ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {answer3
                      ? '✓ Plan finalisé — prêt à générer votre cours'
                      : answer1
                      ? 'Continuez pour affiner le plan →'
                      : 'Répondez aux questions pour voir ce plan évoluer →'
                    }
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Hint arrow — only before first answer */}
            <AnimatePresence>
              {!answer1 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1"
                >
                  <span className="text-slate-300">←</span>
                  Chaque réponse met ce plan à jour en temps réel
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </AppShell>
  )
}
