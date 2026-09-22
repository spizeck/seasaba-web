import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import { canServeNlRoute } from "@/content/nl";
import { NlContact, nlMetadata } from "@/content/nl/contact";

interface DutchContactPageProps {
  searchParams: Promise<{ interest?: string }>;
}

export async function generateMetadata({
  searchParams,
}: DutchContactPageProps): Promise<Metadata> {
  const params = await searchParams;
  return createMetadata({
    ...nlMetadata,
    path: "/contact",
    locale: "nl",
    noIndex: true,
    searchParams: params,
  });
}

export default async function DutchContactPage({
  searchParams,
}: DutchContactPageProps) {
  if (!canServeNlRoute("/contact")) notFound();
  const { interest } = await searchParams;
  return <NlContact interest={interest} />;
}
