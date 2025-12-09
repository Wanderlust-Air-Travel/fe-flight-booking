"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import useUserStore from "@/app/zustand/storeUser";
import { useCabinServices } from "@/app/hooks/use-cabin-services";
import type { CabinServicesSelectorProps, CabinService } from "@/types/cabin-service-type";

export default function CabinServicesSelector({
	flightInstanceId,
	fareClassCode,
	cabinClassCode,
	onServicesChange,
}: CabinServicesSelectorProps) {
	const { isLoggedIn } = useUserStore();
	
	// Business logic separated to custom hook
	const {
		services,
		selectedServices,
		loading,
		error,
		saving,
		totalPrice,
		toggleService,
		saveServices,
	} = useCabinServices({
		fareClassCode,
		cabinClassCode,
		isLoggedIn,
	});

	// Notify parent of selected services changes
	useEffect(() => {
		if (onServicesChange) {
			const selected = services.filter((s) => selectedServices.has(s.cabinServiceId));
			onServicesChange(selected);
		}
	}, [selectedServices, services, onServicesChange]);

	const handleSaveServices = () => {
		saveServices(flightInstanceId);
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Dịch vụ cabin</CardTitle>
					<CardDescription>Đang tải danh sách dịch vụ...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error && services.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Dịch vụ cabin</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-red-500">{error}</p>
				</CardContent>
			</Card>
		);
	}

	if (services.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Dịch vụ cabin</CardTitle>
					<CardDescription>Không có dịch vụ nào khả dụng</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Dịch vụ cabin</CardTitle>
				<CardDescription>Chọn các dịch vụ bổ sung cho chuyến bay của bạn</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && <p className="text-sm text-red-500">{error}</p>}

				<div className="space-y-3">
					{services.map((service) => {
						const isSelected = selectedServices.has(service.cabinServiceId);
						const isDisabled = service.isIncluded; // Included services are always selected

						return (
							<div
								key={service.cabinServiceId}
								className={`flex items-start gap-3 p-3 rounded-lg border ${
									isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
								}`}
							>
								<Checkbox
									id={service.cabinServiceId}
									checked={isSelected}
									disabled={isDisabled}
									onCheckedChange={() => toggleService(service.cabinServiceId, service.isIncluded)}
									className="mt-1"
								/>
								<label
									htmlFor={service.cabinServiceId}
									className={`flex-1 cursor-pointer ${isDisabled ? "cursor-not-allowed opacity-60" : ""}`}
								>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-sm">{service.serviceName}</p>
											{service.description && (
												<p className="text-xs text-gray-500 mt-1">{service.description}</p>
											)}
										</div>
										<div className="text-right ml-4">
											{service.isIncluded ? (
												<span className="text-xs text-green-600 font-medium">Đã bao gồm</span>
											) : service.price !== null ? (
												<span className="text-sm font-medium">{FormatPrice(service.price)}</span>
											) : (
												<span className="text-xs text-gray-400">Miễn phí</span>
											)}
										</div>
									</div>
								</label>
							</div>
						);
					})}
				</div>

				{totalPrice > 0 && (
					<div className="pt-4 border-t">
						<div className="flex items-center justify-between">
							<span className="font-medium">Tổng tiền dịch vụ:</span>
							<span className="font-bold text-lg">{FormatPrice(totalPrice)}</span>
						</div>
					</div>
				)}

				<Button
					onClick={handleSaveServices}
					disabled={saving}
					className="w-full mt-4"
					variant="default"
				>
					{saving ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Đang lưu...
						</>
					) : (
						"Lưu lựa chọn"
					)}
				</Button>
			</CardContent>
		</Card>
	);
}

