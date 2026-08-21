"use client";
import type { ItemServiceProp } from "@/types/item-service-type";
import { generateServiceKey } from "@/app/utils/key-utils";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ItemService from "../ItemService/ItemService";

const ServiceSlide = () => {
  const [services, setServices] = useState<ItemServiceProp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get("/api/services/deals");
        if (!cancelled && response.data?.deals && Array.isArray(response.data.deals)) {
          setServices(response.data.deals);
        }
      } catch {
        // Silent fail; empty deals list will be rendered.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex w-full overflow-hidden">
      <div className="container">
        <div className="flex flex-col gap-y-[2rem]">
          <div className="flex justify-between items-center">
            <h2
              className="text-lg text-[var(--cl-pri)] uppercase font-bold"
              data-aos="fade-right"
              suppressHydrationWarning
            >
              Services Other
            </h2>
            <Link className="block" href="/" data-aos="fade-left" suppressHydrationWarning>
              <Button className="w-fit px-[2rem] h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-[var(--cl-four)]">
                See More
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-y-[2.4rem] -mx-[1.2rem] pb-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => {
                return (
                  <div
                    key={i}
                    className="w-[calc(100%/4)] px-[1.2rem]"
                    data-aos="fade-up"
                    suppressHydrationWarning
                  >
                    <div className="group flex flex-col shadow2 rounded-[1rem] overflow-hidden h-full">
                      <div className="pt-[calc(100%*192/262)] relative block w-full overflow-hidden">
                        <span className="loading !absolute inset-0 !h-full" />
                      </div>
                      <div className="p-[1.2rem] flex flex-col gap-y-[0.8rem]">
                        <div className="flex flex-col gap-y-[0.4rem]">
                          <span className="loading" />
                          <span className="loading !w-[80%] !h-[2.8rem]" />
                        </div>

                        <div className="flex gap-x-[0.8rem] justify-between items-end">
                          <div className="flex flex-col gap-y-[0.4rem] w-full flex-1">
                            <span className="loading !w-[80%] !h-[2.6rem]" />

                            <div className="flex flex-col gap-y-[0.4rem]">
                              <span className="loading !w-[80%] !h-[2.6rem]" />
                            </div>
                          </div>
                          <span className="peer arrowLink w-[4rem] h-[4rem] bg-[var(--cl-third)] rounded-md flex justify-center items-center hover:bg-[var(--cl-four)] transition ease-linear pointer-events-none flex-shrink-0">
                            <span className="loading" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="-mx-[1.2rem]">
                <Swiper modules={[Navigation]} navigation spaceBetween={0} slidesPerView="auto">
                  {services.map((service, index) => (
                    <SwiperSlide
                      key={generateServiceKey(service.link, index)}
                      className="w-[calc(100%/4)]! px-[1.2rem]"
                    >
                      <ItemService
                        image={service.image}
                        title={service.title}
                        service={service.service}
                        startDate={service.startDate}
                        endDate={service.endDate}
                        price={service.price}
                        link={service.link}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSlide;
