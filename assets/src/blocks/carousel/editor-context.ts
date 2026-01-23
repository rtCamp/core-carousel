import { createContext } from "@wordpress/element";
import { EmblaCarouselType } from "embla-carousel";
import { CarouselAttributes } from "./types";

export type EditorCarouselContextType = {
	emblaApi: EmblaCarouselType | undefined;
	setEmblaApi: (api: EmblaCarouselType) => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
	setCanScrollPrev: (value: boolean) => void;
	setCanScrollNext: (value: boolean) => void;
	carouselOptions: Omit<Partial<CarouselAttributes>, 'slidesToScroll'> & {
		slidesToScroll?: number | string;
	};
};


// Use a global singleton to ensure all block bundles share the same Context reference
const GLOBAL_CONTEXT_KEY = Symbol.for("carousel-system.editor-context");

const defaultValue: EditorCarouselContextType = {
	emblaApi: undefined,
	setEmblaApi: () => {},
	canScrollPrev: false,
	canScrollNext: false,
	setCanScrollPrev: () => {},
	setCanScrollNext: () => {},
	carouselOptions: {},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let context = (window as any)[GLOBAL_CONTEXT_KEY];

if (!context) {
	context = createContext<EditorCarouselContextType>(defaultValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any)[GLOBAL_CONTEXT_KEY] = context;
}

export const EditorCarouselContext = context as React.Context<EditorCarouselContextType>;
