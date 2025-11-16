"use client";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import { InputFormat } from "@/app/hook/InputFormat";
import useIsActiveStore from "@/app/zustand/storeHeader";
import { Formik, Form } from "formik";

const PaymentInformation = () => {
    const { isActive } = useIsActiveStore();



    return (
        <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"} flex flex-col gap-y-[var(--rowY)]`} >
            <InfoTicketBox />

            <Formik
                initialValues={{ fullName: "" }}
                onSubmit={(v) => console.log(v)}  
            >
                <>
                <section>
                    <div className="container">
                        <div className="flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] overflow-hidden p-[1.6rem] gap-y-[2rem]">
                            <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">Personal information</h2>

                            <div className="flex -mx-[1.2rem] flex-wrap gap-y-[1.6rem]">
                                <div className="w-[50%] px-[1.2rem]">
                                    <InputFormat name="fullName" label="Fullname" placeholder="Enter Fullname" type="text" />
                                </div>
                                <div className="w-[50%] px-[1.2rem]">
                                    <InputFormat name="email" label="Email" placeholder="Enter email" type="email" />
                                </div>
                                <div className="w-[50%] px-[1.2rem]">
                                    <InputFormat name="phone" label="Phone" placeholder="Enter phone" type="tel" />
                                </div>
                                <div className="w-[50%] px-[1.2rem]">
                                    <InputFormat name="dob" label="Date of birth" placeholder="Enter DD/MM/YYYY" type="text" />
                                </div>
                                <div className="w-[100%] px-[1.2rem]">
                                    <InputFormat name="address" label="Address" placeholder="Enter address" type="text" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="container">
                        <div className="flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] overflow-hidden p-[1.6rem] gap-y-[2rem]">
                            <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">Personal information</h2>

                            <div className="flex -mx-[1.2rem] flex-wrap gap-y-[1.6rem]">
                                <div className="w-[50%] px-[1.2rem]">
                                    <InputFormat name="code" label="Code" placeholder="Enter Code" type="text" />
                                </div>
                            </div>
                        </div>


                    </div>
                </section>
                </>
                

            </Formik>

        </main>
    )
}

export default PaymentInformation
