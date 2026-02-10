import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...props }) => {
      if (href?.startsWith("/")) {
        return (
          <Link href={href} className="text-primary underline underline-offset-4 hover:text-primary/80" {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          className="text-primary underline underline-offset-4 hover:text-primary/80"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    ),
    ...components,
  };
}
