import { notFound } from "next/navigation"
import { allPages } from "contentlayer/generated"
import type { Locale } from "@/i18n/routing"

import { Mdx } from "@/components/mdx-components"

import "@/styles/mdx.css"
import { Metadata } from "next"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { absoluteUrl } from "@/lib/utils"

interface PageProps {
  params: {
    locale: Locale
    slug: string[]
  }
}

async function getPageFromParams(params: PageProps["params"]) {
  const slug = params?.slug?.join("/")
  const locale = params?.locale
  if (!slug) return null

  // Try exact locale match first, then fallback to EN
  const byLocale = allPages.find((p) => p.slugAsParams === slug && p.locale === locale)
  if (byLocale) return byLocale
  const fallback = allPages.find((p) => p.slugAsParams === slug && p.locale === "en")
  return fallback ?? null
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = await getPageFromParams(params)

  if (!page) {
    return {}
  }

  const url = env.NEXT_PUBLIC_APP_URL
  const pathname = `/${page.slugAsParams}`

  const ogUrl = new URL(`${url}/api/og`)
  ogUrl.searchParams.set("heading", page.title)
  ogUrl.searchParams.set("type", siteConfig.name)
  ogUrl.searchParams.set("mode", "light")

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: absoluteUrl(pathname),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
      url: absoluteUrl(pathname),
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [ogUrl.toString()],
    },
  }
}

export async function generateStaticParams(): Promise<PageProps["params"][]> {
  return allPages.map((page) => ({
    locale: page.locale as Locale,
    slug: page.slugAsParams.split("/"),
  }))
}

export default async function PagePage({ params }: PageProps) {
  const page = await getPageFromParams(params)

  if (!page) {
    notFound()
  }

  return (
    <article className="container py-6 lg:py-12">
      <div className="space-y-4">
        <h1 className="inline-block font-heading text-4xl lg:text-5xl">
          {page.title}
        </h1>
        {page.description && (
          <p className="text-xl text-muted-foreground">{page.description}</p>
        )}
      </div>
      <hr className="my-4" />
      <Mdx code={page.body.code} />
    </article>
  )
}
