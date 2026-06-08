import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manabi Voice",
  description: "Spoken learning inspection log in mock mode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-zinc-100 text-zinc-950">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link className="text-base font-semibold text-zinc-950" href="/">
              Manabi Voice
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link className="px-3 py-2 text-zinc-700 hover:bg-zinc-100" href="/">
                今日
              </Link>
              <Link className="px-3 py-2 text-zinc-700 hover:bg-zinc-100" href="/record">
                作成
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
