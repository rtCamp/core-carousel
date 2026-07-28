# Carousel as Tabs — Design Spec

**Date:** 2026-07-18
**Branch:** `feat/carousel-as-tabs`
**Status:** Approved

---

## Overview

Add a "Use as Tabs" mode to the existing `rt-carousel/carousel` block. When enabled, the carousel becomes a semantically correct tab widget (WAI-ARIA Tabs pattern, option b — Embla engine retained, panels shown/hidden rather than scrolled). A new `rt-carousel/carousel-tab-list` block provides the tab navigation UI, ported from `vertex-blocks/key-features-tabs-dots` with customisable active-tab colours.

---

## 1. Data Model

### 1.1 New carousel attribute

Add to `src/blocks/carousel/block.json`:

```json
"useTabs": { "type": "boolean", "default": false }
```

Add to `providesContext`:

```json
"rt-carousel/carousel/useTabs": "useTabs"
```

### 1.2 Attributes disabled when `useTabs = true`

These are hidden in the inspector and reset to defaults on toggle-ON:

| Attribute | Reset value |
|-----------|-------------|
| `loop` | `false` |
| `dragFree` | `false` |
| `carouselAlign` | `"start"` |
| `containScroll` | `"trimSnaps"` |
| `slidesToScroll` | `"1"` |
| `autoplay` | `false` |
| `axis` | `"x"` |

`slideGap`, `direction`, `ariaLabel` remain available.

When toggling OFF, only `useTabs` is set back to `false`. Disabled attributes stay at defaults (acceptable — values were reset on toggle-ON).

### 1.3 New block: `rt-carousel/carousel-tab-list`

```json
{
  "name": "rt-carousel/carousel-tab-list",
  "title": "Carousel Tab List",
  "ancestor": ["rt-carousel/carousel"],
  "attributes": {
    "labels":                   { "type": "array", "items": { "type": "string" }, "default": [] },
    "orientation":              { "type": "string", "enum": ["horizontal","vertical"], "default": "horizontal" },
    "activeTabBackgroundColor": { "type": "string", "default": "" },
    "activeTabTextColor":       { "type": "string", "default": "" }
  },
  "usesContext": ["rt-carousel/carousel/useTabs"],
  "supports": { "interactivity": true }
}
```

Colour attributes output as CSS custom properties `--rt-tab-active-bg` / `--rt-tab-active-color` on the block wrapper, consumed by SCSS.

---

## 2. Rendered Markup & ARIA

### 2.1 Frontend output when `useTabs = true`

```html
<!-- rt-carousel/carousel: role="region" kept, aria-roledescription removed -->
<div class="rt-carousel" role="region" aria-label="My Tabs"
     data-wp-interactive="rt-carousel/carousel" ...>

  <!-- rt-carousel/carousel-tab-list -->
  <div class="wp-block-rt-carousel-carousel-tab-list"
       role="tablist"
       aria-label="My Tabs"
       style="--rt-tab-active-bg:#0073aa; --rt-tab-active-color:#fff">

    <!-- rendered at runtime via data-wp-each--snap -->
    <button role="tab"
            id="rt-carousel-tab-{carouselId}-{index}"
            aria-selected="true|false"
            aria-controls="rt-carousel-panel-{carouselId}-{index}"
            data-wp-on--click="actions.onDotClick"
            data-wp-bind--aria-selected="callbacks.isDotActive"
            data-wp-bind--aria-controls="callbacks.getTabAriaControls"
            data-wp-bind--id="callbacks.getTabId">
      Label 1
    </button>
    ...
  </div>

  <!-- rt-carousel/carousel-viewport (unchanged structurally) -->
  <div class="embla">
    <div class="embla__container">

      <!-- rt-carousel/carousel-slide — roles change when useTabs=true -->
      <div class="embla__slide"
           role="tabpanel"
           id="rt-carousel-panel-{carouselId}-{index}"
           aria-labelledby="rt-carousel-tab-{carouselId}-{index}"
           hidden
           data-wp-bind--hidden="callbacks.isSlideHiddenForTabs"
           data-wp-bind--id="callbacks.getSlideTabPanelId"
           data-wp-bind--aria-labelledby="callbacks.getSlideTabLabelledBy">
        ...
      </div>

    </div>
  </div>

</div>
```

### 2.2 Frontend output when `useTabs = false`

Identical to current behaviour. Zero change.

### 2.3 ARIA rules

- `role="tablist"` on the tab-list block container
- `role="tab"` on each button; `aria-selected` replaces `aria-current`
- `role="tabpanel"` on each slide; `aria-labelledby` points to matching tab `id`
- `aria-controls` on each tab points to matching panel `id`
- `hidden` attribute on non-active panels (AT skips them; Embla still renders them in DOM)
- `aria-roledescription="carousel"` removed from outer block when `useTabs = true`
- `aria-roledescription="slide"` removed from slides when `useTabs = true`

### 2.4 ID generation

`carouselId` is set during `callbacks.initCarousel` — a short counter stored in `context.carouselId`. Tab and panel IDs derived as `rt-carousel-tab-{carouselId}-{snapIndex}` / `rt-carousel-panel-{carouselId}-{snapIndex}`.

### 2.5 Embla in tabs mode

`duration: 0` added to `carouselOptions` when `useTabs = true` (both editor and frontend) to suppress scroll animation. The overflow clip + `hidden` attribute handle the visual switch.

---

## 3. Editor Behaviour

### 3.1 Toggle control

Placed at the top of the "Carousel Settings" `PanelBody`:

```
[ ] Use as Tabs
```

