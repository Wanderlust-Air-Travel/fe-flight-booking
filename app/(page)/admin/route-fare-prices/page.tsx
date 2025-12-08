"use client";

import { useState, useEffect, useMemo, useRef, useCallback, startTransition } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, Search, Filter, TrendingUp, Plane, DollarSign, Calendar as CalendarIcon, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import axiosInstance from "@/lib/axios-instance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Route, FareClass, RouteFarePrice } from "@/types/admin/route-fare-price-type";

// Helper function to format route display
const formatRoute = (route: Route | undefined) => {
    if (!route) return "N/A";
    const origin = route.originAirport ? route.originAirport.city : "N/A";
    const dest = route.destinationAirport ? route.destinationAirport.city : "N/A";
    return `${origin} → ${dest}`;
};

// Helper function to format price
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

export default function RouteFarePricesPage() {
    const [routeFarePrices, setRouteFarePrices] = useState<RouteFarePrice[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPrice, setEditingPrice] = useState<RouteFarePrice | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const isChangingPageSizeRef = useRef(false);
    const [formData, setFormData] = useState({
        routeId: "",
        fareClassCode: "",
        basePrice: "",
        taxRate: "0.1",
        feeRate: "0.05",
        effectiveFrom: "",
        effectiveTo: "",
        isActive: true,
        priority: "0",
        notes: "",
    });

    // Fetch data when page or pageSize changes
    useEffect(() => {
        // Skip if we're manually changing pageSize (to avoid double fetch)
        if (isChangingPageSizeRef.current) {
            isChangingPageSizeRef.current = false;
            return;
        }
        // Always use the latest values from state
        fetchData(currentPage, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pageSize]);

    // Fetch routes and fare classes only once on mount
    useEffect(() => {
        fetchRoutesAndFareClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRoutesAndFareClasses = async () => {
        try {
            const [routesRes, fareClassesRes] = await Promise.all([
                axiosInstance.get("/api/admin/routes").catch(() => ({ data: [] })),
                axiosInstance.get("/api/admin/fare-classes"),
            ]);
            
            // Transform routes data
            const transformedRoutes = (routesRes.data || []).map((route: any) => ({
                routeId: route.route_id,
                originAirport: route.origin_airport ? {
                    iataCode: route.origin_airport.iata_code,
                    city: route.origin_airport.city,
                } : undefined,
                destinationAirport: route.destination_airport ? {
                    iataCode: route.destination_airport.iata_code,
                    city: route.destination_airport.city,
                } : undefined,
            }));
            
            // Transform fare classes data - normalize field names
            const transformedFareClasses = (fareClassesRes.data || []).map((fc: any) => ({
                fareClassCode: fc.fare_class_code || fc.fareClassCode,
                description: fc.description || null,
                name: fc.name || null,
            }));
            
            setRoutes(transformedRoutes);
            setFareClasses(transformedFareClasses);
        } catch (err: any) {
            console.error("Error fetching routes and fare classes:", err);
        }
    };

    const fetchData = async (page: number = currentPage, limit: number = pageSize) => {
        try {
            setLoading(true);
            // Use axios params instead of query string to ensure proper encoding
            const pricesRes = await axiosInstance.get('/api/admin/route-fare-prices', {
                params: {
                    page: page,
                    limit: limit
                }
            });
            
            // Handle paginated response
            const responseData = pricesRes.data;
            
            // Check if response has pagination structure
            if (responseData.data && Array.isArray(responseData.data)) {
                // Paginated response structure
                const transformedPrices = (responseData.data || []).map((price: any) => {
                    // Transform route with nested airport data
                    let transformedRoute: Route | undefined;
                    if (price.route) {
                        const originAirport = price.route.origin_airport || price.route.originAirport;
                        const destinationAirport = price.route.destination_airport || price.route.destinationAirport;
                        
                        transformedRoute = {
                            routeId: price.route.route_id || price.route.routeId,
                            originAirport: originAirport ? {
                                iataCode: originAirport.iata_code || originAirport.iataCode,
                                city: originAirport.city || '',
                            } : undefined,
                            destinationAirport: destinationAirport ? {
                                iataCode: destinationAirport.iata_code || destinationAirport.iataCode,
                                city: destinationAirport.city || '',
                            } : undefined,
                        };
                    }
                    
                    return {
                        ...price,
                        routeFarePriceId: price.route_fare_price_id || price.routeFarePriceId,
                        routeId: price.route_id || price.routeId,
                        fareClassCode: price.fare_class_code || price.fareClassCode,
                        basePrice: typeof price.base_price === 'number' ? price.base_price : (price.basePrice || 0),
                        taxRate: typeof price.tax_rate === 'number' ? price.tax_rate : (price.taxRate || 0),
                        feeRate: typeof price.fee_rate === 'number' ? price.fee_rate : (price.feeRate || 0),
                        effectiveFrom: price.effective_from ? (typeof price.effective_from === 'string' ? price.effective_from : new Date(price.effective_from).toISOString()) : '',
                        effectiveTo: price.effective_to ? (typeof price.effective_to === 'string' ? price.effective_to : new Date(price.effective_to).toISOString()) : null,
                        isActive: price.is_active !== undefined ? price.is_active : price.isActive,
                        priority: typeof price.priority === 'number' ? price.priority : (price.priority || 0),
                        notes: price.notes || null,
                        route: transformedRoute,
                        fareClass: price.fare_class ? {
                            fareClassCode: price.fare_class.fare_class_code || price.fare_class.fareClassCode,
                            description: price.fare_class.description,
                        } : (price.fareClass || undefined),
                    };
                });
                
                setRouteFarePrices(transformedPrices);
                setTotalItems(responseData.totalItems || 0);
                setTotalPages(responseData.totalPages || 0);
            } else {
                // Fallback: handle as array (backward compatibility)
                const transformedPrices = (responseData || []).map((price: any) => {
                    let transformedRoute: Route | undefined;
                    if (price.route) {
                        const originAirport = price.route.origin_airport || price.route.originAirport;
                        const destinationAirport = price.route.destination_airport || price.route.destinationAirport;
                        
                        transformedRoute = {
                            routeId: price.route.route_id || price.route.routeId,
                            originAirport: originAirport ? {
                                iataCode: originAirport.iata_code || originAirport.iataCode,
                                city: originAirport.city || '',
                            } : undefined,
                            destinationAirport: destinationAirport ? {
                                iataCode: destinationAirport.iata_code || destinationAirport.iataCode,
                                city: destinationAirport.city || '',
                            } : undefined,
                        };
                    }
                    
                    return {
                        ...price,
                        routeFarePriceId: price.route_fare_price_id || price.routeFarePriceId,
                        routeId: price.route_id || price.routeId,
                        fareClassCode: price.fare_class_code || price.fareClassCode,
                        basePrice: typeof price.base_price === 'number' ? price.base_price : (price.basePrice || 0),
                        taxRate: typeof price.tax_rate === 'number' ? price.tax_rate : (price.taxRate || 0),
                        feeRate: typeof price.fee_rate === 'number' ? price.fee_rate : (price.feeRate || 0),
                        effectiveFrom: price.effective_from ? (typeof price.effective_from === 'string' ? price.effective_from : new Date(price.effective_from).toISOString()) : '',
                        effectiveTo: price.effective_to ? (typeof price.effective_to === 'string' ? price.effective_to : new Date(price.effective_to).toISOString()) : null,
                        isActive: price.is_active !== undefined ? price.is_active : price.isActive,
                        priority: typeof price.priority === 'number' ? price.priority : (price.priority || 0),
                        notes: price.notes || null,
                        route: transformedRoute,
                        fareClass: price.fare_class ? {
                            fareClassCode: price.fare_class.fare_class_code || price.fare_class.fareClassCode,
                            description: price.fare_class.description,
                        } : (price.fareClass || undefined),
                    };
                });
                
                setRouteFarePrices(transformedPrices);
                setTotalItems(transformedPrices.length);
                setTotalPages(1);
            }
            
            setError(null);
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePageSizeChange = (newPageSize: number) => {
        if (newPageSize !== pageSize) {
            // Set flag to skip useEffect
            isChangingPageSizeRef.current = true;
            // Update states first
            setCurrentPage(1);
            setPageSize(newPageSize);
            // Immediately fetch with new pageSize to ensure instant re-render
            // Use setTimeout to ensure state updates are flushed first
            setTimeout(() => {
                fetchData(1, newPageSize).catch(err => {
                    console.error("Error fetching data after pageSize change:", err);
                });
            }, 0);
        }
    };

    const handleCreate = async () => {
        try {
            setError(null);
            await axiosInstance.post("/api/admin/route-fare-prices", {
                routeId: formData.routeId,
                fareClassCode: formData.fareClassCode,
                basePrice: parseFloat(formData.basePrice),
                taxRate: parseFloat(formData.taxRate),
                feeRate: parseFloat(formData.feeRate),
                effectiveFrom: formData.effectiveFrom,
                effectiveTo: formData.effectiveTo || null,
                isActive: formData.isActive,
                priority: parseInt(formData.priority),
                notes: formData.notes || null,
            });
            resetForm();
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tạo giá vé");
            throw err; // Re-throw để button có thể handle
        }
    };

    const handleEdit = (price: RouteFarePrice) => {
        setEditingPrice(price);
        const effectiveFromDate = typeof price.effectiveFrom === 'string' 
            ? price.effectiveFrom.split('T')[0] 
            : '';
        const effectiveToDate = price.effectiveTo && typeof price.effectiveTo === 'string'
            ? price.effectiveTo.split('T')[0]
            : "";
        setFormData({
            routeId: price.routeId,
            fareClassCode: price.fareClassCode,
            basePrice: (price.basePrice || 0).toString(),
            taxRate: (price.taxRate || 0).toString(),
            feeRate: (price.feeRate || 0).toString(),
            effectiveFrom: effectiveFromDate,
            effectiveTo: effectiveToDate,
            isActive: price.isActive !== undefined ? price.isActive : true,
            priority: (price.priority || 0).toString(),
            notes: price.notes || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingPrice) return;
        try {
            setError(null);
            await axiosInstance.put(`/api/admin/route-fare-prices/${editingPrice.routeFarePriceId}`, {
                basePrice: parseFloat(formData.basePrice),
                taxRate: parseFloat(formData.taxRate),
                feeRate: parseFloat(formData.feeRate),
                effectiveFrom: formData.effectiveFrom,
                effectiveTo: formData.effectiveTo || null,
                isActive: formData.isActive,
                priority: parseInt(formData.priority),
                notes: formData.notes || null,
            });
            setEditingPrice(null);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể cập nhật giá vé");
            throw err; // Re-throw để button có thể handle
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa giá vé này?")) return;
        try {
            await axiosInstance.delete(`/api/admin/route-fare-prices/${id}`);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể xóa giá vé");
        }
    };

    const resetForm = () => {
        setFormData({
            routeId: "",
            fareClassCode: "",
            basePrice: "",
            taxRate: "0.1",
            feeRate: "0.05",
            effectiveFrom: "",
            effectiveTo: "",
            isActive: true,
            priority: "0",
            notes: "",
        });
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
                        <TrendingUp className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Quản lý giá vé theo route</h1>
                    </div>
                    <p className="text-blue-50 text-lg">Quản lý và điều chỉnh giá vé cho từng route và hạng vé</p>
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
                                <p className="text-sm font-medium text-gray-600">Tổng số giá vé</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-[#00558f]/10 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-[#00558f]" />
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
                                    {routeFarePrices.filter(p => p.isActive).length}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">(chỉ trên trang hiện tại)</p>
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
                                <p className="text-sm font-medium text-gray-600">Tổng số routes</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{routes.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-[#3775A4]/10 flex items-center justify-center">
                                <Plane className="h-6 w-6 text-[#3775A4]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Bar - Redesigned with Modern Spacious Layout */}
            <Card className="border border-gray-200 shadow-sm rounded-xl">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                        {/* Left Side: Filter Group (Segmented Control Style) */}
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

                        {/* Middle: Search Input - Full Width with Proper Spacing */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                            <Input
                                placeholder="Tìm kiếm theo route, hạng vé, thành phố..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 h-12 w-full text-base border-gray-300 focus:border-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 bg-white"
                            />
                        </div>

                        {/* Right Side: Primary Action Button */}
                        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                            setIsCreateDialogOpen(open);
                            if (!open) {
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
                                    Thêm giá vé mới
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-bold text-gray-900">Thêm giá vé mới</DialogTitle>
                                    <DialogDescription className="text-base text-gray-600 mt-2">
                                        Tạo giá vé mới cho route và hạng vé
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                                    {/* Route Selection */}
                                    <div className="grid gap-3">
                                        <Label htmlFor="routeId" className="text-base font-semibold text-gray-700">
                                            Route <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Select
                                            value={formData.routeId}
                                            onValueChange={(value) => setFormData({ ...formData, routeId: value })}
                                        >
                                            <SelectTrigger className="h-14 text-base">
                                                <SelectValue placeholder="Chọn route" />
                                            </SelectTrigger>
                                            <SelectContent className="text-base">
                                                {routes.map((route) => (
                                                    <SelectItem key={route.routeId} value={route.routeId} className="text-base py-3">
                                                        {formatRoute(route)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Fare Class Selection */}
                                    <div className="grid gap-3">
                                        <Label htmlFor="fareClassCode" className="text-base font-semibold text-gray-700">
                                            Hạng vé <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Select
                                            value={formData.fareClassCode}
                                            onValueChange={(value) => setFormData({ ...formData, fareClassCode: value })}
                                        >
                                            <SelectTrigger className="h-14 text-base">
                                                <SelectValue placeholder="Chọn hạng vé" />
                                            </SelectTrigger>
                                            <SelectContent className="text-base">
                                                {fareClasses.map((fc) => (
                                                    <SelectItem key={fc.fareClassCode} value={fc.fareClassCode} className="text-base py-3">
                                                        {fc.description || fc.name || fc.fareClassCode}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Base Price */}
                                    <div className="grid gap-3">
                                        <Label htmlFor="basePrice" className="text-base font-semibold text-gray-700">
                                            Giá cơ bản (VND) <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="basePrice"
                                            type="number"
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                            placeholder="Nhập giá cơ bản, ví dụ: 1577000"
                                            min="0"
                                            className="h-14 text-base"
                                        />
                                    </div>

                                    {/* Tax Rate and Fee Rate */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="taxRate" className="text-base font-semibold text-gray-700">
                                                Thuế suất (%)
                                            </Label>
                                            <Input
                                                id="taxRate"
                                                type="number"
                                                step="0.01"
                                                value={(parseFloat(formData.taxRate) * 100).toString()}
                                                onChange={(e) => setFormData({ ...formData, taxRate: (parseFloat(e.target.value) / 100).toString() })}
                                                placeholder="10"
                                                min="0"
                                                max="100"
                                                className="h-14 text-base"
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="feeRate" className="text-base font-semibold text-gray-700">
                                                Phí suất (%)
                                            </Label>
                                            <Input
                                                id="feeRate"
                                                type="number"
                                                step="0.01"
                                                value={(parseFloat(formData.feeRate) * 100).toString()}
                                                onChange={(e) => setFormData({ ...formData, feeRate: (parseFloat(e.target.value) / 100).toString() })}
                                                placeholder="5"
                                                min="0"
                                                max="100"
                                                className="h-14 text-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Effective Dates - Calendar Component */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="effectiveFrom" className="text-base font-semibold text-gray-700">
                                                Có hiệu lực từ <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`h-14 text-base justify-start text-left font-normal ${
                                                            !formData.effectiveFrom ? "text-muted-foreground" : ""
                                                        }`}
                                                    >
                                                        <CalendarIcon className="mr-2 h-5 w-5" />
                                                        {formData.effectiveFrom ? (
                                                            format(new Date(formData.effectiveFrom), "dd/MM/yyyy", { locale: vi })
                                                        ) : (
                                                            <span>Chọn ngày</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.effectiveFrom ? new Date(formData.effectiveFrom) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                setFormData({
                                                                    ...formData,
                                                                    effectiveFrom: format(date, "yyyy-MM-dd")
                                                                });
                                                            }
                                                        }}
                                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                        captionLayout="dropdown"
                                                        className="rounded-md border shadow-sm"
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="effectiveTo" className="text-base font-semibold text-gray-700">
                                                Có hiệu lực đến
                                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`h-14 text-base justify-start text-left font-normal ${
                                                            !formData.effectiveTo ? "text-muted-foreground" : ""
                                                        }`}
                                                    >
                                                        <CalendarIcon className="mr-2 h-5 w-5" />
                                                        {formData.effectiveTo ? (
                                                            format(new Date(formData.effectiveTo), "dd/MM/yyyy", { locale: vi })
                                                        ) : (
                                                            <span>Chọn ngày</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.effectiveTo ? new Date(formData.effectiveTo) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                setFormData({
                                                                    ...formData,
                                                                    effectiveTo: format(date, "yyyy-MM-dd")
                                                                });
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    effectiveTo: ""
                                                                });
                                                            }
                                                        }}
                                                        disabled={(date) => {
                                                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                                                            const minDate = formData.effectiveFrom ? new Date(formData.effectiveFrom) : today;
                                                            return date < minDate;
                                                        }}
                                                        captionLayout="dropdown"
                                                        className="rounded-md border shadow-sm"
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    {/* Priority and Active Status */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="priority" className="text-base font-semibold text-gray-700">
                                                Độ ưu tiên
                                            </Label>
                                            <Input
                                                id="priority"
                                                type="number"
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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

                                    {/* Notes */}
                                    <div className="grid gap-3">
                                        <Label htmlFor="notes" className="text-base font-semibold text-gray-700">
                                            Ghi chú
                                            <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="VD: Giá khuyến mãi mùa hè"
                                            className="min-h-[140px] text-base resize-none"
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
                            <CardTitle className="text-2xl font-bold text-gray-900">Danh sách giá vé</CardTitle>
                            <CardDescription className="mt-2 text-base font-medium text-gray-600">
                                Hiển thị {routeFarePrices.length} / {totalItems.toLocaleString('vi-VN')} giá vé
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold text-gray-700 text-base">Route</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Hạng vé</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Giá cơ bản</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Thuế</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Phí</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Hiệu lực</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Trạng thái</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 text-base">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {routeFarePrices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Plane className="h-12 w-12 mb-4 opacity-50" />
                                                <p className="text-lg font-medium">Không có giá vé nào</p>
                                                <p className="text-sm mt-1">Hãy thêm giá vé mới</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    routeFarePrices.map((price, index) => (
                                        <TableRow 
                                            key={price.routeFarePriceId}
                                            className="hover:bg-[#00558f]/5 transition-colors"
                                        >
                                            <TableCell className="font-medium text-base">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-[#00558f]/10 flex items-center justify-center flex-shrink-0">
                                                        <Plane className="h-5 w-5 text-[#00558f]" />
                                                    </div>
                                                    <span className="text-base">{formatRoute(price.route)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-base">
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-[#3775A4]/10 text-[#3775A4]">
                                                    {price.fareClassCode}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-bold text-[#00558f] text-base">
                                                {formatPrice(price.basePrice || 0)}
                                            </TableCell>
                                            <TableCell className="text-gray-700 text-base">
                                                {((price.taxRate || 0) * 100).toFixed(1)}%
                                            </TableCell>
                                            <TableCell className="text-gray-700 text-base">
                                                {((price.feeRate || 0) * 100).toFixed(1)}%
                                            </TableCell>
                                            <TableCell className="text-base text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                                    <span>
                                                        {price.effectiveFrom 
                                                            ? new Date(price.effectiveFrom).toLocaleDateString('vi-VN')
                                                            : 'N/A'} - {price.effectiveTo 
                                                                ? new Date(price.effectiveTo).toLocaleDateString('vi-VN')
                                                                : 'Vô thời hạn'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-base">
                                                <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                                                    price.isActive 
                                                        ? 'bg-[#7ED957]/10 text-[#64AF53]' 
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {price.isActive ? (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Hoạt động
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4" />
                                                            Không hoạt động
                                                        </>
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-base">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(price)}
                                                        className="h-10 w-10 p-0 hover:bg-[#00558f]/10 hover:text-[#00558f]"
                                                    >
                                                        <Pencil className="h-6 w-6" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(price.routeFarePriceId)}
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

            {/* Pagination Controls - Redesigned with Landing Page Colors */}
            {totalPages > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
                        {/* Left: Items per page selector */}
                        <div className="flex items-center gap-3">
                            <span className="text-base font-semibold text-gray-700 whitespace-nowrap">
                                Hiển thị:
                            </span>
                            <Select
                                value={pageSize.toString()}
                                onValueChange={async (value) => {
                                    const newSize = parseInt(value);
                                    if (newSize !== pageSize) {
                                        // Set flag to skip useEffect
                                        isChangingPageSizeRef.current = true;
                                        
                                        // Update states first
                                        setCurrentPage(1);
                                        setPageSize(newSize);
                                        
                                        // Immediately fetch with new pageSize
                                        // Don't await - let it run in background
                                        fetchData(1, newSize).catch((err: any) => {
                                            console.error("Error fetching data:", err);
                                            setError(err.response?.data?.message || "Không thể tải dữ liệu");
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger 
                                    id="pageSize" 
                                    className="h-12 w-[90px] border-gray-300 focus:border-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 text-base font-semibold bg-white hover:border-[#00558f]/60 transition-colors"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="20" className="text-base py-3">20</SelectItem>
                                    <SelectItem value="50" className="text-base py-3">50</SelectItem>
                                    <SelectItem value="100" className="text-base py-3">100</SelectItem>
                                    <SelectItem value="200" className="text-base py-3">200</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-base text-gray-600 whitespace-nowrap font-semibold">
                                / {totalItems.toLocaleString('vi-VN')} mục
                            </span>
                        </div>

                        {/* Center: Pagination Navigation */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`h-12 px-5 rounded-lg border transition-all duration-200 text-base font-semibold flex items-center gap-2 ${
                                        currentPage === 1
                                            ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                            : "border-gray-300 text-gray-700 bg-white hover:bg-[#00558f] hover:text-white hover:border-[#00558f] hover:shadow-sm"
                                    }`}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                    <span className="hidden sm:inline">Trước</span>
                                </button>
                                
                                {/* Page numbers */}
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                        let pageNumber: number;
                                        if (totalPages <= 7) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 4) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 3) {
                                            pageNumber = totalPages - 6 + i;
                                        } else {
                                            pageNumber = currentPage - 3 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                className={`h-12 w-12 rounded-lg border transition-all duration-200 text-base font-bold ${
                                                    pageNumber === currentPage
                                                        ? "bg-[#00558f] text-white border-[#00558f] shadow-md scale-105"
                                                        : "border-gray-300 text-gray-700 bg-white hover:bg-[#00558f]/10 hover:border-[#00558f]/60 hover:text-[#00558f]"
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`h-12 px-5 rounded-lg border transition-all duration-200 text-base font-semibold flex items-center gap-2 ${
                                        currentPage === totalPages
                                            ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                                            : "border-gray-300 text-gray-700 bg-white hover:bg-[#00558f] hover:text-white hover:border-[#00558f] hover:shadow-sm"
                                    }`}
                                >
                                    <span className="hidden sm:inline">Sau</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {/* Right: Page info */}
                        <div className="text-base font-bold text-gray-700 whitespace-nowrap">
                            Trang <span className="text-[#00558f] text-lg">{currentPage}</span> / <span className="text-gray-600">{totalPages}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) {
                    setEditingPrice(null);
                }
            }}>
                <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Chỉnh sửa giá vé</DialogTitle>
                        <DialogDescription className="text-base text-gray-600 mt-2">
                            Cập nhật thông tin giá vé cho route {editingPrice && formatRoute(editingPrice.route)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                        {/* Base Price */}
                        <div className="grid gap-3">
                            <Label htmlFor="edit-basePrice" className="text-base font-semibold text-gray-700">
                                Giá cơ bản (VND) <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="edit-basePrice"
                                type="number"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                placeholder="Nhập giá cơ bản, ví dụ: 1577000"
                                min="0"
                                className="h-14 text-base"
                            />
                        </div>

                        {/* Tax Rate and Fee Rate */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="edit-taxRate" className="text-base font-semibold text-gray-700">
                                    Thuế suất (%)
                                </Label>
                                <Input
                                    id="edit-taxRate"
                                    type="number"
                                    step="0.01"
                                    value={(parseFloat(formData.taxRate) * 100).toString()}
                                    onChange={(e) => setFormData({ ...formData, taxRate: (parseFloat(e.target.value) / 100).toString() })}
                                    placeholder="10"
                                    min="0"
                                    max="100"
                                    className="h-14 text-base"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="edit-feeRate" className="text-base font-semibold text-gray-700">
                                    Phí suất (%)
                                </Label>
                                <Input
                                    id="edit-feeRate"
                                    type="number"
                                    step="0.01"
                                    value={(parseFloat(formData.feeRate) * 100).toString()}
                                    onChange={(e) => setFormData({ ...formData, feeRate: (parseFloat(e.target.value) / 100).toString() })}
                                    placeholder="5"
                                    min="0"
                                    max="100"
                                    className="h-14 text-base"
                                />
                            </div>
                        </div>

                        {/* Effective Dates - Calendar Component */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="edit-effectiveFrom" className="text-base font-semibold text-gray-700">
                                    Có hiệu lực từ <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`h-14 text-base justify-start text-left font-normal ${
                                                !formData.effectiveFrom ? "text-muted-foreground" : ""
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-5 w-5" />
                                            {formData.effectiveFrom ? (
                                                format(new Date(formData.effectiveFrom), "dd/MM/yyyy", { locale: vi })
                                            ) : (
                                                <span>Chọn ngày</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.effectiveFrom ? new Date(formData.effectiveFrom) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setFormData({
                                                        ...formData,
                                                        effectiveFrom: format(date, "yyyy-MM-dd")
                                                    });
                                                }
                                            }}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            captionLayout="dropdown"
                                            className="rounded-md border shadow-sm"
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="edit-effectiveTo" className="text-base font-semibold text-gray-700">
                                    Có hiệu lực đến
                                    <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`h-14 text-base justify-start text-left font-normal ${
                                                !formData.effectiveTo ? "text-muted-foreground" : ""
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-5 w-5" />
                                            {formData.effectiveTo ? (
                                                format(new Date(formData.effectiveTo), "dd/MM/yyyy", { locale: vi })
                                            ) : (
                                                <span>Chọn ngày</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.effectiveTo ? new Date(formData.effectiveTo) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setFormData({
                                                        ...formData,
                                                        effectiveTo: format(date, "yyyy-MM-dd")
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        effectiveTo: ""
                                                    });
                                                }
                                            }}
                                            disabled={(date) => {
                                                const today = new Date(new Date().setHours(0, 0, 0, 0));
                                                const minDate = formData.effectiveFrom ? new Date(formData.effectiveFrom) : today;
                                                return date < minDate;
                                            }}
                                            captionLayout="dropdown"
                                            className="rounded-md border shadow-sm"
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Priority and Active Status */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="edit-priority" className="text-base font-semibold text-gray-700">
                                    Độ ưu tiên
                                </Label>
                                <Input
                                    id="edit-priority"
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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

                        {/* Notes */}
                        <div className="grid gap-3">
                            <Label htmlFor="edit-notes" className="text-base font-semibold text-gray-700">
                                Ghi chú
                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                            </Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="VD: Giá khuyến mãi mùa hè"
                                className="min-h-[140px] text-base resize-none"
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
