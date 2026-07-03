import React from 'react'
import { motion } from 'framer-motion'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover hover:shadow-md rounded-btn font-semibold shadow-sm transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
  secondary: 'bg-white text-primary border border-primary/25 hover:bg-primary/5 hover:border-primary/45 hover:shadow-sm rounded-btn font-semibold shadow-sm transition-all duration-300 ease-out disabled:opacity-50 disabled:shadow-none',
  tertiary: 'text-primary font-semibold hover:underline underline-offset-4 transition-all duration-300 disabled:opacity-50',
  ghost: 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-btn transition-all duration-300 disabled:opacity-50',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs tracking-wide',
  md: 'px-5 py-2.5 text-sm tracking-wide',
  lg: 'px-7 py-3 text-base tracking-wide',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </motion.button>
  )
}
