---
name: mindmap
description: Create interactive, visual mind maps as standalone HTML files. Use this skill whenever the user asks for a mind map, site map, topic map, content hierarchy, knowledge map, org chart, sitemap visualization, content cluster diagram, SEO architecture map, brainstorming map, or any request to visualize relationships between topics/pages/ideas as a spatial branching diagram. Also trigger when the user asks to "map out", "visualize the structure of", "show connections between", or wants to understand how pages/topics/ideas relate to each other. Works with sitemaps, URLs, uploaded data, or freeform topics. Always produces a single .html file with pan, zoom, drag-to-rearrange, and clickable nodes.
---

# Mind Map Skill

Create beautiful, interactive mind maps rendered as standalone `.html` files. The maps look and feel like Miro/FigJam — white canvas, dot grid, colored curved rope connections, draggable nodes, tap-to-expand branches, and clickable leaf nodes.

## When to Use

- User asks for a **mind map**, **site map visualization**, **topic map**, or **content hierarchy**
- User wants to **visualize a sitemap** (XML, URL list, or website structure)
- User wants to see **how pages/topics connect** to each other
- User asks for an **SEO content architecture** or **content cluster map**
- User asks to **map out** ideas, **brainstorm visually**, or show **org structure**
- User provides a list of topics/pages and wants them **organized spatially**

## Output

Always a single `.html` file saved to `/mnt/user-data/outputs/`. Never JSX or React — pure HTML + inline CSS + inline JS. No external dependencies.

## Step-by-Step Process

### Step 1: Gather Data

Determine the data source:

- **Sitemap URL**: Fetch the sitemap XML → extract all URLs → categorize into clusters
- **Uploaded file**: Read the file → extract topics/pages/hierarchy
- **Freeform request**: Ask clarifying questions if the structure is ambiguous, otherwise infer a logical hierarchy
- **URL list**: Group URLs by path segments into parent/child relationships

### Step 2: Organize into a Hierarchy

Structure the data into this mental model:

```
Root (center node)
├── Silo 1 (colored pill node)
│   ├── Pillar/Hub (border card node)
│   ├── Sub-topic A (card node)
│   │   ├── Leaf 1 (small card, clickable)
│   │   ├── Leaf 2
│   │   └── Leaf 3
│   └── Sub-topic B
│       ├── Leaf 4
│       └── Leaf 5
├── Silo 2
│   └── ...
└── Silo N
```

**Hierarchy rules:**
- **Max 4 levels deep**: Root → Silo → Hub → Leaf
- **Group by topic similarity**, not just URL path
- **7–15 silos** is the sweet spot for the top ring
- **3–8 hubs per silo** to avoid visual overcrowding
- **Up to ~15 leaves per hub** (they fan out radially)

### Step 3: Build the HTML

Read the template at `templates/mindmap-template.html` in this skill's directory. This is your **base template** — use it as the foundation and customize:

1. **Copy the template** to your working directory
2. **Replace the `SILOS` data array** with the actual organized data
3. **Adjust colors** — assign each silo a distinct color from the palette
4. **Adjust radii** if needed (R1/R2/R3 for the three rings)
5. **Set the initial expanded state** — expand 1–2 silos so the user sees ropes immediately
6. **Update the title and header** to match the user's domain/topic
7. Save to `/mnt/user-data/outputs/<name>-mindmap.html`

### Step 4: Present the File

Call `present_files` with the output HTML path.

### Step 2.5: Content Gap Analysis

For every hub/branch, analyze what's missing and suggest new topics. This is the key value-add that makes the mind map an SEO strategy tool.

**How to find gaps — check each cluster for these content archetypes:**

1. **Pillar / Definition post** — "What Is [Topic]?" (every silo MUST have one)
2. **Beginner guide** — "[Topic] for Beginners / First-Timers"
3. **Dosage / How-to guide** — "[Topic] Dosage Chart" or "How to Use [Topic]"
4. **Comparison posts** — "[Topic A] vs [Topic B]" for each pair of related products/topics
5. **Legal guide** — "Is [Topic] Legal?" with state-by-state info
6. **Safety / Side effects** — "[Topic] Side Effects" or "Is [Topic] Safe?"
7. **Duration / Detection** — "How Long Does [Topic] Last / Stay in System"
8. **Best-of listicle** — "Best [Topic Products] [Year]"
9. **Near-me / Commercial** — "[Topic] Near Me" or "Buy [Topic] Online"
10. **Use-case posts** — "[Topic] for Sleep / Pain / Anxiety / Focus"

