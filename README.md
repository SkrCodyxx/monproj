# Dounie Cuisine Pro

Dounie Cuisine Pro est une application web complète destinée à un service traiteur haïtien premium basé à Montréal. L'application permet la gestion des commandes, réservations, menu, clients et l'administration complète de l'entreprise.

This project was developed with the assistance of an AI coding agent.

## Table of Contents

-   [Project Overview](#project-overview)
-   [Tech Stack](#tech-stack)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
    -   [Database Setup](#database-setup)
    -   [Running the Application](#running-the-application)
-   [Project Structure](#project-structure)
-   [API Reference](#api-reference)
-   [Contributing (Placeholder)](#contributing-placeholder)
-   [License (Placeholder)](#license-placeholder)

## Project Overview

This application serves as a professional online presence for a Haitian catering service, allowing customers to browse menus, make reservations, and manage their accounts. It also provides a comprehensive admin panel for business operations management.

Key features include:
*   Public-facing website (Home, Menu, Services, Gallery, Contact, Booking)
*   Client authentication and dashboard (Profile, Orders, Reservations)
*   Admin panel (Dashboard, User Management, Menu Management, Order Management, Reservation Management, Gallery Management, Site Settings)

## Tech Stack

*   **Frontend:** React 18 with TypeScript, Vite, Tailwind CSS
    *   Routing: React Router DOM
    *   Forms: React Hook Form + Zod
    *   Notifications: React Hot Toast
    *   Icons: Lucide React
    *   State Management: React Context API (for Auth)
    *   Testing: Vitest, React Testing Library
*   **Backend:** Node.js with Express, TypeScript
    *   Database: SQLite (for local development, using Knex.js)
    *   Authentication: JWT with bcryptjs
    *   Validation: Zod
*   **Build Tool:** Vite (Frontend), TypeScript Compiler (tsc) for backend (conceptual)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (v8.x or later recommended, usually comes with Node.js)
*   SQLite3 Command Line Tool (for manual database setup if not using Knex migrations directly) - Download from [sqlite.org](https://www.sqlite.org/download.html)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd dounie-cuisine-pro
    ```
    (Replace `<repository-url>` with the actual URL of your Git repository)

2.  **Install dependencies:**
    This will install both frontend and backend dependencies listed in `package.json`.
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the project root by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and customize the variables as needed. At a minimum, you should set a strong `JWT_SECRET`.
    ```dotenv
    PORT=5001 # Backend server port
    JWT_SECRET=your_very_strong_and_secret_jwt_key_here_please_change_me
    JWT_EXPIRES_IN=1d
    # DB_SCHEMA=main # Only if you use a specific schema prefix, usually not needed for SQLite
    ```

### Database Setup

The application uses SQLite for local development. The database schema needs to be initialized.

**Please refer to the detailed instructions in [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) for manually creating the database tables using SQL commands.**

This manual setup is provided as a fallback. In a typical local development environment where Knex CLI and TypeScript execution (e.g., via `ts-node`) are correctly configured, you would use Knex migrations:
1.  Ensure `knexfile.ts` is correctly configured (it is by default for SQLite).
2.  Ensure all migration files in `server/db/migrations/` are complete and correct.
3.  Run: `npx knex migrate:latest --knexfile knexfile.ts`

### Running the Application

Once dependencies are installed and the database is set up:

1.  **Start the development servers (frontend and backend concurrently):**
    ```bash
    npm run dev
    ```
    This command (defined in `package.json`) typically starts:
    *   The frontend Vite dev server (usually on `http://localhost:3000`).
    *   The backend Express server (usually on `http://localhost:5001`).

    The Vite dev server is configured to proxy API requests from `/api` to the backend server.

2.  Open your browser and navigate to `http://localhost:3000` (or the port shown by Vite).

## Project Structure

A brief overview of the main directories:

```
dounie-cuisine-pro/
├── public/               # Static assets (e.g., favicon, placeholder images)
├── server/               # Backend (Express.js) application
│   ├── controllers/      # Request handlers
│   ├── db/               # Database setup (Knex config, migrations, seeds)
│   ├── middleware/       # Express middleware (auth, error handling, uploads)
│   ├── routes/           # API route definitions
│   └── index.ts          # Backend server entry point
├── src/                  # Frontend (React) application
│   ├── __tests__/        # Frontend unit and component tests
│   ├── components/       # Reusable React components (UI elements, layout parts)
│   ├── contexts/         # React Context API providers (e.g., AuthContext)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Client-side libraries, API client helper
│   ├── pages/            # Top-level page components for routes
│   ├── types/            # Shared TypeScript type definitions
│   ├── utils/            # Utility functions for frontend
│   ├── App.tsx           # Main React application component with routing
│   ├── index.tsx         # Frontend entry point (renders App)
│   └── setupTests.ts     # Vitest setup file
├── .env.example          # Example environment variables
├── .gitignore            # Files and directories to ignore in Git
├── AGENTS.md             # Instructions for AI coding agents
├── API_REFERENCE.md      # Overview of backend API endpoints
├── DATABASE_SETUP.md     # Manual SQL schema setup guide
├── knexfile.ts           # Knex.js configuration
├── package.json          # Project dependencies and scripts
├── README.md             # This file
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration for frontend
├── tsconfig.node.json    # TypeScript configuration for backend/Node.js parts
└── vite.config.ts        # Vite configuration (build tool, dev server)
```

## API Reference

For details on the available backend API endpoints, please refer to [`API_REFERENCE.md`](./API_REFERENCE.md).

## Contributing (Placeholder)

Details on how to contribute to the project will be added here. (e.g., coding standards, pull request process).

## License (Placeholder)

This project is licensed under the [MIT License](LICENSE.md) (You would need to add a LICENSE.md file).
