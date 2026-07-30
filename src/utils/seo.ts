/**
 * Normalizes the meta title by appending the site name if not already present.
 */
export function normalizeMetaTitle(title: string | undefined, siteName: string = 'Site Name'): string {
  if (!title) return siteName;
  if (title.includes(siteName)) return title;
  return `${title} | ${siteName}`;
}

/**
 * Ensures the meta description is not too long.
 */
export function normalizeMetaDescription(description: string | undefined, maxLength: number = 160): string {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  return `${description.substring(0, maxLength - 3)}...`;
}

/**
 * Returns the robots content string.
 */
export function getRobotsContent(noindex: boolean = false, nofollow: boolean = false): string {
  if (noindex && nofollow) return 'noindex, nofollow';
  if (noindex) return 'noindex, follow';
  if (nofollow) return 'index, nofollow';
  return 'index, follow';
}

/**
 * Merges page-level SEO with global fallback SEO.
 */
export function mergeSeo(pageSeo: any, globalConfig: any) {
  const globalSeo = globalConfig?.seo_defaults?.[0] || {};
  const siteIdentity = globalConfig?.site_identity?.[0] || {};
  const seoBlock = globalConfig?.seo_defaults?.[0] || {};

  const titleTemplate = seoBlock.title_template || '%s | Pedro Halffter';
  const siteName = siteIdentity.site_name || 'Pedro Halffter';

  return {
    siteName,
    title: pageSeo?.meta_title || pageSeo?.title || globalSeo?.meta_title || globalSeo?.title || '',
    description: pageSeo?.meta_description || pageSeo?.description || globalSeo?.meta_description || globalSeo?.description || '',
    og_title: pageSeo?.og_title || globalSeo?.og_title || pageSeo?.meta_title || pageSeo?.title || globalSeo?.meta_title || globalSeo?.title || '',
    og_description: pageSeo?.og_description || globalSeo?.og_description || pageSeo?.meta_description || pageSeo?.description || globalSeo?.meta_description || globalSeo?.description || '',
    og_image: pageSeo?.og_image?.filename || globalSeo?.og_image?.filename || siteIdentity.default_og_image?.filename || '',
    twitter_title: pageSeo?.twitter_title || globalSeo?.twitter_title || pageSeo?.meta_title || pageSeo?.title || globalSeo?.meta_title || globalSeo?.title || '',
    twitter_description: pageSeo?.twitter_description || globalSeo?.twitter_description || pageSeo?.meta_description || pageSeo?.description || globalSeo?.meta_description || globalSeo?.description || '',
    twitter_image: pageSeo?.twitter_image?.filename || globalSeo?.twitter_image?.filename || pageSeo?.og_image?.filename || globalSeo?.og_image?.filename || siteIdentity.default_og_image?.filename || '',
    noindex: pageSeo?.noindex ?? globalSeo?.noindex ?? false,
    nofollow: pageSeo?.nofollow ?? globalSeo?.nofollow ?? false,
  };
}
