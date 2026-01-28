
# Carousel System Interactivity Block

**A modular, high-performance carousel block for WordPress, powered by the Interactivity API and Embla Carousel.**

Easily create dynamic, accessible, and customizable carousels for any content type—posts, testimonials, images, and more. Designed for speed, flexibility, and seamless integration with the WordPress block editor.


## Features

- **Flexible Compound Block Architecture**: Mix and match any blocks inside the carousel, including headings, paragraphs, images, and more.
- **Viewport & Slide Engine**: Strict separation of concerns for maximum performance and extensibility.
- **Navigation Controls & Dots**: Built-in, customizable navigation UI blocks.
- **RTL/LTR Direction Support**: Display carousels in left-to-right or right-to-left mode for multilingual sites.
- **Axis Direction**: Choose horizontal or vertical scrolling.
- **Slides to Scroll**: Configure how many slides move per navigation action.
- **Autoplay**: Enable automatic slide transitions with customizable delay and interaction settings.
- **Looping & Drag Free**: Infinite scrolling and momentum-based navigation.
- **Dynamic Content**: Full support for WordPress Query Loop block for post sliders and dynamic carousels.
- **Accessibility**: W3C-compliant roles, labels, and keyboard navigation.
- **Customizable Styling**: Themeable via CSS variables and block supports (color, spacing, borders).
- **Developer API**: Exposes carousel state for building custom consumer blocks (progress bars, counters, etc).

---


## Block Types

### Parent Block: `carousel-system/carousel`
Controller and wrapper. Handles configuration, state, and context for all child blocks. Allows any block inside.

### Viewport Block: `carousel-system/carousel-viewport`
Physical Embla viewport. Only allows `carousel-system/carousel-slide` or Query Loop as direct children.

### Slide Block: `carousel-system/carousel-slide`
Slide wrapper. Restricts inner content based on parent configuration.

### Controls & Dots Blocks
Navigation UI components. Communicate with parent carousel state.

## Data API for Developers

Expose carousel state via the Interactivity API store (`carousel-system/carousel`). Build custom blocks (progress bars, counters, etc) by consuming this data.

### Exposed Context (`CarouselContext`)

| Property           | Type       | Description                                                                                          |
| :----------------- | :--------- | :--------------------------------------------------------------------------------------------------- |
| `isPlaying`        | `boolean`  | `true` if Autoplay is currently running.                                                             |
| `timerIterationId` | `number`   | Increments every time the Autoplay timer resets (slide change). Bind to `key` to restart animations. |
| `autoplay`         | `boolean` or `{ delay, stopOnInteraction, stopOnMouseEnter }` | Autoplay config or `false` if disabled. |
| `canScrollPrev`    | `boolean`  | `true` if there are previous slides (or looping).                                                    |
| `canScrollNext`    | `boolean`  | `true` if there are next slides (or looping).                                                        |
| `selectedIndex`    | `number`   | The zero-based index of the current slide.                                                           |
| `scrollSnaps`      | `{ index: number }[]` | List of snap points (used by Dots block).                                                       |


## Example: Custom Progress Bar Block

Create a progress bar that animates while the carousel is auto-playing:

**save.tsx**
```jsx
<div
    data-wp-interactive="carousel-system/carousel"
    data-wp-bind--key="context.timerIterationId"
    data-wp-bind--style="state.barDuration"
    data-wp-class--is-playing="context.isPlaying"
    className="rt-progress-bar"
/>
```

**view.ts**
```js
store('carousel-system/carousel', {
    state: {
        get barDuration() {
            const { autoplay } = getContext();
            return `--duration: ${autoplay?.delay || 4000}ms;`;
        }
    }
});
```

**CSS**
```css
.rt-progress-bar.is-playing {
    animation: grow var(--duration) linear forwards;
}
@keyframes grow { from { width: 0%; } to { width: 100%; } }
```

## Example: Styling Active Slide Content

Highlight slide content when active:

```jsx
<div
    data-wp-interactive="carousel-system/carousel"
    data-wp-class--is-active="callbacks.isSlideActive"
    className="my-card"
>
    <h2 data-wp-class--highlight="callbacks.isSlideActive">Card Title</h2>
</div>
```

