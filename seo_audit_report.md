# SEO Codebase Audit — भारतByDay

**Audit date:** 23 August 2026
**Audited commit:** `a38950a` (main)
**Live URL:** https://f9xr.github.io/BharatByDay/
**Method:** Static codebase analysis (all layouts, includes, JS, config, posts) + live verification of built pages, sitemap, feeds, headers, and status codes.

---

## 1. Site Context & Audit Assumptions

| Attribute | Value |
|---|---|
| Project type | Content blog — one offbeat-India destination guide per day |
| Stack | Jekyll 4 (minima theme), GitHub Pages, no build tooling beyond Jekyll |
| Audience | Indian and global travelers researching offbeat India; secondary: food/street-food readers |
| Monetization | Cross-links to F9XR agency services (website dev, local SEO tools) |
| Primary keywords | Destination queries ("chand baori stepwell", "dzuko valley trek", "chikmagalur guide"), food fusion ("pizza dosa"), brand "भारतByDay" |
| Geography | India-focused content, `en` language, Asia/Kolkata timezone |

Pillars weighted heavily: Technical SEO, Core Web Vitals, Structured Data, E-E-A-T/trust, Internal Linking.
Pillars skipped (not applicable): E-commerce, hreflang/i18n (single language), JavaScript-framework rendering (static output confirmed), LocalBusiness/NAP (not a local business site).

---

## 2. Priority Fix Matrix

Ordered by ranking/traffic impact per unit of effort. Items 1–5 are the ones to ship first.

| # | Severity | Finding | Location | Effort |
|---|---|---|---|---|
| 1 | **High** | RSS feed 404s at `/feed.xml`, referenced from 4 places | head.html:31, header.html:31, home.html:41, index.md:36 | 10 min |
| 2 | **High** | Tailwind Play CDN loaded synchronously twice on every page — render-blocking dev tool in production | hero.html:143, footer.html:240 | 15 min |
| 3 | **High** | highlight.js + 2 stylesheets load synchronously in `<head>` of every page though code highlighting is disabled | head.html:45–54, _config.yml:79–81 | 10 min |
| 4 | **High** | No image has explicit `width`/`height` → CLS risk; homepage LCP image is eager-loaded without dimensions | hero.html:78–79, all post body images | 30 min |
| 5 | **Medium-High** | "Privacy policy" footer link points to a GitHub repo root; no privacy or contact page exists (blocks ad-network approval, weakens E-E-A-T) | footer.html:161 | 1 hr |
| 6 | Medium | 5 of 6 homepage category chips link to archive fragments that don't exist | hero.html:19,59–63 | 20 min |
| 7 | Medium | JSON-LD built with HTML `escape` filter instead of `jsonify` — emits invalid JSON the moment a value contains an apostrophe | head.html:62,64,82,85; post.html:394 | 15 min |
| 8 | Medium | Visual breadcrumbs exist but no BreadcrumbList structured data | post.html:36–47 | 15 min |
| 9 | Medium | Author entity is an Organization in BlogPosting schema; author page has no Person schema with sameAs | post.html:399–404, author.html | 30 min |
| 10 | Medium | Four font families across three origins, all render-blocking | head.html:17–22, hero.html:16, footer.html:16 | 1 hr |
| 11 | Medium | search.json ships the full text of every post to the client; payload grows daily | search.json:5 | 10 min |
| 12 | Low-Med | Mixed permalink scheme: two posts use date URLs, two use custom slugs | _posts front matter | policy only |
| 13 | Low | favicon declared `type="image/svg+xml"` but is a WebP; logo hotlinked from another repo | head.html:9, _config.yml:20 | 10 min |
| 14 | Low | IndexNow not implemented — free instant Bing/Yandex discovery for a daily-publishing blog | site-wide | 30 min |

---

## 3. Detailed Findings & Exact Fixes

### Finding 1 — High · Broken RSS feed (`/feed.xml` → 404)

**Evidence:** Live HEAD request returns 404. References exist in `_includes/head.html:31` (`<link rel="alternate" type="application/rss+xml" ... href="/feed.xml">`), `_includes/header.html:31` (nav "RSS"), `_layouts/home.html:41`, and `index.md:36`. `_config.yml:53–55` sets jekyll-feed's output to `atom.xml` only; no mirror file exists.

**Why it matters:** Feed autodiscovery in browsers/readers hits a 404; four broken internal links dilute crawl quality; README claims a feed.xml mirror that doesn't exist.

**Fix (choose A, simplest):**

