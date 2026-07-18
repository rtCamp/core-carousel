# Carousel as Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Use as Tabs" toggle to `rt-carousel/carousel` that converts the carousel into a WAI-ARIA-compliant tab widget, keeping Embla as the engine, with a new `rt-carousel/carousel-tab-list` block for labeled tab navigation.

**Architecture:** A new boolean attribute `useTabs` on the carousel block gates all tab-specific behaviour. A new sibling block `rt-carousel/carousel-tab-list` (ported from vertex-blocks) provides labeled, clickable tabs that extend the existing `rt-carousel/carousel` Interactivity store. Slides gain `role="tabpanel"` and `hidden` in tabs mode; the outer block drops `aria-roledescription="carousel"`. The editor is WYSIWYG: non-active slides are hidden via CSS when `data-is-tabs` is set on the wrapper.

**Tech Stack:** TypeScript/TSX, WordPress Interactivity API, Embla Carousel, `@wordpress/block-editor`, `@wordpress/components`, Jest + `@testing-library/react`.

## Global Constraints

- All user-facing strings wrapped in `__('...', 'rt-carousel')` or `_x`/`sprintf` equivalents.
- No new npm dependencies — use only what is already installed.
- All new block files live under `src/blocks/carousel/carousel-tab-list/`.
- PHP block registration goes in `inc/Plugin.php` alongside existing blocks.
- Test command: `npm run test:js` (runs `wp-scripts test-unit-js`).
- Build command: `npm run build`.
- Existing test coverage thresholds: 40% branches/functions/lines/statements — do not drop below.
- Never add AI authorship to commits.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/blocks/carousel/block.json` | Modify | Add `useTabs` attribute + `providesContext` entry |
| `src/blocks/carousel/types.ts` | Modify | Add `useTabs` to `CarouselAttributes` and `useTabs`/`carouselId` to `CarouselContext` |
| `src/blocks/carousel/editor-context.ts` | Modify | Add `useTabs` to `EditorCarouselContextType`; add `duration?:number` to `carouselOptions` type |
| `src/blocks/carousel/slide/block.json` | Modify | Add `rt-carousel/carousel/useTabs` to `usesContext` |
| `src/blocks/carousel/carousel-tab-list/block.json` | Create | New block metadata |
| `src/blocks/carousel/carousel-tab-list/types.ts` | Create | `TabListAttributes` and `TabContext` types |
| `src/blocks/carousel/carousel-tab-list/index.ts` | Create | Block registration |
| `src/blocks/carousel/carousel-tab-list/edit.tsx` | Create | Editor UI: inline label editing + color pickers |
| `src/blocks/carousel/carousel-tab-list/save.tsx` | Create | Static HTML with Interactivity API directives |
| `src/blocks/carousel/carousel-tab-list/view.ts` | Create | Extend `rt-carousel/carousel` store with tab callbacks |
| `src/blocks/carousel/carousel-tab-list/style.scss` | Create | Tab list styles with CSS custom property theming |
| `inc/Plugin.php` | Modify | Register new block |
| `src/blocks/carousel/save.tsx` | Modify | Conditional `aria-roledescription`; `useTabs`/`carouselId`/`duration` in context |
| `src/blocks/carousel/slide/save.tsx` | Modify | Conditional `role`/`aria-roledescription`/bindings when `useTabs` |
| `src/blocks/carousel/view.ts` | Modify | `carouselId` generation in `initCarousel`; new tab callbacks |
| `src/blocks/carousel/edit.tsx` | Modify | `useTabs` toggle, auto-insert, hide controls, `data-is-tabs`, `duration` in `carouselOptions` |
| `src/blocks/carousel/viewport/edit.tsx` | Modify | Forward `duration` from `carouselOptions` to Embla |
| `src/blocks/carousel/slide/edit.tsx` | Modify | Apply `is-active` class based on `selectedIndex` when `useTabs` |
| `src/blocks/carousel/editor.scss` | Modify | Hide non-active slides when `data-is-tabs` is set |
| `src/blocks/carousel/__tests__/view.test.ts` | Modify | Tests for new view callbacks |
| `src/blocks/carousel/__tests__/edit.test.tsx` | Modify | Tests for `useTabs` toggle behaviour |

---

## Task 1: Data model — attributes, types, context

**Files:**
- Modify: `src/blocks/carousel/block.json`
- Modify: `src/blocks/carousel/types.ts`
- Modify: `src/blocks/carousel/editor-context.ts`
- Modify: `src/blocks/carousel/slide/block.json`

**Interfaces:**
- Produces: `CarouselAttributes.useTabs: boolean`, `CarouselContext.useTabs: boolean`, `CarouselContext.carouselId: string`, `EditorCarouselContextType.useTabs: boolean`, `EditorCarouselContextType.carouselOptions.duration?: number`
- All later tasks depend on these types.

- [ ] **Step 1: Add `useTabs` attribute and context to carousel `block.json`**

In `src/blocks/carousel/block.json`, add the following to `"attributes"` (after `"slidesToScroll"`):

```json
"useTabs": {
    "type": "boolean",
    "default": false
}
```

And update `"providesContext"` (it currently doesn't exist — add it alongside the existing `"providesContext"` for `allowedSlideBlocks`):

```json
"providesContext": {
    "rt-carousel/carousel/allowedSlideBlocks": "allowedSlideBlocks",
    "rt-carousel/carousel/useTabs": "useTabs"
}
```

- [ ] **Step 2: Add `useTabs` to `CarouselAttributes` and update `CarouselContext` in `types.ts`**

Open `src/blocks/carousel/types.ts`. Add `useTabs: boolean;` to `CarouselAttributes`:

```ts
export type CarouselAttributes = {
	loop: boolean;
	dragFree: boolean;
	carouselAlign: 'start' | 'center' | 'end';
	align?: 'start' | 'center' | 'end';
	containScroll: 'trimSnaps' | 'keepSnaps';
	direction: 'ltr' | 'rtl';
	axis: 'x' | 'y';
	height: string;
	allowedSlideBlocks: string[];
	autoplay: boolean;
	autoplayDelay: number;
	autoplayStopOnInteraction: boolean;
	autoplayStopOnMouseEnter: boolean;
	ariaLabel: string;
	slideGap: number;
	slidesToScroll: string;
	useTabs: boolean;
};
```

Add `useTabs` and `carouselId` to `CarouselContext`:

```ts
export type CarouselContext = {
	options: EmblaOptionsType & {
		slidesToScroll?: number | 'auto';
	};
	autoplay:
		| boolean
		| {
				delay: number;
				stopOnInteraction: boolean;
				stopOnMouseEnter: boolean;
		  };
	isPlaying: boolean;
	timerIterationId: number;
	selectedIndex: number;
	scrollSnaps: { index: number }[];
	canScrollPrev: boolean;
	canScrollNext: boolean;
	scrollProgress: number;
	ariaLabelPattern: string;
	countLabelPattern?: string;
	announcement?: string;
	announcementPattern?: string;
	shouldAnnounce?: boolean;
	ref?: HTMLElement | null;
	slideCount: number;
	initialized?: boolean;
	useTabs: boolean;
	carouselId: string;
};
```

- [ ] **Step 3: Update `EditorCarouselContextType` in `editor-context.ts`**

Open `src/blocks/carousel/editor-context.ts`. Update the type and default value:

```ts
import { createContext } from '@wordpress/element';
import type { EmblaCarouselType } from 'embla-carousel';
import type { CarouselAttributes } from './types';

