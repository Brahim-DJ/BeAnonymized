import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva("flex", {
  variants: {
    variant: {
      pill: "items-center gap-1 bg-secondary/80 rounded-full p-1",
      underline: "gap-1 border-b border-border",
      "underline-top": "gap-1 border-t border-border bg-background",
    },
  },
  defaultVariants: {
    variant: "pill",
  },
})

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
)
TabsList.displayName = TabsPrimitive.List.displayName

const tabsTriggerVariants = cva(
  "cursor-pointer font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        pill: "px-4 py-1.5 text-xs rounded-full text-muted hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-sm",
        underline: "px-4 py-2.5 text-xs border-b-2 -mb-px border-transparent text-muted hover:text-foreground data-[state=active]:border-accent data-[state=active]:text-primary data-[state=active]:font-semibold",
        "underline-top": "px-4 py-2 text-xs border-t-2 -mt-px border-transparent text-muted hover:text-foreground data-[state=active]:border-accent data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:bg-white",
      },
    },
    defaultVariants: {
      variant: "pill",
    },
  }
)

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, variant, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = TabsPrimitive.Content

export { Tabs, TabsList, TabsTrigger, TabsContent }
