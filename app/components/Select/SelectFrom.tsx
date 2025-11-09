import { SelectComponent } from "./SelectComponent"

const SelectFrom = () =>{

    const data = [
        {
            name:"VN",
            value:"vn"
        },
        {
            name:"VN",
            value:"vn"
        },
    ]


    return(
        <>
            <SelectComponent placeholder="From where?" icon="from" />
        </>
    )
}

export default SelectFrom