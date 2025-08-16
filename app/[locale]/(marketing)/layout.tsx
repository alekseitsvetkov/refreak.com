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
  const t = await getTranslations({ locale: params.locale, namespace: "navigation" });
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container fixed inset-x-0 top-0 z-40 bg-background/80 backdrop-blur-sm transition duration-700 ease-out">
        <div className="flex h-16 items-center justify-between py-6">
          <MainNav items={marketingConfig.mainNav} />
          <Link
            href={`/${params.locale}/blog`}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "p-0 font-medium text-muted-foreground hover:text-primary"
            )}
          >
            {t("blog")}
          </Link>
        </div>
      </header>
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
    </div>
  )
}
