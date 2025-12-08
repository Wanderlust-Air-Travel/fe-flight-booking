"use client";

import { useState, useEffect } from "react";
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
import { Plus, Pencil, Trash2, Search, Luggage, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Package } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FareClass } from "@/types/admin/route-fare-price-type";
import { BaggageAllowance } from "@/types/admin/baggage-allowance-type";

/**
 * Transform snake_case string to camelCase
 * Examples: fare_class_code -> fareClassCode, checked_baggage_kg -> checkedBaggageKg
 */
function snakeToCamel(str: string): string {
    return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform object keys from snake_case to camelCase recursively
 * Handles nested objects and arrays
 */
function transformKeysToCamelCase<T>(obj: any): T {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => transformKeysToCamelCase(item)) as T;
    }
    
    if (typeof obj === 'object' && obj.constructor === Object) {
        const transformed: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const camelKey = snakeToCamel(key);
                transformed[camelKey] = transformKeysToCamelCase(obj[key]);
            }
        }
        return transformed as T;
    }
    
    return obj;
}

export default function BaggageAllowancesPage() {
    const [baggageAllowances, setBaggageAllowances] = useState<BaggageAllowance[]>([]);
    const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingAllowance, setEditingAllowance] = useState<BaggageAllowance | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        fareClassCode: "",
        checkedBaggageKg: "",
        checkedBaggagePieces: "",
        carryOnKg: "7",
        carryOnPieces: "1",
        carryOnDimensions: "55x40x20",
        isDomestic: true,
        isInternational: true,
        notes: "",
    });

    useEffect(() => {
        fetchData();
        // Fetch fare classes only once (not paginated)
        fetchFareClasses();
    }, [currentPage, pageSize]);
    
    const fetchFareClasses = async () => {
        try {
            const fareClassesRes = await axiosInstance.get("/api/admin/fare-classes");
            const rawFareClassesData = Array.isArray(fareClassesRes.data)
                ? fareClassesRes.data
                : fareClassesRes.data?.data || fareClassesRes.data?.items || [];
            const fareClassesData = transformKeysToCamelCase<FareClass[]>(rawFareClassesData);
            setFareClasses(fareClassesData);
        } catch (err: any) {
            console.error("Error fetching fare classes:", err);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const allowancesRes = await axiosInstance.get(
                `/api/admin/baggage-allowances?page=${currentPage}&limit=${pageSize}`
            );
            
            // Handle paginated response
            const responseData = allowancesRes.data;
            
            // Check if response has pagination structure
            if (responseData.data && Array.isArray(responseData.data)) {
                // Paginated response structure
                const rawAllowancesData = responseData.data;
                const allowancesData = transformKeysToCamelCase<BaggageAllowance[]>(rawAllowancesData);
                
                setBaggageAllowances(allowancesData);
                setTotalItems(responseData.totalItems || 0);
                setTotalPages(responseData.totalPages || 0);
            } else {
                // Fallback: handle as array (backward compatibility)
                const rawAllowancesData = Array.isArray(responseData) 
                    ? responseData 
                    : responseData?.data || responseData?.items || [];
                const allowancesData = transformKeysToCamelCase<BaggageAllowance[]>(rawAllowancesData);
                
                setBaggageAllowances(allowancesData);
                setTotalItems(allowancesData.length);
                setTotalPages(1);
            }
        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.response?.data?.message || err.message || "Không thể tải dữ liệu");
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

    const handlePageSizeChange = async (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleCreate = async () => {
        try {
            await axiosInstance.post("/api/admin/baggage-allowances", {
                fareClassCode: formData.fareClassCode,
                checkedBaggageKg: formData.checkedBaggageKg ? parseFloat(formData.checkedBaggageKg) : null,
                checkedBaggagePieces: formData.checkedBaggagePieces ? parseInt(formData.checkedBaggagePieces) : null,
                carryOnKg: parseFloat(formData.carryOnKg),
                carryOnPieces: parseInt(formData.carryOnPieces),
                carryOnDimensions: formData.carryOnDimensions || null,
                isDomestic: formData.isDomestic,
                isInternational: formData.isInternational,
                notes: formData.notes || null,
            });
            setIsCreateDialogOpen(false);
            resetForm();
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tạo quy định hành lý");
        }
    };

    const handleEdit = (allowance: BaggageAllowance) => {
        setEditingAllowance(allowance);
        setFormData({
            fareClassCode: allowance.fareClassCode,
            checkedBaggageKg: allowance.checkedBaggageKg?.toString() || "",
            checkedBaggagePieces: allowance.checkedBaggagePieces?.toString() || "",
            carryOnKg: allowance.carryOnKg.toString(),
            carryOnPieces: allowance.carryOnPieces.toString(),
            carryOnDimensions: allowance.carryOnDimensions || "",
            isDomestic: allowance.isDomestic,
            isInternational: allowance.isInternational,
            notes: allowance.notes || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingAllowance) return;
        try {
            await axiosInstance.put(`/api/admin/baggage-allowances/${editingAllowance.baggageAllowanceId}`, {
                checkedBaggageKg: formData.checkedBaggageKg ? parseFloat(formData.checkedBaggageKg) : null,
                checkedBaggagePieces: formData.checkedBaggagePieces ? parseInt(formData.checkedBaggagePieces) : null,
                carryOnKg: parseFloat(formData.carryOnKg),
                carryOnPieces: parseInt(formData.carryOnPieces),
                carryOnDimensions: formData.carryOnDimensions || null,
                isDomestic: formData.isDomestic,
                isInternational: formData.isInternational,
                notes: formData.notes || null,
            });
            setIsEditDialogOpen(false);
            setEditingAllowance(null);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể cập nhật quy định hành lý");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa quy định hành lý này?")) return;
        try {
            await axiosInstance.delete(`/api/admin/baggage-allowances/${id}`);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể xóa quy định hành lý");
        }
    };

    const resetForm = () => {
        setFormData({
            fareClassCode: "",
            checkedBaggageKg: "",
            checkedBaggagePieces: "",
            carryOnKg: "7",
            carryOnPieces: "1",
            carryOnDimensions: "55x40x20",
            isDomestic: true,
            isInternational: true,
            notes: "",
        });
    };

    // Filter baggage allowances based on search query
    const filteredAllowances = baggageAllowances.filter((allowance) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const fareClass = fareClasses.find(fc => fc.fareClassCode === allowance.fareClassCode);
        const fareClassText = fareClass ? `${fareClass.fareClassCode} ${fareClass.description || ''} ${fareClass.name || ''}`.toLowerCase() : '';
        return fareClassText.includes(query);
    });

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
                        <Luggage className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Quản lý quy định hành lý</h1>
                    </div>
                    <p className="text-blue-50 text-lg">Quản lý quy định hành lý cho từng fare class</p>
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
                                <p className="text-sm font-medium text-gray-600">Tổng số quy định</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
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
                                <p className="text-sm font-medium text-gray-600">Nội địa</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {baggageAllowances.filter(a => a.isDomestic).length}
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
                                <p className="text-sm font-medium text-gray-600">Quốc tế</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {baggageAllowances.filter(a => a.isInternational).length}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">(chỉ trên trang hiện tại)</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-[#3775A4]/10 flex items-center justify-center">
                                <Luggage className="h-6 w-6 text-[#3775A4]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Bar - Redesigned with Modern Spacious Layout */}
            <Card className="border border-gray-200 shadow-sm rounded-xl">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                        {/* Middle: Search Input - Full Width with Proper Spacing */}
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                            <Input
                                placeholder="Tìm kiếm theo fare class..."
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
                                    Thêm quy định hành lý
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[30vw] md:max-w-[30vw] lg:max-w-[30vw] xl:max-w-[40vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-bold text-gray-900">Thêm quy định hành lý mới</DialogTitle>
                                    <DialogDescription className="text-base text-gray-600 mt-2">
                                        Tạo quy định hành lý mới cho fare class
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                                    <div className="grid gap-3">
                                        <Label htmlFor="fareClassCode" className="text-base font-semibold text-gray-700">
                                            Fare Class <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Select
                                            value={formData.fareClassCode}
                                            onValueChange={(value) => setFormData({ ...formData, fareClassCode: value })}
                                        >
                                            <SelectTrigger className="h-14 text-base">
                                                <SelectValue placeholder="Chọn fare class" />
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
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="checkedBaggageKg" className="text-base font-semibold text-gray-700">
                                                Hành lý ký gửi (kg)
                                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                            </Label>
                                            <Input
                                                id="checkedBaggageKg"
                                                type="number"
                                                value={formData.checkedBaggageKg}
                                                onChange={(e) => setFormData({ ...formData, checkedBaggageKg: e.target.value })}
                                                placeholder="20"
                                                min="0"
                                                className="h-14 text-base"
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="checkedBaggagePieces" className="text-base font-semibold text-gray-700">
                                                Số lượng hành lý ký gửi
                                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                            </Label>
                                            <Input
                                                id="checkedBaggagePieces"
                                                type="number"
                                                value={formData.checkedBaggagePieces}
                                                onChange={(e) => setFormData({ ...formData, checkedBaggagePieces: e.target.value })}
                                                placeholder="1"
                                                min="0"
                                                className="h-14 text-base"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="carryOnKg" className="text-base font-semibold text-gray-700">
                                                Hành lý xách tay (kg) <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="carryOnKg"
                                                type="number"
                                                value={formData.carryOnKg}
                                                onChange={(e) => setFormData({ ...formData, carryOnKg: e.target.value })}
                                                placeholder="7"
                                                min="0"
                                                className="h-14 text-base"
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="carryOnPieces" className="text-base font-semibold text-gray-700">
                                                Số lượng hành lý xách tay <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="carryOnPieces"
                                                type="number"
                                                value={formData.carryOnPieces}
                                                onChange={(e) => setFormData({ ...formData, carryOnPieces: e.target.value })}
                                                placeholder="1"
                                                min="0"
                                                className="h-14 text-base"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="carryOnDimensions" className="text-base font-semibold text-gray-700">
                                            Kích thước hành lý xách tay (cm)
                                            <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                        </Label>
                                        <Input
                                            id="carryOnDimensions"
                                            value={formData.carryOnDimensions}
                                            onChange={(e) => setFormData({ ...formData, carryOnDimensions: e.target.value })}
                                            placeholder="55x40x20"
                                            className="h-14 text-base"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="grid gap-3">
                                            <Label className="text-base font-semibold text-gray-700">
                                                Trạng thái
                                            </Label>
                                            <div className="flex items-center h-14 px-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    id="isDomestic"
                                                    checked={formData.isDomestic}
                                                    onChange={(e) => setFormData({ ...formData, isDomestic: e.target.checked })}
                                                    className="h-5 w-5 rounded border-gray-300 text-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 cursor-pointer"
                                                />
                                                <Label htmlFor="isDomestic" className="text-base font-semibold text-gray-700 cursor-pointer ml-3 flex-1">
                                                    Áp dụng cho chuyến bay nội địa
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="grid gap-3">
                                            <Label className="text-base font-semibold text-gray-700">
                                                Trạng thái
                                            </Label>
                                            <div className="flex items-center h-14 px-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    id="isInternational"
                                                    checked={formData.isInternational}
                                                    onChange={(e) => setFormData({ ...formData, isInternational: e.target.checked })}
                                                    className="h-5 w-5 rounded border-gray-300 text-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 cursor-pointer"
                                                />
                                                <Label htmlFor="isInternational" className="text-base font-semibold text-gray-700 cursor-pointer ml-3 flex-1">
                                                    Áp dụng cho chuyến bay quốc tế
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="notes" className="text-base font-semibold text-gray-700">
                                            Ghi chú
                                            <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="VD: Maximum weight per piece: 32kg"
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
                            <CardTitle className="text-2xl font-bold text-gray-900">Danh sách quy định hành lý</CardTitle>
                            <CardDescription className="mt-2 text-base font-medium text-gray-600">
                                Hiển thị {filteredAllowances.length} / {totalItems.toLocaleString('vi-VN')} quy định hành lý
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold text-gray-700 text-base">Fare Class</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Hành lý ký gửi</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Hành lý xách tay</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Kích thước</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Áp dụng</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 text-base">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAllowances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Luggage className="h-12 w-12 mb-4 opacity-50" />
                                                <p className="text-lg font-medium">Không có quy định hành lý nào</p>
                                                <p className="text-sm mt-1">Hãy thêm quy định hành lý mới</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAllowances.map((allowance) => (
                                        <TableRow 
                                            key={allowance.baggageAllowanceId}
                                            className="hover:bg-[#00558f]/5 transition-colors"
                                        >
                                            <TableCell className="font-medium text-base">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-[#00558f]/10 flex items-center justify-center flex-shrink-0">
                                                        <Package className="h-5 w-5 text-[#00558f]" />
                                                    </div>
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-[#3775A4]/10 text-[#3775A4]">
                                                        {allowance.fareClassCode}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-base text-gray-700">
                                                {allowance.checkedBaggageKg && allowance.checkedBaggagePieces
                                                    ? `${allowance.checkedBaggagePieces} x ${allowance.checkedBaggageKg}kg`
                                                    : "Không có"}
                                            </TableCell>
                                            <TableCell className="text-base text-gray-700">
                                                {allowance.carryOnPieces} x {allowance.carryOnKg}kg
                                            </TableCell>
                                            <TableCell className="text-base text-gray-700">{allowance.carryOnDimensions || "-"}</TableCell>
                                            <TableCell className="text-base">
                                                <div className="flex flex-col gap-1.5">
                                                    {allowance.isDomestic && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Nội địa
                                                        </span>
                                                    )}
                                                    {allowance.isInternational && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Quốc tế
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-base">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(allowance)}
                                                        className="h-10 w-10 p-0 hover:bg-[#00558f]/10 hover:text-[#00558f]"
                                                    >
                                                        <Pencil className="h-6 w-6" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(allowance.baggageAllowanceId)}
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
                                    await handlePageSizeChange(newSize);
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
                    setEditingAllowance(null);
                }
            }}>
                <DialogContent className="sm:max-w-[30vw] md:max-w-[30vw] lg:max-w-[30vw] xl:max-w-[40vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Chỉnh sửa quy định hành lý</DialogTitle>
                        <DialogDescription className="text-base text-gray-600 mt-2">
                            Cập nhật thông tin quy định hành lý cho {editingAllowance && editingAllowance.fareClassCode}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="edit-checkedBaggageKg" className="text-base font-semibold text-gray-700">
                                    Hành lý ký gửi (kg)
                                    <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                </Label>
                                <Input
                                    id="edit-checkedBaggageKg"
                                    type="number"
                                    value={formData.checkedBaggageKg}
                                    onChange={(e) => setFormData({ ...formData, checkedBaggageKg: e.target.value })}
                                    min="0"
                                    className="h-14 text-base"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="edit-checkedBaggagePieces" className="text-base font-semibold text-gray-700">
                                    Số lượng hành lý ký gửi
                                    <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                </Label>
                                <Input
                                    id="edit-checkedBaggagePieces"
                                    type="number"
                                    value={formData.checkedBaggagePieces}
                                    onChange={(e) => setFormData({ ...formData, checkedBaggagePieces: e.target.value })}
                                    min="0"
                                    className="h-14 text-base"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="edit-carryOnKg" className="text-base font-semibold text-gray-700">
                                    Hành lý xách tay (kg) <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="edit-carryOnKg"
                                    type="number"
                                    value={formData.carryOnKg}
                                    onChange={(e) => setFormData({ ...formData, carryOnKg: e.target.value })}
                                    min="0"
                                    className="h-14 text-base"
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="edit-carryOnPieces" className="text-base font-semibold text-gray-700">
                                    Số lượng hành lý xách tay <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="edit-carryOnPieces"
                                    type="number"
                                    value={formData.carryOnPieces}
                                    onChange={(e) => setFormData({ ...formData, carryOnPieces: e.target.value })}
                                    min="0"
                                    className="h-14 text-base"
                                />
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit-carryOnDimensions" className="text-base font-semibold text-gray-700">
                                Kích thước hành lý xách tay (cm)
                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                            </Label>
                            <Input
                                id="edit-carryOnDimensions"
                                value={formData.carryOnDimensions}
                                onChange={(e) => setFormData({ ...formData, carryOnDimensions: e.target.value })}
                                className="h-14 text-base"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-3">
                                <Label className="text-base font-semibold text-gray-700">
                                    Trạng thái
                                </Label>
                                <div className="flex items-center h-14 px-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        id="edit-isDomestic"
                                        checked={formData.isDomestic}
                                        onChange={(e) => setFormData({ ...formData, isDomestic: e.target.checked })}
                                        className="h-5 w-5 rounded border-gray-300 text-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 cursor-pointer"
                                    />
                                    <Label htmlFor="edit-isDomestic" className="text-base font-semibold text-gray-700 cursor-pointer ml-3 flex-1">
                                        Áp dụng cho chuyến bay nội địa
                                    </Label>
                                </div>
                            </div>
                            <div className="grid gap-3">
                                <Label className="text-base font-semibold text-gray-700">
                                    Trạng thái
                                </Label>
                                <div className="flex items-center h-14 px-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        id="edit-isInternational"
                                        checked={formData.isInternational}
                                        onChange={(e) => setFormData({ ...formData, isInternational: e.target.checked })}
                                        className="h-5 w-5 rounded border-gray-300 text-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 cursor-pointer"
                                    />
                                    <Label htmlFor="edit-isInternational" className="text-base font-semibold text-gray-700 cursor-pointer ml-3 flex-1">
                                        Áp dụng cho chuyến bay quốc tế
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit-notes" className="text-base font-semibold text-gray-700">
                                Ghi chú
                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                            </Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="VD: Maximum weight per piece: 32kg"
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
