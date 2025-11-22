"use client"
import { InputFormat } from "@/app/hook/InputFormat";
import useUserStore from "@/app/zustand/storeUser";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { Formik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginSchema } from "./login.schema";


interface valueType {
    identifier: string | number,
    password: string | number,
    remember: boolean
}

const initialValues = {
    identifier: "",
    password: "",
    remember: false,
}




const SignIn = () => {

    const { login } = useUserStore();
    const [error, setError] = useState<string>("")
    const router = useRouter();



    const handleSubmit = (value: valueType, setSubmitting: (isSubmitting: boolean) => void) => {
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
            email: value.identifier,
            password: value.password
        })
            .then((res) => {
                console.log(res.data)

                if (res.data) {
                    login(res.data);
                    router.push("/");
                }

                if (value.remember) {
                    localStorage.setItem("remember", "1");
                } else {
                    localStorage.removeItem("remember");
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
                                <Image src="/loginBg.png" alt="loginBg" unoptimized priority width={100} height={100} className="object-cover w-full h-full" />
                            </div>
                        </div>
                        <div className="w-full flex-1 px-[1.2rem] ">
                            <div className="flex h-full flex-col justify-center gap-y-[1.2rem] py-[var(--rowY)]">
                                <h2 className="text-center text-lg font-bold text-[var(--cl-pri)] uppercase">Login</h2>

                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={LoginSchema}
                                    onSubmit={(value, { setSubmitting }) => { handleSubmit(value, setSubmitting) }}
                                >
                                    {({ values, handleSubmit, isSubmitting, setFieldValue }) => {
                                        return (
                                            <form onSubmit={handleSubmit}>
                                                <div className="flex flex-col gap-y-[3.2rem]">
                                                    <div className="flex flex-col gap-y-[1.2rem]">
                                                        <InputFormat name="identifier" placeholder="Enter phone or email" label="Account" />
                                                        <InputFormat name="password" placeholder="Enter password" label="Password" password={true} />


                                                        <label htmlFor="remember" className="flex gap-x-[0.6rem] select-none">
                                                            <Checkbox
                                                                id="remember"
                                                                checked={values.remember}
                                                                onCheckedChange={(checked) => setFieldValue("remember", checked === true)}
                                                                className="w-[2rem] h-[2rem] flex-shrink-0 mt-[0.35rem]"
                                                            />

                                                            <p className="text-[var(--cl-pri)] text-base">Remember me</p>
                                                        </label>
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
                                                                    "Login"
                                                            }
                                                        </Button>
                                                        <p className="text-mn text-[var(--cl-pri)] text-center">
                                                            You do not have an account, please <Link className="text-[var(--cl-four)] hover:underline transition underline-offset-2" href="/signup">register</Link> now
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

export default SignIn