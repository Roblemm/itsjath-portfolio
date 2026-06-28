# itsjath

Personal site for [Jathniel Ahonsi](https://github.com/Roblemm) — built with Astro, TypeScript, and GSAP.

## Stack

- [Astro](https://astro.build) — static site generation with selective hydration
- TypeScript — strict mode
- GSAP — motion and route transitions
- Custom CSS — design tokens, no utility framework

## Requirements

- Node.js 22.12+
- npm

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run preview` | Preview production build |
| `npm run check` | TypeScript + Astro check |
| `npm test`      | Run unit tests           |

## Project structure

```text
src/
├── components/   # UI components by route
├── content/      # Markdown content collections
├── layouts/      # Page layouts
├── pages/        # File-based routes
├── scripts/      # Client-side motion and utilities
├── styles/       # Global CSS and tokens
└── utils/        # Shared constants and helpers
```

## Deployment

Configured for [Vercel](https://vercel.com). Push to `main` to deploy, or run `npm run build` locally and serve `dist/`.

## License

Private — all rights reserved.
