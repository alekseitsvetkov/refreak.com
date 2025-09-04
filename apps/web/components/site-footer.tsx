import * as React from "react"
import Link from "next/link"
import { useTranslations } from 'next-intl'

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations('footer');
  
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-3 md:px-0">
          <Icons.logo className="fill-primary text-primary" />
          <p className="text-center text-sm leading-loose text-primary md:text-left">
            {t("builtBy")}{" "}
            <a
              href="#"
              target="_self"
              rel="noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              base
            </a>
          </p>
        </div>
        <nav className="flex flex-col items-center gap-4 text-sm text-muted-foreground md:flex-row md:gap-6">
          <Link href="/privacy" className="hover:text-foreground">
            {t("privacyPolicy")}
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            {t("terms")}
          </Link>
          <Link href="/support" className="hover:text-foreground">
            {t("support")}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
