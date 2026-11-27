import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Mali } from "next/font/google";
import "./globals.css";

const mali = Mali({ weight: ["500", "700"], subsets: ["thai", "latin"], variable: "--font-mali" });
const plex = IBM_Plex_Sans_Thai({ weight: ["400", "600"], subsets: ["thai", "latin"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: "จบแล้วไปไหน",
  description: "เส้นทางหลังเรียนหมอ รวมรีวิวจากรุ่นพี่",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${mali.variable} ${plex.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
