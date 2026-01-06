# Scene Layout Rules (Widescreen 3440x1440)

These rules capture the sizing, spacing, and motion choices that keep the scene large, readable, and clean on a wide canvas.

## Core Scale
- Design for 3440x1440 as the primary canvas.
- Increase type and icon sizes by ~20-30% versus typical 1080p layouts.
- Every label must be readable on mobile at a glance.

## Token Usage
- Use per-scene `BASE_LAYOUT` (px values for 3440x1440) and derive `layout` with `scale = width / BASE_WIDTH` from `useVideoConfig()`.
- Keep sizes consistent by reusing `layout.text`, `layout.icon`, and `layout.spacing` within the scene.
- Prefer `layout.container` and `layout.heights` for any new section.

## Spacing & Margins
- Use a wide container (about 92% width) with padding on both sides.
- Reserve bottom padding for tags and labels so they never overlap icon rows.
- Avoid giant gaps; use size to fill width, not empty space.

## Export Consistency
- Avoid `vw`/`vh`/`vmin`/`vmax` or `clamp()` with viewport units for sizing or spacing.
- Use numeric px values scaled from `BASE_WIDTH` so Studio preview and exports match.

## Overlap Rules
- No overlaps in any keyframe; plan for motion paths.
- Stagger entries so only one concept occupies the center at a time.
- When one side fades out, the remaining element shifts toward center.
- Use the full width: spread elements into clear lanes so labels and captions never collide.
- If any overlap appears, redesign the layout: separate content into explicit vertical lanes (title / content / tags) and reserve the bottom lane for badges and captions only.
- For dense icon summaries (e.g., Best For), use fixed-width cards in a 2x2 grid or a single wide card with columns; never rely on icon spacing alone for label width.
- Always assign explicit z-index lanes in dense summaries: title and tag/caption must sit above cards, and cards must stay within their own grid lane.
- In dense summaries, avoid absolute positioning entirely: use a 3-row grid (title / icon grid / footer) so each lane has reserved height.

## Typography
- Big, bold keywords only; avoid full sentences.
- Uppercase labels with letter spacing for clarity.
- Titles should be large but never feel cramped.

## Icons & Cards
- Icons must be oversized and paired with labels.
- Icon containers should never feel smaller than their labels.
- Use consistent icon sizes per scene segment.

## Motion Timing
- Stagger pop-ins to prevent collisions.
- Hold transformation elements long enough to read (>= 1s where relevant).
- Use spring/ease for organic motion; avoid jitter.

## Background & Contrast
- Keep the vaporwave sun bright and visible.
- Avoid heavy dark scrims that crush the background.
- Add subtle glow/shadow on text for readability.

## Quick Checklist
- Big enough for mobile?
- No overlaps or edge collisions?
- Tags/lines sit below icon baselines?
- Remaining element re-centers after a fade?
- Background bright, not crushed?
- No viewport-unit sizing that could shift between preview and export?
