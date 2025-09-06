# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.2 application using TypeScript, React 19, and Tailwind CSS v4. The project was bootstrapped with create-next-app and uses Turbopack for faster builds.

## Commands

### Development
```bash
yarn dev         # Start development server with Turbopack at http://localhost:3000
```

### Build & Production
```bash
yarn build       # Build the application for production with Turbopack
yarn start       # Start the production server
```

### Code Quality
```bash
yarn lint        # Run ESLint for code linting
```

## Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with PostCSS
- **TypeScript**: Strict mode enabled with path aliases (`@/*` maps to `./src/*`)
- **Font**: Uses Geist fonts (Sans and Mono) via next/font
- **Structure**: Standard Next.js App Router structure with root layout at `src/app/layout.tsx`