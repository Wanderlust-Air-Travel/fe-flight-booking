import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"


export interface ItemServiceProp {
    image: string,
    title: string,
    link: string,
    startDate: string,
    endDate: string,
    service: string,
    price: string
}


const ItemService = ({ image, title, link, startDate, endDate, service, price }: ItemServiceProp) => {


    return (
        <div className="group flex flex-col shadow2 rounded-[1rem] overflow-hidden h-full">
            <div className="pt-[calc(100%*192/262)] relative block w-full overflow-hidden">
                <Image src={`${process.env.NEXT_PUBLIC_API_URL}${image}`} alt="" width={100} height={100} unoptimized className="w-full h-full absolute inset-0 object-cover transiton ease-linear duration-300 group-hover:scale-[1.05]" />
            </div>
            <div className="p-[1.2rem] flex flex-col gap-y-[0.8rem]">
                <div className="flex flex-col gap-y-[0.2rem]">
                    <h2 className="text-[2rem] font-medium hover:text-[var(--cl-four)] transition ease-linear">
                        <Link href={link} >
                            {title}
                        </Link>
                    </h2>
                    {
                        startDate && <p className="title-sm">Ngày đi: {startDate}</p>
                    }
                    {
                        endDate && <p className="title-sm">Ngày về: {endDate}</p>
                    }


                </div>

                <div className="flex gap-x-[0.8rem] justify-between items-end">
                    <div className="flex flex-col gap-y-[0.2rem]">
                        <p className="text-[var(--cl-gray)] text-sm">chỉ từ <span className="text-[var(--cl-pri)]">(VND)</span></p>

                        <div className="flex flex-col">
                            <p className="text-[var(--cl-pri)] text-base font-bold ">
                                {price}
                            </p>
                            <p className="text-[var(--cl-gray)] text-sm">{service}</p>
                        </div>
                    </div>
                    <Link href={link} className="peer arrowLink w-[4rem] h-[4rem] bg-[var(--cl-third)] rounded-md flex justify-center items-center flex-shrink-0 hover:bg-[var(--cl-four)] transition ease-linear">
                        <ArrowRight className="text-[var(--cl-white)]" strokeWidth={0.8} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ItemService