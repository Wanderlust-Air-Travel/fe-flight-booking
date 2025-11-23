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
   
      setFrom(data.from || "");
      setTo(data.to || "");

  }, [data.from,data.to]);
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

  const handleChangeForm = (value:string) =>{
    setFrom(value);
    setData({from:value})
  }

  const handleChangeTo = (value:string) =>{
    setTo(value);
    setData({to:value});
  }

  console.log("from",from);
  console.log("to",to);


  return (
    <>
      <div className="flex w-full items-center bg-white rounded-md border-[#CBD4E6] border-[0.1rem]">
        <div className="w-[20%] border-r-[0.1rem] border-[#cbd4e6]">
          <SelectComponent
            value={from}
            onChange={handleChangeForm}
            placeholder="From Where?"
            icon="/icFrom.svg"
            data={dataLocation.filter((item) => item.code !== to)}
          />
        </div>
        <div className="w-[20%] border-r-[0.1rem] border-[#cbd4e6]">
          <SelectComponent
            value={to}
            onChange={handleChangeTo}
            placeholder="From To?"
            icon="/icTo.svg"
            data={dataLocation.filter((item) => item.code !== from)}
          />
        </div>
        <div className="w-[20%] border-r-[0.1rem] border-[#cbd4e6]">
          <label htmlFor="isOpenId" className="relative w-full block">
            <div className="h-[4.8rem] flex gap-x-[0.8rem] items-center select-none">
              <Image
                src="/icDate.svg"
                alt="icDate"
                width={32}
                height={32}
                priority
              />
              <Input
                placeholder="Choose Schedule"
                readOnly
                className="px-0 h-full outline-none shadow-none border-none placeholder:text-[var(--cl-pri)] pointer-events-none text-[var(--cl-pri)]"
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
        <div className="w-[20%] border-r-[0.1rem] border-[#cbd4e6]">
          <label htmlFor="isOpenPerson" className="relative w-full block">
            <div className="h-[4.8rem] flex gap-x-[0.8rem] items-center select-none">
              <Image
                src="/icPerson.svg"
                alt="icPerson"
                width={32}
                height={32}
                priority
              />
              <Input
                placeholder="Choose Quantity"
                readOnly
                className="px-0 h-full outline-none shadow-none border-none placeholder:text-[var(--cl-pri)] pointer-events-none text-center text-[var(--cl-pri)]"
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
            <div className="absolute z-20 top-[calc(100%+0.5rem)] shadow2  left-0 w-full opacity-0 pointer-events-none translate-y-[5%] transition peer-checked:opacity-100 peer-checked:translate-y-[0%] peer-checked:pointer-events-auto">
              <Person />
            </div>
          </label>
        </div>
        <div className="w-[20%] p-2 flex justify-center ali">
          <Button
            className="w-full h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-[var(--cl-four)]"
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
