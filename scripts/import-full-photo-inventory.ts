// scripts/import-full-photo-inventory.ts
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

const categoryTranslations: Record<string, { en: string; es: string }> = {
  "Retrato institucional": { en: "Institutional Portrait", es: "Retrato Institucional" },
  "Retrato editorial": { en: "Editorial Portrait", es: "Retrato Editorial" },
  "Dirección en concierto": { en: "Conducting in Concert", es: "Dirección en Concierto" },
  "Dirección y composición": { en: "Conducting & Composition", es: "Dirección y Composición" },
  "Ensayo": { en: "Rehearsal Session", es: "Ensayo Orquestal" },
  "Dirección y arreglo": { en: "Conducting & Arrangement", es: "Dirección y Arreglo" },
  "Conferencia al piano": { en: "Lecture at the Piano", es: "Conferencia al Piano" },
};

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
  const dataPath = path.resolve(process.cwd(), "photo_inventory.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw);
  const items = data.items as any[];

  console.log(`Processing ${items.length} photo inventory items...`);
  const photoCards: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.image_url) continue;

    console.log(`\n[${i + 1}/${items.length}] Uploading photo: "${item.title}"...`);
    const cleanName = `photo_${item.id}_${i}.jpg`;
    const asset = await uploadImageToStoryblok(item.image_url, cleanName);

    if (!asset) {
      console.log(`   └─ ⚠️ Skipped photo without asset.`);
      continue;
    }

    console.log(`   └─ ✅ Uploaded photo asset to Storyblok!`);

    const sub = categoryTranslations[item.category] || { en: item.category, es: item.category };

    const card = {
      component: "media_card",
      category: "PHOTOS",
      category__i18n__es: "FOTOS",
      title: item.title,
      title__i18n__es: item.title,
      subtitle: sub.en,
      subtitle__i18n__es: sub.es,
      date_label: item.date || "",
      date_label__i18n__es: item.date || "",
      embed_url: item.source_page || "",
      media_type: "photo",
      card_style: item.category?.includes("Retrato") ? "photo_portrait" : "photo_landscape",
      card_size: "medium",
      cta_label: "VIEW PHOTO",
      cta_label__i18n__es: "VER FOTO",
      image: asset,
    };

    photoCards.push(card);
  }

  console.log(`\nFetching 'media' story from Storyblok...`);
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;
  const currentItems = storyContent.media_items || [];

  // Remove old photo cards and replace with new uploaded photo inventory cards
  const nonPhotoCards = currentItems.filter(
    (c: any) => c.category?.toUpperCase() !== "PHOTOS" && c.category?.toUpperCase() !== "FOTOS"
  );

  storyContent.media_items = [...nonPhotoCards, ...photoCards];

  console.log(`Saving ${photoCards.length} photo cards to Storyblok (Total media items: ${storyContent.media_items.length})...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n🎉 Successfully uploaded ${photoCards.length} real photo assets to Storyblok under PHOTOS tag!`);
}

main().catch(console.error);
