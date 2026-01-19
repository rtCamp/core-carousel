import { useBlockProps } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { useContext, useRef } from "@wordpress/element";
import { EditorCarouselContext } from "../editor-context";
import { NextIcon, PreviousIcon } from "./components/icons";
import type { EmblaCarouselType } from "embla-carousel";

const EMBLA_KEY = Symbol.for("carousel-system.carousel");

export default function Edit() {
	const blockProps = useBlockProps({
		className: "rt-carousel-controls",
	});

	// Consume state directly from Context (managed by Viewport)
	const {
		emblaApi: contextApi,
	} = useContext(EditorCarouselContext);
	const ref = useRef<HTMLDivElement>(null);

	const getEmblaFromDOM = () => {
		if (!ref.current) return null;
		const wrapper = ref.current.closest(".rt-carousel");
		if (!wrapper) return null;
		const viewport = wrapper.querySelector(".embla");
		if (!viewport) return null;

		return (viewport as { [EMBLA_KEY]?: EmblaCarouselType })[EMBLA_KEY] ?? null;
	};

	const handleScroll = (direction: "prev" | "next") => {
		const api = contextApi || getEmblaFromDOM();
		if (api) {
			if (direction === "prev") api.scrollPrev();
			else api.scrollNext();
		}
	};

	return (
		<div {...blockProps} ref={ref}>
			<button
				className="rt-carousel-controls__btn"
				onClick={(e) => {
					e.stopPropagation();
					handleScroll("prev");
				}}
				type="button"
				aria-label={__("Previous Slide", "carousel-system-interactivity-api")}
			>
				<PreviousIcon />
			</button>
			<button
				className="rt-carousel-controls__btn"
				onClick={(e) => {
					e.stopPropagation();
					handleScroll("next");
				}}
				type="button"
				aria-label={__("Next Slide", "carousel-system-interactivity-api")}
			>
				<NextIcon />
			</button>
		</div>
	);
}
