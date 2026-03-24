import { useState } from 'react'
import { Sprout, ShoppingCart } from 'lucide-react'
import type { UserRole, UserProfile, ThemeTokens } from '@/types'
import { findRegisteredAccountByEmail, upsertRegisteredAccount } from '@/constants/storage'
import { tryAuthLogin, tryAuthRegister } from '@/constants/apiBase'

const WALDGRUEN = '#4A5D4E'
const OFF_WHITE = '#FCFAF7'
const TEXT_MUTED = '#88887D'
const OWNER_EMAIL = 'melina_vanessa.mann@web.de'
const OWNER_PASSWORD = 'adminaccess'

interface LoginViewProps {
  onLogin: (userData?: { id: string; name: string; role: UserRole; profile?: UserProfile }) => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
}

export function LoginView({ onLogin, theme: _theme, t }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('gardener')
  const [authError, setAuthError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    const emailLower = email.trim().toLowerCase()
    const passwordNorm = password.trim()
    if (isRegistering) {
      if (email && password && name) {
        if (emailLower === OWNER_EMAIL) {
          alert('Für dieses Konto bitte einloggen, nicht registrieren.')
          return
        }
        if (findRegisteredAccountByEmail(emailLower)) {
          alert('Diese E-Mail ist bereits registriert. Bitte einloggen.')
          return
        }

        const apiReg = await tryAuthRegister({
          email: emailLower,
          password: passwordNorm,
          name: name.trim(),
          role: selectedRole,
        })
        if (apiReg && 'conflict' in apiReg) {
          alert('Diese E-Mail ist bereits registriert. Bitte einloggen.')
          return
        }
        if (apiReg && 'user' in apiReg) {
          const savedLocal = upsertRegisteredAccount({
            email: emailLower,
            password: passwordNorm,
            userId: apiReg.user.id,
            name: apiReg.user.name,
            role: apiReg.user.role,
          })
          alert(
            savedLocal
              ? `Willkommen bei Harvested, ${name}!`
              : `Willkommen bei Harvested, ${name}!\n\nWichtig: Dieses Gerät konnte deine Zugangsdaten nicht lokal speichern (z. B. privates Fenster). Der Login kann beim nächsten Mal nur funktionieren, wenn die Verbindung zum gleichen Server klappt oder du Speicherung erlaubst.`,
          )
          onLogin({ id: apiReg.user.id, name: apiReg.user.name, role: apiReg.user.role, profile: apiReg.user })
          return
        }

        const id = `u_${Date.now()}`
        const stored = upsertRegisteredAccount({
          email: emailLower,
          password: passwordNorm,
          userId: id,
          name: name.trim(),
          role: selectedRole,
        })
        if (!stored) {
          alert(
            'Dein Konto konnte nicht gespeichert werden (z. B. privates Fenster oder Speicher voll). Ohne Speicherung funktioniert der spätere Login nicht.',
          )
          return
        }
        alert(`Willkommen bei Harvested, ${name}!`)
        onLogin({ id, name: name.trim(), role: selectedRole })
      } else {
        alert('Bitte fülle alle Felder aus.')
      }
    } else {
      // Local + owner before remote API so device-stored accounts always work even if API URL is wrong
      if (emailLower === OWNER_EMAIL && passwordNorm === OWNER_PASSWORD) {
        onLogin({ id: 'u1', name: 'Melina Vanessa Mann', role: 'gardener' })
        return
      }

      const localAccount = findRegisteredAccountByEmail(emailLower)
      if (
        localAccount &&
        (localAccount.password === passwordNorm ||
          localAccount.password === password ||
          localAccount.password.trim() === passwordNorm)
      ) {
        onLogin({ id: localAccount.userId, name: localAccount.name, role: localAccount.role })
        return
      }

      const apiUser = await tryAuthLogin({ email: emailLower, password: passwordNorm })
      if (apiUser) {
        upsertRegisteredAccount({
          email: emailLower,
          password: passwordNorm,
          userId: apiUser.id,
          name: apiUser.name,
          role: apiUser.role,
        })
        onLogin({ id: apiUser.id, name: apiUser.name, role: apiUser.role, profile: apiUser })
        return
      }

      const msg = t?.login?.error ?? 'Ungültige Anmeldedaten.'
      setAuthError(
        `${msg} Stelle sicher, dass du auf „Einloggen“ bist (nicht Registrieren), E-Mail und Passwort exakt wie bei der Registrierung, und kein privates Browserfenster ohne Speicher verwendest.`,
      )
      alert(msg)
    }
  }

  const inputClass =
    'w-full p-3.5 rounded-lg border border-[#4A5D4E]/25 bg-white text-[#0D1A15] placeholder:text-[#88887D]/70 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] transition-colors'
  const labelClass = 'block text-xs font-medium text-[#88887D] mb-1.5'

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center p-6 overflow-y-auto no-scrollbar"
      style={{ backgroundColor: OFF_WHITE }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="flex-1 flex flex-col items-center justify-center min-h-[min-content] py-8">
          <img
            src="/favicon.png?v=removebg"
            alt=""
            width={112}
            height={116}
            className="mx-auto mb-5 h-[7rem] w-[7rem] max-w-[min(28vw,7rem)] object-contain select-none pointer-events-none"
            decoding="async"
          />
          <h1
            className="text-2xl font-serif font-semibold tracking-[0.15em] text-center mb-1"
            style={{ color: WALDGRUEN }}
          >
            HARVESTED
          </h1>
          <p className="text-sm text-center mb-8" style={{ color: TEXT_MUTED }}>
            {t.login.subtitle}
          </p>

          <form
            onSubmit={handleSubmit}
            className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150"
          >
            {isRegistering && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-4">
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('gardener')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      selectedRole === 'gardener'
                        ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 text-[#0D1A15]'
                        : 'border-[#4A5D4E]/20 bg-white/80 text-[#88887D]'
                    }`}
                  >
                    <Sprout size={22} className={selectedRole === 'gardener' ? 'text-[#4A5D4E]' : 'text-[#88887D]'} />
                    <div className="text-center">
                      <span className="block text-xs font-semibold">Anbieter</span>
                      <span className="block text-[10px] text-[#4A5D4E] font-medium">Kostenlos</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      selectedRole === 'buyer'
                        ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 text-[#0D1A15]'
                        : 'border-[#4A5D4E]/20 bg-white/80 text-[#88887D]'
                    }`}
                  >
                    <ShoppingCart size={22} className={selectedRole === 'buyer' ? 'text-[#4A5D4E]' : 'text-[#88887D]'} />
                    <div className="text-center">
                      <span className="block text-xs font-semibold">Nutzer</span>
                      <span className="block text-[10px] text-[#4A5D4E] font-medium">1. Monat gratis</span>
                    </div>
                  </button>
                </div>
                <div>
                  <label className={labelClass} style={{ color: TEXT_MUTED }}>
                    {t.profile?.namePlaceholder ?? 'Name'}
                  </label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Dein Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={labelClass} style={{ color: TEXT_MUTED }}>
                {t.login.email}
              </label>
              <input
                type="email"
                required
                className={inputClass}
                placeholder="hallo@harvested.app"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setAuthError(null)
                }}
                autoComplete="email"
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: TEXT_MUTED }}>
                {t.login.password}
              </label>
              <input
                type="password"
                required
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setAuthError(null)
                }}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
            </div>

            {authError && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg font-semibold text-base transition-all active:scale-[0.98] mt-4 text-white border border-[#4A5D4E] shadow-sm hover:opacity-95"
              style={{ backgroundColor: WALDGRUEN }}
            >
              {isRegistering ? (t.login.registerBtn ?? 'Registrieren') : t.login.loginBtn}
            </button>
          </form>

          <div className="mt-8 text-center animate-in fade-in duration-1000 delay-300 pb-8">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setAuthError(null)
              }}
              className="text-sm font-medium hover:underline"
              style={{ color: WALDGRUEN }}
            >
              {isRegistering ? (t.login.hasAccount ?? 'Bereits ein Konto? Einloggen') : t.login.register}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
