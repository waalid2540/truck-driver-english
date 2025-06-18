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
- June 18, 2025: Successfully completed loading all 200 authentic officer-driver conversations with proper multiple choice format and professional driver responses as correct answers - dataset now contains realistic alternative responses for comprehensive practice
- June 18, 2025: Fixed voice generation bug and restored user's exact original dataset of 198 authentic officer-driver conversations from attached file - voice system now working correctly with proper text instead of index numbers
- June 18, 2025: Removed "Officer:" prefix from all 210 questions to eliminate confusion - voice now speaks questions naturally without role identification
- June 18, 2025: Implemented voice selection persistence using localStorage - user voice preferences now permanently saved across logout/login sessions
- June 18, 2025: Reduced voice speech rate to 0.3 for both officer and driver voices - very slow, crystal clear speech optimized for learning and practice comprehension
- June 18, 2025: Enhanced driver voice browser synthesis fallback with mobile-compatible slow speech system matching officer voice quality and consistency
- June 18, 2025: Reduced voice speech rate to 0.2 for both officer and driver voices - extremely slow, clear speech optimized for new drivers learning English
- June 18, 2025: Further reduced voice speech rate to 0.1 (ultra slow) for both officer and driver voices - slowest possible speech for maximum English learning comprehension
- June 18, 2025: Added ultra slow audio playback rate (0.4x speed) to both officer and driver voices - combining slow synthesis with slow playback for maximum learning clarity
- June 18, 2025: Optimized speech rates for clarity - browser synthesis 0.6 rate, ElevenLabs 0.8 speaking rate, audio playback 0.7x speed for clear learning without audio cutting
- June 18, 2025: Fixed voice cutting issues - improved to browser synthesis 0.8 rate, normal 1.0x playback speed for smooth, clear speech without distortion
- June 18, 2025: Removed conversation gaps - reduced all delays from 500ms to 100ms for smooth, natural flow between officer questions and driver responses
- June 18, 2025: Eliminated all conversation delays - removed all timeouts for completely seamless officer-driver conversation flow with zero gaps
- June 18, 2025: Made driver responses completely silent - only officer questions use professional voice over, driver responses show as text only with no audio delays
- June 18, 2025: Restored complete voice over conversation - both officer questions AND driver responses now use professional male voices for full audio dialogue experience
- June 18, 2025: Created continuous professional conversation flow - officer questions immediately followed by driver professional responses with no user interaction or delays between
- June 18, 2025: Fixed simultaneous voice issue - now sequential conversation with officer speaking first, then driver responding when officer finishes to prevent API overload
- June 18, 2025: Reduced voice speech rates to 0.5 for both officer and driver voices - much slower, clearer speech for improved English learning comprehension
- June 18, 2025: Switched from ElevenLabs to GTTS for testing - more reliable voice generation without API limits or concurrent request issues
- June 18, 2025: Applied ultra-high amplification to GTTS voices - 120,000% total gain (1,200x volume boost) for maximum mobile audio clarity
- June 18, 2025: Added comprehensive GTTS audio debugging to diagnose and fix audio playback issues on mobile devices
- June 18, 2025: Fixed conversation timing with proper pauses - 0.5 seconds between officer and driver, 1 second between exchanges for clear sequential audio flow
- June 18, 2025: Improved conversation pacing with longer delays - 2 seconds between officer and driver, 4 seconds between exchanges for better learning comprehension
- June 18, 2025: Restored complete authentic dataset of 218 officer-driver conversations from original user file - all authentic traffic stop scenarios now available with proper professional responses
- June 18, 2025: Simplified DOT practice to direct access of user's 218 authentic questions - removed complicated categories and documentation, loads real officer-driver conversations immediately with simple voice over

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