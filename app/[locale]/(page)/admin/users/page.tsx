"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axios-instance";
import type { Role, User } from "@/types/admin/user-type";
import { ChevronLeft, ChevronRight, Plus, Search, Shield, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch roles only once on mount
  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when page or pageSize changes
  useEffect(() => {
    fetchData(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const fetchData = async (page: number = currentPage, limit: number = pageSize) => {
    try {
      setLoading(true);
      // Use axios params instead of query string to ensure proper encoding
      const response = await axiosInstance.get("/api/admin/users", {
        params: {
          page: page,
          limit: limit,
        },
      });

      // Handle paginated response
      const responseData = response.data;

      // Check if response has pagination structure
      if (responseData.data && Array.isArray(responseData.data)) {
        // Paginated response structure
        const usersData = (responseData.data || []).map((user: any) => ({
          ...user,
          userId: user.user_id,
          roles: user.userRoles?.map((ur: any) => ur.role).filter((r: any) => r) || [],
        }));

        setUsers(usersData);
        setTotalItems(responseData.totalItems || 0);
        setTotalPages(responseData.totalPages || 0);
      } else {
        // Fallback: handle as array (backward compatibility)
        const usersData = (responseData || []).map((user: any) => ({
          ...user,
          userId: user.user_id,
          roles: user.userRoles?.map((ur: any) => ur.role).filter((r: any) => r) || [],
        }));

        setUsers(usersData);
        setTotalItems(usersData.length);
        setTotalPages(1);
      }
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
      const response = await axiosInstance.get("/api/admin/roles");
      setRoles(response.data);
    } catch (err: any) {
      console.error("Error fetching roles:", err);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    try {
      await axiosInstance.post(`/api/admin/users/${selectedUser.userId}/roles`, {
        roleCode: selectedRole,
      });
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
      fetchData(currentPage, pageSize);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể gán quyền");
    }
  };

  const handleRemoveRole = async (userId: string, roleCode: string) => {
    if (!confirm(`Bạn có chắc muốn xóa quyền ${roleCode}?`)) return;
    try {
      await axiosInstance.delete(`/api/admin/users/${userId}/roles/${roleCode}`);
      fetchData(currentPage, pageSize);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể xóa quyền");
    }
  };

  // Filter users based on search query (client-side filtering on current page)
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      const email = user.email?.toLowerCase() || "";
      const fullname = user.fullname?.toLowerCase() || "";
      const rolesText =
        user.roles
          ?.map((r) => r.name || r.roleCode || "")
          .join(" ")
          .toLowerCase() || "";
      return email.includes(query) || fullname.includes(query) || rolesText.includes(query);
    });
  }, [users, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00558f] mx-auto mb-4" />
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
            <Users className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
          </div>
          <p className="text-blue-50 text-lg">Quản lý người dùng và phân quyền</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#00558f]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số người dùng</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#00558f]/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#00558f]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#7ED957]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số quyền</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{roles.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#7ED957]/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#7ED957]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#3775A4]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trang hiện tại</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
                <p className="text-sm text-gray-500 mt-1">(chỉ trên trang hiện tại)</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#3775A4]/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-[#3775A4]" />
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
                placeholder="Tìm kiếm theo email, họ tên, quyền..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 w-full text-base border-gray-300 focus:border-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 bg-white"
              />
            </div>
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
              <CardTitle className="text-2xl font-bold text-gray-900">
                Danh sách người dùng
              </CardTitle>
              <CardDescription className="mt-2 text-base font-medium text-gray-600">
                Hiển thị {users.length} / {totalItems.toLocaleString("vi-VN")} người dùng
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 text-base">Email</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-base">Họ tên</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-base">Quyền</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 text-base">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Users className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Không có người dùng nào</p>
                        <p className="text-sm mt-1">Hãy thêm người dùng mới</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.userId} className="hover:bg-[#00558f]/5 transition-colors">
                      <TableCell className="font-medium text-base">{user.email}</TableCell>
                      <TableCell className="text-base text-gray-700">
                        {user.fullname || "-"}
                      </TableCell>
                      <TableCell className="text-base">
                        <div className="flex flex-wrap gap-2">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span
                                key={role.roleCode}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#3775A4]/10 text-[#3775A4]"
                              >
                                {role.name || role.roleCode}
                                <button
                                  onClick={() => handleRemoveRole(user.userId, role.roleCode)}
                                  className="hover:text-red-600 transition-colors"
                                  aria-label={`Xóa quyền ${role.name || role.roleCode}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">Chưa có quyền</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-base">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsRoleDialogOpen(true);
                          }}
                          className="h-10 px-4 text-base font-medium hover:bg-[#00558f]/10 hover:text-[#00558f] hover:border-[#00558f]"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Gán quyền
                        </Button>
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
                onValueChange={(value) => {
                  const newSize = Number.parseInt(value);
                  if (newSize !== pageSize) {
                    // Update states - this will trigger useEffect to fetch data
                    setCurrentPage(1);
                    setPageSize(newSize);
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
                  <SelectItem value="20" className="text-base py-3">
                    20
                  </SelectItem>
                  <SelectItem value="50" className="text-base py-3">
                    50
                  </SelectItem>
                  <SelectItem value="100" className="text-base py-3">
                    100
                  </SelectItem>
                  <SelectItem value="200" className="text-base py-3">
                    200
                  </SelectItem>
                </SelectContent>
              </Select>
              <span className="text-base text-gray-600 whitespace-nowrap font-semibold">
                / {totalItems.toLocaleString("vi-VN")} mục
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
              Trang <span className="text-[#00558f] text-lg">{currentPage}</span> /
              <span className="text-gray-600">{totalPages}</span>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Dialog */}
      <Dialog
        open={isRoleDialogOpen}
        onOpenChange={(open) => {
          setIsRoleDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
            setSelectedRole("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[30vw] md:max-w-[30vw] lg:max-w-[30vw] xl:max-w-[40vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-900">
              Gán quyền cho người dùng
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              Gán quyền cho {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
            <div className="grid gap-3">
              <Label htmlFor="role" className="text-base font-semibold text-gray-700">
                Chọn quyền <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-14 text-base">
                  <SelectValue placeholder="Chọn quyền" />
                </SelectTrigger>
                <SelectContent className="text-base">
                  {roles
                    .filter(
                      (role) => !selectedUser?.roles?.some((ur) => ur.roleCode === role.roleCode)
                    )
                    .map((role) => (
                      <SelectItem
                        key={role.roleCode}
                        value={role.roleCode}
                        className="text-base py-3"
                      >
                        {role.name} - {role.description || ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {roles.filter(
                (role) => !selectedUser?.roles?.some((ur) => ur.roleCode === role.roleCode)
              ).length === 0 && (
                <p className="text-sm text-gray-500 mt-1">Người dùng này đã có tất cả các quyền</p>
              )}
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
                  await handleAssignRole();
                } catch (_err) {
                  // Error already handled in handleAssignRole
                }
              }}
              disabled={!selectedRole}
              className="bg-[#00558f] hover:bg-[#004475] text-white h-14 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gán quyền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
