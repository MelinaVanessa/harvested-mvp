import type { ThemeTokens } from '@/types'

interface FilterChipProps {
  label: string
  active: boolean
  onClick: () => void
  theme: ThemeTokens
  highContrast?: boolean
}

export function FilterChip({ label, active, onClick, theme, highContrast = false }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
        highContrast
          ? active
            ? 'bg-[#0D1A15] text-[#FCFAF7] border-[#0D1A15] shadow-md'
            : `bg-white/95 text-[#0D1A15] border-black/20 shadow-sm hover:bg-white`
          : active
            ? 'bg-[#4A5D4E] text-white border-[#4A5D4E]'
            : `bg-transparent ${theme.text} ${theme.border} hover:opacity-70`
      }`}
    >
      {label}
    </button>
  )
}
