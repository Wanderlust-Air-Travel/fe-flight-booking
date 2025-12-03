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
import { Plus, Pencil, Trash2 } from "lucide-react";
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<CabinService | null>(null);
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
            setCabinServices(servicesRes.data);
            setFareClasses(fareClassesRes.data || []);
            
            // Extract unique cabin classes from services
            const uniqueCabinClasses = Array.from(
                new Map(
                    servicesRes.data
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

    const handleCreate = async () => {
        try {
            await axiosInstance.post("/api/admin/cabin-services", {
                cabinClassCode: formData.cabinClassCode || null,
                fareClassCode: formData.fareClassCode || null,
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
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tạo dịch vụ cabin");
        }
    };

    const handleEdit = (service: CabinService) => {
        setEditingService(service);
        setFormData({
            cabinClassCode: service.cabinClassCode || "",
            fareClassCode: service.fareClassCode || "",
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
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể cập nhật dịch vụ cabin");
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

    const resetForm = () => {
        setFormData({
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
    };

    const formatPrice = (price: number | null) => {
        if (price === null) return "Miễn phí";
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Đang tải...</div>;
    }

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý dịch vụ cabin</h1>
                    <p className="text-gray-600 mt-2">Quản lý các dịch vụ và tiện ích trong cabin</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm dịch vụ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Thêm dịch vụ cabin mới</DialogTitle>
                            <DialogDescription>
                                Tạo dịch vụ cabin mới (có thể áp dụng cho cabin class hoặc fare class cụ thể)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="cabinClassCode">Cabin Class (để trống nếu áp dụng cho fare class)</Label>
                                    <Select
                                        value={formData.cabinClassCode}
                                        onValueChange={(value) => setFormData({ ...formData, cabinClassCode: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn cabin class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Không chọn</SelectItem>
                                            {cabinClasses.map((cc) => (
                                                <SelectItem key={cc.cabinClassCode} value={cc.cabinClassCode}>
                                                    {cc.cabinClassCode} - {cc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="fareClassCode">Fare Class (để trống nếu áp dụng cho cabin class)</Label>
                                    <Select
                                        value={formData.fareClassCode}
                                        onValueChange={(value) => setFormData({ ...formData, fareClassCode: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn fare class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Không chọn</SelectItem>
                                            {fareClasses.map((fc) => (
                                                <SelectItem key={fc.fareClassCode} value={fc.fareClassCode}>
                                                    {fc.fareClassCode} - {fc.description || fc.fareClassCode}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="serviceType">Loại dịch vụ</Label>
                                <Select
                                    value={formData.serviceType}
                                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại dịch vụ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="meal">Bữa ăn (Meal)</SelectItem>
                                        <SelectItem value="entertainment">Giải trí (Entertainment)</SelectItem>
                                        <SelectItem value="wifi">WiFi</SelectItem>
                                        <SelectItem value="priority_boarding">Ưu tiên lên máy bay (Priority Boarding)</SelectItem>
                                        <SelectItem value="lounge_access">Phòng chờ (Lounge Access)</SelectItem>
                                        <SelectItem value="seat_selection">Chọn ghế (Seat Selection)</SelectItem>
                                        <SelectItem value="extra_legroom">Chỗ ngồi rộng (Extra Legroom)</SelectItem>
                                        <SelectItem value="other">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="serviceName">Tên dịch vụ</Label>
                                <Input
                                    id="serviceName"
                                    value={formData.serviceName}
                                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                    placeholder="VD: Hot Meal"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Mô tả chi tiết</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="VD: Hot meal and beverage served during flight"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isIncluded"
                                    checked={formData.isIncluded}
                                    onChange={(e) => setFormData({ ...formData, isIncluded: e.target.checked, price: e.target.checked ? "" : formData.price })}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="isIncluded">Dịch vụ được bao gồm (miễn phí)</Label>
                            </div>
                            {!formData.isIncluded && (
                                <div>
                                    <Label htmlFor="price">Giá (VND) - chỉ điền nếu dịch vụ không được bao gồm</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="200000"
                                        min="0"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
                                    <Input
                                        id="displayOrder"
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="isActive">Đang hoạt động</Label>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="iconUrl">URL Icon (tùy chọn)</Label>
                                <Input
                                    id="iconUrl"
                                    value={formData.iconUrl}
                                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                                    placeholder="https://example.com/icons/meal.png"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleCreate}>Tạo</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách dịch vụ cabin</CardTitle>
                    <CardDescription>Tất cả các dịch vụ và tiện ích trong cabin</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cabin/Fare Class</TableHead>
                                <TableHead>Loại dịch vụ</TableHead>
                                <TableHead>Tên dịch vụ</TableHead>
                                <TableHead>Giá</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cabinServices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500">
                                        Chưa có dịch vụ cabin nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cabinServices.map((service) => (
                                    <TableRow key={service.cabinServiceId}>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {service.cabinClass && (
                                                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        Cabin: {service.cabinClassCode}
                                                    </span>
                                                )}
                                                {service.fareClass && (
                                                    <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        Fare: {service.fareClassCode}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">{service.serviceType.replace('_', ' ')}</TableCell>
                                        <TableCell className="font-medium">{service.serviceName}</TableCell>
                                        <TableCell>{formatPrice(service.price)}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {service.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(service)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(service.cabinServiceId)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa dịch vụ cabin</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin dịch vụ cabin
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-serviceName">Tên dịch vụ</Label>
                            <Input
                                id="edit-serviceName"
                                value={formData.serviceName}
                                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Mô tả chi tiết</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-isIncluded"
                                checked={formData.isIncluded}
                                onChange={(e) => setFormData({ ...formData, isIncluded: e.target.checked, price: e.target.checked ? "" : formData.price })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="edit-isIncluded">Dịch vụ được bao gồm (miễn phí)</Label>
                        </div>
                        {!formData.isIncluded && (
                            <div>
                                <Label htmlFor="edit-price">Giá (VND)</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    min="0"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-displayOrder">Thứ tự hiển thị</Label>
                                <Input
                                    id="edit-displayOrder"
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center space-x-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="edit-isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="edit-isActive">Đang hoạt động</Label>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-iconUrl">URL Icon</Label>
                            <Input
                                id="edit-iconUrl"
                                value={formData.iconUrl}
                                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleUpdate}>Cập nhật</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

