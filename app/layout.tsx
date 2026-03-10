import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DataBahn.ai — Internal Cost & Margin Dashboard",
  description: "Pipeline economics visibility for DataBahn leadership",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
