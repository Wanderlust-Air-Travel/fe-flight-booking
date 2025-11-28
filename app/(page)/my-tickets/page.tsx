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
import { Plane, Calendar, MapPin, User, Ticket as TicketIcon, XCircle, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { MyTicketsResponse } from "@/types/my-tickets-type"

const MyTicketsPage = () => {
  const [data, setData] = useState<MyTicketsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
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
          <h1 className="text-3xl font-bold text-[var(--cl-pri)] mb-2">Vé của tôi</h1>
          <p className="text-gray-600">Tổng số vé: {data.totalItems}</p>
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
                      <p className="font-semibold">{ticket.originCity}</p>
                      <p className="text-sm text-gray-600">{ticket.originAirportName}</p>
                      <p className="text-sm text-gray-500">({ticket.originAirport})</p>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-full h-px bg-gray-300 relative">
                        <Plane className="w-5 h-5 text-[var(--cl-pri)] absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-[var(--cl-pri)]" />
                        <span className="text-sm text-gray-600">Điểm đến</span>
                      </div>
                      <p className="font-semibold">{ticket.destinationCity}</p>
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
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Mã vé</p>
                      <p className="font-mono font-semibold">{ticket.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hạng vé</p>
                      <p className="font-semibold">{ticket.fareClassName}</p>
                      <p className="text-xs text-gray-500">{ticket.cabinClass === 'economy' ? 'Phổ thông' : 'Thương gia'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                      <p className="text-xl font-bold text-[var(--cl-pri)]">{FormatPrice(ticket.totalAmount)}</p>
                    </div>
                    {ticket.canCancel ? (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <p className="text-sm font-medium">Có thể hủy</p>
                        </div>
                        {ticket.cancellationDeadline && (
                          <p className="text-xs text-gray-500">
                            Hạn hủy: {convertToDMY(ticket.cancellationDeadline)} {convertToLocalTime(ticket.cancellationDeadline)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                          <XCircle className="w-4 h-4" />
                          <p className="text-sm font-medium">Không thể hủy</p>
                        </div>
                        {ticket.cannotCancelReason && (
                          <p className="text-xs text-gray-500">{ticket.cannotCancelReason}</p>
                        )}
                      </div>
                    )}
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

