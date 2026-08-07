import React from 'react';
import { render } from '@testing-library/react';
import deprecated, { SaveV200, SaveV203, SaveV210 } from '../deprecated';
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
	it( 'should export a deprecated array with three deprecation entries', () => {
		expect( Array.isArray( deprecated ) ).toBe( true );
		expect( deprecated ).toHaveLength( 3 );
		expect( deprecated[ 0 ].save ).toBe( SaveV210 );
		expect( deprecated[ 1 ].save ).toBe( SaveV203 );
		expect( deprecated[ 2 ].save ).toBe( SaveV200 );
	} );

	it( 'should include all attributes in shared attributes schema across deprecation entries', () => {
		deprecated.forEach( ( entry ) => {
			expect( entry.attributes ).toHaveProperty( 'transition' );
			expect( entry.attributes ).toHaveProperty( 'lazyLoadImages' );
			expect( entry.attributes ).toHaveProperty( 'autoScroll' );
			expect( entry.attributes ).toHaveProperty( 'useTabs' );
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

		it( 'dynamically serializes autoScroll, useTabs, and carouselId when enabled', () => {
			const customAttributes: CarouselAttributes = {
				...mockAttributes,
				useTabs: true,
				autoScroll: true,
				autoScrollSpeed: 3,
				autoScrollDirection: 'backward',
				autoScrollStartDelay: 500,
				autoScrollStopOnInteraction: false,
				autoScrollStopOnMouseEnter: true,
				carouselId: 'my-custom-carousel',
			};

			const { container } = render( <SaveV210 attributes={ customAttributes } /> );
			const wrapper = container.querySelector( '.rt-carousel' );

			expect( wrapper?.getAttribute( 'data-is-tabs' ) ).toBe( 'true' );
			expect( wrapper?.getAttribute( 'aria-roledescription' ) ).toBeNull();

			const rawContext = wrapper?.getAttribute( 'data-wp-context' );
			const parsedContext = JSON.parse( rawContext || '{}' );

			expect( parsedContext.useTabs ).toBe( true );
			expect( parsedContext.carouselId ).toBe( 'my-custom-carousel' );
			expect( parsedContext.options.duration ).toBe( 0 );
			expect( parsedContext.autoScroll ).toEqual( {
				speed: 3,
				direction: 'backward',
				startDelay: 500,
				stopOnInteraction: false,
				stopOnMouseEnter: true,
				stopOnFocusIn: true,
			} );
		} );
	} );
} );
