// scripts/import-media-videos.ts
// Import YouTube media items into Storyblok as media_card components with bilingual fields.

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

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error("Missing STORYBLOK_SPACE_ID or STORYBLOK_MANAGEMENT_TOKEN in .env");
  process.exit(1);
}

const Storyblok = new StoryblokClient({
  oauthToken: MANAGEMENT_TOKEN,
});

const typeEnMap: Record<string, string> = {
  "Presentación de obra": "Work Presentation",
  "Estreno / composición": "Premiere / Composition",
  "Interpretación": "Performance",
  "Reportaje": "Report",
  "Conferencia al piano": "Lecture at Piano",
  "Entrevista / presentación": "Interview & Presentation",
  "Composición": "Composition",
  "Dirección de orquesta": "Orchestral Conducting",
  "Perfil biográfico": "Biographical Profile",
  "Trayectoria profesional": "Career Summary",
  "Festival / reportaje": "Festival Feature",
  "Perfil / entrevista": "Profile & Interview",
};

async function uploadThumbnail(imageUrl: string, filename: string) {
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;

    const arrayBuffer = await imgRes.arrayBuffer();
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
    const blob = new Blob([buffer], { type: imgRes.headers.get("content-type") || "image/jpeg" });
    formData.append("file", blob, filename);

    const uploadRes = await fetch(post_url, { method: "POST", body: formData });
    if (uploadRes.status >= 200 && uploadRes.status < 300) {
      return { id, filename: public_url, fieldtype: "asset" as const };
    }
  } catch (err: any) {
    console.warn(`Upload thumbnail error: ${err.message}`);
  }
  return null;
}

async function main() {
  const dataPath = path.resolve(process.cwd(), "youtube_media.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const mediaData = JSON.parse(raw);
  const items = mediaData.items as any[];

  console.log(`Processing ${items.length} YouTube media items...`);
  const cards: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.recommended_for_website === false) {
      console.log(`[${i + 1}/${items.length}] Skipping (not recommended): ${item.title}`);
      continue;
    }

    const { title, channel, date, type, youtube_url, thumbnail_url, image } = item;

    // IMPORTANT: Category MUST be "VIDEOS" / "VÍDEOS" so the category filter button on Media page works!
    const categoryEn = "VIDEOS";
    const categoryEs = "VÍDEOS";

    const titleEn = title;
    const titleEs = title;

    // Subtitle displays the Type and Channel if present
    const typeLabelEn = typeEnMap[type] || type;
    const typeLabelEs = type;
    const channelName = channel || (type === "Conferencia al piano" || type === "Entrevista / presentación" ? "Fundación BBVA" : "");

    const subtitleEn = channelName ? `${typeLabelEn} • ${channelName}` : typeLabelEn;
    const subtitleEs = channelName ? `${typeLabelEs} • ${channelName}` : typeLabelEs;

    const dateEn = date || "";
    const dateEs = dateEn;

    let asset = null;
    if (image?.available && thumbnail_url) {
      const cleanName = `youtube_thumb_${item.video_id || i}.jpg`;
      console.log(`[${i + 1}/${items.length}] Uploading thumbnail for: ${title}`);
      asset = await uploadThumbnail(thumbnail_url, cleanName);
    }

    const card: any = {
      component: "media_card",
      category: categoryEn,
      "category__i18n__es": categoryEs,
      title: titleEn,
      "title__i18n__es": titleEs,
      subtitle: subtitleEn,
      "subtitle__i18n__es": subtitleEs,
      date_label: dateEn,
      "date_label__i18n__es": dateEs,
      embed_url: youtube_url,
      media_type: "video",
      card_style: "video_feature",
      card_size: "medium",
      cta_label: "WATCH VIDEO",
      "cta_label__i18n__es": "VER VÍDEO",
      ...(asset ? { image: asset } : {}),
    };

    cards.push(card);
  }

  console.log(`Fetching 'media' story from Storyblok...`);
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found (slug=media)");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;

  storyContent.media_items = cards;

  console.log(`Saving ${cards.length} media cards to Storyblok...`);
  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n✅ Successfully updated Media story in Storyblok with ${cards.length} video cards!`);
}

main().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});

