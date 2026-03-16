# Crypto-Native Full Site Redesign

## Color System
- Base: #0a0a0f (near-black), #111118 (card bg), #1a1a24 (elevated)
- Primary accent: #14F195 (Solana green)
- Secondary: #9945FF (Solana purple)
- Tertiary: #00D1FF (info blue)
- Text: #e2e8f0 (body), #94a3b8 (muted), #64748b (subtle)
- Borders: rgba(255,255,255,0.06)
- Success: #14F195, Error: #ef4444, Warning: #f59e0b

## Files to Modify

### 1. globals.css — New design system
- Update CSS vars to new palette
- Add particle grid background keyframes
- Add text-reveal, stagger-in, glow-pulse animations
- Add gradient-border utility class
- Update glassmorphism to darker tones
- Add cursor-glow effect styles

### 2. Navbar.tsx — Glassmorphism + scroll behavior
- Backdrop blur navbar, hides on scroll down, shows on scroll up
- Logo: "SolanaEdu" with green accent dot, not gradient text
- Active link glow underlines
- Animated mobile responsiveness

### 3. app/page.tsx — Complete homepage rebuild
- Animated grid/dot background
- Staggered text reveal hero ("Learn. Trade. Earn." style)
- SVG icon feature cards replacing emoji cards
- Live price ticker strip
- Cursor-following glow orb
- Better visual hierarchy

### 4. NarrativeSidebar.tsx — Visual refresh
- Match new card styles (gradient borders)
- Green accent colors for CTAs
- Better visual hierarchy

### 5. app/trade/page.tsx — Polish
- Gradient border on chart panel
- Better header styling

### 6. app/quiz/page.tsx — Polish
- Replace emoji module icon with styled mark
- Match new color system

### 7. components/quiz/ModuleCard.tsx — Visual refresh
- Gradient border cards
- New color accents

### 8. app/layout.tsx — Page transitions
- Wrap children in AnimatePresence for page transitions
