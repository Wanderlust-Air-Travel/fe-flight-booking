import { NextResponse } from 'next/server';
import axios from 'axios';

// In Next.js API routes (server-side), NEXT_PUBLIC_* env vars are not available
// Use regular env var or fallback to default
const BACKEND_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Next.js API route proxy for /api/v1/services/deals
 * This provides:
 * - Caching at Next.js level
 * - Error handling
 * - Single point of API configuration
 * - Prevents CORS issues
 */
export async function GET() {
	try {
		const response = await axios.get(`${BACKEND_API_URL}/api/v1/services/deals`, {
			timeout: 10000, // 10 seconds timeout
		});

		// Cache the response for 5 minutes (300 seconds)
		// This reduces load on backend API
		return NextResponse.json(response.data, {
			status: response.status,
			headers: {
				'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
			},
		});
	} catch (error: any) {
		console.error('Error proxying GET /services/deals:', error.response?.data || error.message);
		
		return NextResponse.json(
			{
				deals: [],
				error: error.response?.data?.message || error.message || 'Failed to fetch deals',
			},
			{ status: error.response?.status || 500 }
		);
	}
}

