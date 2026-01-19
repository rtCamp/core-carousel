import { registerBlockType, BlockConfiguration } from "@wordpress/blocks";
import Edit from "./edit";
import Save from "./save";
import metadata from "./block.json";
import { CarouselDotsAttributes } from "../types";
import "./style.scss";

registerBlockType(metadata as BlockConfiguration<CarouselDotsAttributes>, {
	edit: Edit,
	save: Save,
});
