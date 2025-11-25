import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ItemServiceProp } from '@/types/item-service-type';
import { UseDealsResult } from '@/types/use-deals-type';

/**
 * Custom hook to fetch deals from API
 * Prevents infinite loop by using useRef to track if fetch has been called
 * Only fetches once on mount
 */
export function useDeals(): UseDealsResult {
	const [services, setServices] = useState<ItemServiceProp[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const hasFetchedRef = useRef<boolean>(false);

	useEffect(() => {
		// Prevent multiple fetches
		if (hasFetchedRef.current) {
			return;
		}

		hasFetchedRef.current = true;

		const fetchDeals = async () => {
			try {
				setLoading(true);
				setError(null);

				// Use Next.js API route proxy for better caching and error handling
				const response = await axios.get('/api/services/deals');
				
				if (response.data && response.data.deals && Array.isArray(response.data.deals)) {
					setServices(response.data.deals);
				} else {
					throw new Error('Invalid response format');
				}
			} catch (err: any) {
				console.error('Error fetching deals:', err);
				setError(err.message || 'Failed to fetch deals');
				setServices([]);
			} finally {
				setLoading(false);
			}
		};

		fetchDeals();
	}, []); // Empty dependency array - only run once on mount

	return { services, loading, error };
}

