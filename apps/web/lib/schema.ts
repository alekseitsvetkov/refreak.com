import { siteConfig } from "@/config/site"

export interface SchemaMarkupProps {
  type: "Organization" | "WebSite" | "SoftwareApplication" | "FAQPage" | "BreadcrumbList" | "Article"
  data: Record<string, unknown>
}

export function generateSchemaMarkup({ type, data }: SchemaMarkupProps) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  }

  return JSON.stringify(baseSchema, null, 2)
}

// Organization schema for the company/brand
export function getOrganizationSchema() {
  return generateSchemaMarkup({
    type: "Organization",
    data: {
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      logo: `${siteConfig.url}/images/logo.svg`,
      sameAs: [
        // Add social media links when available
        // "https://twitter.com/refreak",
        // "https://github.com/alekseitsvetkov/refreak",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        url: `${siteConfig.url}/support`,
      },
    },
  })
}

// WebSite schema for the main website
export function getWebSiteSchema() {
  return generateSchemaMarkup({
    type: "WebSite",
    data: {
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/blog?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  })
}

// SoftwareApplication schema for the browser extension
export function getSoftwareApplicationSchema(locale: string = "en") {
  const isRussian = locale === "ru"
  
  return generateSchemaMarkup({
    type: "SoftwareApplication",
    data: {
      name: isRussian ? "Расширение Refreak для браузера" : "Refreak Browser Extension",
      description: isRussian 
        ? "Браузерное расширение, которое улучшает игровой опыт на FACEIT с помощью лайнапов гранат, обнаружения смурфов и настройки интерфейса."
        : "A browser extension that enhances FACEIT gaming experience with grenade lineups, smurf detection, and interface customization.",
      applicationCategory: "Game",
      operatingSystem: "Chrome, Edge, Opera",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      downloadUrl: "https://chromewebstore.google.com/detail/refreak/folldcdnmjjjcamnhhlkfjbhjdmpojhc",
      installUrl: "https://chromewebstore.google.com/detail/refreak/folldcdnmjjjcamnhhlkfjbhjdmpojhc",
      softwareVersion: "1.0.0",
      releaseNotes: isRussian 
        ? "Первоначальный релиз с лайнапами гранат, обнаружением смурфов и функциями блокировки рекламы."
        : "Initial release with grenade lineups, smurf detection, and ad blocking features.",
      featureList: isRussian ? [
        "Лайнапы гранат для Counter-Strike 2",
        "Обнаружение смурф-аккаунтов",
        "Блокировка рекламы и всплывающих окон",
        "Многоязычная поддержка (английский, русский)",
        "Настройка интерфейса FACEIT",
      ] : [
        "Grenade lineups for Counter-Strike 2",
        "Smurf account detection",
        "Ad blocking and pop-up prevention",
        "Multi-language support (English, Russian)",
        "FACEIT interface customization",
      ],
      screenshot: `${siteConfig.url}/og.jpg`,
      author: {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    },
  })
}

// FAQ schema for common questions
export function getFAQSchema(locale: string = "en") {
  const isRussian = locale === "ru"
  
  const questions = isRussian ? [
    {
      "@type": "Question",
      name: "Что такое Refreak?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Refreak — это браузерное расширение, разработанное для улучшения вашего игрового опыта на FACEIT. Оно предоставляет лайнапы гранат, обнаружение смурфов, блокировку рекламы и настройки интерфейса.",
      },
    },
    {
      "@type": "Question",
      name: "Refreak бесплатный?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да, Refreak полностью бесплатный. Нет скрытых затрат или премиум функций.",
      },
    },
    {
      "@type": "Question",
      name: "Какие браузеры поддерживаются?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Refreak в настоящее время поддерживает Google Chrome, Microsoft Edge и Opera.",
      },
    },
    {
      "@type": "Question",
      name: "Refreak официально связан с FACEIT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Нет, Refreak разрабатывается независимо и не является официально одобренным или связанным с FACEIT.",
      },
    },
  ] : [
    {
      "@type": "Question",
      name: "What is Refreak?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Refreak is a browser extension designed to enhance your FACEIT gaming experience. It provides grenade lineups, smurf detection, ad blocking, and interface customization features.",
      },
    },
    {
      "@type": "Question",
      name: "Is Refreak free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Refreak is completely free to use. There are no hidden costs or premium features.",
      },
    },
    {
      "@type": "Question",
      name: "Which browsers are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Refreak currently supports Google Chrome, Microsoft Edge, and Opera browsers.",
      },
    },
    {
      "@type": "Question",
      name: "Is Refreak officially affiliated with FACEIT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, Refreak is developed independently and is not officially endorsed by or affiliated with FACEIT.",
      },
    },
  ]

  return generateSchemaMarkup({
    type: "FAQPage",
    data: {
      mainEntity: questions,
    },
  })
}

// Breadcrumb schema for navigation
export function getBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return generateSchemaMarkup({
    type: "BreadcrumbList",
    data: {
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    },
  })
}

// Article schema for blog posts
export function getArticleSchema(post: {
  title: string
  description: string
  date: string
  url: string
  image?: string
  author?: string
}) {
  return generateSchemaMarkup({
    type: "Article",
    data: {
      headline: post.title,
      description: post.description,
      image: post.image || `${siteConfig.url}/og.jpg`,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        "@type": "Organization",
        name: post.author || siteConfig.name,
        url: siteConfig.url,
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/images/logo.svg`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": post.url,
      },
      articleSection: "Blog",
      keywords: ["Counter-Strike 2", "FACEIT", "Gaming", "Esports", "Grenade Lineups"],
    },
  })
}
