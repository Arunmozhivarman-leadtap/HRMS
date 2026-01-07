import type { Metadata } from "next";
import { fontSans, fontSerif } from "../lib/fonts";
import "./globals.css";
import { cn } from "../lib/utils";

export const metadata: Metadata = {
  title: "HRMS System",
  description: "Human Resource Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontSerif.variable
        )}
      >
        {children}
        hi
      </body>
    </html>
  );
}
