import React, { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CalendarCourseStatus = 'generated' | 'missing-brief' | 'to-prepare'

export interface CalendarCourse {
  id: string
  title: string
  school: string
  isoDate: string
  timeLabel: string
  status: CalendarCourseStatus
  estimatedDuration?: string
  targetDuration: string
  slides?: string[]   // real slide image URLs for the film-strip preview
}

interface TooltipState {
  course: CalendarCourse
  rect: DOMRect
}

interface BentoCalendarProps {
  courses: CalendarCourse[]
  animatedMinutes: number
  currentPlan: Array<{ title: string; duration: string }>
  formatTime: (m: number) => string
  onOpenCourse: () => void
  onAddBrief: () => void
  onCreateCourse: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const STATUS_STYLES = {
  generated: {
    pill:        'bg-indigo-50 border border-indigo-100 text-indigo-700',
    pillHover:   'hover:border-indigo-200 hover:bg-indigo-50/80',
    dot:         'bg-indigo-400',
    gradFrom:    'from-indigo-600',
    gradTo:      'to-violet-600',
    badgeLabel:  'Cours généré',
    legendBg:    'bg-indigo-50 border-indigo-100/80 text-indigo-600',
    accentHex:   '#6366f1',
  },
  'missing-brief': {
    pill:        'bg-amber-50 border border-amber-100 text-amber-700',
    pillHover:   'hover:border-amber-200 hover:bg-amber-50/80',
    dot:         'bg-amber-400',
    gradFrom:    'from-amber-500',
    gradTo:      'to-orange-500',
    badgeLabel:  'Brief manquant',
    legendBg:    'bg-amber-50 border-amber-100/80 text-amber-600',
    accentHex:   '#f59e0b',
  },
  'to-prepare': {
    pill:        'bg-slate-100 border border-slate-200 text-slate-600',
    pillHover:   'hover:border-slate-300 hover:bg-slate-100/80',
    dot:         'bg-slate-400',
    gradFrom:    'from-slate-600',
    gradTo:      'to-slate-700',
    badgeLabel:  'À préparer',
    legendBg:    'bg-slate-100 border-slate-200/80 text-slate-500',
    accentHex:   '#64748b',
  },
} satisfies Record<CalendarCourseStatus, {
  pill: string; pillHover: string; dot: string; gradFrom: string; gradTo: string
  badgeLabel: string; legendBg: string; accentHex: string
}>

// ─── Framer Motion Variants ───────────────────────────────────────────────────

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.012, delayChildren: 0.04 } },
  exit:  { opacity: 0, transition: { duration: 0.12 } },
}

const cellVariants = {
  hidden: { opacity: 0, scale: 0.91, y: 8 },
  show:   { opacity: 1, scale: 1,    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
}

// ─── Calendar Helpers ─────────────────────────────────────────────────────────

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const todayISO = new Date().toISOString().split('T')[0]
  const offset   = (firstDay.getDay() + 6) % 7

  const days: Array<{ date: string; day: number; isCurrentMonth: boolean; isToday: boolean }> = []

  for (let i = offset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    const iso = d.toISOString().split('T')[0]
    days.push({ date: iso, day: d.getDate(), isCurrentMonth: false, isToday: iso === todayISO })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    const iso = d.toISOString().split('T')[0]
    days.push({ date: iso, day: i, isCurrentMonth: true, isToday: iso === todayISO })
  }
  let next = 1
  while (days.length % 7 !== 0) {
    const d = new Date(year, month + 1, next++)
    const iso = d.toISOString().split('T')[0]
    days.push({ date: iso, day: d.getDate(), isCurrentMonth: false, isToday: iso === todayISO })
  }
  return days
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 15l-5-5 5-5"/>
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5l5 5-5 5"/>
    </svg>
  )
}
function ChevronDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l5 5 5-5"/>
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/>
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 5l10 10M15 5L5 15"/>
    </svg>
  )
}

// ─── SVG Slide Thumbnail ──────────────────────────────────────────────────────

