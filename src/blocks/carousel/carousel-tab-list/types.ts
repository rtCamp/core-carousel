export type TabListAttributes = {
	labels: string[];
	orientation: 'horizontal' | 'vertical';
	activeTabBackgroundColor: string;
	activeTabTextColor: string;
};

export type TabContext = {
	snap?: { index?: number };
	dotLabels?: string[];
	carouselId?: string;
	ariaLabelPattern?: string;
	selectedIndex?: number;
	scrollSnaps?: { index: number }[];
};
