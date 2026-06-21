/**
 * Builds an absolute URL given a path.
 * Requires PUBLIC_SITE_URL to be set in environment variables.
 */
export function buildAbsoluteUrl(path: string): string {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  if (normalizedPath === '/') return `${normalizedSiteUrl}/`;
  return `${normalizedSiteUrl}${normalizedPath}`;
}

export function getAbsoluteAssetUrl(assetUrl: string): string {
  if (!assetUrl) return '';
  if (assetUrl.startsWith('http')) return assetUrl;
  if (assetUrl.startsWith('//')) return `https:${assetUrl}`;
  return buildAbsoluteUrl(assetUrl);
}