function SlideMockThumbnail({ status }: { status: CalendarCourseStatus }) {
  const c = {
    generated:       { bg: '#eef2ff', bar: '#6366f1', l1: '#a5b4fc', l2: '#c7d2fe', accent: '#6366f1' },
    'missing-brief': { bg: '#fffbeb', bar: '#f59e0b', l1: '#fcd34d', l2: '#fde68a', accent: '#f59e0b' },
    'to-prepare':    { bg: '#f8fafc', bar: '#64748b', l1: '#cbd5e1', l2: '#e2e8f0', accent: '#64748b' },
  }[status]

  return (
    <svg viewBox="0 0 160 90" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="90" fill={c.bg} rx="8"/>
      <rect x="0" y="0" width="160" height="22" fill={c.bar} rx="8"/>
      <rect x="0" y="14" width="160" height="8" fill={c.bar}/>
      <text x="10" y="15" fontSize="7" fill="white" fontWeight="bold" fontFamily="sans-serif" opacity="0.9">Présentation · ESD Bordeaux</text>
      <rect x="10" y="30" width="80" height="5" rx="2.5" fill={c.l1}/>
      <rect x="10" y="39" width="65" height="4" rx="2" fill={c.l2}/>
      <rect x="10" y="47" width="70" height="4" rx="2" fill={c.l2}/>
      <rect x="10" y="55" width="55" height="4" rx="2" fill={c.l2}/>
      <rect x="106" y="28" width="44" height="36" rx="6" fill={c.accent} opacity="0.1"/>
      <rect x="112" y="35" width="28" height="4" rx="2" fill={c.accent} opacity="0.45"/>
      <rect x="112" y="43" width="20" height="3.5" rx="1.75" fill={c.accent} opacity="0.3"/>
      <rect x="112" y="51" width="24" height="3.5" rx="1.75" fill={c.accent} opacity="0.3"/>
      <rect x="10" y="72" width="140" height="2" rx="1" fill={c.l2}/>
      <rect x="10" y="80" width="54" height="2" rx="1" fill={c.l2}/>
    </svg>
  )
}

// ─── Portal Tooltip (renders in document.body — never clipped) ────────────────

// Film-strip constants
const STRIP_SLIDE_W  = 132   // px — width of each slide in the strip
const STRIP_SLIDE_H  = 74    // px — ~16:9
const STRIP_GAP      = 6     // px
const STRIP_ITEM_W   = STRIP_SLIDE_W + STRIP_GAP

