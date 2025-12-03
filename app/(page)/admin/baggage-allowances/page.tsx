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
import { FareClass } from "@/types/admin/route-fare-price-type";
import { BaggageAllowance } from "@/types/admin/baggage-allowance-type";

export default function BaggageAllowancesPage() {
    const [baggageAllowances, setBaggageAllowances] = useState<BaggageAllowance[]>([]);
    const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingAllowance, setEditingAllowance] = useState<BaggageAllowance | null>(null);
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
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [allowancesRes, fareClassesRes] = await Promise.all([
                axiosInstance.get("/api/admin/baggage-allowances"),
                axiosInstance.get("/api/admin/fare-classes"),
            ]);
            setBaggageAllowances(allowancesRes.data);
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

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Đang tải...</div>;
    }

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý quy định hành lý</h1>
                    <p className="text-gray-600 mt-2">Quản lý quy định hành lý cho từng fare class</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm quy định hành lý
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Thêm quy định hành lý mới</DialogTitle>
                            <DialogDescription>
                                Tạo quy định hành lý mới cho fare class
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="checkedBaggageKg">Hành lý ký gửi (kg) - để trống nếu không có</Label>
                                    <Input
                                        id="checkedBaggageKg"
                                        type="number"
                                        value={formData.checkedBaggageKg}
                                        onChange={(e) => setFormData({ ...formData, checkedBaggageKg: e.target.value })}
                                        placeholder="20"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="checkedBaggagePieces">Số lượng hành lý ký gửi - để trống nếu không có</Label>
                                    <Input
                                        id="checkedBaggagePieces"
                                        type="number"
                                        value={formData.checkedBaggagePieces}
                                        onChange={(e) => setFormData({ ...formData, checkedBaggagePieces: e.target.value })}
                                        placeholder="1"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="carryOnKg">Hành lý xách tay (kg)</Label>
                                    <Input
                                        id="carryOnKg"
                                        type="number"
                                        value={formData.carryOnKg}
                                        onChange={(e) => setFormData({ ...formData, carryOnKg: e.target.value })}
                                        placeholder="7"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="carryOnPieces">Số lượng hành lý xách tay</Label>
                                    <Input
                                        id="carryOnPieces"
                                        type="number"
                                        value={formData.carryOnPieces}
                                        onChange={(e) => setFormData({ ...formData, carryOnPieces: e.target.value })}
                                        placeholder="1"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="carryOnDimensions">Kích thước hành lý xách tay (cm)</Label>
                                <Input
                                    id="carryOnDimensions"
                                    value={formData.carryOnDimensions}
                                    onChange={(e) => setFormData({ ...formData, carryOnDimensions: e.target.value })}
                                    placeholder="55x40x20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isDomestic"
                                        checked={formData.isDomestic}
                                        onChange={(e) => setFormData({ ...formData, isDomestic: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="isDomestic">Áp dụng cho chuyến bay nội địa</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isInternational"
                                        checked={formData.isInternational}
                                        onChange={(e) => setFormData({ ...formData, isInternational: e.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="isInternational">Áp dụng cho chuyến bay quốc tế</Label>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="VD: Maximum weight per piece: 32kg"
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
                    <CardTitle>Danh sách quy định hành lý</CardTitle>
                    <CardDescription>Tất cả các quy định hành lý theo fare class</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fare Class</TableHead>
                                <TableHead>Hành lý ký gửi</TableHead>
                                <TableHead>Hành lý xách tay</TableHead>
                                <TableHead>Kích thước</TableHead>
                                <TableHead>Áp dụng</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {baggageAllowances.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500">
                                        Chưa có quy định hành lý nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                baggageAllowances.map((allowance) => (
                                    <TableRow key={allowance.baggageAllowanceId}>
                                        <TableCell className="font-mono font-bold">
                                            {allowance.fareClassCode}
                                        </TableCell>
                                        <TableCell>
                                            {allowance.checkedBaggageKg && allowance.checkedBaggagePieces
                                                ? `${allowance.checkedBaggagePieces} x ${allowance.checkedBaggageKg}kg`
                                                : "Không có"}
                                        </TableCell>
                                        <TableCell>
                                            {allowance.carryOnPieces} x {allowance.carryOnKg}kg
                                        </TableCell>
                                        <TableCell>{allowance.carryOnDimensions || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {allowance.isDomestic && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Nội địa</span>
                                                )}
                                                {allowance.isInternational && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Quốc tế</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(allowance)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(allowance.baggageAllowanceId)}
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
                        <DialogTitle>Chỉnh sửa quy định hành lý</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin quy định hành lý
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-checkedBaggageKg">Hành lý ký gửi (kg)</Label>
                                <Input
                                    id="edit-checkedBaggageKg"
                                    type="number"
                                    value={formData.checkedBaggageKg}
                                    onChange={(e) => setFormData({ ...formData, checkedBaggageKg: e.target.value })}
                                    min="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-checkedBaggagePieces">Số lượng hành lý ký gửi</Label>
                                <Input
                                    id="edit-checkedBaggagePieces"
                                    type="number"
                                    value={formData.checkedBaggagePieces}
                                    onChange={(e) => setFormData({ ...formData, checkedBaggagePieces: e.target.value })}
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-carryOnKg">Hành lý xách tay (kg)</Label>
                                <Input
                                    id="edit-carryOnKg"
                                    type="number"
                                    value={formData.carryOnKg}
                                    onChange={(e) => setFormData({ ...formData, carryOnKg: e.target.value })}
                                    min="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-carryOnPieces">Số lượng hành lý xách tay</Label>
                                <Input
                                    id="edit-carryOnPieces"
                                    type="number"
                                    value={formData.carryOnPieces}
                                    onChange={(e) => setFormData({ ...formData, carryOnPieces: e.target.value })}
                                    min="0"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-carryOnDimensions">Kích thước hành lý xách tay (cm)</Label>
                            <Input
                                id="edit-carryOnDimensions"
                                value={formData.carryOnDimensions}
                                onChange={(e) => setFormData({ ...formData, carryOnDimensions: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit-isDomestic"
                                    checked={formData.isDomestic}
                                    onChange={(e) => setFormData({ ...formData, isDomestic: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="edit-isDomestic">Áp dụng cho chuyến bay nội địa</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit-isInternational"
                                    checked={formData.isInternational}
                                    onChange={(e) => setFormData({ ...formData, isInternational: e.target.checked })}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="edit-isInternational">Áp dụng cho chuyến bay quốc tế</Label>
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

