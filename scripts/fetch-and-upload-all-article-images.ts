import fs from 'node:fs';
import path from 'node:path';
import StoryblokClient from 'storyblok-js-client';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const SPACE_ID = process.env.STORYBLOK_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;

const Storyblok = new StoryblokClient({
  oauthToken: MANAGEMENT_TOKEN,
});

async function getOgImage(targetUrl: string): Promise<string | null> {
  if (!targetUrl || !targetUrl.startsWith('http')) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!resp.ok) return null;
    const html = await resp.text();

    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
                    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    if (ogMatch && ogMatch[1]) {
      let imageUrl = ogMatch[1].trim();
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        const u = new URL(targetUrl);
        imageUrl = `${u.origin}${imageUrl}`;
      }
      return imageUrl;
    }
  } catch (err: any) {
    // Silent fail for individual bad links
  }
  return null;
}

async function uploadImageToStoryblok(imageUrl: string, filename: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const imgResp = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!imgResp.ok) return null;

    const arrayBuffer = await imgResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Filter out huge non-image responses
    if (buffer.length < 2000) return null; // less than 2KB unlikely to be valid article image

    const ext = imageUrl.endsWith('.png') ? '.png' : imageUrl.endsWith('.webp') ? '.webp' : '.jpg';
    const cleanFilename = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${ext}`;

    // 1. Sign asset
    const signedResp = await Storyblok.post(`spaces/${SPACE_ID}/assets`, {
      filename: cleanFilename
    });

    const { post_url, fields, public_url, id } = signedResp.data;

    // 2. Upload to S3
    const formData = new FormData();
    for (const key in fields) {
      formData.append(key, fields[key]);
    }
    const blob = new Blob([buffer], { type: imgResp.headers.get('content-type') || 'image/jpeg' });
    formData.append('file', blob, cleanFilename);

    const uploadResp = await fetch(post_url, {
      method: 'POST',
      body: formData
    });

    if (uploadResp.status >= 200 && uploadResp.status < 300) {
      return {
        id,
        filename: public_url,
        fieldtype: 'asset'
      };
    }
  } catch (err: any) {
    // console.log(`Upload error for ${imageUrl}:`, err.message);
  }
  return null;
}

async function main() {
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const newsStory = storiesResp.data.stories.find((s: any) => s.slug === 'news');

  if (!newsStory) {
    console.error("News story not found!");
    return;
  }

  const res = await Storyblok.get(`spaces/${SPACE_ID}/stories/${newsStory.id}`);
  const content = res.data.story.content;

  console.log("🚀 Starting scraping and asset upload for News articles...");

  // 1. Process Featured Article
  if (content.featured_article?.[0]?.cta_link?.url) {
    const featured = content.featured_article[0];
    console.log(`[Featured] Scraping OG Image for "${featured.title}"...`);
    const ogUrl = await getOgImage(featured.cta_link.url);
    if (ogUrl) {
      console.log(`[Featured] Found OG URL: ${ogUrl}`);
      const asset = await uploadImageToStoryblok(ogUrl, `featured_article_img`);
      if (asset) {
        featured.image = asset;
        featured.media_type = 'image';
        console.log(`✅ [Featured] Image attached successfully!`);
      }
    }
  }

  // 2. Process Grid Articles
  const articles = content.articles || [];
  let updatedCount = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const targetUrl = article.cta_link?.url;

    if (!targetUrl) continue;

    console.log(`[${i + 1}/${articles.length}] Scraping: ${article.title.substring(0, 45)}...`);
    const ogUrl = await getOgImage(targetUrl);

    if (ogUrl) {
      const asset = await uploadImageToStoryblok(ogUrl, `news_art_${i}`);
      if (asset) {
        article.image = asset;
        article.media_type = 'image';
        updatedCount++;
        console.log(`   └─ ✅ Uploaded and attached image to Storyblok!`);
      } else {
        console.log(`   └─ ⚠️ Failed to upload image to Storyblok.`);
      }
    } else {
      console.log(`   └─ ℹ️ No OG image found.`);
    }

    // Small delay to prevent rate limits
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n💾 Saving updated 'news' story with ${updatedCount} article images to Storyblok...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${newsStory.id}`, {
    story: { content: content },
    force_update: 1
  });

  console.log("🎉 SUCCESS! All available article images scraped and uploaded to Storyblok.");
}

main();
