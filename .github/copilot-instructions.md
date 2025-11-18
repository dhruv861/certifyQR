# Copilot Instructions for certifyQR

## Project Overview

- This is a Next.js app structured for Firebase Studio, with TypeScript and Tailwind CSS.
- Main app logic is in `src/app/` (pages, layouts, routes).
- UI components are in `src/components/` and `src/components/ui/`.
- Firebase integration is handled in `src/firebase/` (config, providers, error handling, Firestore hooks).
- Utility functions and types are in `src/lib/`.

## Architecture & Data Flow

- Routing follows Next.js App Router conventions (`src/app/[route]/page.tsx`).
- Certificate-related features are in `src/app/certificates/` and `src/app/verify/[id]/`.
- Data is fetched and managed via custom hooks in `src/firebase/firestore/` (e.g., `use-collection.tsx`).
- Global styles: `src/app/globals.css`.

## Developer Workflows

- **Build:** `npm run build` (Next.js build)
- **Dev:** `npm run dev` (local dev server)
- **Lint:** `npm run lint`
- **Format:** `npm run format` (if configured)
- **Tailwind:** Config in `tailwind.config.ts`, postcss in `postcss.config.mjs`
- **TypeScript:** Config in `tsconfig.json`

## Patterns & Conventions

- Use React functional components and hooks throughout.
- UI primitives are imported from `src/components/ui/` (e.g., `<Button />`, `<Dialog />`).
- Firebase is accessed via context providers (`src/firebase/provider.tsx`, `client-provider.tsx`).
- Error handling is centralized (`src/firebase/errors.ts`, `FirebaseErrorListener.tsx`).
- Prefer custom hooks for data access and state (`src/hooks/`, `src/firebase/firestore/`).
- Images and placeholders: `src/lib/placeholder-images.json` and `placeholder-images.ts`.

## Integration Points

- Firebase config: `src/firebase/config.ts`
- Firestore rules: `/firestore.rules`
- App hosting: `/apphosting.yaml`
- Component registry: `/components.json`

## Examples

- To add a new page: create a folder in `src/app/` and add `page.tsx`.
- To add a new UI element: add to `src/components/ui/` and import as needed.
- To fetch Firestore data: use hooks from `src/firebase/firestore/`.

## External Dependencies

- Next.js, React, Firebase, Tailwind CSS
- See `package.json` for all dependencies

---

For questions about unclear patterns or missing documentation, ask the user for clarification or examples from their workflow.
