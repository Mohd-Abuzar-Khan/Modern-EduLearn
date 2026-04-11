

## E-Learning Landing Page — Horizontal Scroll

Building a premium dark ambient horizontal-scrolling landing page as the index route, with all styles inlined (single-file spirit). Four scroll-snap sections:

1. **Hero** — CSS radial gradient with organic green-glow orb, fade-in headline + subtitle, minimal nav, pulsing scroll arrow
2. **About** — Editorial layout with platform description and stat row (12K+ students, 200+ courses, 98% satisfaction)
3. **Course Cards** — 4 dark glassmorphic cards with gradient thumbnails, titles, instructor names, pill badges, hover lift
4. **Login** — Frosted-glass login card floating over the gradient, email/password inputs, Sign In button

**Design system:** CSS custom properties for the palette (deep forest green `#0a1a10` → near-black `#060a06`, cream orb highlights, white/light-gray typography). Grainy texture overlay, soft glowing radial gradients per section.

**Technical:** `scroll-snap-type: x mandatory`, flex container with `overflow-x: scroll`, each section `100vw × 100vh`, CSS keyframe animations for fade-in and pulse, `backdrop-filter: blur` on login card. No JS needed for core functionality.

