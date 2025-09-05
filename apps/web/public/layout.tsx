import { cn } from "@/lib/utils"
import localFont from "next/font/local"
import { Inter } from "next/font/google"
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const calSans = localFont({
  src: "../../../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal-sans",
})

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  console.log('params', await params)
  const { locale = "en" } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);
    // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return <html suppressHydrationWarning lang={locale}>
    <body
    className={cn(
      "min-h-screen bg-background font-sans antialiased",
      inter.variable,
      calSans.variable,
    )}
  >
      <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
    </body>
  </html>;
}
