"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, CheckCircle2, XCircle, Package, Sparkles } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CabinClass, CabinService } from "@/types/admin/cabin-service-type";
import { FareClass } from "@/types/admin/route-fare-price-type";

export default function CabinServicesPage() {
    const [cabinServices, setCabinServices] = useState<CabinService[]>([]);
    const [cabinClasses, setCabinClasses] = useState<CabinClass[]>([]);
    const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
    // Separate states for dialog (will be fetched when dialog opens)
    const [dialogCabinClasses, setDialogCabinClasses] = useState<CabinClass[]>([]);
    const [dialogFareClasses, setDialogFareClasses] = useState<FareClass[]>([]);
    const [loadingDialogData, setLoadingDialogData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<CabinService | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
    const [formData, setFormData] = useState({
        cabinClassCode: "",
        fareClassCode: "",
        serviceType: "",
        serviceName: "",
        description: "",
        isIncluded: true,
        price: "",
        isActive: true,
        displayOrder: "0",
        iconUrl: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [servicesRes, fareClassesRes] = await Promise.all([
                axiosInstance.get("/api/admin/cabin-services"),
                axiosInstance.get("/api/admin/fare-classes"),
            ]);
            setCabinServices(servicesRes.data || []);
            setFareClasses(fareClassesRes.data || []);
            
            // Extract unique cabin classes from services
            const uniqueCabinClasses = Array.from(
                new Map(
                    (servicesRes.data || [])
                        .filter((s: CabinService) => s.cabinClass)
                        .map((s: CabinService) => [s.cabinClassCode, s.cabinClass])
                ).values()
            ) as CabinClass[];
            setCabinClasses(uniqueCabinClasses);
            
            setError(null);
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    // Filter services based on search and active status
    const filteredServices = useMemo(() => {
        let filtered = cabinServices;

        // Filter by active status
        if (filterActive !== "all") {
            filtered = filtered.filter(service => 
                filterActive === "active" ? service.isActive : !service.isActive
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(service =>
                service.serviceName?.toLowerCase().includes(query) ||
                service.serviceType?.toLowerCase().includes(query) ||
                service.description?.toLowerCase().includes(query) ||
                service.cabinClassCode?.toLowerCase().includes(query) ||
                service.fareClassCode?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [cabinServices, filterActive, searchQuery]);

    const handleCreate = async () => {
        try {
            setError(null);
            await axiosInstance.post("/api/admin/cabin-services", {
                cabinClassCode: formData.cabinClassCode && formData.cabinClassCode !== "none" ? formData.cabinClassCode : null,
                fareClassCode: formData.fareClassCode && formData.fareClassCode !== "none" ? formData.fareClassCode : null,
                serviceType: formData.serviceType,
                serviceName: formData.serviceName,
                description: formData.description || null,
                isIncluded: formData.isIncluded,
                price: formData.isIncluded ? null : (formData.price ? parseFloat(formData.price) : null),
                isActive: formData.isActive,
                displayOrder: parseInt(formData.displayOrder),
                iconUrl: formData.iconUrl || null,
            });
            setIsCreateDialogOpen(false);
            resetForm();
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tạo dịch vụ cabin");
            throw err;
        }
    };

    const handleEdit = (service: CabinService) => {
        setEditingService(service);
        setFormData({
            cabinClassCode: service.cabinClassCode || "none",
            fareClassCode: service.fareClassCode || "none",
            serviceType: service.serviceType,
            serviceName: service.serviceName,
            description: service.description || "",
            isIncluded: service.isIncluded,
            price: service.price?.toString() || "",
            isActive: service.isActive,
            displayOrder: service.displayOrder.toString(),
            iconUrl: service.iconUrl || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingService) return;
        try {
            setError(null);
            await axiosInstance.put(`/api/admin/cabin-services/${editingService.cabinServiceId}`, {
                serviceName: formData.serviceName,
                description: formData.description || null,
                isIncluded: formData.isIncluded,
                price: formData.isIncluded ? null : (formData.price ? parseFloat(formData.price) : null),
                isActive: formData.isActive,
                displayOrder: parseInt(formData.displayOrder),
                iconUrl: formData.iconUrl || null,
            });
            setIsEditDialogOpen(false);
            setEditingService(null);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể cập nhật dịch vụ cabin");
            throw err;
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa dịch vụ cabin này?")) return;
        try {
            await axiosInstance.delete(`/api/admin/cabin-services/${id}`);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể xóa dịch vụ cabin");
        }
    };

    // Fetch cabin classes and fare classes for dialog
    const fetchDialogData = async () => {
        try {
            setLoadingDialogData(true);
            const [cabinClassesRes, fareClassesRes] = await Promise.all([
                axiosInstance.get("/api/admin/cabin-classes"),
                axiosInstance.get("/api/admin/fare-classes"),
            ]);
            
            const allCabinClasses = cabinClassesRes.data || [];
            const allFareClasses = fareClassesRes.data || [];
            
            // Transform cabin classes to camelCase
            const transformedCabinClasses = allCabinClasses.map((cc: any) => ({
                cabinClassCode: cc.cabin_class_code || cc.cabinClassCode,
                name: cc.name || cc.cabin_class_code || cc.cabinClassCode,
            }));
            
            // Transform fare classes to include cabinClassCode for filtering
            const transformedFareClasses = allFareClasses.map((fc: any) => ({
                fareClassCode: fc.fare_class_code || fc.fareClassCode,
                cabinClassCode: fc.cabin_class_code || 
                              fc.cabinClassCode || 
                              (fc.cabin_class?.cabin_class_code) || 
                              (fc.cabinClass?.cabinClassCode),
                description: fc.description || null,
                name: fc.name || null,
            }));
            
            setDialogCabinClasses(transformedCabinClasses);
            setDialogFareClasses(transformedFareClasses);
        } catch (err: any) {
            console.error("Error fetching dialog data:", err);
            setError(err.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoadingDialogData(false);
        }
    };

    // Filter fare classes based on selected cabin class
    const filteredDialogFareClasses = useMemo(() => {
        if (!formData.cabinClassCode || formData.cabinClassCode === "none") {
            return [];
        }
        return dialogFareClasses.filter((fc: any) => {
            // Handle both direct cabinClassCode and from nested cabin_class
            const fcCabinClassCode = fc.cabinClassCode || 
                                    fc.cabin_class_code ||
                                    (fc.cabin_class?.cabin_class_code) ||
                                    (fc.cabinClass?.cabinClassCode);
            return fcCabinClassCode === formData.cabinClassCode;
        });
    }, [dialogFareClasses, formData.cabinClassCode]);

    const resetForm = () => {
        setFormData({
            cabinClassCode: "none",
            fareClassCode: "none",
            serviceType: "",
            serviceName: "",
            description: "",
            isIncluded: true,
            price: "",
            isActive: true,
            displayOrder: "0",
            iconUrl: "",
        });
    };

    // Handle cabin class change - reset fare class
    const handleCabinClassChange = (value: string) => {
        setFormData({
            ...formData,
            cabinClassCode: value,
            fareClassCode: "none", // Reset fare class when cabin class changes
        });
    };

    const formatPrice = (price: number | null) => {
        if (price === null) return "Miễn phí";
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00558f] mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section with Primary Color */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00558f] to-[#3775A4] p-8 text-white shadow-lg">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Quản lý dịch vụ cabin</h1>
                    </div>
                    <p className="text-blue-50 text-lg">Quản lý các dịch vụ và tiện ích trong cabin</p>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-[#00558f]">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng số dịch vụ</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{cabinServices.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-[#00558f]/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-[#00558f]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#7ED957]">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {cabinServices.filter(s => s.isActive).length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-[#7ED957]/10 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-[#7ED957]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#3775A4]">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Không hoạt động</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {cabinServices.filter(s => !s.isActive).length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-[#3775A4]/10 flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-[#3775A4]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Bar */}
            <Card className="border border-gray-200 shadow-sm rounded-xl">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                        {/* Left Side: Filter Group */}
                        <div className="inline-flex items-center bg-gray-100 p-1.5 rounded-lg border border-gray-200 shrink-0 self-center lg:self-auto">
                            <button
                                onClick={() => setFilterActive("all")}
                                className={`px-5 py-3 text-base font-medium rounded-md transition-all ${
                                    filterActive === "all"
                                        ? "bg-white text-[#00558f] shadow-sm font-semibold"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setFilterActive("active")}
                                className={`px-5 py-3 text-base font-medium rounded-md transition-all flex items-center gap-2 ${
                                    filterActive === "active"
                                        ? "bg-white text-[#00558f] shadow-sm font-semibold"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                Hoạt động
                            </button>
                            <button
                                onClick={() => setFilterActive("inactive")}
                                className={`px-5 py-3 text-base font-medium rounded-md transition-all flex items-center gap-2 ${
                                    filterActive === "inactive"
                                        ? "bg-white text-[#00558f] shadow-sm font-semibold"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <XCircle className="h-5 w-5" />
                                Không hoạt động
                            </button>
                        </div>

                        {/* Middle: Search Input */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                            <Input
                                placeholder="Tìm kiếm theo tên dịch vụ, loại dịch vụ, cabin class..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 h-12 w-full text-base border-gray-300 focus:border-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 bg-white"
                            />
                        </div>

                        {/* Right Side: Primary Action Button */}
                        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                            setIsCreateDialogOpen(open);
                            if (open) {
                                // Fetch data when dialog opens
                                fetchDialogData();
                            } else {
                                resetForm();
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button 
                                    onClick={() => {
                                        resetForm();
                                        setIsCreateDialogOpen(true);
                                    }}
                                    className="bg-[#00558f] hover:bg-[#004475] text-white h-12 px-7 text-base font-semibold shadow-sm hover:shadow-md transition-all w-full lg:w-auto shrink-0 whitespace-nowrap"
                                >
                                    <Plus className="h-5 w-5 mr-2 shrink-0" />
                                    Thêm dịch vụ mới
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-bold text-gray-900">Thêm dịch vụ cabin mới</DialogTitle>
                                    <DialogDescription className="text-base text-gray-600 mt-2">
                                        Tạo dịch vụ cabin mới (có thể áp dụng cho cabin class hoặc fare class cụ thể)
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                                    {/* Cabin Class and Fare Class Selection */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="cabinClassCode" className="text-base font-semibold text-gray-700">
                                                Cabin Class
                                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                            </Label>
                                            <Select
                                                value={formData.cabinClassCode}
                                                onValueChange={handleCabinClassChange}
                                                disabled={loadingDialogData}
                                            >
                                                <SelectTrigger className="h-14 text-base">
                                                    <SelectValue placeholder={loadingDialogData ? "Đang tải..." : "Chọn cabin class"} />
                                                </SelectTrigger>
                                                <SelectContent className="text-base">
                                                    <SelectItem value="none" className="text-base py-3">Không chọn</SelectItem>
                                                    {dialogCabinClasses.map((cc) => (
                                                        <SelectItem key={cc.cabinClassCode} value={cc.cabinClassCode} className="text-base py-3">
                                                            {cc.cabinClassCode} - {cc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="fareClassCode" className="text-base font-semibold text-gray-700">
                                                Fare Class
                                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                            </Label>
                                            <Select
                                                value={formData.fareClassCode}
                                                onValueChange={(value) => setFormData({ ...formData, fareClassCode: value })}
                                                disabled={!formData.cabinClassCode || formData.cabinClassCode === "none" || loadingDialogData}
                                            >
                                                <SelectTrigger className="h-14 text-base">
                                                    <SelectValue placeholder={
                                                        loadingDialogData 
                                                            ? "Đang tải..." 
                                                            : !formData.cabinClassCode || formData.cabinClassCode === "none"
                                                            ? "Chọn cabin class trước"
                                                            : "Chọn fare class"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent className="text-base">
                                                    <SelectItem value="none" className="text-base py-3">Không chọn</SelectItem>
                                                    {filteredDialogFareClasses.map((fc: any) => (
                                                        <SelectItem key={fc.fareClassCode} value={fc.fareClassCode} className="text-base py-3">
                                                            {fc.fareClassCode} - {fc.description || fc.fareClassCode}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {(!formData.cabinClassCode || formData.cabinClassCode === "none") && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Vui lòng chọn cabin class trước
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Service Type */}
                                    <div className="grid gap-3">
                                        <Label htmlFor="serviceType" className="text-base font-semibold text-gray-700">
                                            Loại dịch vụ <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Select
                                            value={formData.serviceType}
                                            onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                                        >
                                            <SelectTrigger className="h-14 text-base">
                                                <SelectValue placeholder="Chọn loại dịch vụ" />
                                            </SelectTrigger>
                                            <SelectContent className="text-base">
                                                <SelectItem value="meal" className="text-base py-3">Bữa ăn (Meal)</SelectItem>
                                                <SelectItem value="entertainment" className="text-base py-3">Giải trí (Entertainment)</SelectItem>
                                                <SelectItem value="wifi" className="text-base py-3">WiFi</SelectItem>
                                                <SelectItem value="priority_boarding" className="text-base py-3">Ưu tiên lên máy bay (Priority Boarding)</SelectItem>
                                                <SelectItem value="lounge_access" className="text-base py-3">Phòng chờ (Lounge Access)</SelectItem>
                                                <SelectItem value="seat_selection" className="text-base py-3">Chọn ghế (Seat Selection)</SelectItem>
                                                <SelectItem value="extra_legroom" className="text-base py-3">Chỗ ngồi rộng (Extra Legroom)</SelectItem>
                                                <SelectItem value="other" className="text-base py-3">Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Service Name */}
                                    <div className="grid gap-3">
                                        <Label htmlFor="serviceName" className="text-base font-semibold text-gray-700">
                                            Tên dịch vụ <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="serviceName"
                                            value={formData.serviceName}
                                            onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                            placeholder="VD: Hot Meal"
                                            className="h-14 text-base"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="grid gap-3">
                                        <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                                            Mô tả chi tiết
                                            <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="VD: Hot meal and beverage served during flight"
                                            className="min-h-[140px] text-base resize-none"
                                        />
                                    </div>

                                    {/* Is Included Checkbox */}
                                    <div className="flex items-center h-14 px-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            id="isIncluded"
                                            checked={formData.isIncluded}
                                            onChange={(e) => setFormData({ ...formData, isIncluded: e.target.checked, price: e.target.checked ? "" : formData.price })}
                                            className="h-5 w-5 rounded border-gray-300 text-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 cursor-pointer"
                                        />
                                        <Label htmlFor="isIncluded" className="text-base font-semibold text-gray-700 cursor-pointer ml-3 flex-1">
                                            Dịch vụ được bao gồm (miễn phí)
                                        </Label>
                                    </div>

                                    {/* Price (if not included) */}
                                    {!formData.isIncluded && (
                                        <div className="grid gap-3">
                                            <Label htmlFor="price" className="text-base font-semibold text-gray-700">
                                                Giá (VND) <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="200000"
                                                min="0"
                                                className="h-14 text-base"
                                            />
                                        </div>
                                    )}

                                    {/* Display Order and Active Status */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="displayOrder" className="text-base font-semibold text-gray-700">
                                                Thứ tự hiển thị
                                            </Label>
                                            <Input
                                                id="displayOrder"
                                                type="number"
                                                value={formData.displayOrder}
                                                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                                placeholder="0"
                                                className="h-14 text-base"
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label className="text-base font-semibold text-gray-700">
                                                Trạng thái
                                            </Label>
                                            <div className="flex items-center h-14 px-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    id="isActive"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="h-5 w-5 rounded border-gray-300 text-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 cursor-pointer"
                                                />
                                                <Label htmlFor="isActive" className="text-base font-semibold text-gray-700 cursor-pointer ml-3 flex-1">
                                                    Đang hoạt động
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Icon URL */}
                                    <div className="grid gap-3">
                                        <Label htmlFor="iconUrl" className="text-base font-semibold text-gray-700">
                                            URL Icon
                                            <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                        </Label>
                                        <Input
                                            id="iconUrl"
                                            value={formData.iconUrl}
                                            onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                                            placeholder="https://example.com/icons/meal.png"
                                            className="h-14 text-base"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" type="button" className="h-14 text-base">
                                            Hủy
                                        </Button>
                                    </DialogClose>
                                    <Button 
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                await handleCreate();
                                                setIsCreateDialogOpen(false);
                                            } catch (err) {
                                                // Error already handled in handleCreate
                                            }
                                        }}
                                        className="bg-[#00558f] hover:bg-[#004475] text-white h-14 text-base"
                                    >
                                        Tạo mới
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {/* Data Table Card */}
            <Card className="border-0 shadow-md">
                <CardHeader className="border-b bg-gray-50/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Danh sách dịch vụ cabin</CardTitle>
                            <CardDescription className="mt-2 text-base font-medium text-gray-600">
                                Hiển thị {filteredServices.length} / {cabinServices.length} dịch vụ
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold text-gray-700 text-base">Cabin/Fare Class</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Loại dịch vụ</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Tên dịch vụ</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Giá</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Trạng thái</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 text-base">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredServices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Package className="h-12 w-12 mb-4 opacity-50" />
                                                <p className="text-lg font-medium">Không có dịch vụ cabin nào</p>
                                                <p className="text-sm mt-1">Hãy thêm dịch vụ mới</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredServices.map((service) => (
                                        <TableRow 
                                            key={service.cabinServiceId}
                                            className="hover:bg-[#00558f]/5 transition-colors"
                                        >
                                            <TableCell className="text-base">
                                                <div className="flex flex-col gap-2">
                                                    {service.cabinClass && (
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-[#00558f]/10 text-[#00558f] w-fit">
                                                            Cabin: {service.cabinClassCode}
                                                        </span>
                                                    )}
                                                    {service.fareClass && (
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-[#3775A4]/10 text-[#3775A4] w-fit">
                                                            Fare: {service.fareClassCode}
                                                        </span>
                                                    )}
                                                    {!service.cabinClass && !service.fareClass && (
                                                        <span className="text-gray-400 text-sm">N/A</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-base capitalize">
                                                {service.serviceType?.replace(/_/g, ' ') || 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-medium text-base">{service.serviceName}</TableCell>
                                            <TableCell className="text-base font-semibold text-[#00558f]">
                                                {formatPrice(service.price)}
                                            </TableCell>
                                            <TableCell className="text-base">
                                                <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                                                    service.isActive
                                                        ? 'bg-[#7ED957]/10 text-[#64AF53]'
                                                        : 'bg-gray-100 text-gray-600'
                                                }}`}>
                                                    {service.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-base">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(service)}
                                                        className="h-10 w-10 p-0 hover:bg-[#00558f]/10 hover:text-[#00558f]"
                                                    >
                                                        <Pencil className="h-6 w-6" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(service.cabinServiceId)}
                                                        className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-6 w-6" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) {
                    setEditingService(null);
                }
            }}>
                <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Chỉnh sửa dịch vụ cabin</DialogTitle>
                        <DialogDescription className="text-base text-gray-600 mt-2">
                            Cập nhật thông tin dịch vụ cabin
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                        <div className="grid gap-3">
                            <Label htmlFor="edit-serviceName" className="text-base font-semibold text-gray-700">
                                Tên dịch vụ <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="edit-serviceName"
                                value={formData.serviceName}
                                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                className="h-14 text-base"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit-description" className="text-base font-semibold text-gray-700">
                                Mô tả chi tiết
                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[140px] text-base resize-none"
                            />
                        </div>
                        <div className="flex items-center h-14 px-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                id="edit-isIncluded"
                                checked={formData.isIncluded}
                                onChange={(e) => setFormData({ ...formData, isIncluded: e.target.checked, price: e.target.checked ? "" : formData.price })}
                                className="h-5 w-5 rounded border-gray-300 text-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 cursor-pointer"
                            />
                            <Label htmlFor="edit-isIncluded" className="text-base font-semibold text-gray-700 cursor-pointer ml-3 flex-1">
                                Dịch vụ được bao gồm (miễn phí)
                            </Label>
                        </div>
                        {!formData.isIncluded && (
                            <div className="grid gap-3">
                                <Label htmlFor="edit-price" className="text-base font-semibold text-gray-700">
                                    Giá (VND) <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    min="0"
                                    className="h-14 text-base"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="edit-displayOrder" className="text-base font-semibold text-gray-700">
                                    Thứ tự hiển thị
                                </Label>
                                <Input
                                    id="edit-displayOrder"
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                    className="h-14 text-base"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label className="text-base font-semibold text-gray-700">
                                    Trạng thái
                                </Label>
                                <div className="flex items-center h-14 px-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        id="edit-isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-5 w-5 rounded border-gray-300 text-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 cursor-pointer"
                                    />
                                    <Label htmlFor="edit-isActive" className="text-base font-semibold text-gray-700 cursor-pointer ml-3 flex-1">
                                        Đang hoạt động
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit-iconUrl" className="text-base font-semibold text-gray-700">
                                URL Icon
                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                            </Label>
                            <Input
                                id="edit-iconUrl"
                                value={formData.iconUrl}
                                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                                className="h-14 text-base"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button" className="h-14 text-base">
                                Hủy
                            </Button>
                        </DialogClose>
                        <Button 
                            type="button"
                            onClick={async () => {
                                try {
                                    await handleUpdate();
                                    setIsEditDialogOpen(false);
                                } catch (err) {
                                    // Error already handled in handleUpdate
                                }
                            }}
                            className="bg-[#00558f] hover:bg-[#004475] text-white h-14 text-base"
                        >
                            Cập nhật
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
