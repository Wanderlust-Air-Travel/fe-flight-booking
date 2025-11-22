"use client"
import { Formik } from "formik";
import { Button } from "@/components/ui/button";
import { InputFormat } from "@/app/hook/InputFormat";
import Image from "next/image";
import axios from "axios";
import useUserStore from "@/app/zustand/storeUser";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RegisterSchema } from "./register.schema";



interface valueType {
    email: string,
    password: string | number,
    fullname: string,
    phone: number | null
}

const initialValues = {
    email: "",
    phone: null,
    password: "",
    fullname: ""
}




const SignUp = () => {
    const { login } = useUserStore();
    const [error, setError] = useState<string>("")
    const router = useRouter();



    const handleSubmit = (value: valueType, setSubmitting: (isSubmitting: boolean) => void) => {
        axios.post("http://localhost:3000/auth/register", {
            email: value.email,
            password: value.password,
            fullname: value.fullname,
            phone: value.phone
        })
            .then((res) => {
                console.log(res.data)

                if (res.data) {
                    login(res.data);
                    router.push("/");
                }

            })
            .catch((err) => {
                setSubmitting(false);
                console.log(err)
                console.log(err.response.data.message)
                setError(err.response.data.message)

            })
            .finally(() => {
                setSubmitting(false);


            })
    }

    return (
        <main className={`pt-[var(--hd)] flex justify-center flex-col gap-y-[var(--rowY)] -mb-[var(--rowY)]`} >
            <section className={`h-[calc(100dvh-var(--hd))]`}>
                <div className="container">
                    <div className="flex h-full -mx-[1.2rem]">
                        <div className="w-[55%] px-[1.2rem]">
                            <div className="-ml-[calc((100vw-140rem)/2)] h-full">
                                <Image src="/resBg.png" alt="loginBg" unoptimized priority width={100} height={100} className="object-cover w-full h-full" />
                            </div>
                        </div>
                        <div className="w-full flex-1 px-[1.2rem] ">
                            <div className="flex h-full flex-col justify-center gap-y-[1.2rem] py-[var(--rowY)]">
                                <h2 className="text-center text-lg font-bold text-[var(--cl-pri)] uppercase">Register</h2>

                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={RegisterSchema}
                                    onSubmit={(value, { setSubmitting }) => { handleSubmit(value, setSubmitting) }}
                                >
                                    {({ handleSubmit, isSubmitting }) => {
                                        return (
                                            <form onSubmit={handleSubmit}>
                                                <div className="flex flex-col gap-y-[3.2rem]">
                                                    <div className="flex flex-wrap gap-y-[1.2rem] -mx-[0.6rem]">
                                                        <div className="w-full px-[0.6rem]">
                                                            <InputFormat name="fullname" placeholder="Enter fullname" label="Fullname" />
                                                        </div>
                                                        <div className="w-[50%] px-[0.6rem]">
                                                            <InputFormat name="email" placeholder="Enter email" label="Email" />
                                                        </div>
                                                        <div className="w-[50%] px-[0.6rem]">
                                                            <InputFormat name="phone" placeholder="Enter phone" label="Phone" />
                                                        </div>
                                                        <div className="w-[50%] px-[0.6rem]">
                                                            <InputFormat password={true} name="password" placeholder="Enter password" label="Password" />
                                                        </div>
                                                        <div className="w-[50%] px-[0.6rem]">
                                                            <InputFormat password={true} name="rePassword" placeholder="Enter repassword" label="Re Password" />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-y-[1.2rem] relative">
                                                        {error && (
                                                            <p className="text-[var(--cl-red)] text-mn absolute bottom-[110%]">{error}</p>
                                                        )}
                                                        <Button disabled={isSubmitting} className="w-full px-[2rem] h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-blue-900" type="submit" >
                                                            {
                                                                isSubmitting
                                                                    ?
                                                                    <Image src="/loading2.gif" alt="loadingIcon" width={32} height={32} unoptimized priority />
                                                                    :
                                                                    "Register"
                                                            }
                                                        </Button>
                                                        <p className="text-mn text-[var(--cl-pri)] text-center">
                                                            You already have an account<Link className="text-[var(--cl-four)] hover:underline transition underline-offset-2" href="/signin"> log in</Link> now
                                                        </p>
                                                    </div>
                                                </div>
                                            </form>
                                        )
                                    }}
                                </Formik>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </ main>
    )
}

export default SignUp