import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChangeLens - RevenueCat",
  description: "Monetization changes in context",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
