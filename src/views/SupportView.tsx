import { useState } from 'react'
import { ArrowLeft, Mail, Check } from 'lucide-react'
import type { ThemeTokens } from '@/types'

interface SupportViewProps {
  onBack: () => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
  adminEmail: string
  onSendSupport: (subject: string, message: string) => void
}

export function SupportView({ onBack, theme, t, adminEmail, onSendSupport }: SupportViewProps) {
  const [sent, setSent] = useState(false)
  const [subject, setSubject] = useState('Allgemeine Anfrage')
  const [message, setMessage] = useState('')
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanMessage = message.trim()
    if (!cleanMessage) return
    onSendSupport(subject, cleanMessage)
    setSent(true)
    setMessage('')
  }

  return (
    <div className={`h-full flex flex-col ${theme.bg} ${theme.text}`}>
      <div className={`app-gutter py-3 border-b ${theme.border} flex items-center gap-3`}>
        <button onClick={onBack} className={`p-1 -ml-2 ${theme.text}`}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">{t?.support?.title}</h2>
      </div>

      <div className="app-gutter py-6 flex-1 overflow-y-auto">
        {!sent ? (
          <form onSubmit={handleSend} className="space-y-6">
            <div className="text-center mb-8">
              <a
                href={`mailto:${adminEmail}`}
                className="w-16 h-16 bg-[#4A5D4E]/10 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-[#4A5D4E]/20 transition-colors"
                aria-label={`Email ${adminEmail}`}
              >
                <Mail size={32} className="text-[#4A5D4E]" />
              </a>
              <h3 className="text-lg font-bold">{t?.support?.help}</h3>
              <p className={`text-sm ${theme.textSec} mt-2`}>{t?.support?.sub}</p>
              <a href={`mailto:${adminEmail}`} className="text-xs text-[#4A5D4E] underline underline-offset-2 mt-1 inline-block">
                {adminEmail}
              </a>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase mb-1 ${theme.text}`}>
                  {t?.support?.subject}
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full p-3 rounded-lg text-sm focus:outline-none focus:border-[#4A5D4E] ${theme.input}`}
                >
                  <option>Allgemeine Anfrage</option>
                  <option>Problem mit einer Bestellung</option>
                  <option>Technisches Problem</option>
                  <option>Mitgliedschaft</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase mb-1 ${theme.text}`}>
                  {t?.support?.msg}
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full p-3 rounded-lg h-32 resize-none text-sm focus:outline-none focus:border-[#4A5D4E] ${theme.input}`}
                  placeholder="..."
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#0D1A15] text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-[#4A5D4E] transition-colors"
            >
              {t?.support?.send}
            </button>
          </form>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-[#34A853]/10 rounded-full flex items-center justify-center mb-6">
              <Check size={40} className="text-[#34A853]" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t?.support?.thanks}</h3>
            <p className={`${theme.textSec} mb-8`}>{t?.support?.received}</p>
            <button onClick={onBack} className={`px-8 py-3 rounded-lg font-bold ${theme.card} ${theme.text}`}>
              Zurück
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
