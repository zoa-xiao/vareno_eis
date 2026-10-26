import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "VARENO ERP · Dashboard perusahaan",
  description: "Satu ruang kerja untuk memantau operasional, persediaan, produksi, penjualan, dan keuangan VARENO.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
