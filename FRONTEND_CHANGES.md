# Frontend Architecture and Major Changes

This document outlines the entire lifecycle of major changes, design decisions, and architectural shifts made to the frontend of the Autonomous Multi-Agent Financial Advisor System.

## 1. Migration from React SPA to Next.js (App Router)
- **Previous State**: The initial iterations of the frontend were built using a traditional React Single Page Application (Create React App/Vite), with components like `ExecutionPanel`, `SentimentPanel`, and standard `.css` files.
- **Major Change**: The entire frontend codebase was scrapped and rebuilt from the ground up using **Next.js 14+** utilizing the modern **App Router** (`src/app`).
- **Benefits**: Improved routing system, easier future integration path for server-side rendering, and a significantly cleaner component tree.

## 2. Design System and Premium Aesthetics
- **Tailwind CSS Integration**: Replaced raw CSS configurations with Tailwind CSS to manage utility classes effectively, enabling rapid iteration and predictable styling.
- **Custom Color Palette**: Defined a rich, financial-themed color palette in `tailwind.config.ts` capturing a premium look:
  - Dark mode foundations: `ink` (#020617) and `prussian` (#0F172A).
  - Accents: `deep` (#082F49), `frozen` (#7DD3FC), and `alice` (#E0F2FE).
  - Contextual Colors: `buy` (green), `sell` (red), `hold` (yellow), and `blocked` (gray).
- **Typography Restructure**: Adopted three core distinct fonts via Google Fonts:
  - **Playfair Display**: Used for large numbers, display headings, and premium accents.
  - **DM Mono**: Used extensively for tickers, data outputs, metrics, and small uppercase labels to mimic terminal/quant software.
  - **DM Sans**: Used for readable general user interface instructions.
- **Micro-Animations and Polish**: Implemented fade-up entrance animations, pulse visualizers during loading states, grain textures for depth, and glassmorphism styling (`backdrop-filter: blur`) for premium card aesthetics.

## 3. Directory and Component Modularization
The new frontend source (`src/`) was meticulously broken down into domain-driven subdirectories:
- **`app/`**: Contains standard Next.js routing definitions (`page.tsx`, `layout.tsx`, and `globals.css`).
- **`components/landing/`**: Focuses strictly on initial user acquisition and data-entry (e.g., `HeroSection.tsx`, `TickerInput.tsx`, `FeaturesSection.tsx`).
- **`components/dashboard/`**: Segregated view components reflecting the backend multi-agent pipeline:
  - `AgentCards.tsx`: Reports from Sentiment, Technical, and Fundamental agents.
  - `DecisionCard.tsx` & `DecisionBreakdown.tsx`: Highlights the Portfolio manager's weighting rules.
  - `RiskCard.tsx`: Highlights pass/block workflows from the Risk Manager agent.
  - `PipelineStatus.tsx`: Shows real-time micro-agent health.
- **`components/layout/`**: Global elements (`Navbar.tsx`, `LoadingState.tsx`, `ProfilePanel.tsx`).
- **`types/`**: Comprehensive TypeScript interfaces corresponding precisely to backend JSON models (`AnalysisResponse`, `PortfolioReport`, `RiskReport`, etc.).

## 4. Key Interactive Features Introduced
- **Dynamic Ticker Input**: Instead of a heavy component library, built a custom `TickerInput.tsx` featuring localized filtering (for supported NSE tickers like `INFY.NS`, `TCS.NS`), keyboard navigation, and custom focus states.
- **Simulated Pipeline Loading State**: To manage user expectations while the 6 agents perform heavy compute, the `LoadingState.tsx` visually cycles through the internal pipeline steps ("Fetching live news...", "Computing technical signals...", etc.).
- **User Risk Profile Management**: Developed a slide-out `ProfilePanel.tsx` that leverages React state to update the user's budget and risk constraints on-the-fly, persisting to `localStorage` via a robust custom `useProfile` hook.
- **Backend API Rewriting**: Updated `next.config.ts` to seamlessly proxy requests pointing to `/api/backend/*` directly towards the Spring Boot API running on `localhost:8080`, bypassing tedious local CORS configurations. 

## Summary
The frontend has evolved from a simple proof-of-concept into a **production-ready, strongly-typed Next.js application** that not only visualizes complex multi-agent reasoning clearly but does so with a highly polished, proprietary user interface. 
