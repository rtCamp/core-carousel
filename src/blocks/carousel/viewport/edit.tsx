import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	BlockControls,
} from '@wordpress/block-editor';
import { Button, PanelBody, ToolbarButton } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import type { CarouselViewportAttributes } from '../types';
import { useContext, useEffect, useRef, useCallback } from '@wordpress/element';
import { useMergeRefs } from '@wordpress/compose';
import { EditorCarouselContext } from '../editor-context';
import EmblaCarousel, { type EmblaCarouselType } from 'embla-carousel';

const EMBLA_KEY = Symbol.for( 'carousel-system.carousel' );

export default function Edit( {
	clientId,
}: {
	clientId: string;
	attributes: CarouselViewportAttributes;
} ) {
	const { setEmblaApi, setCanScrollPrev, setCanScrollNext, carouselOptions } = useContext(
		EditorCarouselContext,
	);

	const blockProps = useBlockProps( {
		className: 'embla',
		style: {
			height: carouselOptions?.axis === 'y' ? carouselOptions?.height : undefined,
		},
	} );

	// Track actual count — used both for the empty-state check and for triggering
	// Embla reInit whenever the number of slides changes.
	const slideCount = useSelect(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( select ) => ( select( 'core/block-editor' ) as any ).getBlockCount( clientId ) as number,
		[ clientId ],
	);

	const hasSlides = slideCount > 0;

	const emblaRef = useRef<HTMLDivElement>( null );
	const ref = useMergeRefs( [ emblaRef, blockProps.ref ] );

	const { insertBlock } = useDispatch( 'core/block-editor' );

	const addSlide = useCallback( () => {
		const block = createBlock( 'carousel-kit/carousel-slide' );
		insertBlock( block, undefined, clientId );
	}, [ insertBlock, clientId ] );

	// Stable renderAppender for the empty state — memoized so useInnerBlocksProps
	// doesn't see a new function reference on every render.
	const EmptyAppender = useCallback(
		() => (
			<div className="carousel-kit-viewport-empty">
				<Button variant="primary" icon={ plus } onClick={ addSlide }>
					{ __( 'Add Slide', 'carousel-kit' ) }
				</Button>
			</div>
		),
		[ addSlide ],
	);

	// No default template — slide creation is handled by the carousel setup flow.
	// When empty, renderAppender shows the "Add Slide" button inside .embla__container
	// (a flex container), keeping it properly contained and at full width.
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'embla__container',
			style: {
				height: carouselOptions?.axis === 'y' ? 'auto' : undefined,
				minHeight: carouselOptions?.axis === 'y' ? '100%' : undefined,
				flexDirection: ( carouselOptions?.axis === 'y' ? 'column' : 'row' ) as React.CSSProperties[ 'flexDirection' ],
			},
		},
		{
			orientation: carouselOptions?.axis === 'y' ? 'vertical' : 'horizontal',
			allowedBlocks: [ 'carousel-kit/carousel-slide', 'core/query' ],
			renderAppender: ! hasSlides ? EmptyAppender : undefined,
		},
	);

	// Rerun whenever the slide count changes (slide added/removed via block inserter,
	// toolbar, or any other mechanism) so Embla re-indexes dots and nav state.
	useEffect( () => {
		const api = emblaRef.current
			? ( emblaRef.current as { [ EMBLA_KEY ]?: EmblaCarouselType } )[ EMBLA_KEY ]
			: null;
		if ( api ) {
			setTimeout( () => api.reInit(), 10 );
		}
	}, [ slideCount ] );

	useEffect( () => {
		if ( ! emblaRef.current ) {
			return;
		}

		let embla: EmblaCarouselType | undefined;
		let observer: MutationObserver | undefined;

		const initEmbla = () => {
			if ( embla ) {
				embla.destroy();
			}

			const queryLoopContainer = emblaRef.current?.querySelector(
				'.wp-block-post-template',
			) as HTMLElement;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const options = carouselOptions as any;

			embla = EmblaCarousel( emblaRef.current!, {
				loop: options?.loop ?? false,
				dragFree: options?.dragFree ?? false,
				containScroll: options?.containScroll || 'trimSnaps',
				axis: options?.axis || 'x',
				align: options?.align || 'start',
				direction: options?.direction || 'ltr',
				slidesToScroll: options?.slidesToScroll || 1,
				container: queryLoopContainer || undefined,
			} );

			( emblaRef.current as { [EMBLA_KEY]?: typeof embla } )[ EMBLA_KEY ] = embla;

			const onSelect = () => {
				const canPrev = embla!.canScrollPrev();
				const canNext = embla!.canScrollNext();
				setCanScrollPrev( canPrev );
				setCanScrollNext( canNext );
			};

			embla.on( 'select', onSelect );
			embla.on( 'reInit', onSelect );

			requestAnimationFrame( () => {
				onSelect();
			} );

			setEmblaApi( embla );
		};

		initEmbla();

		if ( emblaRef.current ) {
			observer = new MutationObserver( ( mutations ) => {
				let shouldReInit = false;

				for ( const mutation of mutations ) {
					const target = mutation.target as HTMLElement;

					if ( target.classList.contains( 'wp-block-post-template' ) ) {
						shouldReInit = true;
						break;
					}

					if (
						mutation.addedNodes.length > 0 &&
						( target.querySelector( '.wp-block-post-template' ) ||
							Array.from( mutation.addedNodes ).some(
								( node ) =>
									node instanceof HTMLElement &&
									node.classList.contains( 'wp-block-post-template' ),
							) )
					) {
						shouldReInit = true;
						break;
					}
				}

				if ( shouldReInit ) {
					setTimeout( initEmbla, 10 );
				}
			} );

			observer.observe( emblaRef.current, {
				childList: true,
				subtree: true,
			} );
		}

		return () => {
			if ( embla ) {
				embla.destroy();
			}
			if ( observer ) {
				observer.disconnect();
			}
			if ( emblaRef.current ) {
				delete ( emblaRef.current as { [EMBLA_KEY]?: typeof embla } )[
					EMBLA_KEY
				];
			}
		};
	}, [ setEmblaApi, setCanScrollPrev, setCanScrollNext, carouselOptions ] );

	return (
		<>
			<BlockControls>
				<ToolbarButton
					icon={ plus }
					label={ __( 'Add Slide', 'carousel-kit' ) }
					onClick={ addSlide }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Viewport Actions', 'carousel-kit' ) }>
					<Button variant="secondary" onClick={ addSlide } icon={ plus }>
						{ __( 'Add Slide', 'carousel-kit' ) }
					</Button>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps } ref={ ref }>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
