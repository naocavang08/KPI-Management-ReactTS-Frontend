---
name: Corporate KPI Framework
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fd'
  surface-container: '#ededf8'
  surface-container-high: '#e7e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#f0f0fb'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#006c47'
  on-secondary: '#ffffff'
  secondary-container: '#82f9be'
  on-secondary-container: '#00734c'
  tertiary: '#5e3c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d5200'
  on-tertiary-container: '#ffca81'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#82f9be'
  secondary-fixed-dim: '#65dca4'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#ffddb3'
  tertiary-fixed-dim: '#ffb950'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
typography:
  display-kpi:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  grid_columns: '12'
  grid_gutter: 24px
  sidebar_width: 260px
---

## Brand & Style

This design system is engineered for high-density data environments and executive decision-making. The brand personality is rooted in reliability, precision, and institutional trust. It prioritizes clarity over decoration, ensuring that key performance indicators remain the focal point of the user experience.

The visual style follows a **Corporate Modern** aesthetic. It utilizes a balanced composition of generous whitespace and a structured grid to manage complex information without overwhelming the user. The interface evokes a sense of "quiet authority"—it is functional, unobtrusive, and rigorously systematic, reflecting the data-driven nature of an internal management tool.

## Colors

The palette is anchored by a deep **Primary Blue (#0052CC)**, chosen for its association with professional stability and focus. To facilitate immediate status recognition within KPI dashboards, the system utilizes a high-visibility semantic set: **Success Green** for positive growth and **Warning Orange** for at-risk metrics.

The neutral scale is critical for data hierarchy. It uses cool grays to define UI boundaries and text levels. The application background is a soft off-white to reduce eye strain during prolonged analysis, while white surfaces are reserved for interactive modules and data cards to create a clear "layering" effect.

## Typography

This design system utilizes **Inter** as its sole typeface. Inter’s tall x-height and neutral character make it exceptionally legible for tabular data and small-scale labels. 

The type hierarchy is designed to guide the eye through numerical values first. The "Display KPI" style is optimized for hero metrics on dashboards, using a tighter letter spacing and heavy weight. Secondary labels use an uppercase format to distinguish metadata from dynamic content. Line heights are strictly adhered to for vertical rhythm and consistent scanning of lists.

## Layout & Spacing

The layout philosophy is based on a **Fluid Grid** with a fixed Sidebar navigation. This allows the dashboard to scale across various screen sizes while maintaining a consistent control center on the left.

A strict 4px baseline grid ensures alignment across all components. Content is organized into a 12-column system, allowing for flexible card layouts (e.g., three 4-column cards for secondary metrics, or one 8-column card for a primary line chart). High-level containers utilize the "lg" (24px) spacing for internal padding to maintain a premium, airy feel amidst dense data.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**. Rather than aggressive shadows, this design system uses a subtle 1px border (#DFE1E6) to define card boundaries.

Depth is communicated through "stacking":
1. **Level 0 (Background):** The application canvas (#F4F5F7).
2. **Level 1 (Surface):** White cards (#FFFFFF) for data visualization and forms.
3. **Level 2 (Interaction):** Subtle, soft ambient shadows (8px blur, 4% opacity) are applied only to active states, such as a focused card or a triggered dropdown, to pull it forward without disrupting the clean, flat aesthetic.

## Shapes

The design system adopts a **Soft** shape language. A standard 4px border radius is applied to buttons, inputs, and smaller components, while cards utilize an 8px radius. 

This level of roundedness strikes a balance between the severity of sharp corners and the playfulness of fully rounded pills. It reinforces the corporate identity by remaining geometric and organized while feeling modern and accessible.

## Components

### Buttons
Buttons are defined by clear hierarchies. **Primary buttons** use #0052CC with white text and a slightly darker hover state. **Secondary buttons** are ghost-style with a neutral border, providing a clear visual distinction for less critical actions like "Cancel" or "Export."

### Form Inputs
Inputs feature a 1px border that shifts to the Primary Blue on focus. Labels are always positioned above the input field for maximum readability, and error states are clearly indicated using the Warning Orange only when manual correction is required.

### Cards
The primary container for all KPI data. Every card includes a standard header area for titles and a footer for "last updated" timestamps. Content inside cards is padded with 24px of internal spacing to ensure charts have room to breathe.

### Sidebar Navigation
A persistent navigation element on the left. It uses a condensed version of the typography for menu items. Active states are indicated by a vertical 4px bar of Primary Blue on the left edge and a subtle background tint, ensuring the user always knows their location within the system hierarchy.

### Status Chips
Small, rounded indicators used for targets (e.g., "On Track", "Behind"). These use the semantic Success and Warning colors with low-opacity backgrounds to remain legible without competing with primary action buttons.