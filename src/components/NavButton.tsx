import React from 'react'
import type { ThemeTokens } from '@/types'

interface NavButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactElement
  label: string
  theme: ThemeTokens
}

export function NavButton({ active, onClick, icon, label, theme: _theme }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-center',
        'min-w-[56px] min-h-[44px] px-2 py-1',
        'gap-1 select-none',
        'transition-colors duration-200',
        active ? 'text-[#C29901]' : 'text-[#88887D] hover:text-[#FCFAF7]',
      ].join(' ')}
    >
      <div className="leading-none">
        {React.cloneElement(icon, { fill: active ? '#C29901' : 'none', size: 22 })}
      </div>
      <span className={`text-[11px] leading-none font-medium ${active ? 'text-[#FCFAF7]' : 'text-[#88887D]'}`}>{label}</span>
    </button>
  )
}
