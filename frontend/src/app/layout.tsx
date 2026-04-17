import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF RAG",
  description: "AI-Powered PDF RAG and Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}