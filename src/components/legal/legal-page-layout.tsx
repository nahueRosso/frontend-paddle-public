"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type LegalPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function LegalPageLayout({
  children,
  className,
}: LegalPageLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto mt-6 max-w-3xl space-y-10 px-4 py-16 leading-relaxed text-[#4B5563] dark:text-slate-300 sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default LegalPageLayout;
