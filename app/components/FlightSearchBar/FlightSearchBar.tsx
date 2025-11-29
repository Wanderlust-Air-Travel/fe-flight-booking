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

const dataLocation = [
  {
    name: "Hà Nội",
    des: "Sân bay quốc tế Nội Bài",
    value: "ha-noi",
    code: "HAN",
  },
  {
    name: "Hồ Chí Minh",
    des: "Sân bay quốc tế Tân Sơn Nhất",
    value: "ho-chi-minh",
    code: "SGN",
  },
  {
    name: "Đà Nẵng",
    des: "Sân bay quốc tế Đà Nẵng",
    value: "da-nang",
    code: "DAD",
  },
  {
    name: "Nha Trang",
    des: "Sân bay quốc tế Cam Ranh",
    value: "nha-trang",
    code: "CXR",
  },
  {
    name: "Phú Quốc",
    des: "Sân bay quốc tế Phú Quốc",
    value: "phu-quoc",
    code: "PQC",
  },
  { name: "Huế", des: "Sân bay quốc tế Phú Bài", value: "hue", code: "HUI" },
  {
    name: "Cần Thơ",
    des: "Sân bay quốc tế Cần Thơ",
    value: "can-tho",
    code: "VCA",
  },

  // Bổ sung đầy đủ:
  {
    name: "Hải Phòng",
    des: "Sân bay quốc tế Cát Bi",
    value: "hai-phong",
    code: "HPH",
  },
  {
    name: "Quảng Ninh",
    des: "Sân bay quốc tế Vân Đồn",
    value: "quang-ninh",
    code: "VDO",
  },
  {
    name: "Thanh Hóa",
    des: "Sân bay Thọ Xuân",
    value: "thanh-hoa",
    code: "THD",
  },
  { name: "Vinh", des: "Sân bay Vinh", value: "vinh", code: "VII" },
  {
    name: "Điện Biên",
    des: "Sân bay Điện Biên Phủ",
    value: "dien-bien",
    code: "DIN",
  },

  { name: "Chu Lai", des: "Sân bay Chu Lai", value: "chu-lai", code: "VCL" },
  { name: "Quy Nhơn", des: "Sân bay Phù Cát", value: "quy-nhon", code: "UIH" },
  { name: "Tuy Hòa", des: "Sân bay Tuy Hòa", value: "tuy-hoa", code: "TBB" },
  { name: "Pleiku", des: "Sân bay Pleiku", value: "pleiku", code: "PXU" },
  {
    name: "Buôn Ma Thuột",
    des: "Sân bay Buôn Ma Thuột",
    value: "buon-ma-thuot",
    code: "BMV",
  },

  { name: "Đà Lạt", des: "Sân bay Liên Khương", value: "da-lat", code: "DLI" },
  { name: "Cà Mau", des: "Sân bay Cà Mau", value: "ca-mau", code: "CAH" },
  { name: "Rạch Giá", des: "Sân bay Rạch Giá", value: "rach-gia", code: "VKG" },
];

const FlightSearchBar = () => {
  const { data, setData } = useFightSearchBarStore();
  const [from, setFrom] = useState<string>(data.from || "");
  const [to, setTo] = useState<string>(data.to || "");

  const router = useRouter();

  useEffect(() => {
    if (from !== data.from) {
      setFrom(data.from || "");
    }
    if (to !== data.to) {
      setTo(data.to || "");
    }
  }, [data.from, data.to]);

  console.log(data);



  const handleSearch = () => {
    const startDateFormat = convertToYMD(data.startDate);
    const endDateFormat = data.endDate ? convertToYMD(data.endDate) : "";

    router.push(
      `/search/flights?origin=${data.from}` +
      `&destination=${data.to}` +
      `&departDate=${startDateFormat}` +
      `&returnDate=${endDateFormat}` +
      `&tripType=${data.service}&adults=${data.adult}&minors=${data.minor}`
    );

    console.log(startDateFormat);
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
      <div className="flex flex-col md:flex-row w-full items-stretch bg-white rounded-md border-[#CBD4E6] border-[0.1rem]">
        <div className="w-full md:w-[20%] border-b md:border-b-0 md:border-r-[0.1rem] border-[#cbd4e6]">
          <SelectComponent
            value={from}
            onChange={handleChangeForm}
            placeholder="From Where?"
            icon="/icFrom.svg"
            data={dataLocation.filter((item) => item.code !== to)}
          />
        </div>
        <div className="w-full md:w-[20%] border-b md:border-b-0 md:border-r-[0.1rem] border-[#cbd4e6]">
          <SelectComponent
            value={to}
            onChange={handleChangeTo}
            placeholder="To Where?"
            icon="/icTo.svg"
            data={dataLocation.filter((item) => item.code !== from)}
          />
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
            <div className="hidden peer-checked:block fixed inset-0 z-10 w-[100vw] h-[100vh]" />
            <div className="absolute top-[calc(100%+0.5rem)] left-0 z-20 shadow2 opacity-0 pointer-events-none translate-y-[5%] transition peer-checked:opacity-100 peer-checked:translate-y-[0%] peer-checked:pointer-events-auto">
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
            <div className="hidden peer-checked:block fixed inset-0 z-10 w-[100vw] h-[100vh]" />
            <div className="absolute z-20 top-[calc(100%+0.5rem)] shadow2 left-0 right-0 md:left-auto md:right-auto md:w-auto w-[calc(100vw-3.2rem)] md:min-w-[18rem] md:max-w-[20rem] opacity-0 pointer-events-none translate-y-[5%] transition peer-checked:opacity-100 peer-checked:translate-y-[0%] peer-checked:pointer-events-auto bg-white rounded-md">
              <Person />
            </div>
          </label>
        </div>
        <div className="w-full md:w-[20%] p-2 flex justify-center">
          <Button
            className="w-full h-[4.4rem] bg-[var(--cl-pri)] text-sm sm:text-base md:text-[1.6rem] uppercase hover:bg-[var(--cl-four)] transition-colors duration-200 font-semibold"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
    </>
  );
};

export default FlightSearchBar;
