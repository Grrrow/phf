export interface StoryblokImageOptions {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  fit?: 'cover' | 'contain';
  crop?: 'smart' | 'focal' | 'manual';
  focalPoint?: string;
  widths?: number[];
}

/**
 * Checks if a URL is hosted on the Storyblok CDN.
 */
export function isStoryblokImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes('a.storyblok.com');
}

/**
 * Normalizes a URL, resolving protocol-relative URLs to HTTPS.
 */
export function normalizeStoryblokImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  return url;
}

/**
 * Extracts focal point coordinates from a Storyblok asset object.
 */
export function getStoryblokImageFocalPoint(image: any): string | undefined {
  if (!image) return undefined;
  if (typeof image === 'object') {
    return image.focus || undefined;
  }
  return undefined;
}

/**
 * Extracts dimensions (width and height) from a Storyblok CDN URL or asset object.
 */
export function getStoryblokImageDimensions(image: any): { width: number; height: number } | null {
  if (!image) return null;
  const url = typeof image === 'string' ? image : image?.filename;
  if (!url) return null;
  
  const match = url.match(/\/f\/\d+\/(\d+)x(\d+)\//);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10)
    };
  }
  return null;
}

/**
 * Extracts and sanitizes the alt text from a Storyblok asset object, falling back to a default.
 */
export function getStoryblokImageAlt(image: any, fallbackAlt: string = ''): string {
  if (!image) return fallbackAlt;
  if (typeof image === 'object') {
    return image.alt?.trim() || fallbackAlt;
  }
  return fallbackAlt;
}

/**
 * Generates the Storyblok Image Service segment path (e.g. "600x400/filters:format(webp):quality(85)").
 */
export function buildStoryblokImageTransformPath(options: Omit<StoryblokImageOptions, 'src' | 'widths'>): string {
  let path = '';
  
  // 1. Dimensions
  if (options.width || options.height) {
    const w = options.width || 0;
    const h = options.height || 0;
    path += `${w}x${h}`;
  }

  // 2. Crop/Fit strategy
  if (options.crop === 'smart' && (options.width || options.height)) {
    path += '/smart';
  }

  // 3. Filters
  const filters: string[] = [];
  
  if (options.format) {
    filters.push(`format(${options.format})`);
  } else {
    filters.push('format(webp)'); // Default format
  }
  
  if (options.quality) {
    filters.push(`quality(${options.quality})`);
  }
  
  // Focal point filter (only if smart crop is not explicitly requested instead)
  const focal = options.focalPoint;
  if (focal && (options.crop === 'focal' || !options.crop)) {
    if (focal.includes('focal(')) {
      filters.push(focal);
    } else {
      filters.push(`focal(${focal})`);
    }
  }

  if (filters.length > 0) {
    path += `${path ? '/' : ''}filters:${filters.join(':')}`;
  }

  return path;
}

/**
 * Generates an optimized Storyblok image URL with resizing, formats, quality, and focal points.
 */
export function getStoryblokImageUrl(options: StoryblokImageOptions): string {
  const src = options.src;
  if (!src) return '';
  
  const normalized = normalizeStoryblokImageUrl(src);
  if (!isStoryblokImageUrl(normalized)) return normalized;

  // Split at /m/ to avoid double-processing if the URL was already parsed
  const base = normalized.split('/m/')[0];
  
  const transformPath = buildStoryblokImageTransformPath(options);
  if (transformPath) {
    return `${base}/m/${transformPath}`;
  }
  
  return base;
}

/**
 * Generates a srcset string for responsive images.
 */
export function buildStoryblokImageSrcSet(options: StoryblokImageOptions): string {
  const { src, widths, ...rest } = options;
  if (!src || !widths || widths.length === 0) return '';
  
  return widths
    .map(w => {
      const url = getStoryblokImageUrl({ src, width: w, ...rest });
      return `${url} ${w}w`;
    })
    .join(', ');
}

/**
 * Helper to build media sizes attribute strings from raw values or screen queries mapping.
 */
export function buildStoryblokImageSizes(sizes: string | Record<string, string> | undefined): string {
  if (!sizes) return '100vw';
  if (typeof sizes === 'string') return sizes;
  
  return Object.entries(sizes)
    .map(([query, size]) => {
      if (query === 'default') return size;
      return `${query} ${size}`;
    })
    .join(', ');
}
