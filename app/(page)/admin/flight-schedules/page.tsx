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
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FlightSchedule } from "@/types/admin/flight-schedule-type";

export default function FlightSchedulesPage() {
    const [schedules, setSchedules] = useState<FlightSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<FlightSchedule | null>(null);
    const [formData, setFormData] = useState({
        flightNumber: "",
        routeId: "",
        aircraftTypeId: "",
        departureTime: "",
        arrivalTime: "",
        operatingDays: "1111111",
        effectiveFrom: "",
        effectiveTo: "",
        status: "active",
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/admin/flight-schedules");
            setSchedules(response.data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching flight schedules:", err);
            setError(err.response?.data?.message || "Không thể tải danh sách lịch chuyến bay");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await axiosInstance.post("/api/admin/flight-schedules", formData);
            setIsCreateDialogOpen(false);
            resetForm();
            fetchSchedules();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể tạo lịch chuyến bay");
        }
    };

    const handleEdit = (schedule: FlightSchedule) => {
        setEditingSchedule(schedule);
        setFormData({
            flightNumber: schedule.flightNumber,
            routeId: schedule.routeId || "",
            aircraftTypeId: schedule.aircraftTypeId || "",
            departureTime: schedule.departureTime || "",
            arrivalTime: schedule.arrivalTime || "",
            operatingDays: schedule.operatingDays || "1111111",
            effectiveFrom: schedule.effectiveFrom ? new Date(schedule.effectiveFrom).toISOString().split('T')[0] : "",
            effectiveTo: schedule.effectiveTo ? new Date(schedule.effectiveTo).toISOString().split('T')[0] : "",
            status: schedule.status || "active",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingSchedule) return;
        try {
            await axiosInstance.put(`/api/admin/flight-schedules/${editingSchedule.flightScheduleId}`, {
                departureTime: formData.departureTime,
                arrivalTime: formData.arrivalTime,
                operatingDays: formData.operatingDays,
                effectiveFrom: formData.effectiveFrom,
                effectiveTo: formData.effectiveTo,
                status: formData.status,
            });
            setIsEditDialogOpen(false);
            setEditingSchedule(null);
            resetForm();
            fetchSchedules();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể cập nhật lịch chuyến bay");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa lịch chuyến bay này?")) return;
        try {
            await axiosInstance.delete(`/api/admin/flight-schedules/${id}`);
            fetchSchedules();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể xóa lịch chuyến bay");
        }
    };

    const resetForm = () => {
        setFormData({
            flightNumber: "",
            routeId: "",
            aircraftTypeId: "",
            departureTime: "",
            arrivalTime: "",
            operatingDays: "1111111",
            effectiveFrom: "",
            effectiveTo: "",
            status: "active",
        });
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Đang tải...</div>;
    }

    return (
        <div>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý lịch chuyến bay</h1>
                    <p className="text-gray-600 mt-2">Quản lý lịch chuyến bay và chuyến bay thực tế</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm lịch chuyến bay
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Thêm lịch chuyến bay mới</DialogTitle>
                            <DialogDescription>
                                Tạo một lịch chuyến bay mới cho hệ thống
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="flightNumber">Số hiệu chuyến bay</Label>
                                <Input
                                    id="flightNumber"
                                    value={formData.flightNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })
                                    }
                                    placeholder="VD: QH101"
                                />
                            </div>
                            <div>
                                <Label htmlFor="routeId">Route ID (UUID)</Label>
                                <Input
                                    id="routeId"
                                    value={formData.routeId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, routeId: e.target.value })
                                    }
                                    placeholder="UUID của route"
                                />
                            </div>
                            <div>
                                <Label htmlFor="aircraftTypeId">Aircraft Type ID (UUID)</Label>
                                <Input
                                    id="aircraftTypeId"
                                    value={formData.aircraftTypeId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, aircraftTypeId: e.target.value })
                                    }
                                    placeholder="UUID của aircraft type"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="departureTime">Giờ khởi hành (HH:mm)</Label>
                                    <Input
                                        id="departureTime"
                                        type="time"
                                        value={formData.departureTime}
                                        onChange={(e) =>
                                            setFormData({ ...formData, departureTime: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="arrivalTime">Giờ đến (HH:mm)</Label>
                                    <Input
                                        id="arrivalTime"
                                        type="time"
                                        value={formData.arrivalTime}
                                        onChange={(e) =>
                                            setFormData({ ...formData, arrivalTime: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="operatingDays">Ngày hoạt động (7 ký tự: 0=Chủ nhật, 1=Thứ 2...)</Label>
                                <Input
                                    id="operatingDays"
                                    value={formData.operatingDays}
                                    onChange={(e) =>
                                        setFormData({ ...formData, operatingDays: e.target.value })
                                    }
                                    placeholder="1111111"
                                    maxLength={7}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Ví dụ: 1111111 = Tất cả các ngày, 1111100 = Thứ 2-6
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="effectiveFrom">Có hiệu lực từ</Label>
                                    <Input
                                        id="effectiveFrom"
                                        type="date"
                                        value={formData.effectiveFrom}
                                        onChange={(e) =>
                                            setFormData({ ...formData, effectiveFrom: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="effectiveTo">Có hiệu lực đến</Label>
                                    <Input
                                        id="effectiveTo"
                                        type="date"
                                        value={formData.effectiveTo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, effectiveTo: e.target.value })
                                        }
                                    />
                                </div>
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
                    <CardTitle>Danh sách lịch chuyến bay</CardTitle>
                    <CardDescription>Tất cả các lịch chuyến bay trong hệ thống</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Số hiệu</TableHead>
                                <TableHead>Tuyến bay</TableHead>
                                <TableHead>Loại máy bay</TableHead>
                                <TableHead>Giờ khởi hành</TableHead>
                                <TableHead>Giờ đến</TableHead>
                                <TableHead>Ngày hoạt động</TableHead>
                                <TableHead>Hiệu lực</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-gray-500">
                                        Chưa có lịch chuyến bay nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                schedules.map((schedule) => (
                                    <TableRow key={schedule.flightScheduleId}>
                                        <TableCell className="font-mono font-bold">
                                            {schedule.flightNumber}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.route?.originAirport?.iataCode || "N/A"} →{" "}
                                            {schedule.route?.destinationAirport?.iataCode || "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {schedule.aircraftType?.code || "N/A"}
                                        </TableCell>
                                        <TableCell>{schedule.departureTime}</TableCell>
                                        <TableCell>{schedule.arrivalTime}</TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {schedule.operatingDays}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {new Date(schedule.effectiveFrom).toLocaleDateString("vi-VN")} -{" "}
                                            {new Date(schedule.effectiveTo).toLocaleDateString("vi-VN")}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded text-xs ${
                                                    schedule.status === "active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {schedule.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(schedule)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(schedule.flightScheduleId)}
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
                        <DialogTitle>Chỉnh sửa lịch chuyến bay</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin lịch chuyến bay {editingSchedule?.flightNumber}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-departureTime">Giờ khởi hành (HH:mm)</Label>
                                <Input
                                    id="edit-departureTime"
                                    type="time"
                                    value={formData.departureTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, departureTime: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-arrivalTime">Giờ đến (HH:mm)</Label>
                                <Input
                                    id="edit-arrivalTime"
                                    type="time"
                                    value={formData.arrivalTime}
                                    onChange={(e) =>
                                        setFormData({ ...formData, arrivalTime: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-operatingDays">Ngày hoạt động (7 ký tự)</Label>
                            <Input
                                id="edit-operatingDays"
                                value={formData.operatingDays}
                                onChange={(e) =>
                                    setFormData({ ...formData, operatingDays: e.target.value })
                                }
                                placeholder="1111111"
                                maxLength={7}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Ví dụ: 1111111 = Tất cả các ngày, 1111100 = Thứ 2-6
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-effectiveFrom">Có hiệu lực từ</Label>
                                <Input
                                    id="edit-effectiveFrom"
                                    type="date"
                                    value={formData.effectiveFrom}
                                    onChange={(e) =>
                                        setFormData({ ...formData, effectiveFrom: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-effectiveTo">Có hiệu lực đến</Label>
                                <Input
                                    id="edit-effectiveTo"
                                    type="date"
                                    value={formData.effectiveTo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, effectiveTo: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-status">Trạng thái</Label>
                            <select
                                id="edit-status"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
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

