"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, onCheckedChange, checked, ...props }, ref) => {
  const internalRef = React.useRef<HTMLInputElement>(null)
  const inputRef = ref || internalRef

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked)
    props.onChange?.(e)
  }

  const handleClick = () => {
    if (typeof inputRef === 'function') return
    inputRef.current?.click()
  }

  return (
    <div className="relative">
      <input
        type="checkbox"
        className="sr-only"
        ref={inputRef}
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      <div
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground cursor-pointer",
          checked && "bg-primary text-primary-foreground",
          className
        )}
        onClick={handleClick}
      >
        {checked && (
          <Check className="h-3 w-3 text-white m-auto" />
        )}
      </div>
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox } 