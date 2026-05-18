import { ArrowLeft, Moon, Sun, Globe, LogOut, ChevronRight, Sprout, ShoppingCart } from 'lucide-react'
import type { UserRole } from '@/types'
import type { ThemeTokens } from '@/types'

interface SettingsViewProps {
  onBack: () => void
  isDarkMode: boolean
  setIsDarkMode: (v: boolean) => void
  language: 'de' | 'en'
  setLanguage: (v: 'de' | 'en') => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
  onLogout: () => void
  userRole: UserRole
  onToggleRole: () => void
  notificationPrefs: {
    reservationConfirmed: boolean
    reservationReminders: boolean
    newPostsFromFollowing: boolean
  }
  setNotificationPrefs: (next: {
    reservationConfirmed: boolean
    reservationReminders: boolean
    newPostsFromFollowing: boolean
  }) => void
}

export function SettingsView({
  onBack,
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  theme,
  t,
  onLogout,
  userRole,
  onToggleRole,
  notificationPrefs,
  setNotificationPrefs,
}: SettingsViewProps) {
  return (
    <div className={`h-full flex flex-col ${theme.bg} ${theme.text}`}>
      <div className={`app-gutter py-3 border-b ${theme.border} flex items-center gap-3`}>
        <button onClick={onBack} className={`p-1 -ml-2 ${theme.text}`}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">{t?.settings?.title}</h2>
      </div>

      <div className="app-gutter py-4 space-y-6 flex-1 overflow-y-auto">
        <section>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme.textSec}`}>
            {t?.settings?.role ?? 'Modus'}
          </h3>
          <div className={`flex items-center justify-between p-4 rounded-xl ${theme.card} shadow-sm`}>
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${userRole === 'gardener' ? 'bg-[#4A5D4E]/20 text-[#4A5D4E]' : 'bg-blue-500/20 text-blue-600'}`}
              >
                {userRole === 'gardener' ? <Sprout size={20} /> : <ShoppingCart size={20} />}
              </div>
              <span className="font-semibold">
                {userRole === 'gardener' ? (t?.settings?.gardener ?? 'Gärtner') : (t?.settings?.buyer ?? 'Käufer')}
              </span>
            </div>
            <button
              onClick={onToggleRole}
              className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${userRole === 'gardener' ? 'bg-[#4A5D4E]' : 'bg-blue-500'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${userRole === 'gardener' ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </section>

        <section>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme.textSec}`}>
            {t?.settings?.appearance}
          </h3>
          <div className={`flex items-center justify-between p-4 rounded-xl ${theme.card} shadow-sm`}>
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-yellow-500/20 text-yellow-600'}`}
              >
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="font-semibold">{t?.settings?.darkmode}</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-[#4A5D4E]' : 'bg-gray-300'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </section>

        <section>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme.textSec}`}>
            {t?.settings?.notifications ?? 'Benachrichtigungen'}
          </h3>
          <div className={`space-y-2 p-3 rounded-xl ${theme.card} shadow-sm`}>
            <div className="flex items-center justify-between p-2 rounded-lg">
              <span className="text-sm font-medium">{t?.settings?.notifReservation ?? 'Reservierungs-Bestätigungen'}</span>
              <button
                type="button"
                onClick={() =>
                  setNotificationPrefs({
                    ...notificationPrefs,
                    reservationConfirmed: !notificationPrefs.reservationConfirmed,
                  })
                }
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${notificationPrefs.reservationConfirmed ? 'bg-[#4A5D4E]' : 'bg-gray-300'}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${notificationPrefs.reservationConfirmed ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg">
              <span className="text-sm font-medium">{t?.settings?.notifReminders ?? 'Abhol-Erinnerungen'}</span>
              <button
                type="button"
                onClick={() =>
                  setNotificationPrefs({
                    ...notificationPrefs,
                    reservationReminders: !notificationPrefs.reservationReminders,
                  })
                }
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${notificationPrefs.reservationReminders ? 'bg-[#4A5D4E]' : 'bg-gray-300'}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${notificationPrefs.reservationReminders ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg">
              <span className="text-sm font-medium">{t?.settings?.notifNewPosts ?? 'Neue Beiträge von Gefolgten'}</span>
              <button
                type="button"
                onClick={() =>
                  setNotificationPrefs({
                    ...notificationPrefs,
                    newPostsFromFollowing: !notificationPrefs.newPostsFromFollowing,
                  })
                }
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${notificationPrefs.newPostsFromFollowing ? 'bg-[#4A5D4E]' : 'bg-gray-300'}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${notificationPrefs.newPostsFromFollowing ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme.textSec}`}>
            {t?.settings?.general}
          </h3>
          <div className={`flex items-center justify-between p-4 rounded-xl ${theme.card} shadow-sm`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                <Globe size={20} />
              </div>
              <span className="font-semibold">{t?.settings?.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'de' | 'en')}
                className={`bg-transparent font-medium focus:outline-none text-right cursor-pointer ${theme.textSec}`}
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
              <ChevronRight size={16} className={theme.textSec} />
            </div>
          </div>
        </section>

        <div className="pt-8 text-center pb-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 mx-auto text-red-500 font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} /> {t?.settings?.logout ?? 'Abmelden'}
          </button>
          <p className={`text-xs ${theme.textSec} mt-4`}>{t?.brand?.name ?? 'Harvested-Berlin'} App v1.0.5</p>
          <p className={`text-[10px] ${theme.textSec} mt-1 opacity-60`}>Made with 💚 in Berlin</p>
        </div>
      </div>
    </div>
  )
}
