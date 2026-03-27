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
      aria-label={label}
      className={[
        'flex items-center justify-center',
        compact ? 'min-w-[44px] min-h-[32px] px-1 py-0.5' : 'min-w-[52px] min-h-[40px] px-1.5 py-1',
        'select-none',
        'transition-colors duration-200',
        active ? 'text-[#C29901]' : 'text-[#88887D] hover:text-[#FCFAF7]',
      ].join(' ')}
    >
      <div className="leading-none">
        {React.cloneElement(icon, { fill: active ? '#C29901' : 'none', size: compact ? 19 : 22 })}
      </div>
    </button>
  )
}
