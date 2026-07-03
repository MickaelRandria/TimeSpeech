import React, { useState } from 'react'
import AppShell from '../components/AppShell'
import Card from '../components/Card'
import Button from '../components/Button'

interface AccountCreationProps {
  onCreateAccount: () => void
  onConnexion: () => void
  onBack: () => void
  isLoggedIn?: boolean
}

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const MicrosoftIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
    <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
    <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
    <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
  </svg>
)

const benefits = [
  'Cours sauvegardé et accessible à tout moment',
  'Modification des slides et du plan',
  'Profil vocal personnalisé pour des estimations précises',
  'Historique de vos cours générés',
]

export default function AccountCreation({ onCreateAccount, onConnexion, onBack, isLoggedIn }: AccountCreationProps) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const isFormValid = email.trim().length > 0 && password.trim().length > 0

  return (
    <AppShell activeSidebarItem="profil" stepLabel="Créer un compte" showDemoStatus={true} isLoggedIn={isLoggedIn} userInitials="JB" userName="Julien">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — benefits panel */}
        <div
          className="lg:col-span-2 rounded-card p-8 flex flex-col justify-between shadow-md"
          style={{ background: 'linear-gradient(165deg, #5A57FF 0%, #7c3aed 100%)' }}
        >
          <div>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4">CE QUE VOUS DÉBLOQUEZ</p>
            <h2 className="text-2xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Votre cours est prêt.<br />
              <span className="text-violet-200">Enregistrez-le gratuitement.</span>
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-white/90 font-medium">
                  <span className="text-emerald-300 font-extrabold mt-0.5 flex-shrink-0">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-8">Aucune carte bancaire demandée.</p>
        </div>

        {/* Right — form card */}
        <Card padding="p-8" className="lg:col-span-3 border border-slate-100/90 shadow-card">
          <h2 className="text-2xl font-extrabold text-ink tracking-tight mb-1">Créez votre compte gratuit</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">Accédez à tous vos cours, slides et profil orateur.</p>

          {/* SSO */}
          <div className="space-y-3 mb-6">
            <button type="button" onClick={onCreateAccount} className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-btn py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:-translate-y-[0.5px] hover:shadow-sm transition-all duration-300 ease-out">
              <GoogleIcon /> Continuer avec Google
            </button>
            <button type="button" onClick={onCreateAccount} className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-btn py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:-translate-y-[0.5px] hover:shadow-sm transition-all duration-300 ease-out">
              <MicrosoftIcon /> Continuer avec Microsoft
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Email/password */}
          <div className="space-y-3 mb-6">
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/20 rounded-btn px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/80 transition-all duration-300 ease-out"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50/20 rounded-btn px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/80 transition-all duration-300 ease-out"
            />
          </div>

          <div className={!isFormValid ? 'opacity-40 pointer-events-none' : ''}>
            <Button variant="primary" fullWidth size="lg" onClick={onCreateAccount}>
              Créer mon compte gratuit
            </Button>
          </div>

          <p className="text-center text-xs text-primary hover:text-primary-hover hover:underline cursor-pointer mt-5 font-semibold" onClick={onConnexion}>
            Déjà un compte ? Se connecter
          </p>
        </Card>
      </div>

      <div className="mt-4">
        <Button variant="ghost" onClick={onBack}>← Retour</Button>
      </div>
    </AppShell>
  )
}
