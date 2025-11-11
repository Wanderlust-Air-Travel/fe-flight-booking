import { SelectComponent } from "./SelectComponent"

const SelectTo = () => {

    const data = [
        {
            name: "Hà Nội",
            des: "Sân bay quốc tế Nội Bài",
            value: "ha-noi",
            code: "HAN",
        },
        {
            name: "Hồ Chí Minh",
            des: "Sân bay quốc tế TSN",
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
        {
            name: "Huế",
            des: "Sân bay quốc tế Phú Bài",
            value: "hue",
            code: "HUI",
        },
        {
            name: "Cần Thơ",
            des: "Sân bay quốc tế Cần Thơ",
            value: "can-tho",
            code: "VCA",
        },
    ];



    return (
        <>
            <SelectComponent placeholder="From To?" icon="/icTo.svg" data={data} />
        </>
    )
}

export default SelectTo