# Keryo

> Input visualization overlay for OBS — gamepad and keyboard input rendered as animated overlays for stream layouts.

![Status](https://img.shields.io/badge/status-wip-yellow)
![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4.2-38bdf8?logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-4.1-6e9f18?logo=vitest)

## What is this?

Keryo generates a **live visual overlay** of your gamepad or keyboard inputs that you can embed in OBS as a Browser Source. Perfect for streams where you want viewers to see your button presses without cluttering the screen.

```
┌─────────────────────────────────────────────┐
│  User Configures in Browser Tab             │
│  ┌─────────────┐    ┌──────────────────┐   │
│  │ 🎮 Xbox     │    │ Live Preview     │   │
│  │ 🖥️ Keyboard │    │ ┌──┐ ┌──┐ ┌──┐  │   │
│  └─────────────┘    │ │A │ │B │ │X │  │   │
│  ┌─────────────┐    │ └──┘ └──┘ └──┘  │   │
│  │ Theme: Void │    └──────────────────┘   │
│  └─────────────┘                            │
│  [ 📋 Copy to OBS ]                        │
└─────────────────────────────────────────────┘
              │
              │ URL params (?device=xbox&skin=void)
              ▼
┌─────────────────────────────────────────────┐
│  OBS Browser Source (Transparent BG)        │
│         ┌──┐ ┌──┐ ┌──┐                      │
│         │A │ │B │ │X │  ← Animated inputs   │
│         └──┘ └──┘ └──┘                      │
└─────────────────────────────────────────────┘
```

## Features

### RF-01 — Landing Page Configuration Panel
- Device selector (gamepad/keyboard)
- Skin/theme visual picker
- Live preview before copying to OBS
- Dynamic URL generation with encoded config

### RF-02 — Input Detection System
- Native Gamepad API polling loop
- Keyboard Event API integration
- Device connection/disconnection detection
- Cross-vendor button normalization
- Custom `useInput` hook

### RF-03 — Overlay Renderer
- Framer Motion animated visualizations
- Transparent background (OBS-ready)
- Real-time reaction to detected inputs
- Multiple skin/theme support

### RF-04 — CI/CD Deployment
- GitHub Actions workflow
- Auto-deploy to GitHub Pages on main branch push

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5.4 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Routing | React Router v7 |
| Testing | Vitest + Testing Library |
| Deployment | GitHub Pages + Actions |

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# CI mode (no watch)
npm run test:ci

# Coverage report
npm run coverage
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks (useInput, etc.)
├── pages/          # Route-level components
├── lib/            # Utilities and helpers
├── App.tsx         # Root component with routing
└── main.tsx        # Entry point

tests/
└── *.test.tsx      # Component and integration tests

vite.config.ts      # Vite + Vitest configuration
vitest.setup.ts     # Test environment setup
```

## Development Notes

- **Transparent overlay**: The overlay renderer uses a transparent background by default — set your OBS Browser Source opacity accordingly
- **Latency target**: Input detection aims for <16ms latency (single frame at 60fps)
- **Gamepad mapping**: Buttons are normalized to a standard mapping regardless of vendor (Xbox/PlayStation/generic)
- **TDD mode**: Tests are enabled by default with `npm run test` running in watch mode during development

## Roadmap

- [ ] RF-01: Landing page with device and skin selectors
- [ ] RF-02: Input detection system (gamepad + keyboard)
- [ ] RF-03: Animated overlay renderer
- [ ] RF-04: CI/CD with GitHub Pages deployment

---

*This README evolves with the project — each feature implementation updates the corresponding section.*