export type EditorCarouselContextType = {
	emblaApi: EmblaCarouselType | undefined;
	setEmblaApi: ( api: EmblaCarouselType ) => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
	setCanScrollPrev: ( value: boolean ) => void;
	setCanScrollNext: ( value: boolean ) => void;
	scrollProgress: number;
	setScrollProgress: ( value: number ) => void;
	selectedIndex: number;
	scrollSnaps: number[];
	slideCount: number;
	useTabs: boolean;
	carouselOptions: Omit<Partial<CarouselAttributes>, 'slidesToScroll'> & {
		slidesToScroll?: number | string;
		duration?: number;
	};
};

const defaultValue: EditorCarouselContextType = {
	emblaApi: undefined,
	setEmblaApi: () => {},
	canScrollPrev: false,
	canScrollNext: false,
	setCanScrollPrev: () => {},
	setCanScrollNext: () => {},
	scrollProgress: 0,
	setScrollProgress: () => {},
	selectedIndex: 0,
	scrollSnaps: [],
	slideCount: 0,
	useTabs: false,
	carouselOptions: {},
};

let context = window.__RT_CAROUSEL_CONTEXT__;
if ( ! context ) {
	context = createContext<EditorCarouselContextType>( defaultValue );
	window.__RT_CAROUSEL_CONTEXT__ = context;
}

export const EditorCarouselContext = context;
```

Also update the global `Window` type declaration (it's currently in `vertex-blocks`' types; ensure it exists here too). The file already has `window.__RT_CAROUSEL_CONTEXT__` usage — TypeScript needs the declaration. Add at the bottom of `editor-context.ts`:

```ts
declare global {
	interface Window {
		__RT_CAROUSEL_CONTEXT__?: typeof context;
	}
}
```

- [ ] **Step 4: Add `useTabs` to `usesContext` in `slide/block.json`**

Open `src/blocks/carousel/slide/block.json`. Update `"usesContext"`:

```json
"usesContext": [
    "rt-carousel/carousel/allowedSlideBlocks",
    "rt-carousel/carousel/useTabs"
]
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/danishshakeel/rtCamp/rt-carousel
npm run lint:js:types 2>&1 | head -40
```

Expected: zero errors related to `useTabs` or `carouselId`. Fix any type errors before proceeding.

- [ ] **Step 6: Commit**

```bash
git add src/blocks/carousel/block.json src/blocks/carousel/types.ts src/blocks/carousel/editor-context.ts src/blocks/carousel/slide/block.json
git commit -m "feat: add useTabs attribute to carousel data model"
```

---

## Task 2: New `rt-carousel/carousel-tab-list` block

**Files:**
- Create: `src/blocks/carousel/carousel-tab-list/block.json`
- Create: `src/blocks/carousel/carousel-tab-list/types.ts`
- Create: `src/blocks/carousel/carousel-tab-list/index.ts`
- Create: `src/blocks/carousel/carousel-tab-list/edit.tsx`
- Create: `src/blocks/carousel/carousel-tab-list/save.tsx`
- Create: `src/blocks/carousel/carousel-tab-list/view.ts`
- Create: `src/blocks/carousel/carousel-tab-list/style.scss`
- Modify: `inc/Plugin.php`

**Interfaces:**
- Consumes: `CarouselContext` from `../types`, `EditorCarouselContext` from `../editor-context`
- Produces: Block `rt-carousel/carousel-tab-list` registered and renderable; extends `rt-carousel/carousel` store with `getKeyFeatureDotText`, `getTabAriaControls`, `getTabId`, `getTabLabel`

- [ ] **Step 1: Create `block.json`**

Create `src/blocks/carousel/carousel-tab-list/block.json`:

```json
{
	"$schema": "https://schemas.wp.org/trunk/block.json",
	"apiVersion": 3,
	"version": "1.0.0",
	"name": "rt-carousel/carousel-tab-list",
	"title": "Carousel Tab List",
	"category": "rt-carousel",
	"icon": "list-view",
	"description": "Labeled tab navigation for a carousel in tabs mode.",
	"textdomain": "rt-carousel",
	"ancestor": [
		"rt-carousel/carousel"
	],
	"attributes": {
		"labels": {
			"type": "array",
			"items": {
				"type": "string"
			},
			"default": []
		},
		"orientation": {
			"type": "string",
			"enum": [ "horizontal", "vertical" ],
			"default": "horizontal"
		},
		"activeTabBackgroundColor": {
			"type": "string",
			"default": ""
		},
		"activeTabTextColor": {
			"type": "string",
			"default": ""
		}
	},
	"supports": {
		"interactivity": true,
		"html": false
	},
	"editorScript": "file:./index.ts",
	"style": "file:./style-index.css",
	"viewScriptModule": "file:./view.ts"
}
```

- [ ] **Step 2: Create `types.ts`**

Create `src/blocks/carousel/carousel-tab-list/types.ts`:

```ts
export type TabListAttributes = {
	labels: string[];
	orientation: 'horizontal' | 'vertical';
	activeTabBackgroundColor: string;
	activeTabTextColor: string;
};

export type TabContext = {
	snap?: { index?: number };
	dotLabels?: string[];
	carouselId?: string;
	ariaLabelPattern?: string;
	selectedIndex?: number;
};
```

- [ ] **Step 3: Create `save.tsx`**

Create `src/blocks/carousel/carousel-tab-list/save.tsx`:

```tsx
import { useBlockProps } from '@wordpress/block-editor';
import type { TabListAttributes } from './types';

export default function Save( { attributes }: { attributes: TabListAttributes } ) {
	const { orientation, labels, activeTabBackgroundColor, activeTabTextColor } = attributes;

	const style: React.CSSProperties = {};
	if ( activeTabBackgroundColor ) {
		( style as Record<string, string> )[ '--rt-tab-active-bg' ] = activeTabBackgroundColor;
	}
	if ( activeTabTextColor ) {
		( style as Record<string, string> )[ '--rt-tab-active-color' ] = activeTabTextColor;
	}

	const blockProps = useBlockProps.save( {
		className: orientation === 'vertical' ? 'is-vertical' : undefined,
		role: 'tablist',
		style,
		'data-wp-interactive': 'rt-carousel/carousel',
		'data-wp-context': JSON.stringify( { dotLabels: labels ?? [] } ),
	} );

	return (
		<div { ...blockProps }>
			<template data-wp-each--snap="context.scrollSnaps">
				<button
					className="wp-block-rt-carousel-carousel-tab-list__tab"
					type="button"
					role="tab"
					data-wp-class--is-active="callbacks.isDotActive"
					data-wp-bind--aria-selected="callbacks.isDotActive"
					data-wp-bind--aria-controls="callbacks.getTabAriaControls"
					data-wp-bind--id="callbacks.getTabId"
					data-wp-on--click="actions.onDotClick"
					data-wp-bind--aria-label="callbacks.getTabLabel"
				>
					<span data-wp-text="callbacks.getKeyFeatureDotText" />
				</button>
			</template>
		</div>
	);
}
```

- [ ] **Step 4: Create `edit.tsx`**

Create `src/blocks/carousel/carousel-tab-list/edit.tsx`:

```tsx
import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
	// ponytail: ColorPalette is already in @wordpress/block-editor
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, BaseControl, ColorPalette } from '@wordpress/components';
import { useContext } from '@wordpress/element';
import { EditorCarouselContext } from '../editor-context';
import type { TabListAttributes } from './types';

