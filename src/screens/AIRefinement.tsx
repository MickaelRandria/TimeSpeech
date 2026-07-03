import React, { useState, useEffect, useRef } from 'react'
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

const Q1 = ['Cours présentiel', 'Capsule vidéo', 'Formation à distance']
const Q2 = ['Atelier pratique', 'Cours magistral', 'Séminaire workshop']
const Q3 = ['Maîtriser des outils IA', 'Comprendre les enjeux', 'Développer des compétences']

const PLAN = [
  { title: "Introduction à l'IA générative", duration: '10 min', slides: 3 },
  { title: "L'IA au service du marketing",   duration: '30 min', slides: 8 },
  { title: 'Création de contenu assistée',   duration: '35 min', slides: 6 },
  { title: 'Cas pratique : campagne IA',     duration: '30 min', slides: 7 },
  { title: 'Synthèse et prise en main',      duration: '13 min', slides: 4 },
]

export default function AIRefinement({ onGenerate, onBack, isLoggedIn }: AIRefinementProps) {
  const [phase, setPhase]     = useState(0)
  const [answer1, setAnswer1] = useState<string | null>(null)
  const [answer2, setAnswer2] = useState<string | null>(null)
  const [answer3, setAnswer3] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase > 0) {
      const t = setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
      return () => clearTimeout(t)
    }
  }, [phase])

  function pick1(val: string) { setAnswer1(val); setTimeout(() => setPhase(1), 350) }
  function pick2(val: string) { setAnswer2(val); setTimeout(() => setPhase(2), 350) }
  function pick3(val: string) { setAnswer3(val); setTimeout(() => setPhase(3), 350) }

  const totalSlides = PLAN.reduce((s, p) => s + p.slides, 0)

  return (
    <AppShell activeSidebarItem="ia" stepLabel="Dialogue IA" showDemoStatus stepProgress="Étape 3 sur 6" isLoggedIn={isLoggedIn} userInitials="JB" userName="Julien">
      <div className="max-w-2xl mx-auto pb-16 flex flex-col gap-5">

        <button onClick={onBack} className="self-start flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors mb-3">
          <span>←</span> Retour
        </button>

        <ChatMessage text="Bonjour, Julien ! J'ai analysé votre brief sur l'IA Marketing — un brief très riche. Pour générer un cours précisément calibré sur votre créneau de 2h00, j'ai besoin de vous poser 3 questions rapides." />

        <ChatMessage text="Pour quel usage principal préparez-vous ce cours ?">
          <div className="flex flex-wrap gap-2 mt-3">
            {Q1.map(opt => (
              <AnswerPill key={opt} label={opt} selected={answer1 === opt} disabled={answer1 !== null && answer1 !== opt} onClick={() => { if (!answer1) pick1(opt) }} />
            ))}
          </div>
        </ChatMessage>

        {phase >= 1 && (
          <div className="animate-fade-in-up">
            <ChatMessage text="Quelle est la nature principale de la session ?">
              <div className="flex flex-wrap gap-2 mt-3">
                {Q2.map(opt => (
                  <AnswerPill key={opt} label={opt} selected={answer2 === opt} disabled={answer2 !== null && answer2 !== opt} onClick={() => { if (!answer2) pick2(opt) }} />
                ))}
              </div>
            </ChatMessage>
          </div>
        )}

        {phase >= 2 && (
          <div className="animate-fade-in-up">
            <ChatMessage text="Quel est l'objectif pédagogique principal de vos étudiants ?">
              <div className="flex flex-wrap gap-2 mt-3">
                {Q3.map(opt => (
                  <AnswerPill key={opt} label={opt} selected={answer3 === opt} disabled={answer3 !== null && answer3 !== opt} onClick={() => { if (!answer3) pick3(opt) }} />
                ))}
              </div>
            </ChatMessage>
          </div>
        )}

        {phase >= 3 && (
          <div className="animate-fade-in-up">
            <ChatMessage text="Parfait ! Voici le plan de votre cours calibré pour 2h00. Tout est prêt à être généré.">
              <div className="mt-4 rounded-2xl border border-primary/10 bg-primary/[0.03] overflow-hidden">
                <div className="flex items-stretch border-b border-primary/10">
                  {[
                    { label: 'Durée cible', value: '2h00' },
                    { label: 'Estimation',  value: '1h58' },
                    { label: 'Slides',      value: String(totalSlides) },
                  ].map((stat, i) => (
                    <div key={stat.label} className={`flex-1 text-center py-3 px-2 ${i > 0 ? 'border-l border-primary/10' : ''}`}>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                      <p className="text-sm font-black text-ink leading-tight">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div>
                  {PLAN.map((section, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i > 0 ? 'border-t border-slate-50' : ''}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <p className="text-xs font-semibold text-ink truncate">{section.title}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-[10px] text-slate-400 font-medium">{section.duration}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-[10px] text-slate-400 font-medium">{section.slides} slides</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ChatMessage>
          </div>
        )}

        {phase >= 3 && (
          <div className="animate-fade-in-up flex justify-center pt-2">
            <button
              onClick={onGenerate}
              className="px-8 py-3.5 bg-primary text-white rounded-btn font-bold text-sm shadow-glow hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(90,87,255,0.35)] transition-all duration-200"
            >
              Générer le cours calibré →
            </button>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </AppShell>
  )
}
