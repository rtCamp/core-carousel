import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	InspectorAdvancedControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	ToggleControl,
	SelectControl,
	FormTokenField,
	BaseControl,
	TextControl,
	RangeControl,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useMemo } from '@wordpress/element';
import type { CarouselAttributes } from './types';
import {
	type BlockConfiguration,
	type BlockVariation,
	type InnerBlockTemplate,
	createBlocksFromInnerBlocksTemplate,
	store as blocksStore,
} from '@wordpress/blocks';
import { EditorCarouselContext } from './editor-context';
import type { EmblaCarouselType } from 'embla-carousel';

// @ts-expect-error -- __experimentalBlockVariationPicker is not exported in types
import { __experimentalBlockVariationPicker as BlockVariationPicker } from '@wordpress/block-editor';

const DEFAULT_TEMPLATE: InnerBlockTemplate[] = [
	[ 'carousel-kit/carousel-viewport', {}, [
		[ 'carousel-kit/carousel-slide', {} ],
	] ],
	[ 'carousel-kit/carousel-controls', {} ],
];

export default function Edit( {
	attributes,
	setAttributes,
	clientId,
}: {
	attributes: CarouselAttributes;
	setAttributes: ( attrs: Partial<CarouselAttributes> ) => void;
	clientId: string;
} ) {
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
	} = attributes;

	const [ emblaApi, setEmblaApi ] = useState<EmblaCarouselType | undefined>();
	const [ canScrollPrev, setCanScrollPrev ] = useState( false );
	const [ canScrollNext, setCanScrollNext ] = useState( false );

	// Fetch all registered block types for suggestions, inner blocks state, and variations
	const { blockTypes, hasInnerBlocks, variations } = useSelect( ( select ) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const blocksStoreSelectors = select( blocksStore ) as any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const blockEditorSelectors = select( blockEditorStore ) as any;
		const innerBlocks = blockEditorSelectors.getBlocks( clientId );

		return {
			blockTypes: blocksStoreSelectors.getBlockTypes() as BlockConfiguration[],
			hasInnerBlocks: innerBlocks.length > 0,
			variations: blocksStoreSelectors.getBlockVariations( 'carousel-kit/carousel', 'block' ) as BlockVariation<Partial<CarouselAttributes>>[],
		};
	}, [ clientId ] );

	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	const suggestions = blockTypes?.map( ( block ) => block.name ) || [];

	const blockProps = useBlockProps( {
		className: 'carousel-kit',
		dir: direction,
		'data-axis': axis,
		'data-loop': loop ? 'true' : undefined,
		style: {
			'--carousel-kit-gap': `${ attributes.slideGap }px`,
			'--carousel-kit-height': axis === 'y' ? height : undefined,
		} as React.CSSProperties,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {} );

	// Memoize carouselOptions separately to prevent excessive viewport reinitializations
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
		} ),
		[ loop, dragFree, carouselAlign, containScroll, direction, axis, height, slidesToScroll ],
	);

	// Memoize the context value to prevent infinite re-renders in children
	// Note: setState functions are stable and don't need to be in dependencies
	const contextValue = useMemo(
		() => ( {
			emblaApi,
			setEmblaApi,
			canScrollPrev,
			setCanScrollPrev,
			canScrollNext,
			setCanScrollNext,
			carouselOptions,
		} ),
		[
			emblaApi,
			canScrollPrev,
			canScrollNext,
			carouselOptions,
			setEmblaApi,
			setCanScrollPrev,
			setCanScrollNext,
		],
	);

	/**
	 * Handle variation selection from the picker.
	 */
	const onSelectVariation = ( variation?: BlockVariation<Partial<CarouselAttributes>> ) => {
		if ( variation?.attributes ) {
			setAttributes( variation.attributes );
		}

		const innerBlocksTemplate = ( variation?.innerBlocks ?? DEFAULT_TEMPLATE ) as InnerBlockTemplate[];
		const newInnerBlocks = createBlocksFromInnerBlocksTemplate( innerBlocksTemplate );
		replaceInnerBlocks?.( clientId, newInnerBlocks );
	};

	// Show variation picker when block has no content
	if ( ! hasInnerBlocks && variations ) {
		return (
			<div { ...blockProps }>
				<BlockVariationPicker
					icon="slides"
					label={ __( 'Carousel', 'carousel-kit' ) }
					instructions={ __( 'Select a carousel layout to start with.', 'carousel-kit' ) }
					variations={ variations }
					onSelect={ onSelectVariation }
					allowSkip
				/>
			</div>
		);
	}

	return (
		<EditorCarouselContext.Provider value={ contextValue }>
			<InspectorControls>
				<PanelBody title={ __( 'Carousel Settings', 'carousel-kit' ) }>
					<ToggleControl
						label={ __( 'Loop', 'carousel-kit' ) }
						checked={ loop }
						onChange={ ( value ) => setAttributes( { loop: value } ) }
						help={ __(
							'Infinite scrolling of slides (Frontend only). Disabled in editor for stability.',
							'carousel-kit',
						) }
					/>
					<ToggleControl
						label={ __( 'Free Drag', 'carousel-kit' ) }
						checked={ dragFree }
						onChange={ ( value ) => setAttributes( { dragFree: value } ) }
						help={ __( 'Enables momentum scrolling.', 'carousel-kit' ) }
					/>
					<SelectControl
						label={ __( 'Alignment', 'carousel-kit' ) }
						value={ carouselAlign }
						options={ [
							{ label: __( 'Start', 'carousel-kit' ), value: 'start' },
							{ label: __( 'Center', 'carousel-kit' ), value: 'center' },
							{ label: __( 'End', 'carousel-kit' ), value: 'end' },
						] }
						onChange={ ( value ) =>
							setAttributes( {
								carouselAlign: value as CarouselAttributes['carouselAlign'],
							} )
						}
					/>
					<SelectControl
						label={ __( 'Contain Scroll', 'carousel-kit' ) }
						value={ containScroll }
						options={ [
							{ label: __( 'Trim Snaps', 'carousel-kit' ), value: 'trimSnaps' },
							{ label: __( 'Keep Snaps', 'carousel-kit' ), value: 'keepSnaps' },
							{ label: __( 'None', 'carousel-kit' ), value: '' },
						] }
						onChange={ ( value ) =>
							setAttributes( {
								containScroll: value as CarouselAttributes['containScroll'],
							} )
						}
						help={ __(
							'Prevents excess scrolling at the beginning or end.',
							'carousel-kit',
						) }
					/>
					<ToggleControl
						label={ __( 'Scroll Auto', 'carousel-kit' ) }
						checked={ slidesToScroll === 'auto' }
						onChange={ ( isAuto ) => setAttributes( { slidesToScroll: isAuto ? 'auto' : '1' } ) }
						help={ __( 'Scrolls the number of slides currently visible in the viewport.', 'carousel-kit' ) }
					/>
					{ slidesToScroll !== 'auto' && (
						<RangeControl
							label={ __( 'Slides to Scroll', 'carousel-kit' ) }
							value={ parseInt( slidesToScroll, 10 ) || 1 }
							onChange={ ( value ) =>
								setAttributes( { slidesToScroll: ( value || 1 ).toString() } )
							}
							min={ 1 }
							max={ 10 }
						/>
					) }
					<SelectControl
						label={ __( 'Direction', 'carousel-kit' ) }
						value={ direction }
						options={ [
							{ label: __( 'Left to Right (LTR)', 'carousel-kit' ), value: 'ltr' },
							{ label: __( 'Right to Left (RTL)', 'carousel-kit' ), value: 'rtl' },
						] }
						onChange={ ( value ) =>
							setAttributes( {
								direction: value as CarouselAttributes['direction'],
							} )
						}
						help={ __(
							'Choose content direction. RTL is typically used for Arabic, Hebrew, and other right-to-left languages.',
							'carousel-kit',
						) }
					/>
					<SelectControl
						label={ __( 'Orientation', 'carousel-kit' ) }
						value={ axis }
						options={ [
							{ label: __( 'Horizontal', 'carousel-kit' ), value: 'x' },
							{ label: __( 'Vertical', 'carousel-kit' ), value: 'y' },
						] }
						onChange={ ( value ) =>
							setAttributes( {
								axis: value as CarouselAttributes['axis'],
							} )
						}
					/>
					{ axis === 'y' && (
						<TextControl
							label={ __( 'Height', 'carousel-kit' ) }
							value={ height }
							onChange={ ( value ) => setAttributes( { height: value } ) }
							help={ __(
								'Set a fixed height for vertical carousel (e.g., 400px).',
								'carousel-kit',
							) }
						/>
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Autoplay Options', 'carousel-kit' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Enable Autoplay', 'carousel-kit' ) }
						checked={ autoplay }
						onChange={ ( value ) => setAttributes( { autoplay: value } ) }
					/>
					{ autoplay && (
						<>
							<RangeControl
								label={ __( 'Delay (ms)', 'carousel-kit' ) }
								value={ autoplayDelay }
								onChange={ ( value ) =>
									setAttributes( { autoplayDelay: value ?? 1000 } )
								}
								min={ 1000 }
								max={ 10000 }
								step={ 100 }
							/>
							<ToggleControl
								label={ __( 'Stop on Interaction', 'carousel-kit' ) }
								checked={ autoplayStopOnInteraction }
								onChange={ ( value ) =>
									setAttributes( { autoplayStopOnInteraction: value } )
								}
								help={ __(
									'Stop autoplay when user interacts with carousel.',
									'carousel-kit',
								) }
							/>
							<ToggleControl
								label={ __( 'Stop on Mouse Enter', 'carousel-kit' ) }
								checked={ autoplayStopOnMouseEnter }
								onChange={ ( value ) =>
									setAttributes( { autoplayStopOnMouseEnter: value } )
								}
								help={ __(
									'Stop autoplay when mouse hovers over carousel.',
									'carousel-kit',
								) }
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<InspectorAdvancedControls>
				<TextControl
					label={ __( 'ARIA Label', 'carousel-kit' ) }
					value={ ariaLabel }
					onChange={ ( value ) => setAttributes( { ariaLabel: value } ) }
					help={ __(
						"Provide a descriptive label for screen readers (e.g., 'Featured Products').",
						'carousel-kit',
					) }
				/>
				{ /* FormTokenField does not allow "help" prop */ }
				<BaseControl
					help={
						<>
							{ __(
								'Use this to allow only certain blocks in the slide. If empty, all blocks will be allowed.',
								'carousel-kit',
							) }
						</>
					}
				>
					<FormTokenField
						label={ __( 'Allowed Slide Blocks', 'carousel-kit' ) }
						value={ allowedSlideBlocks || [] }
						suggestions={ suggestions as string[] }
						maxSuggestions={ 10 }
						onChange={ ( tokens ) =>
							setAttributes( { allowedSlideBlocks: tokens as string[] } )
						}
						__experimentalValidateInput={ ( value: string ) =>
							suggestions.includes( value )
						}
					/>
				</BaseControl>
			</InspectorAdvancedControls>
			<InspectorControls group="styles">
				<PanelBody title={ __( 'Layout', 'carousel-kit' ) }>
					<RangeControl
						label={ __( 'Slide Gap (px)', 'carousel-kit' ) }
						value={ attributes.slideGap }
						onChange={ ( value ) => setAttributes( { slideGap: value ?? 0 } ) }
						min={ 0 }
						max={ 500 }
						initialPosition={ 0 }
						allowReset
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</EditorCarouselContext.Provider>
	);
}
