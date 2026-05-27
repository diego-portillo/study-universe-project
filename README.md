# study-universe-project

This project was made to apply all my software studies in a mock start-up

Technologies

- Python
- Docker
- Javascript
- HTML

Topics:

- Graphs and Trees algorithms: DFS, BFS, Backtracking
- Fullstack App
- Containers

## Deployment

Production target: `www.diegoportillo.dev`, hosted on **AWS** (not Vercel). Each subproject is served at its own subpath so the whole portfolio lives under one domain:

- `www.diegoportillo.dev/ai_hub` — AI SDK chat / image / audio playground
- `www.diegoportillo.dev/<other>` — future subprojects (Algorithm Tutor RAG, etc.)

Each subproject ships its own Docker image; a reverse proxy (nginx / ALB / CloudFront) routes the subpaths to the right container. Subprojects are independently deployable — see `CLAUDE.md` for the dependency and deployment conventions.