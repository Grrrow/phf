// scripts/find-and-remove-franco-letter.ts
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

  console.log(`Inspecting ${currentItems.length} media items...\n`);

  const filteredItems: any[] = [];
  const removedCards: any[] = [];

  for (const card of currentItems) {
    const fullStr = (
      (card.title || "") + " " +
      (card.title__i18n__es || "") + " " +
      (card.subtitle || "") + " " +
      (card.subtitle__i18n__es || "") + " " +
      (card.image?.filename || "")
    ).toLowerCase();

    // Check for Franco or letter or manuscript documents
    if (
      fullStr.includes("franco") ||
      fullStr.includes("letra") ||
      fullStr.includes("carta") ||
      fullStr.includes("manuscrito") ||
      fullStr.includes("documento") ||
      fullStr.includes("legado")
    ) {
      removedCards.push(card);
      console.log(`❌ Removing card: "${card.title}" (${card.image?.filename})`);
      continue;
    }

    filteredItems.push(card);
  }

  console.log(`\nRemoved ${removedCards.length} cards related to Franco/letters/documents.`);
  console.log(`Retained ${filteredItems.length} clean media items.`);

  storyContent.media_items = filteredItems;

  console.log(`\nSaving updated 'media' story to Storyblok...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n🎉 Done! Franco letter / document images removed successfully.`);
}

main().catch(console.error);
