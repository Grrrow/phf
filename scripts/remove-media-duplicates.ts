// scripts/remove-media-duplicates.ts
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

function normalize(text: string | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u06ff]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getCleanFilename(url: string | undefined): string {
  if (!url) return "";
  if (url.includes("ytimg.com") || url.includes("youtube") || url.endsWith("hqdefault.jpg")) {
    return url.toLowerCase();
  }
  const parts = url.split("/");
  const last = parts.pop() || "";
  return last.toLowerCase();
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
  const currentItems = storyContent.media_items || [];

  console.log(`Analyzing ${currentItems.length} total media items for duplicates...\n`);

  const seenEmbedUrls = new Set<string>();
  const seenImageFilenames = new Set<string>();
  const seenTitles = new Set<string>();

  const uniqueItems: any[] = [];
  const removedItems: any[] = [];

  for (let i = 0; i < currentItems.length; i++) {
    const card = currentItems[i];
    
    // 1. Embed URL check (for videos / links)
    const embedUrl = (card.embed_url || "").trim();
    if (embedUrl && seenEmbedUrls.has(embedUrl)) {
      removedItems.push({ card, reason: `Duplicate embed_url: ${embedUrl}` });
      continue;
    }

    // 2. Image filename check (for photos & album covers)
    const imgFilename = getCleanFilename(card.image?.filename);
    if (imgFilename && seenImageFilenames.has(imgFilename)) {
      removedItems.push({ card, reason: `Duplicate image file: ${imgFilename}` });
      continue;
    }

    // 3. Title check
    const normTitle = normalize(card.title || card.title__i18n__es);
    if (normTitle && seenTitles.has(normTitle)) {
      removedItems.push({ card, reason: `Duplicate title: "${card.title}"` });
      continue;
    }

    // Mark as seen
    if (embedUrl) seenEmbedUrls.add(embedUrl);
    if (imgFilename) seenImageFilenames.add(imgFilename);
    if (normTitle) seenTitles.add(normTitle);

    uniqueItems.push(card);
  }

  console.log(`Summary of Deduplication:`);
  console.log(`- Original Items: ${currentItems.length}`);
  console.log(`- Duplicates Removed: ${removedItems.length}`);
  console.log(`- Unique Items Retained: ${uniqueItems.length}\n`);

  if (removedItems.length > 0) {
    console.log(`Removed Duplicates List:`);
    removedItems.forEach((item, idx) => {
      console.log(` [${idx + 1}] Title: "${item.card.title}" | Reason: ${item.reason}`);
    });
  }

  storyContent.media_items = uniqueItems;

  console.log(`\nSaving ${uniqueItems.length} clean deduplicated cards to Storyblok...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n🎉 Deduplication complete! Storyblok media items are 100% unique!`);
}

main().catch(console.error);
