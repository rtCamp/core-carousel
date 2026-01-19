import { useBlockProps, useInnerBlocksProps } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { CarouselSlideAttributes } from "../types";

export default function Edit({
	context,
}: {
	attributes: CarouselSlideAttributes;
	context: { "carousel-system/carousel/allowedSlideBlocks"?: string[] };
}) {
	const allowedBlocks = context["carousel-system/carousel/allowedSlideBlocks"];

	const blockProps = useBlockProps({
		className: "embla__slide",
	});

	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		allowedBlocks:
			allowedBlocks && allowedBlocks.length > 0 ? allowedBlocks : undefined,
		templateLock: false,
	});

	return <div {...innerBlocksProps} />;
}
