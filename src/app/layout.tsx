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
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-600 text-lg shadow-sm shadow-brand-200">
                🍳
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Rezeptbuch
              </span>
            </Link>
            <Link
              href="/recipes/new"
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-200 transition-all hover:bg-brand-500 hover:shadow-lg active:scale-95"
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
