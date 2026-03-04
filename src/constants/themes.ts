import type { ThemeTokens } from '@/types'

// Farbschema: Creamy Alabaster 60% | Obsidian Green 30% | Olive Grove ~5% | Silver Birch ~3% | Dusty Rose ~2%
export const THEMES: Record<'light' | 'dark', ThemeTokens> = {
  light: {
    bg: 'bg-[#FCFAF7]',
    card: 'bg-white',
    text: 'text-[#0D1A15]',
    textSec: 'text-[#88887D]',
    border: 'border-[#88887D]/20',
    nav: 'bg-[#0D1A15] text-[#FCFAF7]',
    accent: 'text-[#4A5D4E]',
    input: 'bg-white border-[#88887D]/30',
    mapFilterBg: 'bg-white/90',
    mapOverlayText: 'text-[#0D1A15]',
  },
  dark: {
    bg: 'bg-[#0D1A15]',
    card: 'bg-[#1A2621]',
    text: 'text-[#FCFAF7]',
    textSec: 'text-[#88887D]',
    border: 'border-[#2C3E34]',
    nav: 'bg-[#050A08] text-[#FCFAF7]',
    accent: 'text-[#8BA892]',
    input: 'bg-[#1A2621] border-[#2C3E34] text-[#FCFAF7]',
    mapFilterBg: 'bg-[#1A2621]/90',
    mapOverlayText: 'text-[#FCFAF7]',
  },
}
