import Script from "next/script"
import { getArticleSchema, getBreadcrumbSchema } from "@/lib/schema"
import { siteConfig } from "@/config/site"

interface BlogSchemaMarkupProps {
  post: {
    title: string
    description: string
    date: string
    slug: string
    image?: string
    author?: string
  }
  locale: string
}

export function BlogSchemaMarkup({ post, locale }: BlogSchemaMarkupProps) {
  const postUrl = `${siteConfig.url}/${locale === "ru" ? "ru/" : ""}blog/${post.slug}`
  
  const articleSchema = getArticleSchema({
    title: post.title,
    description: post.description,
    date: post.date,
    url: postUrl,
    image: post.image,
    author: post.author,
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "Blog", url: `${siteConfig.url}/${locale === "ru" ? "ru/" : ""}blog` },
    { name: post.title, url: postUrl },
  ])

  return (
    <Script
      id="blog-schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: `${articleSchema}\n${breadcrumbSchema}`,
      }}
    />
  )
}
