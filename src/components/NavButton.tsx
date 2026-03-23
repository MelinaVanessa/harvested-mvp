import React from 'react'
import type { ThemeTokens } from '@/types'

interface NavButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactElement
  label: string
  theme: ThemeTokens
  compact?: boolean
}

export function NavButton({ active, onClick, icon, label, theme: _theme, compact = false }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-center',
        compact ? 'min-w-[48px] min-h-[38px] px-1.5 py-0.5 gap-0.5' : 'min-w-[56px] min-h-[44px] px-2 py-1 gap-1',
        'select-none',
        'transition-colors duration-200',
        active ? 'text-[#C29901]' : 'text-[#88887D] hover:text-[#FCFAF7]',
      ].join(' ')}
    >
      <div className="leading-none">
        {React.cloneElement(icon, { fill: active ? '#C29901' : 'none', size: compact ? 19 : 22 })}
      </div>
      <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} leading-none font-medium ${active ? 'text-[#FCFAF7]' : 'text-[#88887D]'}`}>{label}</span>
    </button>
  )
}
