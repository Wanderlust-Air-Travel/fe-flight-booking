"use client";
import LocaleSwitcher from "@/app/components/LocaleSwitcher/LocaleSwitcher";
import useUserStore from "@/app/zustand/storeUser";
import { Button } from "@/components/ui/button";
import { type Locale, localizedHref, stripLocale } from "@/i18n/config";
import axiosInstance from "@/lib/axios-instance";
import { ChevronDown, LogOut, Menu, Settings, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface MenuItemConfig {
  key: "home" | "about" | "service";
  path: string;
}

const menuLists: MenuItemConfig[] = [
  { key: "home", path: "/" },
  { key: "about", path: "/about" },
  { key: "service", path: "/service" },
];

// Management roles - không cần "Vé của tôi" và "Hành trình của tôi"
const MANAGEMENT_ROLES = [
  "ADMIN",
  "SCHEDULE_PLANNER",
  "REVENUE_ANALYST",
  "ANCILLARY_MANAGER",
  "CALL_CENTER",
  "ACCOUNTING_STAFF",
  "DISTRIBUTION_MANAGER",
  "FRAUD_ANALYST",
  "FLIGHT_MANAGER",
  "FARE_MANAGER",
  "OPERATIONS",
];

const Header = () => {
  const { isLoggedIn, user, logout, setUserRoles, accessToken } = useUserStore();
  const fullPathname = usePathname();
  const navigation = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("header");
  // pathname đã bỏ locale prefix, dùng để so sánh highlight menu
  const strippedPath = stripLocale(fullPathname);
  const hydrated = useUserStore((state) => state.hydrated);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRoles, setUserRolesState] = useState<
    Array<{ roleCode: string; name: string; description: string | null }>
  >([]);
  const meFetchedRef = useRef(false);

  // Dùng roles từ store nếu có, không thì dùng state local (sau khi fetch)
  const roles = user?.roles?.length ? user.roles : userRoles;
  const hasManagementRole = roles.some((role) => MANAGEMENT_ROLES.includes(role.roleCode));
  const _isRegularUser = !hasManagementRole && roles.length > 0;

  // Chỉ một nơi gọi /auth/me; ref tránh gọi trùng (Strict Mode / re-mount)
  useEffect(() => {
    if (!hydrated || !isLoggedIn || !accessToken || !user?.id) {
      if (!isLoggedIn) meFetchedRef.current = false;
      return;
    }
    if (meFetchedRef.current) return;
    meFetchedRef.current = true;

    const fetchUserRoles = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/me");
        if (response.data?.roles) {
          setUserRolesState(response.data.roles);
          setUserRoles(response.data.roles);
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        meFetchedRef.current = false;
      }
    };
    fetchUserRoles();
  }, [hydrated, isLoggedIn, accessToken, user?.id, setUserRoles]);

  const handleLogout = () => {
    logout();
    setUserRolesState([]);
    setIsMobileMenuOpen(false);
    // Điều hướng về trang chủ (locale prefix) sau khi đăng xuất
    navigation.push(localizedHref("/", locale));
  };

  return (
    <header className="h-[var(--hd)] shadow fixed top-0 left-0 w-full z-[999] bg-[var(--cl-pri)]">
      <div className="container h-full flex">
        <div className="flex h-full items-center justify-between gap-x-[1.6rem] w-full">
          <Link
            className="group max-w-[16rem] w-full !h-auto overflow-hidden block"
            href={hasManagementRole ? localizedHref("/admin", locale) : localizedHref("/", locale)}
          >
            <Image
              src="/logoHD.png"
              alt="logoHD"
              width={100}
              height={100}
              priority
              unoptimized
              className="w-full h-full object-contain transition ease-linear xl:group-hover:scale-95 filter-white"
            />
          </Link>
          {/* Logout button for admin pages */}
          {strippedPath.startsWith("/admin") && hydrated && isLoggedIn && (
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 text-[var(--cl-white)]">
                <Image
                  src="/icAva.png"
                  alt="icAva"
                  width={24}
                  height={24}
                  className="flex-shrink-0 rounded-full"
                  priority
                  unoptimized
                />
                <span className="text-sm uppercase font-medium">{user?.fullname}</span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  navigation.push(localizedHref("/", locale));
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--cl-white)] hover:bg-[var(--cl-four)] rounded-lg transition-colors uppercase"
                title={t("logout")}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">{t("logout")}</span>
              </button>
            </div>
          )}
          {/* Desktop navigation - đẩy ra giữa, ẩn menu cho management roles */}
          {!hasManagementRole && !strippedPath.startsWith("/admin") && (
            <ul className="hidden lg:flex gap-x-[1.2rem] items-center mx-auto">
              {menuLists.map((menuList) => {
                const target = localizedHref(menuList.path, locale);
                const isActive = strippedPath === menuList.path;
                return (
                  <li
                    key={menuList.key}
                    className="group last:[&>a]:h-auto last:flex last:flex-col last:justify-center last:[&>a]:bg-[var(--cl-pri)] h-full last:[&>a]:text-[var(--cl-sec)] last:[&>a]:px-[2rem] last:[&>a]:py-[1.2rem] last:[&>a]:rounded-lg last:[&>a]:hover:bg-[var(--cl-four)] relative last:[&>a]:hover:!text-[var(--cl-white)]"
                  >
                    <Link
                      className={`p-[1rem]  text-md group-hover:text-[var(--cl-four)] transition ease-linear h-full flex justify-center items-center gap-x-2 ${isActive ? "text-[var(--cl-four)]" : "text-[var(--cl-white)]"} uppercase`}
                      href={target}
                    >
                      {t(menuList.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {/* Right group - auth + locale switcher (desktop) */}
          {!hasManagementRole && !strippedPath.startsWith("/admin") && (
            <div className="hidden lg:flex items-center gap-x-[3rem] ml-auto">
              {hydrated && !isLoggedIn && (
                <>
                  <Link
                    className={`p-[1rem] text-md transition ease-linear h-full flex uppercase justify-center items-center gap-x-2 ${strippedPath === "/sign-in" ? "text-[var(--cl-four)]" : "text-[var(--cl-white)]"} hover:text-[var(--cl-four)]`}
                    href={localizedHref("/sign-in", locale)}
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    className={`h-auto flex flex-col justify-center px-[2rem] py-[0.6rem] rounded-lg transition ${
                      strippedPath === "/sign-up"
                        ? "bg-[var(--cl-white)] text-[var(--cl-pri)]"
                        : "bg-[var(--cl-four)] text-[var(--cl-white)] hover:bg-[var(--cl-white)] hover:text-[var(--cl-pri)]"
                    }`}
                    href={localizedHref("/sign-up", locale)}
                  >
                    <span className="p-[1rem] text-md h-full flex justify-center items-center gap-x-2 uppercase">
                      {t("signUp")}
                    </span>
                  </Link>
                </>
              )}
              {hydrated && isLoggedIn && (
                <div className="group flex items-center gap-x-[0.4rem] h-full flex-shrink-0 relative">
                  <div className="flex h-full items-center gap-x-[0.4rem]">
                    <Image
                      src="/icAva.png"
                      alt="icAva"
                      width={26}
                      height={26}
                      className="flex-shrink-0 mt-[0.25rem]"
                      priority
                      unoptimized
                    />
                    <div className="flex flex-col">
                      <p className="text-md text-[var(--cl-white)] uppercase font-medium">
                        {user?.fullname}
                      </p>
                    </div>
                    <span className="w-[2rem] h-[2rem] flex justify-center items-center ">
                      <ChevronDown className="text-[var(--cl-white)] w-full h-full mt-[0.25rem] transition group-hover:rotate-[180deg] group-hover:text-[var(--cl-white)]" />
                    </span>
                  </div>
                  <ul className="absolute top-[100%] right-0 w-full min-w-[16rem] shadow-bg-dark-900 shadow-lg bg-white opacity-0 pointer-events-none transition translate-y-[5%] group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-[0%] z-10">
                    <li>
                      <Link
                        className="p-[1rem] text-base flex items-center text-[var(--cl-third)] text-base hover:text-[var(--cl-sec)] hover:bg-[var(--cl-four)] transition ease-linear uppercase text-nowrap"
                        href={localizedHref("/my-tickets", locale)}
                      >
                        {t("myTickets")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="p-[1rem] text-base flex items-center text-[var(--cl-third)] text-base hover:text-[var(--cl-sec)] hover:bg-[var(--cl-four)] transition ease-linear uppercase text-nowrap"
                        href={localizedHref("/my-journey", locale)}
                      >
                        {t("myJourney")}
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="p-[1rem] text-base flex items-center text-[var(--cl-red)] text-base hover:text-[var(--cl-white)] hover:bg-[var(--cl-red)] w-full transition ease-linear uppercase text-nowrap cursor-pointer"
                      >
                        {t("logout")}
                      </button>
                    </li>
                  </ul>
                </div>
              )}
              <LocaleSwitcher />
            </div>
          )}
          {/* Mobile actions (locale switcher ẩn mobile để dành chỗ cho menu button) */}
          <div className="flex items-center gap-x-2 lg:hidden ml-auto">
            {strippedPath.startsWith("/admin") && hydrated && isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  navigation.push(localizedHref("/", locale));
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--cl-white)] hover:bg-[var(--cl-four)] rounded-lg transition-colors"
                title={t("logout")}
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <>
                {hydrated && !isLoggedIn && (
                  <Link
                    href={localizedHref("/sign-in", locale)}
                    className="text-[var(--cl-white)] text-sm uppercase"
                  >
                    {t("signIn")}
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[var(--cl-white)] hover:bg-[var(--cl-four)]"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  aria-label={t("toggleNav")}
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile navigation drawer */}
      <div
        className={`lg:hidden bg-[var(--cl-pri)] text-[var(--cl-white)] transition-max-height duration-300 overflow-hidden mobile-nav-drawer ${
          isMobileMenuOpen ? "max-h-[40rem]" : "max-h-0"
        }`}
      >
        <div className="container pb-4">
          <nav className="flex flex-col gap-y-2 pt-2">
            {!hasManagementRole &&
              menuLists.map((menuList) => (
                <Link
                  key={menuList.key}
                  href={localizedHref(menuList.path, locale)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-2 text-sm font-medium uppercase border-b border-white/10 last:border-b-0 ${
                    strippedPath === menuList.path
                      ? "text-[var(--cl-four)]"
                      : "text-[var(--cl-white)]"
                  }`}
                >
                  {t(menuList.key)}
                </Link>
              ))}

            {hydrated &&
              (isLoggedIn ? (
                <div className="mt-2 border-t border-white/10 pt-2 flex flex-col gap-y-2">
                  <p className="text-sm uppercase text-white/80 flex items-center gap-x-2">
                    <Image
                      src="/icAva.png"
                      alt="icAva"
                      width={20}
                      height={20}
                      className="flex-shrink-0"
                      priority
                      unoptimized
                    />
                    {user?.fullname}
                  </p>
                  {hasManagementRole ? (
                    <Link
                      href={localizedHref("/admin", locale)}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm text-[var(--cl-white)] hover:text-[var(--cl-four)] flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      {t("manage")}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={localizedHref("/my-tickets", locale)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm text-[var(--cl-white)] hover:text-[var(--cl-four)]"
                      >
                        {t("myTickets")}
                      </Link>
                      <Link
                        href={localizedHref("/my-journey", locale)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm text-[var(--cl-white)] hover:text-[var(--cl-four)]"
                      >
                        {t("myJourney")}
                      </Link>
                    </>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-1 self-start"
                    onClick={handleLogout}
                  >
                    {t("logout")}
                  </Button>
                </div>
              ) : (
                <div className="mt-2 border-t border-white/10 pt-2 flex flex-col gap-y-2">
                  <Link
                    href={localizedHref("/sign-in", locale)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm uppercase ${strippedPath === "/sign-in" ? "text-[var(--cl-four)]" : "text-[var(--cl-white)]"}`}
                  >
                    {t("signIn")}
                  </Link>
                  <Button
                    asChild
                    size="sm"
                    className="bg-[var(--cl-four)] text-[var(--cl-white)] hover:bg-[var(--cl-white)] hover:text-[var(--cl-pri)]"
                  >
                    <Link
                      href={localizedHref("/sign-up", locale)}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="uppercase text-sm"
                    >
                      {t("signUp")}
                    </Link>
                  </Button>
                </div>
              ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
