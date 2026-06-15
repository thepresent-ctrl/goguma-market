import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🍠 고구마마켓",
  description: "우리 동네 중고거래 짱짱맨!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
