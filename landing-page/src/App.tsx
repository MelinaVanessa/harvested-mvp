import { useEffect, useRef, useState, type FormEvent, type TouchEvent } from 'react'

type WaitlistRole = 'gardener' | 'neighbor' | 'both'
type Locale = 'de' | 'en'
type PreviewSlide = {
  key: 'map' | 'fyp' | 'upload' | 'likes' | 'profile'
  title: string
  body: string
  imageSrc?: string
}

const copy = {
  de: {
    navHow: 'Wie es funktioniert',
    navStory: 'Unsere Gründerin',
    navWaitlist: 'Updates erhalten',
    navLang: 'English',
    heroEyebrowPrefix: 'Pilot Berlin-Brandenburg · ',
    heroEyebrowHighlight: 'anfangs kostenlos',
    heroTitle: 'Gemeinsam gegen Ernteverschwendung',
    heroLead:
      'Wir verbinden Gärtner mit Menschen in der Nähe: Überschuss teilen/abholen statt wegwerfen.',
    waitlistPilotBanner:
      '📍 Berlin-Pilot: Wir vergeben aktuell nur 100 Plätze, um ein perfektes Erlebnis zu garantieren. Bewirb dich jetzt für deinen Platz.',
    waitlistPilotProgress: '{claimed} von {cap} Plätzen vergeben',
    heroCta: 'Zur Bewerbung',
    formTitle: 'Bewerbe dich und werde Testnutzer',
    formIntro:
      'Updates zum Pilot-Start und direkte Infos von mir, wie du die Plattform mitgestalten kannst. Relevant, ehrlich und garantiert ohne Spam.',
    formName: 'Name',
    formNamePh: 'Vor- und Nachname',
    formEmail: 'E-Mail',
    formEmailPh: 'euer.name@email.de',
    formJoinAs: 'Du bewirbst dich als',
    formRoleGardener: 'Gärtner',
    formRoleNeighbor: 'Nachbar',
    formRoleBoth: 'Beides',
    formSubmit: 'Jetzt Bewerbung abschicken',
    formSubmitCaption:
      'Noch kein Login. Wir benachrichtigen dich beim Start in Berlin.',
    formSubmitting: 'Wird gesendet…',
    formErrGeneric: 'Etwas ist schiefgelaufen. Bitte versucht es erneut.',
    formErrDuplicate:
      'Du stehst schon auf der Liste. Wir melden uns trotzdem, wenn es Neuigkeiten gibt.',
    formErrOk:
      'Bewerbung eingegangen! Wir prüfen deine Infos und melden uns bei dir.',
    formErrNetwork:
      'Server nicht erreichbar. Startet die API lokal oder setzt VITE_API_URL.',
    previewEyebrow: 'Produktvorschau',
    previewTitle: 'So fühlt sich Harvested in der App an',
    previewIntro:
      'Ein kurzer Blick in die wichtigsten Seiten: von Karte bis Profil. Wischt durch die Ansichten.',
    previewIntroClick:
      'Ein kurzer Blick in die wichtigsten Seiten: von Karte bis Profil. Klickt euch durch die Ansichten.',
    previewPrev: 'Vorherige Ansicht',
    previewNext: 'Nächste Ansicht',
    previewSlideLabel: 'Ansicht',
    previewCollapse: 'Vorschau einklappen',
    previewExpand: 'Vorschau ausklappen',
    previewSlides: [
      {
        key: 'map',
        title: 'Map',
        body: 'Finde Gärten in deiner Nähe und sieh auf einen Blick, was gerade reif ist.',
        imageSrc: '/mockup-map-de.png',
      },
      {
        key: 'fyp',
        title: 'FYP',
        body: 'Entdecke passende Angebote aus deiner Umgebung, sortiert nach Relevanz für dich.',
        imageSrc: '/mockup-fyp-de.png',
      },
      {
        key: 'upload',
        title: 'Upload',
        body: 'Stelle neue Ernten schnell ein, inklusive Menge, Zeitfenster und Abholhinweisen.',
        imageSrc: '/mockup-upload-de.png',
      },
      {
        key: 'likes',
        title: 'Likes',
        body: 'Speichere spannende Gärten und Beiträge, um sie später direkt wiederzufinden.',
        imageSrc: '/mockup-likes-de.png',
      },
      {
        key: 'profile',
        title: 'Profile',
        body: 'Verwalte deine Angaben, Präferenzen und bisherigen Aktivitäten an einem Ort.',
        imageSrc: '/mockup-profile-de.png',
      },
    ] as PreviewSlide[],
    howTitle: 'Wie es funktioniert',
    how1t: 'Gärtner sagen, was reif ist',
    how1d:
      'Ihr zeigt, was reif ist, wie die Abholung läuft und ob Selbsternten möglich ist.',
    how2t: 'Nachbarn finden Gärten in der Nähe',
    how2d:
      'Frische direkt von der Quelle: voll ausgereift und natürlich gewachsen. Du siehst sofort die Entfernung und wählst deine Abholzeit.',
    how3t: 'Trefft euch im Garten',
    how3d:
      'Holt Überschuss ab oder helft beim Ernten - lokal, direkt und ohne Umwege.',
    cardGardenersH: 'Für Gärtner',
    cardGardenersP:
      'Teile Ernte zu deinen Regeln: Du bestimmst Zeit, Ort und wer kommt.',
    cardNeighborsH: 'Für Nachbarn',
    cardNeighborsP:
      'Frisches Obst & Gemüse direkt aus deiner Nachbarschaft.',
    storyTitle: 'Wer Harvested aufbaut',
    storyName: 'Melina Vanessa Mann',
    storyBody:
      'Ich bin zwanzig, studiere BWL an der HTW Berlin und bin Partnerships Department Lead bei Enactus Berlin, einer studentischen NGO mit sozialen und nachhaltigen Impact-Start-ups. Harvested will genau das für Ernteüberschuss tun: weniger Verschwendung, mehr Begegnung in der Nachbarschaft. Wir starten als Pilot in Berlin–Brandenburg und lassen es am Anfang kostenlos, während wir es mit euch ausprobieren.',
    storyImgAlt: 'Melina Vanessa Mann, draußen auf einer Wiese',
    footerSocials: 'Socials',
    footerContact: 'Kontakt',
    footerUpdates: 'Updates erhalten',
    footerQuestions: 'WhatsApp: +49 1590 6105570',
    footerWhatsappCommunity: 'WhatsApp Community',
    footerInstagram: 'Harvested auf Instagram',
    footerCompanyLinkedIn: 'Harvested auf LinkedIn',
    footerFounderLinkedIn: 'Melina auf LinkedIn',
    footerLegal: 'Rechtliches',
    footerImpressum: 'Impressum',
    docTitle: 'Harvested — Überschuss aus Gärten in eurer Nähe',
  },
  en: {
    navHow: 'How it works',
    navStory: 'Our founder',
    navWaitlist: 'Get updates',
    navLang: 'Deutsch',
    heroEyebrowPrefix: 'Pilot Berlin-Brandenburg · ',
    heroEyebrowHighlight: 'free at first',
    heroTitle: 'Together against harvest waste.',
    heroLead:
      'We connect gardeners with people nearby: share/pick up surplus instead of wasting it.',
    waitlistPilotBanner:
      '📍 Berlin pilot: We are only opening 100 spots right now to guarantee a great experience. Apply now for your place.',
    waitlistPilotProgress: '{claimed} of {cap} spots filled',
    heroCta: 'Apply now',
    formTitle: 'Bring Harvested to your neighborhood.',
    formIntro:
      'Updates on the pilot launch and direct notes from me on how you can help shape the platform. Relevant, honest, and guaranteed spam-free.',
    formName: 'Name',
    formNamePh: 'First and last name',
    formEmail: 'Email',
    formEmailPh: 'your.name@email.com',
    formJoinAs: 'You are joining as',
    formRoleGardener: 'Grower',
    formRoleNeighbor: 'Neighbor',
    formRoleBoth: 'Both',
    formSubmit: 'Submit your application now',
    formSubmitCaption:
      'No login yet. We will notify you when we launch in Berlin.',
    formSubmitting: 'Sending…',
    formErrGeneric: 'Something went wrong. Please try again.',
    formErrDuplicate:
      'You are already on the list. We will still email you when we launch nearby.',
    formErrOk:
      'Application received! We will review your details and get back to you.',
    formErrNetwork: 'Could not reach the server. Start the API locally or set VITE_API_URL.',
    previewEyebrow: 'Product preview',
    previewTitle: 'How Harvested feels in the app',
    previewIntro:
      'A quick look at the main pages: from map to profile. Swipe through the screens.',
    previewIntroClick:
      'A quick look at the main pages: from map to profile. Click through the screens.',
    previewPrev: 'Previous screen',
    previewNext: 'Next screen',
    previewSlideLabel: 'Screen',
    previewCollapse: 'Collapse preview',
    previewExpand: 'Expand preview',
    previewSlides: [
      {
        key: 'map',
        title: 'Map',
        body: 'Find gardens nearby and instantly see what is ripe right now.',
        imageSrc: '/mockup-map-en.png',
      },
      {
        key: 'fyp',
        title: 'FYP',
        body: 'Discover matching offers around you, ranked by what matters most to you.',
        imageSrc: '/mockup-fyp-en.png',
      },
      {
        key: 'upload',
        title: 'Upload',
        body: 'Post new harvest items fast, including quantity, time slots, and pickup details.',
        imageSrc: '/mockup-upload-en.png',
      },
      {
        key: 'likes',
        title: 'Likes',
        body: 'Save interesting gardens and posts so you can quickly return later.',
        imageSrc: '/mockup-likes-en.png',
      },
      {
        key: 'profile',
        title: 'Profile',
        body: 'Manage your details, preferences, and activity history in one place.',
        imageSrc: '/mockup-profile-en.png',
      },
    ] as PreviewSlide[],
    howTitle: 'How it works',
    how1t: 'Growers say what is ready',
    how1d:
      'Growers share what is ripe, how pickup works, and whether self-harvest is open.',
    how2t: 'Neighbors find gardens nearby',
    how2d:
      'Real home gardens, not big stores. You see how far it is and how each grower likes to pass the food to you.',
    how3t: 'Meet at the garden',
    how3d: 'Pick up surplus or join a harvest slot - local, direct, and simple.',
    cardGardenersH: 'For gardeners',
    cardGardenersP:
      'Share harvest surplus your way: you decide when to share and who comes to your garden.',
    cardNeighborsH: 'For neighbors',
    cardNeighborsP:
      'Fresh from gardens in Berlin-Brandenburg. Local, fair, and directly from people you can meet.',
    storyTitle: 'Who is building Harvested',
    storyName: 'Melina Vanessa Mann',
    storyBody:
      'I am twenty, studying business at HTW Berlin, and I am the Partnerships Department Lead at Enactus Berlin, a student NGO with social and sustainable impact start-ups. Harvested is the same instinct for harvest surplus: less waste, more friendly contact between neighbours. We are piloting first in Berlin–Brandenburg and keeping it free at the start while we learn this together with you.',
    storyImgAlt: 'Melina Vanessa Mann outdoors in a meadow',
    footerSocials: 'Socials',
    footerContact: 'Contact',
    footerUpdates: 'Get updates',
    footerQuestions: 'WhatsApp: +49 1590 6105570',
    footerWhatsappCommunity: 'WhatsApp community',
    footerInstagram: 'Harvested on Instagram',
    footerCompanyLinkedIn: 'Harvested on LinkedIn',
    footerFounderLinkedIn: 'Melina on LinkedIn',
    footerLegal: 'Legal',
    footerImpressum: 'Imprint',
    docTitle: 'Harvested — surplus from gardens near you',
  },
} as const

