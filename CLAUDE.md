# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

This project uses **Bun** as the package manager (specified in `packageManager: "bun@1"` in package.json). Use `bun` commands instead of npm/yarn.

## Development Commands

- **Start development server**: `bun run dev` (uses Next.js with Turbopack)
- **Build for production**: `bun run build` (uses Next.js with Turbopack)  
- **Start production server**: `bun run start`
- **Code linting**: `bun run lint` (uses Biome)
- **Code formatting**: `bun run format` (uses Biome with auto-fix)

## Database Commands

This project uses Drizzle ORM with PostgreSQL:

- **Generate migrations**: `bun run db:generate`
- **Run migrations**: `bun run db:migrate`
- **Database schema**: Located in `src/lib/db/schema.ts`
- **Database configuration**: `drizzle.config.ts` (requires `DATABASE_URL` environment variable)

## Architecture Overview

This is a **Next.js 15** application with the following stack:

### Core Technologies
- **Next.js 15** with App Router (`src/app/` directory structure)
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Drizzle ORM** with PostgreSQL database
- **Neon Database** serverless PostgreSQL

### Code Organization
- `src/app/` - Next.js App Router pages and layouts
- `src/lib/` - Shared utilities and database configuration
- `src/lib/db/schema.ts` - Complete database schema with authentication tables
- `src/lib/utils.ts` - Utility functions (currently contains `cn` for class merging)

### Database Schema
The application includes a complete authentication system with these tables:
- **Users** - Core user information with admin/user roles
- **OAuth** - OAuth provider accounts (Google, etc.)
- **Sessions** - User session management  
- **Authenticators** - WebAuthn/passkey credentials
- **VerificationTokens** - Email verification and password reset tokens

### Development Tools
- **Biome** for linting and formatting (configured in `biome.json`)
  - Uses 2-space indentation
  - Includes Next.js and React recommended rules
  - Auto-organizes imports
- **TypeScript** with strict configuration
- **Tailwind CSS** with utility classes
- **Class Variance Authority** and **clsx/tailwind-merge** for conditional styling

## Environment Setup

Ensure you have a `DATABASE_URL` environment variable configured for the PostgreSQL database connection.
- prefer server actions over restapi for crud