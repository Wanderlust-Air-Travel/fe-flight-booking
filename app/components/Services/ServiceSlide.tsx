import ItemService from "../ItemService/ItemService"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDeals } from "@/app/hooks/useDeals"

const ServiceSlide = () => {
    const { services, loading } = useDeals()

    return (

        <section className="flex w-full">
            <div className="container">
                <div className="flex flex-col gap-y-[2rem]">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg text-[var(--cl-pri)] uppercase font-bold" data-aos="fade-right">
                            Services
                        </h2>
                        <Link className="block" href="/" data-aos="fade-left">
                            <Button className="w-fit px-[2rem] h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-[var(--cl-four)]" >See More</Button>
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-y-[2.4rem] -mx-[1.2rem] pb-1">
                        {
                            loading
                                ?
                                (
                                    Array.from({ length: 4 }).map((_, i) => {
                                        return (
                                            <div key={i} className="w-[calc(100%/4)] px-[1.2rem]" data-aos="fade-up">
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
                                            </div>
                                        )
                                    })
                                )



                                :
                                (


                                    <Carousel
                                        opts={{
                                            align: "start",
                                        }}
                                        className="w-full "
                                    >
                                        <CarouselContent className="-mx-[1.2rem]">

                                            {
                                                services.map((service) => {
                                                    return (
                                                        <CarouselItem key={service.link} className="w-[calc(100%/4)] px-[1.2rem]">
                                                            <ItemService image={service.image} title={service.title} service={service.service} startDate={service.startDate} endDate={service.endDate} price={service.price} link={service.link} />
                                                        </CarouselItem>
                                                    )
                                                })
                                            }
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                )
                        }
                    </div>
                </div>
            </div>
        </section>


    )
}

export default ServiceSlide