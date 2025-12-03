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

interface FareClass {
    fareClassCode: string;
    cabinClassCode: string;
    cabinClass?: {
        cabinClassCode: string;
        name: string;
    };
    description: string | null;
    changeRule: string | null;
    refundRule: string | null;
}

export default function FareClassesPage() {
    const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingFareClass, setEditingFareClass] = useState<FareClass | null>(null);
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
            const response = await axiosInstance.get("/api/v1/admin/fare-classes");
            setFareClasses(response.data);
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
            await axiosInstance.post("/api/v1/admin/fare-classes", formData);
            setIsCreateDialogOpen(false);
            setFormData({
                fareClassCode: "",
                cabinClassCode: "",
                description: "",
                changeRule: "",
                refundRule: "",
            });
            fetchFareClasses();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tạo hạng vé");
        }
    };

    const handleEdit = (fareClass: FareClass) => {
        setEditingFareClass(fareClass);
        setFormData({
            fareClassCode: fareClass.fareClassCode,
            cabinClassCode: fareClass.cabinClassCode,
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
                `/api/v1/admin/fare-classes/${editingFareClass.fareClassCode}`,
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
            await axiosInstance.delete(`/api/v1/admin/fare-classes/${fareClassCode}`);
            fetchFareClasses();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể xóa hạng vé");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Đang tải...</div>;
    }

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý giá vé</h1>
                    <p className="text-gray-600 mt-2">Quản lý hạng vé và giá cả</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm hạng vé
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm hạng vé mới</DialogTitle>
                            <DialogDescription>
                                Tạo một hạng vé mới cho hệ thống
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="fareClassCode">Mã hạng vé</Label>
                                <Input
                                    id="fareClassCode"
                                    value={formData.fareClassCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, fareClassCode: e.target.value.toUpperCase() })
                                    }
                                    placeholder="VD: YS"
                                    maxLength={5}
                                />
                            </div>
                            <div>
                                <Label htmlFor="cabinClassCode">Mã hạng cabin</Label>
                                <Input
                                    id="cabinClassCode"
                                    value={formData.cabinClassCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, cabinClassCode: e.target.value.toUpperCase() })
                                    }
                                    placeholder="VD: Y (Economy) hoặc J (Business)"
                                    maxLength={5}
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Mô tả</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="VD: Economy Smart"
                                />
                            </div>
                            <div>
                                <Label htmlFor="changeRule">Quy tắc đổi vé</Label>
                                <Textarea
                                    id="changeRule"
                                    value={formData.changeRule}
                                    onChange={(e) =>
                                        setFormData({ ...formData, changeRule: e.target.value })
                                    }
                                    placeholder="VD: Change before departure: 450,000 VND"
                                />
                            </div>
                            <div>
                                <Label htmlFor="refundRule">Quy tắc hoàn vé</Label>
                                <Textarea
                                    id="refundRule"
                                    value={formData.refundRule}
                                    onChange={(e) =>
                                        setFormData({ ...formData, refundRule: e.target.value })
                                    }
                                    placeholder="VD: Refund before departure: 450,000 VND"
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
                    <CardTitle>Danh sách hạng vé</CardTitle>
                    <CardDescription>Tất cả các hạng vé trong hệ thống</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã hạng vé</TableHead>
                                <TableHead>Hạng cabin</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead>Quy tắc đổi vé</TableHead>
                                <TableHead>Quy tắc hoàn vé</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fareClasses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500">
                                        Chưa có hạng vé nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fareClasses.map((fareClass) => (
                                    <TableRow key={fareClass.fareClassCode}>
                                        <TableCell className="font-mono font-bold">
                                            {fareClass.fareClassCode}
                                        </TableCell>
                                        <TableCell>
                                            {fareClass.cabinClass?.name || fareClass.cabinClassCode}
                                        </TableCell>
                                        <TableCell>{fareClass.description || "-"}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {fareClass.changeRule || "-"}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {fareClass.refundRule || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(fareClass)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(fareClass.fareClassCode)}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa hạng vé</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin hạng vé {editingFareClass?.fareClassCode}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-description">Mô tả</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-changeRule">Quy tắc đổi vé</Label>
                            <Textarea
                                id="edit-changeRule"
                                value={formData.changeRule}
                                onChange={(e) =>
                                    setFormData({ ...formData, changeRule: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-refundRule">Quy tắc hoàn vé</Label>
                            <Textarea
                                id="edit-refundRule"
                                value={formData.refundRule}
                                onChange={(e) =>
                                    setFormData({ ...formData, refundRule: e.target.value })
                                }
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

