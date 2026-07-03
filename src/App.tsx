import { useState, useEffect, useMemo } from 'react'
import { BRIEF_TEXT } from './mocks/briefText'
import { GENERATED_COURSE } from './mocks/courseData'
import { SidebarProvider } from './contexts/SidebarContext'

import Landing from './screens/Landing'
import ContentType from './screens/ContentType'
import BriefUpload from './screens/BriefUpload'
import AIRefinement from './screens/AIRefinement'
import Generation from './screens/Generation'
import CoursePreview from './screens/CoursePreview'
import AccountCreation from './screens/AccountCreation'
import Tutorial from './screens/Tutorial'
import ProfilePersonalization from './screens/ProfilePersonalization'
import Planning from './screens/Planning'

type Step =
  | 'landing'
  | 'contentType'
  | 'briefUpload'
  | 'aiRefinement'
  | 'generation'
  | 'coursePreview'
  | 'accountCreation'
  | 'tutorial'
  | 'planning'
  | 'profilePersonalization'

export default function App() {
  const [step, setStep]                   = useState<Step>('landing')
  const [briefText, setBriefText]         = useState(BRIEF_TEXT)
  const [duration, setDuration]           = useState('2h')
  const [level, setLevel]                 = useState<'Débutant' | 'Intermédiaire' | 'Avancé'>('Intermédiaire')
  const [courseType, setCourseType]       = useState<'Théorique' | 'Pratique' | 'Mixte'>('Mixte')
  const [generationProgress, setGenerationProgress] = useState(0)
  const [isCalibrated, setIsCalibrated]   = useState(false)
  const [showCalibrationResult, setShowCalibrationResult] = useState(false)
  const [showAccountGate, setShowAccountGate] = useState(false)
  const [accountCreated, setAccountCreated]   = useState(false)

  // Auto-advance Generation screen
  useEffect(() => {
    if (step !== 'generation') return
    setGenerationProgress(0)
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 5) { clearInterval(interval); return 5 }
        return prev + 1
      })
    }, 800)
    return () => clearInterval(interval)
  }, [step])

  const goTo = (s: Step) => setStep(s)

  const requireAccount = (thenGoTo: Step) => {
    if (accountCreated) goTo(thenGoTo)
    else setShowAccountGate(true)
  }

  const completedSidebarItems = useMemo(() => {
    const order = ['accueil', 'planning', 'brief', 'ia', 'cours', 'profil']
    const stepToSidebar: Record<string, string> = {
      landing: 'accueil', contentType: 'planning', briefUpload: 'brief',
      aiRefinement: 'ia', generation: 'ia', coursePreview: 'cours',
      accountCreation: 'cours', tutorial: 'profil', planning: 'planning',
      profilePersonalization: 'profil',
    }
    const current = stepToSidebar[step] ?? 'accueil'
    const currentIndex = order.indexOf(current)
    return order.slice(0, currentIndex)
  }, [step])

  function renderScreen() {
    switch (step) {
      case 'landing':
        return (
          <Landing
            onStart={() => goTo('contentType')}
            onDemo={() => goTo('contentType')}
            onConnexion={() => goTo('accountCreation')}
            isLoggedIn={accountCreated}
          />
        )

      case 'contentType':
        return (
          <ContentType
            onSelectCours={() => goTo('briefUpload')}
            onBack={() => goTo('landing')}
            isLoggedIn={accountCreated}
          />
        )

      case 'briefUpload':
        return (
          <BriefUpload
            briefText={briefText}
            onBriefChange={setBriefText}
            onSubmit={() => goTo('aiRefinement')}
            onBack={() => goTo('contentType')}
            isLoggedIn={accountCreated}
          />
        )

      case 'aiRefinement':
        return (
          <AIRefinement
            duration={duration}
            level={level}
            type={courseType}
            onDurationChange={setDuration}
            onLevelChange={setLevel}
            onTypeChange={setCourseType}
            onGenerate={() => goTo('generation')}
            onBack={() => goTo('briefUpload')}
            isLoggedIn={accountCreated}
          />
        )

      case 'generation':
        return (
          <Generation
            progress={generationProgress}
            onComplete={() => goTo('coursePreview')}
            isLoggedIn={accountCreated}
          />
        )

      case 'coursePreview':
        return (
          <CoursePreview
            isCalibrated={isCalibrated}
            calibratedDuration={GENERATED_COURSE.calibratedDurationLabel}
            isLoggedIn={accountCreated}
            onSave={() => requireAccount('coursePreview')}
            onExport={() => requireAccount('coursePreview')}
            onPersonalize={() => requireAccount('profilePersonalization')}
            onViewPlanning={() => goTo('planning')}
            onBack={() => goTo('briefUpload')}
          />
        )

      case 'accountCreation':
        return (
          <AccountCreation
            onCreateAccount={() => { setAccountCreated(true); goTo('tutorial') }}
            onConnexion={() => { setAccountCreated(true); goTo('tutorial') }}
            onBack={() => goTo('coursePreview')}
            isLoggedIn={accountCreated}
          />
        )

      case 'tutorial':
        return (
          <Tutorial
            onStart={() => goTo('planning')}
            isLoggedIn={accountCreated}
          />
        )

      case 'planning':
        return (
          <Planning
            onOpenCourse={() => goTo('coursePreview')}
            onCalibrateProfile={() => goTo('coursePreview')}
            onAddBrief={() => goTo('briefUpload')}
            onCreateCourse={() => goTo('contentType')}
            isLoggedIn={accountCreated}
          />
        )

      case 'profilePersonalization':
        return (
          <ProfilePersonalization
            onCalibrate={() => setShowCalibrationResult(true)}
            onSkip={() => goTo('coursePreview')}
            showCalibrationResult={showCalibrationResult}
            onDone={() => {
              setIsCalibrated(true)
              setShowCalibrationResult(false)
              goTo('coursePreview')
            }}
            isLoggedIn={accountCreated}
          />
        )

      default:
        return (
          <Landing
            onStart={() => goTo('contentType')}
            onDemo={() => goTo('contentType')}
            onConnexion={() => goTo('accountCreation')}
            isLoggedIn={accountCreated}
          />
        )
    }
  }

  return (
    <SidebarProvider completedSidebarItems={completedSidebarItems}>
      {renderScreen()}

      {/* Account gate modal */}
      {showAccountGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-card shadow-modal p-8 w-full max-w-md mx-4 border border-slate-100/90">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100/60 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-emerald-600 text-xl font-bold">✓</span>
              </div>
              <h2 className="text-xl font-extrabold text-ink mb-1.5 tracking-tight">Votre cours est prêt.</h2>
              <p className="text-sm text-slate-500 font-medium">
                Créez un compte gratuit pour enregistrer, exporter et personnaliser votre cours.
              </p>
            </div>
            <button
              onClick={() => { setShowAccountGate(false); goTo('accountCreation') }}
              className="w-full bg-primary text-white hover:bg-primary-hover hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:scale-[0.98] rounded-btn py-3 text-sm font-bold shadow-sm transition-all duration-300 ease-out mb-3"
            >
              Créer mon compte gratuit
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aucune carte bancaire demandée.</p>
            <button
              onClick={() => setShowAccountGate(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-4 transition-colors duration-300 font-bold"
            >
              Continuer sans compte
            </button>
          </div>
        </div>
      )}
    </SidebarProvider>
  )
}
