# Carousel Block System

A modular, high-performance Carousel block system built with the WordPress Interactivity API and Embla Carousel.

## 🏗 Architecture

The Carousel uses a **Compound Block** architecture to separate concerns and maximize flexibility.

### The Blocks
1.  **`carousel-system/carousel` (Parent)**: The **Controller & Wrapper**. 
    *   **Flexibility**: Allows **any block** to be added inside it (e.g., Headings, Paragraphs, or the Viewport).
    *   **Role**: Handles configuration (attributes), state management, and provides Context to children.
2.  **`carousel-system/carousel-viewport`**: The **View Engine**. 
    *   **Restriction**: Strictly allows only `carousel-system/carousel-slide` as direct children.
    *   **Role**: This is the physical Embla viewport.
3.  **`carousel-system/carousel-controls` / `carousel-system/carousel-dots`**: The **Navigation**.
    *   **Role**: UI components that communicate with the parent state.
4.  **`carousel-system/carousel-slide`**: The **Slide Wrapper**.
    *   **Restriction**: Dynamic. Consumes `allowedSlideBlocks` from the parent to restrict its internal content.

### The "Dual-Engine" Approach
To ensure the best of both worlds (Editor UX vs Frontend Performance), we use different engines:

*   **Frontend**: Zero-hydration. Uses the **WordPress Interactivity API** (`@wordpress/interactivity`) to load a lightweight **Vanilla JS** Embla instance. State is shared via Preact Signals.
*   **Editor**: Standard React. Uses `useEffect` to initialize Embla on the DOM nodes. React Context and DOM traversal bridge the gap between sibling blocks (Viewport & Controls) since Gutenberg InnerBlocks isolate state.

---

## 🔌 Data API (For Consumers)

The Carousel exposes its state via the `carousel-system/carousel` Interactivity API store. Other blocks (like a Progress Bar, Counter, or custom Nav) can consume this data.

### Exposed Context (`CarouselContext`)

| Property           | Type       | Description                                                                                          |
| :----------------- | :--------- | :--------------------------------------------------------------------------------------------------- |
| `isPlaying`        | `boolean`  | `true` if Autoplay is currently running.                                                             |
| `timerIterationId` | `number`   | Increments every time the Autoplay timer resets (slide change). Bind to `key` to restart animations. |
| `autoplay`         | `boolean \| { delay: number; stopOnInteraction: boolean; stopOnMouseEnter: boolean }` | Autoplay config or `false` if disabled.                                                               |
| `canScrollPrev`    | `boolean`  | `true` if there are previous slides (or looping).                                                    |
| `canScrollNext`    | `boolean`  | `true` if there are next slides (or looping).                                                        |
| `selectedIndex`    | `number`   | The zero-based index of the current slide.                                                           |
| `scrollSnaps`      | `{ index: number }[]` | List of snap points (used by Dots block).                                                       |

## 🛠 How to Build a Consumer Block

### 1. Simple Progress Bar (Using Autoplay Data)
You can create a bar that animates while the carousel is auto-playing.

**save.tsx**:
```jsx
<div
    data-wp-interactive="carousel-system/carousel"
    data-wp-bind--key="context.timerIterationId" // Restarts animation on slide change
    data-wp-bind--style="state.barDuration"      // Sets --duration CSS variable
    data-wp-class--is-playing="context.isPlaying"  // Only animate when active
    className="rt-progress-bar"
/>
```

**view.ts**:
```javascript
store('carousel-system/carousel', {
    state: {
        get barDuration() {
            const { autoplay } = getContext();
            return `--duration: ${autoplay?.delay || 4000}ms;`;
        }
    }
});
```

**CSS**:
```css
.rt-progress-bar.is-playing {
    animation: grow var(--duration) linear forwards;
}
@keyframes grow { from { width: 0%; } to { width: 100%; } }
```

### 2. Styling Active Slide Contents
Each slide can react to being the "active" slide using the built-in callback.

