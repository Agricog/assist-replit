# Agricog Assist - Agricultural Cognitive Assistant

## Overview

Agricog Assist is a full-stack web application that provides farmers with dual AI assistants for agricultural intelligence. The application combines market intelligence, farm guidance, weather forecasting, and farm data management into a comprehensive agricultural platform.

The system features a React-based frontend with TypeScript and a Node.js/Express backend, utilizing PostgreSQL for data persistence and integrating with external weather APIs. The architecture emphasizes real-time chat functionality, user authentication, and responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom agricultural-themed color palette and CSS variables
- **State Management**: TanStack React Query for server state and API data management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling and request logging
- **Authentication**: Replit Auth with OpenID Connect integration and session management
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Development**: Hot reload with Vite integration for seamless full-stack development

### Data Storage
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Caching**: Database-level weather data caching with expiration timestamps
- **Session Persistence**: PostgreSQL sessions table for authentication state

### Authentication & Authorization
- **Provider**: Replit OAuth with OpenID Connect protocol
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session storage
- **Middleware**: Express middleware for route-level authentication checks
- **User Management**: Automatic user creation/updates on authentication

## External Dependencies

### Third-Party Services
- **Weather API**: OpenWeatherMap API for weather forecasting and geolocation services
- **Database**: Neon PostgreSQL serverless database for production data storage
- **Authentication**: Replit Identity Provider for OAuth authentication flows

### Development Tools
- **Replit Integration**: Cartographer plugin for enhanced development experience
- **Error Handling**: Runtime error modal for development debugging
- **Font Loading**: Google Fonts integration for typography (DM Sans, Geist Mono, Fira Code)

### Key Libraries
- **UI Components**: Comprehensive Radix UI component library with shadcn/ui theming
- **Data Fetching**: TanStack React Query for efficient API state management
- **Form Handling**: React Hook Form with Hookform Resolvers for validation
- **Validation**: Zod schema validation with Drizzle-Zod integration
- **Utilities**: Date-fns for date manipulation, clsx for conditional styling
- **Icons**: Lucide React for consistent iconography