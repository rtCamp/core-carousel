/**
 * Block variations for the Carousel block.
 */
import { __ } from '@wordpress/i18n';
import type { BlockVariation } from '@wordpress/blocks';
import {
	BlankIcon,
	TwoColumnsIcon,
	ThreeColumnsIcon,
	TestimonialIcon,
	LogoIcon,
	QueryLoopIcon,
} from './icons';
import type { CarouselAttributes } from './types';

/**
 * Block variations for the Carousel block.
 * These appear in the BlockVariationPicker when inserting a new carousel.
 */
const variations: BlockVariation<Partial<CarouselAttributes>>[] = [
	{
		name: 'blank',
		title: __( 'Blank', 'carousel-kit' ),
		description: __( 'Start with an empty carousel.', 'carousel-kit' ),
		icon: BlankIcon,
		isDefault: true,
		scope: [ 'block' ],
		attributes: {},
		innerBlocks: [
			[ 'carousel-kit/carousel-viewport', {}, [
				[ 'carousel-kit/carousel-slide', {} ],
			] ],
			[ 'carousel-kit/carousel-controls', {} ],
		],
	},
	{
		name: 'two-columns',
		title: __( '2 Columns', 'carousel-kit' ),
		description: __( 'Two slides visible at a time (50% each).', 'carousel-kit' ),
		icon: TwoColumnsIcon,
		scope: [ 'block' ],
		attributes: {
			className: 'is-style-columns-2',
		},
		innerBlocks: [
			[ 'carousel-kit/carousel-viewport', {}, [
				[ 'carousel-kit/carousel-slide', {} ],
				[ 'carousel-kit/carousel-slide', {} ],
				[ 'carousel-kit/carousel-slide', {} ],
			] ],
			[ 'carousel-kit/carousel-controls', {} ],
		],
	},
	{
		name: 'three-columns',
		title: __( '3 Columns', 'carousel-kit' ),
		description: __( 'Three slides visible at a time (33% each).', 'carousel-kit' ),
		icon: ThreeColumnsIcon,
		scope: [ 'block' ],
		attributes: {
			className: 'is-style-columns-3',
		},
		innerBlocks: [
			[ 'carousel-kit/carousel-viewport', {}, [
				[ 'carousel-kit/carousel-slide', {} ],
				[ 'carousel-kit/carousel-slide', {} ],
				[ 'carousel-kit/carousel-slide', {} ],
				[ 'carousel-kit/carousel-slide', {} ],
			] ],
			[ 'carousel-kit/carousel-controls', {} ],
		],
	},
	{
		name: 'testimonial',
		title: __( 'Testimonial', 'carousel-kit' ),
		description: __( 'Customer testimonials with centered alignment.', 'carousel-kit' ),
		icon: TestimonialIcon,
		scope: [ 'block' ],
		attributes: {
			loop: true,
			carouselAlign: 'center',
			autoplay: true,
			ariaLabel: __( 'Customer Testimonials', 'carousel-kit' ),
			slideGap: 32,
		},
		innerBlocks: [
			[ 'core/heading', {
				textAlign: 'center',
				level: 2,
				content: __( 'What Our Customers Say', 'carousel-kit' ),
				fontSize: 'x-large',
			} ],
			[ 'carousel-kit/carousel-viewport', {}, [
				[ 'carousel-kit/carousel-slide', {}, [
					[ 'core/group', {
						style: { spacing: { padding: { top: '2rem', bottom: '2rem', left: '2rem', right: '2rem' } } },
						backgroundColor: 'base',
						layout: { type: 'constrained', contentSize: '600px' },
					}, [
						[ 'core/paragraph', {
							align: 'center',
							fontSize: 'large',
							content: __( '"This product changed my workflow completely. Highly recommended!"', 'carousel-kit' ),
						} ],
						[ 'core/separator', { className: 'is-style-wide' } ],
						[ 'core/paragraph', {
							align: 'center',
							content: '<strong>Sarah Johnson</strong><br>CEO, Tech Corp',
						} ],
					] ],
				] ],
				[ 'carousel-kit/carousel-slide', {}, [
					[ 'core/group', {
						style: { spacing: { padding: { top: '2rem', bottom: '2rem', left: '2rem', right: '2rem' } } },
						backgroundColor: 'base',
						layout: { type: 'constrained', contentSize: '600px' },
					}, [
						[ 'core/paragraph', {
							align: 'center',
							fontSize: 'large',
							content: __( '"Excellent support and amazing features. Worth every penny!"', 'carousel-kit' ),
						} ],
						[ 'core/separator', { className: 'is-style-wide' } ],
						[ 'core/paragraph', {
							align: 'center',
							content: '<strong>Michael Chen</strong><br>Designer, Creative Studio',
						} ],
					] ],
				] ],
				[ 'carousel-kit/carousel-slide', {}, [
					[ 'core/group', {
						style: { spacing: { padding: { top: '2rem', bottom: '2rem', left: '2rem', right: '2rem' } } },
						backgroundColor: 'base',
						layout: { type: 'constrained', contentSize: '600px' },
					}, [
						[ 'core/paragraph', {
							align: 'center',
							fontSize: 'large',
							content: __( '"Simple, elegant, and powerful. Best investment we made!"', 'carousel-kit' ),
						} ],
						[ 'core/separator', { className: 'is-style-wide' } ],
						[ 'core/paragraph', {
							align: 'center',
							content: '<strong>Emma Williams</strong><br>Marketing Director, Brand Co',
						} ],
					] ],
				] ],
			] ],
			[ 'carousel-kit/carousel-dots', {} ],
			[ 'carousel-kit/carousel-controls', {} ],
		],
	},
	{
		name: 'logo-showcase',
		title: __( 'Logo Showcase', 'carousel-kit' ),
		description: __( 'Display partner or client logos.', 'carousel-kit' ),
		icon: LogoIcon,
		scope: [ 'block' ],
		attributes: {
			loop: true,
			autoplayStopOnInteraction: false,
			ariaLabel: __( 'Partner Logos', 'carousel-kit' ),
			className: 'is-style-columns-3',
		},
		innerBlocks: [
			[ 'core/heading', {
				textAlign: 'center',
				level: 2,
				content: __( 'Trusted By Leading Companies', 'carousel-kit' ),
				style: { spacing: { margin: { bottom: '69px' } } },
			} ],
			[ 'carousel-kit/carousel-viewport', {}, [
				[ 'carousel-kit/carousel-slide', {}, [
					[ 'core/image', {
						url: 'https://placehold.co/260x100/e8e8e8/666666?text=Brand+Logo',
						alt: __( 'Partner Logo 1', 'carousel-kit' ),
						width: '200px',
						align: 'center',
						className: 'is-style-rounded',
					} ],
				] ],
				[ 'carousel-kit/carousel-slide', {}, [
					[ 'core/image', {
						url: 'https://placehold.co/260x100/e8e8e8/666666?text=Brand+Logo',
						alt: __( 'Partner Logo 2', 'carousel-kit' ),
						width: '200px',
						align: 'center',
						className: 'is-style-rounded',
					} ],
				] ],
				[ 'carousel-kit/carousel-slide', {}, [
					[ 'core/image', {
						url: 'https://placehold.co/260x100/e8e8e8/666666?text=Brand+Logo',
						alt: __( 'Partner Logo 3', 'carousel-kit' ),
						width: '200px',
						align: 'center',
						className: 'is-style-rounded',
					} ],
				] ],
				[ 'carousel-kit/carousel-slide', {}, [
					[ 'core/image', {
						url: 'https://placehold.co/260x100/e8e8e8/666666?text=Brand+Logo',
						alt: __( 'Partner Logo 4', 'carousel-kit' ),
						width: '200px',
						align: 'center',
						className: 'is-style-rounded',
					} ],
				] ],
				[ 'carousel-kit/carousel-slide', {}, [
					[ 'core/image', {
						url: 'https://placehold.co/260x100/e8e8e8/666666?text=Brand+Logo',
						alt: __( 'Partner Logo 5', 'carousel-kit' ),
						width: '200px',
						align: 'center',
						className: 'is-style-rounded',
					} ],
				] ],
			] ],
			[ 'carousel-kit/carousel-controls', {} ],
		],
	},
	{
		name: 'query-loop',
		title: __( 'Query Loop', 'carousel-kit' ),
		description: __( 'Display posts from a query in a carousel.', 'carousel-kit' ),
		icon: QueryLoopIcon,
		scope: [ 'block' ],
		attributes: {
			ariaLabel: __( 'Posts Carousel', 'carousel-kit' ),
			slideGap: 16,
			align: 'wide',
		},
		innerBlocks: [
			[ 'carousel-kit/carousel-viewport', {}, [
				[ 'carousel-kit/carousel-slide', {}, [
					[ 'core/query', {
						queryId: 0,
						query: {
							perPage: 10,
							pages: 0,
							offset: 0,
							postType: 'post',
							order: 'desc',
							orderBy: 'date',
							author: '',
							search: '',
							exclude: [],
							sticky: 'exclude',
							inherit: false,
						},
					}, [
						[ 'core/post-template', {
							layout: { type: 'grid', columnCount: 3 },
						}, [
							[ 'core/group', {
								style: {
									spacing: { padding: { top: '30px', right: '30px', bottom: '30px', left: '30px' } },
									border: { radius: { topLeft: '10px', topRight: '10px', bottomLeft: '10px', bottomRight: '10px' } },
									color: { background: '#f6f6f6' },
								},
								layout: { inherit: false },
							}, [
								[ 'core/post-title', { isLink: true, fontSize: 'x-large' } ],
								[ 'core/post-excerpt', { excerptLength: 10 } ],
								[ 'core/post-date', {} ],
							] ],
						] ],
					] ],
				] ],
			] ],
			[ 'carousel-kit/carousel-controls', {} ],
		],
	},
];

export default variations;
