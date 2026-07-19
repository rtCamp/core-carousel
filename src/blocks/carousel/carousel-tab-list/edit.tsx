import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
	ColorPalette,
} from '@wordpress/block-editor';
import { PanelBody, SelectControl, BaseControl } from '@wordpress/components';
import { useContext } from '@wordpress/element';
import { EditorCarouselContext } from '../editor-context';
import type { TabListAttributes } from './types';

export default function Edit( {
	attributes,
	setAttributes,
}: {
	attributes: TabListAttributes;
	setAttributes: ( attrs: Partial<TabListAttributes> ) => void;
} ) {
	const { labels, orientation, activeTabBackgroundColor, activeTabTextColor } = attributes;
	const carousel = useContext( EditorCarouselContext );
	const dotCount = Math.max( carousel.scrollSnaps.length, 1 );

	const style: React.CSSProperties = {};
	if ( activeTabBackgroundColor ) {
		( style as Record<string, string> )[ '--rt-tab-active-bg' ] = activeTabBackgroundColor;
	}
	if ( activeTabTextColor ) {
		( style as Record<string, string> )[ '--rt-tab-active-color' ] = activeTabTextColor;
	}

	const blockProps = useBlockProps( {
		className: orientation === 'vertical' ? 'is-vertical' : undefined,
		style,
	} );

	const setLabelAt = ( index: number, value: string ) => {
		const next = [ ...labels ];
		while ( next.length <= index ) {
			next.push( '' );
		}
		next[ index ] = value;
		setAttributes( { labels: next } );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'rt-carousel' ) }>
					<SelectControl
						label={ __( 'Orientation', 'rt-carousel' ) }
						value={ orientation }
						options={ [
							{ label: __( 'Horizontal', 'rt-carousel' ), value: 'horizontal' },
							{ label: __( 'Vertical', 'rt-carousel' ), value: 'vertical' },
						] }
						onChange={ ( value ) =>
							setAttributes( {
								orientation: value as TabListAttributes[ 'orientation' ],
							} )
						}
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Active Tab Colours', 'rt-carousel' ) }
					initialOpen={ false }
				>
					<BaseControl label={ __( 'Background', 'rt-carousel' ) }>
						<ColorPalette
							value={ activeTabBackgroundColor }
							onChange={ ( color ) =>
								setAttributes( { activeTabBackgroundColor: color ?? '' } )
							}
						/>
					</BaseControl>
					<BaseControl label={ __( 'Text', 'rt-carousel' ) }>
						<ColorPalette
							value={ activeTabTextColor }
							onChange={ ( color ) =>
								setAttributes( { activeTabTextColor: color ?? '' } )
							}
						/>
					</BaseControl>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				{ Array.from( { length: dotCount } ).map( ( _, index ) => (
					<RichText
						key={ index }
						tagName="span"
						className={ `wp-block-rt-carousel-carousel-tab-list__tab${ index === carousel.selectedIndex ? ' is-active' : '' }` }
						value={ labels[ index ] ?? '' }
						onChange={ ( value ) => setLabelAt( index, value ) }
						/* translators: %d: tab number */
						placeholder={ sprintf( __( 'Tab %d', 'rt-carousel' ), index + 1 ) }
						allowedFormats={ [] }
					/>
				) ) }
			</div>
		</>
	);
}
