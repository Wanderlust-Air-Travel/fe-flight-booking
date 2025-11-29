"use client"

import { useEffect, useState } from "react"
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb"
import axiosInstance from "@/lib/axios-instance"
import { convertToDMY, convertToLocalTime } from "@/app/components/FormatDate/FormatDate"
import { Plane, Calendar, MapPin, Users, Ticket as TicketIcon, XCircle, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { MyJourneyResponse } from "@/types/my-journey-type"

const MyJourneyPage = () => {
  const [data, setData] = useState<MyJourneyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get("/api/bookings/my-journey")
        setData(response.data)
      } catch (err: any) {
        console.error("Error fetching journeys:", err)
        setError(err.response?.data?.message || "Không thể tải lịch sử hành trình. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchJourneys()
  }, [])

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đặt chỗ này không? Hành động này không thể hoàn tác.")) {
      return
    }

    try {
      setCancellingId(bookingId)
      await axiosInstance.patch(`/api/bookings/${bookingId}/cancel`)
      alert("Hủy đặt chỗ thành công!")
      // Refresh the journeys list
      const response = await axiosInstance.get("/api/bookings/my-journey")
      setData(response.data)
    } catch (err: any) {
      console.error("Error cancelling booking:", err)
      alert(err.response?.data?.message || "Không thể hủy đặt chỗ. Vui lòng thử lại sau.")
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
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

  if (!data || data.journeys.length === 0) {
    return (
      <main className="pt-[var(--hd)] min-h-screen">
        <Breadcrumb />
        <div className="container py-[4rem]">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Bạn chưa có hành trình nào</p>
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
          <h1 className="text-3xl font-bold text-[var(--cl-pri)] mb-2">Hành trình của tôi</h1>
          <p className="text-gray-600">Tổng số hành trình: {data.totalJourneys}</p>
        </div>

        <div className="grid gap-6">
          {data.journeys.map((journey) => (
            <Card key={journey.journeyId} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left: Journey Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Plane className="w-5 h-5 text-[var(--cl-pri)]" />
                      <span className="font-bold text-lg">{journey.flightNumber}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[var(--cl-pri)] text-white text-sm font-medium">
                      {journey.pnrCode}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      journey.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : journey.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {journey.status === 'confirmed' ? 'Đã xác nhận' : 
                       journey.status === 'pending' ? 'Đang chờ' : journey.status}
                    </div>
                    {journey.isDomestic && (
                      <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                        Nội địa
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-[var(--cl-pri)]" />
                        <span className="text-sm text-gray-600">Điểm đi</span>
                      </div>
                      <p className="font-semibold text-lg">{journey.originCity}</p>
                      <p className="text-sm text-gray-600">{journey.originAirportName}</p>
                      <p className="text-sm text-gray-500">({journey.originAirport})</p>
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
                      <p className="font-semibold text-lg">{journey.destinationCity}</p>
                      <p className="text-sm text-gray-600">{journey.destinationAirportName}</p>
                      <p className="text-sm text-gray-500">({journey.destinationAirport})</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="text-gray-600">Ngày khởi hành</p>
                      </div>
                      <p className="font-semibold">{convertToDMY(journey.departureDateTime)}</p>
                      <p className="text-gray-500">{convertToLocalTime(journey.departureDateTime)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="text-gray-600">Ngày đến</p>
                      </div>
                      <p className="font-semibold">{convertToDMY(journey.arrivalDateTime)}</p>
                      <p className="text-gray-500">{convertToLocalTime(journey.arrivalDateTime)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-gray-600" />
                        <p className="text-gray-600">Số hành khách</p>
                      </div>
                      <p className="font-semibold">{journey.numberOfPassengers} người</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="text-gray-600">Ngày đặt</p>
                      </div>
                      <p className="font-semibold">{convertToDMY(journey.bookingDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="md:w-[15rem] border-t md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                  {(journey.status === 'confirmed' || journey.status === 'pending') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelBooking(journey.journeyId)}
                      disabled={cancellingId === journey.journeyId}
                      className="w-full"
                    >
                      {cancellingId === journey.journeyId ? (
                        "Đang hủy..."
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Hủy đặt chỗ
                        </>
                      )}
                    </Button>
                  )}
                  {journey.status === 'cancelled' && (
                    <div className="text-center">
                      <p className="text-sm text-red-600 font-medium">Đã hủy</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

export default MyJourneyPage

