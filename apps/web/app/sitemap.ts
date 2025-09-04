import { MetadataRoute } from "next"
import { allPosts } from "@/.contentlayer/generated"
import { siteConfig } from "@/config/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Статические страницы
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
      alternates: {
        languages: {
          'ru': `${baseUrl}/ru`,
        },
      },
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          'ru': `${baseUrl}/ru/blog`,
        },
      },
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
      alternates: {
        languages: {
          'ru': `${baseUrl}/ru/privacy`,
        },
      },
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
      alternates: {
        languages: {
          'ru': `${baseUrl}/ru/terms`,
        },
      },
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: {
        languages: {
          'ru': `${baseUrl}/ru/support`,
        },
      },
    },
  ]

  // Блог-посты (английские)
  const blogPosts = allPosts
    .filter((post) => post.locale === 'en')
    .map((post) => ({
      url: `${baseUrl}${post.slug}`,
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          'ru': `${baseUrl}/ru${post.slug}`,
        },
      },
    }))

  // Русские версии страниц
  const russianPages = [
    {
      url: `${baseUrl}/ru`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
      alternates: {
        languages: {
          'en': baseUrl,
        },
      },
    },
    {
      url: `${baseUrl}/ru/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          'en': `${baseUrl}/blog`,
        },
      },
    },
    {
      url: `${baseUrl}/ru/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
      alternates: {
        languages: {
          'en': `${baseUrl}/privacy`,
        },
      },
    },
    {
      url: `${baseUrl}/ru/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
      alternates: {
        languages: {
          'en': `${baseUrl}/terms`,
        },
      },
    },
    {
      url: `${baseUrl}/ru/support`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: {
        languages: {
          'en': `${baseUrl}/support`,
        },
      },
    },
  ]

  // Русские блог-посты
  const russianBlogPosts = allPosts
    .filter((post) => post.locale === 'ru')
    .map((post) => ({
      url: `${baseUrl}/ru${post.slug}`,
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          'en': `${baseUrl}${post.slug}`,
        },
      },
    }))

  return [...staticPages, ...blogPosts, ...russianPages, ...russianBlogPosts]
}
