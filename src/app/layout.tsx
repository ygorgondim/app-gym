import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
export const metadata: Metadata = { title: "PULSE — Train together", description: "Social training, live on the map." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR" suppressHydrationWarning><body><ThemeProvider attribute="class" defaultTheme="dark" enableSystem>{children}</ThemeProvider></body></html>; }
