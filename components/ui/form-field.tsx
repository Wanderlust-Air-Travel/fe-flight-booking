"use client"

import * as React from "react"
import { useField, ErrorMessage, useFormikContext } from "formik"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  name: string
  label: string
  required?: boolean
  children: (props: {
    field: any
    form: any
    error: string | undefined
    isError: boolean
    isTouched: boolean
    className: string
  }) => React.ReactNode
  errorClassName?: string
  showSuccessIcon?: boolean
}

/**
 * Professional Form Field Wrapper with enhanced validation feedback
 * - Visual error state (red border, error icon)
 * - Success state (green border, check icon)
 * - Smooth animations
 * - Full accessibility support
 */
export function FormField({
  name,
  label,
  required = false,
  children,
  errorClassName,
  showSuccessIcon = false,
}: FormFieldProps) {
  const [field, meta] = useField(name)
  const form = useFormikContext()
  const isError = meta.touched && !!meta.error
  const isValid = meta.touched && !meta.error && field.value
  const error = meta.touched && meta.error ? meta.error : undefined

  // Generate unique IDs for accessibility
  const fieldId = React.useId()
  const errorId = `${fieldId}-error`
  const descriptionId = `${fieldId}-description`

  // Dynamic className based on state
  const inputClassName = cn(
    "transition-all duration-200",
    isError && "border-destructive focus:border-destructive focus:ring-destructive/20",
    isValid && showSuccessIcon && "border-green-500 focus:border-green-500 focus:ring-green-500/20"
  )

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <Label
        htmlFor={fieldId}
        className={cn(
          "text-sm md:text-base font-semibold",
          isError ? "text-destructive" : "text-[var(--cl-pri)]"
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        {children({
          field: {
            ...field,
            id: fieldId,
            "aria-invalid": isError,
            "aria-describedby": isError ? errorId : descriptionId,
          },
          form,
          error,
          isError,
          isTouched: meta.touched,
          className: inputClassName,
        })}
        
        {/* Success Icon */}
        {isValid && showSuccessIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
          </div>
        )}
        
        {/* Error Icon */}
        {isError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Error Message with Animation */}
      <ErrorMessage name={name}>
        {(msg: string) => (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            className={cn(
              "flex items-start gap-2 text-xs md:text-sm text-destructive font-medium",
              "animate-in fade-in-0 slide-in-from-top-1 duration-200",
              errorClassName
            )}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{msg}</span>
          </div>
        )}
      </ErrorMessage>
    </div>
  )
}

/**
 * Helper hook to get field error state from Formik
 */
export function useFormFieldError(name: string) {
  const [, meta] = useField(name)
  return {
    error: meta.touched && meta.error ? meta.error : undefined,
    isError: meta.touched && !!meta.error,
    isTouched: meta.touched,
  }
}

