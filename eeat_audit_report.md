# भारतByDay — E-E-A-T Audit Report

Date: 2026-08-23 · Scope: all published pages, layouts, config (`_config.yml`), and the four live posts. Evidence cited by file/line. Priorities: **P1** = do first (trust-critical), **P2** = strong signal gains, **P3** = polish.

---

## Verdict

The site's *Expertise* layer is solid for its age: primary-source citations, practical logistics, clean technical SEO. Its weakest layers are **Experience** (zero first-hand signals) and **Authority** (no named humans anywhere). Google's quality raters are told to weigh "who wrote this, and have they actually been there." Today the honest answer on both counts is "an anonymous team that reads records" — which caps the site's ceiling regardless of content quality.

Scorecard (5 = strong):

| Layer | Score | One-line reason |
|---|---|---|
| Experience | 2/5 | No original photos, no visit evidence, no named travelers |
| Expertise | 4/5 | ASI/forest-dept sourcing, permits, seasons, real logistics |
| Authority | 2.5/5 | Masthead exists; zero identifiable people; no external reputation |
| Trust | 3/5 | Open source + CC intent + corrections promise; but no privacy page, Gmail contact, undisclosed self-promotion |

---

## What's already working (keep doing this)

1. **Primary-source citations in every post** — e.g. pizza-dosa guide cites ASI and district tourism sources; Dzüko post covers permit rules from forest department requirements. This is rarer than it should be in travel SEO.
2. **Open-source repo** (`github.com/f9xr/BharatByDay`) — verifiable publishing process; footer links to it honestly ("Source on GitHub").
3. **Corrections commitment stated on the homepage** — index.md:29 promises open corrections. Good words; needs a mechanism (see P1-2).
4. **Creative Commons licensing intent** (index.md:34, author.md:7) — generous reuse terms build goodwill and citations. Needs a LICENSE file to be real (see P2-4).
5. **Technical trust basics**: HTTPS/HSTS via GitHub Pages, canonical URLs, sitemap.xml, valid atom.xml, BlogPosting + Organization JSON-LD, utterances comments (GitHub-gated, spam-resistant).
6. **Consistent masthead** — single publisher (F9XR) across config, schema, footer h-card, and author page.

---

## P1 — Fix first

### P1-1. Publish a real Privacy Policy page
Evidence: footer previously labeled the GitHub repo link "Privacy policy" (fixed today by relabeling, but the underlying gap remains). The site has a newsletter form (hero) and GA slot (`head.html:33-37`, loads only if `google_analytics` is set). A privacy policy should state what's collected (email, analytics cookies), why, retention, and third parties (Google Analytics, GitHub, utterances/GitHub auth).
Deliverable: `/privacy/` page (~400 words, plain language), linked from footer nav.

### P1-2. Give the corrections promise a mechanism
Evidence: index.md:29 claims "we correct the record openly when things change," but no page explains how. Raters and readers both look for this.
Deliverable: an "Editorial standards & corrections" section on the author page (or standalone page): sourcing method, who reviews, how to report an error (mailto), and a short public changelog table ("2026-08-20 — Chikmagalur post: permit fee updated after notification").

### P1-3. Disclose the F9XR service links inside posts
Evidence: three of four posts funnel to F9XR commercial pages mid-article (chikmagalur.md:178, dzuko.md:158, pizza-dosa CTA block) without a disclosure line. Since F9XR operates this site, these are self-promotional links, not third-party ads — legally safer than affiliates, but transparency norms (FTC-style) still apply.
Deliverable: one line above each service mention: *"Disclosure: F9XR is the studio behind this site; the link above points to our own services."* Cheapest possible trust win; also protects the editorial sections from being read as advertorials.

### P1-4. Upgrade the contact identity
Evidence: sole contact channel is `tontufytservices@gmail.com` (_config.yml:8). A generic Gmail undercuts every other trust signal and looks throwaway.
Deliverable (in order of preference): domain email (`hello@f9xr.in` or similar once a domain exists); else a dedicated `bharatbyday@` Gmail with the name in the address; else keep current but add expected response time next to it ("we reply within 48 hours") so it reads intentional rather than abandoned.

