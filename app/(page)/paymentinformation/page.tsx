"use client";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import { InputFormat } from "@/app/hook/InputFormat";
import useIsActiveStore from "@/app/zustand/storeHeader";
import { Formik, Form } from "formik";
import { PaymentSchema } from "./payment.schema";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Button } from "@/components/ui/button";



const initialValues = {
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    acceptTerms: false,
}

const PaymentInformation = () => {
    const { isActive } = useIsActiveStore();



    return (
        <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"} flex flex-col gap-y-[var(--rowY)]`} >
            <InfoTicketBox />

            <Formik
                initialValues={initialValues}
                validationSchema={PaymentSchema}
                onSubmit={(v) => console.log(v)}
            >
                {({ values, errors, touched, handleSubmit, handleChange, setFieldValue, setFieldTouched }) => (
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
                                                <InputFormat name="fullName" label="Fullname" placeholder="Enter Fullname" />
                                            </div>
                                            <div className="w-[50%] px-[1.2rem]">
                                                <InputFormat name="email" label="Email" placeholder="Enter email" type="email" />
                                            </div>
                                            <div className="w-[50%] px-[1.2rem]">
                                                <InputFormat name="phone" label="Phone" placeholder="Enter phone" />
                                            </div>
                                            <div className="w-[50%] px-[1.2rem]">
                                                <InputFormat name="dob" label="Date of birth" placeholder="DD/MM/YYYY" formatDob />
                                            </div>
                                            <div className="w-full px-[1.2rem]">
                                                <InputFormat name="address" label="Address" placeholder="Enter address" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- LOYAL CUSTOMER --- */}
                                    <div className="flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] px-[1.6rem] py-[3.2rem] gap-y-[2rem]">
                                        <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">Loyal Customer</h2>
                                        <div className="w-full px-[1.2rem]">
                                            <InputFormat name="code" label="Code" placeholder="Enter Code" />
                                        </div>
                                    </div>

                                    {/* --- CHECKBOX --- */}
                                    <div className="flex flex-col gap-y-[2rem]">
                                        <label htmlFor="acceptTerms" className="flex gap-3 items-start select-none relative">
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
                                                <Link className="hover:text-[var(--cl-four)]" href="/" > Privacy Policy</Link>,<Link className="hover:text-[var(--cl-four)]" href="/" >Terms of Use for Online Booking Function</Link> and <Link className="hover:text-[var(--cl-four)]" href="/">Website Terms of Use</Link>
                                            </p>
                                            {errors.acceptTerms && touched.acceptTerms && (
                                                <p className="inputError custom">
                                                    {errors.acceptTerms}
                                                </p>
                                            )}
                                        </label>
                                        <div className="flex gap-x-[1.2rem]">
                                            <Button className="w-[50%] px-[2rem] h-[4.4rem] border-[var(--cl-third)] text-[var(--cl-third)] text-[1.6rem] uppercase hover:bg-[var(--cl-third)] hover:text-[var(--cl-white)]" type="button" variant="outline">Come back</Button>
                                            <Button className="w-[50%] px-[2rem] h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-blue-900" type="submit" >Confirm</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Form>
                )}
            </Formik>


        </main>
    )
}

export default PaymentInformation
