"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, Copy, X } from "lucide-react";
import type { DonationRecipient } from "@/data/donations";

/**
 * Dialog showing a donation recipient's own bank-transfer details (#195).
 * Follows the site's established modal pattern (HotelModal): Escape to
 * close, Tab focus trap, scroll lock, and focus restore to the trigger.
 * Values come straight from the recipient's registry entry — the dialog
 * never invents or normalizes account data.
 */
export function BankDetailsModal({
  recipient,
  onClose,
}: {
  recipient: DonationRecipient;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const details = recipient.bankDetails!;

  // Focus close button on open; restore focus to the trigger on close.
  const triggerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => triggerRef.current?.focus();
  }, []);

  // ESC to close + focus trap
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const rows: { label: string; value: string; copyable?: boolean }[] = [
    { label: "Account name", value: details.accountName },
    { label: "Account number", value: details.accountNumber, copyable: true },
    { label: "Bank", value: details.bankName },
    { label: "SWIFT code", value: details.swift, copyable: true },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Donate to ${recipient.name} by bank transfer`}
    >
      <div
        ref={modalRef}
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-y-auto rounded-2xl bg-card shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
        style={{ animation: "hotelModalIn 0.18s ease-out both" }}
      >
        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close donation details"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3 pr-8">
            {recipient.image && (
              <Image
                src={recipient.image}
                alt=""
                width={80}
                height={80}
                className="h-16 w-16 shrink-0 rounded-md object-contain object-left"
              />
            )}
            <h2 className="text-base font-semibold text-foreground">
              Donate to {recipient.name}
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Pay by direct bank transfer to the account below.
          </p>

          <dl className="space-y-1.5 rounded-lg border border-border/50 bg-muted/20 p-3.5 text-sm">
            {rows.map(({ label, value, copyable }) => (
              <div
                key={label}
                className="flex items-baseline justify-between gap-3"
              >
                <dt className="shrink-0 text-muted-foreground">{label}</dt>
                <dd className="flex min-w-0 items-center gap-1 font-medium text-foreground">
                  <span className="text-right">{value}</span>
                  {copyable && <CopyValueButton value={value} label={label} />}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-xs leading-relaxed text-muted-foreground">
            These are the {recipient.name}&apos;s own bank details. Sea Saba
            does not collect or process your donation.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes hotelModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function CopyValueButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  // Track the reset timer so repeated clicks don't strand earlier timeouts
  // and unmounting clears a pending callback (review feedback, #196).
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );
  return (
    <button
      type="button"
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      title={copied ? `${label} copied` : `Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          if (timerRef.current) clearTimeout(timerRef.current);
          setCopied(true);
          timerRef.current = setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard unavailable (insecure context or permission denied) —
          // the value stays visible and selectable either way.
        }
      }}
      className="inline-flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
    >
      {copied ? (
        <Check className="size-3.5 text-primary" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
    </button>
  );
}