function waitlistEndpoint(): string {
  const raw = import.meta.env.VITE_API_URL
  const base = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : ''
  return base ? `${base}/api/waitlist` : '/api/waitlist'
}

function pilotCapacityEndpoint(): string {
  const raw = import.meta.env.VITE_API_URL
  const base = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : ''
  return base ? `${base}/api/waitlist-pilot-capacity` : '/api/waitlist-pilot-capacity'
}

/** Same as PILOT_SLOTS_CLAIMED in api/waitlist-pilot-capacity.mjs — used when API is missing or fails */
const PILOT_BAR_CAP = 100
const PILOT_BAR_CLAIMED_DEFAULT = 42

function PilotCapacityBar({ t }: { t: (typeof copy)['de'] }) {
  const [cap, setCap] = useState(PILOT_BAR_CAP)
  const [claimed, setClaimed] = useState(PILOT_BAR_CLAIMED_DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(pilotCapacityEndpoint())
        const data = (await res.json().catch(() => ({}))) as {
          cap?: number
          claimed?: number
        }
        if (cancelled) return
        if (res.ok && typeof data.claimed === 'number' && typeof data.cap === 'number') {
          setCap(Math.max(1, data.cap))
          setClaimed(Math.max(0, data.claimed))
        } else {
          setCap(PILOT_BAR_CAP)
          setClaimed(PILOT_BAR_CLAIMED_DEFAULT)
        }
      } catch {
        if (!cancelled) {
          setCap(PILOT_BAR_CAP)
          setClaimed(PILOT_BAR_CLAIMED_DEFAULT)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const pct = Math.min(100, Math.round((claimed / cap) * 100))
  const label = t.waitlistPilotProgress.replace('{claimed}', String(claimed)).replace('{cap}', String(cap))

  return (
    <div className="mt-4">
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-olive/15 ring-1 ring-olive/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={cap}
        aria-valuenow={claimed}
        aria-valuetext={label}
      >
        <div
          className={`h-full min-w-[2px] rounded-full bg-olive transition-[width] duration-700 ease-out motion-reduce:transition-none ${
            loading ? 'motion-safe:animate-pulse' : ''
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[0.7rem] font-medium tabular-nums text-obsidian/65 sm:text-xs">
        {label}
        {loading ? (
          <span className="ml-1 font-normal text-obsidian/45" aria-hidden="true">
            …
          </span>
        ) : null}
      </p>
    </div>
  )
}

function getInitialPreviewIndex(slides: PreviewSlide[]): number {
  const fypIndex = slides.findIndex((slide) => slide.key === 'fyp')
  return fypIndex >= 0 ? fypIndex : 0
}

function WaitlistForm({
  idPrefix,
  t,
}: {
  idPrefix: string
  t: (typeof copy)['de']
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<WaitlistRole>('neighbor')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setNotice(null)
    setLoading(true)
    try {
      const res = await fetch(waitlistEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        duplicate?: boolean
      }
      if (!res.ok) {
        setNotice({ tone: 'err', text: data.error ?? t.formErrGeneric })
        return
      }
      if (data.duplicate) {
        setNotice({
          tone: 'ok',
          text: t.formErrDuplicate,
        })
      } else {
        setNotice({
          tone: 'ok',
          text: t.formErrOk,
        })
        setName('')
        setEmail('')
      }
    } catch {
      setNotice({
        tone: 'err',
        text: t.formErrNetwork,
      })
    } finally {
      setLoading(false)
    }
  }

  const nameId = `${idPrefix}-name`
  const inputId = `${idPrefix}-email`

  const roles: { value: WaitlistRole; label: string }[] = [
    { value: 'gardener', label: t.formRoleGardener },
    { value: 'neighbor', label: t.formRoleNeighbor },
    { value: 'both', label: t.formRoleBoth },
  ]

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-olive/10 bg-creamy/50 px-5 py-5 sm:px-5 sm:py-5"
      noValidate
    >
      <h2 className="font-display text-lg font-medium leading-snug tracking-tight text-olive sm:text-2xl sm:leading-tight">
        {t.formTitle}
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-[1.6] text-obsidian/80 sm:text-base sm:leading-relaxed">
        {t.formIntro}
      </p>

      <label htmlFor={nameId} className="mt-6 block text-sm font-medium text-obsidian/75 sm:text-base">
        {t.formName}
      </label>
      <input
        id={nameId}
        type="text"
        name="name"
        autoComplete="name"
        required
        value={name}
        onChange={(ev) => setName(ev.target.value)}
        className="mt-2 w-full rounded-lg border border-olive/15 bg-creamy px-3.5 py-3 text-base text-obsidian outline-none transition placeholder:text-dusty/50 focus:border-olive focus:ring-2 focus:ring-olive/10"
        placeholder={t.formNamePh}
      />

      <label htmlFor={inputId} className="mt-6 block text-sm font-medium text-obsidian/75 sm:text-base">
        {t.formEmail}
      </label>
      <input
        id={inputId}
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
        className="mt-2 w-full rounded-lg border border-olive/15 bg-creamy px-3.5 py-3 text-base text-obsidian outline-none transition placeholder:text-dusty/50 focus:border-olive focus:ring-2 focus:ring-olive/10"
        placeholder={t.formEmailPh}
      />

      <fieldset className="mt-5">
        <legend className="sr-only">{t.formJoinAs}</legend>
        <p className="text-xs font-medium text-obsidian/65 sm:text-sm">{t.formJoinAs}</p>
        <div className="mt-2 flex gap-2" role="radiogroup" aria-label={t.formJoinAs}>
          {roles.map(({ value, label }) => {
            const selected = role === value
            return (
              <label
                key={value}
                className={`min-w-0 flex-1 cursor-pointer rounded-lg border-2 px-2 py-2.5 text-center text-xs font-medium leading-tight transition sm:px-3 sm:py-3 sm:text-sm ${
                  selected
                    ? 'border-olive bg-olive/12 text-olive shadow-sm'
                    : 'border-olive/20 bg-creamy/80 text-obsidian/85 hover:border-olive/35'
                }`}
              >
                <input
                  type="radio"
                  name={`role-${idPrefix}`}
                  value={value}
                  checked={selected}
                  onChange={() => setRole(value)}
                  className="sr-only"
                />
                {label}
              </label>
            )
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg border border-olive bg-olive py-3 text-base font-medium text-creamy shadow-sm transition hover:bg-olive/90 disabled:opacity-50"
      >
        {loading ? t.formSubmitting : t.formSubmit}
      </button>
      <p className="mt-2 text-center text-[0.7rem] leading-snug text-obsidian/55 sm:text-xs sm:text-obsidian/60">
        {t.formSubmitCaption}
      </p>

      {notice ? (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 rounded-lg border px-3.5 py-3 text-left text-sm leading-snug sm:px-4 sm:py-3.5 sm:text-base sm:leading-relaxed ${
            notice.tone === 'err'
              ? 'border-red-200/80 bg-red-50/90 text-red-950'
              : 'border-olive/35 bg-olive/[0.07] text-obsidian'
          }`}
        >
          {notice.text}
        </div>
      ) : (
        <div className="mt-3 min-h-[0.5rem]" aria-hidden />
      )}
    </form>
  )
}

