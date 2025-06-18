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
- June 17, 2025: Implemented extreme mobile volume amplification with 800% gain boost and dynamic compression for maximum mobile audio output
- June 17, 2025: Enhanced to multi-stage amplification system with 10,000% total gain boost, high-frequency enhancement, and aggressive limiting for maximum mobile volume
- June 17, 2025: Optimized audio processing for clarity: reduced to 1400% gain with speech enhancement, noise reduction, and gentle compression for clear, loud mobile audio
- June 17, 2025: Integrated ElevenLabs API support for premium voice quality with GTTS fallback system
- June 18, 2025: Created comprehensive voice selection interface with 8 professional male voices (4 officer, 4 driver) - users can now choose from Adam, Arnold, Drew, Dave for officers and Sam, Antoni, Charlie, Will for drivers with real-time voice previews
- June 18, 2025: Updated voice selector to accept custom ElevenLabs voice IDs - users can now input any voice ID from their ElevenLabs account for complete personalization with testing functionality
- June 18, 2025: Created comprehensive voice ID management system that fetches voices directly from user's ElevenLabs account, displays voice libraries with visual selection, and provides manual ID input as backup option
- June 18, 2025: Implemented complete user authentication system with Replit Auth - users can now log in with their Replit accounts for secure access
- June 18, 2025: Integrated Stripe payment system for premium subscriptions with unlimited AI coaching, premium voices, and advanced analytics
- June 18, 2025: Added professional landing page for non-authenticated users showcasing key features and benefits
- June 18, 2025: Updated database schema to support user authentication with PostgreSQL sessions and Stripe customer/subscription management
- June 18, 2025: Created subscription management interface allowing users to upgrade to premium features and manage billing
- June 18, 2025: Completed authentication system with landing page, login/signup forms, and sign out functionality - users can now securely access all app features
- June 18, 2025: Restored complete dataset of 200 authentic officer-driver conversation pairs for comprehensive DOT practice - realistic traffic stop scenarios now fully available

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Dark mode enabled by default for better visibility while driving.
Voice preference: Professional GTTS voices for authentic DOT practice scenarios.
User feedback: "The app is amazing" - successful implementation of hands-free DOT practice system.
User feedback: "Voice selection is now working" - confirmed successful implementation of ElevenLabs voice selection with 8 professional male voices.
User feedback: "I don't need this voice so how can I change" - updated to use GTTS as default instead of ElevenLabs voices, giving users full control over voice selection.
User feedback: "Hey I have new API for ElevenLabs" - successfully integrated new valid ElevenLabs API key, premium voices now active and working.
User feedback: "I need you to create voice ID key for ElevenLabs" - implemented comprehensive voice management system with visual selection from user's voice library and manual ID input options.
User feedback: "AI coach can't carry conversations and doesn't remember" - fixed conversation memory system with persistent history storage, intelligent context analysis, and ability to reference specific previous exchanges naturally.
User feedback: "Add multilingual support for any language translations" - implemented comprehensive multilingual support with Arabic, Spanish, Russian, Hindi, French, and other languages for translations, explanations, and natural code-switching while maintaining English learning focus.