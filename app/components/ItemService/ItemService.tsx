import { convertToYMD } from "@/app/components/FormatDate/FormatDate";
import { getApiUrl } from "@/lib/api-config";
import type { ItemServiceProp } from "@/types/item-service-type";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ItemService = ({
  image,
  title,
  link,
  startDate,
  endDate,
  service,
  price,
}: ItemServiceProp) => {
  const imageUrl = `${getApiUrl()}${image}`;

  // Build search URL so that clicking a service pre-fills the search on /search/flights
  const buildSearchHref = () => {
    try {
      // Expect title like: "Tp. Hồ Chí Minh (SGN) đến Can Tho (VCA)"
      const matches = title.match(/\(([^)]+)\)/g) || [];
      const originCode = matches[0]?.replace(/[()]/g, "") || "";
      const destinationCode = matches[1]?.replace(/[()]/g, "") || "";

      if (!originCode || !destinationCode) {
        return link || "/search/flights";
      }

      const departDate = convertToYMD(startDate);

      return `/search/flights?origin=${originCode}&destination=${destinationCode}&departDate=${departDate}&returnDate=&tripType=one_way&adults=1&minors=0`;
    } catch {
      return link || "/search/flights";
    }
  };

  const searchHref = buildSearchHref();

  return (
    <div className="group flex flex-col shadow2 rounded-[1rem] overflow-hidden h-full hover:shadow3 transition-all duration-300 bg-white">
      {/* Giảm tỷ lệ chiều cao ảnh để card tổng thể thấp hơn */}
      <div className="pt-[calc(100%*160/262)] relative block w-full overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          unoptimized
          loading="lazy"
          className="object-cover transition-transform ease-linear duration-300 group-hover:scale-[1.05]"
        />
      </div>
      <div className="p-[1rem] md:p-[1.2rem] flex flex-col gap-y-[0.8rem]">
        <div className="flex flex-col gap-y-[0.2rem]">
          <h2 className="text-[2rem] font-medium hover:text-[var(--cl-four)] transition ease-linear">
            <Link href={searchHref}>{title}</Link>
          </h2>
          {startDate && <p className="title-sm">Ngày đi: {startDate}</p>}
          {endDate && <p className="title-sm">Ngày về: {endDate}</p>}
        </div>

        <div className="flex gap-x-[0.8rem] justify-between items-end">
          <div className="flex flex-col gap-y-[0.2rem] w-full flex-1">
            <p className="text-[var(--cl-gray)] text-sm">
              chỉ từ <span className="text-[var(--cl-pri)]">(VND)</span>
            </p>

            <div className="flex flex-col">
              <p className="text-[var(--cl-pri)] text-base font-bold ">{price}</p>
              <p className="text-[var(--cl-gray)] text-sm">{service}</p>
            </div>
          </div>
          <Link
            href={searchHref}
            className="peer arrowLink w-[3.6rem] h-[3.6rem] md:w-[4rem] md:h-[4rem] bg-[var(--cl-third)] rounded-md flex justify-center items-center flex-shrink-0 hover:bg-[var(--cl-four)] transition ease-linear"
          >
            <ArrowRight className="text-[var(--cl-white)]" strokeWidth={0.8} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemService;
