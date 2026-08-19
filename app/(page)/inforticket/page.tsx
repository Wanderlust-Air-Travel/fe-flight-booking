"use client";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import Person from "@/app/components/Person/Person";
import { InputFormat } from "@/app/hook/InputFormat";
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PaymentSchema } from "../inforticket/payment.schema";

import { useMemo, useState } from "react";

const initialValues = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  address: "",
  acceptTerms: false,
};

const InfoTicket = () => {
  const { data, setData } = useInfoTicket();
  const { data: dataFightSearchBarStore } = useFightSearchBarStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  console.log(data);

  // console.log(startTime)

  const handleOpenChangePerson = () => {
    setIsOpen(!isOpen);
  };

  const totalPrice = useMemo(() => {
    return data.price * dataFightSearchBarStore.totalPerson;
  }, [dataFightSearchBarStore.totalPerson]);

  const handleConfỉm = () => {
    setData({ totalPerson: dataFightSearchBarStore.totalPerson, price: totalPrice });
    router.push("/paymentinformation");
  };

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
                      {dataFightSearchBarStore.totalPerson}
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

      <Formik
        initialValues={initialValues}
        validationSchema={PaymentSchema}
        onSubmit={(v) => console.log(v)}
      >
        {({
          values,
          errors,
          touched,
          handleSubmit,
          handleChange,
          setFieldValue,
          setFieldTouched,
        }) => (
          <Form onSubmit={handleSubmit}>
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
                          label="Fullname"
                          placeholder="Enter Fullname"
                        />
                      </div>
                      <div className="w-[50%] px-[1.2rem]">
                        <InputFormat
                          name="email"
                          label="Email"
                          placeholder="Enter email"
                          type="email"
                        />
                      </div>
                      <div className="w-[50%] px-[1.2rem]">
                        <InputFormat
                          name="phone"
                          label="Phone"
                          placeholder="Enter phone"
                          type="tel"
                        />
                      </div>
                      <div className="w-[50%] px-[1.2rem]">
                        <InputFormat
                          name="dob"
                          label="Date of birth"
                          placeholder="DD/MM/YYYY"
                          formatDob
                        />
                      </div>
                      <div className="w-full px-[1.2rem]">
                        <InputFormat name="address" label="Address" placeholder="Enter address" />
                      </div>
                    </div>
                  </div>

                  {/* --- LOYAL CUSTOMER --- */}
                  <div className="flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] px-[1.6rem] py-[3.2rem] gap-y-[2rem]">
                    <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">
                      Loyal Customer
                    </h2>
                    <div className="w-full px-[1.2rem]">
                      <InputFormat name="code" label="Code" placeholder="Enter Code" />
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
                        checked={values.acceptTerms === true}
                        onCheckedChange={(checked) => {
                          const value = checked === true;
                          setFieldValue("acceptTerms", value);
                          setFieldTouched("acceptTerms", true, false);
                        }}
                        className="w-[2.4rem] h-[2.4rem] flex-shrink-0"
                      />

                      <p className="text-[var(--cl-pri)] text-base">
                        I have read and agree that my data will be processed in accordance with the
                        <Link className="text-[var(--cl-five)]" href="/">
                          Privacy Policy
                        </Link>
                        ,
                        <Link className="text-[var(--cl-five)]" href="/">
                          Terms of Use for Online Booking Function
                        </Link>
                        and
                        <Link className="text-[var(--cl-five)]" href="/">
                          Website Terms of Use
                        </Link>
                      </p>
                      {errors.acceptTerms && touched.acceptTerms && (
                        <p className="inputError custom">{errors.acceptTerms}</p>
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
                        onClick={handleConfỉm}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Form>
        )}
      </Formik>
    </main>
  );
};

export default InfoTicket;
