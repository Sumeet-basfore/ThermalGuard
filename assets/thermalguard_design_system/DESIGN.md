---
name: ThermalGuard Design System
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393f'
  surface-container-lowest: '#0c0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#282a2f'
  surface-container-highest: '#33353a'
  on-surface: '#e2e2e9'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#e2e2e9'
  inverse-on-surface: '#2e3036'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#c3c6d3'
  on-secondary: '#2c303a'
  secondary-container: '#454953'
  on-secondary-container: '#b5b8c4'
  tertiary: '#c0c6da'
  on-tertiary: '#29303f'
  tertiary-container: '#666d7e'
  on-tertiary-container: '#ecf0ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dfe2ef'
  secondary-fixed-dim: '#c3c6d3'
  on-secondary-fixed: '#181c25'
  on-secondary-fixed-variant: '#434751'
  tertiary-fixed: '#dce2f6'
  tertiary-fixed-dim: '#c0c6da'
  on-tertiary-fixed: '#141c2a'
  on-tertiary-fixed-variant: '#404757'
  background: '#111318'
  on-background: '#e2e2e9'
  surface-variant: '#33353a'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  code-table:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
  sidebar-width: 240px
  panel-gap: 1px
---

## Brand & Style

The design system is engineered for high-stakes industrial environments where cognitive load must be minimized to ensure rapid response times. The brand personality is rooted in **precision, reliability, and technical authority**. It avoids all decorative trends—such as glassmorphism or neomorphism—in favor of a disciplined, data-first aesthetic inspired by mission-critical control rooms.

The target audience consists of facility engineers and safety officers who require a "heads-up display" experience. The UI evokes a sense of **calm under pressure** through a dark, high-contrast interface that prioritizes information density without sacrificing clarity. Every element must feel intentional, as if machined from a physical industrial console.

## Colors

The palette is optimized for long-duration monitoring in industrial settings, utilizing a deep matte canvas to reduce eye strain.

- **Foundations:** The background uses a deep matte black (`#0B0D12`), while surfaces use a slightly lighter charcoal (`#151922`) to create structural hierarchy.
- **Functional Blue:** The primary blue is used strictly for interactive elements and primary actions.
- **Signal Logic:** Success, Warning, and Danger colors follow international industrial standards. These are the only vibrant hues allowed in the interface, ensuring that alerts immediately draw the eye against the muted backdrop.
- **Typography:** Three levels of grayscale provide a clear information hierarchy, with technical metadata pushed into the background using the muted slate tone.

## Typography

Typography is used as a functional tool for data organization. **Inter** provides high legibility for UI labels and headings, while **JetBrains Mono** is utilized for all raw sensor data, timestamps, and log entries to ensure digit alignment and technical clarity.

- **Hierarchy:** Use `label-caps` for section headers and table headers to provide a structural frame.
- **Data Densitiy:** Use `mono-data` for live telemetry streams where characters must remain distinct even at small sizes.
- **Mobile Adaptivity:** For small screens, `display-lg` should scale down to 24px to maintain viewport integrity.

## Layout & Spacing

This design system employs a **fixed-fluid hybrid grid**. The sidebar remains at a constant width, while the main content area utilizes a 12-column fluid grid. 

- **The 4px Rule:** All spacing increments must be multiples of 4px to maintain a rhythmic, engineered feel.
- **Panel Layout:** Use 1px gaps (the border color) between adjacent data panels to simulate a modular physical dashboard. 
- **Density:** Spacing is tight to allow for maximum data visibility. Padding inside cards should be 16px (desktop) and 12px (mobile).

## Elevation & Depth

Depth is conveyed through **tonal layering and restrained outlines** rather than shadows. 

- **Layer 0:** Background (`#0B0D12`) for the base environment.
- **Layer 1:** Surface (`#151922`) for cards, sidebars, and navigation bars.
- **Layer 2:** Popovers or Modals, which use a slightly lighter fill or a subtle 4px blur backdrop solely to separate from the content below.
- **Borders:** All containers must have a 1px solid border (`#2A3140`). Shadows are strictly prohibited except for large modals, where a 12px neutral-black ambient shadow may be used to indicate focus.

## Shapes

The shape language is "Soft-Industrial." While 0px corners are too aggressive, a modest **4px radius (Soft)** is applied to all components to ensure the UI feels modern and professional without becoming "friendly" or "playful."

- **Small elements:** Buttons and input fields use a 4px radius.
- **Large elements:** Cards and panels follow the same 4px radius to maintain a consistent mechanical appearance.
- **Selection states:** Use sharp 2px "indicator notches" on the left side of active sidebar items to denote focus.

## Components

- **Buttons:** Primary buttons use `#2563EB` with white text. Secondary buttons are ghost-style with a `#2A3140` border. State changes (hover/active) should be subtle shifts in background value.
- **Data Tables:** Headers are fixed, using the `label-caps` typography and `#151922` background. Rows are separated by 1px lines. Status cells should contain a high-contrast dot indicator.
- **Status Badges:** Use a "Pill-light" style—a semi-transparent background of the status color (e.g., 10% opacity Danger) with high-contrast text.
- **Input Fields:** Dark background (`#0B0D12`), 1px border (`#2A3140`), and `mono-data` typography for numerical entries. Focus state is a 1px primary blue ring.
- **Charts:** Line charts use a 1.5px stroke width. Grid lines should be `#2A3140` and limited to major axes. Avoid area fills unless they represent a critical threshold range.
- **Sidebar:** Structural and hierarchical. Active states are indicated by text color shift to `#F8FAFC` and a subtle left-aligned blue indicator.