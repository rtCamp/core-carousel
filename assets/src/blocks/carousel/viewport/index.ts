import { registerBlockType, BlockConfiguration } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import { CarouselViewportAttributes } from '../types';

registerBlockType( metadata as BlockConfiguration<CarouselViewportAttributes>, {
	edit: Edit,
	save: Save,
} );