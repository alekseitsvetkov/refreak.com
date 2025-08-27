import Image from "next/image"
import Link from "next/link"
import { allPosts } from "contentlayer/generated"
import { compareDesc } from "date-fns"

import { getTranslations } from "next-intl/server"
import { setRequestLocale } from "next-intl/server"
import { DateDisplay } from "@/components/ui/date-display"
import { absoluteUrl } from "@/lib/utils"
import { SchemaMarkup } from "@/components/schema-markup"

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const pathname = `/${locale}/blog`;
  
  // Enable static rendering for metadata
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });
  
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://refreak.com"),
    alternates: {
      canonical: absoluteUrl(pathname),
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: { locale: string }
}) {
  const locale = params?.locale
  
  // Enable static rendering
  setRequestLocale(locale)
  
  const t = await getTranslations({ locale, namespace: "blog" })
  
  const posts = allPosts
    .filter((post) => post.published && post.locale === locale)
    .sort((a, b) => {
      return compareDesc(new Date(a.date), new Date(b.date))
    })

  return (
    <>
      <SchemaMarkup 
        includeOrganization={true}
        includeWebSite={true}
        includeSoftwareApplication={false}
        includeFAQ={false}
        locale={locale}
      />
      <div className="container py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight text-primary lg:text-5xl">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>
      <hr className="my-8" />
      {posts?.length ? (
        <div className="grid gap-10 sm:grid-cols-2">
          {posts.map((post, index) => (
            <article
              key={post._id}
              className="group relative flex flex-col space-y-2"
            >
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  width={804}
                  height={452}
                  className="rounded-md border bg-muted transition-colors"
                  priority={index <= 1}
                />
              )}
              <h2 className="text-2xl font-extrabold text-primary">{post.title}</h2>
              {post.description && (
                <p className="text-muted-foreground">{post.description}</p>
              )}
              {post.date && (
                <DateDisplay
                  date={post.date}
                  format="short"
                  className="text-sm text-muted-foreground"
                />
              )}
              <Link href={`/${locale}${post.slug}`} className="absolute inset-0">
                <span className="sr-only">{t("viewArticle")}</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p>{t("noPosts")}</p>
      )}
    </div>
    </>
  )
}
