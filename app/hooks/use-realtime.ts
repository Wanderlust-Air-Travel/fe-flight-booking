"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import useUserStore from '@/app/zustand/storeUser';

/**
 * WebSocket connection configuration
 */
const getSocketUrl = () => {
	if (typeof window === 'undefined') return '';
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
	return `${protocol}//${host}/realtime`;
};

/**
 * Realtime WebSocket Hook
 * Manages WebSocket connection and provides real-time event handling
 */
export function useRealtime() {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { accessToken } = useUserStore();
	const reconnectAttemptsRef = useRef(0);
	const maxReconnectAttempts = 5;

	useEffect(() => {
		const socketUrl = getSocketUrl();
		if (!socketUrl) return;

		// Get session ID from sessionStorage (for guest users)
		const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('guest_session_id') : null;

		// Check if we've exceeded max reconnection attempts
		if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
			console.warn('[Realtime] Max reconnection attempts reached. Skipping connection.');
			setError('WebSocket connection unavailable. Please refresh the page.');
			return;
		}

		// Create socket connection
		const newSocket = io(socketUrl, {
			auth: {
				token: accessToken || undefined,
				sessionId: sessionId || undefined,
			},
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionAttempts: maxReconnectAttempts,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 10000,
		});

		// Connection event handlers
		newSocket.on('connect', () => {
			setIsConnected(true);
			setError(null);
			reconnectAttemptsRef.current = 0; // Reset on successful connection
			console.log('[Realtime] Connected to WebSocket server');
		});

		newSocket.on('disconnect', (reason) => {
			setIsConnected(false);
			// Only try to reconnect if it's not a client-side disconnect
			if (reason === 'io server disconnect') {
				// Server disconnected, socket.io will auto-reconnect
				console.log('[Realtime] Server disconnected, will attempt to reconnect');
			} else if (reason === 'io client disconnect') {
				// Client manually disconnected, don't reconnect
				console.log('[Realtime] Client disconnected');
			} else {
				// Network error or other, socket.io will auto-reconnect
				console.log('[Realtime] Disconnected:', reason);
			}
		});

		newSocket.on('connect_error', (err) => {
			reconnectAttemptsRef.current += 1;
			const attemptsLeft = maxReconnectAttempts - reconnectAttemptsRef.current;
			
			if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
				// Disable reconnection after max attempts
				newSocket.io.opts.reconnection = false;
				setError('WebSocket connection failed. Real-time features are unavailable.');
				console.error('[Realtime] Max reconnection attempts reached. Disabling reconnection.');
			} else {
				// Still attempting to reconnect
				setError(`Connecting... (${attemptsLeft} attempts remaining)`);
				console.warn(`[Realtime] Connection error (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}):`, err.message);
			}
		});

		newSocket.on('reconnect_attempt', (attemptNumber) => {
			console.log(`[Realtime] Reconnection attempt ${attemptNumber}`);
		});

		newSocket.on('reconnect_failed', () => {
			console.error('[Realtime] Reconnection failed after all attempts');
			setError('WebSocket connection unavailable. Real-time features are disabled.');
			newSocket.io.opts.reconnection = false;
		});

		newSocket.on('error', (err) => {
			// Only set error if not already at max attempts
			if (reconnectAttemptsRef.current < maxReconnectAttempts) {
				setError(err.message || 'WebSocket error');
			}
			console.error('[Realtime] Error:', err);
		});

		newSocket.on('connected', (data) => {
			console.log('[Realtime] Connection confirmed:', data);
		});

		setSocket(newSocket);

		// Cleanup on unmount
		return () => {
			if (newSocket) {
				newSocket.removeAllListeners();
				newSocket.close();
			}
		};
	}, [accessToken]);

	/**
	 * Subscribe to an event
	 */
	const subscribe = useCallback(
		(event: string, handler: (data: any) => void) => {
			if (!socket) return () => {};

			socket.on(event, handler);
			return () => {
				socket.off(event, handler);
			};
		},
		[socket],
	);

	/**
	 * Emit an event
	 */
	const emit = useCallback(
		(event: string, data?: any) => {
			if (!socket || !isConnected) {
				console.warn('[Realtime] Cannot emit: socket not connected');
				return;
			}
			socket.emit(event, data);
		},
		[socket, isConnected],
	);

	return {
		socket,
		isConnected,
		error,
		subscribe,
		emit,
	};
}

