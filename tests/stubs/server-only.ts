// Test stub for the `server-only` marker package. In Next.js builds it
// throws when a server-only module is imported into a client bundle; under
// vitest (no react-server condition) it would throw unconditionally, so the
// vitest alias points at this no-op instead. The real enforcement happens
// at `next build`.
export {};
