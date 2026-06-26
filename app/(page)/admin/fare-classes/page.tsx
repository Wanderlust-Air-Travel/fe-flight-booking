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
import { Plus, Pencil, Trash2, Search, DollarSign, CheckCircle2, Package } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FareClass } from "@/types/admin/fare-class-type";

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

export default function FareClassesPage() {
    const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingFareClass, setEditingFareClass] = useState<FareClass | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        fareClassCode: "",
        cabinClassCode: "",
        description: "",
        changeRule: "",
        refundRule: "",
    });

    useEffect(() => {
        fetchFareClasses();
    }, []);

    const fetchFareClasses = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/admin/fare-classes");
            
            // Handle response data - ensure it's an array
            const rawData = Array.isArray(response.data) 
                ? response.data 
                : response.data?.data || response.data?.items || [];
            
            // Transform snake_case keys to camelCase (backend returns snake_case, frontend expects camelCase)
            const transformedData = transformKeysToCamelCase<FareClass[]>(rawData);
            
            // Ensure each fare class has cabinClassCode at top level for backward compatibility
            const fareClassesWithCabinCode = transformedData.map((fc: any) => ({
                ...fc,
                cabinClassCode: fc.cabinClass?.cabinClassCode || fc.cabinClassCode || '',
            }));
            
            setFareClasses(fareClassesWithCabinCode);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching fare classes:", err);
            setError(err.response?.data?.message || "Không thể tải danh sách hạng vé");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await axiosInstance.post("/api/admin/fare-classes", formData);
            setIsCreateDialogOpen(false);
            resetForm();
            fetchFareClasses();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tạo hạng vé");
        }
    };

    const handleEdit = (fareClass: FareClass) => {
        setEditingFareClass(fareClass);
        // Get cabinClassCode from nested cabinClass if available, otherwise use top-level
        const cabinClassCode = fareClass.cabinClass?.cabinClassCode || fareClass.cabinClassCode || '';
        setFormData({
            fareClassCode: fareClass.fareClassCode,
            cabinClassCode: cabinClassCode,
            description: fareClass.description || "",
            changeRule: fareClass.changeRule || "",
            refundRule: fareClass.refundRule || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingFareClass) return;
        try {
            await axiosInstance.put(
                `/api/admin/fare-classes/${editingFareClass.fareClassCode}`,
                {
                    description: formData.description,
                    changeRule: formData.changeRule,
                    refundRule: formData.refundRule,
                }
            );
            setIsEditDialogOpen(false);
            setEditingFareClass(null);
            fetchFareClasses();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể cập nhật hạng vé");
        }
    };

    const handleDelete = async (fareClassCode: string) => {
        if (!confirm(`Bạn có chắc muốn xóa hạng vé ${fareClassCode}?`)) return;
        try {
            await axiosInstance.delete(`/api/admin/fare-classes/${fareClassCode}`);
            fetchFareClasses();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể xóa hạng vé");
        }
    };

    const resetForm = () => {
        setFormData({
            fareClassCode: "",
            cabinClassCode: "",
            description: "",
            changeRule: "",
            refundRule: "",
        });
    };

    // Filter fare classes based on search query
    const filteredFareClasses = useMemo(() => {
        if (!searchQuery) return fareClasses;
        const query = searchQuery.toLowerCase();
        return fareClasses.filter((fc) => {
            const fareClassCode = fc.fareClassCode?.toLowerCase() || '';
            const description = fc.description?.toLowerCase() || '';
            const cabinClass = (fc.cabinClass?.name || fc.cabinClassCode || '').toLowerCase();
            return fareClassCode.includes(query) || description.includes(query) || cabinClass.includes(query);
        });
    }, [fareClasses, searchQuery]);

    // Get unique cabin classes count
    const uniqueCabinClasses = useMemo(() => {
        const cabinSet = new Set<string>();
        fareClasses.forEach(fc => {
            const cabinCode = fc.cabinClass?.cabinClassCode || fc.cabinClassCode || '';
            if (cabinCode) cabinSet.add(cabinCode);
        });
        return cabinSet.size;
    }, [fareClasses]);

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
                        <DollarSign className="h-8 w-8" />
                        <h1 className="text-3xl font-bold">Quản lý hạng vé</h1>
                    </div>
                    <p className="text-blue-50 text-lg">Quản lý hạng vé và giá cả</p>
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
                                <p className="text-sm font-medium text-gray-600">Tổng số hạng vé</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{fareClasses.length}</p>
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
                                <p className="text-sm font-medium text-gray-600">Số hạng cabin</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{uniqueCabinClasses}</p>
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
                                <p className="text-sm font-medium text-gray-600">Kết quả tìm kiếm</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{filteredFareClasses.length}</p>
                                <p className="text-sm text-gray-500 mt-1">(sau khi lọc)</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-[#3775A4]/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-[#3775A4]" />
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
                                placeholder="Tìm kiếm theo mã hạng vé, mô tả, hạng cabin..."
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
                                    Thêm hạng vé
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-bold text-gray-900">Thêm hạng vé mới</DialogTitle>
                                    <DialogDescription className="text-base text-gray-600 mt-2">
                                        Tạo một hạng vé mới cho hệ thống
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                                    <div className="grid gap-3">
                                        <Label htmlFor="fareClassCode" className="text-base font-semibold text-gray-700">
                                            Mã hạng vé <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="fareClassCode"
                                            value={formData.fareClassCode}
                                            onChange={(e) =>
                                                setFormData({ ...formData, fareClassCode: e.target.value.toUpperCase() })
                                            }
                                            placeholder="VD: YS"
                                            maxLength={5}
                                            className="h-14 text-base"
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="cabinClassCode" className="text-base font-semibold text-gray-700">
                                            Mã hạng cabin <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="cabinClassCode"
                                            value={formData.cabinClassCode}
                                            onChange={(e) =>
                                                setFormData({ ...formData, cabinClassCode: e.target.value.toUpperCase() })
                                            }
                                            placeholder="VD: Y (Economy) hoặc J (Business)"
                                            maxLength={5}
                                            className="h-14 text-base"
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                                            Mô tả
                                            <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                        </Label>
                                        <Input
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            placeholder="VD: Economy Smart"
                                            className="h-14 text-base"
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="changeRule" className="text-base font-semibold text-gray-700">
                                            Quy tắc đổi vé
                                            <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                        </Label>
                                        <Textarea
                                            id="changeRule"
                                            value={formData.changeRule}
                                            onChange={(e) =>
                                                setFormData({ ...formData, changeRule: e.target.value })
                                            }
                                            placeholder="VD: Change before departure: 450,000 VND"
                                            className="min-h-[140px] text-base resize-none"
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="refundRule" className="text-base font-semibold text-gray-700">
                                            Quy tắc hoàn vé
                                            <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                                        </Label>
                                        <Textarea
                                            id="refundRule"
                                            value={formData.refundRule}
                                            onChange={(e) =>
                                                setFormData({ ...formData, refundRule: e.target.value })
                                            }
                                            placeholder="VD: Refund before departure: 450,000 VND"
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
                            <CardTitle className="text-2xl font-bold text-gray-900">Danh sách hạng vé</CardTitle>
                            <CardDescription className="mt-2 text-base font-medium text-gray-600">
                                Hiển thị {filteredFareClasses.length} / {fareClasses.length.toLocaleString('vi-VN')} hạng vé
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold text-gray-700 text-base">Mã hạng vé</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Hạng cabin</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Mô tả</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Quy tắc đổi vé</TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-base">Quy tắc hoàn vé</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 text-base">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFareClasses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <DollarSign className="h-12 w-12 mb-4 opacity-50" />
                                                <p className="text-lg font-medium">Không có hạng vé nào</p>
                                                <p className="text-sm mt-1">Hãy thêm hạng vé mới</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFareClasses.map((fareClass) => (
                                        <TableRow 
                                            key={fareClass.fareClassCode}
                                            className="hover:bg-[#00558f]/5 transition-colors"
                                        >
                                            <TableCell className="font-medium text-base">
                                                {fareClass.fareClassCode}
                                            </TableCell>
                                            <TableCell className="text-base text-gray-700">
                                                {fareClass.cabinClass?.name || fareClass.cabinClassCode || "-"}
                                            </TableCell>
                                            <TableCell className="text-base text-gray-700">{fareClass.description || "-"}</TableCell>
                                            <TableCell className="text-base text-gray-700 max-w-xs">
                                                <div className="truncate" title={fareClass.changeRule || "-"}>
                                                    {fareClass.changeRule || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-base text-gray-700 max-w-xs">
                                                <div className="truncate" title={fareClass.refundRule || "-"}>
                                                    {fareClass.refundRule || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-base">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(fareClass)}
                                                        className="h-10 w-10 p-0 hover:bg-[#00558f]/10 hover:text-[#00558f]"
                                                    >
                                                        <Pencil className="h-6 w-6" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(fareClass.fareClassCode)}
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
                    setEditingFareClass(null);
                }
            }}>
                <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-gray-900">Chỉnh sửa hạng vé</DialogTitle>
                        <DialogDescription className="text-base text-gray-600 mt-2">
                            Cập nhật thông tin hạng vé {editingFareClass?.fareClassCode}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                        <div className="grid gap-3">
                            <Label htmlFor="edit-description" className="text-base font-semibold text-gray-700">
                                Mô tả
                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                            </Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="h-14 text-base"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit-changeRule" className="text-base font-semibold text-gray-700">
                                Quy tắc đổi vé
                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                            </Label>
                            <Textarea
                                id="edit-changeRule"
                                value={formData.changeRule}
                                onChange={(e) =>
                                    setFormData({ ...formData, changeRule: e.target.value })
                                }
                                className="min-h-[140px] text-base resize-none"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="edit-refundRule" className="text-base font-semibold text-gray-700">
                                Quy tắc hoàn vé
                                <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                            </Label>
                            <Textarea
                                id="edit-refundRule"
                                value={formData.refundRule}
                                onChange={(e) =>
                                    setFormData({ ...formData, refundRule: e.target.value })
                                }
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
