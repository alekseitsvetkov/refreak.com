import "../../styles/globals.css"
import { siteConfig } from "@/config/site"

import { Toaster } from "@/components/ui/toaster" 
import { Analytics } from "@/components/analytics"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { SpeedInsights } from "@/components/speed-insights"
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from "next-intl/server";
import localFont from "next/font/local"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "Server Components",
    "Radix UI",
  ],
  authors: [
    {
      name: "base",
      url: "https://refreak.com",
    },
  ],
  creator: "base",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@base",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const calSans = localFont({
  src: "../../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal-sans",
})

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: RootLayoutProps) {
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

  return (
    <html suppressHydrationWarning lang={locale}>
    <body
    className={cn(
      "min-h-screen bg-background font-sans antialiased",
      inter.variable,
      calSans.variable,
    )}
  ><NextIntlClientProvider messages={messages}><ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Analytics />
      <SpeedInsights />
      <Toaster />
      <TailwindIndicator />
    </ThemeProvider></NextIntlClientProvider></body></html>
  )
}
