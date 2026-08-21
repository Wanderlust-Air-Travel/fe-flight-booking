"use client";
import { InputFormat } from "@/app/hooks/InputFormat";
import useUserStore from "@/app/zustand/storeUser";
import { Button } from "@/components/ui/button";
import { type Locale, localizedHref } from "@/i18n/config";
import { getErrorMessage, showError, showSuccess } from "@/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { RegisterSchema, type RegisterFormValue } from "./register.schema";

const initialValues: RegisterFormValue = {
  email: "",
  phone: "",
  password: "",
  rePassword: "",
  fullname: "",
};

const SignUpPage = () => {
  const { login } = useUserStore();
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("auth.signUp");

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RegisterFormValue>({
    defaultValues: initialValues,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(RegisterSchema) as any,
  });

  const onSubmit = handleSubmit(async (value) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
        email: value.email,
        password: value.password,
        fullname: value.fullname,
        phone: value.phone,
      });

      if (res.data) {
        login(res.data);
        showSuccess("Đăng ký thành công!");
        router.push(localizedHref("/", locale));
      }
    } catch (err) {
      console.log(err);
      const errorMessage = getErrorMessage(err, "Đăng ký thất bại");
      setError(errorMessage);
      showError(errorMessage);
    }
  });

  return (
    <main className="pt-[var(--hd)] flex justify-center flex-col">
      <section className="h-[calc(100vh-var(--hd))]">
        <div className="flex h-full">
          {/* Left side image area - 70% width - full bleed */}
          <div className="xl:w-[70%] w-full h-full">
            <div className="bg-sign h-full">
              <Image
                src="/resBg.png"
                alt="registerBg"
                unoptimized
                priority
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          {/* Right side register form - 30% width */}
          <div className="auth-form-panel w-full flex-1 px-[var(--rowX)] flex items-center">
            <div className="w-full max-w-[38.4rem] mx-auto flex flex-col justify-center gap-y-[1.2rem] py-[var(--rowY)]">
              <h2 className="text-center text-lg font-bold text-[var(--cl-pri)] uppercase">
                {t("title")}
              </h2>

              <form onSubmit={onSubmit}>
                <div className="flex flex-col gap-y-[3.2rem]">
                  <div className="flex flex-wrap gap-y-[1.2rem] -mx-[0.6rem]">
                    <div className="w-full px-[0.6rem]">
                      <InputFormat
                        name="fullname"
                        placeholder={t("fullnamePlaceholder")}
                        label={t("fullnameLabel")}
                        formatName
                        register={register}
                        error={errors.fullname}
                      />
                    </div>
                    <div className="md:w-[50%] w-full px-[0.6rem]">
                      <InputFormat
                        name="email"
                        placeholder={t("emailPlaceholder")}
                        label={t("emailLabel")}
                        register={register}
                        error={errors.email}
                      />
                    </div>
                    <div className="md:w-[50%] w-full px-[0.6rem]">
                      <InputFormat
                        name="phone"
                        placeholder={t("phonePlaceholder")}
                        label={t("phoneLabel")}
                        formatPhone
                        register={register}
                        error={errors.phone}
                      />
                    </div>
                    <div className="md:w-[50%] w-full px-[0.6rem]">
                      <InputFormat
                        password={true}
                        name="password"
                        placeholder={t("passwordPlaceholder")}
                        label={t("passwordLabel")}
                        register={register}
                        error={errors.password}
                      />
                    </div>
                    <div className="md:w-[50%] w-full px-[0.6rem]">
                      <InputFormat
                        password={true}
                        name="rePassword"
                        placeholder={t("repasswordPlaceholder")}
                        label={t("repasswordLabel")}
                        register={register}
                        error={errors.rePassword}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-y-[1.2rem] relative">
                    {error && (
                      <p className="text-[var(--cl-red)] text-mn absolute bottom-[110%]">
                        {error}
                      </p>
                    )}
                    <Button
                      disabled={isSubmitting}
                      className="w-full px-[2rem] h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-blue-900"
                      type="submit"
                    >
                      {isSubmitting ? (
                        <Image
                          src="/loading2.gif"
                          alt="loadingIcon"
                          width={32}
                          height={32}
                          unoptimized
                          priority
                        />
                      ) : (
                        t("submitButton")
                      )}
                    </Button>
                    <p className="text-mn text-[var(--cl-pri)] text-center">
                      {t("haveAccount")}
                      <Link
                        className="text-[var(--cl-four)] hover:underline transition underline-offset-2"
                        href={localizedHref("/sign-in", locale)}
                      >
                        {t("signInHere")}
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignUpPage;
