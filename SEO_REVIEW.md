# SEO Review & Growth Plan for The Gin Library (Aachen)

## Scope reviewed
- `index.html` single-page site structure, metadata, on-page content, and bilingual behavior.
- `styles.css` for UX/performance-adjacent impacts.

## Executive summary
The current site has a clean design and already includes important terms such as **gin tastings**, **cocktail catering**, **corporate events**, and **Aachen**. That is a good base. However, to rank for high-intent local searches (e.g., "gin tasting Aachen", "cocktail catering Aachen", "corporate bar events Aachen"), the site needs stronger technical SEO signals, localized landing content, and local authority signals.

### Biggest opportunities (highest impact first)
1. Add proper semantic headings (`h1`, `h2`) and richer text sections targeting specific search intents.
2. Add structured data (JSON-LD) for `BarOrPub` and `LocalBusiness` (service area + offerings).
3. Expand from one page to dedicated service pages:
   - Gin Tastings Aachen
   - Cocktail Catering Aachen
   - Corporate Bar Events / Mobile Bar Aachen
4. Improve multilingual SEO with true EN/DE URLs and `hreflang` tags (not only JS text swapping).
5. Build local SEO assets: Google Business Profile optimization, reviews, local citations, and event backlinks.

---

## Current SEO strengths
- Clear location mention (**Aachen**) in visible content and metadata.
- Relevant commercial terms already present (gin tastings, cocktail catering, corporate events).
- Mobile viewport meta tag and lightweight static structure.
- Click-ready conversion CTAs (`tel:` and `mailto:`), helpful for local lead generation.

## Critical issues to fix

### 1) Missing heading hierarchy
There is no visible `h1` and no clear `h2` topic structure.

**Why it matters:** Search engines rely on heading structure to understand topical focus and page intent.

**Fix:**
- One `h1`: `Gin Tastings, Cocktails & Bar Catering in Aachen | The Gin Library`
- Add `h2` sections:
  - `Gin Tastings in Aachen`
  - `Cocktail Catering for Corporate Events`
  - `Private Cocktail Workshops & Team Events`
  - `Visit Our Cocktail Bar in Aachen`

### 2) Language toggle via JavaScript only
The page toggles copy in JS but remains a single URL.

**Why it matters:** Google indexes URLs, not UI states. You lose full bilingual indexation potential.

**Fix:**
- Create `/de/` and `/en/` versions (or `?lang=de` canonicalized carefully).
- Add `hreflang` tags for `de-DE` and `en`.
- Keep language switcher but make it link between URLs.

### 3) No structured data
No JSON-LD schema for business type, address, opening hours, and services.

**Why it matters:** Structured data improves local relevance and eligibility for richer search presentation.

**Fix:** Add JSON-LD with:
- `@type: BarOrPub` (or `LocalBusiness`)
- Name, address, geo, opening hours, phone, email, sameAs profiles
- `areaServed`: Aachen + nearby cities
- `hasOfferCatalog` / service mentions for gin tastings, cocktail catering, corporate bar events

### 4) Limited indexable content depth
One short homepage cannot rank strongly for several competitive intents.

**Why it matters:** Different keyword intents need dedicated, in-depth pages.

**Fix:** Create intent pages with 600–1200 words each:
- `/gin-tasting-aachen`
- `/cocktail-catering-aachen`
- `/corporate-bar-events-aachen`
- Optional: `/mobile-bar-mieten-aachen` (German-intent page)

### 5) Missing technical SEO basics
No visible robots, sitemap, canonical, OG/Twitter metadata.

**Fix:**
- Add `rel="canonical"`
- Add `robots.txt`
- Add `sitemap.xml`
- Add Open Graph and Twitter cards for social CTR
- Compress images and serve modern formats (`webp/avif`) where possible

---

## Keyword strategy for target topics

## Primary keyword clusters
1. **Gin tastings**
   - gin tasting aachen
   - gin tastings aachen
   - gin seminar aachen
   - gin workshop aachen

2. **Cocktail bar + local intent**
   - cocktail bar aachen
   - beste cocktailbar aachen
   - bar aachen cocktails

3. **Catering / events**
   - cocktail catering aachen
   - bar catering aachen
   - mobile bar aachen
   - cocktail service firmenfeier aachen

4. **Corporate / B2B events**
   - corporate bar events aachen
   - firmenfeier cocktail bar aachen
   - team event cocktail workshop aachen

## Suggested page-to-keyword mapping
- Homepage: brand + broad local (`cocktail bar aachen`, `gin tastings aachen`)
- Gin Tasting page: informational + booking intent
- Cocktail Catering page: service + lead intent
- Corporate Events page: B2B/commercial intent

---

## Recommended on-page content blocks
For each service page include:
1. Intro paragraph with location + service + audience
2. “How it works” (3 steps)
3. Packages/pricing examples (or “starting from”)
4. Venues served (Aachen + nearby towns)
5. FAQ section (schema eligible)
6. Strong CTA + short lead form

### FAQ ideas (great for long-tail)
- “How much does cocktail catering in Aachen cost?”
- “Do you offer gin tastings for company events?”
- “How many guests can your mobile bar serve?”
- “Can you provide non-alcoholic cocktail options?”
- “Do you travel outside Aachen?”

---

## Local SEO plan (off-page)
1. Fully optimize Google Business Profile:
   - Primary category: Cocktail bar
   - Secondary categories: Caterer, Event planner (if applicable)
   - Add services + booking link + event photos weekly
2. Collect reviews mentioning services + location naturally.
3. Build local citations (Aachen city directories, event portals, chamber/network listings).
4. Acquire backlinks from:
   - Local wedding planners / event venues
   - Corporate event agencies
   - Aachen lifestyle blogs and local press

---

## 90-day execution roadmap

### Phase 1 (Weeks 1–2): Technical foundation
- Add semantic heading structure and canonical metadata
- Implement JSON-LD local business schema
- Create sitemap + robots + Open Graph
- Improve image performance

### Phase 2 (Weeks 3–6): Landing pages
- Publish 3 service landing pages
- Add FAQ blocks with internal links
- Build conversion forms and track events

### Phase 3 (Weeks 7–12): Authority and local growth
- Google Business Profile posting cadence
- Review generation campaign
- Local link outreach + partner pages

---

## KPI targets to track monthly
- Impressions/clicks for:
  - gin tasting aachen
  - cocktail catering aachen
  - corporate bar events aachen
- Organic leads from forms, calls, and email clicks
- Google Business Profile actions (calls, direction requests, website visits)
- Top landing pages by conversions

---

## Optional quick wins (can be done this week)
1. Update title tag to include primary intent + location.
2. Expand meta description with service + CTA.
3. Add `h1` and section `h2` headings.
4. Add 150–250 words under each service teaser.
5. Add a dedicated “Corporate Cocktail Catering in Aachen” section on homepage.
