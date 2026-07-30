// scripts/fix-facets-translations.ts
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
  console.log("Fetching 'biography' story from Storyblok...");
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const bioStoryMeta = storiesResp.data.stories.find((s: any) => s.slug === "biography");

  if (!bioStoryMeta) {
    throw new Error("Biography story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${bioStoryMeta.id}`);
  const storyContent = detailResp.data.story.content;
  const bodyBlocks = storyContent.body || [];

  for (const block of bodyBlocks) {
    // 1. Check if block is El Compositor
    if (block.eyebrow === "EL COMPOSITOR" || block.eyebrow__i18n__es === "EL COMPOSITOR") {
      console.log("Fixing El Compositor block...");
      block.eyebrow = "THE COMPOSER";
      block.eyebrow__i18n__es = "EL COMPOSITOR";
      block.subtitle = "Explore key original compositions and acclaimed symphonic arrangements.";
      block.subtitle__i18n__es = "Explora composiciones originales clave y aclamados arreglos sinfónicos.";
    }

    // 2. Check if block is El Divulgador
    if (block.eyebrow === "EL DIVULGADOR" || block.eyebrow__i18n__es === "EL DIVULGADOR") {
      console.log("Fixing El Divulgador block...");
      block.eyebrow = "THE COMMUNICATOR";
      block.eyebrow__i18n__es = "EL DIVULGADOR";
      block.subtitle = "Discover piano lectures, educational talks, and musical analysis connecting thought, emotion, and sound.";
      block.subtitle__i18n__es = "Descubre conferencias al piano, charlas divulgativas y análisis musicales que conectan pensamiento, emoción y sonido.";
    }
  }

  console.log("Saving updated 'biography' story to Storyblok...");
  await Storyblok.put(`spaces/${SPACE_ID}/stories/${bioStoryMeta.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log("✅ Successfully translated and fixed copies for El Compositor and El Divulgador!");
}

main().catch(console.error);
