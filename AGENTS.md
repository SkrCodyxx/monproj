# AGENTS.md - Dounie Cuisine Pro

This file provides instructions and guidelines for AI agents working on the Dounie Cuisine Pro project.

## Project Overview

Dounie Cuisine Pro is a web application for a Haitian traiteur (caterer) service. It includes a public-facing website, a client portal, and an admin dashboard.

**Tech Stack:**
- Frontend: React 18 (TypeScript), Vite, Tailwind CSS
- Backend: Express (TypeScript), Node.js
- Database: SQLite (local development)
- Authentication: JWT, bcryptjs
- Forms: React Hook Form + Zod
- Styling: Tailwind CSS
- Icons: Lucide React
- Animations: Framer Motion

## Key Instructions & Conventions

1.  **Follow the "Cahier des Charges":** The primary source of truth for features and requirements is the `Cahier des Charges - Dounie Cuisine Pro.md` document.
2.  **Directory Structure:** Maintain the established directory structure (see section 2.2 of Cahier des Charges).
3.  **TypeScript Everywhere:** Both frontend and backend code should be written in TypeScript. Use strict mode and aim for strong typing.
4.  **Styling:** Utilize Tailwind CSS for styling. Create reusable components and utility classes where appropriate. Refer to `tailwind.config.js` for brand colors and fonts.
5.  **Commits:**
    *   Make small, atomic commits.
    *   Write clear and concise commit messages following conventional commit guidelines (e.g., `feat: add user login page`, `fix: resolve issue with menu display`).
6.  **Error Handling:** Implement robust error handling on both client and server. Use the provided `errorHandler.ts` middleware on the backend. For the frontend, provide user-friendly error messages.
7.  **API Design:**
    *   Strive for RESTful API design.
    *   All API routes should be prefixed with `/api`.
    *   Use appropriate HTTP status codes.
8.  **Security:**
    *   Sanitize inputs and escape outputs to prevent XSS.
    *   Protect against SQL injection (though less of a direct concern with an ORM like Knex if used correctly, still be mindful).
    *   Implement authorization properly using roles (client, admin).
9.  **Code Comments:** Write comments for complex logic, non-obvious code, and API contracts (e.g., JSDoc for functions).
10. **Dependencies:**
    *   Before adding new dependencies, discuss if they are necessary.
    *   Keep dependencies up-to-date where feasible, but prioritize stability.
11. **Testing (Future Phase):** While not in the initial setup, keep testability in mind. Unit tests (Vitest) and potentially integration/e2e tests will be added.
12. **Environment Variables:** Use `.env` files for environment-specific configuration. A `.env.example` should be maintained. **Never commit actual `.env` files with secrets.**
13. **Frontend Routing:** React Router DOM will be used for frontend navigation.
14. **State Management (Frontend):** Start with React Context API for global state (like auth). For more complex local/component state, use standard React state or custom hooks. Recoil/Zustand/Redux Toolkit can be considered if context becomes unwieldy.
15. **Backend Database Interaction:** Knex.js is included for database queries with SQLite. Ensure migrations and seeds are used for schema management once we start DB development.

## Initial Setup Checks (Agent should verify these after Phase 1)

- [ ] Project directory structure matches section 2.2.
- [ ] `package.json` exists and includes core dependencies (React, Vite, Express, Tailwind, TypeScript, etc.).
- [ ] `vite.config.ts` is configured (proxy to backend, aliases).
- [ ] `tailwind.config.js` includes custom Haitian color palette and fonts (Inter, Playfair Display).
- [ ] `tsconfig.json` and `tsconfig.node.json` are present and correctly configured.
- [ ] Basic `src/` and `server/` placeholder files are created.
- [ ] `.gitignore` is present and includes `node_modules/`, `dist/`, `.env`, `database.sqlite`.
- [ ] `npm install` runs without critical errors (warnings are okay for now).
- [ ] An empty `database.sqlite` file is present in the root.
- [ ] (Optional but good) `npm run dev` can start both frontend and backend dev servers (even if they just show basic pages).

This document will be updated as the project progresses.
