import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FlightDatePicker from "../Date/FlightDatePicker";
import { convertToYMD } from "../FormatDate/FormatDate";
import Person from "../Person/Person";
import { SelectComponent } from "../Select/SelectComponent";
import { axiosPublic } from "@/lib/axios-instance";
import { AirportItem } from "@/types/airport-item";
import { dismissToast, showError, showLoading, showSuccess } from "@/lib/toast";

const FlightSearchBar = () => {
  const { data, setData } = useFightSearchBarStore();
  const [from, setFrom] = useState<string>(data.from || "");
  const [to, setTo] = useState<string>(data.to || "");
  const [airports, setAirports] = useState<AirportItem[]>([]);
  const [loadingAirports, setLoadingAirports] = useState<boolean>(true);
  const [airportsError, setAirportsError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch airports from backend API via Next.js API route
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setLoadingAirports(true);
        setAirportsError(null);
        const response = await axiosPublic.get('/api/search/airports');
        
        if (response.data?.airports && Array.isArray(response.data.airports)) {
          // Transform backend response to frontend format
          const transformedAirports: AirportItem[] = response.data.airports.map((airport: any) => ({
            name: airport.city, // Use city name as display name
            des: airport.name, // Use airport name as description
            value: airport.value || airport.city.toLowerCase().replace(/\s+/g, '-'), // Use slug value
            code: airport.iata, // Use IATA code
          }));
          setAirports(transformedAirports);
        } else {
          setAirportsError('Invalid airports data format');
        }
      } catch (error: any) {
        console.error('Error fetching airports:', error);
        setAirportsError(error.response?.data?.message || error.message || 'Failed to load airports');
        // Error toast will be shown automatically by axios interceptor
      } finally {
        setLoadingAirports(false);
      }
    };

    fetchAirports();
  }, []);

  useEffect(() => {
    if (from !== data.from) {
      setFrom(data.from || "");
    }
    if (to !== data.to) {
      setTo(data.to || "");
    }
  }, [data.from, data.to]);

  console.log(data);

  /**
   * Validate search form data
   * Returns true if all required fields are filled and valid
   */
  const isFormValid = (): boolean => {
    // Required fields: from, to, startDate, adult >= 1
    if (!data.from || !data.to || !data.startDate || !data.adult || data.adult < 1) {
      return false;
    }

    // Origin and destination must be different
    if (data.from === data.to) {
      return false;
    }

    // If tripType is round_trip, endDate is required
    if (data.service === 'round_trip' && (!data.endDate || data.endDate.trim() === '')) {
      return false;
    }

    // Ensure minors is valid (>= 0)
    if (data.minor < 0 || isNaN(data.minor)) {
      return false;
    }

    // Ensure adult is a valid number
    if (isNaN(data.adult)) {
      return false;
    }

    return true;
  };

  const handleSearch = async () => {
    // Prevent search if form is not valid
    if (!isFormValid()) {
      return;
    }

    const startDateFormat = convertToYMD(data.startDate);
    const endDateFormat = data.endDate ? convertToYMD(data.endDate) : "";

    // Show loading toast
    const loadingToastId = showLoading('Đang kiểm tra chuyến bay...');

    try {
      // Validate flight availability before navigating
      const searchParams = new URLSearchParams({
        origin: data.from,
        destination: data.to,
        departDate: startDateFormat,
        returnDate: endDateFormat || '',
        tripType: data.service,
        adults: String(data.adult),
        minors: String(data.minor),
      });

      const response = await axiosPublic.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/flights?${searchParams.toString()}`
      );

      // Check if flights are available
      const hasOutboundFlights = response.data?.outbound && Array.isArray(response.data.outbound) && response.data.outbound.length > 0;
      const hasInboundFlights = data.service === 'round_trip' 
        ? (response.data?.inbound && Array.isArray(response.data.inbound) && response.data.inbound.length > 0)
        : true; // One-way doesn't need inbound

      if (!hasOutboundFlights || !hasInboundFlights) {
        // Dismiss loading toast
        dismissToast(loadingToastId);

        const errorMessage = !hasOutboundFlights
          ? `Không tìm thấy chuyến bay từ ${data.from} đến ${data.to} vào ngày ${startDateFormat}. Vui lòng chọn ngày khác.`
          : `Không tìm thấy chuyến bay khứ hồi từ ${data.to} đến ${data.from} vào ngày ${endDateFormat}. Vui lòng chọn ngày khác.`;
        
        showError(errorMessage, { autoClose: 6000 });
        return;
      }

      // Dismiss loading toast và hiển thị thông báo thành công rõ ràng
      dismissToast(loadingToastId);
      showSuccess("Đã tìm thấy chuyến bay phù hợp. Đang chuyển đến trang kết quả...");

      // Navigate to results page
      router.push(
        `/search/flights?origin=${data.from}` +
        `&destination=${data.to}` +
        `&departDate=${startDateFormat}` +
        `&returnDate=${endDateFormat}` +
        `&tripType=${data.service}&adults=${data.adult}&minors=${data.minor}`
      );
    } catch (error: any) {
      // Dismiss loading toast
      dismissToast(loadingToastId);

      // Show error toast
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Không thể tìm kiếm chuyến bay. Vui lòng thử lại sau.';
      showError(errorMessage, { autoClose: 6000 });
    }
  };

  const handleChangeForm = (value: string) => {
    setFrom(value);
    setData({ from: value })
  }

  const handleChangeTo = (value: string) => {
    setTo(value);
    setData({ to: value });
  }

  console.log("from", from);
  console.log("to", to);


  return (
    <>
      <div className="flex flex-col md:flex-row w-full items-stretch bg-white border-[#CBD4E6] border-[0.1rem]">
        <div className="w-full md:w-[20%] border-b md:border-b-0 md:border-r-[0.1rem] border-[#cbd4e6] relative">
          <SelectComponent
            value={from}
            onChange={handleChangeForm}
            placeholder={loadingAirports ? "Loading airports..." : "From Where?"}
            icon="/icFrom.svg"
            data={airports.filter((item) => item.code !== to)}
            disabled={loadingAirports || !!airportsError}
          />
          {airportsError && (
            <p className="text-xs text-red-500  px-4 absolute top-[105%] line-clamp-1 left-0 w-full">Failed to load airports. Please refresh the page.</p>
          )}
        </div>
        <div className="w-full md:w-[20%] border-b md:border-b-0 md:border-r-[0.1rem] border-[#cbd4e6] relative">
          <SelectComponent
            value={to}
            onChange={handleChangeTo}
            placeholder={loadingAirports ? "Loading airports..." : "To Where?"}
            icon="/icTo.svg"
            data={airports.filter((item) => item.code !== from)}
            disabled={loadingAirports || !!airportsError}
          />
          {airportsError && (
            <p className="text-xs text-red-500  px-4 absolute top-[105%] left-0 w-full line-clamp-1">Failed to load airports. Please refresh the page.</p>
          )}
        </div>
        <div className="w-full md:w-[20%] border-b md:border-b-0 md:border-r-[0.1rem] border-[#cbd4e6]">
          <label htmlFor="isOpenId" className="relative w-full block">
            <div className="h-[4.8rem] flex gap-x-[0.8rem] items-center select-none px-4">
              <Image
                src="/icDate.svg"
                alt="icDate"
                width={24}
                height={24}
                className="md:w-8 md:h-8 flex-shrink-0"
                priority
              />
              <Input
                placeholder="Choose Schedule"
                readOnly
                className="px-0 h-full outline-none shadow-none border-none placeholder:text-[var(--cl-pri)] pointer-events-none text-[var(--cl-pri)] text-sm md:text-base truncate"
                value={
                  data.startDate
                    ? data.endDate
                      ? `${data.startDate} - ${data.endDate}`
                      : data.startDate
                    : ""
                }
              />
            </div>
            <input
              id="isOpenId"
              name="isOpen"
              type="checkbox"
              className="peer hidden"
            />
            <div className="hidden peer-checked:block fixed inset-0 z-[100] w-[100vw] h-[100vh]" />
            <div className="absolute top-[calc(100%+0.5rem)] left-0 z-[101] shadow2 opacity-0 pointer-events-none translate-y-[5%] transition peer-checked:opacity-100 peer-checked:translate-y-[0%] peer-checked:pointer-events-auto">
              <FlightDatePicker />
            </div>
          </label>
        </div>
        <div className="w-full md:w-[20%] border-b md:border-b-0 md:border-r-[0.1rem] border-[#cbd4e6]">
          <label htmlFor="isOpenPerson" className="relative w-full block">
            <div className="h-[4.8rem] flex gap-x-[0.8rem] items-center select-none px-4">
              <Image
                src="/icPerson.svg"
                alt="icPerson"
                width={24}
                height={24}
                className="md:w-8 md:h-8 flex-shrink-0"
                priority
              />
              <Input
                placeholder="Choose Quantity"
                readOnly
                className="px-0 h-full outline-none shadow-none border-none placeholder:text-[var(--cl-pri)] pointer-events-none text-center md:text-left text-[var(--cl-pri)] text-sm md:text-base"
                value={data.totalPerson ? data.totalPerson : ""}
              />
            </div>
            <input
              id="isOpenPerson"
              name="isOpen"
              type="checkbox"
              className="peer hidden"
            />
            <div className="hidden peer-checked:block fixed inset-0 z-[100] w-[100vw] h-[100vh]" />
            <div className="absolute w-full! z-[101] top-[calc(100%+0.5rem)] shadow2 left-0 right-0 md:left-auto md:right-auto md:w-auto  opacity-0 pointer-events-none translate-y-[5%] transition peer-checked:opacity-100 peer-checked:translate-y-[0%] peer-checked:pointer-events-auto bg-white rounded-md">
              <Person />
            </div>
          </label>
        </div>
        <div className="w-full md:w-[20%] p-2 flex justify-center items-center">
          <Button
            className="w-full h-[3.6rem]! bg-[var(--cl-pri)] text-sm sm:text-base md:text-[1.6rem] uppercase hover:bg-[var(--cl-four)] transition-colors duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--cl-pri)]"
            onClick={handleSearch}
            disabled={!isFormValid()}
          >
            Search
          </Button>
        </div>
      </div>
    </>
  );
};

export default FlightSearchBar;