export default function Edit( {
	attributes,
	setAttributes,
}: {
	attributes: TabListAttributes;
	setAttributes: ( attrs: Partial<TabListAttributes> ) => void;
} ) {
	const { labels, orientation, activeTabBackgroundColor, activeTabTextColor } = attributes;
	const carousel = useContext( EditorCarouselContext );
	const dotCount = Math.max( carousel.scrollSnaps.length, 1 );

	const style: React.CSSProperties = {};
	if ( activeTabBackgroundColor ) {
		( style as Record<string, string> )[ '--rt-tab-active-bg' ] = activeTabBackgroundColor;
	}
	if ( activeTabTextColor ) {
		( style as Record<string, string> )[ '--rt-tab-active-color' ] = activeTabTextColor;
	}

	const blockProps = useBlockProps( {
		className: orientation === 'vertical' ? 'is-vertical' : undefined,
		style,
	} );

	const setLabelAt = ( index: number, value: string ) => {
		const next = [ ...labels ];
		while ( next.length <= index ) {
			next.push( '' );
		}
		next[ index ] = value;
		setAttributes( { labels: next } );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'rt-carousel' ) }>
					<SelectControl
						label={ __( 'Orientation', 'rt-carousel' ) }
						value={ orientation }
						options={ [
							{ label: __( 'Horizontal', 'rt-carousel' ), value: 'horizontal' },
							{ label: __( 'Vertical', 'rt-carousel' ), value: 'vertical' },
						] }
						onChange={ ( value ) =>
							setAttributes( {
								orientation: value as TabListAttributes[ 'orientation' ],
							} )
						}
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Active Tab Colours', 'rt-carousel' ) }
					initialOpen={ false }
				>
					<BaseControl label={ __( 'Background', 'rt-carousel' ) }>
						<ColorPalette
							value={ activeTabBackgroundColor }
							onChange={ ( color ) =>
								setAttributes( { activeTabBackgroundColor: color ?? '' } )
							}
						/>
					</BaseControl>
					<BaseControl label={ __( 'Text', 'rt-carousel' ) }>
						<ColorPalette
							value={ activeTabTextColor }
							onChange={ ( color ) =>
								setAttributes( { activeTabTextColor: color ?? '' } )
							}
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ Array.from( { length: dotCount } ).map( ( _, index ) => (
					<RichText
						key={ index }
						tagName="span"
						className={ `wp-block-rt-carousel-carousel-tab-list__tab${ index === carousel.selectedIndex ? ' is-active' : '' }` }
						value={ labels[ index ] ?? '' }
						onChange={ ( value ) => setLabelAt( index, value ) }
						/* translators: %d: tab number */
						placeholder={ sprintf( __( 'Tab %d', 'rt-carousel' ), index + 1 ) }
						allowedFormats={ [] }
					/>
				) ) }
			</div>
		</>
	);
}
```

- [ ] **Step 5: Create `view.ts`**

Create `src/blocks/carousel/carousel-tab-list/view.ts`:

```ts
import { getContext, store } from '@wordpress/interactivity';
import type { TabContext } from './types';

// Extends rt-carousel/carousel store — reuses onDotClick/isDotActive/scrollSnaps as-is.
store( 'rt-carousel/carousel', {
	callbacks: {
		getKeyFeatureDotText: (): string => {
			const context = getContext<TabContext>();
			const index = context.snap?.index ?? 0;
			const label = context.dotLabels?.[ index ];
			const trimmed = label?.trim();
			return trimmed ? trimmed : String( index + 1 );
		},
		getTabAriaControls: (): string => {
			const context = getContext<TabContext>();
			const index = context.snap?.index ?? 0;
			return `rt-carousel-panel-${ context.carouselId }-${ index }`;
		},
		getTabId: (): string => {
			const context = getContext<TabContext>();
			const index = context.snap?.index ?? 0;
			return `rt-carousel-tab-${ context.carouselId }-${ index }`;
		},
		getTabLabel: (): string => {
			const context = getContext<TabContext>();
			const index = ( context.snap?.index ?? 0 ) + 1;
			return ( context.ariaLabelPattern ?? 'Go to tab %d' ).replace(
				'%d',
				index.toString(),
			);
		},
	},
} );
```

- [ ] **Step 6: Create `style.scss`**

Create `src/blocks/carousel/carousel-tab-list/style.scss`:

```scss
.wp-block-rt-carousel-carousel-tab-list {
	display: flex;
	flex-wrap: wrap;
	gap: 0.25rem;
	margin: 0;
	padding: 0;

	&.is-vertical {
		flex-direction: column;
	}

	&__tab {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		border: 1px solid currentColor;
		background: transparent;
		cursor: pointer;
		font: inherit;
		border-radius: 0.25rem;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;

		--rt-tab-active-bg: #000;
		--rt-tab-active-color: #fff;

		&:focus-visible {
			outline: 2px solid;
			outline-offset: 2px;
		}

		&.is-active,
		&[aria-selected="true"] {
			background-color: var(--rt-tab-active-bg);
			color: var(--rt-tab-active-color);
		}
	}
}

@media (prefers-reduced-motion: reduce) {
	.wp-block-rt-carousel-carousel-tab-list__tab {
		transition: none;
	}
}
```

- [ ] **Step 7: Create `index.ts`**

Create `src/blocks/carousel/carousel-tab-list/index.ts`:

```ts
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import type { TabListAttributes } from './types';
import './style.scss';

