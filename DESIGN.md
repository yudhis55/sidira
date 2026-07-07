# ⚠️ DEPRECATED

**This DESIGN.md is deprecated as of 2026-07-07.**

The single source of truth for the SIDIRA design system is now `gas-legacy/index.html` (GAS v3 live deployment). All design tokens, colors, typography, spacing, and component styling must match GAS v3 1:1.

For reference:
- CSS variables: `gas-legacy/index.html:14-41` (`:root` block)
- Body styles: `gas-legacy/index.html:49-54`
- Component CSS: search `gas-legacy/index.html` for class names

Do NOT follow the achromatic Clinical Ledger system described below. It has been superseded.

---

# Original (deprecated) content below

---
name: SIDIRA Design System
description: Achromatic neutral design for healthcare inventory management
colors:
  background: "#ffffff"
  foreground: "#1a1a1a"
  primary: "#2d2d2d"
  primary-foreground: "#fafafa"
  secondary: "#f5f5f5"
  secondary-foreground: "#2d2d2d"
  muted: "#f5f5f5"
  muted-foreground: "#737373"
  accent: "#f5f5f5"
  accent-foreground: "#2d2d2d"
  destructive: "#dc2626"
  border: "#e5e5e5"
  input: "#e5e5e5"
  ring: "#a3a3a3"
  card: "#ffffff"
  card-foreground: "#1a1a1a"
  popover: "#ffffff"
  popover-foreground: "#1a1a1a"
  sidebar: "#fafafa"
  sidebar-foreground: "#1a1a1a"
  sidebar-primary: "#2d2d2d"
  sidebar-primary-foreground: "#fafafa"
  sidebar-accent: "#f5f5f5"
  sidebar-accent-foreground: "#2d2d2d"
  sidebar-border: "#e5e5e5"
  sidebar-ring: "#a3a3a3"
typography:
  display:
    fontFamily: "var(--font-mono), monospace"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  headline:
    fontFamily: "var(--font-mono), monospace"
    fontSize: "clamp(1.125rem, 2vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "var(--font-mono), monospace"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "var(--font-geist-sans), sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-mono), monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  none: "0"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  "2xl": "1.125rem"
  "3xl": "1.375rem"
  "4xl": "1.625rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  "2xl": "3rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.625rem"
    height: "2rem"
  button-primary-hover:
    backgroundColor: "oklch(0.205 0 0 / 80%)"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.625rem"
    height: "2rem"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
  button-destructive:
    backgroundColor: "oklch(0.577 0.245 27.325 / 10%)"
    textColor: "{colors.destructive}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.625rem"
    height: "2rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.625rem"
    height: "2rem"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "0.25rem 0.625rem"
    height: "2rem"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.none}"
    padding: "1rem"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "0.125rem 0.5rem"
    height: "1.25rem"
  table:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "0.5rem"
  dialog:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.popover-foreground}"
    rounded: "{rounded.none}"
    padding: "1rem"
---

# Design System: SIDIRA

## 1. Overview

**Creative North Star: "The Clinical Ledger"**

SIDIRA embraces an achromatic, high-density design language that prioritizes data clarity over visual decoration. The system is built on a foundation of square corners, compact sizing, and monochromatic restraint — a deliberate rejection of the playful, color-drenched patterns that dominate modern SaaS interfaces.

This is not a friendly app. It is a precise tool for healthcare professionals who need to scan inventory lists, verify conditions, and complete checklists in under 30 seconds. Every pixel serves a functional purpose; decorative gradients, rounded corners, and colorful accents are absent by design. The mono typography for headings reinforces the ledger-like quality — this is a record-keeping system, not a consumer product.

The achromatic palette (chroma 0 across all tokens except destructive red) ensures that color is reserved for semantic meaning only: red for errors and destructive actions, nothing else. This restraint prevents visual fatigue during extended use and maintains focus on the data itself.

**Key Characteristics:**
- Square corners throughout (rounded-none)
- Achromatic neutral palette with chroma 0
- Compact sizing: text-xs base, h-8 controls
- Mono typography for headings (unusual for product UI)
- Subtle ring borders (ring-1 ring-foreground/10) instead of solid borders
- Dark mode ready with full token coverage
- High information density optimized for quick scanning

## 2. Colors: The Achromatic Foundation

The palette is strictly grayscale (chroma 0) except for the destructive red, which carries semantic weight as the sole color accent.

