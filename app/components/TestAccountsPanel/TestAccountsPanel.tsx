"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Clipboard, Eye, Loader2, LogIn, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface DevAccount {
  userId: string;
  email: string;
  fullname: string;
  roleCode: string;
  roleName: string;
  roleDescription: string | null;
}

interface TestAccountsPanelProps {
  /**
   * Called when the user picks an account. Receives the email of the chosen
   * account. The parent should hit `POST /api/v1/dev/login` with that email
   * (see `handleDirectLogin` in sign-in/page.tsx) and store the resulting
   * tokens via `useUserStore.login(...)`.
   */
  onDirectLogin: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export function TestAccountsPanel({ onDirectLogin }: TestAccountsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<DevAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loggingInEmail, setLoggingInEmail] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/dev/accounts", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          (data && (data.message || data.error)) ||
          `Không thể tải danh sách tài khoản (HTTP ${res.status})`;
        setLoadError(msg);
        setAccounts([]);
        return;
      }
      const list: DevAccount[] = Array.isArray(data) ? data : [];
      setAccounts(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi mạng khi tải tài khoản";
      setLoadError(message);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && accounts.length === 0 && !loading && !loadError) {
      void fetchAccounts();
    }
  }, [isOpen, accounts.length, loading, loadError, fetchAccounts]);

  const handleCopy = useCallback(async (value: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // ignore
    }
  }, []);

  const handleAccountLogin = useCallback(
    async (account: DevAccount) => {
      setLoggingInEmail(account.email);
      setLoginError(null);
      const result = await onDirectLogin(account.email);
      if (result.success) {
        setIsOpen(false);
        setLoggingInEmail(null);
      } else {
        setLoginError(result.error || "Đăng nhập thất bại");
        setLoggingInEmail(null);
      }
    },
    [onDirectLogin]
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setLoginError(null);
          setIsOpen(true);
        }}
        className="w-full h-[4.4rem] px-[2rem] bg-white text-[var(--cl-pri)] text-[1.6rem] uppercase border border-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5 cursor-pointer gap-2"
      >
        <Eye className="w-5 h-5" />
        <span>Hiển thị tài khoản test</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[70vw] md:max-w-[60vw] lg:max-w-[50vw] max-w-3xl max-h-[85vh] h-[85vh] overflow-hidden flex flex-col p-6 gap-4">
          <DialogHeader className="shrink-0 gap-2">
            <DialogTitle className="text-2xl font-bold text-[var(--cl-pri)] leading-tight">
              Tài khoản test (Dev Only)
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {accounts.length > 0
                ? `${accounts.length} tài khoản mẫu lấy từ database. Click để đăng nhập nhanh.`
                : "Tài khoản được lấy trực tiếp từ database — không cần mật khẩu."}
            </DialogDescription>
          </DialogHeader>

          {loginError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded text-sm text-red-700 shrink-0">
              {loginError}
            </div>
          )}

          {loadError && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded text-sm text-amber-800 shrink-0 flex items-center justify-between gap-3">
              <span>Không tải được danh sách tài khoản: {loadError}</span>
              <button
                type="button"
                onClick={() => void fetchAccounts()}
                className="inline-flex items-center gap-1 text-sm font-medium text-amber-900 hover:text-amber-700"
              >
                <RefreshCw className="w-4 h-4" />
                Thử lại
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 space-y-3">
            {loading && accounts.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tải danh sách tài khoản...</span>
              </div>
            ) : accounts.length === 0 && !loadError ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Không có tài khoản test nào trong database.
              </div>
            ) : (
              accounts.map((account) => {
                const isLogging = loggingInEmail === account.email;
                const isDisabled = loggingInEmail !== null && !isLogging;
                return (
                  <div
                    key={account.userId || account.email}
                    className={`border rounded-lg overflow-hidden transition-colors ${
                      isDisabled
                        ? "border-gray-200 opacity-50"
                        : "border-gray-300 hover:border-[var(--cl-pri)]"
                    }`}
                  >
                    <div className="px-4 py-2 bg-gray-50 flex items-center justify-between border-b border-gray-200">
                      <span className="text-sm font-bold text-[var(--cl-pri)] uppercase tracking-wide">
                        {account.roleName}
                      </span>
                      <span className="text-sm text-gray-500 font-mono">{account.roleCode}</span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                          Email
                        </label>
                        <div className="flex gap-2">
                          <input
                            readOnly
                            value={account.email}
                            className="flex-1 h-10 text-sm font-mono px-3 rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-[var(--cl-pri)] focus:ring-1 focus:ring-[var(--cl-pri)]"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopy(account.email, `${account.userId}-email`)}
                            className="px-3 h-10 rounded border border-gray-300 hover:bg-gray-100 transition-colors flex items-center"
                            title="Copy email"
                          >
                            {copiedField === `${account.userId}-email` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Clipboard className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Họ tên:</span>{" "}
                        <span className="text-gray-800">{account.fullname}</span>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleAccountLogin(account)}
                        disabled={loggingInEmail !== null}
                        className="w-full h-11 text-sm gap-2 bg-[var(--cl-pri)] hover:bg-blue-900 text-white uppercase disabled:opacity-50"
                      >
                        {isLogging ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogIn className="w-4 h-4" />
                        )}
                        {isLogging ? "Đang đăng nhập..." : `Đăng nhập với ${account.roleName}`}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// keep type-only reference for callers that import `TestAccount`
export type { DevAccount as TestAccount };
