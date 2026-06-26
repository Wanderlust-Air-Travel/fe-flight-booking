"use client"

import { Eye, Clipboard, Check, LogIn, Loader2 } from "lucide-react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TEST_ACCOUNTS, TEST_PASSWORD, type TestAccount } from "@/lib/test-accounts"

export type { TestAccount }
export { TEST_ACCOUNTS, TEST_PASSWORD }

interface TestAccountsPanelProps {
  onDirectLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
}

export function TestAccountsPanel({ onDirectLogin }: TestAccountsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = useCallback(async (value: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(fieldKey)
      setTimeout(() => setCopiedField(null), 1500)
    } catch {
      // ignore
    }
  }, [])

  const handleAccountLogin = useCallback(
    async (account: TestAccount) => {
      setLoggingInRole(account.role)
      setLoginError(null)
      const result = await onDirectLogin(account.email, account.password)
      if (!result.success) {
        setLoginError(result.error || "Đăng nhập thất bại")
        setLoggingInRole(null)
      } else {
        setIsOpen(false)
        setLoggingInRole(null)
      }
    },
    [onDirectLogin]
  )

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setLoginError(null)
          setIsOpen(true)
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
              {TEST_ACCOUNTS.length} tài khoản mẫu (mỗi role một account). Click để đăng nhập nhanh.
              Mật khẩu chung: <span className="font-mono font-semibold text-[var(--cl-pri)]">{TEST_PASSWORD}</span>
            </DialogDescription>
          </DialogHeader>

          {loginError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded text-sm text-red-700 shrink-0">
              {loginError}
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 space-y-3">
            {TEST_ACCOUNTS.map((account) => {
              const isLogging = loggingInRole === account.role
              const isDisabled = loggingInRole !== null && !isLogging
              return (
                <div
                  key={account.role}
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
                    <span className="text-xs text-gray-500 font-mono">{account.role}</span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
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
                          onClick={() => handleCopy(account.email, `${account.role}-email`)}
                          className="px-3 h-10 rounded border border-gray-300 hover:bg-gray-100 transition-colors flex items-center"
                          title="Copy email"
                        >
                          {copiedField === `${account.role}-email` ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clipboard className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleAccountLogin(account)}
                      disabled={loggingInRole !== null}
                      className="w-full h-11 text-sm gap-2 bg-[var(--cl-pri)] hover:bg-blue-900 text-white uppercase disabled:opacity-50"
                    >
                      {isLogging ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogIn className="w-4 h-4" />
                      )}
                      {isLogging
                        ? "Đang đăng nhập..."
                        : `Đăng nhập với ${account.roleName}`}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
