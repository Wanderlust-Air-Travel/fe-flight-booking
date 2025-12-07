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
import { Route, FareClass, RouteFarePrice } from "@/types/admin/route-fare-price-type";

export default function RouteFarePricesPage() {
    const [routeFarePrices, setRouteFarePrices] = useState<RouteFarePrice[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPrice, setEditingPrice] = useState<RouteFarePrice | null>(null);
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pricesRes, routesRes, fareClassesRes] = await Promise.all([
                axiosInstance.get("/api/admin/route-fare-prices"),
                axiosInstance.get("/api/admin/routes").catch(() => ({ data: [] })),
                axiosInstance.get("/api/admin/fare-classes"),
            ]);
            
            // Transform routes data: route_id -> routeId, origin_airport -> originAirport, etc.
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
            
            // Transform route fare prices data
            const transformedPrices = (pricesRes.data || []).map((price: any) => {
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
            setRoutes(transformedRoutes);
            setFareClasses(fareClassesRes.data || []);
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
            setIsCreateDialogOpen(false);
            resetForm();
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tạo giá vé");
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
            setIsEditDialogOpen(false);
            setEditingPrice(null);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể cập nhật giá vé");
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatRoute = (route: Route | undefined) => {
        if (!route) return "N/A";
        const origin = route.originAirport ? `${route.originAirport.iataCode} (${route.originAirport.city})` : "N/A";
        const dest = route.destinationAirport ? `${route.destinationAirport.iataCode} (${route.destinationAirport.city})` : "N/A";
        return `${origin} → ${dest}`;
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Đang tải...</div>;
    }

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý giá vé theo route</h1>
                    <p className="text-gray-600 mt-2">Quản lý giá vé cho từng route và fare class</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm giá vé
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Thêm giá vé mới</DialogTitle>
                            <DialogDescription>
                                Tạo giá vé mới cho route và fare class
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="routeId">Route</Label>
                                <Select
                                    value={formData.routeId}
                                    onValueChange={(value) => setFormData({ ...formData, routeId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn route" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {routes.map((route) => (
                                            <SelectItem key={route.routeId} value={route.routeId}>
                                                {formatRoute(route)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="fareClassCode">Fare Class</Label>
                                <Select
                                    value={formData.fareClassCode}
                                    onValueChange={(value) => setFormData({ ...formData, fareClassCode: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn fare class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fareClasses.map((fc) => (
                                            <SelectItem key={fc.fareClassCode} value={fc.fareClassCode}>
                                                {fc.fareClassCode} - {fc.description || fc.fareClassCode}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="basePrice">Giá cơ bản (VND)</Label>
                                <Input
                                    id="basePrice"
                                    type="number"
                                    value={formData.basePrice}
                                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                    placeholder="1577000"
                                    min="0"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="taxRate">Thuế suất (%)</Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        step="0.01"
                                        value={(parseFloat(formData.taxRate) * 100).toString()}
                                        onChange={(e) => setFormData({ ...formData, taxRate: (parseFloat(e.target.value) / 100).toString() })}
                                        placeholder="10"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="feeRate">Phí suất (%)</Label>
                                    <Input
                                        id="feeRate"
                                        type="number"
                                        step="0.01"
                                        value={(parseFloat(formData.feeRate) * 100).toString()}
                                        onChange={(e) => setFormData({ ...formData, feeRate: (parseFloat(e.target.value) / 100).toString() })}
                                        placeholder="5"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="effectiveFrom">Có hiệu lực từ</Label>
                                    <Input
                                        id="effectiveFrom"
                                        type="date"
                                        value={formData.effectiveFrom}
                                        onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="effectiveTo">Có hiệu lực đến (để trống = vô thời hạn)</Label>
                                    <Input
                                        id="effectiveTo"
                                        type="date"
                                        value={formData.effectiveTo}
                                        onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="priority">Độ ưu tiên</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="VD: Promotional price for summer season"
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
                    <CardTitle>Danh sách giá vé</CardTitle>
                    <CardDescription>Tất cả các giá vé theo route và fare class</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Route</TableHead>
                                <TableHead>Fare Class</TableHead>
                                <TableHead>Giá cơ bản</TableHead>
                                <TableHead>Thuế</TableHead>
                                <TableHead>Phí</TableHead>
                                <TableHead>Hiệu lực</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {routeFarePrices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-gray-500">
                                        Chưa có giá vé nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                routeFarePrices.map((price) => (
                                    <TableRow key={price.routeFarePriceId}>
                                        <TableCell className="max-w-xs truncate">
                                            {formatRoute(price.route)}
                                        </TableCell>
                                        <TableCell className="font-mono font-bold">
                                            {price.fareClassCode}
                                        </TableCell>
                                        <TableCell>{formatPrice(price.basePrice || 0)}</TableCell>
                                        <TableCell>{((price.taxRate || 0) * 100).toFixed(1)}%</TableCell>
                                        <TableCell>{((price.feeRate || 0) * 100).toFixed(1)}%</TableCell>
                                        <TableCell className="text-sm">
                                            {price.effectiveFrom 
                                                ? new Date(price.effectiveFrom).toLocaleDateString('vi-VN')
                                                : 'N/A'} - {price.effectiveTo 
                                                    ? new Date(price.effectiveTo).toLocaleDateString('vi-VN')
                                                    : 'Vô thời hạn'}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${price.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {price.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(price)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(price.routeFarePriceId)}
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
                        <DialogTitle>Chỉnh sửa giá vé</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin giá vé
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-basePrice">Giá cơ bản (VND)</Label>
                            <Input
                                id="edit-basePrice"
                                type="number"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                min="0"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-taxRate">Thuế suất (%)</Label>
                                <Input
                                    id="edit-taxRate"
                                    type="number"
                                    step="0.01"
                                    value={(parseFloat(formData.taxRate) * 100).toString()}
                                    onChange={(e) => setFormData({ ...formData, taxRate: (parseFloat(e.target.value) / 100).toString() })}
                                    min="0"
                                    max="100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-feeRate">Phí suất (%)</Label>
                                <Input
                                    id="edit-feeRate"
                                    type="number"
                                    step="0.01"
                                    value={(parseFloat(formData.feeRate) * 100).toString()}
                                    onChange={(e) => setFormData({ ...formData, feeRate: (parseFloat(e.target.value) / 100).toString() })}
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-effectiveFrom">Có hiệu lực từ</Label>
                                <Input
                                    id="edit-effectiveFrom"
                                    type="date"
                                    value={formData.effectiveFrom}
                                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-effectiveTo">Có hiệu lực đến</Label>
                                <Input
                                    id="edit-effectiveTo"
                                    type="date"
                                    value={formData.effectiveTo}
                                    onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-priority">Độ ưu tiên</Label>
                                <Input
                                    id="edit-priority"
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                            <Label htmlFor="edit-notes">Ghi chú</Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

