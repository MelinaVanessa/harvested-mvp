import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ThemeTokens } from '@/types'

type LegalKind = 'terms' | 'privacy' | 'imprint'

interface LegalViewProps {
  kind: LegalKind
  onBack: () => void
  theme: ThemeTokens
  language: 'de' | 'en'
}

function Section({ title, children, theme }: { title: string; children: ReactNode; theme: ThemeTokens }) {
  return (
    <section className="space-y-2">
      <h3 className={`font-bold text-sm ${theme.text}`}>{title}</h3>
      <div className={`text-sm ${theme.textSec} leading-relaxed`}>{children}</div>
    </section>
  )
}

export function LegalView({ kind, onBack, theme, language }: LegalViewProps) {
  const now = new Date()
  const lastUpdated = now.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const title =
    language === 'de'
      ? kind === 'terms'
        ? 'AGB / Nutzungsbedingungen'
        : kind === 'privacy'
          ? 'Datenschutzerklärung'
          : 'Impressum'
      : kind === 'terms'
        ? 'Terms of Service'
        : kind === 'privacy'
          ? 'Privacy Policy'
          : 'Imprint'

  return (
    <div className={`h-full flex flex-col ${theme.bg} ${theme.text}`}>
      <div className={`px-4 py-3 border-b ${theme.border} flex items-center gap-3`}>
        <button onClick={onBack} className={`p-1 -ml-2 ${theme.text}`}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        <p className={`text-xs ${theme.textSec}`}>Last updated: {lastUpdated}</p>

        <div className={`text-sm ${theme.textSec} italic`}>
          {language === 'de'
            ? 'Hinweis: Dies sind Standard-Bausteine. Bitte lass die Texte von einer Rechtsberatung für deine Jurisdiktion prüfen und ersetze Platzhalter (Adresse, E-Mail, Betreiberangaben).'
            : 'Note: These are standard templates. Please have the texts reviewed by legal counsel for your jurisdiction and replace placeholders (address, email, operator details).'}
        </div>

        {kind === 'terms' && (
          <>
            <Section
              title={language === 'de' ? '1. Geltungsbereich' : '1. Scope'}
              theme={theme}
            >
              {language === 'de' ? (
                <p>
                  Diese Nutzungsbedingungen regeln die Nutzung der Webanwendung „Harvested“ (nachfolgend „App“). Mit der
                  Registrierung oder Nutzung stimmst du diesen Bedingungen zu.
                </p>
              ) : (
                <p>
                  These terms govern the use of the “Harvested” web application (the “App”). By registering or using the App, you agree to these terms.
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '2. Beschreibung der App' : '2. App description'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Die App ermöglicht es Nutzern, Angebote zum Selbst-Ernten bzw. zur Abholung von Erntegut zu veröffentlichen,
                  sowie Reservierungen als unverbindliche Anfragen zu tätigen. Die Umsetzung findet ausschließlich zwischen
                  den Nutzern statt.
                </p>
              ) : (
                <p>
                  The App allows users to publish harvesting/pickup offers and to submit reservations as non-binding requests. Completion happens exclusively between users.
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '3. Nutzerpflichten' : '3. User obligations'} theme={theme}>
              {language === 'de' ? (
                <ul className="list-disc pl-5 space-y-1">
                  <li>Du bist für die Richtigkeit deiner Angaben verantwortlich.</li>
                  <li>Du darfst die App nicht missbräuchlich verwenden (z.B. Spam, Betrug, unrechtmäßige Inhalte).</li>
                  <li>Du respektierst geltende Gesetze und Rechte Dritter.</li>
                </ul>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  <li>You are responsible for the accuracy of your information.</li>
                  <li>You must not misuse the App (e.g., spam, fraud, unlawful content).</li>
                  <li>You comply with applicable laws and third-party rights.</li>
                </ul>
              )}
            </Section>

            <Section title={language === 'de' ? '4. Reservierungen (unverbindlich)' : '4. Reservations (non-binding)'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Reservierungen sind unverbindliche Anfragen. Es besteht kein Anspruch darauf, dass eine Reservierung
                  tatsächlich zustande kommt. Der Anbieter entscheidet über Annahme/Abbruch.
                </p>
              ) : (
                <p>
                  Reservations are non-binding requests. There is no guarantee that a reservation will be accepted. The provider decides whether to accept or cancel.
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '5. Haftungsausschluss' : '5. Disclaimer'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Die App wird „wie sie ist“ bereitgestellt. Wir übernehmen keine Garantie für Verfügbarkeit, Aktualität oder
                  Eignung für einen bestimmten Zweck.
                </p>
              ) : (
                <p>
                  The App is provided “as is”. We do not guarantee availability, accuracy, or suitability for a particular purpose.
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '6. Rechte an Inhalten' : '6. Content rights'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Nutzer-Inhalte (z.B. Texte, Fotos) verbleiben bei ihren jeweiligen Rechteinhabern. Du räumst uns ein nicht
                  ausschließliches, weltweites Recht ein, Inhalte zum Betrieb und zur Bereitstellung der App zu nutzen.
                </p>
              ) : (
                <p>
                  User content remains with the respective rights holders. By posting content, you grant us a non-exclusive, worldwide license to operate and provide the App.
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '7. Beendigung' : '7. Termination'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Wir können deinen Zugang jederzeit aus berechtigtem Grund sperren oder beenden, insbesondere bei Verstößen gegen
                  diese Bedingungen.
                </p>
              ) : (
                <p>
                  We may suspend or terminate your access at any time for reasonable cause, especially in case of breaches of these terms.
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '8. Haftungsbegrenzung' : '8. Limitation of liability'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Soweit gesetzlich zulässig, haften wir nur für vorsätzliche oder grob fahrlässige Pflichtverletzungen. Für leichte
                  Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten.
                </p>
              ) : (
                <p>
                  To the extent permitted by law, we are liable only for intentional or grossly negligent breaches. For simple negligence, we are liable only if essential contractual obligations are violated.
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '9. Anwendbares Recht' : '9. Governing law'} theme={theme}>
              {language === 'de' ? <p>Diese Bedingungen unterliegen dem Recht der Bundesrepublik Deutschland. Gerichtsstand: Berlin.</p> : <p>These terms are governed by the laws of Germany. Venue: Berlin.</p>}
            </Section>
          </>
        )}

        {kind === 'privacy' && (
          <>
            <Section title={language === 'de' ? '1. Überblick' : '1. Overview'} theme={theme}>
              {language === 'de' ? (
                <p>Diese Datenschutzerklärung beschreibt, wie wir personenbezogene Daten in der App verarbeiten.</p>
              ) : (
                <p>This Privacy Policy explains how we process personal data in the App.</p>
              )}
            </Section>

            <Section title={language === 'de' ? '2. Verantwortlicher' : '2. Controller'} theme={theme}>
              {language === 'de' ? (
                <>
                  <p>
                    Verantwortlicher i.S.d. Art. 4 Nr. 7 DSGVO: <strong>Harvested</strong>, Hosemannstraße 21, 10409 Berlin, Deutschland
                    (E-Mail: <strong>melina_vanessa.mann@web.de</strong>).
                  </p>
                </>
              ) : (
                <p>
                  Controller (Art. 4(7) GDPR): <strong>Harvested</strong>, Hosemannstraße 21, 10409 Berlin, Germany
                  (email: <strong>melina_vanessa.mann@web.de</strong>).
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '3. Welche Daten wir verarbeiten' : '3. Data we process'} theme={theme}>
              {language === 'de' ? (
                <ul className="list-disc pl-5 space-y-1">
                  <li>Profilangaben (Name, Handle, Avatar), ggf. Rolleninformationen.</li>
                  <li>Inhalte, die du veröffentlichst (Texte/Bilder) sowie Reservierungen.</li>
                  <li>Nachrichten zwischen Nutzern (z.B. im Chat).</li>
                  <li>Technische Informationen im Rahmen des Betriebs (z.B. IP-Adresse, wenn erforderlich für Sicherheit).</li>
                  <li>Falls aktiviert/benutzt: gespeicherte Login- und Profil-Patches im Browser via <code>localStorage</code>.</li>
                </ul>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  <li>Profile data (name, handle, avatar), and role information.</li>
                  <li>Content you publish (text/images) and reservations.</li>
                  <li>Messages between users (e.g., chat).</li>
                  <li>Technical information for operation (e.g., IP address where necessary).</li>
                  <li>Where used: saved login/profile patches in your browser via <code>localStorage</code>.</li>
                </ul>
              )}
            </Section>

            <Section title={language === 'de' ? '4. Zwecke der Verarbeitung' : '4. Purposes of processing'} theme={theme}>
              {language === 'de' ? (
                <ul className="list-disc pl-5 space-y-1">
                  <li>Betrieb der App und Bereitstellung von Funktionen (Angebote, Reservierungen, Chat).</li>
                  <li>Benachrichtigungen und Kommunikation zwischen Nutzern.</li>
                  <li>Fehlerbehebung, Sicherheit und Missbrauchsbekämpfung.</li>
                </ul>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  <li>Operating the App and providing features (offers, reservations, chat).</li>
                  <li>User communications and notifications.</li>
                  <li>Troubleshooting, security, and preventing abuse.</li>
                </ul>
              )}
            </Section>

            <Section title={language === 'de' ? '5. Empfänger und Drittanbieter' : '5. Recipients & third parties'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Kartenfunktionen können je nach Konfiguration Daten an Drittanbieter übermitteln (z.B. Google Maps oder OpenStreetMap).
                  Dies betrifft insbesondere IP-Adressen und Nutzungsdaten im Rahmen von Karten-/Tile-Anfragen.
                </p>
              ) : (
                <p>
                  Map features may transmit data to third parties depending on configuration (e.g., Google Maps or OpenStreetMap).
                  This may include IP addresses and usage data in connection with tile/map requests.
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '6. Rechtsgrundlagen' : '6. Legal bases'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Wir verarbeiten personenbezogene Daten im Rahmen der gesetzlichen Bestimmungen, z.B. zur Vertragserfüllung,
                  aufgrund berechtigter Interessen oder mit deiner Einwilligung, soweit erforderlich.
                </p>
              ) : (
                <p>
                  We process personal data under applicable legal requirements, e.g., for contract performance, legitimate interests, or where required, consent.
                </p>
              )}
            </Section>

            <Section title={language === 'de' ? '7. Deine Rechte' : '7. Your rights'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung und Datenübertragbarkeit sowie das Recht,
                  Widerspruch einzulegen. Dazu kannst du dich an uns wenden (E-Mail: <strong>melina_vanessa.mann@web.de</strong>).
                </p>
              ) : (
                <p>
                  You have rights to access, rectify, delete, restrict processing, data portability, and to object. Contact us (see Imprint).
                </p>
              )}
            </Section>
          </>
        )}

        {kind === 'imprint' && (
          <>
            <Section title={language === 'de' ? 'Angaben gemäß § 5 TMG' : 'Legal notice (Imprint)'} theme={theme}>
              {language === 'de' ? (
                <>
                  <p>
                    Betreiber: <strong>Harvested</strong>
                  </p>
                  <p>
                    Adresse: <strong>Hosemannstraße 21, 10409 Berlin, Deutschland</strong>
                  </p>
                  <p>
                    E-Mail: <strong>melina_vanessa.mann@web.de</strong>
                  </p>
                  <p>
                    Umsatzsteuer-ID: <strong>nicht angegeben</strong>
                  </p>
                  <p>
                    Handelsregister / Registernummer: <strong>nicht angegeben</strong> (soweit nicht zutreffend)
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Operator: <strong>Harvested</strong>
                  </p>
                  <p>Address: <strong>Hosemannstraße 21, 10409 Berlin, Germany</strong></p>
                  <p>Email: <strong>melina_vanessa.mann@web.de</strong></p>
                  <p>VAT ID: <strong>not provided</strong></p>
                  <p>Register information: <strong>not provided</strong> (if not applicable)</p>
                </>
              )}
            </Section>

            <Section title={language === 'de' ? 'Kontakt' : 'Contact'} theme={theme}>
              {language === 'de' ? (
                <p>
                  Für rechtliche und sonstige Anfragen: <strong>melina_vanessa.mann@web.de</strong>.
                </p>
              ) : (
                <p>
                  For legal and other inquiries: <strong>melina_vanessa.mann@web.de</strong>.
                </p>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}

