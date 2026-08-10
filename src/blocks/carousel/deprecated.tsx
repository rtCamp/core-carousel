import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { CarouselAttributes } from './types';

/**
 * v2.0.0 save — before a11y announcement fields were added to context
 * and the live-region <span> was appended.
 *
 * @param {Object}             root0            Component props.
 * @param {CarouselAttributes} root0.attributes Block attributes.
 */
function SaveV200( {
	attributes,
}: {
	attributes: CarouselAttributes;
} ) {
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
	} = attributes;

	const context = {
		options: {
			loop,
			dragFree,
			align: carouselAlign,
			containScroll,
			direction,
			axis,
			slidesToScroll: slidesToScroll === 'auto' ? 'auto' : parseInt( slidesToScroll, 10 ),
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
		scrollSnaps: [] as { index: number }[],
		canScrollPrev: false,
		canScrollNext: false,
		scrollProgress: 0,
		slideCount: 0,
		/* translators: %d: slide number */
		ariaLabelPattern: __( 'Go to slide %d', 'rt-carousel' ),
	};

	const blockProps = useBlockProps.save( {
		className: 'rt-carousel',
		role: 'region',
		'aria-roledescription': 'carousel',
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

	const innerBlocksProps = useInnerBlocksProps.save( blockProps ) as ReturnType<
		typeof useInnerBlocksProps.save
	> & {
		children: React.ReactNode;
	};

	return <div { ...innerBlocksProps } />;
}

/**
 * v2.0.3 save — before the `transition` (slide/fade) attribute was added
 * to context.
 *
 * @param {Object}             root0            Component props.
 * @param {CarouselAttributes} root0.attributes Block attributes.
 */
function SaveV203( {
	attributes,
}: {
	attributes: CarouselAttributes;
} ) {
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
	} = attributes;

	const context = {
		options: {
			loop,
			dragFree,
			align: carouselAlign,
			containScroll,
			direction,
			axis,
			slidesToScroll: slidesToScroll === 'auto' ? 'auto' : parseInt( slidesToScroll, 10 ),
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
		scrollSnaps: [] as { index: number }[],
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
	};

	const blockProps = useBlockProps.save( {
		className: 'rt-carousel',
		role: 'region',
		'aria-roledescription': 'carousel',
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

	const innerBlocksProps = useInnerBlocksProps.save( blockProps ) as ReturnType<
		typeof useInnerBlocksProps.save
	> & {
		children: React.ReactNode;
	};
	const { children, ...wrapperProps } = innerBlocksProps;
	const announcementLiveRegion = (
		<span
			className="screen-reader-text"
			role="status"
			aria-live="polite"
			aria-atomic="true"
			data-wp-text="context.announcement"
		/>
	);

	return (
		<div { ...wrapperProps }>
			{ children }
			{ announcementLiveRegion }
		</div>
	);
}

/**
 * v2.1.0 save — before `transition` was added to context,
 * but after `autoScroll` and `useTabs` fields were added.
 *
 * @param {Object}             root0            Component props.
 * @param {CarouselAttributes} root0.attributes Block attributes.
 */
function SaveV210( {
	attributes,
}: {
	attributes: CarouselAttributes;
} ) {
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
		useTabs = false,
		autoScroll,
		autoScrollSpeed,
		autoScrollDirection,
		autoScrollStartDelay,
		autoScrollStopOnInteraction,
		autoScrollStopOnMouseEnter,
	} = attributes;

	const context = {
		options: {
			loop,
			dragFree,
			align: carouselAlign,
			containScroll,
			direction,
			axis,
			slidesToScroll: slidesToScroll === 'auto' ? 'auto' : parseInt( slidesToScroll, 10 ),
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
		scrollSnaps: [] as { index: number }[],
		canScrollPrev: false,
		canScrollNext: false,
		scrollProgress: 0,
		slideCount: 0,
		// Un-translated pattern to keep saved block markup consistent across translations
		ariaLabelPattern: 'Go to slide %d',
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
		autoScroll: autoScroll
			? {
				speed: autoScrollSpeed,
				direction: autoScrollDirection,
				startDelay: autoScrollStartDelay,
				stopOnInteraction: autoScrollStopOnInteraction,
				stopOnMouseEnter: autoScrollStopOnMouseEnter,
				stopOnFocusIn: true,
			}
			: false,
		useTabs,
		carouselId: '', // Set at runtime by initCarousel in view.ts
	};

	const blockProps = useBlockProps.save( {
		className: 'rt-carousel',
		role: 'region',
		...( ! useTabs ? { 'aria-roledescription': 'carousel' } : {} ),
		'aria-label': ariaLabel,
		dir: direction,
		'data-axis': axis,
		'data-loop': loop ? 'true' : undefined,
		...( useTabs ? { 'data-is-tabs': 'true' } : {} ),
		'data-wp-interactive': 'rt-carousel/carousel',
		'data-wp-context': JSON.stringify( context ),
		'data-wp-init': 'callbacks.initCarousel',
		style: {
			'--rt-carousel-gap': `${ slideGap }px`,
			'--rt-carousel-height': axis === 'y' ? height : undefined,
		} as React.CSSProperties,
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps ) as ReturnType<
		typeof useInnerBlocksProps.save
	> & {
		children: React.ReactNode;
	};
	const { children, ...wrapperProps } = innerBlocksProps;
	const announcementLiveRegion = (
		<span
			className="screen-reader-text"
			role="status"
			aria-live="polite"
			aria-atomic="true"
			data-wp-text="context.announcement"
		/>
	);

	return (
		<div { ...wrapperProps }>
			{ children }
			{ announcementLiveRegion }
		</div>
	);
}

const sharedAttributes = {
	allowedSlideBlocks: { type: 'array' as const, default: [] },
	transition: { type: 'string' as const, default: 'slide' },
	loop: { type: 'boolean' as const, default: false },
	dragFree: { type: 'boolean' as const, default: false },
	carouselAlign: { type: 'string' as const, default: 'start' },
	containScroll: { type: 'string' as const, default: 'trimSnaps' },
	direction: { type: 'string' as const, default: 'ltr' },
	axis: { type: 'string' as const, default: 'x' },
	height: { type: 'string' as const, default: '300px' },
	autoplay: { type: 'boolean' as const, default: false },
	autoplayDelay: { type: 'number' as const, default: 4000 },
	autoplayStopOnInteraction: { type: 'boolean' as const, default: true },
	autoplayStopOnMouseEnter: { type: 'boolean' as const, default: false },
	ariaLabel: { type: 'string' as const, default: 'Carousel' },
	slideGap: { type: 'number' as const, default: 0 },
	slidesToScroll: { type: 'string' as const, default: '1' },
	lazyLoadImages: { type: 'boolean' as const, default: true },
	autoScroll: { type: 'boolean' as const, default: false },
	autoScrollSpeed: { type: 'number' as const, default: 2 },
	autoScrollDirection: { type: 'string' as const, default: 'forward' },
	autoScrollStartDelay: { type: 'number' as const, default: 1000 },
	autoScrollStopOnInteraction: { type: 'boolean' as const, default: true },
	autoScrollStopOnMouseEnter: { type: 'boolean' as const, default: false },
	useTabs: { type: 'boolean' as const, default: false },
	carouselId: { type: 'string' as const, default: '' },
};

const sharedSupports = {
	interactivity: true,
	align: [ 'wide', 'full' ],
	html: false,
	color: {
		text: false,
		background: true,
	},
};

const deprecated = [
	{
		attributes: sharedAttributes,
		supports: sharedSupports,
		save: SaveV210,
	},
	{
		attributes: sharedAttributes,
		supports: sharedSupports,
		save: SaveV203,
	},
	{
		attributes: sharedAttributes,
		supports: sharedSupports,
		save: SaveV200,
	},
];

export { SaveV200, SaveV203, SaveV210 };
export default deprecated;
