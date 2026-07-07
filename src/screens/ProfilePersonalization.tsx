import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/AppShell'
import SectionHeader from '../components/SectionHeader'

// ─── Types ────────────────────────────────────────────────────────────────────
type CalPhase = 'idle' | 'recording' | 'processing' | 'result'

interface ProfilePersonalizationProps {
  onCalibrate: () => void
  onSkip: () => void
  showCalibrationResult: boolean
  onDone: () => void
  isLoggedIn?: boolean
}

// ─── Wave data — 26 flex-1 bars, bell-curve amplitude ────────────────────────
const WAVE_MAX = [
  0.18, 0.30, 0.46, 0.62, 0.75, 0.86, 0.93, 0.97, 1.00, 0.98, 0.93,
  0.88, 0.83, 0.80, 0.83, 0.88, 0.93, 0.97, 0.95, 0.88, 0.80, 0.69, 0.56, 0.42, 0.28, 0.17,
]
// Staggered prime-ish durations to prevent lockstep
const WAVE_DUR = [
  1.92, 2.20, 1.64, 2.48, 1.76, 2.06, 1.58, 2.28, 1.86, 1.70, 2.54,
  1.82, 2.12, 1.54, 2.22, 1.96, 1.66, 2.38, 1.78, 2.10, 1.62, 2.32, 1.84, 2.16, 1.60, 2.02,
]

const SCRIPT_P1 =
  "Le marketing digital est aujourd'hui profondément transformé par l'intelligence artificielle. Des outils comme ChatGPT permettent de produire davantage de contenu — plus rapidement, mieux ciblé."
const SCRIPT_P2 =
  "Cette révolution n'est pas une menace pour les professionnels : c'est une opportunité d'amplifier leur créativité et leur impact stratégique. Maîtriser l'IA, c'est prendre une longueur d'avance."

const PROC_STEPS = [
  'Extraction de la fréquence vocale',
  'Calcul du débit de parole',
  "Génération de l'empreinte vocale",
]

// ─── TraitRow — macOS settings style ─────────────────────────────────────────
function TraitRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3.5 ${!last ? 'border-b border-slate-100/70' : ''}`}>
      <span className="text-sm font-medium text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  )
}

// ─── ProfileBadge ─────────────────────────────────────────────────────────────
const BADGE_CLR: Record<string, string> = {
  indigo:  'bg-indigo-50  text-indigo-600  border-indigo-100/80',
  violet:  'bg-violet-50  text-violet-600  border-violet-100/80',
  purple:  'bg-purple-50  text-purple-600  border-purple-100/80',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
}
function ProfileBadge({ color = 'indigo', icon, children }: { color?: string; icon?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border select-none ${BADGE_CLR[color] ?? BADGE_CLR.indigo}`}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}

// ─── WaveBar — thin flex-1 pill, slow breathing ───────────────────────────────
function WaveBar({ maxScale, dur, delay }: { maxScale: number; dur: number; delay: number }) {
  const min = Math.max(0.06, maxScale * 0.09)
  return (
    <motion.div
      className="flex-1 rounded-full"
      style={{
        height: '100%',
        transformOrigin: 'bottom center',
        background: 'linear-gradient(to top, rgba(99,102,241,0.68), rgba(139,92,246,0.40))',
      }}
      animate={{ scaleY: [min, maxScale, min] }}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay, type: 'tween' }}
    />
  )
}

// ─── Shared card styles ───────────────────────────────────────────────────────
const LIGHT_CARD = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
}
const DARK_CARD = {
  background: 'linear-gradient(140deg, #0b0d14 0%, #0f1118 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
}
const INNER_CARD = {
  background: 'linear-gradient(135deg, rgba(238,242,255,0.75) 0%, rgba(245,243,255,0.55) 100%)',
  border: '1px solid rgba(199,210,254,0.35)',
}
const PRIMARY_BTN = {
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
}

