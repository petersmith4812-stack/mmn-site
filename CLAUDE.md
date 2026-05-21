# Mini Muslims Nest — Website

React website for Mini Muslims Nest, Pakistan's first mommy-inclusive preschool and afterschool club based in Lahore. Single-page, scroll-based layout built with Create React App.

## Tech Stack

- **React 18** with Create React App (`react-scripts 5`)
- **Inline styles only** — no CSS files, no Tailwind, no CSS modules
- **No TypeScript** — plain JSX throughout
- Deployed on **Vercel** (`vercel.json` present)

## Project Structure

```
src/
├── constants/
│   └── theme.js              # All colours (C palette) — always import from here
├── hooks/
│   └── useInView.js          # IntersectionObserver hook — used by FadeIn & AnimatedCounter
├── components/
│   ├── ui/                   # Reusable primitives
│   │   ├── Logo.jsx          # School logo img with fallback
│   │   ├── FadeIn.jsx        # Scroll-triggered fade + slide wrapper
│   │   ├── TiltCard.jsx      # Mouse 3D tilt wrapper
│   │   ├── AnimatedCounter.jsx  # Number count-up on scroll
│   │   ├── RainbowDivider.jsx   # 6-colour horizontal rule
│   │   ├── ScrollProgress.jsx   # Fixed top progress bar
│   │   └── ScrollToTop.jsx      # Fixed bottom ↑ button
│   └── sections/             # One file per page section
│       ├── Nav.jsx
│       ├── Hero.jsx
│       ├── Vision.jsx
│       ├── Philosophy.jsx
│       ├── PoliciesStrip.jsx
│       ├── Pedagogy.jsx
│       ├── DaySchedule.jsx
│       ├── WeeklyStructure.jsx
│       ├── AfterschoolClub.jsx
│       ├── ForMothers.jsx
│       ├── SpecialProg.jsx
│       ├── Enrol.jsx
│       └── Footer.jsx
├── App.jsx                   # Assembles sections + global keyframe animations
└── index.js                  # CRA entry point (unchanged)
```

## Key Conventions

### Colours
All colours live in `src/constants/theme.js` as the `C` object. Never hardcode a hex — always use `C.navy`, `C.coral`, `C.mint`, etc.

### Scroll animations
Wrap any element in `<FadeIn>` for scroll-triggered fade-in. Pass `delay={0.1}` (seconds) to stagger multiple items.

### Section nav IDs
The `Nav` component resolves link labels to IDs via `id.toLowerCase().replace(/ /g,"-")`. When adding a new section, make sure the `id` attribute on the `<section>` matches this formula — e.g. "A Day Here" → `id="a-day-here"`.

### Global keyframe animations
`pulseHeart`, `shimmer`, and `bobble` are defined in the global `<style>` tag in `App.jsx`. All sections can use these animation names freely. Do not redefine them in individual section files.

### Styling approach
All styling is inline. For hover effects, use `onMouseOver`/`onMouseOut` event handlers that mutate `e.currentTarget.style` directly (avoids adding CSS classes).

## Development

```bash
cd "C:\Users\T480s\Downloads\website files\mmn-site\mmn-site"
npm start       # dev server on localhost:3000
npm run build   # production build → build/
```

## Known Issues / TODOs

- **Logo image path** — `Logo.jsx` uses `/mnt/user-data/uploads/1000741292.png`, a placeholder path from the original upload environment. Add the real logo to `public/` and update the `src` prop.
- **Folder nesting** — The repo has a confusing `mmn-site/mmn-site/` double-nesting. The inner `mmn-site/` is the actual React project root (where `package.json` lives). Consider renaming the outer folder.
- **Loose file** — `MiniMuslimsNest_Website.jsx` in the parent Downloads folder is an outdated copy of the old monolithic `App.jsx`. It can be deleted.