---


## Patterns & Restrictions

### Creating Restricted Carousels
To create a specialized carousel (e.g., testimonials only), set the `allowedSlideBlocks` attribute on the parent block:

```json
<!-- wp:carousel-system/carousel {"allowedSlideBlocks":["rt-blocks/testimonial-card"]} -->
    <!-- wp:core/heading {"content":"User Testimonials"} /-->
    <!-- wp:carousel-system/carousel-viewport -->
        <!-- wp:carousel-system/carousel-slide -->
            <!-- wp:rt-blocks/testimonial-card /-->
        <!-- /wp:carousel-system/carousel-slide -->
    <!-- /wp:carousel-system/carousel-viewport -->
<!-- /wp:carousel-system/carousel -->
```

---


## Block Attributes (Parent Block)

| Attribute                   | Type    | Default       | Description                                 |
| :-------------------------- | :------ | :------------ | :------------------------------------------ |
| `loop`                      | boolean | `false`       | Infinite scrolling.                         |
| `dragFree`                  | boolean | `false`       | Momentum scrolling.                         |
| `carouselAlign`             | string  | `'start'`     | Slide alignment (`start`, `center`, `end`). |
| `containScroll`             | string  | `'trimSnaps'` | Prevents whitespace at ends.                |
| `allowedSlideBlocks`        | array   | `[]`          | List of block names allowed inside slides.  |
| `autoplay`                  | boolean | `false`       | Enable autoplay.                            |
| `autoplayDelay`             | number  | `4000`        | Delay in ms.                                |
| `autoplayStopOnInteraction` | boolean | `true`        | Stop on user touch/click.                   |
| `autoplayStopOnMouseEnter`  | boolean | `false`       | Stop on hover.                              |
| `ariaLabel`                 | string  | `'Carousel'`  | Descriptive label for screen readers.       |
| `slideGap`                  | number  | `0`           | Gap between slides in pixels.               |
| `axis`                      | string  | `'x'`         | Carousel axis direction (`'x'` for horizontal, `'y'` for vertical). |
| `direction`                 | string  | `'ltr'`       | Carousel item direction: `'ltr'` (left-to-right) or `'rtl'` (right-to-left). |
| `slidesToScroll`            | number  | `1`           | Number of slides to scroll per navigation action. |

---


## Styling & Customization

Easily theme the carousel using CSS variables or block supports. Navigation blocks support color, spacing, and border controls in the editor.

### CSS Variables

#### Core
| Variable | Description |
| :--- | :--- |
| `--rt-carousel-gap` | Controlled by the `slideGap` attribute. Applied as margin to slides. |
| `--rt-carousel-slide-width` | Controls the width of each slide. Defaults to 100% or set by column variants. |

#### Controls
| Variable                             | Default                               | Description                 |
| ------------------------------------ | ------------------------------------- | --------------------------- |
| `--rt-carousel-control-bg`           | `unset`                               | Background color of buttons |
| `--rt-carousel-control-color`        | `inherit`                             | Icon color                  |
| `--rt-carousel-control-size`         | `2.5rem`                              | Width/Height of buttons     |
| `--rt-carousel-control-padding`      | `0.5rem`                              | Padding inside buttons      |
| `--rt-carousel-control-border`       | `1.25px solid rgba(28, 28, 28, 0.3)`  | Border style                |
| `--rt-carousel-control-radius`       | `1rem`                                | Border radius               |
| `--rt-carousel-control-bg-hover`     | `rgba(248, 248, 248, 1)`              | Background on hover         |
| `--rt-carousel-control-border-hover` | `1.25px solid rgba(28, 28, 28, 0.75)` | Border on hover             |
| `--rt-carousel-control-color-hover`  | `inherit`                             | Icon color on hover         |

