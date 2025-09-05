import Link from "next/link"

import { marketingConfig } from "@/config/marketing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { getTranslations } from "next-intl/server"

interface MarketingLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function MarketingLayout({
  children,
  params,
}: MarketingLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "navigation" });
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-[200px] bg-marketing-radial duration-1000 ease-in-out animate-in fade-in"
      /> */}
      <header className="container fixed inset-x-0 top-0 z-40 bg-background/0 backdrop-blur-sm transition duration-700 ease-out">
        <div className="flex h-16 items-center justify-between py-6">
          <MainNav items={marketingConfig.mainNav} />
          <Link
            href={`/${locale}/blog`}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "p-0 font-medium text-muted-foreground hover:text-primary"
            )}
          >
            {t("blog")}
          </Link>
        </div>
      </header>
      <main className="relative z-10 flex-1 pt-16">{children}</main>
      <SiteFooter className="relative z-10" />
    </div>
  )
}
