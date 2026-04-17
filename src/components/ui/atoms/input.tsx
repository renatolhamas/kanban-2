import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, helperText, ...props }, ref) => (
    <div className="w-full space-y-1">
      <input
        type={type}
        className={cn(
          "w-full bg-surface-container-high text-text-primary placeholder:text-on-surface-variant px-md py-md border-b-2 border-transparent focus:border-primary outline-none transition-colors duration-200 rounded-xs",
          error && "border-b-2 border-error",
          className
        )}
        ref={ref}
        {...props}
      />
      {helperText && (
        <p
          className={cn(
            "text-xs px-1",
            error ? "text-error" : "text-on-surface-variant"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  )
)
Input.displayName = "Input"

export { Input }
