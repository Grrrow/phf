// scripts/refine-extra-youtube-videos.ts
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

const refinedMeta: Record<string, any> = {
  "https://www.youtube.com/watch?v=gZZ7KcQZEH8": {
    titleEn: "Palintropos Harmonie (World Premiere) — Ana Häsler & Pedro Halffter",
    titleEs: "Palintropos Harmonie (Estreno Mundial) — Ana Häsler & Pedro Halffter",
    subtitleEn: "Composition Premiere • SWISSCUBAN",
    subtitleEs: "Estreno de composición • SWISSCUBAN",
  },
  "https://www.youtube.com/watch?v=Rm4pThZEA58": {
    titleEn: "Drei Lieder (Live) — Ana Häsler & Pedro Halffter",
    titleEs: "Drei Lieder (En directo) — Ana Häsler & Pedro Halffter",
    subtitleEn: "Performance • SWISSCUBAN",
    subtitleEs: "Interpretación en directo • SWISSCUBAN",
  },
  "https://www.youtube.com/watch?v=anSnGhYJuO8": {
    titleEn: "Apocalypse Opera Project — Carlus Padrissa (La Fura dels Baus) & Pedro Halffter",
    titleEs: "Apocalypse Opera Project — Carlus Padrissa (La Fura dels Baus) & Pedro Halffter",
    subtitleEn: "Opera Project • La Fura dels Baus",
    subtitleEs: "Proyecto de Ópera • La Fura dels Baus",
  },
  "https://www.youtube.com/watch?v=vf5BumWJPfo": {
    titleEn: "The Bells of Gran Canaria (Pedro Halffter)",
    titleEs: "Las campanas de Gran Canaria (Pedro Halffter)",
    subtitleEn: "Composition • Gofio Records",
    subtitleEs: "Composición • Gofio Records",
  },
};

async function main() {
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;
  const mediaItems = storyContent.media_items || [];

  let count = 0;
  for (const card of mediaItems) {
    const meta = refinedMeta[card.embed_url];
    if (meta) {
      card.title = meta.titleEn;
      card.title__i18n__es = meta.titleEs;
      card.subtitle = meta.subtitleEn;
      card.subtitle__i18n__es = meta.subtitleEs;
      card.category = "VIDEOS";
      card.category__i18n__es = "VÍDEOS";
      count++;
    }
  }

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`✅ Refined ${count} extra video titles & subtitles in Storyblok!`);
}

main().catch(console.error);
