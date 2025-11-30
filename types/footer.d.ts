/**
 * Types for Footer component
 */

export interface FooterItem {
	label: string;
	link: string;
}

export interface FooterSection {
	title: string;
	list: FooterItem[];
	imgs?: {
		image: string;
	}[];
}

