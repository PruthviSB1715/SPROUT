---
name: Agricultural Intelligence
colors:
  surface: '#f7fbf0'
  surface-dim: '#d7dbd2'
  surface-bright: '#f7fbf0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f5eb'
  surface-container: '#ebefe5'
  surface-container-high: '#e5eadf'
  surface-container-highest: '#e0e4da'
  on-surface: '#181d17'
  on-surface-variant: '#40493d'
  inverse-surface: '#2d322b'
  inverse-on-surface: '#eef2e8'
  outline: '#707a6c'
  outline-variant: '#bfcaba'
  surface-tint: '#1b6d24'
  primary: '#0d631b'
  on-primary: '#ffffff'
  primary-container: '#2e7d32'
  on-primary-container: '#cbffc2'
  inverse-primary: '#88d982'
  secondary: '#7a5649'
  on-secondary: '#ffffff'
  secondary-container: '#fdcdbc'
  on-secondary-container: '#795548'
  tertiary: '#923357'
  on-tertiary: '#ffffff'
  tertiary-container: '#b14b6f'
  on-tertiary-container: '#ffedf0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f69c'
  primary-fixed-dim: '#88d982'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005312'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ebbcac'
  on-secondary-fixed: '#2e150b'
  on-secondary-fixed-variant: '#603f33'
  tertiary-fixed: '#ffd9e2'
  tertiary-fixed-dim: '#ffb1c7'
  on-tertiary-fixed: '#3f001c'
  on-tertiary-fixed-variant: '#7f2448'
  background: '#f7fbf0'
  on-background: '#181d17'
  surface-variant: '#e0e4da'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style
The design system is engineered for the intersection of high-precision technology and physical fieldwork. The brand personality is **reliable, observant, and specialized**, aiming to evoke a "lab-clean" sense of professional confidence within an outdoor, unpredictable environment.

The visual style is **Modern Corporate** with a heavy emphasis on **Functional Minimalism**. It prioritizes clarity over decoration, using ample whitespace and a systematic hierarchy to ensure that critical data—such as crop health or equipment status—is immediately legible under varying light conditions. The aesthetic avoids gradients and complex textures in favor of flat surfaces and subtle depth, reflecting the precision of AI-driven agriculture.

## Colors
The palette is rooted in the natural environment of the industry while maintaining functional utility.

- **Primary Green (#2E7D32):** Used for growth indicators, successful states, and primary actions. It represents biological health.
- **Earthy Brown (#795548):** Reserved for ground-level context, soil data, and secondary navigational elements.
- **Semantic Accents:** Amber (#FFA000) is strictly for risk and caution; Red (#D32F2F) is reserved for critical hardware failures or high-priority AI detections.
- **Neutral System:** The background uses a very light gray (#F5F5F5) to reduce glare, while surfaces and cards use pure white (#FFFFFF) to create a clear "Information Layer" above the canvas.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-dense interfaces and high-readability at small scales. 

- **Headlines:** Use a tighter letter-spacing and heavier weights to provide strong visual anchors.
- **Data Points:** For numeric values in metric cards, use `headline-md` or `lg` to ensure they are the primary focal point.
- **Labels:** Small labels use uppercase with slight letter spacing to differentiate metadata from body content.
- **Responsive Note:** On mobile devices, `display-lg` should be avoided; transition to `headline-lg-mobile` to maintain layout integrity.

## Layout & Spacing
The system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile.

- **Rhythm:** An 8px base grid governs all spatial relationships.
- **Margins:** Standard page margins are set to 24px on desktop to allow the UI to breathe, while internal card padding is typically 16px or 20px.
- **Grouping:** Use 8px (sm) for related elements (icon + text) and 24px (lg) to separate distinct sections of a dashboard.
- **Alignment:** All data columns in tables should be right-aligned for numerical comparison, while text remains left-aligned.

## Elevation & Depth
Depth is communicated through a **Tonal Layering** approach combined with **Ambient Shadows**.

1. **Background (#F5F5F5):** The lowest level, representing the field or canvas.
2. **Cards & Surfaces (#FFFFFF):** Elevated slightly using a very soft, diffused shadow (0px 2px 8px rgba(0,0,0,0.05)).
3. **Overlays & Modals:** Highest elevation, using a more pronounced shadow (0px 8px 24px rgba(0,0,0,0.12)) to focus the user’s attention.
4. **Interactive States:** Buttons use a slight lift on hover (increase shadow spread) and a "pressed" state where the shadow is removed, mimicking physical tactile feedback.

## Shapes
The shape language is **Rounded**, striking a balance between industrial precision and user-friendly software. 

- **Cards & Containers:** Use a 12px or 16px radius to frame AI results and metric data. 
- **Buttons:** Follow the standard 8px (rounded-lg) for a sturdy, reliable feel. 
- **Badges/Chips:** Use a fully pill-shaped (rounded-full) radius to distinguish them from interactive buttons.
- **Inputs:** Maintain a consistent 8px radius to match buttons, creating a cohesive form-entry experience.

## Components

### Metric Cards
White surfaces featuring a `label-md` title, a `headline-lg` value, and a small sparkline footer. Sparklines should use the primary green for positive trends and accent red for negative trends.

### AI Evidence Cards
Specialized containers for "Detection Results." These must include a thumbnail with a 4px rounded corner, a confidence score badge (pill-shaped), and a "Human Validation" toggle (Confirm/Reject).

### Status & Risk Badges
Small, pill-shaped indicators.
- **Normal:** Green background (10% opacity) with Green text.
- **Warning:** Amber background (10% opacity) with Amber text.
- **Critical:** Red background (10% opacity) with Red text.

### Buttons
- **Primary:** Solid Primary Green with White text. No gradients.
- **Secondary:** Earthy Brown outline with Brown text.
- **Tertiary:** Ghost style; text-only until hover, then a light gray background appears.

### Input Fields
Thin 1px border (#E0E0E0). On focus, the border transitions to Primary Green with a 2px stroke. Labels are consistently placed above the field in `body-sm` bold.

### Navigation
A dark-themed sidebar (using a deep version of the neutral or Earthy Brown) provides high contrast against the light content area. Icons in the sidebar should be thin-stroke (1.5px) for a modern, technical look.