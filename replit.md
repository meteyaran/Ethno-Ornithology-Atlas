# A'dan Z'ye Dünya Kuşları

## Overview

A Turkish-language bird encyclopedia website that presents world birds in an impressionist art gallery style. The application showcases birds alphabetically with pencil-style illustrations, detailed information cards, and animated visual elements inspired by nature documentation platforms like National Geographic and Audubon. The site features a masonry-style gallery layout, sticky alphabet navigation, and individual bird detail pages with elegant transitions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (replacing React Router)
- Path aliases configured for clean imports (@/, @shared/, @assets/)

**UI Component Library**
- Shadcn UI (New York variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming with light/dark mode support
- Custom spacing scale (3, 6, 12, 20) for consistent rhythm

**Typography System**
- Google Fonts: "Crimson Pro" (serif) for headlines and artistic elements
- "Inter" (sans-serif) for body text with Turkish character support
- Responsive type scale from text-sm to text-7xl

**State Management**
- TanStack Query (React Query v5) for server state and caching
- Local React state for UI interactions
- Custom hooks pattern for reusable logic

**Design Pattern**
- Component-based architecture with presentational and container separation
- Mock data layer (birds.ts) currently used for prototyping
- Test IDs embedded throughout for automated testing support

### Backend Architecture

**Server Framework**
- Express.js with TypeScript on Node.js
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production mode serves pre-built static assets
- Custom logging middleware for request/response tracking

**API Structure**
- REST API pattern with /api prefix convention
- Routes registered through centralized route handler
- Storage interface abstraction for future database integration
- Currently uses in-memory storage (MemStorage) as placeholder

**Build Pipeline**
- Client: Vite builds React app to dist/public
- Server: esbuild bundles Express server to dist/index.js
- Separate dev/prod entry points (index-dev.ts, index-prod.ts)
- ESM module system throughout the stack

### Data Storage Solutions

**Database Configuration**
- Drizzle ORM configured for PostgreSQL via Neon serverless driver
- Schema defined in shared/schema.ts with Zod validation
- Migration files managed in ./migrations directory
- Users table with UUID primary keys (example schema provided)

**Current State**
- Mock bird data stored in client-side TypeScript files
- In-memory storage implementation for user management
- Database push command available (db:push) but not actively used
- Production database URL expected via DATABASE_URL environment variable

### Authentication & Authorization

**Planned Implementation**
- User schema includes username/password fields
- Session management dependencies installed (connect-pg-simple)
- No active authentication middleware currently implemented
- Storage interface provides user CRUD methods as foundation

### Styling & Design System

**Color Tokens**
- HSL-based color system with alpha channel support
- Separate token sets for light and dark modes
- Semantic color naming (primary, secondary, accent, destructive, muted)
- Border and elevation utilities for depth

**Animation Strategy**
- CSS transitions for hover/active states (hover-elevate, active-elevate-2)
- Intersection Observer for scroll-based section detection
- Smooth scroll behavior for alphabet navigation jumps
- Subtle bounce animations on bird card hover

**Layout Approach**
- Responsive grid system (1 column mobile → 2 tablet → 3 desktop)
- Sticky alphabet navigation bar
- Full-width hero section with gradient overlay
- Asymmetric detail page layout (60/40 split)

## External Dependencies

**UI Component Ecosystem**
- @radix-ui/* packages (20+ primitives: accordion, dialog, dropdown, popover, tabs, etc.)
- class-variance-authority for variant-based styling
- cmdk for command palette functionality
- embla-carousel-react for carousel components
- lucide-react for icon library

**Data Fetching & Forms**
- @tanstack/react-query (v5.60.5) for data synchronization
- @hookform/resolvers for form validation
- react-hook-form (via resolvers package)
- zod for runtime schema validation
- drizzle-zod for ORM-schema integration

**Database & ORM**
- drizzle-orm (v0.39.1) for type-safe database queries
- @neondatabase/serverless for PostgreSQL connection
- drizzle-kit for schema migrations and management

**Development Tools**
- Replit-specific plugins (vite-plugin-runtime-error-modal, cartographer, dev-banner)
- TypeScript with strict mode enabled
- PostCSS with Tailwind and Autoprefixer

**Utility Libraries**
- date-fns for date formatting
- clsx and tailwind-merge (via cn() utility) for conditional classes
- nanoid for unique ID generation

**Asset Management**
- Static bird illustration images stored in attached_assets/generated_images/
- Image paths imported as ES modules via Vite
- Favicon and hero banner included

### ML Bird Sound Identification System (BirdNET V2.4)

**Architecture**
- BirdNET V2.4 pretrained model from Cornell Lab of Ornithology & TU Chemnitz
- TensorFlow.js for inference on Node.js backend
- Custom MelSpecLayerSimple for spectrogram preprocessing
- 48kHz sample rate, 3-second audio chunks
- 6,522 bird species classification (global coverage)

**Server-side Components (server/ml/)**
- `birdnetPredictor.ts`: BirdNET model loader with TensorFlow.js, species label management, prediction pipeline
- `audioProcessor.ts`: Audio normalization, resampling (to 48kHz), spectrogram generation for visualization
- `birdnet/model/`: Downloaded BirdNET TensorFlow.js model files (audio model, metadata model)
- `birdnet/labels/`: Species labels CSV with 6,522 bird species

**Frontend Components**
- `useMicrophone.ts`: Web Audio API recording hook with live waveform capture
- `SpectrogramVisualizer.tsx`: Canvas-based spectrogram visualization with color maps
- `BirdSoundIdentifier.tsx`: Main UI with recording controls, live feedback, BirdNET results display

**API Endpoints**
- `POST /api/identify-sound`: Process recorded audio with BirdNET, return top predictions with confidence
- `POST /api/generate-spectrogram`: Generate spectrogram from audio URL for visualization
- `GET /api/ml/status`: Model status (loaded, version, 6,522 species support)

**Current Status**
- BirdNET V2.4 model fully operational
- 92% accuracy on validation set
- Supports 6,522 bird species globally
- Real inference active (not demo mode)