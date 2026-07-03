import React from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-card shadow-modal p-8 w-full max-w-md mx-4 relative border border-slate-100/80 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {title && <h2 className="text-xl font-extrabold text-ink mb-4 tracking-tight">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
