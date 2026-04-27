---
name: Aura Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#564337'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#897365'
  outline-variant: '#dcc1b1'
  surface-tint: '#954a00'
  primary: '#954a00'
  on-primary: '#ffffff'
  primary-container: '#fd8d32'
  on-primary-container: '#653000'
  inverse-primary: '#ffb785'
  secondary: '#585e6e'
  on-secondary: '#ffffff'
  secondary-container: '#dde2f6'
  on-secondary-container: '#5e6475'
  tertiary: '#545f72'
  on-tertiary: '#ffffff'
  tertiary-container: '#a0abc1'
  on-tertiary-container: '#343f51'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc6'
  primary-fixed-dim: '#ffb785'
  on-primary-fixed: '#301400'
  on-primary-fixed-variant: '#723700'
  secondary-fixed: '#dde2f6'
  secondary-fixed-dim: '#c1c6d9'
  on-secondary-fixed: '#151b29'
  on-secondary-fixed-variant: '#414756'
  tertiary-fixed: '#d8e3fa'
  tertiary-fixed-dim: '#bcc7dd'
  on-tertiary-fixed: '#111c2c'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Be Vietnam Pro
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max-width: 1280px
  gutter: 24px
  margin: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is built for the modern anime enthusiast, prioritizing clarity, breathability, and a sense of "digital calm." The aesthetic moves away from the cluttered, information-heavy interfaces typical of legacy database sites, opting instead for a **Minimalist** approach with **Glassmorphic** accents.

The target audience is a community that values visual storytelling; therefore, the UI acts as a sophisticated frame for vibrant anime key art. The emotional response should be one of effortless organization—evoking the feeling of a clean, sunlit studio. High-quality whitespace and subtle environmental effects (like the background grid) provide a structured yet lightweight foundation.

## Colors

The palette is anchored by a blueish off-white background that prevents eye strain during long browsing sessions. The primary accent, a vibrant orange (#FD8D32), is used sparingly for calls-to-action, progress indicators, and active states to provide a high-energy contrast against the cooler surroundings.

Text and structural components utilize dark navy and muted blue-greys to maintain accessibility while feeling more integrated than pure black. 

- **Background:** A light blue-tinted white (#F8FAFC).
- **Surface:** Pure white (#FFFFFF) for elevated cards and modals.
- **Accents:** Vibrant Orange for primary interactions.
- **Typography:** Dark Navy (#1A202E) for headings and Medium Blue (#4A5568) for secondary body text.

## Typography

This design system uses **Be Vietnam Pro** across all levels to maintain a cohesive, contemporary feel. The typeface’s clean terminals and generous x-height ensure legibility in dense lists and small metadata labels.

Headlines use tighter letter spacing and heavier weights to create a strong visual anchor, while body text uses a slightly increased line height to enhance the "airy" quality of the content. Labels and tags often utilize a semi-bold weight to distinguish them from standard body copy without requiring larger font sizes.

## Layout & Spacing

The layout follows a **Fixed Grid** model for main content areas, centering the experience and providing consistent "breathing room" on wide viewports. A 12-column system is used with 24px gutters to allow for flexible arrangements of anime cover grids and detailed list views.

Spacing is based on an 8px rhythmic scale. Components like media cards or list items should favor generous vertical padding to prevent the interface from feeling cramped. Content groups are separated by larger "stack" increments to clearly delineate sections like "Currently Watching" and "Recommendations."

## Elevation & Depth

To achieve the "airy" aesthetic, this design system minimizes the use of heavy shadows. Depth is primarily established through **Tonal Layers** and subtle environmental effects:

1.  **Background Layer:** Features a subtle light gray grid pattern (1px lines every 40px) and a soft, dark-blue vignette that subtly draws the eye toward the center of the screen.
2.  **Surface Layer:** Cards and containers use pure white backgrounds with a very soft, diffused ambient shadow (8% opacity, blue-tinted) to appear as if floating just above the grid.
3.  **Active Elements:** Elements like active navigation links or primary buttons may use a faint glow effect in the primary orange color to signify interaction.
4.  **Glassmorphism:** Navigation bars and sticky headers should use a backdrop blur (12px) with a semi-transparent white tint (70% opacity) to maintain a sense of vertical depth without blocking the background grid entirely.

## Shapes

The shape language is consistently **Rounded**, reflecting the approachable and friendly nature of the anime community. Standard UI elements like buttons and input fields use a 0.5rem (8px) radius. 

Larger structural elements, such as anime cover cards and modal containers, use `rounded-lg` (16px) or `rounded-xl` (24px) to soften the overall geometry of the page. This prevents the grid-based layout from feeling too rigid or "engineered."

## Components

- **Buttons:** Primary buttons are solid Orange (#FD8D32) with white text. Secondary buttons use a Navy outline with a subtle blueish tint on hover.
- **Anime Cards:** Use a vertical aspect ratio (2:3). Titles are placed below the image in `body-sm` bold. Status indicators (e.g., "Watching") are positioned as floating glassmorphic chips in the top-right corner of the card.
- **Progress Bars:** Use a thick (8px) track in a light blueish-grey with the filled portion in vibrant orange. Include a percentage label in `label-sm`.
- **Chips & Tags:** Small, pill-shaped elements with light blue backgrounds and navy text for genres; orange backgrounds for "Trending" or "New" badges.
- **Input Fields:** Modern, flat design with a 1px border in a light navy tint. Focus states should switch the border to the primary orange with a soft outer glow.
- **Lists:** Detailed list rows use a subtle hover state—a slight shift in background color to a very light blue (#EDF2F7)—rather than a border change, maintaining the clean aesthetic.
- **Navigation:** Top-level navigation items are Navy, shifting to Orange with a small bottom-indicator bar when active.