A) Point every reference at the working atom feed:
```liquid
<!-- head.html line 31 -->
<link rel="alternate" type="application/atom+xml" title="{{ site.title | escape }} — Atom Feed" href="{{ "/atom.xml" | relative_url }}">
```
Apply the same substitution in `header.html:31`, `home.html:41`, `index.md:36`.

B) Or create a redirecting mirror `feed.xml` at repo root:
```yaml
---
permalink: /feed.xml
sitemap: false
---
{% assign feed = site.source %}{% include atom.xml %}
```
Option A recommended — fewer moving parts.

---

### Finding 2 — High · Tailwind Play CDN in production, loaded twice

**Evidence:** `_includes/footer.html:240` and `_includes/hero.html:143` both load `https://cdn.tailwindcss.com` synchronously. The Play CDN is a runtime JIT compiler (~110 KB gzip + generation work), explicitly documented by Tailwind as "not for production". It also prints a console warning on every pageview.

**Why it matters:** It blocks parsing twice per page, delays FCP/LCP on mobile, and generates styles client-side after content paint (flash risk). The site already carries hand-written CSS for all critical layout (`css/override.css`).

**Fix:** Delete both script tags and their inline `tailwind.config` blocks (hero.html:144–155). Before deleting, confirm which utility classes are genuinely relied upon at runtime — currently `max-w-[1000px]`, `max-w-[1360px]`, flex/grid utilities in post/hero markup. Port any class still doing visual work into `override.css`, then remove the CDN. This also removes the silent dependency that made the reading column narrower than intended (see width note in §5).

---

### Finding 3 — High · Dead weight: highlight.js loads on every page

**Evidence:** `_includes/head.html:45–54` loads two hljs theme stylesheets, `highlight.min.js`, three language packs synchronously in `<head>`, then calls `hljs.highlightAll()` inline before `<body>` exists. Meanwhile `_config.yml:79–81` disables kramdown syntax highlighting, and no post contains fenced code blocks.

**Why it matters:** ~80 KB+ of JS plus two unused stylesheets block first paint on every URL for zero benefit.

**Fix:** Remove lines 44–55 of `head.html` entirely (the whole "highlight.js support" block). If code blocks are ever needed, re-add with `defer`.

---

### Finding 4 — High · Images missing intrinsic dimensions (CLS)

**Evidence:** Every `<img>` across templates and posts lacks `width`/`height`. Highest impact: `_includes/hero.html:78–79` featured-card image (`loading="eager"`, it is the homepage LCP candidate) and stacked thumbs (109–110); post body images use kramdown attribute lists without dimensions; `index.md:24` launch banner unsized.

**Why it matters:** Without intrinsic ratios the browser reserves zero space → layout shift as images arrive. CLS is a direct Core Web Vitals ranking input.

**Fix pattern (Wikimedia images expose exact dimensions via their thumb URLs):**
```markdown
![Masala dosa, the base of pizza dosa](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Masala_Dosa.jpg/1280px-Masala_Dosa.jpg){: loading="lazy" decoding="async" width="1280" height="900" }
```
For hero.html, set dimensions server-side per card or enforce an aspect-ratio box:
```css
.hero-thumb { aspect-ratio: 16 / 9; object-fit: cover; }
```

---

### Finding 5 — Medium-High · Trust pages missing; footer mislabels GitHub repo as "Privacy policy"

**Evidence:** `_includes/footer.html:161` anchors the text "Privacy policy" to `https://github.com/f9xr/BharatByDay`. No privacy page, terms page, or contact page exists anywhere in the repo; contact is a bare mailto in the footer (157).

**Why it matters:** Trust-page absence is an E-E-A-T negative for a publisher, a practical blocker for Google AdSense/affiliate review, and the mislabeled link is a user-trust smell. The two-layer test (exists + reachable) fails on layer one.

**Fix:** Create `privacy.md` (layout: page, sitemap: keep) describing analytics usage, cookies, and CCPL licence; point footer.html:161 at `{{ '/privacy.html' | relative_url }}`; rename footer.html:164 "Our mission" anchor (currently duplicates the Our Authors target) and differentiate destinations.

---

### Finding 6 — Medium · Homepage hero chips link to dead fragments

**Evidence:** `_includes/hero.html:19` hardcodes chip list `Himalayas | Western Ghats | Heritage Sites | Hidden Trails | Local Culture | Eco-Tourism`, emitting links to `/archive.html#himalayas`, `#heritage-sites`, `#hidden-trails`, `#local-culture`, `#eco-tourism`. Archive section ids are generated from real tag slugs (`archive.md:12`) — actual tags include `heritage-sites-india`, `eco-tourism-india`, `western-ghats`. Only `#western-ghats` resolves.

