// scripts/fetch-and-upload-album-covers.ts
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

// Explicit album cover fallback/direct URLs discovered for Pedro Halffter's discography
const explicitCovers: Record<string, string> = {
  "Jorge Grundman: Piano & Cello Concertos": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/0f/4c/79/0f4c7988-2872-cebe-d6d4-81efd515ef5c/886449556519.jpg/1200x630wp-60.jpg",
  "Cristóbal Halffter Orchestrations": "https://i.scdn.co/image/ab67616d0000b27304b1a0a87a724f622b50063d",
  "Panambí": "https://i.scdn.co/image/ab67616d0000b273105d866b00f5a6d339d99b82",
  "Fire and Blood": "https://i.scdn.co/image/ab67616d0000b273bacb23618a5fd218717b0cc4",
  "Schreker: Nachtstück · Kammersymphonie · Fantastische Ouvertüre": "https://media1.jpc.de/image/w600/front/0/0825646834983.jpg",
  "Brahms arr. Schoenberg Transcriptions": "https://www.warnerclassics.com/sites/default/files/covers/0825646860746.jpg",
  "Korngold: Sinfonia op. 40 & Captain Blood": "https://i.scdn.co/image/ab67616d0000b2737eb8e83a46590ba400acd825",
  "Falla: El sombrero de tres picos · Montañesa · La vida breve": "https://media1.jpc.de/image/w600/front/0/0825646834983.jpg",
  "Cristóbal Halffter: Don Quijote": "https://media1.jpc.de/image/w600/front/0/0825646834983.jpg",
  "Halffter: Prelude for Madrid '92 / Daliniana": "https://i.scdn.co/image/ab67616d0000b2733ca7938003a6d79068862372",
};

async function getOgImage(targetUrl: string): Promise<string | null> {
  if (!targetUrl || !targetUrl.startsWith("http")) return null;
  if (
    targetUrl.endsWith(".jpg") ||
    targetUrl.endsWith(".png") ||
    targetUrl.endsWith(".webp") ||
    targetUrl.includes("i.scdn.co/") ||
    targetUrl.includes("mzstatic.com") ||
    targetUrl.includes("jpc.de/image") ||
    targetUrl.includes("warnerclassics.com/")
  ) {
    return targetUrl;
  }

  // 1. Spotify oEmbed API (Public & returns direct high-res cover art)
  if (targetUrl.includes("open.spotify.com/")) {
    try {
      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(targetUrl)}`;
      const oembedResp = await fetch(oembedUrl);
      if (oembedResp.ok) {
        const oembedData = (await oembedResp.json()) as any;
        if (oembedData.thumbnail_url) {
          console.log(`   └─ 🎵 Found Spotify oEmbed thumbnail: ${oembedData.thumbnail_url}`);
          return oembedData.thumbnail_url;
        }
      }
    } catch (e) {
      // fallback
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(fetchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) return null;
    const html = await resp.text();

    // 1. Direct Spotify CDN image match
    const scdnMatch = html.match(/(https:\/\/i\.scdn\.co\/image\/[a-zA-Z0-9]+)/);
    if (scdnMatch && scdnMatch[1]) {
      return scdnMatch[1];
    }

    // 2. OpenGraph / Twitter meta match
    const ogMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i);

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const imgResp = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

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
  console.log("Fetching 'media' story from Storyblok...");
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;
  const mediaItems = storyContent.media_items || [];

  const discoCards = mediaItems.filter(
    (item: any) => item.category?.toUpperCase() === "DISCOGRAPHY" || item.category?.toUpperCase() === "DISCOGRAFÍA"
  );

  console.log(`Found ${discoCards.length} discography cards in Storyblok. Scraping & uploading covers...`);

  let updatedCount = 0;

  for (let i = 0; i < discoCards.length; i++) {
    const card = discoCards[i];
    const albumTitle = card.title;
    console.log(`\n[${i + 1}/${discoCards.length}] Processing album cover for: "${albumTitle}"...`);

    const targetUrl = explicitCovers[albumTitle] || card.embed_url;

    if (!targetUrl) {
      console.log(`   └─ ⚠️ No target URL available for scraping.`);
      continue;
    }

    console.log(`   └─ Scraping cover from: ${targetUrl}`);
    const coverUrl = await getOgImage(targetUrl);

    if (coverUrl) {
      console.log(`   └─ 📸 Found Cover URL: ${coverUrl}`);
      const cleanName = `cover_album_${i}_${albumTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.jpg`;
      const asset = await uploadImageToStoryblok(coverUrl, cleanName);

      if (asset) {
        card.image = asset;
        updatedCount++;
        console.log(`   └─ ✅ Uploaded asset to Storyblok and attached to album card!`);
      } else {
        console.log(`   └─ ❌ Failed to upload asset to Storyblok.`);
      }
    } else {
      console.log(`   └─ ⚠️ Could not extract OpenGraph cover image.`);
    }

    // Short delay between requests
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n💾 Saving updated 'media' story with ${updatedCount} uploaded album covers to Storyblok...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n🎉 Done! Successfully uploaded ${updatedCount} album covers to Storyblok Assets!`);
}

main().catch(console.error);
