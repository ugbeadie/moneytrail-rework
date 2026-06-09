import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../app/components/theme-provider";
import { Toaster } from "sonner"; // Assuming you added this earlier
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "MoneyTrail",
  description: "Know where your money goes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <div className="fixed bottom-6 right-6 z-50">
            <ThemeToggle />
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
