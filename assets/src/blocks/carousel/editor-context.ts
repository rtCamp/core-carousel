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
	carouselOptions: Partial<CarouselAttributes>;
};

export const EditorCarouselContext = createContext<EditorCarouselContextType>({
	emblaApi: undefined,
	setEmblaApi: () => {},
	canScrollPrev: false,
	canScrollNext: false,
	setCanScrollPrev: () => {},
	setCanScrollNext: () => {},
	carouselOptions: {},
});
