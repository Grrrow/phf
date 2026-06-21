/**
 * Base functions for generating JSON-LD structured data.
 * These will be expanded in future phases as requirements grow.
 */

export function generateWebSiteSchema(url: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": url,
    "name": name
  };
}

export function generatePersonSchema(name: string, url: string, jobTitle?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "url": url,
    ...(jobTitle && { "jobTitle": jobTitle })
  };
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.item
    }))
  };
}