For each missing archetype, create a gap entry with target keyword and priority:
- **High priority**: Missing pillar page, missing comparison vs a direct competitor topic, high-volume "best of" listicle, or a gap that blocks internal linking
- **Medium priority**: Missing use-case post, missing how-to, or supplementary comparison
- **Low priority**: Nice-to-have niche content, long-tail variations

### Step 2.6: Internal Linking Map

For every existing post, determine which other pages it should link to. Follow these rules:

1. **Every post links UP to its pillar** — always
2. **Every post links ACROSS to relevant product pages** — especially buying guides and comparisons
3. **Comparison posts link SIDEWAYS** — to the other topic's pillar page (e.g., "THCA vs Delta 9" links to both the THCA pillar and the Delta 9 pillar)
4. **"Near me" and commercial posts link to the shop page**
5. **How-to posts link to the products** they reference
6. **Related posts within the same hub should cross-link** (e.g., "Drug Test" post ↔ "How Long in System" post)
7. **Product pages link DOWN to their best blog content** (reverse direction)

Represent links as an array of target labels: `ln: ["Pillar", "Flower Products", "D9 Silo"]`

## Data Format

The `SILOS` array in the template follows this enhanced structure:

```javascript
const SILOS = [
  {
    id: "unique-id",
    n: "Display Name",
    c: "#16a34a",
    p: {
      t: "Pillar Page Title",
      u: "/url-path/"
    },
    b: [
      {
        h: "Hub Name",
        lk: "→ Links to X",
        ps: [
          {
            t: "Leaf Title",
            u: "/url-path/",
            ln: ["Pillar", "Product Page", "Related Silo"],  // internal link targets
            w: "Warning text"   // optional
          }
        ],
        gaps: [  // suggested new content
          {
            t: "Suggested Article Title",
            kw: "target seo keyword",     // shown on the node
            pri: "high"                   // "high", "med", or "low"
          }
        ]
      }
    ]
  }
];
```

## Color Palette

Assign each silo a distinct color. Recommended palette (12 colors):

```
#16a34a  green      #7c3aed  purple     #dc2626  red
#ea580c  orange     #0284c7  blue       #db2777  pink
#ca8a04  amber      #0d9488  teal       #6366f1  indigo
#b45309  brown      #9333ea  violet     #475569  slate
```

## Visual Design Rules

These rules ensure every mind map looks professional and human-crafted:

