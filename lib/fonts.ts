import { Open_Sans, Jost } from "next/font/google";

// Fonts are instantiated once here so both locale root layouts share the
// same generated font files.
export const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});
