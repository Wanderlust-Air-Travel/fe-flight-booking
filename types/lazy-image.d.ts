/**
 * Types for LazyImage component
 */

import { ImageProps } from 'next/image';

export interface LazyImageProps extends Omit<ImageProps, 'src' | 'placeholder'> {
	src: string;
	placeholderImage?: string; // Blur placeholder image URL
	blurDataURL?: string; // Base64 blur placeholder
	alt: string;
	className?: string;
	containerClassName?: string;
}

