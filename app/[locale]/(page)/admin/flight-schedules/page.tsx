"use client";

import { AircraftTypeSelect } from "@/components/admin/AircraftTypeSelect";
import { DayChipPicker } from "@/components/admin/DayChipPicker";
import { FlightNumberInput } from "@/components/admin/FlightNumberInput";
import { RouteSelect } from "@/components/admin/RouteSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import type { FlightSchedule } from "@/types/admin/flight-schedule-type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  Plane,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// Helper function to format route display
const formatRoute = (schedule: FlightSchedule | undefined) => {
  if (!schedule?.route) return "N/A";
  const origin = schedule.route.originAirport ? schedule.route.originAirport.city : "N/A";
  const dest = schedule.route.destinationAirport ? schedule.route.destinationAirport.city : "N/A";
  return `${origin} → ${dest}`;
};

// Helper to format operating days
const formatOperatingDays = (days: string) => {
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const activeDays = days
    .split("")
    .map((d, i) => (d === "1" ? dayNames[i] : null))
    .filter(Boolean);
  return activeDays.length > 0 ? activeDays.join(", ") : "Không có";
};

export default function FlightSchedulesPage() {
  const [schedules, setSchedules] = useState<FlightSchedule[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [airlines, setAirlines] = useState<any[]>([]);
  const [aircraftTypes, setAircraftTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<FlightSchedule | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const isChangingPageSizeRef = useRef(false);

  const [formData, setFormData] = useState({
    airlineCode: "",
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

  // Fetch data when page or pageSize changes
  useEffect(() => {
    // Skip if we're manually changing pageSize (to avoid double fetch)
    if (isChangingPageSizeRef.current) {
      isChangingPageSizeRef.current = false;
      return;
    }
    // Always use the latest values from state
    fetchSchedules(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  // Fetch master data only once on mount
  useEffect(() => {
    fetchRoutes();
    fetchAirlines();
    fetchAircraftTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/routes").catch(() => ({ data: [] }));
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.items || [];
      setRoutes(rawData);
    } catch (err) {
      console.error("Error fetching routes:", err);
    }
  };

  const fetchAirlines = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/airlines").catch(() => ({ data: [] }));
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.items || [];
      setAirlines(rawData);
    } catch (err) {
      console.error("Error fetching airlines:", err);
    }
  };

  const fetchAircraftTypes = async () => {
    try {
      const response = await axiosInstance
        .get("/api/admin/aircraft-types")
        .catch(() => ({ data: [] }));
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.items || [];
      setAircraftTypes(rawData);
    } catch (err) {
      console.error("Error fetching aircraft types:", err);
    }
  };

  const fetchSchedules = async (page: number = currentPage, limit: number = pageSize) => {
    try {
      setLoading(true);
      // Use axios params instead of query string to ensure proper encoding
      const response = await axiosInstance.get("/api/admin/flight-schedules", {
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
        setSchedules(responseData.data);
        setTotalItems(responseData.totalItems || 0);
        setTotalPages(responseData.totalPages || 0);
      } else {
        // Fallback: handle as array (backward compatibility)
        const rawData = Array.isArray(responseData)
          ? responseData
          : responseData?.data || responseData?.items || [];
        setSchedules(rawData);
        setTotalItems(rawData.length);
        setTotalPages(1);
      }

      setError(null);
    } catch (err: any) {
      console.error("Error fetching flight schedules:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách lịch chuyến bay");
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        fetchSchedules(1, newPageSize).catch((err) => {
          console.error("Error fetching data after pageSize change:", err);
        });
      }, 0);
    }
  };

  const handleCreate = async () => {
    try {
      const fullFlightNumber = formData.airlineCode + formData.flightNumber;
      await axiosInstance.post("/api/admin/flight-schedules", {
        ...formData,
        flightNumber: fullFlightNumber,
      });
      setIsCreateDialogOpen(false);
      resetForm();
      await fetchSchedules(currentPage, pageSize);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tạo lịch chuyến bay");
    }
  };

  const handleEdit = (schedule: FlightSchedule) => {
    setEditingSchedule(schedule);
    const airlineCode = schedule.flightNumber.substring(0, 2);
    const flightNum = schedule.flightNumber.substring(2);
    setFormData({
      airlineCode: airlineCode,
      flightNumber: flightNum,
      routeId: schedule.routeId || "",
      aircraftTypeId: schedule.aircraftTypeId || "",
      departureTime: schedule.departureTime || "",
      arrivalTime: schedule.arrivalTime || "",
      operatingDays: schedule.operatingDays || "1111111",
      effectiveFrom: schedule.effectiveFrom
        ? new Date(schedule.effectiveFrom).toISOString().split("T")[0]
        : "",
      effectiveTo: schedule.effectiveTo
        ? new Date(schedule.effectiveTo).toISOString().split("T")[0]
        : "",
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
      await fetchSchedules(currentPage, pageSize);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể cập nhật lịch chuyến bay");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa lịch chuyến bay này?")) return;
    try {
      await axiosInstance.delete(`/api/admin/flight-schedules/${id}`);
      await fetchSchedules(currentPage, pageSize);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể xóa lịch chuyến bay");
    }
  };

  const resetForm = () => {
    setFormData({
      airlineCode: "",
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

  // Filter schedules based on search query (client-side filtering on current page)
  const filteredSchedules = useMemo(() => {
    if (!searchQuery) return schedules;
    const query = searchQuery.toLowerCase();
    return schedules.filter((schedule) => {
      const flightNumber = schedule.flightNumber?.toLowerCase() || "";
      const route = formatRoute(schedule).toLowerCase();
      const aircraftType = (schedule.aircraftType?.code || "").toLowerCase();
      return flightNumber.includes(query) || route.includes(query) || aircraftType.includes(query);
    });
  }, [schedules, searchQuery]);

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
            <Plane className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Quản lý lịch chuyến bay</h1>
          </div>
          <p className="text-blue-50 text-lg">Quản lý lịch chuyến bay và chuyến bay thực tế</p>
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
                <p className="text-sm font-medium text-gray-600">Tổng số lịch chuyến bay</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalItems.toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#00558f]/10 flex items-center justify-center">
                <Plane className="h-6 w-6 text-[#00558f]" />
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
                  {schedules.filter((s) => s.status === "active").length}
                </p>
                <p className="text-sm text-gray-500 mt-1">(chỉ trên trang hiện tại)</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-1">{filteredSchedules.length}</p>
                <p className="text-sm text-gray-500 mt-1">(sau khi lọc)</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[#3775A4]/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#3775A4]" />
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
                placeholder="Tìm kiếm theo số hiệu chuyến bay, tuyến bay, loại máy bay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 w-full text-base border-gray-300 focus:border-[#00558f] focus:ring-2 focus:ring-[#00558f]/20 bg-white"
              />
            </div>

            {/* Right Side: Primary Action Button */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(true);
                  }}
                  className="bg-[#00558f] hover:bg-[#004475] text-white h-12 px-7 text-base font-semibold shadow-sm hover:shadow-md transition-all w-full lg:w-auto shrink-0 whitespace-nowrap"
                >
                  <Plus className="h-5 w-5 mr-2 shrink-0" />
                  Thêm lịch chuyến bay
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 2xl:max-w-[50vw] 3xl:max-w-[60vw] max-w-5xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-gray-900">
                    Thêm lịch chuyến bay mới
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-600 mt-2">
                    Tạo một lịch chuyến bay mới cho hệ thống
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                  <FlightNumberInput
                    airlineCode={formData.airlineCode}
                    flightNumber={formData.flightNumber}
                    airlines={airlines}
                    onAirlineChange={(code) => setFormData({ ...formData, airlineCode: code })}
                    onFlightNumberChange={(num) => setFormData({ ...formData, flightNumber: num })}
                  />
                  <RouteSelect
                    value={formData.routeId}
                    routes={routes}
                    onChange={(routeId) => setFormData({ ...formData, routeId })}
                  />
                  <AircraftTypeSelect
                    value={formData.aircraftTypeId}
                    aircraftTypes={aircraftTypes}
                    onChange={(aircraftTypeId) => setFormData({ ...formData, aircraftTypeId })}
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="grid gap-3">
                      <Label
                        htmlFor="departureTime"
                        className="text-base font-semibold text-gray-700"
                      >
                        Giờ khởi hành (HH:mm) <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="departureTime"
                        type="time"
                        value={formData.departureTime}
                        onChange={(e) =>
                          setFormData({ ...formData, departureTime: e.target.value })
                        }
                        className="h-14 text-base"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label
                        htmlFor="arrivalTime"
                        className="text-base font-semibold text-gray-700"
                      >
                        Giờ đến (HH:mm) <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        id="arrivalTime"
                        type="time"
                        value={formData.arrivalTime}
                        onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                        className="h-14 text-base"
                      />
                    </div>
                  </div>
                  <DayChipPicker
                    value={formData.operatingDays}
                    onChange={(days) => setFormData({ ...formData, operatingDays: days })}
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="grid gap-3">
                      <Label
                        htmlFor="effectiveFrom"
                        className="text-base font-semibold text-gray-700"
                      >
                        Có hiệu lực từ <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`h-14 text-base justify-start text-left font-normal ${
                              formData.effectiveFrom ? "" : "text-muted-foreground"
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
                            selected={
                              formData.effectiveFrom ? new Date(formData.effectiveFrom) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                setFormData({
                                  ...formData,
                                  effectiveFrom: format(date, "yyyy-MM-dd"),
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
                      <Label
                        htmlFor="effectiveTo"
                        className="text-base font-semibold text-gray-700"
                      >
                        Có hiệu lực đến
                        <span className="text-gray-400 font-normal text-sm ml-2">(tùy chọn)</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`h-14 text-base justify-start text-left font-normal ${
                              formData.effectiveTo ? "" : "text-muted-foreground"
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
                            selected={
                              formData.effectiveTo ? new Date(formData.effectiveTo) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                setFormData({
                                  ...formData,
                                  effectiveTo: format(date, "yyyy-MM-dd"),
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  effectiveTo: "",
                                });
                              }
                            }}
                            disabled={(date) => {
                              const today = new Date(new Date().setHours(0, 0, 0, 0));
                              const minDate = formData.effectiveFrom
                                ? new Date(formData.effectiveFrom)
                                : today;
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
                      } catch (_err) {
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
              <CardTitle className="text-2xl font-bold text-gray-900">
                Danh sách lịch chuyến bay
              </CardTitle>
              <CardDescription className="mt-2 text-base font-medium text-gray-600">
                Tổng cộng {totalItems.toLocaleString("vi-VN")} lịch chuyến bay
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700 text-base">Số hiệu</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-base">Tuyến bay</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-base">
                    Loại máy bay
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-base">
                    Giờ khởi hành
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-base">Giờ đến</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-base">
                    Ngày hoạt động
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-base">Hiệu lực</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-base">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 text-base">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Plane className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Không có lịch chuyến bay nào</p>
                        <p className="text-sm mt-1">Hãy thêm lịch chuyến bay mới</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <TableRow
                      key={schedule.flightScheduleId}
                      className="hover:bg-[#00558f]/5 transition-colors"
                    >
                      <TableCell className="font-medium text-base">
                        {schedule.flightNumber}
                      </TableCell>
                      <TableCell className="text-base text-gray-700">
                        {formatRoute(schedule)}
                      </TableCell>
                      <TableCell className="text-base text-gray-700">
                        {schedule.aircraftType?.code || "N/A"}
                      </TableCell>
                      <TableCell className="text-base text-gray-700">
                        {schedule.departureTime}
                      </TableCell>
                      <TableCell className="text-base text-gray-700">
                        {schedule.arrivalTime}
                      </TableCell>
                      <TableCell className="text-base text-gray-700">
                        {formatOperatingDays(schedule.operatingDays || "0000000")}
                      </TableCell>
                      <TableCell className="text-base text-gray-700">
                        {schedule.effectiveFrom
                          ? new Date(schedule.effectiveFrom).toLocaleDateString("vi-VN")
                          : "N/A"}
                        -
                        {schedule.effectiveTo
                          ? new Date(schedule.effectiveTo).toLocaleDateString("vi-VN")
                          : "Vô thời hạn"}
                      </TableCell>
                      <TableCell className="text-base">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                            schedule.status === "active"
                              ? "bg-[#7ED957]/10 text-[#64AF53]"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {schedule.status === "active" ? (
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
                            onClick={() => handleEdit(schedule)}
                            className="h-10 w-10 p-0 hover:bg-[#00558f]/10 hover:text-[#00558f]"
                          >
                            <Pencil className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(schedule.flightScheduleId)}
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

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="border-t bg-gray-50/50 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left: Page size selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Hiển thị:
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-[100px] h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600 whitespace-nowrap">bản ghi / trang</span>
              </div>

              {/* Center: Pagination buttons */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
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
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingSchedule(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[100vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] 2xl:max-w-[60vw] 3xl:max-w-[70vw] max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-900">
              Chỉnh sửa lịch chuyến bay
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              Cập nhật thông tin lịch chuyến bay {editingSchedule?.flightNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Số hiệu chuyến bay:</p>
              <p className="text-xl font-mono font-bold text-[#00558f]">
                {editingSchedule?.flightNumber}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Không thể thay đổi số hiệu chuyến bay khi chỉnh sửa
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label
                  htmlFor="edit-departureTime"
                  className="text-base font-semibold text-gray-700"
                >
                  Giờ khởi hành (HH:mm) <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="edit-departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  className="h-14 text-base"
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="edit-arrivalTime" className="text-base font-semibold text-gray-700">
                  Giờ đến (HH:mm) <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="edit-arrivalTime"
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  className="h-14 text-base"
                />
              </div>
            </div>
            <DayChipPicker
              value={formData.operatingDays}
              onChange={(days) => setFormData({ ...formData, operatingDays: days })}
            />
            <div className="grid grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label
                  htmlFor="edit-effectiveFrom"
                  className="text-base font-semibold text-gray-700"
                >
                  Có hiệu lực từ <span className="text-red-500 ml-1">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`h-14 text-base justify-start text-left font-normal ${
                        formData.effectiveFrom ? "" : "text-muted-foreground"
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
                      selected={
                        formData.effectiveFrom ? new Date(formData.effectiveFrom) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          setFormData({
                            ...formData,
                            effectiveFrom: format(date, "yyyy-MM-dd"),
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
                        formData.effectiveTo ? "" : "text-muted-foreground"
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
                            effectiveTo: format(date, "yyyy-MM-dd"),
                          });
                        } else {
                          setFormData({
                            ...formData,
                            effectiveTo: "",
                          });
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date(new Date().setHours(0, 0, 0, 0));
                        const minDate = formData.effectiveFrom
                          ? new Date(formData.effectiveFrom)
                          : today;
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
            <div className="grid gap-3">
              <Label htmlFor="edit-status" className="text-base font-semibold text-gray-700">
                Trạng thái <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="h-14 text-base">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="active" className="text-base py-3">
                    Hoạt động
                  </SelectItem>
                  <SelectItem value="inactive" className="text-base py-3">
                    Không hoạt động
                  </SelectItem>
                </SelectContent>
              </Select>
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
                } catch (_err) {
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