---

## P2 — Strong signal gains

### P2-1. Put a human on the masthead
Evidence: byline is "F9XR Editorial Team" everywhere; author avatar is the site logo (post.html:117,164); author.md names roles (researchers, photographers, fixers) but zero individuals. Anonymous collective bylines are the single biggest Authority drag.
Deliverable: one named Editor-in-Chief (real person, LinkedIn/GitHub linked, 60-word bio with beats covered). Keep the team byline for posts, add "Edited by [Name]" to each post + `Person` schema alongside the existing Organization node.

### P2-2. Add first-hand Experience signals to each post
Evidence: every image is hotlinked (Wikimedia Commons, MakeMyTrip CDN — e.g. chikmagalur.md:73); no sentence in any post evidences a visit ("when we went", "the chai at the gate costs ₹20"). Raters' highest-weighted question for travel: *"Does this reflect actual, first-hand experience?"*
Deliverables (any two per post moves the needle):
- 3-5 original photos per post, even phone-quality, marked "Photo: F9XR"
- A "What we'd do differently" box
- One quoted conversation with a local (guide, homestay owner) — phone interviews count and can be attributed
- Real receipt-level costs ("entry ₹25 foreigner / ₹10 Indian, camera fee extra")

### P2-3. `Person` + `sameAs` structured data
Evidence: `head.html` JSON-LD has Organization/Publisher with logo; no `Person`; author page lacks Person markup. Config already carries the raw material (github_username, linkedin_username, instagram_username — _config.yml:26-29).
Deliverable: extend BlogPosting `author` with a `Person` node carrying `sameAs` array (GitHub, LinkedIn, Instagram profiles).

### P2-4. Make the licence real
Evidence: index.md:34 and author.md:7 claim Creative Commons licensing; repo root has no LICENSE file (nothing to verify against).
Deliverable: commit a `LICENSE` file (CC BY 4.0 plain-text + attribution guidance), link it from the footer trust line instead of just naming it.

### P2-5. Show update timestamps on revised posts
Evidence: layouts render `page.date` only (post.html hero meta). Travel facts rot (permit fees change); freshness signals help both users and crawlers.
Deliverable: optional `last_modified_at` frontmatter field rendered as "Updated <date>" when present, plus `<meta property="article:modified_time">`.

---

## P3 — Polish

### P3-1. Reconcile the launch narrative
Evidence: index.md:19 announces "Launching this Independence Day" (Aug 15, 2026) while four posts are dated Aug 1-4, 2026. Pre-launch posts are normal, but the copy reads as if nothing exists yet.
Fix: reword to "Our daily cadence starts August 15" so archives-before-launch feels deliberate.

### P3-2. Two independent sources for load-bearing facts
Evidence: posts cite official sources well, but rarely a second corroborating source (news coverage, peer-reviewed history, guidebook cross-reference). One authoritative citation per fact is good; two makes claims defensible.
Fix: spot-check the most contestable numbers (elevations, dates, fees) and add a second source where cheap.

### P3-3. Build external reputation (long game)
No amount of on-page work substitutes for third-party mentions. Practical sequence: submit the best 2 posts to regional travel communities (Reddit r/IndiaTravel, IndiaMike), pitch one guest column to a Kerala/Karnataka/Nagaland local outlet, list the site in 2-3 curated indie travel directories. Target: 5+ referring domains from real sites within 90 days.

---

## Suggested order of execution

| Week | Actions |
|---|---|
| 1 | P1-1 privacy page · P1-3 disclosures · P1-4 email upgrade · P2-4 LICENSE file |
| 2 | P1-2 corrections/changelog · P2-1 named editor · P3-1 launch wording |
| 3-4 | P2-2 original photos + first-hand boxes (new posts going forward; retrofit oldest posts later) |
| Ongoing | P2-3 schema, P2-5 timestamps, P3-2 second sources per new post, P3-3 outreach |

---

*Generated by opencode audit · evidence current as of commit `2976cee` plus this session's UI/copy changes.*
