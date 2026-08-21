"use client";
import type { ItemServiceProp } from "@/types/item-service-type";
import { generateServiceKey } from "@/app/utils/key-utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from "axios";
import { useEffect, useState } from "react";
import ItemService from "../ItemService/ItemService";

const PAGE_SIZE = 20;

const ServiceAll = () => {
  const [services, setServices] = useState<ItemServiceProp[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil((services?.length || 0) / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const currentServices = services.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
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
                </li>
              );
            })
          : currentServices.map((service, index) => {
              return (
                <li
                  className="w-[calc(100%/4)] px-[1.2rem]"
                  key={generateServiceKey(service.link, startIndex + index)}
                  data-aos="fade-up"
                  suppressHydrationWarning
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
                </li>
              );
            })}
      </ul>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(safePage - 1)}
                  className={safePage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNumber)}
                    isActive={pageNumber === safePage}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(safePage + 1)}
                  className={
                    safePage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ServiceAll;