### Primary
- **Ink Black** (oklch(0.205 0 0) / #2d2d2d): The primary action color. Used for primary buttons, active states, and high-emphasis text. Its near-black value ensures maximum contrast against the white background while maintaining a softer, less harsh appearance than pure black.

### Secondary
- **Soft Gray** (oklch(0.97 0 0) / #f5f5f5): The secondary surface color. Used for secondary buttons, hover states, and muted backgrounds. Its very light value provides subtle differentiation from the pure white background without competing for attention.

### Neutral
- **Pure White** (oklch(1 0 0) / #ffffff): The background canvas. Clean, clinical, and distraction-free.
- **Near Black** (oklch(0.145 0 0) / #1a1a1a): The primary text color. Slightly softened from pure black to reduce eye strain during extended reading.
- **Mid Gray** (oklch(0.556 0 0) / #737373): Muted text, placeholders, and secondary information. Provides clear hierarchy without introducing color.
- **Light Gray** (oklch(0.922 0 0) / #e5e5e5): Borders, dividers, and input backgrounds. Subtle enough to structure content without creating visual noise.
- **Ring Gray** (oklch(0.708 0 0) / #a3a3a3): Focus rings and interactive feedback. Visible enough for accessibility but restrained enough to avoid distraction.

### Destructive
- **Signal Red** (oklch(0.577 0.245 27.325) / #dc2626): The only color in the system. Reserved exclusively for errors, warnings, and destructive actions (delete buttons, error messages). Its rarity makes it immediately noticeable.

### Named Rules

**The One Color Rule.** Red is the only color in the system. It appears only for errors and destructive actions. If you're tempted to add another color for "emphasis" or "highlighting," reconsider: use weight, size, or spacing instead. Color is semantic, not decorative.

**The Zero Chroma Rule.** All non-destructive colors have chroma 0 (grayscale). This ensures the system feels clinical and precise, not friendly or playful. If a color has any hue or saturation, it violates this rule.

## 3. Typography: The Mono Ledger

**Display Font:** var(--font-mono), monospace  
**Body Font:** var(--font-geist-sans), sans-serif  
**Label Font:** var(--font-mono), monospace

**Character:** The mono-for-headings, sans-for-body pairing creates a ledger-like quality that reinforces the record-keeping nature of the system. Mono headings feel like database field names; sans body text ensures readability for longer descriptions and notes.

### Hierarchy
- **Display** (700 weight, clamp(1.5rem, 3vw, 2.25rem), 1.2 line-height): Page titles only. Large enough to establish hierarchy but restrained by the mono font's compact nature.
- **Headline** (600 weight, clamp(1.125rem, 2vw, 1.5rem), 1.3 line-height): Section headers and card titles. Provides clear structure without overwhelming the data tables below.
- **Title** (600 weight, 1rem, 1.4 line-height): Sub-section headers and form labels. Compact and precise.
- **Body** (400 weight, 0.875rem, 1.5 line-height): Primary text content. Uses sans-serif for optimal readability at small sizes. Max line length: 65-75ch.
- **Label** (500 weight, 0.75rem, 1.2 line-height, 0.02em tracking): Form labels, table headers, and metadata. Mono font with slight letter-spacing for a technical, precise feel.

### Named Rules

**The Mono Heading Rule.** All headings (h1-h6) use the mono font. This is non-negotiable. The mono font establishes the ledger aesthetic; sans-serif headings would undermine the system's clinical character.

**The Compact Size Rule.** Base text size is 0.875rem (14px), not the typical 1rem (16px). This increases information density for data-heavy tables and lists. If 0.875rem feels too small, the issue is content density, not font size — split the content across pages or sections instead.

## 4. Elevation: The Flat Principle

This system uses tonal layering, not shadows. Depth is conveyed through background color shifts and subtle ring borders, not drop shadows or blur effects.

### Shadow Vocabulary
The system has no shadow vocabulary. Shadows are absent by design.

### Named Rules

**The No Shadow Rule.** Shadows are prohibited. If you need to elevate an element, use a background color shift (e.g., from background to card) or a ring border (ring-1 ring-foreground/10). Never add `box-shadow` or `drop-shadow`.

**The Ring Border Rule.** Instead of shadows, use `ring-1 ring-foreground/10` for subtle elevation. This creates a faint border that separates elements without the visual weight of a shadow. For stronger separation, use `border border-border`.

## 5. Components

### Buttons
- **Shape:** Square corners (0 radius) throughout. The square shape reinforces the ledger aesthetic and prevents the friendly, approachable feel of rounded corners.
- **Primary:** bg-primary text-primary-foreground, h-8 (2rem), px-2.5 py-1. Hover: bg-primary/80. Focus: border-ring ring-1 ring-ring/50.
- **Outline:** bg-background border border-border, h-8. Hover: bg-muted. Focus: border-ring ring-1 ring-ring/50.
- **Secondary:** bg-secondary text-secondary-foreground, h-8. Hover: bg-secondary/95. Focus: border-ring ring-1 ring-ring/50.
- **Ghost:** bg-transparent, h-8. Hover: bg-muted. Focus: border-ring ring-1 ring-ring/50.
- **Destructive:** bg-destructive/10 text-destructive, h-8. Hover: bg-destructive/20. Focus: border-destructive/40 ring-1 ring-destructive/20.
- **Link:** text-primary underline-offset-4. Hover: underline.

### Chips / Badges
- **Style:** bg-primary text-primary-foreground, h-5 (1.25rem), px-2 py-0.5, square corners. Border border-transparent by default.
- **Variants:** secondary (bg-secondary), destructive (bg-destructive/10 text-destructive), outline (border-border), ghost (hover:bg-muted), link (text-primary underline).
- **State:** Selected/unselected distinction is not built in; badges are static indicators.

### Cards / Containers
- **Corner Style:** Square corners (0 radius) throughout.
- **Background:** bg-card (pure white in light mode, dark gray in dark mode).
- **Shadow Strategy:** No shadows. Depth conveyed through ring-1 ring-foreground/10.
- **Border:** ring-1 ring-foreground/10 (subtle), or border border-border (stronger).
- **Internal Padding:** Controlled by --card-spacing variable (default 1rem). Compact to maximize data density.

### Inputs / Fields
- **Style:** bg-transparent border border-input, h-8 (2rem), px-2.5 py-1, square corners. Placeholder text uses text-muted-foreground.
- **Focus:** border-ring ring-1 ring-ring/50. The ring provides clear focus indication without overwhelming the compact layout.
- **Error:** border-destructive ring-1 ring-destructive/20. The red border + ring makes errors immediately visible.
- **Disabled:** bg-input/50 opacity-50. Reduced contrast signals interactivity loss.

### Navigation
- **Sidebar:** bg-sidebar (slightly off-white), border-r border-sidebar-border. Navigation items use text-muted-foreground by default, text-foreground on hover, bg-sidebar-primary text-sidebar-primary-foreground when active.
- **Typography:** text-sm font-medium. Mono font for consistency with headings.
- **States:** Default (text-muted-foreground), Hover (text-foreground bg-sidebar-accent), Active (bg-sidebar-primary text-sidebar-primary-foreground).
- **Mobile:** Sidebar collapses to hamburger menu. No specific mobile navigation pattern defined yet.

### Tables
- **Style:** w-full text-xs, square corners. Border-b border-border between rows.
- **Header:** h-10 px-2, text-foreground font-medium. Border-b border-border.
- **Rows:** hover:bg-muted/50. Subtle hover feedback without overwhelming the data.
- **Cells:** px-2 py-2, whitespace-nowrap by default to maintain column alignment.

### Dialogs / Modals
- **Style:** bg-popover text-popover-foreground, max-w-sm, square corners. ring-1 ring-foreground/10 for subtle elevation.
- **Overlay:** bg-black/10 with backdrop-blur-xs. Subtle enough to maintain context but clear enough to focus attention.
- **Animation:** fade-in-0 zoom-in-95 duration-100. Fast, unobtrusive entrance.

### Progress Bars
- **Style:** h-4 (1rem), rounded-full (the only component using rounded corners). bg-secondary track, bg-primary indicator.
- **Animation:** transition-all on the indicator. Smooth progress feedback.

## 6. Do's and Don'ts

### Do:
- **Do** use square corners (rounded-none) for all components except progress bars (rounded-full). Square corners are the visual signature of this system.
- **Do** use achromatic colors (chroma 0) for everything except destructive actions. If you're adding color, you're violating the system.
- **Do** use mono font for all headings (h1-h6). The mono font establishes the ledger aesthetic; switching to sans-serif undermines the system's character.
- **Do** use compact sizing (text-xs base, h-8 controls) to maximize information density. This is a data-heavy tool, not a content site.
- **Do** use ring-1 ring-foreground/10 for subtle elevation instead of shadows. Shadows are prohibited.
- **Do** reserve red (destructive color) for errors and destructive actions only. Its rarity is what makes it effective.
- **Do** use whitespace-nowrap in table cells to maintain column alignment. Data tables need to be scannable, not wrapped.
- **Do** use text-muted-foreground for secondary information and placeholders. This creates clear hierarchy without introducing color.

### Don't:
- **Don't** use rounded corners on buttons, cards, inputs, or containers. Rounded corners feel friendly and approachable; this system is clinical and precise.
- **Don't** add color for emphasis, highlighting, or decoration. Color is semantic (red = error), not decorative. If you need emphasis, use weight, size, or spacing.
- **Don't** use drop shadows or box-shadows on any component. Shadows are prohibited; use ring borders or background color shifts instead.
- **Don't** use sans-serif fonts for headings. The mono font is non-negotiable for the ledger aesthetic.
- **Don't** increase base font size beyond 0.875rem (14px). If content feels cramped, split it across pages or sections; don't inflate the font size.
- **Don't** use playful or colorful icons. Icons should be monochrome (text-foreground or text-muted-foreground) and functional, not decorative.
- **Don't** add gradients, patterns, or decorative backgrounds. The white canvas is intentional; decoration undermines the clinical feel.
- **Don't** use border-left or border-right greater than 1px as a colored accent. This is a common AI-generated pattern that feels unintentional.
- **Don't** use emoji as the primary visual identity. Emoji are functional (room icons) but not the brand; the brand is the achromatic, mono-typed ledger aesthetic.
- **Don't** make the interface "friendly" or "playful." This is a serious tool for healthcare professionals; personality comes from precision, not whimsy.
