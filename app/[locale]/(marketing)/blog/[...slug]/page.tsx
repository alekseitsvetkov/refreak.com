import { notFound } from "next/navigation"
import { allAuthors, allPosts } from "contentlayer/generated"

import { Mdx } from "@/components/mdx-components"

import "@/styles/mdx.css"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { env } from "@/env.mjs"
import { absoluteUrl, cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { getTranslations } from "next-intl/server"
import { setRequestLocale } from "next-intl/server"
import { DateDisplay } from "@/components/ui/date-display"

interface PostPageProps {
  params: {
    locale: string
    slug: string[]
  }
}

async function getPostFromParams(params: PostPageProps["params"]) {
  const slug = params?.slug?.join("/")
  const locale = params?.locale
  const post = allPosts.find(
    (post) => post.slugAsParams === slug && post.locale === locale
  )

  if (!post) {
    null
  }

  return post
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await getPostFromParams(params)

  if (!post) {
    return {}
  }

  const url = env.NEXT_PUBLIC_APP_URL

  const ogStaticPath = `/og/${post.locale}/${post.slugAsParams}.png`
  const ogUrl = new URL(`${url}/api/og`)
  ogUrl.searchParams.set("heading", post.title)
  ogUrl.searchParams.set("type", "Blog Post")
  ogUrl.searchParams.set("mode", "dark")
  const defaultBg = "/images/blog/blog-picture.png"
  const rawBg = post.image || defaultBg
  const bgUrl = rawBg.startsWith("/og/") ? defaultBg : rawBg
  ogUrl.searchParams.set("bg", bgUrl.startsWith("/") ? `${env.NEXT_PUBLIC_APP_URL}${bgUrl}` : bgUrl)

  // Determine alternate locale URLs for hreflang / OpenGraph
  const siblingPosts = allPosts.filter(
    (p) => p.slugAsParams === post.slugAsParams && p._id !== post._id
  )
  const alternateLocales = siblingPosts.map((p) => p.locale)
  const openGraphLocale = post.locale === "ru" ? "ru_RU" : "en_US"
  const openGraphAlternateLocale = alternateLocales.map((l) =>
    l === "ru" ? "ru_RU" : "en_US"
  )
  const alternatesLanguages: Record<string, string> = {}
  ;[post.locale, ...alternateLocales].forEach((l) => {
    const code = l === "ru" ? "ru-RU" : "en-US"
    alternatesLanguages[code] = absoluteUrl(`/${l}${post.slug}`)
  })

  const ogDynamicUrl = ogUrl.toString()

  return {
    title: post.title,
    description: post.description,
    authors: post.authors.map((author) => ({
      name: author,
    })),
    alternates: {
      canonical: absoluteUrl(`/${post.locale}${post.slug}`),
      languages: alternatesLanguages,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: absoluteUrl(`/${post.locale}${post.slug}`),
      locale: openGraphLocale,
      alternateLocale: openGraphAlternateLocale,
      images: [
        {
          url: absoluteUrl(ogStaticPath),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [absoluteUrl(ogStaticPath)],
    },
  }
}

export async function generateStaticParams(): Promise<
  Pick<PostPageProps["params"], "slug">[]
> {
  // Only return slug parts here; the parent [locale] segment is handled separately
  return allPosts.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params)

  if (!post) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(params.locale)

  const t = await getTranslations({ locale: params.locale, namespace: "blog" })

  const authors = post.authors.map((author) =>
    allAuthors.find(({ slug }) => slug === `/authors/${author}`)
  )

  // Use the image defined in the blog frontmatter for the in-page hero

  return (
    <article className="container relative py-6 lg:py-10">
      <Link
        href={`/${post.locale}/blog`}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-[-200px] top-14 hidden xl:inline-flex"
        )}
      >
        <Icons.chevronLeft className="mr-2 h-4 w-4" />
        {t("seeAllPosts")}
      </Link>
      <div>
        {post.date && (
          <div className="block text-sm text-muted-foreground">
            {t("publishedOn")} <DateDisplay date={post.date} format="long" />
          </div>
        )}
        <h1 className="mt-2 inline-block font-heading text-4xl leading-tight lg:text-5xl">
          {post.title}
        </h1>
        {authors?.length ? (
          <div className="mt-4 flex space-x-4">
            {authors.map((author) =>
              author ? (
                <Link
                  key={author._id}
                  href={`#`}
                  className="flex items-center space-x-2 text-sm"
                >
                  <Image
                    src={author.avatar}
                    alt={author.title}
                    width={42}
                    height={42}
                    className="rounded-full"
                  />
                  <div className="flex-1 text-left leading-tight">
                    <p className="font-medium">{author.title}</p>
                  </div>
                </Link>
              ) : null
            )}
          </div>
        ) : null}
      </div>
      {post.image && (
        <Image
          src={post.image}
          alt={post.title}
          width={1200}
          height={630}
          className="my-8 rounded-md border bg-muted transition-colors"
          priority
        />
      )}
      <Mdx code={post.body.code} />
      <hr className="mt-12" />
      <div className="flex justify-center py-6 lg:py-10">
        <Link
          href={`/${post.locale}/blog`}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          {t("seeAllPosts")}
        </Link>
      </div>
    </article>
  )
}
