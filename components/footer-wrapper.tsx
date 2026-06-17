"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function FooterWrapper() {
  const pathname = usePathname();
  return <Footer hideBookLinks={pathname === "/"} />;
}
