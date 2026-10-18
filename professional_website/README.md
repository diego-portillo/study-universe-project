# Professional Website

Diego Portillo's personal site: CV, work history, and write-ups of the `ai_hub` and `finance_rag_agent` AI projects, each with a demo video and links to its live deployment and source. A single-page React app, English/Spanish toggle, no backend.

**Live:** [diegoportillo.dev](https://diegoportillo.dev)

## Stack

Vite + React 19 + TypeScript. Static client-only SPA — no API routes, no env vars.

## Structure

- `src/content/{en,es}.ts` — all page copy, keyed by section; `types.ts` defines the shared shape. Edit here, not in components, to change text.
- `src/components/` — one component per section (`Hero`, `About`, `Technologies`, `Projects`, `Contact`, plus card components for work/AI projects).
- `src/context/LanguageContext.tsx` + `src/hooks/useLanguage.ts` — drive the EN/ES toggle.
- `public/images/` — logos and screenshots referenced by content/components.
- `public/Diego_Portillo_CV_EN_ES.pdf` — downloadable CV, edited directly (no generator script in the repo).

## Commands

```
npm run dev       # vite dev server
npm run build      # tsc -b && vite build
npm run lint        # oxlint
npm run preview     # preview the production build locally
```

## Deployment

Deployed standalone on Vercel's free tier at the apex `diegoportillo.dev` domain — independent of `ai_hub` and `finance_rag_agent`, which live on their own subdomains (see root `README.md`).
