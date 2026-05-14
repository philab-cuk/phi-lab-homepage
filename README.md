<p align="center">
  <img src="public/logo.jpg" alt="PHI Lab — Precision & Provenance Health Informatics Lab, Catholic University of Korea" width="240" />
</p>

# PHI Lab Homepage

**Precision & Provenance Health Informatics Lab (PHI Lab, φ)**
The Catholic University of Korea — Department of Biomedical Software Engineering
PI: Prof. Hyo Jung Kim · hyojung.kim@catholic.ac.kr

React-based rebuild of the lab homepage (currently at <https://philabcuk.org>), replacing the legacy WordPress site with a modern, JSON-driven, bilingual (KO/EN) static site.

## Quick start

```bash
corepack enable          # one-time, activates pnpm via packageManager field
pnpm install
pnpm dev                 # http://localhost:5173
pnpm build
pnpm preview
```

## Stack

- React 19 + Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite`)
- `react-router-dom` v7 (`createBrowserRouter`)
- `lucide-react` icons
- Custom React Context for i18n (`src/i18n/`)
- Content as JSON (`src/data/`) — students can submit content updates via PR

## Project layout

```
src/
  components/Layout.jsx     # Header (nav + KO/EN toggle) + Footer
  pages/                    # Home, About, Members, Research,
                            # Publications, News, Lectures, NotFound
  data/                     # members / publications / research / news / lectures (JSON)
  i18n/                     # LanguageContext + strings table
docs/
  PLANNING.md               # rebuild plan
  prototype-design-criteria.md
  phi-lab-content/          # source-of-truth content scraped from philabcuk.org
prototypes/                 # round-01..03 standalone HTML design explorations
public/
  logo.jpg                  # brand logo (Catholic Univ. of Korea PHI Lab)
  favicon.svg
```

See `docs/PLANNING.md` for the full rebuild rationale and roadmap.
