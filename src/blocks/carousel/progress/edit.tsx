import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { useContext } from '@wordpress/element';
import { EditorCarouselContext } from '../editor-context';

export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'carousel-kit-progress',
	} );

	const { scrollProgress, slideCount } = useContext( EditorCarouselContext ) as { scrollProgress?: number, slideCount?: number };

	// Hide if only one slide
	if (slideCount === 1) return null;

	return (
		<div { ...blockProps }>
			<div
				className="carousel-kit-progress__bar"
				role="progressbar"
				aria-label={ __( 'Carousel progress', 'carousel-kit' ) }
				aria-valuenow={ Math.round((scrollProgress || 0) * 100) }
				aria-valuemin={0}
				aria-valuemax={100}
				style={ {
					width: `${ ( scrollProgress || 0 ) * 100 }%`,
				} }
			/>
		</div>
	);
}
