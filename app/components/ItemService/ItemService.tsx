import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getApiUrl } from "@/lib/api-config"
import { ItemServiceProp } from "@/types/item-service-type"


const ItemService = ({ image, title, link, startDate, endDate, service, price }: ItemServiceProp) => {
    const imageUrl = `${getApiUrl()}${image}`;

    return (
        <div className="group flex flex-col shadow2 rounded-[1rem] overflow-hidden h-full hover:shadow3 transition-all duration-300 bg-white">
            <div className="pt-[calc(100%*192/262)] relative block w-full overflow-hidden bg-gray-100">
                <Image 
                    src={imageUrl} 
                    alt={title} 
                    width={100} 
                    height={100} 
                    unoptimized 
                    className="w-full h-full absolute inset-0 object-cover transition-transform ease-linear duration-300 group-hover:scale-[1.05]" 
                />
            </div>
            <div className="p-3 sm:p-4 md:p-[1.2rem] flex flex-col gap-y-2 sm:gap-y-[0.8rem] flex-grow">
                <div className="flex flex-col gap-y-1 sm:gap-y-[0.2rem]">
                    <h2 className="text-base sm:text-lg md:text-[2rem] font-medium group-hover:text-[var(--cl-four)] transition-colors duration-200 line-clamp-2">
                        <Link href={link} className="hover:underline">
                            {title}
                        </Link>
                    </h2>
                    {
                        startDate && (
                            <p className="text-xs sm:text-sm text-[var(--cl-gray)]">Ngày đi: {startDate}</p>
                        )
                    }
                    {
                        endDate && (
                            <p className="text-xs sm:text-sm text-[var(--cl-gray)]">Ngày về: {endDate}</p>
                        )
                    }
                </div>

                <div className="flex gap-x-2 sm:gap-x-[0.8rem] justify-between items-end mt-auto">
                    <div className="flex flex-col gap-y-1 sm:gap-y-[0.2rem] w-full flex-1 min-w-0">
                        <p className="text-[var(--cl-gray)] text-xs sm:text-sm">
                            chỉ từ <span className="text-[var(--cl-pri)]">(VND)</span>
                        </p>

                        <div className="flex flex-col">
                            <p className="text-[var(--cl-pri)] text-sm sm:text-base md:text-lg font-bold truncate">
                                {price}
                            </p>
                            <p className="text-[var(--cl-gray)] text-xs sm:text-sm truncate">{service}</p>
                        </div>
                    </div>
                    <Link 
                        href={link} 
                        className="arrowLink w-[3.5rem] h-[3.5rem] sm:w-[4rem] sm:h-[4rem] bg-[var(--cl-third)] rounded-md flex justify-center items-center flex-shrink-0 hover:bg-[var(--cl-four)] transition-all duration-200 hover:scale-105 active:scale-95"
                        aria-label={`View ${title}`}
                    >
                        <ArrowRight className="text-[var(--cl-white)] w-4 h-4 sm:w-5 sm:h-5" strokeWidth={0.8} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ItemService