// ─── CalibrationSection ───────────────────────────────────────────────────────
function CalibrationSection({
  onCalibrate, onSkip, onDone, showCalibrationResult,
}: {
  onCalibrate: () => void; onSkip: () => void
  onDone: () => void; showCalibrationResult: boolean
}) {
  const [phase, setPhase] = useState<CalPhase>(showCalibrationResult ? 'result' : 'idle')
  const [elapsed, setElapsed] = useState(0)
  const [wpm, setWpm] = useState(0)

  useEffect(() => {
    if (showCalibrationResult && phase === 'idle') setPhase('result')
  }, [showCalibrationResult]) // eslint-disable-line

  useEffect(() => {
    if (phase !== 'recording') return
    const t = setInterval(() => {
      setElapsed(e => e + 1)
      setWpm(w => {
        if (w === 0)  return 118
        if (w < 130)  return w + (Math.random() > 0.35 ? 2 : 1)
        if (w < 138)  return w + (Math.random() > 0.65 ? 1 : 0)
        return 132 + Math.floor(Math.random() * 8)
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (elapsed >= 60 && phase === 'recording') stopRecording()
  }, [elapsed]) // eslint-disable-line

  function startRecording() { setElapsed(0); setWpm(0); setPhase('recording') }
  function stopRecording() {
    setPhase('processing')
    setTimeout(() => { setPhase('result'); onCalibrate() }, 2000)
  }

  const remaining = Math.max(0, 60 - elapsed)
  const timerStr  = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
  const progress  = Math.min(1, elapsed / 60)

  return (
    <div className="flex flex-col gap-4">

      {/* ── Card A: Light glassmorphism ─────────────────────────────────── */}
      <div className="rounded-[2rem] p-8 flex flex-col min-h-[320px]" style={LIGHT_CARD}>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-6 flex-shrink-0">
          Studio Vocal
        </p>

        <AnimatePresence mode="wait">

          {/* IDLE */}
          {phase === 'idle' && (
            <motion.div key="idle" className="flex flex-col flex-1 gap-5"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <p className="text-[22px] font-medium text-slate-800 tracking-tight leading-tight">
                Calibrez votre débit<br />de parole
              </p>

              {/* Teleprompter */}
              <div className="flex-1 relative rounded-[1.5rem] px-6 pt-6 pb-5 overflow-hidden" style={INNER_CARD}>
                <span className="absolute -top-2 left-4 text-9xl font-serif leading-none select-none pointer-events-none"
                  style={{ color: 'rgba(99,102,241,0.06)' }} aria-hidden>❝</span>
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)' }}
                  animate={{ x: ['-160%', '260%'] }}
                  transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 10 }}
                />
                <div className="relative flex flex-col gap-3">
                  <p className="text-[14px] leading-[1.8] text-slate-600 font-medium">{SCRIPT_P1}</p>
                  <p className="text-[14px] leading-[1.8] text-slate-600 font-medium">{SCRIPT_P2}</p>
                </div>
                <p className="relative mt-4 text-[9px] font-bold uppercase tracking-[0.22em] text-indigo-400/60">
                  Lisez à voix haute · débit estimé 130–160 mots/min
                </p>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={startRecording}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-semibold text-sm text-white active:scale-[0.98] transition-all duration-200"
                  style={PRIMARY_BTN}
                >
                  <span className="text-lg">🎙️</span>
                  Démarrer la calibration
                </button>
                <button onClick={onSkip}
                  className="w-full py-2.5 text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors tracking-widest uppercase"
                >
                  Plus tard
                </button>
              </div>
            </motion.div>
          )}

          {/* RECORDING */}
          {phase === 'recording' && (
            <motion.div key="recording" className="flex flex-col flex-1 gap-5"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              <p className="text-[22px] font-medium text-slate-800 tracking-tight leading-tight">
                Enregistrement en cours
              </p>

              {/* Waveform container */}
              <div className="flex-1 rounded-[1.5rem] px-5 py-6 flex flex-col gap-4" style={INNER_CARD}>
                <div className="relative">
                  <div className="absolute inset-x-0 -bottom-2 h-10 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
                  />
                  <div className="relative flex items-end gap-1 h-[88px] w-full">
                    {WAVE_MAX.map((ms, i) => (
                      <WaveBar key={i} maxScale={ms} dur={WAVE_DUR[i]} delay={(i * 0.10) % 1.7} />
                    ))}
                  </div>
                </div>
                <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(199,210,254,0.5)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.95, ease: 'linear' }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-medium text-center tracking-wide">
                {remaining > 4 ? `Parlez à votre rythme · encore ${remaining}s`
                  : remaining > 0 ? 'Presque terminé…' : 'Terminé'}
              </p>

              <button onClick={stopRecording}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-[11px] tracking-[0.15em] uppercase text-slate-500 hover:text-slate-700 active:scale-[0.98] transition-all duration-200 flex-shrink-0"
                style={{ border: '1.5px solid rgba(148,163,184,0.28)', background: 'rgba(248,250,252,0.7)' }}
              >
                <span className="text-sm leading-none">■</span>
                Terminer l'enregistrement
              </button>
            </motion.div>
          )}

          {/* PROCESSING */}
          {phase === 'processing' && (
            <motion.div key="processing" className="flex flex-col flex-1 items-center justify-center gap-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            >
              <div className="relative w-20 h-20 flex items-center justify-center">
                <motion.div className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)' }}
                  animate={{ scale: [1, 1.45, 1], opacity: [0.8, 0.1, 0.8] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid transparent', borderTopColor: '#818cf8', borderRightColor: '#a78bfa' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div className="absolute inset-[7px] rounded-full"
                  style={{ border: '1.5px solid transparent', borderBottomColor: '#34d399', borderLeftColor: '#10b981' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2.1, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative z-10 text-2xl">🎙️</span>
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-slate-700 mb-1.5 tracking-tight">Analyse de votre empreinte vocale</p>
                <p className="text-[11px] text-slate-400 font-semibold tracking-widest uppercase">IA en traitement · quelques instants</p>
              </div>
              <div className="flex flex-col gap-3.5 w-full max-w-xs">
                {PROC_STEPS.map((step, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.46, duration: 0.25, ease: 'easeOut' }}
                    className="flex items-center gap-3"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: i * 0.46 + 0.14, type: 'spring', stiffness: 320, damping: 22 }}
                      className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0"
                    >
                      <span className="text-emerald-500 text-[10px] font-black">✓</span>
                    </motion.div>
                    <span className="text-sm font-medium text-slate-500">{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULT — Card A: impact context */}
          {phase === 'result' && (
            <motion.div key="result" className="flex flex-col flex-1 gap-5"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2.5">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.1 }}
                  className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"
                >
                  <span className="text-emerald-500 text-[10px] font-black">✓</span>
                </motion.div>
                <span className="text-sm font-semibold text-emerald-600 tracking-tight">Calibration réussie</span>
              </div>

              <p className="text-[22px] font-medium text-slate-800 tracking-tight leading-tight">
                Impact sur votre cours
              </p>

              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, ease: 'easeOut' }}
                className="flex-1 rounded-[1.5rem] p-5 relative overflow-hidden" style={INNER_CARD}
              >
                <motion.div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)' }}
                  animate={{ x: ['-160%', '260%'] }}
                  transition={{ duration: 1.8, ease: 'easeOut', delay: 0.5 }}
                />
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-indigo-500/70 mb-3">Durée estimée du cours</p>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-400 mb-0.5">Avant</p>
                    <p className="text-2xl font-semibold text-slate-500 tabular-nums tracking-tight line-through decoration-slate-300">1h58</p>
                  </div>
                  <div className="flex-1 h-[1.5px] bg-gradient-to-r from-slate-200 via-indigo-300 to-violet-300 rounded-full" />
                  <div className="text-center">
                    <p className="text-xs font-medium text-indigo-500/80 mb-0.5">Après</p>
                    <p className="text-2xl font-semibold text-indigo-600 tabular-nums tracking-tight">1h54</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Votre débit (142 mots/min) est légèrement au-dessus de la moyenne. TimeSpeech a recalibré la durée estimée.
                </p>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Card B: Dark metrics card — recording + result only ─────────── */}
      <AnimatePresence>
        {(phase === 'recording' || phase === 'result') && (
          <motion.div
            key="dark-card"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="rounded-[2rem] p-8 relative overflow-hidden"
            style={DARK_CARD}
          >
            {/* Top accent gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">

              {/* Recording metrics */}
              {phase === 'recording' && (
                <motion.div key="rec"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start justify-between"
                >
                  {/* Timer */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-500 mb-2">Temps</p>
                    <motion.p key={timerStr}
                      initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="text-6xl font-black text-white tabular-nums tracking-tighter leading-none"
                    >
                      {timerStr}
                    </motion.p>
                  </div>

                  {/* REC */}
                  <div className="flex flex-col items-center pt-3 gap-1.5">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-red-500"
                      style={{ boxShadow: '0 0 14px 4px rgba(239,68,68,0.42)' }}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500/65">REC</p>
                  </div>

                  {/* WPM */}
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-500 mb-2">Mots/min</p>
                    <motion.p key={wpm}
                      initial={{ opacity: 0.5, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="text-6xl font-black text-indigo-400 tabular-nums tracking-tighter leading-none"
                    >
                      {wpm > 0 ? wpm : '—'}
                    </motion.p>
                  </div>
                </motion.div>
              )}

              {/* Result metrics */}
              {phase === 'result' && (
                <motion.div key="res"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-500 mb-3">Profil calibré</p>

                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, ease: 'easeOut' }}
                    className="flex items-end gap-3 mb-7"
                  >
                    <span className="text-7xl font-black text-white tracking-tighter leading-none tabular-nums">142</span>
                    <div className="pb-2">
                      <p className="text-sm font-light text-slate-400 leading-snug tracking-wide">mots</p>
                      <p className="text-sm font-light text-slate-400 leading-snug tracking-wide">par minute</p>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38, ease: 'easeOut' }}
                    onClick={onDone}
                    className="w-full px-6 py-4 rounded-2xl font-semibold text-sm text-white active:scale-[0.98] transition-all duration-200"
                    style={PRIMARY_BTN}
                  >
                    Appliquer à mes cours →
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfilePersonalization({
  onCalibrate, onSkip, showCalibrationResult, onDone, isLoggedIn,
}: ProfilePersonalizationProps) {
  return (
    <AppShell
      activeSidebarItem="profil"
      stepLabel="Profil orateur"
      showDemoStatus
      stepProgress="Étape 6 sur 6"
      isLoggedIn={isLoggedIn}
      userInitials="JB"
      userName="Julien"
    >
      {/* "Aura" mesh gradient — overrides AppShell's bg-slate-50/40 */}
      <div className="min-h-full -m-6 lg:-m-8 p-6 lg:p-8 pb-10 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/25">

        <SectionHeader
          eyebrow="ÉTAPE 6 · PROFIL ORATEUR"
          title="Personnalisez votre profil orateur"
          subtitle="TimeSpeech utilise votre profil pour affiner les estimations de durée à votre rythme de parole."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

          {/* ── Left: Profile Hero card ──────────────────────────────────── */}
          <div className="rounded-[2rem] p-8 flex flex-col" style={LIGHT_CARD}>

            {/* Avatar + Identity */}
            <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-slate-100/80">
              {/* Avatar with glow */}
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full blur-3xl scale-[1.6] opacity-20"
                  style={{ background: 'radial-gradient(circle, #818cf8 0%, #a78bfa 100%)' }}
                />
                <div className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)',
                    border: '2px solid rgba(199,210,254,0.55)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.14)',
                  }}
                >
                  <span className="text-xl font-black tracking-tight" style={{ color: '#6366f1' }}>JB</span>
                </div>
              </div>
              <p className="text-2xl font-medium text-slate-800 tracking-tight">Julien Bertrand</p>
              <p className="text-sm font-medium text-slate-400 mt-1 tracking-wide">Consultant Data · ESD Paris</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs font-semibold text-emerald-600">Actif</span>
              </div>
            </div>

            {/* Trait list — macOS settings style */}
            <div className="mb-8">
              <TraitRow label="Métier" value="Consultant data" />
              <TraitRow label="Établissement" value="ESD Paris" />
              <TraitRow label="Style" value="Explicatif" />
              <TraitRow label="Rythme" value="Normal" />
              <TraitRow label="Interaction" value="Moyen" last />
            </div>

            {/* Expertise badges */}
            <div className="pt-7 border-t border-slate-100/80 mt-auto">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-400 mb-3">Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                <ProfileBadge color="indigo" icon="📊">Data Science</ProfileBadge>
                <ProfileBadge color="violet" icon="🤖">IA Générative</ProfileBadge>
                <ProfileBadge color="purple" icon="📣">Marketing Digital</ProfileBadge>
                <ProfileBadge color="emerald" icon="📈">Intervenant ESD</ProfileBadge>
              </div>
            </div>
          </div>

          {/* ── Right: Calibration (two stacked bento cards) ─────────────── */}
          <CalibrationSection
            onCalibrate={onCalibrate}
            onSkip={onSkip}
            onDone={onDone}
            showCalibrationResult={showCalibrationResult}
          />

        </div>
      </div>
    </AppShell>
  )
}
