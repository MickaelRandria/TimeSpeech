import React, { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import AppShell from '../components/AppShell'
import Button from '../components/Button'
import Badge from '../components/Badge'
import SlideNode, { AISuggestion } from '../components/SlideNode'
import { GENERATED_COURSE, SectionId } from '../mocks/courseData'
import { getSessionDateLabel } from '../utils/dates'

// ── Types ────────────────────────────────────────────────────────────────────

interface CoursePreviewProps {
  isCalibrated: boolean
  calibratedDuration?: string
  isLoggedIn?: boolean
  onSave: () => void
  onExport: () => void
  onPersonalize: () => void
  onBack: () => void
  onViewPlanning?: () => void
}

interface SlideData {
  id: SectionId
  title: string
  baseMinutes: number
  initialNotes: string
  condensedNotes?: string
  aiSuggestion?: AISuggestion
}

// ── Static data ───────────────────────────────────────────────────────────────

const BASE_TOTAL = 132  // 10+30+35+37+20 = 2h12

const SLIDES: SlideData[] = [
  {
    id: 'ia-intro',
    title: "Introduction à l'IA générative",
    baseMinutes: 10,
    initialNotes:
      "Bienvenue dans cette session sur l'intelligence artificielle générative. " +
      "Nous allons explorer ensemble comment ces technologies transforment nos pratiques professionnelles. " +
      "Au programme : définitions clés, panorama des outils et démonstration live. " +
      "Mon objectif est que vous repartiez avec une vision claire et des outils concrets à mettre en pratique dès cette semaine.",
    condensedNotes:
      "Bienvenue. IA générative : définitions clés, panorama rapide, démo live. " +
      "Objectif : ressortir avec des outils concrets à utiliser dès cette semaine.",
  },
  {
    id: 'ia-marketing',
    title: 'IA et analyse marketing',
    baseMinutes: 30,
    initialNotes:
      "L'analyse marketing par IA ouvre des possibilités inédites pour les équipes. " +
      "Grâce aux modèles de traitement du langage naturel, il est possible d'analyser des milliers d'avis clients en quelques secondes. " +
      "Nous verrons comment des marques comme Sephora ou BlaBlaCar ont intégré ces outils pour segmenter leurs audiences et personnaliser leurs campagnes. " +
      "Démonstration live avec GPT-4 pour construire un brief créatif complet à partir d'un corpus de données clients.",
    condensedNotes:
      "L'IA analyse des milliers d'avis clients en quelques secondes. " +
      "Exemples : Sephora, BlaBlaCar. " +
      "Démo GPT-4 : construire un brief créatif complet en live.",
  },
  {
    id: 'ia-content',
    title: 'IA et création de contenu',
    baseMinutes: 35,
    initialNotes:
      "La création de contenu assistée par IA représente une révolution pour les équipes marketing. " +
      "Je vais vous montrer un workflow complet : génération d'images avec Midjourney, rédaction avec Claude, et montage vidéo avec Runway ML, " +
      "avec une démonstration complète d'outils en temps réel. " +
      "La supervision humaine reste indispensable pour garantir authenticité, cohérence de marque et conformité éthique.",
    condensedNotes:
      "Workflow IA création de contenu : Midjourney pour les images, Claude pour la rédaction, Runway ML pour la vidéo. " +
      "Supervision humaine indispensable pour authenticité et cohérence de marque.",
  },
  {
    id: 'cas-pratique',
    title: 'Cas pratique',
    baseMinutes: 37,
    initialNotes:
      "Vous allez maintenant travailler en binômes sur un brief marketing pour une marque éco-responsable. " +
      "Étape 1 : analyser le brief avec ChatGPT. Étape 2 : générer 5 visuels avec Midjourney. Étape 3 : rédiger 3 variantes de copy. " +
      "Chaque groupe aura 15 minutes de travail, puis présentera son résultat devant les autres. " +
      "Nous terminerons par un débriefing collectif sur les apprentissages et les limites rencontrées dans l'exercice.",
    condensedNotes:
      "Binômes sur un brief éco-responsable : analyser (ChatGPT), générer 5 visuels (Midjourney), rédiger 3 variantes de copy. " +
      "15 minutes de travail, puis restitution en plénière.",
    aiSuggestion: {
      text: "Nous terminerons par un débriefing collectif sur les apprentissages et les limites rencontrées dans l'exercice.",
      saveMinutes: 7,
    },
  },
  {
    id: 'synthese',
    title: 'Synthèse et questions',
    baseMinutes: 20,
    initialNotes:
      "Pour synthétiser cette session : l'IA générative est déjà dans vos outils quotidiens. " +
      "Son adoption stratégique génère un avantage compétitif concret. " +
      "La compétence humaine reste centrale pour orienter et améliorer les outputs de l'IA. " +
      "Réservons ces 10 dernières minutes à vos questions — n'hésitez pas à partager vos cas d'usage concrets et les obstacles rencontrés dans votre organisation.",
    condensedNotes:
      "Trois retenues : l'IA est dans vos outils quotidiens, son adoption crée un avantage compétitif concret, la compétence humaine reste centrale. " +
      "Questions ?",
    aiSuggestion: {
      text: "Réservons ces 10 dernières minutes à vos questions — n'hésitez pas à partager vos cas d'usage concrets et les obstacles rencontrés dans votre organisation.",
      saveMinutes: 7,
    },
  },
]

const POST_CAL_SUGGESTION: AISuggestion = {
  text: "avec une démonstration complète d'outils en temps réel",
  saveMinutes: 4,
}

// ── Framer variants ───────────────────────────────────────────────────────────

const sidebarVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 130, damping: 18 } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMinutes(m: number) {
  const h   = Math.floor(m / 60)
  const min = m % 60
  return `${h}h${String(min).padStart(2, '0')}`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CoursePreview({
  isCalibrated,
  calibratedDuration,
  isLoggedIn,
  onSave,
  onExport,
  onPersonalize,
  onBack,
  onViewPlanning,
}: CoursePreviewProps) {
  const course      = GENERATED_COURSE
  const sessionDate = getSessionDateLabel()

  const [totalMinutes,      setTotalMinutes]      = useState(BASE_TOTAL)
  const [finalCutAccepted,  setFinalCutAccepted]  = useState(false)
  const [acceptedCount,     setAcceptedCount]     = useState(0)

  function handleDelta(delta: number) {
    setTotalMinutes(m => Math.max(60, m + delta))
  }

  function handleMainAccepted() {
    setAcceptedCount(c => c + 1)
  }

  const currentDuration = isCalibrated
    ? finalCutAccepted ? '2h00' : (calibratedDuration ?? '2h04')
    : fmtMinutes(totalMinutes)

  const overBudget = !isCalibrated && totalMinutes > 120
  const underBudget = !isCalibrated && totalMinutes <= 120

  const statusBadge = isCalibrated && finalCutAccepted
    ? { label: '✓ Parfaitement calibré', variant: 'success'  as const }
    : isCalibrated
    ? { label: '✓ Profil vocal',          variant: 'primary'  as const }
    : underBudget
    ? { label: '✓ Dans les temps',        variant: 'success'  as const }
    : overBudget
    ? { label: '⚠ Dépassement',           variant: 'warning'  as const }
    : { label: 'Estimation std',           variant: 'neutral'  as const }

  const kpiColor = overBudget ? 'text-orange-600' : 'text-slate-900'

  const statutLabel = isCalibrated && finalCutAccepted ? 'Parfaitement calibré'
    : isCalibrated ? 'Profil vocal appliqué'
    : underBudget ? 'Optimisé'
    : 'Démo · Compte non créé'

  const showPersonalizeCTA = !isCalibrated && acceptedCount > 0
  const showCalibrationCard = isCalibrated

  return (
    <AppShell
      activeSidebarItem="cours"
      stepLabel="Cours généré"
      showDemoStatus={true}
      stepProgress="Étape 5 sur 6"
      isLoggedIn={isLoggedIn}
      userInitials="JB"
      userName="Julien"
    >
      <div className="flex flex-col gap-6">

        {/* ── HEADER ────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100/80 px-6 py-5 bg-gradient-to-r from-white via-white to-primary/5 shadow-[0_1px_3px_rgba(0,0,0,0.03),_0_8px_32px_rgba(90,87,255,0.04)]">
          <div className="flex items-center gap-6">

            {/* Duration KPI */}
            <div className="flex items-center gap-3.5 flex-shrink-0">
              <span
                key={currentDuration}
                className={`text-5xl font-black tracking-[-0.04em] leading-none animate-duration-change transition-colors duration-500 ${kpiColor}`}
              >
                {currentDuration}
              </span>
              <div className="flex flex-col gap-1.5">
                <Badge label={statusBadge.label} variant={statusBadge.variant} />
                <span className="text-[10px] font-bold text-slate-400 tracking-wide">Objectif {course.targetDuration}</span>
              </div>
            </div>

            <div className="w-px h-12 bg-slate-100 flex-shrink-0" />

            {/* Course meta */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/10 to-violet-100 border border-primary/20 shadow-[0_2px_8px_rgba(90,87,255,0.12)]">
                <span className="text-sm font-black text-primary">JB</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-slate-800 tracking-tight truncate">{course.fullTitle}</h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Julien Bertrand · ESD Bordeaux · {sessionDate}</p>
              </div>
            </div>

            {/* Save CTA */}
            <Button
              variant="primary"
              onClick={onSave}
              className="flex-shrink-0 shadow-glow hover:shadow-[0_4px_20px_rgba(90,87,255,0.3)] transition-all duration-200"
            >
              Enregistrer mon cours
            </Button>
          </div>
        </div>

        {/* ── MAIN GRID ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-6 items-start">

          {/* LEFT — Storyboard feed (70%) */}
          <div className="col-span-8 flex flex-col gap-5">
            {SLIDES.map((slide, i) => {
              // Post-calibration: slot ia-content suggestion only when calibrated and not yet accepted
              const suggestion: AISuggestion | undefined =
                slide.id === 'ia-content' && isCalibrated && !finalCutAccepted
                  ? POST_CAL_SUGGESTION
                  : slide.aiSuggestion

              return (
                <SlideNode
                  key={slide.id === 'ia-content' && isCalibrated ? `${slide.id}-cal` : slide.id}
                  index={i + 1}
                  total={SLIDES.length}
                  title={slide.title}
                  imageUrl={`/Slide${i + 1}.png`}
                  initialNotes={slide.initialNotes}
                  condensedNotes={slide.condensedNotes}
                  baseMinutes={slide.baseMinutes}
                  aiSuggestion={suggestion}
                  onMinutesDelta={handleDelta}
                  onSuggestionAccepted={
                    slide.id === 'ia-content'
                      ? () => setFinalCutAccepted(true)
                      : handleMainAccepted
                  }
                />
              )
            })}
          </div>

          {/* RIGHT — Sticky sidebar (30%) */}
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="show"
            className="col-span-4 sticky top-6 flex flex-col gap-4"
          >

            {/* ── KPI summary card ── */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-3xl border border-slate-100/60 shadow-[0_4px_30px_rgba(15,23,42,0.04)] overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100/60">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Durée totale</span>
                <div className="flex items-end gap-3 mt-2">
                  <span
                    key={currentDuration}
                    className={`text-3xl font-black tracking-[-0.04em] leading-none animate-duration-change ${kpiColor}`}
                  >
                    {currentDuration}
                  </span>
                  <span className="text-xs font-bold text-slate-400 pb-0.5">/ 2h00 objectif</span>
                </div>
              </div>

              {/* Per-slide mini breakdown */}
              <div className="px-6 py-3 flex flex-col gap-1.5">
                {SLIDES.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-200 w-4 font-mono">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 text-[10px] font-semibold text-slate-400 truncate">{s.title}</span>
                    <span className="text-[10px] font-black text-primary">{s.baseMinutes} min</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Context card ── */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-3xl border border-slate-100/60 shadow-[0_4px_30px_rgba(15,23,42,0.04)] overflow-hidden"
            >
              <div className="px-6 pt-5 pb-3 border-b border-slate-100/60 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Contexte</span>
                <Badge label="Démo gratuite" variant="success" />
              </div>
              <div className="px-6 py-1">
                {[
                  { label: 'École',  value: 'ESD Bordeaux'   },
                  { label: 'Séance', value: sessionDate       },
                  { label: 'Statut', value: statutLabel       },
                  { label: 'Slides', value: `${SLIDES.length} slides` },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <span className="text-xs font-bold text-slate-400">{label}</span>
                    <span className="text-xs font-extrabold text-slate-700 text-right max-w-[60%] leading-tight">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Personalize CTA (after at least 1 suggestion accepted) ── */}
            <AnimatePresence>
              {showPersonalizeCTA && (
                <motion.div
                  key="personalize-cta"
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-gradient-to-br from-primary/5 via-violet-50/60 to-white rounded-3xl border border-primary/15 shadow-[0_4px_20px_rgba(90,87,255,0.06)] p-5"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary/60 mb-2">Prochaine étape</p>
                  <p className="text-sm font-extrabold text-slate-800 mb-1 tracking-tight">Calibrez votre débit vocal</p>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mb-3">
                    Obtenez une estimation personnalisée basée sur votre vitesse de parole réelle.
                  </p>
                  <Button variant="primary" fullWidth onClick={onPersonalize} className="shadow-glow">
                    Calibrer mon profil →
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Post-calibration card ── */}
            {showCalibrationCard && (
              <motion.div
                variants={cardVariants}
                className="bg-white rounded-3xl border border-primary/12 shadow-[0_4px_20px_rgba(90,87,255,0.05)] p-5"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-primary/50 mb-2">Profil vocal</p>
                <p className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mb-2 tracking-tight">
                  <span className="text-emerald-500">✓</span> Cours recalibré
                </p>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  Débit détecté : {course.wpm} mots/min.{' '}
                  {finalCutAccepted
                    ? 'Durée parfaitement alignée sur votre rythme.'
                    : 'Ouvrez la slide 3 pour appliquer la suggestion finale (+4 min).'}
                </p>
                {finalCutAccepted && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-3 flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-100"
                  >
                    <span className="text-emerald-500 font-black">✓</span>
                    <p className="text-[11px] font-bold text-emerald-700">Cours calibré sur votre profil — exactement 2h00 !</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── Exercise card ── */}
            <motion.div
              variants={cardVariants}
              className="bg-white rounded-3xl border border-slate-100/60 shadow-[0_4px_30px_rgba(15,23,42,0.04)] p-5"
            >
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">Exercice principal</p>
              <p className="text-sm font-extrabold text-slate-800 mb-2 tracking-tight leading-snug">{course.exercise}</p>
              <Badge label="Cas pratique intégré" variant="primary" />
            </motion.div>

            {/* ── Secondary actions ── */}
            <motion.div variants={cardVariants} className="flex flex-col items-center gap-2 pt-1">
              <button onClick={onExport} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Exporter</button>
              {onViewPlanning && (
                <button onClick={onViewPlanning} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Voir dans le planning</button>
              )}
              <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:text-slate-500 transition-colors mt-1">← Retour</button>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </AppShell>
  )
}