**Why it matters:** The most prominent navigation element on the homepage sends users (and crawlers following links) to empty fragment targets — five dead ends above the fold.

**Fix:** Generate chips dynamically from `site.tags` instead of hardcoding, or align the hardcoded slugs to existing tags:
```liquid
{%- assign featured = "Western Ghats,Heritage Sites India,Eco Tourism India,Rajasthan,Karnataka,Nagaland" | split: "," -%}
{%- for t in featured -%}
  <a href="{{ '/archive.html' | relative_url }}#{{ t | slugify }}">{{ t }}</a>
{%- endfor -%}
```

---

### Finding 7 — Medium · JSON-LD escaping bugs (latent invalid structured data)

**Evidence:**
- `_includes/head.html:62,64,82,85` interpolate `{{ ... | escape }}` inside JSON strings. Liquid's `escape` produces HTML entities (`भारत` is fine, but any future apostrophe becomes `&#39;` — invalid JSON-LD).
- `_layouts/post.html:394`: `"image": "{{ page.image }}"` raw interpolation — breaks JSON if an image URL ever contains a quote.

Both currently parse only because current values happen to be clean.

**Fix:**
```liquid
"name": {{ site.title | jsonify }},
"description": {{ site.description | jsonify }},
"image": {{ page.image | jsonify }}
```
`jsonify` handles all quoting correctly.

---

### Finding 8 — Medium · Breadcrumbs rendered but not marked up as structured data

**Evidence:** `_layouts/post.html:36–47` renders a breadcrumb nav visually; no BreadcrumbList JSON-LD exists anywhere.

**Why it matters:** Breadcrumb rich results in SERPs are driven by BreadcrumbList schema; Google may otherwise substitute its own path guess.

**Fix (add to post.html, near the existing BlogPosting script):**
```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": {{ "/" | absolute_url | jsonify }}},
    {"@type": "ListItem", "position": 2, "name": "Destinations", "item": {{ "/archive.html" | absolute_url | jsonify }}},
    {"@type": "ListItem", "position": 3, "name": {{ page.title | jsonify }}, "item": {{ page.url | absolute_url | jsonify }}}
  ]
}
</script>
```

---

### Finding 9 — Medium · Author E-E-A-T: Person schema absent

**Evidence:** BlogPosting `author` is an Organization (post.html:399–404). The author page (`/author/f9xr/`) renders bio and social links but emits no Person structured data. Byline links exist (`rel="author"`), which helps, but machines get no entity graph.

**Fix:** On the author page (or site-wide via a conditional in head.html):
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "F9XR Editorial Team",
  "url": "https://f9xr.github.io/BharatByDay/author/f9xr/",
  "worksFor": {"@type": "Organization", "name": "F9XR", "url": "https://f9xr.github.io"},
  "sameAs": ["https://github.com/f9xr","https://linkedin.com/company/f9xrteam","https://instagram.com/f9xrteam"]
}
```
And switch BlogPosting author to a Person referencing that same `@id`.

---

### Finding 10 — Medium · Font loading: four families, three origins, all blocking

**Evidence:** head.html:17 (Inter + Source Serif 4 + JetBrains Mono from Google Fonts), head.html:21–22 (Neue Haas Text + Display from cdnfonts.com), hero.html:16 (Playfair Display), footer.html:16 (Poppins). Six stylesheets total across three origins; cdnfonts.com does not document `font-display` behaviour.

**Why it matters:** Each stylesheet is render-blocking; FOIT/FOUT risk on the display faces; third-party font CDN adds an SPOF outside Google's reliable network.

**Fix:** Consolidate to Inter (UI/body) + one display face. Drop JetBrains Mono (no code on site once hljs is removed), drop Poppins and Playfair (redundant with Neue Haas), self-host WOFF2 if Neue Haas licensing permits, else accept the two remaining families. Keep `display=swap`.

---

### Finding 11 — Medium · search.json ships entire post corpus

**Evidence:** `search.json:5` exposes stripped `content` for every post, unbounded. At 4 posts this is fine; at the stated cadence (daily) the client downloads megabytes within months on every search page visit.

**Fix:** Drop the `content` field; search over `title + tags + excerpt(description)` instead. If full-text search is desired later, move to a build-time index (e.g., Lunr prebuilt JSON) or Pagefind.

---

### Finding 12 — Low-Medium · Permalink scheme inconsistency

**Evidence:** Chand Baori and Dzüko use default date URLs (`/2026/08/01/chand-baori-...html`); Chikmagalur and Pizza Dosa define custom permalinks (`/chikmagalur-coffee-land-karnataka-guide`). All resolve; sitemap reflects reality.

**Fix:** Policy decision going forward: custom slugs for all new posts (shorter, keyword-forward, date-independent). Do not retrofit old URLs — redirects would churn equity for no gain.

---

### Finding 13 — Low · Favicon/logo hygiene

**Evidence:** head.html:9 declares `type="image/svg+xml"` for a `.webp` file. `site.logo` points at `https://f9xr.github.io/logo.webp` — another repository; if that site changes its logo, every favicon, og:image fallback, and schema logo here changes silently.

