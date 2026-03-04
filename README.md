# Harvested MVP

Moderne React-Anwendung für das Harvested-Projekt – Ernte teilen, Lebensmittel retten. UI für Kleingärtner:innen mit einfacher Bedienung.

## Tech-Stack

- **React 18** + **TypeScript**
- **Vite** (Build & Dev)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)

## Projektstruktur

```
src/
├── components/     # Wiederverwendbare UI-Komponenten (NavButton, FilterChip, ListingCard, …)
├── views/         # Seiten/Views (Login, Home, Map, Profile, …)
├── data/          # Daten-Schicht (Mock + P2P-ready Service-Interface)
├── types/         # TypeScript-Typen
├── constants/      # Themes, Übersetzungen (DE/EN), Logo-URL
├── App.tsx         # Haupt-App und State
├── main.tsx
└── index.css
```

## Datenanbindung (P2P-vorbereitet)

- **`src/data/harvestedService.ts`** – Interface `HarvestedService` (Listings, User, Reservierungen, Nachrichten).
- **`src/data/mockService.ts`** – In-Memory-Mock-Implementierung für Entwicklung.
- Später: eigener Service (z. B. P2P/API), der `HarvestedService` implementiert und in der App eingebunden wird.

## Skripte

**Frontend (Projektroot):**
```bash
npm install
npm run dev      # Dev-Server (z. B. http://localhost:5173)
npm run build    # Production-Build
npm run preview  # Vorschau des Builds
```

**Backend (REST-API):**
```bash
cd backend && npm install && npm run dev
```
API: http://localhost:3001. Siehe `backend/README.md` für Endpoints und Header `X-User-Id`.

## Logo

**Dein echtes Logo** (nur das Symbol, z. B. PNG) gehört nach **`public/harvested-logo.png`**. Die Login-Seite lädt es unter `/harvested-logo.png`. Damit Hintergrund und Seite übereinstimmen (nur grüne Pixel sichtbar, Rest = Seitenfarbe):

```bash
npm run process-logo
```

Das Skript ersetzt alle Nicht-Grün-Pixel in `public/harvested-logo.png` durch #FCFAF7.

## Test-Login

- **E-Mail:** melina_vanessa.mann@web.de  
- **Passwort:** test1234 → Gärtner-Modus | test12345 → Käufer-Modus  

---

Made with 💚 in Berlin
