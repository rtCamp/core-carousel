import React from 'react';
import { render } from '@testing-library/react';
import deprecated, { SaveV200, SaveV203, SaveV210, SaveV210_NaN, SaveV211, SaveV211_NaN } from '../deprecated';
import type { CarouselAttributes } from '../types';

jest.mock( '@wordpress/block-editor', () => ( {
	useBlockProps: {
		save: ( props: Record<string, unknown> = {} ) => ( {
			className: 'wp-block-rt-carousel-carousel',
			...props,
		} ),
	},
	useInnerBlocksProps: {
		save: ( props: Record<string, unknown> = {} ) => ( {
			...props,
			children: <div data-testid="inner-blocks">Inner Blocks</div>,
		} ),
	},
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

const mockAttributes: CarouselAttributes = {
	transition: 'slide',
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
	ariaLabel: 'Test Carousel',
	slideGap: 0,
	slidesToScroll: '1',
	lazyLoadImages: true,
	autoScroll: false,
	autoScrollSpeed: 2,
	autoScrollDirection: 'forward',
	autoScrollStartDelay: 1000,
	autoScrollStopOnInteraction: true,
	autoScrollStopOnMouseEnter: false,
	useTabs: false,
};

describe( 'Carousel Deprecations', () => {
	it( 'should export a deprecated array with six deprecation entries', () => {
		expect( Array.isArray( deprecated ) ).toBe( true );
		expect( deprecated ).toHaveLength( 6 );
		expect( deprecated[ 0 ].save ).toBe( SaveV211 );
		expect( deprecated[ 1 ].save ).toBe( SaveV211_NaN );
		expect( deprecated[ 2 ].save ).toBe( SaveV210 );
		expect( deprecated[ 3 ].save ).toBe( SaveV210_NaN );
		expect( deprecated[ 4 ].save ).toBe( SaveV203 );
		expect( deprecated[ 5 ].save ).toBe( SaveV200 );
	} );

	it( 'should include all attributes in shared attributes schema across deprecation entries', () => {
		deprecated.forEach( ( entry ) => {
			expect( entry.attributes ).toHaveProperty( 'transition' );
			expect( entry.attributes ).toHaveProperty( 'lazyLoadImages' );
			expect( entry.attributes ).toHaveProperty( 'autoScroll' );
			expect( entry.attributes ).toHaveProperty( 'useTabs' );
		} );
	} );

	describe( 'SaveV211', () => {
		it( 'renders correctly with transition included in raw JSON context', () => {
			const { container } = render( <SaveV211 attributes={ mockAttributes } /> );
			const wrapper = container.querySelector( '.rt-carousel' );

			const rawContext = wrapper?.getAttribute( 'data-wp-context' );
			const parsedContext = JSON.parse( rawContext || '{}' );
			expect( parsedContext.transition ).toBe( 'slide' );
			expect( parsedContext.options ).toBeDefined();
			expect( parsedContext.ariaLabelPattern ).toBe( 'Go to slide %d' );
		} );
	} );

	describe( 'SaveV210', () => {
		it( 'renders correctly without transition but with autoScroll and useTabs in raw JSON context', () => {
			const { container } = render( <SaveV210 attributes={ mockAttributes } /> );
			const wrapper = container.querySelector( '.rt-carousel' );

			const rawContext = wrapper?.getAttribute( 'data-wp-context' );
			const parsedContext = JSON.parse( rawContext || '{}' );

			expect( parsedContext.transition ).toBeUndefined();
			expect( parsedContext.autoScroll ).toBe( false );
			expect( parsedContext.useTabs ).toBe( false );
			expect( parsedContext.carouselId ).toBe( '' );
			expect( parsedContext.ariaLabelPattern ).toBe( 'Go to slide %d' );
		} );
	} );
} );