Toggle-ON side effects (single `setAttributes` call + one `insertBlock`):
1. `setAttributes({ useTabs: true, loop: false, dragFree: false, carouselAlign: 'start', containScroll: 'trimSnaps', slidesToScroll: '1', autoplay: false, axis: 'x' })`
2. `insertBlock(createBlock('rt-carousel/carousel-tab-list', {}), 0, clientId)` — inserts tab-list as first child of carousel (before viewport)

Toggle-OFF side effects:
1. `setAttributes({ useTabs: false })` only — tab-list block stays (user may repurpose as carousel nav dots)

### 3.2 Hidden inspector controls when `useTabs = true`

Hidden via conditional render in `edit.tsx`:
- Loop, Free Drag, Alignment, Contain Scroll, Scroll Auto, Slides to Scroll, Orientation (axis)
- Entire "Autoplay Options" `PanelBody`

Visible in both modes:
- Slide Gap, Direction, ARIA Label

### 3.3 Inspector panel title

```tsx
<PanelBody title={ useTabs ? __('Tab Settings', 'rt-carousel') : __('Carousel Settings', 'rt-carousel') }>
```

### 3.4 WYSIWYG in editor

- Carousel wrapper gets `data-is-tabs` attribute when `useTabs = true`
- Slide `edit.tsx` reads its own index (`getBlockIndex(clientId)` relative to viewport siblings) + `selectedIndex` from `EditorCarouselContext` → applies `is-active` CSS class when indices match
- Editor stylesheet:

```css
.rt-carousel[data-is-tabs] .embla__slide:not(.is-active) {
  display: none;
}
```

- Clicking a tab label in editor → Embla `select` event → `selectedIndex` updates in context → slides re-render → correct slide visible
- Editor is visually identical to frontend

### 3.5 Known limitation

Block breadcrumb/list-view label for `rt-carousel/carousel-slide` stays "Carousel Slide" regardless of mode. Changing it would require a block variation or dynamic title API not currently available without extra complexity.

---

## 4. New Block: `rt-carousel/carousel-tab-list`

### 4.1 Source

Direct port of `vertex-blocks/key-features-tabs-dots`. Key differences:

- Lives in `rt-carousel` plugin, not `vertex-blocks`
- `ancestor` is `rt-carousel/carousel`
- Adds `activeTabBackgroundColor` / `activeTabTextColor` attributes
- Uses `role="tablist"` on container, `role="tab"` on buttons
- Uses `aria-selected` instead of `aria-current`
- Extends `rt-carousel/carousel` Interactivity store with new callbacks

### 4.2 New store callbacks added to `view.ts`

```ts
// Added to rt-carousel/carousel store
callbacks: {
  getKeyFeatureDotText: () => { /* label from dotLabels[snap.index] or index+1 */ },
  getTabAriaControls: () => `rt-carousel-panel-${context.carouselId}-${snap.index}`,
  getTabId:           () => `rt-carousel-tab-${context.carouselId}-${snap.index}`,
  // On slide elements (resolved via slide's position in container):
  getSlideTabPanelId:    () => `rt-carousel-panel-${context.carouselId}-${slideIndex}`,
  getSlideTabLabelledBy: () => `rt-carousel-tab-${context.carouselId}-${slideIndex}`,
  isSlideHiddenForTabs:  () => context.useTabs && !callbacks.isSlideActive(),
}
```

`slideIndex` resolved the same way as existing `isSlideActive` (element position in `.embla__container`).

### 4.3 Colour customisation

```scss
.wp-block-rt-carousel-carousel-tab-list {
  --rt-tab-active-bg: #000;    // fallback
  --rt-tab-active-color: #fff; // fallback

  &__tab {
    &.is-active,
    &[aria-selected="true"] {
      background-color: var(--rt-tab-active-bg);
      color: var(--rt-tab-active-color);
    }
  }
}
```

Colour pickers in `edit.tsx` via two `ColorPalette` controls in an `InspectorControls` panel.

### 4.4 `edit.tsx` behaviour

- Reads `slideCount`, `selectedIndex`, `scrollSnaps` from `EditorCarouselContext`
- Renders inline-editable `RichText` labels per tab (one per snap)
- Active tab highlighted matching `selectedIndex`

---

## 5. File Changes Summary

| File | Change |
|------|--------|
| `src/blocks/carousel/block.json` | Add `useTabs` attribute + `providesContext` entry |
| `src/blocks/carousel/types.ts` | Add `useTabs` to `CarouselAttributes` and `CarouselContext` |
| `src/blocks/carousel/edit.tsx` | Toggle control, auto-insert, hide controls, `data-is-tabs`, WYSIWYG slide class logic |
| `src/blocks/carousel/save.tsx` | Conditional `aria-roledescription`, `duration:0` in options, `context.useTabs` |
| `src/blocks/carousel/editor.scss` | WYSIWYG hide rule for tabs mode |
| `src/blocks/carousel/view.ts` | New callbacks: `isSlideHiddenForTabs`, `getSlideTabPanelId`, `getSlideTabLabelledBy`; generate + store `carouselId` in context during `initCarousel` |
| `src/blocks/carousel/slide/block.json` | Add `usesContext: ["rt-carousel/carousel/useTabs"]` |
| `src/blocks/carousel/slide/save.tsx` | Conditional `role`, `hidden` binding, `id`/`aria-labelledby` bindings |
| `src/blocks/carousel/slide/edit.tsx` | Apply `is-active` class based on index match |
| `src/blocks/carousel/carousel-tab-list/` | **New block** — all files |
| `src/blocks/carousel/index.ts` | Register new block |

---

## 6. Out of Scope

- Slide breadcrumb label rename ("Carousel Slide" → "Tab Panel") — not feasible without block variation
- Keyboard arrow-key navigation between tabs (WAI-ARIA full keyboard pattern) — deferred
- Animating panel transitions in tabs mode — deferred
