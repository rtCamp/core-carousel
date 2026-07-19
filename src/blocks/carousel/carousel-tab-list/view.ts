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