**Fix:** Correct the MIME type (or drop the duplicate icon line — line 7 already sets the JPEG icon). Longer term, copy logo.webp into this repo and reference it locally.

---

### Finding 14 — Low · IndexNow not implemented

**Evidence:** No key file, no submission pipeline. For a site whose entire premise is daily publishing, passive crawl discovery leaves speed on the table (Bing/Yandex/Seznam/Naver).

**Setup (30 minutes):**
1. Generate a key: a random 32-hex string.
2. Commit `{key}.txt` at repo root containing only the key; it will serve at `https://f9xr.github.io/BharatByDay/{key}.txt`.
3. After each deploy, submit changed URLs:
```bash
curl -X POST https://api.indexnow.org/IndexNow \
  -H "Content-Type: application/json" \
  -d '{"host":"f9xr.github.io","key":"<KEY>","keyLocation":"https://f9xr.github.io/BharatByDay/<KEY>.txt","urlList":["https://f9xr.github.io/BharatByDay/pizza-dosa-fusion-street-food-guide"]}'
```
Note: keyLocation must be on the same host as submitted URLs — using the f9xr.github.io host covers the BharatByDay subpath.

---

## 4. Verified-Healthy Items (no action needed)

- **Canonicals:** correct on all checked pages, including baseurl handling (`rel="canonical" href=".../BharatByDay/pizza-dosa-fusion-street-food-guide"`).
- **Titles/meta descriptions:** unique per post, good lengths, keywords front-loaded; homepage description present.
- **Heading structure:** exactly one `<h1>` on home, posts, author, 404; h2 counts healthy (18 on pizza-dosa post).
- **robots.txt:** valid, allows all, references sitemap.
- **sitemap.xml:** auto-generated, contains all 8 indexable URLs, correct lastmod on posts; no noindex/blocked pages listed.
- **Status codes:** proper hard 404s (random URL returns 404 status); atom.xml live; HSTS present (`max-age=31556952`); HTTPS enforced on all internal references; no mixed-content resource loads.
- **Internal linking:** all internal hrefs resolve under `/BharatByDay/` except items #1 and #6; prev/next and related-post links are `relative_url`-safe; cross-post body links verified.
- **Structured data:** WebSite + SearchAction and Organization JSON-LD site-wide; valid BlogPosting JSON-LD (headline/datePublished/publisher/image/keywords) on all four posts; FAQPage blocks syntactically valid. Note: FAQ rich results have been restricted since Aug 2023 to authoritative gov/health sites — keep the schema for AI-search citation value, expect no SERP feature from it.
- **Compression/caching:** served via Fastly (GitHub Pages) with gzip and sensible cache headers; TTFB well under threshold from India edge (x-github-edge-region: centralindia).
- **Accessibility basics:** viewport meta correct, form inputs labelled, aria-labels on icon buttons, skip-free focus traps absent, alt text present on all images checked.
- **No orphan pages:** archive, author, search, and all posts reachable from header/footer/home within ≤2 clicks.
- **XSS:** search.js escapes all user-influenced output; query param never injected into innerHTML.

## 5. Notes on the 23 Aug 2026 Width Change

Post reading column widened from 860px → 1080px via `css/override.css` (.wrapper, .post) and the active Tailwind arbitrary-value cap in `_layouts/post.html` (`max-w-[840px]` → `max-w-[1000px]`). Because the Play CDN generates utility CSS at runtime (see Finding 2), BOTH layers had to change; changing override.css alone would have had no visible effect. Archive/search/author pages remain capped at their own 780px inner widths — intentional, they read fine narrow.

---

*Report generated by static analysis + live verification. Re-run after shipping findings 1–5.*
