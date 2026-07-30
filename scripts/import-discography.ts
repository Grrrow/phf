// scripts/import-discography.ts
import fs from "fs";
import path from "path";
import StoryblokClient from "storyblok-js-client";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, "");
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
  if (!targetUrl || !targetUrl.startsWith("http")) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const resp = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) return null;
    const html = await resp.text();

    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    if (ogMatch && ogMatch[1]) {
      let imageUrl = ogMatch[1].trim();
      if (imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;
      return imageUrl;
    }
  } catch (e) {
    // silent
  }
  return null;
}

async function uploadImageToStoryblok(imageUrl: string, filename: string) {
  try {
    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) return null;

    const arrayBuffer = await imgResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 1000) return null;

    const signedResp = await Storyblok.post(`spaces/${SPACE_ID}/assets`, {
      filename,
    });

    const { post_url, fields, public_url, id } = signedResp.data;

    const formData = new FormData();
    for (const key in fields) {
      formData.append(key, fields[key]);
    }
    const blob = new Blob([buffer], { type: imgResp.headers.get("content-type") || "image/jpeg" });
    formData.append("file", blob, filename);

    const uploadResp = await fetch(post_url, { method: "POST", body: formData });
    if (uploadResp.status >= 200 && uploadResp.status < 300) {
      return { id, filename: public_url, fieldtype: "asset" as const };
    }
  } catch (err: any) {
    console.warn(`Upload error for ${filename}: ${err.message}`);
  }
  return null;
}

async function main() {
  const dataPath = path.resolve(process.cwd(), "discography.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const discoData = JSON.parse(raw);
  const items = discoData.items as any[];

  console.log(`Processing ${items.length} discography items...`);
  const discoCards: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // We prioritize recommended albums, but keep all main scope releases
    if (item.recommended_for_website === false && item.release_scope !== "Discografía principal") {
      console.log(`[${i + 1}/${items.length}] Skipping minor release: ${item.title}`);
      continue;
    }

    const { title, main_composer, label, release_date, spotify, cover } = item;

    console.log(`[${i + 1}/${items.length}] Processing album: "${title}"...`);

    const pageUrl = spotify?.url || cover?.source_page;
    let asset = null;

    if (pageUrl) {
      const ogUrl = await getOgImage(pageUrl);
      if (ogUrl) {
        console.log(`   └─ Found OG Image: ${ogUrl}`);
        const cleanName = `album_cover_${i}_${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.jpg`;
        asset = await uploadImageToStoryblok(ogUrl, cleanName);
      }
    }

    const year = release_date ? release_date.substring(0, 4) : "";
    const subtitle = label ? `${main_composer} • ${label}` : main_composer;
    const spotifyUrl = spotify?.url || cover?.source_page || "https://open.spotify.com/artist/1hezRwB55hfUDAm0lyrsRC";

    const card = {
      component: "media_card",
      category: "DISCOGRAPHY",
      category__i18n__es: "DISCOGRAFÍA",
      title: title,
      title__i18n__es: title,
      subtitle: subtitle,
      subtitle__i18n__es: subtitle,
      date_label: year,
      date_label__i18n__es: year,
      embed_url: spotifyUrl,
      media_type: "audio",
      card_style: "album_square",
      card_size: "medium",
      cta_label: spotify?.url ? "LISTEN ON SPOTIFY" : "EXPLORE ALBUM",
      cta_label__i18n__es: spotify?.url ? "ESCUCHAR EN SPOTIFY" : "VER ÁLBUM",
      ...(asset ? { image: asset } : {}),
    };

    discoCards.push(card);
  }

  console.log(`Fetching 'media' story from Storyblok...`);
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;

  // Filter out existing DISCOGRAPHY cards, then append new ones
  const existingCards = (storyContent.media_items || []).filter(
    (c: any) => c.category?.toUpperCase() !== "DISCOGRAPHY" && c.category?.toUpperCase() !== "DISCOGRAFÍA"
  );

  storyContent.media_items = [...existingCards, ...discoCards];

  console.log(`Saving ${discoCards.length} discography cards to Storyblok (Total media items: ${storyContent.media_items.length})...`);
  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n✅ Successfully imported ${discoCards.length} albums to Storyblok under DISCOGRAPHY tag!`);
}

main().catch(console.error);