registerBlockType( metadata as BlockConfiguration<TabListAttributes>, {
	edit: Edit,
	save: Save,
} );
```

- [ ] **Step 8: Register block in `inc/Plugin.php`**

Open `inc/Plugin.php`. Find the `$blocks` array in `register_blocks()` and add the new entry:

```php
$blocks = [
    'carousel',
    'carousel/carousel-tab-list',
    'carousel/controls',
    'carousel/counter',
    'carousel/dots',
    'carousel/progress',
    'carousel/viewport',
    'carousel/slide',
];
```

- [ ] **Step 9: Build and verify new block appears**

```bash
cd /Users/danishshakeel/rtCamp/rt-carousel
npm run build 2>&1 | tail -20
```

Expected: build succeeds. `build/blocks/carousel/carousel-tab-list/` directory exists with `index.js`, `style-index.css`, `view.js`, `block.json`.

- [ ] **Step 10: Commit**

```bash
git add src/blocks/carousel/carousel-tab-list/ inc/Plugin.php
git commit -m "feat: add rt-carousel/carousel-tab-list block"
```

---

## Task 3: Carousel `save.tsx` — tabs-mode ARIA + context

**Files:**
- Modify: `src/blocks/carousel/save.tsx`

**Interfaces:**
- Consumes: `CarouselAttributes.useTabs` (Task 1), `CarouselContext.useTabs`/`carouselId` (Task 1)
- Produces: Frontend HTML omits `aria-roledescription="carousel"` when `useTabs`; `context.useTabs` and `context.carouselId` serialised into `data-wp-context`; `duration: 0` added to `context.options` when `useTabs`

- [ ] **Step 1: Write the failing test**

In `src/blocks/carousel/__tests__/edit.test.tsx`, confirm that the `useTabs` attribute is present in block output (we'll add a proper save test when the block has it). For now, add a type-level assertion in a new file to verify the attribute is wired. Skip a formal save.tsx test here — the Interactivity API context is covered by view.test.ts in Task 5.

Instead, write a focused smoke test in `src/blocks/carousel/__tests__/view.test.ts` — ensure `context.useTabs` exists on the context type (this compiles or it doesn't). This is a compile-time check. Proceed to implementation.

- [ ] **Step 2: Update `save.tsx`**

Open `src/blocks/carousel/save.tsx`. Destructure `useTabs` from `attributes`:

```tsx
const {
    loop,
    dragFree,
    carouselAlign,
    containScroll,
    direction,
    autoplay,
    autoplayDelay,
    autoplayStopOnInteraction,
    autoplayStopOnMouseEnter,
    ariaLabel,
    slideGap,
    axis,
    height,
    slidesToScroll,
    useTabs,
} = attributes;
```

Update the `context` object to add `useTabs`, `carouselId`, and `duration`:

```tsx
const context: CarouselContext = {
    options: {
        loop,
        dragFree,
        align: carouselAlign,
        containScroll,
        direction,
        axis,
        slidesToScroll: slidesToScroll === 'auto' ? 'auto' : parseInt( slidesToScroll, 10 ),
        // Instant switch in tabs mode — no scroll animation
        ...( useTabs ? { duration: 0 } : {} ),
    },
    autoplay: autoplay
        ? {
            delay: autoplayDelay,
            stopOnInteraction: autoplayStopOnInteraction,
            stopOnMouseEnter: autoplayStopOnMouseEnter,
        }
        : false,
    isPlaying: !! autoplay,
    timerIterationId: 0,
    selectedIndex: -1,
    scrollSnaps: [],
    canScrollPrev: false,
    canScrollNext: false,
    scrollProgress: 0,
    slideCount: 0,
    /* translators: %d: slide number */
    ariaLabelPattern: __( 'Go to slide %d', 'rt-carousel' ),
    /* translators: {{currentSlide}}: current slide number, {{totalSlides}}: total slide count. */
    countLabelPattern: __(
        'Slide {{currentSlide}} of {{totalSlides}}',
        'rt-carousel',
    ),
    announcement: '',
    shouldAnnounce: false,
    /* translators: {{currentSlide}}: current slide number, {{totalSlides}}: total slide count. */
    announcementPattern: __(
        'Slide {{currentSlide}} of {{totalSlides}}',
        'rt-carousel',
    ),
    useTabs: useTabs ?? false,
    carouselId: '', // Set at runtime by initCarousel in view.ts
};
```

Update `blockProps` to conditionally omit `aria-roledescription`:

```tsx
const blockProps = useBlockProps.save( {
    className: 'rt-carousel',
    role: 'region',
    ...( ! useTabs ? { 'aria-roledescription': 'carousel' } : {} ),
    'aria-label': ariaLabel,
    dir: direction,
    'data-axis': axis,
    'data-loop': loop ? 'true' : undefined,
    'data-wp-interactive': 'rt-carousel/carousel',
    'data-wp-context': JSON.stringify( context ),
    'data-wp-init': 'callbacks.initCarousel',
    style: {
        '--rt-carousel-gap': `${ slideGap }px`,
        '--rt-carousel-height': axis === 'y' ? height : undefined,
    } as React.CSSProperties,
} );
```

- [ ] **Step 3: TypeScript check**

```bash
npm run lint:js:types 2>&1 | grep -E "error|save\.tsx" | head -20
```

Expected: zero errors in `save.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/blocks/carousel/save.tsx
git commit -m "feat: add useTabs/carouselId context and conditional aria-roledescription to carousel save"
```

---

## Task 4: Slide `save.tsx` — conditional `role="tabpanel"` and ARIA bindings

**Files:**
- Modify: `src/blocks/carousel/slide/save.tsx`

**Interfaces:**
- Consumes: `rt-carousel/carousel/useTabs` context (Task 1 — `usesContext` in slide/block.json)
- Produces: When `useTabs`, slide renders `role="tabpanel"` + `hidden` binding + `id`/`aria-labelledby` bindings; when not, identical to current output

- [ ] **Step 1: Update `slide/save.tsx`**

Open `src/blocks/carousel/slide/save.tsx`. Add `context` prop and conditional attributes:

```tsx
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { CarouselSlideAttributes } from '../types';

