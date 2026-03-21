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

## Karte (OpenStreetMap & optional Google)

Standardmäßig ist die Karte **interaktiv** (Zoom, Verschieben, Marker) über **OpenStreetMap**-Kacheln (Leaflet) – **ohne API-Key**.

Optional kann stattdessen **Google Maps** genutzt werden:

1. In [Google Cloud Console](https://console.cloud.google.com/) ein Projekt anlegen, **Maps JavaScript API** aktivieren und einen API-Key erstellen.
2. Den Key per HTTP-Referrer einschränken (z. B. `http://localhost:5173/*` für lokale Entwicklung).
3. Im Projektroot eine Datei `.env` anlegen (siehe `.env.example`):

```bash
VITE_GOOGLE_MAPS_API_KEY=dein_key_hier
```

Ist der Key gesetzt, wird Google Maps verwendet; schlägt das Laden fehl, fällt die App auf OpenStreetMap zurück.

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
