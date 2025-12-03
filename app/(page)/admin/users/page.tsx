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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Role {
    roleCode: string;
    name: string;
    description: string | null;
}

interface User {
    userId: string;
    email: string;
    fullname: string;
    roles?: Role[];
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Note: You'll need to create a GET /admin/users endpoint
            // For now, this is a placeholder
            setError(null);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError(err.response?.data?.message || "Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axiosInstance.get("/api/v1/admin/roles");
            setRoles(response.data);
        } catch (err: any) {
            console.error("Error fetching roles:", err);
        }
    };

    const handleAssignRole = async () => {
        if (!selectedUser || !selectedRole) return;
        try {
            await axiosInstance.post(`/api/v1/admin/users/${selectedUser.userId}/roles`, {
                roleCode: selectedRole,
            });
            setIsRoleDialogOpen(false);
            setSelectedUser(null);
            setSelectedRole("");
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể gán quyền");
        }
    };

    const handleRemoveRole = async (userId: string, roleCode: string) => {
        if (!confirm(`Bạn có chắc muốn xóa quyền ${roleCode}?`)) return;
        try {
            await axiosInstance.delete(`/api/v1/admin/users/${userId}/roles/${roleCode}`);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || "Không thể xóa quyền");
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Đang tải...</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
                <p className="text-gray-600 mt-2">Quản lý người dùng và phân quyền</p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách người dùng</CardTitle>
                    <CardDescription>Tất cả người dùng trong hệ thống</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Họ tên</TableHead>
                                <TableHead>Quyền</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500">
                                        Chưa có người dùng nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.userId}>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.fullname}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles?.map((role) => (
                                                    <span
                                                        key={role.roleCode}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex items-center gap-1"
                                                    >
                                                        {role.name}
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveRole(user.userId, role.roleCode)
                                                            }
                                                            className="hover:text-red-600"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsRoleDialogOpen(true);
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Gán quyền
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Assign Role Dialog */}
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gán quyền cho người dùng</DialogTitle>
                        <DialogDescription>
                            Gán quyền cho {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="role">Chọn quyền</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn quyền" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles
                                        .filter(
                                            (role) =>
                                                !selectedUser?.roles?.some(
                                                    (ur) => ur.roleCode === role.roleCode
                                                )
                                        )
                                        .map((role) => (
                                            <SelectItem key={role.roleCode} value={role.roleCode}>
                                                {role.name} - {role.description || ""}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleAssignRole}>Gán quyền</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

