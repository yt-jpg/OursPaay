# OursPay - Modern Billing Platform

## Overview

OursPay is a modern, secure billing platform designed to facilitate debt collection and payment management between creditors and debtors (both individuals and businesses). The platform provides a comprehensive solution with public-facing pages, user dashboards, and administrative controls, all built with a focus on accessibility, security, and legal compliance.

The application is built as a full-stack TypeScript application using React for the frontend, Express.js for the backend, and PostgreSQL (via Neon) for data persistence. It leverages Replit's authentication system for user management and implements real-time features through WebSocket connections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme system supporting light, dark, and high-contrast modes
- **Build Tool**: Vite with custom plugins for Replit integration

**Component Structure:**
- Modular component architecture with reusable UI components in `/client/src/components/ui/`
- Feature-specific components like Chat and Sidebar for core functionality
- Page-based routing with distinct views for landing, dashboard, admin, and terms acceptance

**Accessibility Features:**
- Multiple theme modes (light, dark, high-contrast) managed through ThemeProvider context
- Responsive design supporting desktop, tablet, and mobile viewports
- Mobile-first approach with dedicated mobile sidebar handling

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js for HTTP server
- **ORM**: Drizzle ORM with Neon PostgreSQL serverless adapter
- **WebSocket**: ws library for real-time communication
- **Authentication**: Replit Auth with OpenID Connect (OIDC)
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)

**API Design:**
- RESTful API architecture with `/api` prefix for all endpoints
- Real-time WebSocket endpoint at `/ws` for chat and notifications
- Request/response logging middleware for debugging
- JSON body parsing with raw body preservation for webhooks

**Authentication Flow:**
- OpenID Connect integration with Replit as identity provider
- Session-based authentication with PostgreSQL session storage
- Passport.js strategy for OIDC authentication
- Protected routes using `isAuthenticated` middleware
- Terms acceptance enforcement at application level

### Data Storage

**Database Schema (PostgreSQL via Drizzle ORM):**

**Core Tables:**
- `users`: User profiles with support for both individuals (CPF) and businesses (CNPJ), including role-based access control (user/admin/moderator), 2FA settings, and terms acceptance tracking
- `sessions`: Session storage table (mandatory for Replit Auth integration)
- `billings`: Billing records linking creditors to debtors with status tracking, amounts, due dates, and payment terms
- `transactions`: Payment transaction history linked to billing records
- `messages`: Real-time chat messages between users for specific billing discussions
- `notifications`: User notification system for billing updates and system alerts
- `wallets`: User wallet/balance management for platform transactions
- `auditLogs`: Comprehensive audit trail for security and compliance

**Data Layer Pattern:**
- Storage abstraction interface (`IStorage`) defining all data operations
- Drizzle ORM for type-safe database queries
- Neon serverless PostgreSQL with WebSocket connections for edge deployment

### Real-Time Communication

**WebSocket Implementation:**
- Persistent WebSocket connections managed per user session
- Connection mapping using `Map<userId, WebSocket>` for targeted message delivery
- Message types: `auth` (connection authentication), `chat_message` (user-to-user messages), `notification` (system alerts)
- Automatic query invalidation on message receipt to update UI
- Error handling and connection state management

### Authentication & Authorization

**Replit Auth Integration:**
- OIDC discovery and configuration using `openid-client`
- Automatic user provisioning via `upsertUser` on successful authentication
- Session management with 7-day TTL
- Secure cookie configuration (httpOnly, secure flags)
- Session store backed by PostgreSQL for persistence across restarts

**Security Features:**
- Two-factor authentication support (schema ready, implementation pending)
- Role-based access control (user, admin, moderator roles)
- User blocking/deactivation capabilities
- Terms acceptance tracking with IP and device information
- Audit logging for sensitive operations

### Multi-Theme System

**Theme Implementation:**
- Context-based theme provider with localStorage persistence
- Support for light, dark, high-contrast, and system-based themes
- CSS custom properties for dynamic theme switching
- Theme-aware component styling throughout the application

## External Dependencies

### Database & Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database with WebSocket support for edge deployment
- **Drizzle ORM**: TypeScript ORM for type-safe database operations and schema management
- **connect-pg-simple**: PostgreSQL session store for express-session

### Authentication & Identity
- **Replit Auth (OIDC)**: Primary authentication provider using OpenID Connect
- **Passport.js**: Authentication middleware with OIDC strategy
- **openid-client**: OpenID Connect client library for Replit integration

### UI & Frontend Libraries
- **Radix UI**: Headless UI component primitives (40+ components including dialogs, dropdowns, tooltips)
- **Shadcn/ui**: Pre-styled component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for UI elements
- **TanStack React Query**: Server state management and caching

### Real-Time & Communication
- **ws**: WebSocket library for real-time messaging and notifications
- **WebSocket (browser)**: Native WebSocket API for client-side connections

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Replit Vite Plugins**: Development banner, runtime error overlay, and cartographer for Replit integration
- **Zod**: Schema validation with drizzle-zod for type-safe forms

### Validation & Forms
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Validation resolvers for Zod integration
- **Zod**: Runtime type validation and schema definition