// scripts/publish-all-photo-assets.ts
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

function formatTitleFromFilename(filename: string): string {
  const name = filename.split("/").pop() || filename;
  const base = name.replace(/\.[^/.]+$/, "").replace(/^[a-f0-9]+_/i, "").replace(/_\d+$/, "");
  
  // Format readable title
  return base
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Pedro Halffter", "Pedro Halffter")
    .replace("Bbva", "BBVA")
    .replace("Oscyl", "OSCyL");
}

async function fetchAllAssets() {
  let allAssets: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const resp = await Storyblok.get(`spaces/${SPACE_ID}/assets`, { per_page: 100, page });
    const assets = resp.data.assets || [];
    allAssets = allAssets.concat(assets);
    if (assets.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }
  return allAssets;
}

async function main() {
  console.log("Fetching all asset pages from Storyblok space...");
  const assets = await fetchAllAssets();

  console.log(`Found ${assets.length} total assets in space.`);

  // Filter out: cover, news, new, featured, youtube, yt
  const photoAssets = assets.filter((asset: any) => {
    const fname = (asset.filename || "").toLowerCase();
    
    // Ignore non-images or excluded terms
    if (!fname.match(/\.(jpg|jpeg|png|webp|avif)$/i)) return false;
    
    if (
      fname.includes("cover") ||
      fname.includes("news") ||
      fname.includes("new_") ||
      fname.includes("featured") ||
      fname.includes("youtube") ||
      fname.includes("yt_") ||
      fname.includes("yt-")
    ) {
      return false;
    }

    return true;
  });

  console.log(`\nFiltered down to ${photoAssets.length} photo gallery assets.`);

  // Deduplicate by clean filename
  const seenUrls = new Set<string>();
  const photoCards: any[] = [];

  for (let i = 0; i < photoAssets.length; i++) {
    const asset = photoAssets[i];
    if (seenUrls.has(asset.filename)) continue;
    seenUrls.add(asset.filename);

    const title = formatTitleFromFilename(asset.filename);
    const card = {
      component: "media_card",
      category: "PHOTOS",
      category__i18n__es: "FOTOS",
      title: title,
      title__i18n__es: title,
      subtitle: "Official Photo • Gallery Asset",
      subtitle__i18n__es: "Fotografía Oficial • Galería",
      date_label: "",
      date_label__i18n__es: "",
      embed_url: asset.filename,
      media_type: "photo",
      card_style: "photo_landscape",
      card_size: "medium",
      cta_label: "VIEW PHOTO",
      cta_label__i18n__es: "VER FOTO",
      image: {
        id: asset.id,
        filename: asset.filename,
        fieldtype: "asset",
      },
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

  // Keep VIDEOS and DISCOGRAPHY cards intact
  const nonPhotoCards = currentItems.filter(
    (c: any) => c.category?.toUpperCase() !== "PHOTOS" && c.category?.toUpperCase() !== "FOTOS"
  );

  storyContent.media_items = [...nonPhotoCards, ...photoCards];

  console.log(`Saving ${photoCards.length} photo gallery cards to Storyblok (Total media items: ${storyContent.media_items.length})...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n🎉 Successfully published ${photoCards.length} photo assets to Storyblok under PHOTOS tag!`);
}

main().catch(console.error);
