# Barrel & Stone: concept website

A pitch rebuild of barrelandstone.co.uk by JB Digital. Server-rendered Express + EJS, so every page is fully readable by Google.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy on Railway

1. Railway → New Project → Deploy from GitHub repo → pick this repo.
2. Railway detects Node and runs `npm start`. No build step is needed.
3. Optional environment variables:
   - `SITE_URL`: the public URL, used for canonical tags and the sitemap (default `https://www.barrelandstone.co.uk`)
   - `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM`: email pub enquiries through Resend. Without them, enquiries are written to the Railway logs.

## Pages

| Path | What it does |
|---|---|
| `/` | Signboard hero with pub finder, signature pizzas, nearby pubs, pitch to pub owners |
| `/menu` | Full menu, dietary key, allergen table, menu schema |
| `/find` | Map and searchable list of pubs, "use my location", directions and delivery links |
| `/for-pubs` | B2B pitch: what you get, how it works, profit calculator, FAQ, enquiry form |
| `/partners` | Partner login **placeholder** (no accounts yet) |

Old WordPress URLs (`/contact/`, `/my-account/`, `/our-story/`, `/menu/`) 301-redirect to the new pages.

## Editing content

- **Menu:** `data/menu.json`
- **Pubs:** `data/venues.json` (name, town, address, postcode, lat/lng, hours, delivery platforms)
- **Contact details and social links:** `data/site.json`

## Photos

Drop images into `public/img/` with these names (jpg, png or webp). Each one replaces its placeholder automatically.

| File | Shot |
|---|---|
| `hero` | Whole pizza fresh from the oven, landscape (also used as the social share image) |
| `logo` | Logo for the header (svg/png, light version for a dark background) |
| `pub-table` | Pizza and a pint on a pub table |
| `pizza-rustic-classic` | Square |
| `pizza-nice-and-spicy` | Square |
| `pizza-gone-trufflin` | Square |
| `pizza-rock-the-parma` | Square |
| `pizza-garden-club` | Square |
| `process` | Hands stretching dough or loading the oven |
| `ingredients` | Ingredients flat lay |
| `pub` | Pub interior or exterior |

## Concept placeholders to replace before launch

- Venues in `data/venues.json` are **sample data**.
- Prices are a guide, and allergen data is **indicative**. Both need confirming by Barrel & Stone.
- The partner testimonials are example quotes, labelled on the page.
- FAQ answers describe the service in general terms. Check them against the real offer.
