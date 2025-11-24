# Design Guidelines: A'dan Z'ye Dünya Kuşları

## Design Approach

**Selected Approach:** Creative Visual Experience - Drawing inspiration from art gallery websites and nature documentation platforms like National Geographic and Audubon, combined with modern portfolio aesthetics.

**Core Principle:** The site celebrates birds as living art through impressionist pencil illustrations, where each species is treated as a gallery piece with subtle, elegant animations that evoke natural movement.

## Typography

**Font Selection (via Google Fonts):**
- Headlines: "Crimson Pro" (serif, artistic feel) - weights 400, 600
- Body Text: "Inter" (clean readability for Turkish characters) - weights 400, 500
- Use generous letter-spacing for headlines to create breathing room

**Type Scale:**
- Hero/Page Titles: text-5xl md:text-6xl
- Section Headers: text-3xl md:text-4xl  
- Bird Names: text-2xl md:text-3xl
- Body Content: text-base md:text-lg
- Metadata/Labels: text-sm

## Layout System

**Spacing Primitives:** Use Tailwind units of 3, 6, 12, and 20 for consistent rhythm
- Component padding: p-6 to p-12
- Section spacing: py-12 md:py-20
- Card gaps: gap-6 md:gap-12

**Grid Structure:**
- Alfabetik Liste (Main Gallery): Masonry-style grid with varying bird card sizes
  - Mobile: Single column (grid-cols-1)
  - Tablet: 2 columns (md:grid-cols-2)
  - Desktop: 3 columns (lg:grid-cols-3)
- Detail Pages: Asymmetric 2-column split (60/40) on desktop, stacked on mobile

## Core Components

### 1. Ana Sayfa (Homepage)

**Hero Section:**
- Full-width artistic banner (h-screen max-h-[600px])
- Centered title: "A'dan Z'ye Dünya Kuşları"
- Subtle animated bird silhouettes flying across (CSS animation, 3-4 birds max)
- Sticky alphabet navigation bar below hero

**Alphabet Navigation:**
- Horizontal scrollable strip with all 26 letters
- Fixed position on scroll (sticky top-0)
- Active letter highlighted
- Smooth scroll to corresponding bird section

### 2. Kuş Galerisi (Bird Gallery Cards)

**Card Design:**
- Illustration occupies 70% of card (aspect-ratio-3/4)
- Bird name overlaid on bottom with subtle backdrop blur
- Hover state: Gentle scale transform (hover:scale-105) + brief flight animation loop
- Card elevation: shadow-lg
- Rounded corners: rounded-2xl

**Animation on Hover:**
- Illustration subtly animates (2-3 frame loop showing wing movement)
- Transition duration: 2s smooth loop

### 3. Detay Sayfası (Detail Page)

**Layout Structure:**

Left Section (60%):
- Large illustration display (aspect-ratio-square or 4/5)
- Continuous subtle flight animation (CSS keyframes, slow 5s loop)
- Illustration maintains artistic pencil texture

Right Section (40%):
- Bird name (prominently displayed)
- Bilimsel adı (italic, smaller text)
- Compact info grid:
  - Bölge: Icon + region names
  - Boyut: Icon + measurement
  - Renk özellikleri: Icon + brief list
- Each info row: flex layout with icon (Heroicons), label, and value
- Spacing: space-y-6 between info blocks

**Navigation:**
- Floating "Önceki/Sonraki Kuş" buttons (fixed bottom corners on desktop)
- "Galeriye Dön" breadcrumb at top

### 4. Footer

- Simple centered layout
- Site başlığı + kısa açıklama
- İletişim bilgileri (if applicable)
- Sosyal medya ikonları (Heroicons)
- Copyright bilgisi

## Icons

**Library:** Heroicons (via CDN)
Use for:
- Bölge/konum: MapPinIcon
- Boyut: ArrowsPointingOutIcon
- Renk: SparklesIcon
- Navigasyon okları: ChevronLeftIcon, ChevronRightIcon

## Images

**Implementation Strategy:**

**Hero Image:**
- Large watercolor-style header illustration showing mixed flock of birds in flight
- Impressionist treatment with soft edges and visible pencil strokes
- Dimensions: 1920x600px minimum
- Position: background of hero section with subtle parallax effect

**Bird Illustrations:**
- Each bird: Individual portrait in flight pose
- Style: Colored pencil on textured paper effect
- Format: PNG with transparency for layering
- Dimensions: 800x800px minimum for detail pages, 500x500px for gallery cards
- Maintain visible pencil stroke texture and impressionist color blending
- 3-5 animation frames per bird for flight movement (subtle wing positions)

**Placement:**
- Gallery cards: Central placement with 12px padding
- Detail pages: Left column, full-width within container
- Background textures: Subtle paper grain throughout site

## Animations

**Flight Animations (Canvas/CSS):**
- Use CSS keyframes for wing movement (2-3 positions)
- Subtle vertical bob motion (translateY oscillation)
- Gallery: Trigger on hover, 2s duration
- Detail page: Continuous slow loop, 5s duration
- Keep frame rate smooth (60fps) with transform-gpu

**Page Transitions:**
- Fade-in for detail pages (300ms)
- Smooth scroll for alphabet navigation

## Accessibility

- All illustrations include descriptive alt text in Turkish
- Keyboard navigation for alphabet strip (arrow keys)
- Focus indicators on all interactive elements
- Sufficient contrast for text overlays on illustrations
- Turkish language declared in HTML (lang="tr")

## Responsive Behavior

**Breakpoints:**
- Mobile (base): Single column, stacked layouts, reduced spacing (p-3, py-12)
- Tablet (md: 768px): 2-column grid, maintain card proportions
- Desktop (lg: 1024px): 3-column grid, asymmetric detail layout, full spacing

**Mobile Optimizations:**
- Alphabet navigation: Horizontal scroll with snap points
- Detail page: Stack illustration above info
- Reduce animation complexity on mobile devices
- Touch-friendly tap targets (min 44px)