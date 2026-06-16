import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rezeptbuch",
  description: "Mein persönliches Rezeptbuch",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={dmSans.variable}>
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b-2 border-brand-600 bg-slate-900 shadow-lg">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white"
            >
              🍳 Rezeptbuch
            </Link>
            <Link
              href="/recipes/new"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500 hover:shadow-md"
            >
              + Neues Rezept
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
