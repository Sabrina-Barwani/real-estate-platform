import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Estate Platform",
  description: "Premium property listings",
};

// lang/dir stay fixed at the document level; per-page RTL is handled inside
// PublicShell (see Phase 7a) since the admin dashboard stays English/LTR.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="bg-base-50 text-base-900 font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
