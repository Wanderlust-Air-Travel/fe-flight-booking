"use client";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import Person from "@/app/components/Person/Person";
import { InputFormat } from "@/app/hooks/InputFormat";
import useFlightSearchBarStore from "@/app/zustand/storeFlightSearchBar";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type Locale, localizedHref } from "@/i18n/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { PaymentSchema, type PaymentFormValue } from "./payment.schema";

const initialValues: PaymentFormValue = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  address: "",
  acceptTerms: true as const,
};

const InfoTicket = () => {
  const { data, setData } = useInfoTicket();
  const { data: flightSearchBarData } = useFlightSearchBarStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const locale = useLocale() as Locale;
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormValue>({
    defaultValues: initialValues,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(PaymentSchema) as any,
  });

  const acceptTerms = watch("acceptTerms");

  const handleOpenChangePerson = () => {
    setIsOpen(!isOpen);
  };

  const totalPrice = useMemo(() => {
    return data.price * flightSearchBarData.totalPerson;
  }, [flightSearchBarData.totalPerson]);

  const onConfirm = handleSubmit(() => {
    setData({ totalPerson: flightSearchBarData.totalPerson, price: totalPrice });
    router.push(localizedHref("/paymentinformation", locale));
  });

  return (
    <main className="flex flex-col gap-y-[var(--rowY)] pt-[var(--hd)]">
      <InfoTicketBox />

      <section className="">
        <div className="container">
          <div className="border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] overflow-hidden  flex flex-col ">
            <div className="bg-[var(--cl-pri)] p-[1.6rem] flex justify-between items-center">
              <h2 className="text-base text-white font-bold uppercase">Total Bill</h2>
            </div>
            <ul className="flex flex-col gap-y-[0.8rem] p-[1.6rem]">
              <li className="flex flex-col">
                <div className="flex gap-x-[2rem] justify-between">
                  <p className="text-mn text-[var(--cl-pri)] uppercase font-bold">
                    Price {data.service}
                  </p>
                  <p className="text-mn text-[var(--cl-pri)] uppercase">
                    {FormatPrice(data.price)}
                  </p>
                </div>
              </li>
              <li className="flex flex-col">
                <div className="flex gap-x-[2rem] justify-between">
                  <p className="text-mn text-[var(--cl-pri)] uppercase font-bold">Total Preson</p>
                  <div className="flex flex-col">
                    <p className="text-mn text-[var(--cl-pri)] uppercase text-end">
                      {flightSearchBarData.totalPerson}
                    </p>
                    <span
                      className="hover:text-[var(--cl-four)] cursor-pointer"
                      onClick={handleOpenChangePerson}
                    >
                      Change Person
                    </span>
                  </div>
                </div>
                <div
                  className={`${isOpen ? "max-h-[250px] pointer-events-auto" : "max-h-0 pointer-events-none"}  transition-[max-height] overflow-hidden flex-1 ease-linear duration-500 will-change-auto`}
                >
                  <Person classNameParent="!p-0" classNameChild="!text-mn" />
                </div>
              </li>
            </ul>
            <div className="bg-[var(--cl-pri)] p-[1.6rem] flex justify-between items-center">
              <h2 className="text-base text-white font-bold uppercase">Total Price</h2>
              <p className="text-base text-white font-bold uppercase">{FormatPrice(totalPrice)}</p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={onConfirm}>
        <section>
          <div className="container">
            <div className="flex flex-col gap-y-[var(--rowY)]">
              {/* --- PERSONAL INFO --- */}
              <div className="flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] px-[1.6rem] py-[3.2rem] gap-y-[2rem]">
                <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">
                  Personal information
                </h2>

                <div className="flex -mx-[1.2rem] flex-wrap gap-y-[1.6rem]">
                  <div className="w-[50%] px-[1.2rem]">
                    <InputFormat
                      name="fullName"
                      label={tCommon("fullName")}
                      placeholder={tCommon("fullNamePlaceholder")}
                      register={register}
                      error={errors.fullName}
                    />
                  </div>
                  <div className="w-[50%] px-[1.2rem]">
                    <InputFormat
                      name="email"
                      label="Email"
                      placeholder="Enter email"
                      type="email"
                      register={register}
                      error={errors.email}
                    />
                  </div>
                  <div className="w-[50%] px-[1.2rem]">
                    <InputFormat
                      name="phone"
                      label="Phone"
                      placeholder="Enter phone"
                      type="tel"
                      register={register}
                      error={errors.phone}
                    />
                  </div>
                  <div className="w-[50%] px-[1.2rem]">
                    <InputFormat
                      name="dob"
                      label={tCommon("dateOfBirth")}
                      placeholder="DD/MM/YYYY"
                      formatDob
                      register={register}
                      error={errors.dob}
                    />
                  </div>
                  <div className="w-full px-[1.2rem]">
                    <InputFormat
                      name="address"
                      label={tCommon("address")}
                      placeholder={tCommon("addressPlaceholder")}
                      register={register}
                      error={errors.address}
                    />
                  </div>
                </div>
              </div>

              {/* --- LOYAL CUSTOMER --- */}
              <div className="flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] px-[1.6rem] py-[3.2rem] gap-y-[2rem]">
                <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">
                  Loyal Customer
                </h2>
                <div className="w-full px-[1.2rem]">
                  <InputFormat
                    name="code"
                    label={tCommon("code")}
                    placeholder={tCommon("codePlaceholder")}
                    register={register}
                  />
                </div>
              </div>

              {/* --- CHECKBOX --- */}
              <div className="flex flex-col gap-y-[2rem]">
                <label
                  htmlFor="acceptTerms"
                  className="flex gap-3 items-start select-none relative"
                >
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms === true}
                    onCheckedChange={(checked) =>
                      setValue("acceptTerms", checked === true as never)
                    }
                    className="w-[2.4rem] h-[2.4rem] flex-shrink-0"
                  />

                  <p className="text-[var(--cl-pri)] text-base">
                    I have read and agree that my data will be processed in accordance with the
                    <Link className="text-[var(--cl-five)]" href={localizedHref("/", locale)}>
                      Privacy Policy
                    </Link>
                    ,
                    <Link className="text-[var(--cl-five)]" href={localizedHref("/", locale)}>
                      Terms of Use for Online Booking Function
                    </Link>
                    and
                    <Link className="text-[var(--cl-five)]" href={localizedHref("/", locale)}>
                      Website Terms of Use
                    </Link>
                  </p>
                  {errors.acceptTerms && (
                    <p className="inputError custom">{errors.acceptTerms.message as string}</p>
                  )}
                </label>
                <div className="flex gap-x-[1.2rem]">
                  <Button
                    className="w-[50%] px-[2rem] h-[4.4rem] border-[var(--cl-third)] text-[var(--cl-third)] text-[1.6rem] uppercase hover:bg-[var(--cl-third)] hover:text-[var(--cl-white)]"
                    type="button"
                    variant="outline"
                  >
                    Come back
                  </Button>
                  <Button
                    className="w-[50%] px-[2rem] h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-[var(--cl-four)]"
                    type="submit"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </main>
  );
};

export default InfoTicket;