function FilmStrip({ slides }: { slides: string[] }) {
  // Duplicate for seamless infinite loop
  const frames = [...slides, ...slides]
  const animDist = STRIP_ITEM_W * slides.length  // one full cycle

  return (
    <div
      className="relative overflow-hidden rounded-xl mb-3"
      style={{ height: STRIP_SLIDE_H + 2 }}
    >
      <motion.div
        className="flex absolute top-0 left-0"
        style={{ gap: STRIP_GAP }}
        animate={{ x: [0, -animDist] }}
        transition={{
          x: {
            duration:   5,
            ease:       'linear',
            repeat:     Infinity,
            repeatType: 'loop',
          },
        }}
      >
        {frames.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${(i % slides.length) + 1}`}
            draggable={false}
            className="rounded-lg object-cover flex-shrink-0 border border-slate-200/40 shadow-sm"
            style={{ width: STRIP_SLIDE_W, height: STRIP_SLIDE_H }}
          />
        ))}
      </motion.div>

      {/* Right-edge fade so the strip "bleeds off" elegantly */}
      <div
        className="absolute inset-y-0 right-0 w-10 pointer-events-none rounded-r-xl"
        style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.95), transparent)' }}
      />
      {/* Slide counter badge */}
      <div className="absolute bottom-1.5 right-2 bg-black/35 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full pointer-events-none">
        {slides.length} slides
      </div>
    </div>
  )
}

function CalendarTooltip({ tooltip }: { tooltip: TooltipState }) {
  const { course, rect } = tooltip
  const s = STATUS_STYLES[course.status]

  const TOOLTIP_W  = 228
  const GAP        = 10
  const EST_H      = course.slides ? 210 : 195  // height estimate for above-flip logic

  // Clamp horizontally
  const left = Math.min(rect.left, window.innerWidth - TOOLTIP_W - 12)

  // Flip above/below based on available space (no CSS transform needed)
  const above = rect.top > EST_H + GAP
  const posStyle = above
    ? {
        bottom: window.innerHeight - rect.top + GAP,
        left,
        width: TOOLTIP_W,
      }
    : {
        top: rect.bottom + GAP,
        left,
        width: TOOLTIP_W,
      }

  return createPortal(
    <AnimatePresence>
      <motion.div
        key={`tooltip-${course.id}`}
        initial={{ opacity: 0, y: above ? 8 : -8, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: above ? 5 : -5, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position:      'fixed',
          zIndex:        9999,
          pointerEvents: 'none',
          filter:        'drop-shadow(0 12px 32px rgba(15,23,42,0.14))',
          ...posStyle,
        }}
        className="bg-white rounded-2xl border border-slate-100/80 p-3"
      >
        {/* ── Slide film strip (real images) or SVG mock ── */}
        {course.slides && course.slides.length > 0
          ? <FilmStrip slides={course.slides}/>
          : (
            <div className="w-full rounded-xl overflow-hidden mb-3 border border-slate-100/60">
              <SlideMockThumbnail status={course.status}/>
            </div>
          )
        }

        {/* Course info */}
        <p className="text-xs font-extrabold text-slate-800 leading-snug truncate">{course.title}</p>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{course.school}</p>

        {/* Duration / status row */}
        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100">
          {course.estimatedDuration ? (
            <>
              <span className="text-indigo-400"><ClockIcon/></span>
              <span className="text-xs font-extrabold text-indigo-600">{course.estimatedDuration}</span>
              <span className="text-[10px] text-slate-400 font-semibold">estimé</span>
            </>
          ) : (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.legendBg}`}>
              {s.badgeLabel}
            </span>
          )}
        </div>

        {/* Arrow */}
        {above
          ? <div className="absolute -bottom-[6px] left-5 w-3 h-3 bg-white border-r border-b border-slate-100/80 rotate-45"/>
          : <div className="absolute -top-[6px]    left-5 w-3 h-3 bg-white border-l border-t border-slate-100/80 rotate-45"/>
        }
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

// ─── Calendar Event Pill ──────────────────────────────────────────────────────

interface EventPillProps {
  course: CalendarCourse
  isExpanded: boolean
  onExpand: () => void
  onShowTooltip: (course: CalendarCourse, rect: DOMRect) => void
  onHideTooltip: () => void
}

