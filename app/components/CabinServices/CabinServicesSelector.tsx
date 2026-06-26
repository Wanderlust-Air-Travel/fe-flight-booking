"use client";

import { useEffect } from "react";
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
	saveDisabled = false,
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

	const cardClass = "border border-gray-200 rounded-[1rem] bg-white";
	const headerBorder = "border-b border-gray-200 pb-3";

	if (loading) {
		return (
			<div className={cardClass}>
				<div className="p-4 sm:p-5 border-b border-gray-100">
					<h3 className="text-base font-semibold text-gray-900">Dịch vụ cabin</h3>
					<p className="text-sm text-gray-500 mt-1">Đang tải...</p>
				</div>
				<div className="p-4 sm:p-5 flex items-center justify-center py-8">
					<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
				</div>
			</div>
		);
	}

	if (error && services.length === 0) {
		return (
			<div className={cardClass}>
				<div className="p-4 sm:p-5">
					<h3 className="text-base font-semibold text-gray-900">Dịch vụ cabin</h3>
					<p className="text-sm text-gray-600 mt-2">{error}</p>
				</div>
			</div>
		);
	}

	if (services.length === 0) {
		return (
			<div className={cardClass}>
				<div className="p-4 sm:p-5">
					<h3 className="text-base font-semibold text-gray-900">Dịch vụ cabin</h3>
					<p className="text-sm text-gray-500 mt-1">Không có dịch vụ khả dụng</p>
				</div>
			</div>
		);
	}

	return (
		<div className={cardClass}>
			<div className={`p-4 sm:p-5 ${headerBorder}`}>
				<h3 className="text-base font-semibold text-gray-900">Dịch vụ cabin</h3>
				<p className="text-sm text-gray-500 mt-1">
					Chọn dịch vụ bổ sung. &quot;Đã bao gồm&quot; là cố định; các dịch vụ khác bấm để thêm/bỏ.
				</p>
			</div>
			<div className="p-4 sm:p-5 space-y-2">
				{error && <p className="text-sm text-gray-600">{error}</p>}

				<div className="space-y-1.5">
					{services.map((service) => {
						const isSelected = selectedServices.has(service.cabinServiceId);
						const isIncluded = service.isIncluded;
						const canToggle = !isIncluded;

						return (
							<div
								key={service.cabinServiceId}
								role={canToggle ? "button" : undefined}
								tabIndex={canToggle ? 0 : undefined}
								onClick={canToggle ? () => toggleService(service.cabinServiceId, service.isIncluded) : undefined}
								onKeyDown={canToggle ? (e) => e.key === "Enter" && toggleService(service.cabinServiceId, service.isIncluded) : undefined}
								className={`flex items-start gap-3 p-2.5 rounded-md border transition-all ${
									isSelected ? "border-gray-400 bg-gray-50" : "border-gray-200 bg-white"
								} ${canToggle ? "cursor-pointer hover:border-gray-300 hover:bg-gray-50" : "cursor-default"}`}
							>
								<Checkbox
									id={service.cabinServiceId}
									checked={isSelected}
									disabled={isIncluded}
									onCheckedChange={() => toggleService(service.cabinServiceId, service.isIncluded)}
									className="mt-0.5 pointer-events-none border-2 border-gray-400 data-[state=checked]:bg-gray-700 data-[state=checked]:border-gray-700"
								/>
								<label
									htmlFor={service.cabinServiceId}
									className={`flex-1 min-w-0 ${canToggle ? "cursor-pointer" : "cursor-default"}`}
								>
									<div className="flex items-center justify-between gap-2 flex-wrap">
										<div>
											<p className="font-medium text-sm text-gray-900">{service.serviceName}</p>
											{service.description && (
												<p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
											)}
										</div>
										<div className="text-right shrink-0">
											{isIncluded ? (
												<span className="text-sm text-gray-500">Đã bao gồm</span>
											) : service.price !== null && service.price > 0 ? (
												<span className="text-sm font-medium text-gray-900">{FormatPrice(service.price)}</span>
											) : (
												<span className="text-sm text-gray-500">Có thể thêm</span>
											)}
										</div>
									</div>
								</label>
							</div>
						);
					})}
				</div>

				{totalPrice > 0 && (
					<div className="pt-3 border-t border-gray-200">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-gray-700">Tổng tiền dịch vụ:</span>
							<span className="text-sm font-semibold text-gray-900">{FormatPrice(totalPrice)}</span>
						</div>
					</div>
				)}

				<Button
					onClick={handleSaveServices}
					disabled={saving || saveDisabled}
					variant="outline"
					className="w-full mt-3 h-10 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm rounded-md"
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
			</div>
		</div>
	);
}

