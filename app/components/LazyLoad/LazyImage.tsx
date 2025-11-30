"use client";

/**
 * LazyImage Component
 * Optimized lazy loading for images with blur placeholder support
 * Uses Next.js Image component with lazy loading
 */

import Image from 'next/image';
import { useState } from 'react';
import { LazyImageProps } from '@/types/lazy-image';

const LazyImage = ({
	src,
	placeholderImage,
	blurDataURL,
	alt,
	className = '',
	containerClassName = '',
	...imageProps
}: LazyImageProps) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);

	// Use Next.js Image with loading="lazy" for optimal performance
	return (
		<div className={`relative overflow-hidden ${containerClassName}`}>
			{/* Placeholder while loading */}
			{!isLoaded && !hasError && (
				<div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
					{placeholderImage ? (
						<Image
							src={placeholderImage}
							alt=""
							fill
							className="object-cover opacity-50"
							unoptimized
						/>
					) : (
						<div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
					)}
				</div>
			)}

			{/* Actual image */}
			<Image
				src={src}
				alt={alt}
				className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
				onLoad={() => setIsLoaded(true)}
				onError={() => setHasError(true)}
				loading="lazy"
				{...imageProps}
			/>

			{/* Error state */}
			{hasError && (
				<div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
					<span className="text-gray-400 text-sm">Failed to load image</span>
				</div>
			)}
		</div>
	);
};

export default LazyImage;

