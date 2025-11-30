/**
 * Real-time Communication Types
 * Types for WebSocket real-time updates
 */

/**
 * Seat Availability Change Event
 */
export interface SeatAvailabilityChange {
	flightSeatId: string;
	seatNumber: string;
	status: 'available' | 'reserved' | 'booked' | 'unavailable';
	changedBy?: string;
}

/**
 * Seat Availability Update Event
 */
export interface SeatAvailabilityUpdateEvent {
	flightInstanceId: string;
	changes: SeatAvailabilityChange[];
	timestamp: string;
}

/**
 * Reservation Countdown Update Event
 */
export interface ReservationCountdownUpdateEvent {
	reservationId: string;
	remainingSeconds: number;
	expiresAt: string;
	isExpired: boolean;
}

/**
 * Reservation Countdown Expired Event
 */
export interface ReservationCountdownExpiredEvent {
	reservationId: string;
	expiresAt: string;
}

/**
 * Payment Status Update Event
 */
export interface PaymentStatusUpdateEvent {
	bookingId: string;
	paymentId: string;
	status: 'pending' | 'success' | 'failed';
	timestamp: string;
	metadata?: Record<string, any>;
}

/**
 * WebSocket Connection Info
 */
export interface WebSocketConnectionInfo {
	socketId: string;
	userId?: string;
	sessionId?: string;
}