function CalendarEventPill({ course, isExpanded, onExpand, onShowTooltip, onHideTooltip }: EventPillProps) {
  const pillRef = useRef<HTMLDivElement>(null)
  const s = STATUS_STYLES[course.status]

  const handleMouseEnter = () => {
    if (isExpanded || !pillRef.current) return
    onShowTooltip(course, pillRef.current.getBoundingClientRect())
  }

  if (isExpanded) {
    return (
      <div className="rounded-xl px-2.5 py-1.5 border border-dashed border-slate-200/70 bg-slate-50/60">
        <p className="text-[11px] pl-3.5 opacity-0 select-none">{course.title}</p>
        <p className="text-[10px] pl-3.5 opacity-0 select-none">{course.timeLabel}</p>
      </div>
    )
  }

  return (
    <motion.div
      ref={pillRef}
      layoutId={`event-card-${course.id}`}
      onClick={onExpand}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onHideTooltip}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 440, damping: 28 }}
      className={`relative cursor-pointer rounded-xl px-2.5 py-1.5 shadow-sm ${s.pill} ${s.pillHover} transition-shadow duration-200`}
      style={{ willChange: 'transform' }}
    >
      {/* Coloured dot */}
      <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${s.dot} opacity-80`}/>
      <p className="text-[11px] font-extrabold truncate pl-4 leading-tight">{course.title}</p>
      <p className="text-[10px] font-semibold opacity-55 pl-4 leading-tight">{course.timeLabel}</p>
    </motion.div>
  )
}

// ─── Expanded Course Overlay ──────────────────────────────────────────────────

interface ExpandedOverlayProps {
  course: CalendarCourse
  animatedDuration: string
  currentPlan: Array<{ title: string; duration: string }>
  onClose: () => void
  onOpenCourse: () => void
  onAddBrief: () => void
  onCreateCourse: () => void
}

function ExpandedCourseOverlay({
  course, animatedDuration, currentPlan,
  onClose, onOpenCourse, onAddBrief, onCreateCourse,
}: ExpandedOverlayProps) {
  const s = STATUS_STYLES[course.status]

  const cta =
    course.status === 'generated'     ? { label: 'Ouvrir le cours →', action: onOpenCourse  } :
    course.status === 'missing-brief' ? { label: 'Ajouter un brief',  action: onAddBrief    } :
                                        { label: 'Créer ce cours',    action: onCreateCourse }

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 lg:p-16"
      initial={{ backgroundColor: 'rgba(15,23,42,0)' }}
      animate={{ backgroundColor: 'rgba(15,23,42,0.42)' }}
      exit={{ backgroundColor: 'rgba(15,23,42,0)' }}
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        layoutId={`event-card-${course.id}`}
        className="bg-white rounded-3xl shadow-modal w-full max-w-[520px] overflow-hidden cursor-default"
        transition={{ type: 'spring', stiffness: 310, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className={`relative bg-gradient-to-br ${s.gradFrom} ${s.gradTo} px-7 pt-7 pb-10 overflow-hidden`}>
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10"/>
          <div className="absolute right-8  -bottom-8  w-32 h-32 rounded-full bg-white/8"/>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <XIcon/>
          </button>

          <div className="relative z-10 space-y-3">
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">{course.school}</p>
            <h2 className="text-[22px] font-extrabold text-white leading-snug tracking-tight">{course.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/18 text-white/90 text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                {s.badgeLabel}
              </span>
              <span className="text-white/55 text-[11px] font-semibold">{course.timeLabel}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 pt-6 pb-7 space-y-5">
          {course.status === 'generated' && (
            <>
              <div className="flex items-stretch gap-4 bg-slate-50/60 border border-slate-100/60 rounded-2xl p-4">
                {[
                  { label: 'Objectif',   value: course.targetDuration, accent: false },
                  { label: 'Estimation', value: animatedDuration,       accent: true  },
                  { label: 'Slides',     value: '18',                   accent: false },
                ].map((stat, i) => (
                  <React.Fragment key={stat.label}>
                    {i > 0 && <div className="w-px bg-slate-200 self-stretch"/>}
                    <div className="flex-1 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                      <p className={`text-xl font-extrabold leading-none ${stat.accent ? 'text-indigo-600 font-mono' : 'text-slate-800'}`}>
                        {stat.value}
                      </p>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Plan du cours</p>
                <div className="space-y-0.5 max-h-[186px] overflow-y-auto pr-1">
                  {currentPlan.map((sec, i) => (
                    <div key={sec.title} className="flex items-center gap-3 py-2.5 px-3 border-b border-slate-100/60 last:border-0 hover:bg-slate-50/60 rounded-xl transition-colors group">
                      <span className="text-[10px] font-bold text-slate-300 font-mono w-5 flex-shrink-0 group-hover:text-indigo-400 transition-colors">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-xs text-slate-700 flex-1 font-semibold">{sec.title}</span>
                      <span className="text-xs font-extrabold text-indigo-600 flex-shrink-0">{sec.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {course.status === 'missing-brief' && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-3xl">📄</span>
              </div>
              <p className="text-sm font-extrabold text-slate-800 mb-1.5">Brief manquant</p>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-[260px] mx-auto">
                Ajoutez un brief pour que l'IA génère votre cours automatiquement.
              </p>
            </div>
          )}

          {course.status === 'to-prepare' && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-3xl">✨</span>
              </div>
              <p className="text-sm font-extrabold text-slate-800 mb-1.5">Cours à préparer</p>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-[260px] mx-auto">
                Définissez le type de cours et importez votre brief pour commencer.
              </p>
            </div>
          )}

          <button
            onClick={cta.action}
            className="w-full py-3.5 rounded-btn bg-primary text-white text-sm font-extrabold hover:bg-primary-hover hover:-translate-y-[1px] hover:shadow-glow active:translate-y-0 active:scale-[0.98] transition-all duration-300 shadow-sm shadow-primary/25"
          >
            {cta.label}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Month Dropdown ───────────────────────────────────────────────────────────

interface MonthDropdownProps {
  year: number
  month: number
  currentYear: number
  onSelectMonth: (y: number, m: number) => void
  onClose: () => void
}

function MonthDropdown({ year, month, currentYear, onSelectMonth, onClose }: MonthDropdownProps) {
  const [displayYear, setDisplayYear] = useState(year)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-0 mt-2 z-40 bg-white rounded-2xl border border-slate-100 p-3 w-52"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(15,23,42,0.10))' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Year row */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          onClick={() => setDisplayYear(y => y - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft/>
        </button>
        <span className="text-sm font-extrabold text-slate-800">{displayYear}</span>
        <button
          onClick={() => setDisplayYear(y => y + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronRight/>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {MONTH_NAMES.map((name, i) => {
          const isActive      = i === month && displayYear === year
          const isThisMonth   = i === new Date().getMonth() && displayYear === currentYear
          return (
            <button
              key={name}
              onClick={() => { onSelectMonth(displayYear, i); onClose() }}
              className={`relative py-1.5 px-1 text-[11px] font-bold rounded-xl transition-all duration-150 ${
                isActive ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {name.slice(0, 3)}
              {isThisMonth && !isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400"/>
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── BentoCalendar Main ───────────────────────────────────────────────────────

export default function BentoCalendar({
  courses, animatedMinutes, currentPlan, formatTime,
  onOpenCourse, onAddBrief, onCreateCourse,
}: BentoCalendarProps) {
  const today = useMemo(() => new Date(), [])

  const [year,         setYear]         = useState(today.getFullYear())
  const [month,        setMonth]        = useState(today.getMonth())
  const [expandedId,   setExpandedId]   = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  // Single shared tooltip state — renders via portal, never clipped
  const [tooltip,      setTooltip]      = useState<TooltipState | null>(null)

  const days  = useMemo(() => getMonthGrid(year, month), [year, month])
  const rows  = days.length / 7

  const coursesByDate = useMemo(() => {
    const map: Record<string, CalendarCourse[]> = {}
    courses.forEach(c => {
      if (!map[c.isoDate]) map[c.isoDate] = []
      map[c.isoDate].push(c)
    })
    return map
  }, [courses])

  const expandedCourse = courses.find(c => c.id === expandedId) ?? null
  const todayISO       = today.toISOString().split('T')[0]
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  function prevMonth() { month === 0  ? (setYear(y => y - 1), setMonth(11)) : setMonth(m => m - 1) }
  function nextMonth() { month === 11 ? (setYear(y => y + 1), setMonth(0))  : setMonth(m => m + 1) }
  function goToToday() { setYear(today.getFullYear()); setMonth(today.getMonth()) }

  const showTooltip = (course: CalendarCourse, rect: DOMRect) => setTooltip({ course, rect })
  const hideTooltip = () => setTooltip(null)

  return (
    <LayoutGroup id="bento-calendar">
      <div
        className="flex flex-col gap-4 h-full"
        onClick={() => { showDropdown && setShowDropdown(false); hideTooltip() }}
      >

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">

            {/* Month/Year dropdown button */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowDropdown(v => !v) }}
                className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-btn px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50 transition-colors shadow-sm"
              >
                {MONTH_NAMES[month]} {year}
                <motion.span
                  animate={{ rotate: showDropdown ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400 mt-0.5"
                >
                  <ChevronDown/>
                </motion.span>
              </button>
              <AnimatePresence>
                {showDropdown && (
                  <MonthDropdown
                    year={year} month={month}
                    currentYear={today.getFullYear()}
                    onSelectMonth={(y, m) => { setYear(y); setMonth(m) }}
                    onClose={() => setShowDropdown(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Prev / Next arrows */}
            <div className="flex items-center overflow-hidden bg-white border border-slate-200/80 rounded-btn shadow-sm">
              <button onClick={prevMonth} className="px-3 py-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors">
                <ChevronLeft/>
              </button>
              <div className="w-px h-4 bg-slate-200"/>
              <button onClick={nextMonth} className="px-3 py-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors">
                <ChevronRight/>
              </button>
            </div>

            {/* "Aujourd'hui" — only when away from current month */}
            <AnimatePresence>
              {!isCurrentMonth && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={goToToday}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-btn border border-indigo-100/80 transition-all duration-200"
                >
                  Aujourd'hui
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Status legend pills */}
          <div className="flex items-center gap-2">
            {(
              [
                { status: 'generated'     as const, label: 'Généré'         },
                { status: 'missing-brief' as const, label: 'Brief manquant' },
                { status: 'to-prepare'   as const, label: 'À préparer'     },
              ]
            ).map(({ status, label }) => {
              const count = courses.filter(c => c.status === status).length
              const s = STATUS_STYLES[status]
              return (
                <div key={status} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${s.legendBg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
                  {label}
                  <span className="font-extrabold">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Calendar Body ── */}
        <div className="flex-1 min-h-0 flex flex-col gap-2">

          {/* Day-of-week header — no borders, floats above the bento grid */}
          <div className="grid grid-cols-7 gap-2 px-0.5">
            {DAY_LABELS.map((d, i) => (
              <div
                key={d}
                className={`text-center text-[11px] font-extrabold uppercase tracking-wider py-1 ${
                  i >= 5 ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Bento Grid — bg-slate-100/50 background, white floating cards, no overflow-hidden */}
          <div className="flex-1 min-h-0 rounded-3xl bg-slate-100/60 p-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${year}-${month}`}
                variants={gridVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="grid grid-cols-7 gap-2 h-full"
                style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
              >
                {days.map((day, idx) => {
                  const isToday   = day.date === todayISO
                  const colIdx    = idx % 7
                  const isWeekend = colIdx >= 5
                  const events    = coursesByDate[day.date] || []

                  return (
                    <motion.div
                      key={day.date}
                      variants={cellVariants}
                      className={[
                        'relative flex flex-col p-2 gap-1 rounded-2xl',
                        // White card for current-month weekdays, dimmer for others
                        day.isCurrentMonth && !isWeekend
                          ? 'bg-white shadow-sm shadow-slate-200/60'
                          : day.isCurrentMonth && isWeekend
                            ? 'bg-white/60'
                            : 'bg-white/25',
                        // Soft indigo ring on today's cell
                        isToday ? 'ring-2 ring-indigo-400/30' : '',
                      ].join(' ')}
                    >
                      {/* Day number */}
                      <div className="flex-shrink-0">
                        <span
                          className={[
                            'inline-flex items-center justify-center w-7 h-7 rounded-full',
                            'text-xs font-extrabold select-none cursor-default transition-all duration-200',
                            isToday
                              ? // Gradient + glow instead of flat colour
                                'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30 ring-4 ring-indigo-500/15'
                              : day.isCurrentMonth
                                ? isWeekend
                                  ? 'text-slate-400'
                                  : 'text-slate-700'
                                : 'text-slate-300',
                          ].join(' ')}
                        >
                          {day.day}
                        </span>
                      </div>

                      {/* Event pills */}
                      <div className="flex flex-col gap-1 flex-1 min-h-0">
                        {events.map(course => (
                          <CalendarEventPill
                            key={course.id}
                            course={course}
                            isExpanded={expandedId === course.id}
                            onExpand={() => { hideTooltip(); setExpandedId(course.id) }}
                            onShowTooltip={showTooltip}
                            onHideTooltip={hideTooltip}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Portal Tooltip (document.body, never clipped) ── */}
      <AnimatePresence>
        {tooltip && <CalendarTooltip tooltip={tooltip}/>}
      </AnimatePresence>

      {/* ── Hero Expanded Overlay ── */}
      <AnimatePresence>
        {expandedId && expandedCourse && (
          <ExpandedCourseOverlay
            course={expandedCourse}
            animatedDuration={
              expandedCourse.id === 'ia-marketing'
                ? formatTime(animatedMinutes)
                : expandedCourse.estimatedDuration ?? ''
            }
            currentPlan={currentPlan}
            onClose={() => setExpandedId(null)}
            onOpenCourse={() => { setExpandedId(null); onOpenCourse()    }}
            onAddBrief={() =>   { setExpandedId(null); onAddBrief()      }}
            onCreateCourse={() =>{ setExpandedId(null); onCreateCourse() }}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}
