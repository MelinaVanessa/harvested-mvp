# Harvested API (Backend)

REST-API für das Harvested MVP. In-Memory-Daten, gleiche Struktur wie der Frontend-Mock.

## Start

```bash
cd backend
npm install
npm run dev
```

API: **http://localhost:3001**

## Endpoints

| Method | Pfad | Beschreibung |
|--------|------|--------------|
| GET | `/api/health` | Health-Check |
| GET | `/api/listings` | Alle Listings |
| GET | `/api/listings/:id` | Ein Listing |
| POST | `/api/listings` | Listing anlegen (Header `X-User-Id`: gardenerId) |
| PUT | `/api/listings/:id` | Listing aktualisieren |
| DELETE | `/api/listings/:id` | Listing löschen |
| GET | `/api/users?ids=u1,u2` | Mehrere User (Query `ids`) |
| GET | `/api/users/:id` | Ein User |
| PATCH | `/api/users/:id` | User aktualisieren |
| GET | `/api/reservations` | Alle Reservierungen |
| POST | `/api/reservations` | Reservierung anlegen (Body: `{ listingId, amount }`, Header `X-User-Id`) |
| DELETE | `/api/reservations/:id` | Reservierung stornieren |
| GET | `/api/messages?partnerId=u2` | Nachrichten mit Partner (Header `X-User-Id`) |
| POST | `/api/messages` | Nachricht senden (Body: `{ partnerId, text }`, Header `X-User-Id`) |

## Authentifizierung (MVP)

Es gibt keine echte Auth. Der eingeloggte User wird per Header **`X-User-Id`** übergeben (z. B. `u1`). Das Frontend muss diesen Header bei POST-Anfragen und bei GET `/api/messages` setzen.