export default function Save( {
	attributes,
	context,
}: {
	attributes: CarouselSlideAttributes;
	context?: { 'rt-carousel/carousel/useTabs'?: boolean };
} ) {
	const { verticalAlignment } = attributes;
	const useTabs = context?.[ 'rt-carousel/carousel/useTabs' ] ?? false;

	const blockProps = useBlockProps.save( {
		className: `embla__slide${
			verticalAlignment ? ` is-vertically-aligned-${ verticalAlignment }` : ''
		}`,
		role: useTabs ? 'tabpanel' : 'group',
		...( ! useTabs ? { 'aria-roledescription': 'slide' } : {} ),
		'data-wp-interactive': 'rt-carousel/carousel',
		...( useTabs
			? {
				'data-wp-bind--id': 'callbacks.getSlideTabPanelId',
				'data-wp-bind--aria-labelledby': 'callbacks.getSlideTabLabelledBy',
				'data-wp-bind--hidden': 'callbacks.isSlideHiddenForTabs',
			}
			: {
				'data-wp-class--is-active': 'callbacks.isSlideActive',
				'data-wp-bind--aria-current': 'callbacks.isSlideActive',
			} ),
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <div { ...innerBlocksProps } />;
}
```

- [ ] **Step 2: TypeScript check**

```bash
npm run lint:js:types 2>&1 | grep -E "error|slide/save" | head -20
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/carousel/slide/save.tsx
git commit -m "feat: add tabpanel role and ARIA bindings to slide save in tabs mode"
```

---

## Task 5: `view.ts` — `carouselId` generation and tab callbacks

**Files:**
- Modify: `src/blocks/carousel/view.ts`
- Modify: `src/blocks/carousel/__tests__/view.test.ts`

**Interfaces:**
- Consumes: `CarouselContext.useTabs`, `CarouselContext.carouselId`, `CAROUSEL_SLIDE_SELECTOR`
- Produces: `context.carouselId` set in `initCarousel`; new callbacks: `isSlideHiddenForTabs`, `getSlideTabPanelId`, `getSlideTabLabelledBy`

- [ ] **Step 1: Write failing tests for new callbacks**

Open `src/blocks/carousel/__tests__/view.test.ts`. At the bottom of the file (after existing tests), add:

```ts
describe( 'isSlideHiddenForTabs', () => {
	const isSlideHiddenForTabs = storeConfig?.callbacks?.isSlideHiddenForTabs;

	it( 'returns false when useTabs is false', () => {
		const { wrapper } = createMockCarouselDOM();
		const slide = document.createElement( 'div' );
		slide.className = 'embla__slide';
		wrapper.querySelector( '.embla' )?.appendChild( slide );

		( getContext as jest.Mock ).mockReturnValue(
			createMockContext( { useTabs: false, carouselId: '1', selectedIndex: 0, initialized: true } ),
		);
		( getElement as jest.Mock ).mockReturnValue( slide );

		expect( isSlideHiddenForTabs() ).toBe( false );
	} );

	it( 'returns false when useTabs is true and slide is active', () => {
		const container = document.createElement( 'div' );
		container.className = 'embla__container';
		const slide = document.createElement( 'div' );
		slide.className = 'embla__slide';
		container.appendChild( slide );

		const viewport = document.createElement( 'div' );
		viewport.className = 'embla';
		viewport.appendChild( container );

		const wrapper = document.createElement( 'div' );
		wrapper.className = 'rt-carousel';
		wrapper.appendChild( viewport );

		( getContext as jest.Mock ).mockReturnValue(
			createMockContext( { useTabs: true, carouselId: '1', selectedIndex: 0, initialized: true } ),
		);
		( getElement as jest.Mock ).mockReturnValue( slide );

		expect( isSlideHiddenForTabs() ).toBe( false );
	} );

	it( 'returns true when useTabs is true and slide is not active', () => {
		const container = document.createElement( 'div' );
		container.className = 'embla__container';
		const slide0 = document.createElement( 'div' );
		slide0.className = 'embla__slide';
		const slide1 = document.createElement( 'div' );
		slide1.className = 'embla__slide';
		container.appendChild( slide0 );
		container.appendChild( slide1 );

		const viewport = document.createElement( 'div' );
		viewport.className = 'embla';
		viewport.appendChild( container );

		const wrapper = document.createElement( 'div' );
		wrapper.className = 'rt-carousel';
		wrapper.appendChild( viewport );

		( getContext as jest.Mock ).mockReturnValue(
			createMockContext( { useTabs: true, carouselId: '1', selectedIndex: 0, initialized: true } ),
		);
		// slide1 is index 1, selectedIndex is 0 → should be hidden
		( getElement as jest.Mock ).mockReturnValue( slide1 );

		expect( isSlideHiddenForTabs() ).toBe( true );
	} );
} );

describe( 'getSlideTabPanelId', () => {
	const getSlideTabPanelId = storeConfig?.callbacks?.getSlideTabPanelId;

	it( 'returns correct id for slide at index 1', () => {
		const container = document.createElement( 'div' );
		container.className = 'embla__container';
		const slide0 = document.createElement( 'div' );
		slide0.className = 'embla__slide';
		const slide1 = document.createElement( 'div' );
		slide1.className = 'embla__slide';
		container.appendChild( slide0 );
		container.appendChild( slide1 );

		const viewport = document.createElement( 'div' );
		viewport.className = 'embla';
		viewport.appendChild( container );
		const wrapper = document.createElement( 'div' );
		wrapper.className = 'rt-carousel';
		wrapper.appendChild( viewport );

		( getContext as jest.Mock ).mockReturnValue(
			createMockContext( { carouselId: 'abc', useTabs: true } ),
		);
		( getElement as jest.Mock ).mockReturnValue( slide1 );

		expect( getSlideTabPanelId() ).toBe( 'rt-carousel-panel-abc-1' );
	} );
} );

describe( 'getSlideTabLabelledBy', () => {
	const getSlideTabLabelledBy = storeConfig?.callbacks?.getSlideTabLabelledBy;

	it( 'returns correct labelledby id for slide at index 0', () => {
		const container = document.createElement( 'div' );
		container.className = 'embla__container';
		const slide0 = document.createElement( 'div' );
		slide0.className = 'embla__slide';
		container.appendChild( slide0 );

		const viewport = document.createElement( 'div' );
		viewport.className = 'embla';
		viewport.appendChild( container );
		const wrapper = document.createElement( 'div' );
		wrapper.className = 'rt-carousel';
		wrapper.appendChild( viewport );

		( getContext as jest.Mock ).mockReturnValue(
			createMockContext( { carouselId: 'abc', useTabs: true } ),
		);
		( getElement as jest.Mock ).mockReturnValue( slide0 );

		expect( getSlideTabLabelledBy() ).toBe( 'rt-carousel-tab-abc-0' );
	} );
} );
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npm run test:js -- --testPathPattern="view.test" 2>&1 | tail -30
```

Expected: tests for `isSlideHiddenForTabs`, `getSlideTabPanelId`, `getSlideTabLabelledBy` fail with "is not a function" because the callbacks don't exist yet.

- [ ] **Step 3: Add `carouselId` generation to `initCarousel` in `view.ts`**

Open `src/blocks/carousel/view.ts`. Add a module-level counter before the `store()` call:

```ts
// Incrementing counter for unique carousel IDs on the same page
let carouselIdCounter = 0;
```

Inside `initCarousel`, after `const context = getContext<CarouselContext>();`, add:

```ts
// Assign a unique ID for tab panel/tab linkage
if ( ! context.carouselId ) {
    context.carouselId = String( ++carouselIdCounter );
}
```

- [ ] **Step 4: Add new callbacks to the `store()` call in `view.ts`**

Inside the `callbacks` object in `store('rt-carousel/carousel', { ... })`, add after `initCarousel`:

```ts
isSlideHiddenForTabs: () => {
    const context = getContext<CarouselContext>();
    if ( ! context.useTabs ) {
        return false;
    }
    if ( ! context.initialized ) {
        return true;
    }

    const slide = getElementRef( getElement() )?.closest?.(
        CAROUSEL_SLIDE_SELECTOR,
    );

    if ( ! slide || ! slide.parentElement ) {
        return false;
    }

    const slides = Array.from( slide.parentElement.children ).filter(
        ( child: Element ) => child.matches( CAROUSEL_SLIDE_SELECTOR ),
    );

    const index = slides.indexOf( slide );
    if ( index === -1 ) {
        return false;
    }
    return context.selectedIndex !== index;
},
getSlideTabPanelId: () => {
    const context = getContext<CarouselContext>();
    const slide = getElementRef( getElement() )?.closest?.(
        CAROUSEL_SLIDE_SELECTOR,
    );

    if ( ! slide || ! slide.parentElement ) {
        return '';
    }

    const slides = Array.from( slide.parentElement.children ).filter(
        ( child: Element ) => child.matches( CAROUSEL_SLIDE_SELECTOR ),
    );

    const index = slides.indexOf( slide );
    return `rt-carousel-panel-${ context.carouselId }-${ index }`;
},
getSlideTabLabelledBy: () => {
    const context = getContext<CarouselContext>();
    const slide = getElementRef( getElement() )?.closest?.(
        CAROUSEL_SLIDE_SELECTOR,
    );

    if ( ! slide || ! slide.parentElement ) {
        return '';
    }

    const slides = Array.from( slide.parentElement.children ).filter(
        ( child: Element ) => child.matches( CAROUSEL_SLIDE_SELECTOR ),
    );

    const index = slides.indexOf( slide );
    return `rt-carousel-tab-${ context.carouselId }-${ index }`;
},
```

- [ ] **Step 5: Also update `createMockContext` helper in `view.test.ts` to include `useTabs` and `carouselId`**

Find the `createMockContext` helper in the test file. Add `useTabs: false` and `carouselId: ''` to the default return value:

```ts
const createMockContext = (
	overrides: Partial<CarouselContext> = {},
): CarouselContext => ( {
	options: { loop: true },
	autoplay: false,
	isPlaying: false,
	timerIterationId: 0,
	selectedIndex: 0,
	scrollSnaps: [ { index: 0 }, { index: 1 }, { index: 2 } ],
	canScrollPrev: true,
	canScrollNext: true,
	scrollProgress: 0,
	slideCount: 3,
	ariaLabelPattern: 'Go to slide %d',
	useTabs: false,
	carouselId: '',
	...overrides,
} );
```

- [ ] **Step 6: Run tests — expect pass**

```bash
npm run test:js -- --testPathPattern="view.test" 2>&1 | tail -30
```

Expected: all tests pass, including new `isSlideHiddenForTabs`, `getSlideTabPanelId`, `getSlideTabLabelledBy` suites.

- [ ] **Step 7: Run full test suite to confirm no regressions**

```bash
npm run test:js 2>&1 | tail -30
```

Expected: all tests pass.

- [ ] **Step 8: TypeScript check**

```bash
npm run lint:js:types 2>&1 | grep error | head -20
```

Expected: zero errors.

- [ ] **Step 9: Commit**

```bash
git add src/blocks/carousel/view.ts src/blocks/carousel/__tests__/view.test.ts
git commit -m "feat: add carouselId and tab panel/labelledby callbacks to view store"
```

---

## Task 6: Carousel `edit.tsx` — toggle, auto-insert, hide controls, `duration` in options

**Files:**
- Modify: `src/blocks/carousel/edit.tsx`
- Modify: `src/blocks/carousel/viewport/edit.tsx`

**Interfaces:**
- Consumes: `useTabs: boolean` from `attributes` (Task 1); `insertBlock`, `createBlock` (already imported); `EditorCarouselContextType.useTabs`/`carouselOptions.duration` (Task 1)
- Produces: `data-is-tabs` on carousel wrapper; `useTabs` in context value; `duration: 0` in `carouselOptions` when `useTabs`; "Use as Tabs" toggle at top of inspector panel; auto-inserts `rt-carousel/carousel-tab-list` on toggle-ON; hides carousel-only controls when tabs active

- [ ] **Step 1: Write a failing test for the toggle behaviour**

Open `src/blocks/carousel/__tests__/edit.test.tsx`. Find the existing describe block. Add a new test (the mock for `ToggleControl` currently returns `null` — update it to call onChange so we can test):

First, update the `ToggleControl` mock to be testable. Find the `ToggleControl: jest.fn( () => null )` mock and replace with:

```ts
ToggleControl: jest.fn( ( { onChange, checked, label } ) => (
    <input
        type="checkbox"
        aria-label={ label }
        checked={ checked }
        onChange={ ( e ) => onChange( e.target.checked ) }
        readOnly={ ! onChange }
    />
) ),
```

Then add a test:

```ts
describe( 'useTabs toggle', () => {
    it( 'renders Use as Tabs toggle', async () => {
        const setAttributes = jest.fn();
        const mockAttributes: CarouselAttributes = {
            loop: false,
            dragFree: false,
            carouselAlign: 'start',
            containScroll: 'trimSnaps',
            direction: 'ltr',
            axis: 'x',
            height: '300px',
            allowedSlideBlocks: [],
            autoplay: false,
            autoplayDelay: 4000,
            autoplayStopOnInteraction: true,
            autoplayStopOnMouseEnter: false,
            ariaLabel: 'Carousel',
            slideGap: 0,
            slidesToScroll: '1',
            useTabs: false,
        };

        // Need inner blocks to avoid setup screen
        mockBlockCount = 2;

        render(
            <Edit
                attributes={ mockAttributes }
                setAttributes={ setAttributes }
                clientId="test-client-id"
            />,
        );

        const toggle = screen.getByRole( 'checkbox', { name: /use as tabs/i } );
        expect( toggle ).toBeInTheDocument();
    } );
} );
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm run test:js -- --testPathPattern="edit.test" 2>&1 | tail -30
```

Expected: fails because "Use as Tabs" toggle doesn't exist yet.

- [ ] **Step 3: Update `carousel/edit.tsx` — destructure `useTabs`, update inspector**

Open `src/blocks/carousel/edit.tsx`.

**3a. Destructure `useTabs`** from `attributes` (in the existing destructuring block):

```ts
const {
    loop,
    dragFree,
    carouselAlign,
    containScroll,
    direction,
    axis,
    height,
    allowedSlideBlocks,
    autoplay,
    autoplayDelay,
    autoplayStopOnInteraction,
    autoplayStopOnMouseEnter,
    ariaLabel,
    slidesToScroll = '1',
    useTabs = false,
} = attributes;
```

**3b. Update `blockProps`** — add `data-is-tabs` and `data-axis` stays:

```tsx
const blockProps = useBlockProps( {
    className: 'rt-carousel',
    dir: direction,
    'data-axis': axis,
    'data-loop': loop ? 'true' : undefined,
    'data-is-tabs': useTabs ? 'true' : undefined,
    style: {
        '--rt-carousel-gap': `${ attributes.slideGap }px`,
        '--rt-carousel-height': axis === 'y' ? height : undefined,
    } as React.CSSProperties,
} );
```

**3c. Update `carouselOptions` memo** — add `useTabs` to deps and `duration`:

```ts
const carouselOptions = useMemo(
    () => ( {
        loop,
        dragFree,
        align: carouselAlign,
        containScroll,
        direction,
        axis,
        height,
        slidesToScroll: slidesToScroll === 'auto' ? 'auto' : parseInt( slidesToScroll, 10 ),
        duration: useTabs ? 0 : undefined,
    } ),
    [ loop, dragFree, carouselAlign, containScroll, direction, axis, height, slidesToScroll, useTabs ],
);
```

**3d. Update `contextValue` memo** — add `useTabs`:

```ts
const contextValue = useMemo(
    () => ( {
        emblaApi,
        setEmblaApi,
        canScrollPrev,
        setCanScrollPrev,
        canScrollNext,
        setCanScrollNext,
        scrollProgress,
        setScrollProgress,
        selectedIndex,
        scrollSnaps,
        slideCount,
        carouselOptions,
        useTabs,
    } ),
    [
        emblaApi,
        canScrollPrev,
        canScrollNext,
        scrollProgress,
        selectedIndex,
        scrollSnaps,
        slideCount,
        carouselOptions,
        useTabs,
        setEmblaApi,
        setCanScrollPrev,
        setCanScrollNext,
        setScrollProgress,
    ],
);
```

**3e. Add the toggle handler function** (before `inspectorControls`):

```ts
const handleUseTabsChange = ( value: boolean ) => {
    if ( value ) {
        setAttributes( {
            useTabs: true,
            loop: false,
            dragFree: false,
            carouselAlign: 'start',
            containScroll: 'trimSnaps',
            slidesToScroll: '1',
            autoplay: false,
            axis: 'x',
        } );
        // Auto-insert tab list as first child (before viewport)
        insertBlock(
            createBlock( 'rt-carousel/carousel-tab-list', {} ),
            0,
            clientId,
        );
    } else {
        setAttributes( { useTabs: false } );
    }
};
```

**3f. Update `inspectorControls`** — add toggle at top; conditionally hide carousel-only controls:

Replace the opening of the first `PanelBody` in `inspectorControls`:

```tsx
<InspectorControls>
    <PanelBody title={ useTabs ? __( 'Tab Settings', 'rt-carousel' ) : __( 'Carousel Settings', 'rt-carousel' ) }>
        <ToggleControl
            label={ __( 'Use as Tabs', 'rt-carousel' ) }
            checked={ useTabs }
            onChange={ handleUseTabsChange }
            help={ __(
                'Converts the carousel into an accessible tab widget.',
                'rt-carousel',
            ) }
        />
        { ! useTabs && (
            <>
                <ToggleControl
                    label={ __( 'Loop', 'rt-carousel' ) }
                    checked={ loop }
                    onChange={ ( value ) => setAttributes( { loop: value } ) }
                    help={ __(
                        'Enables infinite scrolling of slides.',
                        'rt-carousel',
                    ) }
                />
                <ToggleControl
                    label={ __( 'Free Drag', 'rt-carousel' ) }
                    checked={ dragFree }
                    onChange={ ( value ) => setAttributes( { dragFree: value } ) }
                    help={ __( 'Enables momentum scrolling.', 'rt-carousel' ) }
                />
                <SelectControl
                    label={ __( 'Alignment', 'rt-carousel' ) }
                    value={ carouselAlign }
                    options={ [
                        { label: __( 'Start', 'rt-carousel' ), value: 'start' },
                        { label: __( 'Center', 'rt-carousel' ), value: 'center' },
                        { label: __( 'End', 'rt-carousel' ), value: 'end' },
                    ] }
                    onChange={ ( value ) =>
                        setAttributes( { carouselAlign: value as CarouselAttributes[ 'carouselAlign' ] } )
                    }
                />
                <SelectControl
                    label={ __( 'Contain Scroll', 'rt-carousel' ) }
                    value={ containScroll }
                    options={ [
                        { label: __( 'Trim Snaps', 'rt-carousel' ), value: 'trimSnaps' },
                        { label: __( 'Keep Snaps', 'rt-carousel' ), value: 'keepSnaps' },
                        { label: __( 'None', 'rt-carousel' ), value: '' },
                    ] }
                    onChange={ ( value ) =>
                        setAttributes( { containScroll: value as CarouselAttributes[ 'containScroll' ] } )
                    }
                    help={ __(
                        'Prevents excess scrolling at the beginning or end.',
                        'rt-carousel',
                    ) }
                />
                <ToggleControl
                    label={ __( 'Scroll Auto', 'rt-carousel' ) }
                    checked={ slidesToScroll === 'auto' }
                    onChange={ ( isAuto ) =>
                        setAttributes( { slidesToScroll: isAuto ? 'auto' : '1' } )
                    }
                    help={ __(
                        'Scrolls the number of slides currently visible in the viewport.',
                        'rt-carousel',
                    ) }
                />
                { slidesToScroll !== 'auto' && (
                    <RangeControl
                        label={ __( 'Slides to Scroll', 'rt-carousel' ) }
                        value={ parseInt( slidesToScroll, 10 ) || 1 }
                        onChange={ ( value ) =>
                            setAttributes( { slidesToScroll: ( value || 1 ).toString() } )
                        }
                        min={ 1 }
                        max={ 10 }
                    />
                ) }
                <SelectControl
                    label={ __( 'Orientation', 'rt-carousel' ) }
                    value={ axis }
                    options={ [
                        { label: __( 'Horizontal', 'rt-carousel' ), value: 'x' },
                        { label: __( 'Vertical', 'rt-carousel' ), value: 'y' },
                    ] }
                    onChange={ ( value ) =>
                        setAttributes( { axis: value as CarouselAttributes[ 'axis' ] } )
                    }
                />
                { axis === 'y' && (
                    <TextControl
                        label={ __( 'Height', 'rt-carousel' ) }
                        value={ height }
                        onChange={ ( value ) => setAttributes( { height: value } ) }
                        help={ __(
                            'Set a fixed height for vertical carousel (e.g., 400px).',
                            'rt-carousel',
                        ) }
                    />
                ) }
            </>
        ) }
        <SelectControl
            label={ __( 'Direction', 'rt-carousel' ) }
            value={ direction }
            options={ [
                { label: __( 'Left to Right (LTR)', 'rt-carousel' ), value: 'ltr' },
                { label: __( 'Right to Left (RTL)', 'rt-carousel' ), value: 'rtl' },
            ] }
            onChange={ ( value ) =>
                setAttributes( { direction: value as CarouselAttributes[ 'direction' ] } )
            }
            help={ __(
                'Choose content direction. RTL is typically used for Arabic, Hebrew, and other right-to-left languages.',
                'rt-carousel',
            ) }
        />
    </PanelBody>
    { ! useTabs && (
        <PanelBody
            title={ __( 'Autoplay Options', 'rt-carousel' ) }
            initialOpen={ false }
        >
            <ToggleControl
                label={ __( 'Enable Autoplay', 'rt-carousel' ) }
                checked={ autoplay }
                onChange={ ( value ) => setAttributes( { autoplay: value } ) }
            />
            { autoplay && (
                <>
                    <RangeControl
                        label={ __( 'Delay (ms)', 'rt-carousel' ) }
                        value={ autoplayDelay }
                        onChange={ ( value ) =>
                            setAttributes( { autoplayDelay: value ?? 1000 } )
                        }
                        min={ 1000 }
                        max={ 10000 }
                        step={ 100 }
                    />
                    <ToggleControl
                        label={ __( 'Stop on Interaction', 'rt-carousel' ) }
                        checked={ autoplayStopOnInteraction }
                        onChange={ ( value ) =>
                            setAttributes( { autoplayStopOnInteraction: value } )
                        }
                        help={ __(
                            'Stop autoplay when user interacts with carousel.',
                            'rt-carousel',
                        ) }
                    />
                    <ToggleControl
                        label={ __( 'Stop on Mouse Enter', 'rt-carousel' ) }
                        checked={ autoplayStopOnMouseEnter }
                        onChange={ ( value ) =>
                            setAttributes( { autoplayStopOnMouseEnter: value } )
                        }
                        help={ __(
                            'Stop autoplay when mouse hovers over carousel.',
                            'rt-carousel',
                        ) }
                    />
                </>
            ) }
        </PanelBody>
    ) }
</InspectorControls>
```

Keep the remaining `InspectorControls` panels (styles panel with Slide Gap, `InspectorAdvancedControls`) unchanged.

- [ ] **Step 4: Update `viewport/edit.tsx` — forward `duration` to Embla**

Open `src/blocks/carousel/viewport/edit.tsx`. Find the Embla initialisation inside the `useEffect`. Currently:

```ts
embla = EmblaCarousel( viewport, {
    loop: options?.loop ?? false,
    dragFree: options?.dragFree ?? false,
    containScroll: normalizeContainScroll( options?.containScroll ),
    axis: options?.axis || 'x',
    align: options?.align || 'start',
    direction: options?.direction || 'ltr',
    slidesToScroll: options?.slidesToScroll || 1,
    container: dynamicListContainer || undefined,
    watchDrag: false,
    watchSlides: false,
    watchResize: false,
} );
```

Add `duration` forwarding:

```ts
embla = EmblaCarousel( viewport, {
    loop: options?.loop ?? false,
    dragFree: options?.dragFree ?? false,
    containScroll: normalizeContainScroll( options?.containScroll ),
    axis: options?.axis || 'x',
    align: options?.align || 'start',
    direction: options?.direction || 'ltr',
    slidesToScroll: options?.slidesToScroll || 1,
    duration: options?.duration,
    container: dynamicListContainer || undefined,
    watchDrag: false,
    watchSlides: false,
    watchResize: false,
} );
```

- [ ] **Step 5: Run test — expect pass**

```bash
npm run test:js -- --testPathPattern="edit.test" 2>&1 | tail -30
```

Expected: "Use as Tabs toggle" test passes.

- [ ] **Step 6: TypeScript check**

```bash
npm run lint:js:types 2>&1 | grep error | head -20
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add src/blocks/carousel/edit.tsx src/blocks/carousel/viewport/edit.tsx
git commit -m "feat: add Use as Tabs toggle, auto-insert tab list, hide carousel-only controls"
```

---

## Task 7: Slide `edit.tsx` WYSIWYG + `editor.scss` hide rule

**Files:**
- Modify: `src/blocks/carousel/slide/edit.tsx`
- Modify: `src/blocks/carousel/editor.scss`

**Interfaces:**
- Consumes: `EditorCarouselContext.selectedIndex`, `EditorCarouselContext.useTabs`, `rt-carousel/carousel/useTabs` context prop from slide's `usesContext`
- Produces: In the editor, active slide gets `is-active` CSS class when `useTabs` is on; non-active slides are hidden via `.rt-carousel[data-is-tabs] .embla__slide:not(.is-active) { display: none }`

- [ ] **Step 1: Write failing test**

Add to `src/blocks/carousel/__tests__/edit.test.tsx` (within a new describe block):

```ts
describe( 'slide edit WYSIWYG', () => {
    it( 'renders — slide edit imports compile without error', () => {
        // Smoke test: the slide Edit component can be imported
        // Full WYSIWYG behaviour is verified manually in the editor
        const SlideEdit = require( '../slide/edit' ).default;
        expect( typeof SlideEdit ).toBe( 'function' );
    } );
} );
```

- [ ] **Step 2: Run test — expect pass (already passes, just confirms module loads)**

```bash
npm run test:js -- --testPathPattern="edit.test" 2>&1 | tail -15
```

Expected: passes (the slide/edit module already exists).

- [ ] **Step 3: Update `slide/edit.tsx`**

Open `src/blocks/carousel/slide/edit.tsx`. Replace the entire file content:

```tsx
import {
	useBlockProps,
	useInnerBlocksProps,
	BlockControls,
	BlockVerticalAlignmentToolbar,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useContext } from '@wordpress/element';
import type { CarouselSlideAttributes, BlockEditorSelectors } from '../types';
import { EditorCarouselContext } from '../editor-context';

export default function Edit( {
	attributes,
	setAttributes,
	clientId,
	context,
}: {
	attributes: CarouselSlideAttributes;
	setAttributes: ( attributes: Partial<CarouselSlideAttributes> ) => void;
	clientId: string;
	context: { 'rt-carousel/carousel/allowedSlideBlocks'?: string[]; 'rt-carousel/carousel/useTabs'?: boolean };
} ) {
	const allowedBlocks = context[ 'rt-carousel/carousel/allowedSlideBlocks' ];
	const useTabs = context[ 'rt-carousel/carousel/useTabs' ] ?? false;
	const { verticalAlignment } = attributes;
	const { selectedIndex } = useContext( EditorCarouselContext );

	// Find this slide's position among its siblings to determine if it's active
	const slideIndex = useSelect(
		( select ) => {
			const blockEditor = select( 'core/block-editor' ) as BlockEditorSelectors;
			const parentId = ( blockEditor as unknown as { getBlockRootClientId: ( id: string ) => string } ).getBlockRootClientId( clientId );
			if ( ! parentId ) {
				return -1;
			}
			const siblings = blockEditor.getBlocks( parentId ) as Array<{ clientId: string }>;
			return siblings.findIndex( ( b ) => b.clientId === clientId );
		},
		[ clientId ],
	);

	const isActive = useTabs && slideIndex === selectedIndex;

	const blockProps = useBlockProps( {
		className: [
			'embla__slide',
			verticalAlignment ? `is-vertically-aligned-${ verticalAlignment }` : '',
			isActive ? 'is-active' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks:
			allowedBlocks && allowedBlocks.length > 0 ? allowedBlocks : undefined,
		templateLock: false,
	} );

	return (
		<>
			<BlockControls>
				<BlockVerticalAlignmentToolbar
					value={ verticalAlignment }
					onChange={ ( value ) =>
						setAttributes( { verticalAlignment: value } )
					}
				/>
			</BlockControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
```

Note: `BlockEditorSelectors` currently defines `getBlocks` and `getSelectedBlockClientId` and `getBlockParents`. We need `getBlockRootClientId` too. Update `types.ts`:

In `src/blocks/carousel/types.ts`, update `BlockEditorSelectors`:

```ts
export interface BlockEditorSelectors {
	getBlocks: ( clientId: string ) => Array<{ clientId: string }>;
	getSelectedBlockClientId: () => string | null;
	getBlockParents: ( clientId: string ) => string[];
	getBlockRootClientId: ( clientId: string ) => string | null;
}
```

- [ ] **Step 4: Add hide rule to `editor.scss`**

Open `src/blocks/carousel/editor.scss`. Append at the end:

```scss
// Tabs mode: hide non-active slides for WYSIWYG tab behaviour
.rt-carousel[data-is-tabs] {
	.embla__slide:not(.is-active) {
		display: none;
	}
}
```

- [ ] **Step 5: TypeScript check**

```bash
npm run lint:js:types 2>&1 | grep error | head -20
```

Expected: zero errors.

- [ ] **Step 6: Run full test suite**

```bash
npm run test:js 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 7: Build**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/blocks/carousel/slide/edit.tsx src/blocks/carousel/editor.scss src/blocks/carousel/types.ts
git commit -m "feat: WYSIWYG tabs mode — is-active class on active slide and hide non-active"
```

---

## Task 8: Final verification and spec check

- [ ] **Step 1: Run full test suite**

```bash
npm run test:js 2>&1 | tail -30
```

Expected: all tests pass, coverage thresholds met (≥40% branches/functions/lines/statements).

- [ ] **Step 2: TypeScript clean**

```bash
npm run lint:js:types 2>&1
```

Expected: zero errors.

- [ ] **Step 3: Build clean**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds, `build/blocks/carousel/carousel-tab-list/` exists with `index.js`, `view.js`, `style-index.css`, `block.json`.

- [ ] **Step 4: Spec coverage check**

Verify each spec requirement has a corresponding implementation:

| Spec requirement | Implemented in |
|-----------------|---------------|
| `useTabs` attribute on carousel | Task 1: block.json |
| Disabled attrs reset on toggle-ON | Task 6: handleUseTabsChange |
| Tab list auto-inserted | Task 6: insertBlock in handleUseTabsChange |
| Inspector controls hidden when useTabs | Task 6: conditional render |
| Panel title "Tab Settings" | Task 6: PanelBody title |
| WYSIWYG: non-active slides hidden | Task 7: editor.scss + is-active class |
| `aria-roledescription` removed when useTabs | Task 3: save.tsx |
| `role="tabpanel"` on slides | Task 4: slide/save.tsx |
| `hidden` binding on slides | Task 4: slide/save.tsx |
| `id`/`aria-labelledby` bindings on slides | Task 4 + Task 5 callbacks |
| `role="tablist"` on tab list | Task 2: save.tsx |
| `role="tab"` + `aria-selected` on buttons | Task 2: save.tsx |
| `aria-controls`/`id` on tab buttons | Task 2: save.tsx + Task 2: view.ts |
| Labeled tabs via RichText | Task 2: edit.tsx |
| Active tab colour customisation | Task 2: edit.tsx + style.scss |
| `duration: 0` in tabs mode | Task 3: save.tsx + Task 6: edit.tsx + viewport/edit.tsx |
| `carouselId` for ID linkage | Task 5: view.ts initCarousel |
| Tab list stays when useTabs toggled OFF | Task 6: handleUseTabsChange (only sets useTabs:false) |
| PHP block registration | Task 2: Plugin.php |

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: carousel-as-tabs complete implementation"
```
