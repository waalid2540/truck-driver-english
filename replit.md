# English Coach for Professional Drivers

## Overview

This is a full-stack web application designed to help truck drivers improve their English communication skills through interactive practice sessions. The app provides two main learning features: DOT (Department of Transportation) practice tests and conversational coaching with AI assistance.

## System Architecture

### Full-Stack Structure
- **Frontend**: React 18 with TypeScript, using Vite for build tooling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing

### Mobile-First Design
The application is designed as a mobile-first progressive web app with a maximum width container and bottom navigation, optimized for truck drivers who primarily use mobile devices.

## Key Components

### Frontend Architecture
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Responsive Design**: Mobile-optimized with trucking-themed colors (blue, orange, gray) and full dark mode support
- **Navigation**: Bottom tab navigation with Home, DOT Practice, Coach, and Settings
- **Forms**: React Hook Form with Zod validation
- **Voice Interface**: Hands-free speech recognition and text-to-speech for driver safety

### Backend Architecture
- **API Routes**: RESTful endpoints for users, practice sessions, DOT categories/questions, and chat
- **Storage Layer**: Abstracted storage interface with in-memory implementation (ready for database integration)
- **AI Integration**: OpenAI GPT-4o for conversational coaching with voice-optimized responses
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Database Schema
- **Users**: Profile management with practice preferences and progress tracking
- **DOT Categories**: Organized practice topics (safety, regulations, etc.)
- **DOT Questions**: Multiple choice questions with explanations
- **Practice Sessions**: User practice history and scoring
- **Chat Messages**: Conversation history for AI coaching sessions

## Data Flow

1. **User Authentication**: Sessions stored in PostgreSQL
2. **Practice Sessions**: User selects category → fetches questions → tracks progress → saves results
3. **AI Coaching**: User sends message → OpenAI API → contextual response → conversation history stored
4. **Progress Tracking**: All practice activities update user statistics and streaks

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **openai**: AI conversation integration

### UI/UX Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form state management

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Replit Configuration
- **Modules**: Node.js 20, Web, PostgreSQL 16
- **Development**: `npm run dev` with hot reload on port 5000
- **Production Build**: Vite build + esbuild for server bundling
- **Deployment**: Autoscale deployment target

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: Required for AI coaching features

### Build Process
1. Frontend assets built with Vite to `dist/public`
2. Server bundled with esbuild to `dist/index.js`
3. Static files served from Express in production

## Changelog
- June 16, 2025: Initial setup with DOT practice, conversational coach, and settings
- June 16, 2025: Added full dark mode support across all components
- June 16, 2025: Implemented hands-free voice interface with speech recognition and text-to-speech for driver safety
- June 16, 2025: Enhanced OpenAI integration with voice-optimized responses for conversational coaching
- June 16, 2025: Fixed browser speech recognition for hands-free operation - successfully enabled voice input for truck drivers without typing
- June 16, 2025: Implemented advanced AI memory system with conversation threading, context analysis, and intelligent topic tracking for personalized trucking practice
- June 17, 2025: Loaded complete dataset of 200 authentic officer-driver conversation pairs for realistic traffic stop practice
- June 17, 2025: Implemented fully hands-free DOT practice system with auto-play officer questions and voice response recognition
- June 17, 2025: Added comprehensive audio controls including auto-play mode, manual controls, and professional response playback
- June 17, 2025: Integrated Google Text-to-Speech (GTTS) for enhanced mobile audio volume with browser synthesis fallback
- June 17, 2025: Restored GTTS as primary voice system for professional, natural-sounding male voices in DOT practice

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Dark mode enabled by default for better visibility while driving.
Voice preference: Professional GTTS voices for authentic DOT practice scenarios.
User feedback: "The app is amazing" - successful implementation of hands-free DOT practice system.