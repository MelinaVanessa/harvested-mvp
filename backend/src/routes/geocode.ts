import { Router } from 'express'

export const geocodeRouter = Router()

type NominatimRow = {
  lat: string
  lon: string
  display_name: string
}

/** GET /api/geocode?query=<term>&limit=<n>
 * Returns a small list of address suggestions (lat/lon + display name).
 * Proxy to OpenStreetMap Nominatim to avoid browser CORS issues.
 */
geocodeRouter.get('/', async (req, res) => {
  const query = (req.query.query as string | undefined)?.trim()
  if (!query) return res.status(400).json({ error: 'query is required' })

  const limitRaw = req.query.limit as string | undefined
  const limit = Math.max(1, Math.min(10, limitRaw ? Number(limitRaw) : 5))

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}` +
      `&addressdetails=0&polygon_geojson=0&accept-language=en&q=${encodeURIComponent(query)}`

    const r = await fetch(url, {
      headers: {
        // Nominatim asks for a UA string for heavy usage; for MVP this is enough.
        'User-Agent': 'HarvestedMVP/1.0 (github.com)'
      },
    })

    if (!r.ok) {
      return res.status(502).json({ error: `Geocoding failed (${r.status})` })
    }

    const rows = (await r.json()) as NominatimRow[]
    const out = rows.map((x) => ({
      lat: Number(x.lat),
      lon: Number(x.lon),
      displayName: x.display_name,
    }))

    res.json(out)
  } catch (e) {
    console.error('[geocode] failed', e)
    res.status(502).json({ error: 'Geocoding failed' })
  }
})

