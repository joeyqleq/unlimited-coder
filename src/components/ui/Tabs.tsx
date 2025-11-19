"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ReactNode } from "react";

function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Tabs(props: TabsPrimitive.TabsProps & { className?: string }) {
  const { className, ...rest } = props;
  return <TabsPrimitive.Root className={clsx("h-full flex flex-col", className)} {...rest} />;
}

export function TabsList({ className, ...props }: TabsPrimitive.TabsListProps) {
  return (
    <TabsPrimitive.List
      className={clsx(
        "inline-flex items-center rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: TabsPrimitive.TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={clsx(
        "px-2 py-0.5 rounded-md data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-100 outline-none",
        "data-[state=inactive]:hover:bg-neutral-900",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: TabsPrimitive.TabsContentProps & { children?: ReactNode }) {
  return (
    <TabsPrimitive.Content
      className={clsx("h-full w-full", className)}
      {...props}
    />
  );
}
