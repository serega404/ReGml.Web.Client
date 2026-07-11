import type { Metadata } from 'next';

import { config } from '@/core/configs';
import { GmlContextInitializer } from '@/core/components/GmlContextInitializer';
import { QueryProvider, ThemeProvider, TooltipProvider } from '@/core/providers';
import { Toaster } from '@/shared/ui/sonner';

import './globals.css';

export const metadata: Metadata = {
  title: config.name,
  description: `Официальный сайт ${config.name}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <GmlContextInitializer />
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
