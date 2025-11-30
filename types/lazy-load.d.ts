/**
 * Types for LazyLoad components
 */

import { ReactNode } from 'react';

export interface LazyLoadProps {
	children: ReactNode;
	placeholder?: ReactNode;
	height?: number | string;
	offset?: number; // Distance from viewport to start loading (in pixels)
	once?: boolean; // If true, component will be loaded once and then ignored
	threshold?: number; // Intersection threshold (0-1)
	className?: string;
	style?: React.CSSProperties;
}

