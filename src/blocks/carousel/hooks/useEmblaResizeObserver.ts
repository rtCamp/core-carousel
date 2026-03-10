import { useEffect } from '@wordpress/element';
import type { EmblaCarouselType } from 'embla-carousel';

/**
 * How long to wait after a resize event before re-initialising Embla.
 * Debouncing avoids unnecessary reInits during continuous resize gestures.
 */
const RESIZE_DEBOUNCE_MS = 200;

/**
 * Observes width changes on the carousel viewport and re-initialises Embla
 * when a meaningful resize is detected (more than 1px change).
 */
export function useEmblaResizeObserver(
	viewportEl: HTMLDivElement | null,
	emblaRef: React.MutableRefObject<EmblaCarouselType | undefined>,
) {
	useEffect( () => {
		if ( ! viewportEl ) {
			return;
		}

		let resizeTimer: ReturnType<typeof setTimeout> | undefined;
		let lastWidth: number | null = null;

		const resizeObserver = new ResizeObserver( ( entries ) => {
			const newWidth = entries[ 0 ]?.contentRect.width ?? 0;
			const previousWidth = lastWidth;

			// Always track the latest width to avoid drift from accumulated small changes.
			lastWidth = newWidth;

			// Skip the first observation — just establish the baseline.
			if ( previousWidth === null ) {
				return;
			}

			// Only reInit if change exceeds threshold.
			if ( Math.abs( newWidth - previousWidth ) <= 1 ) {
				return;
			}

			// Debounce to batch rapid resize events.
			clearTimeout( resizeTimer );
			resizeTimer = setTimeout( () => {
				emblaRef.current?.reInit();
			}, RESIZE_DEBOUNCE_MS );
		} );

		resizeObserver.observe( viewportEl );

		return () => {
			clearTimeout( resizeTimer );
			resizeObserver.disconnect();
		};
	}, [ viewportEl, emblaRef ] );
}
