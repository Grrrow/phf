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
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

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
    console.log(`Failed to fetch ${targetUrl}: ${err.message}`);
  }
  return null;
}

async function uploadImageToStoryblok(imageUrl: string, filename: string) {
  try {
    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) return null;

    const arrayBuffer = await imgResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Sign asset
    const signedResp = await Storyblok.post(`spaces/${SPACE_ID}/assets`, {
      filename: filename
    });

    const { post_url, fields, public_url, id } = signedResp.data;

    // 2. Upload to S3
    const formData = new FormData();
    for (const key in fields) {
      formData.append(key, fields[key]);
    }
    const blob = new Blob([buffer], { type: imgResp.headers.get('content-type') || 'image/jpeg' });
    formData.append('file', blob, filename);

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
    } else {
      console.log(`S3 Upload failed with status ${uploadResp.status}`);
    }
  } catch (err: any) {
    console.log(`Upload error: ${err.message}`);
  }
  return null;
}

async function test() {
  const testUrl = "https://operademontreal.com/en/programs/la-lettre-au-general-franco";
  console.log(`Fetching OG Image from ${testUrl}...`);
  const ogImage = await getOgImage(testUrl);
  console.log(`Found OG Image: ${ogImage}`);

  if (ogImage) {
    console.log(`Uploading to Storyblok...`);
    const asset = await uploadImageToStoryblok(ogImage, "la_lettre_franco.jpg");
    console.log(`Uploaded Asset:`, asset);
  }
}

test();