#### Dots
| Variable                         | Default               | Description            |
| -------------------------------- | --------------------- | ---------------------- |
| `--rt-carousel-dots-gap`         | `0.5rem`              | Gap between dots       |
| `--rt-carousel-dot-size`         | `0.5rem`              | Size of inactive dots  |
| `--rt-carousel-dot-color`        | `rgb(221, 221, 221)`  | Color of inactive dots |
| `--rt-carousel-dot-radius`       | `50%`                 | Shape of the dots      |
| `--rt-carousel-dot-border`       | `none`                | Border style for dots  |
| `--rt-carousel-dot-active-size`  | `0.75rem`             | Size of active dot     |
| `--rt-carousel-dot-active-color` | `rgba(28, 28, 28, 1)` | Color of active dot    |

### Overriding Styles

Override variables globally in your theme's stylesheet or via `theme.json`:

**Global CSS (style.css)**
```css
:root {
    --rt-carousel-control-bg: #000000;
    --rt-carousel-dot-active-color: #ff0000;
    --rt-carousel-gap: 20px;
}
```

**Theme.json**
```json
{
    "styles": {
        "blocks": {
            "carousel-system/carousel": {
                "css": "--rt-carousel-control-bg: #000000;"
            }
        }
    }
}
```

---


## Accessibility

Fully adheres to W3C accessibility patterns:
- **Landmarks**: Parent uses `role="region"` and customizable `aria-label`.
- **Dynamic Labels**: Navigation dots generate unique labels (e.g., "Go to slide 1").
- **Slide Roles**: Each slide uses `role="group"` and `aria-roledescription="slide"`.
- **Keyboard Navigation**: Arrow keys and tab order supported.

---


## Using Query Loop with Carousel

Create dynamic post sliders or content carousels using the WordPress Query Loop block:

### Setup
1. Add the Carousel block to your page.
2. Select the inner Carousel Viewport block.
3. Insert a Query Loop block inside the Viewport (instead of Carousel Slide).
4. Configure your query (post type, category, order, etc). Disable "Inherit query from template" for single posts/pages.
5. Design your slide inside the Query Loop's Post Template.

**Note:** Each post generated by the Query Loop becomes an individual slide. The system automatically detects `.wp-block-post-template` and forces horizontal flex row display. The `slideGap` attribute controls spacing.

### When to Use Which Block?

| Use Case | Recommended Block |
| :--- | :--- |
| Dynamic Content (Posts, Pages, Products, Custom Post Types) | Query Loop (`core/query`) |
| Static Content (Hero Slider, Logo Showcase, Manual Testimonials) | Carousel Slide (`carousel-system/carousel-slide`) |
| Mixed Content (Slide 1 is a Video, Slide 2 is Text) | Carousel Slide (`carousel-system/carousel-slide`) |

---


## Developer Notes

### Carousel Dots Implementation
The Carousel Dots block demonstrates a pattern for iterating over data with the Interactivity API:
1. Data Source: `context.scrollSnaps` is populated in `view.ts` by mapping Embla's snap list to objects: `[{ index: 0 }, { index: 1 }, ...]`.
2. The Loop:
    ```html
    <template data-wp-each--snap="context.scrollSnaps">
      <button data-wp-class--is-active="callbacks.isDotActive" ... />
    </template>
    ```
    The `--snap` suffix names the iterator variable.
3. Why Objects? The Interactivity API's loop directive does not expose a separate `index` variable. To check if a dot is active (`selectedIndex === currentDotIndex`), include the index explicitly inside the data object (`context.snap.index`).

### Editor Interactivity: Find & Bind Strategy
Gutenberg's InnerBlocks can isolate React Contexts, causing state sync issues between parent and deeply nested children. To guarantee reliable interactivity in the editor:
1. Attach: The Viewport component attaches the vanilla Embla instance directly to its DOM node using a Symbol key: `element[Symbol.for("carousel-system.carousel")] = embla`.
2. Find: Child components (Controls/Dots) attempt to find the API via Context first. If missing, they traverse the DOM up to the common wrapper (`.rt-carousel`) and then search for the sibling `.embla` viewport.
3. Bind: A retry mechanism (`setTimeout` + `useEffect`) ensures the Viewport has finished initializing before binding listeners.