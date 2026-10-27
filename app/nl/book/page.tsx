import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/metadata";
import { canServeNlRoute } from "@/content/nl";
import { NlBook, nlMetadata } from "@/content/nl/book";

interface DutchBookPageProps {
  searchParams: Promise<{ item?: string }>;
}

export async function generateMetadata({
  searchParams,
}: DutchBookPageProps): Promise<Metadata> {
  const params = await searchParams;
  return createMetadata({
    ...nlMetadata,
    path: "/book",
    locale: "nl",
    noIndex: true,
    searchParams: params,
  });
}

export default async function DutchBookPage({
  searchParams,
}: DutchBookPageProps) {
  if (!canServeNlRoute("/book")) notFound();
  const { item } = await searchParams;
  return <NlBook item={item} />;
}
