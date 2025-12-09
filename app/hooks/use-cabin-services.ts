/**
 * useCabinServices Hook - Business logic for cabin services
 * Separates business logic from UI components
 */

import { useState, useEffect, useCallback } from "react";
import axiosInstance, { axiosPublic } from "@/lib/axios-instance";
import useUserStore from "@/app/zustand/storeUser";
import type { CabinService } from "@/types/cabin-service-type";
import type { UseCabinServicesParams, UseCabinServicesReturn } from "@/types/use-cabin-services-type";

/**
 * Custom hook for managing cabin services
 * Handles fetching, selection, and saving of cabin services
 */
export function useCabinServices({
	fareClassCode,
	cabinClassCode,
	isLoggedIn,
}: UseCabinServicesParams): UseCabinServicesReturn {
	const [services, setServices] = useState<CabinService[]>([]);
	const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const { accessToken } = useUserStore();

	// Fetch cabin services
	useEffect(() => {
		const fetchServices = async () => {
			if (!fareClassCode || !cabinClassCode) {
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const axiosClient = isLoggedIn ? axiosInstance : axiosPublic;
				const response = await axiosClient.get("/api/search/cabin-services", {
					params: {
						fareClassCode,
						cabinClassCode,
					},
				});

				if (response.data && response.data.services) {
					setServices(response.data.services);
					// Auto-select included services
					const includedServices = response.data.services
						.filter((s: CabinService) => s.isIncluded)
						.map((s: CabinService) => s.cabinServiceId);
					setSelectedServices(new Set(includedServices));
				}
			} catch (err: any) {
				console.error("Error fetching cabin services:", err);
				setError(err?.response?.data?.message || "Không thể tải danh sách dịch vụ");
			} finally {
				setLoading(false);
			}
		};

		fetchServices();
	}, [fareClassCode, cabinClassCode, isLoggedIn]);

	// Toggle service selection
	const toggleService = useCallback((serviceId: string, isIncluded: boolean) => {
		// Included services cannot be deselected
		if (isIncluded) {
			return;
		}

		setSelectedServices((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(serviceId)) {
				newSet.delete(serviceId);
			} else {
				newSet.add(serviceId);
			}
			return newSet;
		});
	}, []);

	// Save selected services
	const saveServices = useCallback(async (flightInstanceId: string) => {
		if (!flightInstanceId) {
			setError("Flight instance ID is required");
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const selected = services
				.filter((s) => selectedServices.has(s.cabinServiceId))
				.map((s) => ({
					cabinServiceId: s.cabinServiceId,
					serviceType: s.serviceType,
					serviceName: s.serviceName,
					price: s.price,
					isIncluded: s.isIncluded,
				}));

			const axiosClient = isLoggedIn ? axiosInstance : axiosPublic;
			const headers: Record<string, string> = {};

			// For guest users, get session ID
			if (!isLoggedIn) {
				const sessionId = sessionStorage.getItem("guest_session_id");
				if (sessionId) {
					headers["X-Session-Id"] = sessionId;
				}
			}

			const response = await axiosClient.post(
				"/api/booking-state/cabin-services",
				{
					flightInstanceId,
					services: selected,
				},
				{ headers }
			);

			if (response.data.success) {
				// Show success message or update UI
				console.log("Cabin services saved successfully");
			}
		} catch (err: any) {
			console.error("Error saving cabin services:", err);
			setError(err?.response?.data?.message || "Không thể lưu dịch vụ đã chọn");
		} finally {
			setSaving(false);
		}
	}, [services, selectedServices, isLoggedIn]);

	// Calculate total price
	const totalPrice = services
		.filter((s) => selectedServices.has(s.cabinServiceId) && !s.isIncluded && s.price !== null)
		.reduce((sum, s) => sum + (s.price || 0), 0);

	return {
		services,
		selectedServices,
		loading,
		error,
		saving,
		totalPrice,
		toggleService,
		saveServices,
	};
}

