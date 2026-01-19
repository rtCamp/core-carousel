import { registerBlockType, BlockConfiguration } from "@wordpress/blocks";
import Edit from "./edit";
import Save from "./save";
import metadata from "./block.json";
import { CarouselControlsAttributes } from "../types";
import "./style.scss";

registerBlockType(metadata as BlockConfiguration<CarouselControlsAttributes>, {
	edit: Edit,
	save: Save,
});
