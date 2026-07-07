import React, { useState } from 'react'
import AppShell from '../components/AppShell'
import Button from '../components/Button'
import Badge from '../components/Badge'
import type { AISuggestion } from '../components/SlideNode'
import PaywallModal from '../components/PaywallModal'
import CourseDetailsDrawer from '../components/CourseDetailsDrawer'
import SlideWorkspace, { type WorkspaceSlideData } from '../components/SlideWorkspace'
import { GENERATED_COURSE, SectionId } from '../mocks/courseData'
import { getSessionDateLabel } from '../utils/dates'

// ── Icons ──────────────────────────────────────────────────────────────────────

function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.2v4M8 5.15v.01" />
    </svg>
  )
}

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
  imageUrl: string
  baseMinutes: number
  initialNotes: string
  aiSuggestion?: AISuggestion
}

// ── Static data ───────────────────────────────────────────────────────────────

const FREE_LIMIT = 1    // free AI-suggestion accepts before the paywall triggers
const BASE_TOTAL = 132  // 10+30+35+37+20 = 2h12

const SLIDES: SlideData[] = [
  {
    id: 'ia-intro',
    title: "Introduction à l'IA générative",
    imageUrl: '/Slide1.png',
    baseMinutes: 10,
    initialNotes:
      "Bienvenue dans cette session sur l'intelligence artificielle générative. " +
      "Nous allons explorer ensemble comment ces technologies transforment nos pratiques professionnelles. " +
      "Au programme : définitions clés, panorama des outils et démonstration live. " +
      "Mon objectif est que vous repartiez avec une vision claire et des outils concrets à mettre en pratique dès cette semaine.",
  },
  {
    id: 'ia-marketing',
    title: 'IA et analyse marketing',
    imageUrl: '/Slide2.png',
    baseMinutes: 30,
    initialNotes:
      "L'analyse marketing par IA ouvre des possibilités inédites pour les équipes. " +
      "Grâce aux modèles de traitement du langage naturel, il est possible d'analyser des milliers d'avis clients en quelques secondes. " +
      "Nous verrons comment des marques comme Sephora ou BlaBlaCar ont intégré ces outils pour segmenter leurs audiences et personnaliser leurs campagnes. " +
      "Démonstration live avec GPT-4 pour construire un brief créatif complet à partir d'un corpus de données clients.",
  },
  {
    id: 'ia-content',
    title: 'IA et création de contenu',
    imageUrl: '/Slide3.png',
    baseMinutes: 35,
    initialNotes:
      "La création de contenu assistée par IA représente une révolution pour les équipes marketing. " +
      "Je vais vous montrer un workflow complet : génération d'images avec Midjourney, rédaction avec Claude, et montage vidéo avec Runway ML, " +
      "avec une démonstration complète d'outils en temps réel. " +
      "La supervision humaine reste indispensable pour garantir authenticité, cohérence de marque et conformité éthique.",
  },
  {
    id: 'cas-pratique',
    title: 'Cas pratique',
    imageUrl: '/Slide4.png',
    baseMinutes: 37,
    initialNotes:
      "Vous allez maintenant travailler en binômes sur un brief marketing pour une marque éco-responsable. " +
      "Étape 1 : analyser le brief avec ChatGPT. Étape 2 : générer 5 visuels avec Midjourney. Étape 3 : rédiger 3 variantes de copy. " +
      "Chaque groupe aura 15 minutes de travail, puis présentera son résultat devant les autres. " +
      "Nous terminerons par un débriefing collectif sur les apprentissages et les limites rencontrées dans l'exercice.",
    aiSuggestion: {
      text: "Nous terminerons par un débriefing collectif sur les apprentissages et les limites rencontrées dans l'exercice.",
      saveMinutes: 7,
    },
  },
  {
    id: 'synthese',
    title: 'Synthèse et questions',
    imageUrl: '/Slide5.png',
    baseMinutes: 20,
    initialNotes:
      "Pour synthétiser cette session : l'IA générative est déjà dans vos outils quotidiens. " +
      "Son adoption stratégique génère un avantage compétitif concret. " +
      "La compétence humaine reste centrale pour orienter et améliorer les outputs de l'IA. " +
      "Réservons ces 10 dernières minutes à vos questions — n'hésitez pas à partager vos cas d'usage concrets et les obstacles rencontrés dans votre organisation.",
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
  const [aiUsageCount,      setAiUsageCount]      = useState(0)
  const [paywallOpen,       setPaywallOpen]       = useState(false)
  const [isDrawerOpen,      setIsDrawerOpen]      = useState(false)
  const [liveSlides,        setLiveSlides]        = useState<SlideData[]>(() => SLIDES.map(s => ({ ...s })))

  function handleDelta(delta: number) {
    setTotalMinutes(m => Math.max(60, m + delta))
  }

  function effectiveSuggestion(slide: SlideData): AISuggestion | undefined {
    return slide.id === 'ia-content' && isCalibrated && !finalCutAccepted
      ? POST_CAL_SUGGESTION
      : slide.aiSuggestion
  }

  function handleNotesChange(slideId: string, notes: string) {
    setLiveSlides(prev => prev.map(s => s.id === slideId ? { ...s, initialNotes: notes } : s))
  }

  function handleAcceptSuggestion(slideId: string) {
    if (aiUsageCount >= FREE_LIMIT) {
      setPaywallOpen(true)
      return
    }
    const slide = liveSlides.find(s => s.id === slideId)
    const suggestion = slide && effectiveSuggestion(slide)
    if (!slide || !suggestion) return

    const newNotes = slide.initialNotes
      .replace(suggestion.text, '')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    setLiveSlides(prev => prev.map(s => s.id === slideId ? { ...s, initialNotes: newNotes } : s))
    setAiUsageCount(c => c + 1)
    handleDelta(-suggestion.saveMinutes)

    if (slideId === 'ia-content') setFinalCutAccepted(true)
    else setAcceptedCount(c => c + 1)
  }

  function handleReorder(newOrder: WorkspaceSlideData[]) {
    const byId = new Map(liveSlides.map(s => [s.id, s]))
    const reordered = newOrder
      .map(s => byId.get(s.id))
      .filter((s): s is SlideData => Boolean(s))
    setLiveSlides(reordered)
  }

  const workspaceSlides: WorkspaceSlideData[] = liveSlides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    imageUrl: slide.imageUrl,
    baseMinutes: slide.baseMinutes,
    notes: slide.initialNotes,
    aiSuggestion: effectiveSuggestion(slide),
  }))

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
      <div className="flex flex-col gap-8">

        {/* ── HEADER ────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100/80 px-6 py-5 bg-gradient-to-r from-white via-white to-primary/5 shadow-[0_1px_3px_rgba(0,0,0,0.03),_0_8px_32px_rgba(90,87,255,0.04)]">
          <div className="flex items-center gap-6">

            {/* Duration KPI — always visible, even with the drawer closed */}
            <div className="flex items-center gap-3.5 flex-shrink-0">
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Durée totale</span>
                <span
                  key={currentDuration}
                  className={`text-5xl font-black tracking-[-0.04em] leading-none animate-duration-change transition-colors duration-500 ${kpiColor}`}
                >
                  {currentDuration}
                </span>
              </div>
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

            {/* Drawer trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-slate-500 text-xs font-bold hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 flex-shrink-0"
            >
              <InfoIcon />
              Détails du cours
            </button>

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

        {/* ── Storyboard: dual-view workspace (Présentation / Édition) ── */}
        <SlideWorkspace
          slides={workspaceSlides}
          onNotesChange={handleNotesChange}
          onAcceptSuggestion={handleAcceptSuggestion}
          onReorder={handleReorder}
        />
      </div>

      {/* ── Pricing modal (triggered by inline soft paywall) ── */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSelectStandard={onSave}
        onSelectPro={onSave}
        freeLimit={FREE_LIMIT}
      />

      {/* ── Course details slide-over (Contexte, Exercice, actions secondaires) ── */}
      <CourseDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sessionDate={sessionDate}
        statutLabel={statutLabel}
        slideCount={liveSlides.length}
        showPersonalizeCTA={showPersonalizeCTA}
        onPersonalize={onPersonalize}
        showCalibrationCard={showCalibrationCard}
        wpm={course.wpm}
        finalCutAccepted={finalCutAccepted}
        exercise={course.exercise}
        onExport={onExport}
        onViewPlanning={onViewPlanning}
        onBack={onBack}
      />
    </AppShell>
  )
}
