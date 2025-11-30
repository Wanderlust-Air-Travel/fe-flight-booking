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
		});

		// Connection event handlers
		newSocket.on('connect', () => {
			setIsConnected(true);
			setError(null);
			reconnectAttemptsRef.current = 0;
			console.log('[Realtime] Connected to WebSocket server');
		});

		newSocket.on('disconnect', (reason) => {
			setIsConnected(false);
			if (reason === 'io server disconnect') {
				// Server disconnected, try to reconnect
				newSocket.connect();
			}
			console.log('[Realtime] Disconnected from WebSocket server:', reason);
		});

		newSocket.on('connect_error', (err) => {
			setError(err.message);
			reconnectAttemptsRef.current += 1;
			if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
				console.error('[Realtime] Max reconnection attempts reached');
			}
		});

		newSocket.on('error', (err) => {
			setError(err.message || 'WebSocket error');
			console.error('[Realtime] Error:', err);
		});

		newSocket.on('connected', (data) => {
			console.log('[Realtime] Connection confirmed:', data);
		});

		setSocket(newSocket);

		// Cleanup on unmount
		return () => {
			newSocket.close();
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

