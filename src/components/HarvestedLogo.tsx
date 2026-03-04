/**
 * Logo-Emblem: Kreis + H in Obsidian (#0D1A15), Ranke/Blätter/Schmetterling in Olive Grove (#4A5D4E)
 */
const OBSIDIAN = '#0D1A15'
const OLIVE = '#4A5D4E'

export function HarvestedLogo({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Kreis – Obsidian */}
      <circle cx="60" cy="60" r="50" stroke={OBSIDIAN} strokeWidth="2.5" fill="none" />
      {/* Buchstabe H – Obsidian */}
      <text
        x="60"
        y="80"
        fontSize="54"
        fontFamily="Georgia, 'Times New Roman', serif"
        textAnchor="middle"
        fill={OBSIDIAN}
        fontWeight="bold"
        letterSpacing="2"
      >
        H
      </text>
      {/* Ranke – Olive: von links unten am H nach oben/rechts, überquert die Balken des H */}
      <path
        d="M 38 82 C 38 72 42 62 52 58 C 62 54 72 58 78 48"
        stroke={OLIVE}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Kleine Blätter an der Ranke – Olive */}
      <ellipse cx="42" cy="76" rx="5" ry="3" transform="rotate(-40 42 76)" fill={OLIVE} />
      <ellipse cx="50" cy="62" rx="4" ry="2.5" transform="rotate(-20 50 62)" fill={OLIVE} />
      <ellipse cx="64" cy="54" rx="3.5" ry="2" transform="rotate(10 64 54)" fill={OLIVE} />
      {/* Schmetterling oben rechts am H – Olive (Kontur) */}
      <path
        d="M 76 44 Q 84 38 88 44 Q 84 50 76 48"
        stroke={OLIVE}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 76 48 Q 72 54 76 58 Q 84 54 88 50 Q 86 46 76 48"
        stroke={OLIVE}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 76 44 L 76 48 L 76 58"
        stroke={OLIVE}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
