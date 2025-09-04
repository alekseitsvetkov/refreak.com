import Script from "next/script"
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getSoftwareApplicationSchema,
  getFAQSchema,
} from "@/lib/schema"

interface SchemaMarkupProps {
  includeOrganization?: boolean
  includeWebSite?: boolean
  includeSoftwareApplication?: boolean
  includeFAQ?: boolean
  locale?: string
}

export function SchemaMarkup({
  includeOrganization = true,
  includeWebSite = true,
  includeSoftwareApplication = true,
  includeFAQ = true,
  locale = "en",
}: SchemaMarkupProps) {
  const schemas: string[] = []

  if (includeOrganization) {
    schemas.push(getOrganizationSchema())
  }

  if (includeWebSite) {
    schemas.push(getWebSiteSchema())
  }

  if (includeSoftwareApplication) {
    schemas.push(getSoftwareApplicationSchema(locale))
  }

  if (includeFAQ) {
    schemas.push(getFAQSchema(locale))
  }

  if (schemas.length === 0) {
    return null
  }

  return (
    <Script
      id="schema-markup"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: schemas.join("\n"),
      }}
    />
  )
}
