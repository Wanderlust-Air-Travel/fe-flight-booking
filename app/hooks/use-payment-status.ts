"use client";

import { useEffect, useCallback, useState } from 'react';
import { useRealtime } from './use-realtime';
import { PaymentStatusUpdateEvent } from '@/types/realtime-types';

/**
 * Hook for subscribing to payment status updates
 * High Priority: UX critical - immediate payment confirmation
 */
export function usePaymentStatus(bookingId: string | null, paymentId?: string | null) {
	const { socket, isConnected, subscribe, emit } = useRealtime();
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatusUpdateEvent | null>(null);
	const [isSubscribed, setIsSubscribed] = useState(false);

	/**
	 * Subscribe to payment status updates
	 */
	const subscribeToPaymentStatus = useCallback(() => {
		if (!bookingId || !isConnected || !socket) return;

		emit('subscribe:payment-status', { bookingId, paymentId: paymentId || undefined });

		// Listen for subscription confirmation
		const unsubscribeConfirm = subscribe('subscribed:payment-status', (data) => {
			if (data.bookingId === bookingId) {
				setIsSubscribed(true);
			}
		});

		// Listen for payment status updates
		const unsubscribeUpdate = subscribe('payment-status:update', (data: PaymentStatusUpdateEvent) => {
			if (data.bookingId === bookingId) {
				setPaymentStatus(data);
			}
		});

		return () => {
			unsubscribeConfirm();
			unsubscribeUpdate();
		};
	}, [bookingId, paymentId, isConnected, socket, emit, subscribe]);

	/**
	 * Unsubscribe from payment status updates
	 */
	const unsubscribeFromPaymentStatus = useCallback(() => {
		if (!bookingId || !isConnected || !socket) return;

		emit('unsubscribe:payment-status', { bookingId });

		// Listen for unsubscription confirmation
		const unsubscribeConfirm = subscribe('unsubscribed:payment-status', (data) => {
			if (data.bookingId === bookingId) {
				setIsSubscribed(false);
			}
		});

		return unsubscribeConfirm;
	}, [bookingId, isConnected, socket, emit, subscribe]);

	// Auto-subscribe when bookingId is available and connected
	useEffect(() => {
		if (!bookingId || !isConnected) {
			setIsSubscribed(false);
			setPaymentStatus(null);
			return;
		}

		const cleanup = subscribeToPaymentStatus();

		return () => {
			if (cleanup) cleanup();
			unsubscribeFromPaymentStatus();
		};
	}, [bookingId, paymentId, isConnected, subscribeToPaymentStatus, unsubscribeFromPaymentStatus]);

	return {
		isSubscribed,
		paymentStatus,
		status: paymentStatus?.status ?? 'pending',
		isSuccess: paymentStatus?.status === 'success',
		isFailed: paymentStatus?.status === 'failed',
		isPending: paymentStatus?.status === 'pending',
		subscribe: subscribeToPaymentStatus,
		unsubscribe: unsubscribeFromPaymentStatus,
	};
}

