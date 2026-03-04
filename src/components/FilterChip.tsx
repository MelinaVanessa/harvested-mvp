import type { ThemeTokens } from '@/types'

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  theme: ThemeTokens
}

export function FilterChip({ label, active, onClick, theme }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
        active
          ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
          : `bg-transparent ${theme.text} ${theme.border} hover:opacity-70`
      }`}
    >
      {label}
    </button>
  )
}