export default function App() {
  const [locale, setLocale] = useState<Locale>('de')
  const [headerHidden, setHeaderHidden] = useState(false)
  const [activePreview, setActivePreview] = useState(() => getInitialPreviewIndex(copy.de.previewSlides))
  const [isLandscape, setIsLandscape] = useState(false)
  const lastScrollY = useRef(0)
  const previewTouchStartX = useRef<number | null>(null)

  const t = copy[locale]
  const previewSlides = t.previewSlides
  const howSteps = [
    { title: t.how1t, body: t.how1d },
    { title: t.how2t, body: t.how2d },
    { title: t.how3t, body: t.how3d },
  ]

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t.docTitle
  }, [locale, t.docTitle])

  useEffect(() => {
    setActivePreview(getInitialPreviewIndex(previewSlides))
  }, [previewSlides])

  useEffect(() => {
    document.documentElement.style.scrollPaddingTop = '3.75rem'
    return () => {
      document.documentElement.style.scrollPaddingTop = ''
    }
  }, [])

  useEffect(() => {
    lastScrollY.current = window.scrollY
    const delta = 8
    const onScroll = () => {
      const y = window.scrollY
      const prev = lastScrollY.current
      if (y < 48) {
        setHeaderHidden(false)
      } else if (y > prev + delta) {
        setHeaderHidden(true)
      } else if (y < prev - delta) {
        setHeaderHidden(false)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(orientation: landscape)')
    const onChange = () => setIsLandscape(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  function goToPrevPreview() {
    setActivePreview((prev) => (prev - 1 + previewSlides.length) % previewSlides.length)
  }

  function goToNextPreview() {
    setActivePreview((prev) => (prev + 1) % previewSlides.length)
  }

  function onPreviewTouchStart(ev: TouchEvent<HTMLDivElement>) {
    previewTouchStartX.current = ev.touches[0]?.clientX ?? null
  }

  function onPreviewTouchEnd(ev: TouchEvent<HTMLDivElement>) {
    if (previewTouchStartX.current === null) return
    const endX = ev.changedTouches[0]?.clientX ?? previewTouchStartX.current
    const deltaX = endX - previewTouchStartX.current
    const swipeThreshold = 36
    if (deltaX <= -swipeThreshold) goToNextPreview()
    if (deltaX >= swipeThreshold) goToPrevPreview()
    previewTouchStartX.current = null
  }

  const prevPreview = previewSlides[(activePreview - 1 + previewSlides.length) % previewSlides.length]
  const nextPreview = previewSlides[(activePreview + 1) % previewSlides.length]

  return (
    <div className="min-h-screen bg-creamy text-obsidian antialiased">
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-olive/10 bg-creamy/98 backdrop-blur-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          headerHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex w-full items-center justify-between gap-3 px-5 py-3 sm:px-8 sm:py-3.5 lg:px-10">
          <a href="#" className="flex min-w-0 shrink items-center gap-2">
            <img
              src="/logo.png"
              alt=""
              width={28}
              height={28}
              decoding="async"
              className="h-7 w-7 shrink-0 object-contain"
              aria-hidden="true"
            />
            <span className="text-lg font-semibold tracking-normal text-olive">Harvested</span>
          </a>
          <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a
              href="#how"
              className="hidden text-dusty transition hover:text-obsidian sm:inline sm:text-sm sm:font-medium"
            >
              {t.navHow}
            </a>
            <a
              href="#waitlist"
              className="rounded-full px-2 py-1 text-sm font-medium text-obsidian underline decoration-olive/25 decoration-1 underline-offset-4 transition hover:text-olive hover:decoration-olive/40 sm:px-2.5"
            >
              {t.navWaitlist}
            </a>
            <a
              href="#story"
              className="hidden text-dusty transition hover:text-obsidian sm:inline sm:text-sm sm:font-medium"
            >
              {t.navStory}
            </a>
            <button
              type="button"
              onClick={() => setLocale(locale === 'de' ? 'en' : 'de')}
              className="border-l border-olive/20 pl-2 text-sm font-medium text-obsidian underline decoration-olive/25 decoration-1 underline-offset-4 transition hover:text-olive hover:decoration-olive/40 sm:pl-3"
            >
              {t.navLang}
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-14">
        <section className="relative overflow-hidden border-b border-olive/10 bg-creamy">
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-[url('/hero-photo.png')] bg-cover bg-[center_45%_40%] opacity-[0.72] max-sm:[-webkit-mask-image:radial-gradient(ellipse_108%_84%_at_50%_36%,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.6)_18%,rgba(0,0,0,0.74)_40%,rgba(0,0,0,0.9)_68%,rgba(0,0,0,0.98)_88%,rgba(0,0,0,1)_100%)] max-sm:[mask-image:radial-gradient(ellipse_108%_84%_at_50%_36%,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.6)_18%,rgba(0,0,0,0.74)_40%,rgba(0,0,0,0.9)_68%,rgba(0,0,0,0.98)_88%,rgba(0,0,0,1)_100%)] sm:[-webkit-mask-image:radial-gradient(ellipse_100%_92%_at_50%_46%,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.62)_20%,rgba(0,0,0,0.76)_44%,rgba(0,0,0,0.92)_70%,rgba(0,0,0,0.98)_90%,rgba(0,0,0,1)_100%)] sm:[mask-image:radial-gradient(ellipse_100%_92%_at_50%_46%,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.62)_20%,rgba(0,0,0,0.76)_44%,rgba(0,0,0,0.92)_70%,rgba(0,0,0,0.98)_90%,rgba(0,0,0,1)_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-black/20 backdrop-blur-[2px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/0 via-black/25 to-black/45"
            aria-hidden
          />
          <div className="relative z-10 mx-auto flex w-full max-w-5xl min-h-[13.75rem] items-center justify-center px-5 py-1.5 text-center sm:min-h-[16.25rem] sm:px-8 sm:py-2.5 lg:min-h-[18rem] lg:px-10 lg:py-3">
            <div className="mx-auto w-full max-w-[25rem] sm:max-w-3xl">
              <p className="text-xs font-medium tracking-wide text-creamy [text-shadow:0_1px_12px_rgba(13,26,21,0.45)]">
                <span>{t.heroEyebrowPrefix}</span>
                <span className="font-bold text-creamy">{t.heroEyebrowHighlight}</span>
              </p>
              <h1 className="mt-1.5 font-display text-[1.875rem] font-semibold leading-[1.08] tracking-tight text-creamy [text-shadow:0_2px_20px_rgba(13,26,21,0.55),0_1px_3px_rgba(13,26,21,0.35)] sm:mt-2 sm:text-[clamp(2.65rem,5.2vw,3.45rem)] sm:leading-[1.1]">
                {t.heroTitle}
              </h1>
              <p className="mx-auto mt-2 max-w-[23.5rem] text-[0.9rem] leading-[1.52] text-creamy/95 [text-shadow:0_1px_14px_rgba(13,26,21,0.5)] sm:mt-2 sm:max-w-none sm:text-[1.0625rem] sm:leading-[1.65]">
                {t.heroLead}
              </p>
              <div className="mt-3 flex justify-center sm:mt-4">
                <a
                  href="#waitlist"
                  className="group inline-flex items-center gap-2 rounded-full border-2 border-creamy/35 bg-creamy px-5 py-2 text-sm font-semibold text-olive shadow-[0_4px_24px_rgba(13,26,21,0.25)] transition hover:border-creamy/55 hover:bg-creamy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creamy/50 sm:px-6 sm:py-2.5 sm:text-[0.9375rem]"
                >
                  <span>{t.heroCta}</span>
                  <span
                    className="inline-block translate-y-px text-base leading-none text-olive transition duration-200 group-hover:translate-y-0.5"
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-24 border-t border-olive/10 bg-creamy">
          <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <div className="mx-auto w-full max-w-3xl border-l border-olive/20 pl-7 sm:pl-9">
              <h2 className="font-display text-3xl font-medium tracking-tight text-olive sm:text-[2rem]">
                {t.howTitle}
              </h2>
              <ol className="mt-10 list-none space-y-5 p-0 sm:mt-12 sm:space-y-6">
                {howSteps.map((step, idx) => (
                  <li
                    key={step.title}
                    className="relative py-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#88887D] bg-creamy text-sm font-semibold text-olive">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xl font-medium leading-snug text-olive sm:text-[1.35rem]">
                          {step.title}
                        </p>
                        <p className="mt-3 max-w-prose text-sm leading-[1.65] text-obsidian/72 sm:text-base">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mx-auto mt-14 grid w-full max-w-3xl grid-cols-1 gap-8 sm:mt-16 sm:grid-cols-2 sm:gap-10">
              <div
                id="gardeners"
                className="scroll-mt-24 rounded-2xl border border-olive/10 bg-creamy/50 p-8 shadow-sm sm:rounded-2xl"
              >
                <h2 className="font-display text-2xl font-medium tracking-tight text-olive">{t.cardGardenersH}</h2>
                <p className="mt-4 max-w-prose text-sm leading-[1.65] text-obsidian/72 sm:text-base">
                  {t.cardGardenersP}
                </p>
              </div>
              <div
                id="neighbors"
                className="scroll-mt-24 rounded-2xl border border-olive/10 bg-creamy/50 p-8 shadow-sm sm:rounded-2xl"
              >
                <h2 className="font-display text-2xl font-medium tracking-tight text-olive">{t.cardNeighborsH}</h2>
                <p className="mt-4 max-w-prose text-sm leading-[1.65] text-obsidian/72 sm:text-base">
                  {t.cardNeighborsP}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="preview" className="scroll-mt-24 border-t border-olive/10 bg-creamy">
          <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <div className="mx-auto w-full max-w-3xl rounded-2xl border border-olive/10 bg-creamy/50 p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-dusty">{t.previewEyebrow}</p>
              <h2 className="mt-2 font-display text-2xl font-medium tracking-tight text-olive sm:text-[2rem]">
                {t.previewTitle}
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-[1.65] text-obsidian/75 sm:text-base">
                {isLandscape ? t.previewIntroClick : t.previewIntro}
              </p>

              <div className="mt-8">
                <div
                  className="relative mx-auto h-[34rem] w-full max-w-[24rem] overflow-visible sm:h-[35rem] sm:max-w-[28rem]"
                  onTouchStart={onPreviewTouchStart}
                  onTouchEnd={onPreviewTouchEnd}
                  style={{ touchAction: 'pan-y' }}
                >
                  <div className="pointer-events-none absolute left-[1.55rem] top-1/2 z-[7] w-[10rem] -translate-y-1/2 opacity-80 transition-all duration-300 ease-out sm:left-[2.85rem] sm:w-[10.2rem] sm:opacity-90">
                    <div className="relative aspect-[430/932] overflow-hidden rounded-[1.25rem] border-2 border-[#131913]/75 shadow-[0_12px_28px_rgba(16,20,14,0.18)]">
                      {prevPreview.imageSrc ? (
                        <img
                          src={prevPreview.imageSrc}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="block h-full w-full object-cover brightness-[0.8] saturate-[0.9] blur-[0.45px]"
                          aria-hidden="true"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-olive/10 via-creamy to-olive/5" />
                      )}
                      <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_52%,rgba(11,16,12,0.2)_100%)]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="pointer-events-none absolute right-[1.55rem] top-1/2 z-[7] w-[10rem] -translate-y-1/2 opacity-80 transition-all duration-300 ease-out sm:right-[2.85rem] sm:w-[10.2rem] sm:opacity-90">
                    <div className="relative aspect-[430/932] overflow-hidden rounded-[1.25rem] border-2 border-[#131913]/75 shadow-[0_12px_28px_rgba(16,20,14,0.18)]">
                      {nextPreview.imageSrc ? (
                        <img
                          src={nextPreview.imageSrc}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="block h-full w-full object-cover brightness-[0.8] saturate-[0.9] blur-[0.45px]"
                          aria-hidden="true"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-olive/10 via-creamy to-olive/5" />
                      )}
                      <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_52%,rgba(11,16,12,0.2)_100%)]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-1/2 z-10 w-full max-w-[14.5rem] -translate-x-1/2 -translate-y-1/2">
                    <div className="relative aspect-[430/932] overflow-hidden rounded-[1.38rem] border-[2.5px] border-[#131913]/80 shadow-[0_18px_40px_rgba(37,48,30,0.16)]">
                      <div key={previewSlides[activePreview].key} className="h-full w-full animate-preview-card-enter">
                        {previewSlides[activePreview].imageSrc ? (
                          <img
                            src={previewSlides[activePreview].imageSrc}
                            alt={`${previewSlides[activePreview].title} ${t.previewSlideLabel}`}
                            loading="lazy"
                            decoding="async"
                            className="block h-full w-full object-cover contrast-[1.04] saturate-[1.04] brightness-[1.02]"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-olive/10 via-creamy to-olive/5" />
                        )}
                      </div>
                      <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,transparent_58%,rgba(10,14,11,0.12)_100%)]"
                        aria-hidden="true"
                      />
                      <div
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                          backgroundImage:
                            'radial-gradient(rgba(255,255,255,0.6) 0.45px, transparent 0.45px)',
                          backgroundSize: '3px 3px',
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-center gap-2">
                {previewSlides.map((slide, idx) => (
                  <button
                    key={slide.key}
                    type="button"
                    onClick={() => setActivePreview(idx)}
                    aria-label={`${t.previewSlideLabel} ${idx + 1}`}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      idx === activePreview ? 'bg-olive' : 'bg-olive/25 hover:bg-olive/45'
                    }`}
                  />
                ))}
              </div>
              {isLandscape && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={goToPrevPreview}
                    aria-label={t.previewPrev}
                    className="h-9 w-9 rounded-full border border-olive/25 text-base text-olive transition hover:bg-olive/10"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goToNextPreview}
                    aria-label={t.previewNext}
                    className="h-9 w-9 rounded-full border border-olive/25 text-base text-olive transition hover:bg-olive/10"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="waitlist" className="scroll-mt-24 border-t border-olive/10 bg-creamy">
          <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-8 rounded-xl border border-olive/20 bg-creamy/80 px-3 py-2.5 shadow-sm ring-1 ring-olive/[0.06] backdrop-blur-sm sm:px-4 sm:py-3">
                <p className="text-[0.8rem] font-medium leading-snug text-obsidian/90 sm:text-sm sm:leading-relaxed">
                  {t.waitlistPilotBanner}
                </p>
                <PilotCapacityBar t={t} />
              </div>
              <WaitlistForm idPrefix="main" t={t} />
            </div>
          </div>
        </section>

        <section id="story" className="scroll-mt-24 border-t border-olive/10 bg-creamy">
          <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <div className="mx-auto grid w-full max-w-3xl grid-cols-1 items-start gap-8 sm:grid-cols-2 sm:gap-10">
              <div className="mx-auto w-full max-w-xs self-start sm:mx-0 sm:max-w-none">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-olive/10 shadow-sm ring-1 ring-olive/[0.06] sm:rounded-3xl">
                  <img
                    src="/founder.png"
                    alt={t.storyImgAlt}
                    width={900}
                    height={1200}
                    decoding="async"
                    className="absolute inset-x-0 top-0 h-[118%] w-full object-cover object-top"
                  />
                </div>
              </div>
              <div className="min-w-0 self-start px-7 pt-0 sm:px-8">
                <h2 className="m-0 font-display text-3xl font-medium leading-[1.15] tracking-tight text-olive sm:text-[1.875rem]">
                  {t.storyTitle}
                </h2>
                <p className="mt-2 text-base font-medium text-obsidian/80">{t.storyName}</p>
                <p className="mt-2 text-[0.9375rem] leading-[1.62] text-obsidian/85 sm:mt-2 sm:text-[1rem] sm:leading-[1.62]">
                  {t.storyBody}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-olive/10 bg-creamy">
        <div className="flex w-full flex-col items-center justify-between gap-5 px-5 py-10 text-sm text-obsidian/70 sm:flex-row sm:items-start sm:px-8 sm:py-12 lg:px-10">
          <div className="flex shrink-0 items-center gap-3">
            <img
              src="/logo.png"
              alt=""
              width={28}
              height={28}
              decoding="async"
              className="h-7 w-7 object-contain opacity-80"
              aria-hidden="true"
            />
            <p className="m-0">
              <span className="text-dusty">© {new Date().getFullYear()}</span>{' '}
              <span className="font-semibold text-olive">Harvested</span>
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-4 sm:max-w-none sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5 lg:grid-cols-4">
            <div className="flex flex-col items-start gap-1">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-dusty">{t.footerSocials}</p>
              <a
                href="https://www.instagram.com/harvested_berlin?igsh=ejF2czd3ZHdoaWdu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-obsidian underline decoration-olive/25 decoration-1 underline-offset-4 transition hover:text-olive hover:decoration-olive/40 sm:text-[0.875rem]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm9.5 2.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z" />
                </svg>
                {t.footerInstagram}
              </a>
              <a
                href="https://www.linkedin.com/company/harvested-berlin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-obsidian underline decoration-olive/25 decoration-1 underline-offset-4 transition hover:text-olive hover:decoration-olive/40 sm:text-[0.875rem]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
                  <path d="M4.75 3.5A1.25 1.25 0 0 0 3.5 4.75v14.5c0 .69.56 1.25 1.25 1.25h14.5c.69 0 1.25-.56 1.25-1.25V4.75c0-.69-.56-1.25-1.25-1.25H4.75ZM9 10v7H6.75v-7H9Zm-1.13-1a1.31 1.31 0 1 1 0-2.62A1.31 1.31 0 0 1 7.87 9ZM17.25 17H15v-3.6c0-.96-.02-2.2-1.34-2.2-1.34 0-1.54 1.05-1.54 2.13V17H9.87v-7h2.16v.96h.03c.3-.57 1.03-1.17 2.13-1.17 2.28 0 2.7 1.5 2.7 3.45V17Z" />
                </svg>
                {t.footerCompanyLinkedIn}
              </a>
              <a
                href="https://www.linkedin.com/in/melina-vanessa-mann"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-obsidian underline decoration-olive/25 decoration-1 underline-offset-4 transition hover:text-olive hover:decoration-olive/40 sm:text-[0.875rem]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
                  <path d="M4.75 3.5A1.25 1.25 0 0 0 3.5 4.75v14.5c0 .69.56 1.25 1.25 1.25h14.5c.69 0 1.25-.56 1.25-1.25V4.75c0-.69-.56-1.25-1.25-1.25H4.75ZM9 10v7H6.75v-7H9Zm-1.13-1a1.31 1.31 0 1 1 0-2.62A1.31 1.31 0 0 1 7.87 9ZM17.25 17H15v-3.6c0-.96-.02-2.2-1.34-2.2-1.34 0-1.54 1.05-1.54 2.13V17H9.87v-7h2.16v.96h.03c.3-.57 1.03-1.17 2.13-1.17 2.28 0 2.7 1.5 2.7 3.45V17Z" />
                </svg>
                {t.footerFounderLinkedIn}
              </a>
            </div>
            <div className="flex flex-col items-start gap-1">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-dusty">{t.footerContact}</p>
              <a
                href="https://wa.me/4915906105570"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-obsidian underline decoration-olive/25 decoration-1 underline-offset-4 transition hover:text-olive hover:decoration-olive/40 sm:text-[0.875rem]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
                  <path d="M12 2.5a9.5 9.5 0 0 0-8.24 14.24L2.5 21.5l4.9-1.27A9.5 9.5 0 1 0 12 2.5Zm0 1.6a7.9 7.9 0 0 1 6.84 11.88l-.27.45.75 2.74-2.81-.73-.43.24A7.9 7.9 0 1 1 12 4.1Zm-3.2 3.8c-.25 0-.5.11-.67.37-.33.5-.86 1.6-.86 1.74 0 .14.02.27.08.38.2.4.95 2.14 2.36 3.45 1.45 1.35 2.94 1.95 3.38 2.1.44.16.68.14.93-.08.26-.22 1.1-1.08 1.24-1.44.14-.36.14-.67.1-.73-.04-.06-.17-.1-.35-.19l-1.53-.72c-.2-.1-.38-.06-.52.14-.14.2-.57.72-.7.87-.13.14-.25.16-.45.05-.2-.1-.84-.31-1.6-1-.6-.54-1-1.2-1.12-1.4-.11-.2-.01-.3.09-.4.1-.1.2-.25.3-.38.1-.12.14-.2.22-.34.08-.14.04-.26-.02-.36l-.68-1.63c-.14-.35-.3-.38-.5-.39h-.4Z" />
                </svg>
                {t.footerQuestions}
              </a>
              <a
                href="https://chat.whatsapp.com/LrhtVnPfwPr3yfQC7iad1c"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-obsidian underline decoration-olive/25 decoration-1 underline-offset-4 transition hover:text-olive hover:decoration-olive/40 sm:text-[0.875rem]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
                  <path d="M12 2.5a9.5 9.5 0 0 0-8.24 14.24L2.5 21.5l4.9-1.27A9.5 9.5 0 1 0 12 2.5Zm0 1.6a7.9 7.9 0 0 1 6.84 11.88l-.27.45.75 2.74-2.81-.73-.43.24A7.9 7.9 0 1 1 12 4.1Zm-3.2 3.8c-.25 0-.5.11-.67.37-.33.5-.86 1.6-.86 1.74 0 .14.02.27.08.38.2.4.95 2.14 2.36 3.45 1.45 1.35 2.94 1.95 3.38 2.1.44.16.68.14.93-.08.26-.22 1.1-1.08 1.24-1.44.14-.36.14-.67.1-.73-.04-.06-.17-.1-.35-.19l-1.53-.72c-.2-.1-.38-.06-.52.14-.14.2-.57.72-.7.87-.13.14-.25.16-.45.05-.2-.1-.84-.31-1.6-1-.6-.54-1-1.2-1.12-1.4-.11-.2-.01-.3.09-.4.1-.1.2-.25.3-.38.1-.12.14-.2.22-.34.08-.14.04-.26-.02-.36l-.68-1.63c-.14-.35-.3-.38-.5-.39h-.4Z" />
                </svg>
                {t.footerWhatsappCommunity}
              </a>
            </div>
            <div className="flex flex-col items-start gap-1">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-dusty">{t.footerUpdates}</p>
              <a
                href="#waitlist"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-obsidian underline decoration-olive/25 decoration-1 underline-offset-4 transition hover:text-olive hover:decoration-olive/40 sm:text-[0.875rem]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
                  <path d="M12 3.5a1 1 0 0 1 1 1v.9a6.6 6.6 0 0 1 5.1 6.4v2.7l1.2 1.2a1 1 0 1 1-1.4 1.4H6.1a1 1 0 0 1-1.4-1.4l1.2-1.2v-2.7A6.6 6.6 0 0 1 11 5.4v-.9a1 1 0 0 1 1-1Zm-4.1 11.1h8.2v-2.8a4.1 4.1 0 1 0-8.2 0v2.8Zm4.1 5.9a2.4 2.4 0 0 1-2.33-1.8h4.66A2.4 2.4 0 0 1 12 20.5Z" />
                </svg>
                {t.footerUpdates}
              </a>
            </div>
            <div className="flex flex-col items-start gap-1">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-dusty">{t.footerLegal}</p>
              <a
                href="/impressum.html"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-obsidian underline decoration-olive/25 decoration-1 underline-offset-4 transition hover:text-olive hover:decoration-olive/40 sm:text-[0.875rem]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current">
                  <path d="M7 2.75A2.25 2.25 0 0 0 4.75 5v14A2.25 2.25 0 0 0 7 21.25h10A2.25 2.25 0 0 0 19.25 19V8.62a2.25 2.25 0 0 0-.66-1.6l-3.61-3.61a2.25 2.25 0 0 0-1.6-.66H7Zm0 1.5h6v3.5A1.75 1.75 0 0 0 14.75 9h3v10A.75.75 0 0 1 17 19.75H7A.75.75 0 0 1 6.25 19V5A.75.75 0 0 1 7 4.25Zm7.5.56 2.94 2.94h-2.69a.25.25 0 0 1-.25-.25V4.81ZM8.25 12a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5H9A.75.75 0 0 1 8.25 12Zm0 3a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z" />
                </svg>
                {t.footerImpressum}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
