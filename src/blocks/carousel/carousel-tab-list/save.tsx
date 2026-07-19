import { useBlockProps } from '@wordpress/block-editor';
import type { TabListAttributes } from './types';

export default function Save( { attributes }: { attributes: TabListAttributes } ) {
	const { orientation, labels, activeTabBackgroundColor, activeTabTextColor } = attributes;

	const style: React.CSSProperties = {};
	if ( activeTabBackgroundColor ) {
		( style as Record<string, string> )[ '--rt-tab-active-bg' ] = activeTabBackgroundColor;
	}
	if ( activeTabTextColor ) {
		( style as Record<string, string> )[ '--rt-tab-active-color' ] = activeTabTextColor;
	}

	const blockProps = useBlockProps.save( {
		className: orientation === 'vertical' ? 'is-vertical' : undefined,
		role: 'tablist',
		style,
		'data-wp-interactive': 'rt-carousel/carousel',
		'data-wp-context': JSON.stringify( { dotLabels: labels ?? [] } ),
	} );

	return (
		<div { ...blockProps }>
			<template data-wp-each--snap="context.scrollSnaps">
				<button
					className="wp-block-rt-carousel-carousel-tab-list__tab"
					type="button"
					role="tab"
					data-wp-class--is-active="callbacks.isDotActive"
					data-wp-bind--aria-selected="callbacks.isDotActive"
					data-wp-bind--aria-controls="callbacks.getTabAriaControls"
					data-wp-bind--id="callbacks.getTabId"
					data-wp-on--click="actions.onDotClick"
					data-wp-bind--aria-label="callbacks.getTabLabel"
				>
					<span data-wp-text="callbacks.getKeyFeatureDotText" />
				</button>
			</template>
		</div>
	);
}
