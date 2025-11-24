import axios from "axios"
import { useEffect, useState } from "react"
import ItemService, { ItemServiceProp } from "../ItemService/ItemService"

const ServiceHome = () => {
    const [services, setServices] = useState<ItemServiceProp[]>([])

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/services/deals`)
            .then((res) => {
                console.log(res.data)
                setServices(res.data.deals);
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])

    return (
        <ul className="flex flex-wrap gap-y-[2.4rem] -mx-[1.2rem]">
            {
                services.map((service, index) => {
                    if(index < 8){
                        return (
                        
                            <li className="w-[calc(100%/4)] px-[1.2rem]" key={index} data-aos="fade-up">
                                <ItemService image={service.image} title={service.title} service={service.service} startDate={service.startDate} endDate={service.endDate} price={service.price} link={service.link} />
                            </li>
                        )
                    }
                   
                })
            }

        </ul>
    )
}

export default ServiceHome