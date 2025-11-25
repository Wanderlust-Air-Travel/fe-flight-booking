import axios from "axios"
import { memo, useEffect, useState } from "react"
import ItemService, { ItemServiceProp } from "../ItemService/ItemService"

const ServiceHome = () => {
    const [services, setServices] = useState<ItemServiceProp[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    console.log("re render")

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/services/deals`)
            .then((res) => {
                console.log(res.data)
                setServices(res.data.deals);
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                setLoading(false);
            })
    }, [services])

    return (
        <ul className="flex flex-wrap gap-y-[2.4rem] -mx-[1.2rem] pb-1">
            {
                loading
                    ?
                    (
                        Array.from({ length: 8 }).map((_, i) => {
                            return (
                                <li key={i} className="w-[calc(100%/4)] px-[1.2rem]" data-aos="fade-up">
                                    <div className="group flex flex-col shadow2 rounded-[1rem] overflow-hidden h-full">
                                        <div className="pt-[calc(100%*192/262)] relative block w-full overflow-hidden">
                                            <span className="loading !absolute inset-0 !h-full"></span>
                                        </div>
                                        <div className="p-[1.2rem] flex flex-col gap-y-[0.8rem]">
                                            <div className="flex flex-col gap-y-[0.4rem]">
                                                <span className="loading"></span>
                                                <span className="loading !w-[80%] !h-[2.8rem]"></span>
                                            </div>

                                            <div className="flex gap-x-[0.8rem] justify-between items-end">
                                                <div className="flex flex-col gap-y-[0.4rem] w-full flex-1">
                                                    <span className="loading !w-[80%] !h-[2.6rem]"></span>

                                                    <div className="flex flex-col gap-y-[0.4rem]">
                                                        <span className="loading !w-[80%] !h-[2.6rem]"></span>
                                                    </div>
                                                </div>
                                                <span className="peer arrowLink w-[4rem] h-[4rem] bg-[var(--cl-third)] rounded-md flex justify-center items-center hover:bg-[var(--cl-four)] transition ease-linear pointer-events-none flex-shrink-0">
                                                    <span className="loading"></span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            )
                        })
                    )



                    :
                    (
                        services.map((service, index) => {
                            if (index < 8) {
                                return (

                                    <li className="w-[calc(100%/4)] px-[1.2rem]" key={index} data-aos="fade-up">
                                        <ItemService image={service.image} title={service.title} service={service.service} startDate={service.startDate} endDate={service.endDate} price={service.price} link={service.link} />
                                    </li>
                                )
                            }

                        })
                    )

            }

        </ul>
    )
}

export default memo(ServiceHome)