### Canvas
- **White background** (#fff) with a **dot grid** (radial-gradient dots, 28px spacing, subtle gray)
- Full viewport, no scrollbars — pan and zoom only

### Ropes (Connection Lines)
- **SVG bezier curves** using cubic bezier (S-curve shape)
- The SVG element MUST be positioned at `left:0; top:0; width:1px; height:1px; overflow:visible` — this ensures coordinates match node positions exactly. **Never offset the SVG** with large negative positions.
- Each rope has **two layers**: a thick transparent glow layer + the main colored line
- **Endpoint dots** (small circles) at both ends of each rope
- Width hierarchy: Root→Silo: 5px, Silo→Hub: 3.5px, Hub→Leaf: 2px
- Opacity: 0.55 for main rope, 0.08 for glow
- `stroke-linecap: round` always

### Bezier curve formula
```javascript
function bezier(x1, y1, x2, y2) {
  const dx = x2 - x1;
  return `M${x1} ${y1}C${x1+dx*.45} ${y1} ${x2-dx*.45} ${y2} ${x2} ${y2}`;
}
```

### Nodes
- **Root**: Dark rounded rect (140×70px), centered, bold white text, border glow
- **Silo**: Colored pill (border-radius: 25px), white bold text, drop shadow matching silo color. Shows post count + gap count when gaps are ON.
- **Pillar**: White card with thick colored border, "★ PILLAR" or "⚠ MISSING" tag
- **Hub**: White card with 5px colored left border, shows "→ links to" tag + green "+N gaps" badge when gaps are ON
- **Post/Leaf**: Small white card with colored dot, "↗ Open" link text, optional ⚠ warning. **Now includes blue "→Target" link pills** showing where the page should link to.
- **Gap (NEW)**: Green dashed-border card with "+" circle icon. Shows suggested title, target keyword (monospace with 🎯), and priority badge (red=high, amber=medium, green=low). Connected to parent hub with dashed green rope.

### Link Pills on Posts
Every post node displays its `ln` array as small blue pills: `→Pillar`, `→Flower Products`, etc. These show at a glance which pages each post should link to. This is the internal linking map made visual.

### Gap Toggle
Include a toggle button (fixed, bottom-right above zoom controls) that switches gap nodes ON/OFF. When OFF, only existing content shows. When ON, suggested gaps appear with dashed green connections. The button text toggles between "✦ Gaps ON" and "✦ Gaps OFF".

### Layout Algorithm
- Radial layout: silos evenly spaced in a circle around center
- R1 = 340–360px (center to silos)
- R2 = 260–270px (silo to hubs) — hubs fan within the silo's angular allocation
- R3 = 175–185px (hub to leaves) — leaves fan within the hub's angular allocation
- Fan angle per silo = `2π / siloCount`
- Hub spread = 80% of silo's angle allocation
- Leaf spread = proportional to hub's angle allocation

### Interactions
- **Tap silo** → expand/collapse its branches (hubs + pillar)
- **Tap hub** → expand/collapse its leaves
- **Tap leaf** → open URL in new tab (`window.open(url, '_blank')`)
- **Drag node** → move it + all descendants, ropes redraw in real-time
- **Drag background** → pan the viewport
- **Pinch** → zoom (touch devices)
- **+/− buttons** → zoom (all devices)
- **↺ button** → reset view

### Click vs Drag Detection
This is CRITICAL — the #1 bug in mind map implementations:
```javascript
let totalMoved = 0;
// On pointer move: totalMoved += Math.abs(delta)
// On pointer up: if (totalMoved < 10) → treat as click; else → was a drag
```
Use `pointerdown/pointermove/pointerup` events. Track `totalMoved` as cumulative pixel distance. Threshold of **10px** separates click from drag.

### Descendant Dragging
When a node is dragged, ALL its descendants must move with it:
```javascript
function getDescendants(id, childMap) {
  const result = [];
  (childMap[id] || []).forEach(kid => {
    result.push(kid);
    result.push(...getDescendants(kid, childMap));
  });
  return result;
}
```
On drag start, snapshot all positions. On move, apply delta to the dragged node + all descendants.

### Top Bar
- Fixed position, white with backdrop blur, bottom border
- Title (domain or topic name), one-line instruction text
- z-index above everything

### Controls
- Fixed bottom-right: +, −, ↺ buttons (44×44px, rounded, white, shadow)
- Fixed bottom-left: zoom percentage label

## Common Customizations

### For SEO / Sitemap Maps
- Add warning badges (`w` field) for URL issues (orphans, duplicates, wrong silo)
- Show "→ links to" tags on hubs indicating internal linking strategy
- Pillar pages get the special "★ PILLAR PAGE" tag
- Missing pillars get "⚠ MISSING PILLAR" in orange

### For Brainstorming / Topic Maps
- Remove URL fields and "↗ Open page" text
- Replace with descriptive subtitles or notes
- Use the `lk` field for relationship descriptions ("relates to", "depends on")

### For Org Charts / Hierarchies
- Root = Company/Department
- Silos = Teams/Divisions
- Hubs = Roles/Projects
- Leaves = People/Tasks

## Troubleshooting

### Ropes not visible
The SVG MUST be: `position:absolute; left:0; top:0; width:1px; height:1px; overflow:visible;`
**Never** use large dimensions or negative offsets. The bezier coordinates must be in the same coordinate space as the node positions.

### Clicks not working
Must track `totalMoved` and only fire click actions when `totalMoved < 10`. Use `pointerdown`/`pointermove`/`pointerup` — not `click` events (which conflict with drag).

### Nodes overlapping
Increase R1/R2/R3 values, or reduce the number of silos. For 15+ silos, set R1 to 450+.

### Mobile touch issues
Include `touch-action: none` on the body and viewport. Use passive:false on touchstart/touchmove for pinch zoom.
