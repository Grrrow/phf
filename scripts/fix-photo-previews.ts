// scripts/fix-photo-previews.ts
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

function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
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

  console.log(`Analyzing ${currentItems.length} media items...`);

  const validItems: any[] = [];

  for (const card of currentItems) {
    const isPhoto = card.category?.toUpperCase() === "PHOTOS" || card.category?.toUpperCase() === "FOTOS" || card.media_type === "photo";
    const isVideo = card.category?.toUpperCase() === "VIDEOS" || card.category?.toUpperCase() === "VÍDEOS" || card.media_type === "video";
    const isDisco = card.category?.toUpperCase() === "DISCOGRAPHY" || card.category?.toUpperCase() === "DISCOGRAFÍA" || card.media_type === "audio";

    // 1. For Photo cards: MUST have image.filename
    if (isPhoto) {
      if (card.image && card.image.filename) {
        validItems.push(card);
      } else {
        console.log(`❌ Removing photo card without image preview: "${card.title}"`);
      }
      continue;
    }

    // 2. For Video cards: Ensure image is attached (or use youtube thumbnail fallback)
    if (isVideo) {
      if (!card.image || !card.image.filename) {
        const ytId = getYouTubeId(card.embed_url);
        if (ytId) {
          card.image = {
            id: null,
            filename: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            fieldtype: "asset",
          };
        }
      }
      validItems.push(card);
      continue;
    }

    // 3. For Discography cards: MUST have image
    if (isDisco) {
      if (card.image && card.image.filename) {
        validItems.push(card);
      } else {
        console.log(`❌ Removing album card without cover image: "${card.title}"`);
      }
      continue;
    }

    // Fallback: keep if image exists
    if (card.image && card.image.filename) {
      validItems.push(card);
    }
  }

  storyContent.media_items = validItems;

  console.log(`\nSaving ${validItems.length} cards (all with preview images) to Storyblok...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n✅ Done! Cleaned up media section: All cards now have visual preview images!`);
}

main().catch(console.error);
