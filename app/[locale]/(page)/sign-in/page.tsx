"use client";
import { TestAccountsPanel } from "@/app/components/TestAccountsPanel/TestAccountsPanel";
import { InputFormat } from "@/app/hook/InputFormat";
import useUserStore from "@/app/zustand/storeUser";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { type Locale, localizedHref } from "@/i18n/config";
import type { SigninFormValue } from "@/types/auth-form-type";
import axios from "axios";
import { Formik } from "formik";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LoginSchema } from "./login.schema";

const initialValues: SigninFormValue = {
  email: "",
  password: "",
  remember: false,
};

const SignInPage = () => {
  const { login } = useUserStore();
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("auth.signIn");

  const handleDirectLogin = useCallback(
    async (email: string) => {
      try {
        const res = await fetch("/api/dev/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          cache: "no-store",
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data) {
          login(data);
          router.push(localizedHref("/", locale));
          return { success: true };
        }
        const message =
          (data && (data.message || data.error)) || `Đăng nhập thất bại (HTTP ${res.status})`;
        return { success: false, error: message };
      } catch (err: any) {
        const message = err?.message || "Đăng nhập thất bại";
        return { success: false, error: message };
      }
    },
    [login, router, locale]
  );

  const handleSubmit = (value: SigninFormValue, setSubmitting: (isSubmitting: boolean) => void) => {
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        email: value.email,
        password: value.password,
      })
      .then((res) => {
        console.log(res.data);

        if (res.data) {
          login(res.data);
          router.push(localizedHref("/", locale));
        }

        if (value.remember) {
          localStorage.setItem("remember", "1");
        } else {
          localStorage.removeItem("remember");
        }
      })
      .catch((err) => {
        setSubmitting(false);
        console.log(err);
        console.log(err.response.data.message);
        setError(err.response.data.message || err.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <main className="pt-[var(--hd)] flex justify-center flex-col">
      <section className="h-[calc(100vh-var(--hd))]">
        <div className="flex h-full">
          {/* Left side image area - 70% width - full bleed */}
          <div className="xl:w-[70%] w-full h-full">
            <div className="bg-sign h-full">
              <Image
                src="/loginBg.png"
                alt="loginBg"
                unoptimized
                priority
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          {/* Right side login form - 30% width */}
          <div className="auth-form-panel flex-1 w-full px-[var(--rowX)] flex items-center">
            <div className="w-full max-w-[38.4rem] mx-auto flex flex-col justify-center gap-y-[1.2rem] py-[var(--rowY)]">
              <h2 className="text-center text-lg font-bold text-[var(--cl-pri)] uppercase">
                {t("title")}
              </h2>

              <Formik
                initialValues={initialValues}
                validationSchema={LoginSchema}
                onSubmit={(value, { setSubmitting }) => {
                  handleSubmit(value, setSubmitting);
                }}
              >
                {({ values, handleSubmit, isSubmitting, setFieldValue }) => {
                  return (
                    <form onSubmit={handleSubmit}>
                      <div className="flex flex-col gap-y-[3.2rem]">
                        <div className="flex flex-col gap-y-[1.2rem]">
                          <InputFormat
                            name="email"
                            placeholder={t("emailPlaceholder")}
                            label={t("emailLabel")}
                          />
                          <InputFormat
                            name="password"
                            placeholder={t("passwordPlaceholder")}
                            label={t("passwordLabel")}
                            password={true}
                          />

                          <label
                            htmlFor="remember"
                            className="flex items-center gap-x-[0.6rem] select-none"
                          >
                            <Checkbox
                              id="remember"
                              checked={values.remember}
                              onCheckedChange={(checked) =>
                                setFieldValue("remember", checked === true)
                              }
                              className="w-[2rem] h-[2rem] flex-shrink-0"
                            />
                            <p className="text-[var(--cl-pri)] text-md">{t("rememberMe")}</p>
                          </label>

                          <TestAccountsPanel onDirectLogin={handleDirectLogin} />
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
                            {t("noAccount")}
                            <Link
                              className="text-[var(--cl-four)] hover:underline transition underline-offset-2"
                              href={localizedHref("/sign-up", locale)}
                            >
                              {t("signUpHere")}
                            </Link>
                          </p>
                        </div>
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignInPage;