**Inside your Slide content (e.g. a Card's save.tsx)**:
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

## 🧩 Patterns & Restrictions

### Creating Restricted Carousels
To create a specialized carousel (e.g., "Testimonials Only"), set the `allowedSlideBlocks` attribute on the **Parent Carousel** block in your pattern.

**How it works:**
1.  **Carousel Wrapper**: Remains flexible (add a "Testimonials" heading here).
2.  **Viewport**: Manages the slides.
3.  **Slide**: Automatically restricts its inner content to the blocks listed in `allowedSlideBlocks`.

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

## ⚙️ Attributes Reference (Parent Block)

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

---

## 🎨 Styling & Customization

The system is designed to be easily themed. Navigation blocks support standard block features and custom CSS variables.

### Block Supports (Editor)
The **Carousel Dots** and **Carousel Controls** blocks expose standard WordPress design tools:
- **Color**: Text, Background, and Gradient settings.
- **Spacing**: Custom Margin and Padding.
- **Borders**: Radius, Color, Width, and Style settings.

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

You can override these variables globally in your theme's stylesheet or via `theme.json`.

#### Option 1: Global CSS (style.css)
```css
:root {
  --rt-carousel-control-bg: #000000;
  --rt-carousel-dot-active-color: #ff0000;
  --rt-carousel-gap: 20px;
}
```

#### Option 2: Theme.json
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

## ⚙️ Accessibility

The Carousel system adheres to W3C accessibility patterns for carousels:
- **Landmarks**: The parent uses `role="region"` with a customizable `aria-label`.
- **Dynamic Labels**: Navigation dots use a computed `callbacks.getDotLabel` to generate unique labels (e.g., "Go to slide 1") on the fly.
- **Slide Roles**: Each slide uses `role="group"` and `aria-roledescription="slide"`.
- **Keyboard Navigation**: Full support for arrow keys and tab order via Embla.

---

## 🚀 How to Use Query Loop with Carousel

The Carousel block has built-in support for the standard WordPress **Query Loop** block (`core/query`). This allows you to easily create a "Post Slider" or "Dynamic Content Carousel" without any custom code.

### Setup Instructions

1.  **Add Carousel**: Insert the **Carousel** block into your page.
2.  **Select Viewport**: Select the inner **Carousel Viewport** block.
3.  **Insert Query Loop**: Instead of adding a "Carousel Slide", insert a **Query Loop** block directly inside the Viewport.
4.  **Configure Query**:
    *   Setup your query as usual (Post Type, Category, Order, etc.).
    *   **Important**: Ensure "Inherit query from template" is **disabled** if you are on a single page/post, otherwise it might only show the current post.
5.  **Design Slide**: Inside the `Post Template` of the Query Loop, add your content (Post Title, Featured Image, Excerpt).
    *   **Note**: Each post generated by the Query Loop will automatically become an individual slide.

### Technical Details
*   The system automatically detects the presence of a `.wp-block-post-template` list inside the viewport.
*   It overrides the default grid/list styles of the Query Loop, forcing the posts to display in a horizontal flex row.
*   The `slideGap` setting from the parent Carousel block still controls the spacing between posts.

### When to use what?

| Use Case | Recommended Block |
| :--- | :--- |
| **Dynamic Content** (Posts, Pages, Products, Custom Post Types) | **Query Loop** (`core/query`) |
| **Static Content** (Hero Slider, Logo Showcase, Manual Testimonials) | **Carousel Slide** (`carousel-system/carousel-slide`) |
| **Mixed Content** (Slide 1 is a Video, Slide 2 is Text) | **Carousel Slide** (`carousel-system/carousel-slide`) |

---

## 💡 Developer Notes

### Carousel Dots Implementation
The **Carousel Dots** block demonstrates a specific pattern for iterating over data with the Interactivity API.

1.  **Data Source**: `context.scrollSnaps` is populated in `view.ts` by mapping Embla's snap list to objects: `[{ index: 0 }, { index: 1 }, ...]`.
2.  **The Loop**:
    ```html
    <template data-wp-each--snap="context.scrollSnaps">
        <button data-wp-class--is-active="callbacks.isDotActive" ... />
    </template>
    ```
    We use the `--snap` suffix to name the iterator variable.
3.  **Why Objects?**: The Interactivity API's loop directive does not currently expose a separate `index` variable (like `i` in a `for` loop). To check if a dot is active (`selectedIndex === currentDotIndex`), we must include the index explicitly inside the data object (`context.snap.index`).

### Editor Interactivity: The "Find & Bind" Strategy
Gutenberg's `InnerBlocks` can isolate React Contexts, causing state synchronization issues between the Parent (Provider) and deeply nested Children (Consumers like Controls/Dots). To guarantee reliable interactivity in the Editor:

1.  **Attach**: The Viewport component attaches the vanilla Embla instance directly to its DOM node using a Symbol key: `element[Symbol.for("carousel-system.carousel")] = embla`.
    *   *Implementation*: [`viewport/edit.tsx`](./viewport/edit.tsx)
2.  **Find**: The Child components (Controls/Dots) attempt to find the API via Context first. If missing, they traverse the DOM up to the common wrapper (`.rt-carousel`) and then search for the sibling `.embla` viewport.
    *   *Implementation*: [`controls/edit.tsx`](./controls/edit.tsx)
3.  **Bind**: We use a retry mechanism (`setTimeout` + `useEffect`) to ensure the Viewport has finished initializing before binding listeners.
    *   *Implementation*: [`dots/edit.tsx`](./dots/edit.tsx)