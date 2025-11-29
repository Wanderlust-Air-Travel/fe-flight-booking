"use client"

import { useEffect, useState } from "react"
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb"
import axiosInstance from "@/lib/axios-instance"
import FormatPrice from "@/app/components/FormatPrice/FormatPrice"
import { convertToDMY, convertToLocalTime } from "@/app/components/FormatDate/FormatDate"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"
import { Plane, Calendar, MapPin, User, Ticket as TicketIcon, XCircle, CheckCircle, X, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { MyTicketsResponse } from "@/types/my-tickets-type"

const MyTicketsPage = () => {
  const [data, setData] = useState<MyTicketsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState<string | null>(null)
  const pageSize = 10

  const fetchTickets = async (page: number) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axiosInstance.get(`/api/bookings/my-tickets?page=${page}&limit=${pageSize}`)
      setData(response.data)
    } catch (err: any) {
      console.error("Error fetching tickets:", err)
      setError(err.response?.data?.message || "Không thể tải danh sách vé. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets(currentPage)
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đặt chỗ này không? Hành động này không thể hoàn tác.")) {
      return
    }

    try {
      setCancellingId(bookingId)
      await axiosInstance.patch(`/api/bookings/${bookingId}/cancel`)
      alert("Hủy đặt chỗ thành công!")
      // Refresh the tickets list
      await fetchTickets(currentPage)
    } catch (err: any) {
      console.error("Error cancelling booking:", err)
      alert(err.response?.data?.message || "Không thể hủy đặt chỗ. Vui lòng thử lại sau.")
    } finally {
      setCancellingId(null)
    }
  }

  if (loading && !data) {
    return (
      <main className="pt-[var(--hd)] min-h-screen">
        <Breadcrumb />
        <div className="container py-[4rem]">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cl-pri)] mx-auto mb-4"></div>
              <p className="text-lg text-[var(--cl-pri)]">Đang tải...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="pt-[var(--hd)] min-h-screen">
        <Breadcrumb />
        <div className="container py-[4rem]">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-lg text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!data || data.tickets.length === 0) {
    return (
      <main className="pt-[var(--hd)] min-h-screen">
        <Breadcrumb />
        <div className="container py-[4rem]">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Bạn chưa có vé nào</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-[var(--hd)] min-h-screen bg-gray-50">
      <Breadcrumb />
      <div className="container py-[4rem]">
        <div className="mb-[3rem]">
          <h1 className="text-6xl font-bold text-[var(--cl-pri)] mb-2">Vé của tôi</h1>
          <p className="text-xl text-gray-600">Tổng số vé: {data.totalItems}</p>
        </div>

        {/* Cancellation Policy Section */}
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-[var(--cl-pri)] mb-5">Quy định hủy vé Bamboo Airways</h2>
          <div className="space-y-4 text-base text-gray-700">
            <div>
              <p className="font-semibold text-lg mb-3">Thời gian hủy vé:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Chặng bay nội địa:</strong> Hoàn thiện thủ tục hoàn vé trước giờ khởi hành tối thiểu 03 tiếng.
                </li>
                <li>
                  <strong>Chặng bay quốc tế:</strong> Thực hiện thủ tục hoàn vé trước giờ khởi hành ít nhất 05 tiếng.
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-lg mb-2">Hạng vé được phép hoàn:</p>
              <p className="ml-2">Economy Smart, Economy Flex, Premium Smart, Premium Flex, Business Smart, Business Flex.</p>
            </div>
            <div>
              <p className="font-semibold text-lg mb-2">Hạng vé không được hoàn:</p>
              <p className="ml-2">Economy Saver Max, Economy Saver (Bamboo Eco) - các hạng vé siêu tiết kiệm thông thường không được phép hoàn/hủy vé.</p>
            </div>
            <div className="mt-5 p-4 bg-blue-50 rounded border-l-4 border-blue-400">
              <p className="text-blue-800 text-sm italic">
                <strong>Lưu ý:</strong> Bạn luôn nên kiểm tra lại Điều kiện giá vé (Fare Rules) cụ thể của vé máy bay bạn đã mua để biết chính xác quy định áp dụng.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {data.tickets.map((ticket) => (
            <Card key={ticket.ticketId} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left: Flight Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Plane className="w-5 h-5 text-[var(--cl-pri)]" />
                      <span className="font-bold text-lg">{ticket.flightNumber}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[var(--cl-pri)] text-white text-sm font-medium">
                      {ticket.pnrCode}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ticket.bookingStatus === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : ticket.bookingStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.bookingStatus === 'confirmed' ? 'Đã xác nhận' : 
                       ticket.bookingStatus === 'pending' ? 'Đang chờ' : ticket.bookingStatus}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-[var(--cl-pri)]" />
                        <span className="text-sm text-gray-600">Điểm đi</span>
                      </div>
                      <p className="font-semibold text-lg">{ticket.originCity}</p>
                      <p className="text-sm text-gray-600">{ticket.originAirportName}</p>
                      <p className="text-sm text-gray-500">({ticket.originAirport})</p>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-full h-px bg-gray-300 relative">
                        <Plane className="w-6 h-6 text-[var(--cl-pri)] absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-white" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-[var(--cl-pri)]" />
                        <span className="text-sm text-gray-600">Điểm đến</span>
                      </div>
                      <p className="font-semibold text-lg">{ticket.destinationCity}</p>
                      <p className="text-sm text-gray-600">{ticket.destinationAirportName}</p>
                      <p className="text-sm text-gray-500">({ticket.destinationAirport})</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Ngày khởi hành</p>
                      <p className="font-semibold">{convertToDMY(ticket.departureDateTime)}</p>
                      <p className="text-gray-500">{convertToLocalTime(ticket.departureDateTime)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Ngày đến</p>
                      <p className="font-semibold">{convertToDMY(ticket.arrivalDateTime)}</p>
                      <p className="text-gray-500">{convertToLocalTime(ticket.arrivalDateTime)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Hành khách</p>
                      <p className="font-semibold">{ticket.passengerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Ghế ngồi</p>
                      <p className="font-semibold">{ticket.seatNumber || "Chưa chọn"}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Ticket Details */}
                <div className="md:w-[20rem] border-l-0 md:border-l md:pl-6 pt-4 md:pt-0">
                  <div className="space-y-4">
                    {/* Ticket Code */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Mã vé</p>
                      <p className="font-mono font-bold text-base text-gray-900">{ticket.ticketNumber}</p>
                    </div>
                    
                    {/* Fare Class */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Hạng vé</p>
                      <p className="font-semibold text-base text-gray-900">{ticket.fareClassName}</p>
                      <p className="text-xs text-gray-500 mt-1">{ticket.cabinClass === 'economy' ? 'Phổ thông' : 'Thương gia'}</p>
                    </div>
                    
                    {/* Total Amount */}
                    <div className="bg-[var(--cl-pri)]/5 p-4 rounded-lg border-2 border-[var(--cl-pri)]/20">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Tổng tiền</p>
                      <p className="text-xl font-bold text-[var(--cl-pri)]">{FormatPrice(ticket.totalAmount)}</p>
                    </div>
                    
                    {/* Cancellation Information */}
                    <div className="pt-3 border-t border-gray-200">
                      {ticket.canCancel ? (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              <p className="text-sm font-semibold">Có thể hủy</p>
                            </div>
                            <Dialog open={cancellationDialogOpen === ticket.ticketId} onOpenChange={(open) => setCancellationDialogOpen(open ? ticket.ticketId : null)}>
                            <DialogTrigger asChild>
                              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1.5">
                                <Info className="w-4 h-4" />
                                Chi tiết
                              </button>
                            </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Thông tin hủy vé</DialogTitle>
                                  <DialogDescription>
                                    Chi tiết về quy định và thời hạn hủy vé cho chuyến bay này
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  {ticket.cancellationDeadline && (
                                    <>
                                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Hạn hủy:</p>
                                        <p className="text-lg font-bold text-gray-900">
                                          {convertToDMY(ticket.cancellationDeadline)} {convertToLocalTime(ticket.cancellationDeadline)}
                                        </p>
                                      </div>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                          {ticket.isDomestic 
                                            ? "Chặng bay nội địa: Hoàn thiện thủ tục hoàn vé trước giờ khởi hành tối thiểu 03 tiếng."
                                            : "Chặng bay quốc tế: Thực hiện thủ tục hoàn vé trước giờ khởi hành ít nhất 05 tiếng."}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelBooking(ticket.bookingId)}
                            disabled={cancellingId === ticket.bookingId}
                            className="w-full"
                          >
                            {cancellingId === ticket.bookingId ? (
                              "Đang hủy..."
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                Hủy đặt chỗ
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-red-700">
                              <XCircle className="w-4 h-4 flex-shrink-0" />
                              <p className="text-sm font-semibold">Không thể hủy</p>
                            </div>
                            {ticket.cannotCancelReason && (
                              <Dialog open={cancellationDialogOpen === ticket.ticketId} onOpenChange={(open) => setCancellationDialogOpen(open ? ticket.ticketId : null)}>
                            <DialogTrigger asChild>
                              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1.5">
                                <Info className="w-4 h-4" />
                                Chi tiết
                              </button>
                            </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Lý do không thể hủy</DialogTitle>
                                    <DialogDescription>
                                      Thông tin về quy định hủy vé cho chuyến bay này
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4">
                                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                                      <p className="text-sm text-gray-700 leading-relaxed">{ticket.cannotCancelReason}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < data.totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </main>
  )
}

export default MyTicketsPage

