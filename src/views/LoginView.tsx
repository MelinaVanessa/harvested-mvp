import { useState } from 'react'
import { Sprout, ShoppingCart, Eye, EyeOff } from 'lucide-react'
import type { UserRole, UserProfile, ThemeTokens } from '@/types'
import { tryAuthLoginDetailed, tryAuthRegister } from '@/constants/apiBase'
import { normalizePasswordForAuth } from '@/utils/password'

const WALDGRUEN = '#4A5D4E'
const OFF_WHITE = '#FCFAF7'
const TEXT_MUTED = '#88887D'

/** Public `favicon.png` — must respect Vite `base` (e.g. GitHub Pages `/harvested-mvp/`). */
const LOGIN_LOGO_SRC = `${import.meta.env.BASE_URL}favicon.png?v=emblem-nomirror`

interface LoginViewProps {
  onLogin: (userData?: { id: string; name: string; role: UserRole; profile?: UserProfile }) => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
}

function tpl(s: string, vars: Record<string, string>) {
  let out = s
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{{${k}}}`).join(v)
  }
  return out
}

export function LoginView({ onLogin, theme: _theme, t }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('gardener')
  const [authError, setAuthError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    const L = t.login ?? {}
    const emailLower = email.trim().toLowerCase()
    const passwordNorm = normalizePasswordForAuth(password)
    if (isRegistering) {
      if (email && password && name) {
        // Server-first registration: rely on backend conflict detection as source of truth.
        const apiReg = await tryAuthRegister({
          email: emailLower,
          password: passwordNorm,
          name: name.trim(),
          role: selectedRole,
        })
        if (apiReg && 'conflict' in apiReg) {
          alert(L.errEmailRegistered ?? 'Diese E-Mail ist bereits registriert. Bitte einloggen.')
          return
        }
        if (apiReg && 'user' in apiReg) {
          alert(tpl(L.welcomeRegistered ?? 'Willkommen bei Harvested, {{name}}!', { name: name.trim() }))
          onLogin({ id: apiReg.user.id, name: apiReg.user.name, role: apiReg.user.role, profile: apiReg.user })
          return
        }

        alert(L.errRegisterServer ?? 'Registrierung gerade nicht möglich. Server-Verbindung prüfen und erneut versuchen.')
      } else {
        alert(L.errRegisterFields ?? 'Bitte alle Felder ausfüllen.')
      }
    } else {
      // Server-first login so private/incognito windows can still authenticate.
      const loginResult = await tryAuthLoginDetailed({ email: emailLower, password: passwordNorm })
      if (loginResult.user) {
        onLogin({
          id: loginResult.user.id,
          name: loginResult.user.name,
          role: loginResult.user.role,
          profile: loginResult.user,
        })
        return
      }

      const isUnreachable = loginResult.reason === 'unreachable'
      const isBadRequest = loginResult.reason === 'invalid_request'
      const isEmailMissing = loginResult.reason === 'email_not_registered'
      const isWrongPw = loginResult.reason === 'wrong_password'
      const line1 = isUnreachable
        ? (L.errUnreachable ?? L.error ?? 'Ungültige Anmeldedaten.')
        : isBadRequest
          ? (loginResult.serverMessage?.trim()
              ? loginResult.serverMessage.trim()
              : (L.errFieldsRequired ?? 'Bitte E-Mail und Passwort ausfüllen.'))
          : isEmailMissing
            ? (L.errEmailNotRegistered ?? L.errInvalid ?? L.error ?? '')
            : isWrongPw
              ? (L.errWrongPassword ?? L.errInvalid ?? L.error ?? '')
              : (L.errInvalid ?? L.error ?? 'Ungültige Anmeldedaten.')
      const line2 = isUnreachable
        ? (L.errUnreachableHint ?? '')
        : isBadRequest || isEmailMissing || isWrongPw
          ? ''
          : (L.errInvalidHint ?? '')
      setAuthError(line2 ? `${line1} ${line2}` : line1)
    }
  }

  const inputClass =
    'w-full p-3.5 rounded-lg border border-[#4A5D4E]/25 bg-white text-[#0D1A15] placeholder:text-[#88887D]/70 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] transition-colors'
  const labelClass = 'block text-xs font-medium text-[#88887D] mb-1.5'

  return (
    <div
      className="h-full w-full flex flex-col items-stretch justify-start app-gutter py-6 overflow-y-auto no-scrollbar [scrollbar-gutter:stable]"
      style={{ backgroundColor: OFF_WHITE }}
    >
      {/* mx-auto + w-full: fixed track width; avoid items-center shrink-to-fit (field width was changing with error text). */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-stretch min-w-0">
        <div className="flex-1 flex flex-col w-full min-w-0 items-stretch justify-start min-h-[min-content] py-8 pt-12 sm:pt-16">
          <img
            src={LOGIN_LOGO_SRC}
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
            className="w-full min-w-0 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150"
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setAuthError(null)
                  }}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-[#4A5D4E] hover:opacity-75"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {authError ? (
              <p
                className="w-full min-w-0 break-words text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                role="alert"
                aria-live="polite"
              >
                {authError}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg font-semibold text-base transition-all active:scale-[0.98] mt-4 text-white border border-[#4A5D4E] shadow-sm hover:opacity-95"
              style={{ backgroundColor: WALDGRUEN }}
            >
              {isRegistering ? (t.login.registerBtn ?? 'Registrieren') : t.login.loginBtn}
            </button>
          </form>

          <div className="mt-8 w-full text-center animate-in fade-in duration-1000 delay-300 pb-8">
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
