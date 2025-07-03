"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null)

const DropdownMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, ref])

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={ref} className={cn("relative inline-block text-left", className)} {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
})
DropdownMenu.displayName = "DropdownMenu"

const DropdownMenuTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within a DropdownMenu')
  }

  const { isOpen, setIsOpen } = context

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsOpen(!isOpen)
    onClick?.(event)
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end"
  }
>(({ className, align = "end", children, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  
  if (!context) {
    throw new Error('DropdownMenuContent must be used within a DropdownMenu')
  }

  const { isOpen, setIsOpen } = context

  if (!isOpen) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-lg",
        align === "end" && "right-0",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        "top-full mt-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event)
    // Close the dropdown after clicking an item
    if (context) {
      context.setIsOpen(false)
    }
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} 