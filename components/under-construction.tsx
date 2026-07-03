import { HardHat } from "lucide-react";

interface UnderConstructionProps {
  title?: string;
  message?: string;
}

export function UnderConstruction({
  title = "Coming Soon",
  message = "This section is temporarily under construction while we finalize the content. Check back soon.",
}: UnderConstructionProps) {
  return (
    <section className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-muted/20 p-10 text-center sm:p-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <HardHat className="h-7 w-7 text-primary" />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>
    </section>
  );
}
