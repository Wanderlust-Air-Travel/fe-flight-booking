import { useDeals } from "@/app/hooks/useDeals";
import { generateServiceKey } from "@/app/utils/key-utils";
import dynamic from "next/dynamic";
import { memo } from "react";
import LazyLoad from "../LazyLoad/LazyLoad";

// Lazy load ItemService component
const ItemService = dynamic(() => import("../ItemService/ItemService"), {
  loading: () => (
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
  ),
  ssr: true,
});

const ServiceHome = () => {
  const { services, loading } = useDeals();

  const LoadingPlaceholder = () => (
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
  );

  return (
    <ul className="flex flex-wrap gap-y-[2.4rem] -mx-[1.2rem] pb-1">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => {
            return (
              <li
                key={i}
                className="w-[calc(100%/4)] px-[1.2rem]"
                data-aos="fade-up"
                suppressHydrationWarning
              >
                <LoadingPlaceholder />
              </li>
            );
          })
        : services.slice(0, 8).map((service, index) => {
            return (
              <li
                className="w-[calc(100%/4)] px-[1.2rem]"
                key={generateServiceKey(service.link, index)}
              >
                <LazyLoad
                  height="100%"
                  offset={200}
                  once={true}
                  placeholder={<LoadingPlaceholder />}
                >
                  <div data-aos="fade-up" suppressHydrationWarning>
                    <ItemService
                      image={service.image}
                      title={service.title}
                      service={service.service}
                      startDate={service.startDate}
                      endDate={service.endDate}
                      price={service.price}
                      link={service.link}
                    />
                  </div>
                </LazyLoad>
              </li>
            );
          })}
    </ul>
  );
};

export default memo(ServiceHome);
