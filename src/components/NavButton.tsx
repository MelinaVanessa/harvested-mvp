import React from 'react'
import type { ThemeTokens } from '@/types'

interface NavButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactElement
  label: string
  theme: ThemeTokens
}

export function NavButton({ active, onClick, icon, label, theme }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-200 ${active ? 'text-[#C29901] scale-105' : 'text-[#88887D] hover:text-[#FCFAF7]'}`}
    >
      <div>{React.cloneElement(icon, { fill: active ? '#C29901' : 'none' })}</div>
      <span className={`text-[10px] font-medium ${active ? 'text-[#FCFAF7]' : 'text-[#88887D]'}`}>{label}</span>
    </button>
  )
}
