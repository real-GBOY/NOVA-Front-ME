# Nova ERP — Frontend 🖥️

A React + TypeScript single-page application for the Nova HR Management System — covering employee records, attendance, payroll, invoicing, legal cases, internal chat, and more. Built with Vite, Tailwind CSS v4, and TanStack Query.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Internationalization](#-internationalization)
- [Theming](#-theming)
- [License](#-license)

## 🛠 Tech Stack

- **Build tool**: Vite 7
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 (CSS custom properties for theming, light/dark mode)
- **Data fetching**: TanStack Query (`@tanstack/react-query`)
- **Tables**: TanStack Table (`@tanstack/react-table`)
- **Routing**: React Router v7
- **Forms & validation**: React Hook Form + Yup
- **i18n**: i18next / react-i18next (English & Arabic, with RTL support)
- **Real-time**: Socket.io client (chat, notifications)
- **Push notifications**: Firebase Cloud Messaging (service worker at `src/firebase-messaging-sw.js`)
- **Other**: Axios, Framer Motion, Recharts, Leaflet (maps), jsPDF / react-pdf (documents), ExcelJS / xlsx / PapaParse (exports/imports)

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- pnpm (repo is set up for `pnpm@10.23.0`)

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env   # then fill in VITE_API_BASE_URL (see below)

# Start the dev server
pnpm dev
```

The app runs on Vite's default dev server port and expects a running instance of the [backend API](../amer_back) to talk to.

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint over the project |
| `pnpm typecheck` | Run `tsc --noEmit` against `tsconfig.app.json` |

## 🔑 Environment Variables

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1   # Base URL of the backend API
```

## 📂 Project Structure

```
src/
├── components/       # Feature components (members, invoices, payrolls, legalCases, communication, ...)
├── pages/            # Route-level pages (auth, dashboard, settings, ...)
├── designSystem/     # Shared UI primitives (Sidebar, Modal, PageHeader, ui/* form controls, ...)
├── layouts/          # App shells (DashboardLayout, AuthLayout)
├── routes/           # React Router route definitions
├── services/         # API clients, contexts (Theme, Colors), constants
├── hooks/            # Reusable React hooks (queries, auth, chat, break timer, ...)
├── locales/          # i18next translation files (en/ar)
├── utilities/ utils/  # Formatting, exports, uploads, date/timezone helpers
├── Icons/            # Custom SVG icon components
├── config/           # Axios instance, JWT handling
└── types/            # Shared TypeScript types
```

## ✨ Features

- **Members**: employee directory, profiles, contracts, documents, assets, shifts, time management
- **Requests**: attendance, overtime, and time-off request workflows
- **Payrolls & Vouchers**: payment/receipt vouchers, payroll items and details
- **Invoices**: invoice creation, payment recording, PDF export
- **Legal Cases**: case tracking with documents and event timelines
- **Communication**: real-time direct/group chat with unread badges, powered by Socket.io
- **Notifications**: in-app notification center + push notifications via Firebase
- **Settings**: company settings, roles & permissions, service catalog, financial settings, notification preferences
- **Dashboard**: charts and summaries for attendance, requests, invoices, members, vouchers
- **Command palette**: quick navigation/search (`src/components/commandPalette`)

## 🌐 Internationalization

- Languages: English (`en`) and Arabic (`ar`), namespaced under `src/locales/<lang>/*.json`
- RTL is applied automatically for Arabic (`html[dir="rtl"]`); a Tajawal font is loaded for Arabic text while SF Pro Rounded is used for English

## 🎨 Theming

- Brand colors are defined once in `src/services/constants/COLORS.ts` (light & dark palettes) and pushed to CSS custom properties (`--c-*`) at runtime by `ColorsProvider`
- Tailwind consumes those variables via `@theme inline` in `src/index.css`, so `bg-primary`, `text-primary`, etc. stay in sync across the whole app automatically

## 📄 License

Internal project — all rights reserved.
