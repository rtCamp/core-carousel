import { registerBlockType, BlockConfiguration } from "@wordpress/blocks";
import Edit from "./edit";
import Save from "./save";
import metadata from "./block.json";
import { CarouselSlideAttributes } from "../types";

registerBlockType(metadata as BlockConfiguration<CarouselSlideAttributes>, {
	edit: Edit,
	save: Save,
});
