// scripts/refine-latest-youtube-videos.ts
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
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;

  // Refine Featured Video
  if (storyContent.featured_media?.[0]) {
    const feat = storyContent.featured_media[0];
    feat.title = "The Emperor of Atlantis — Unknown Masterpiece (Teatro Real)";
    feat.title__i18n__es = "El emperador de la Atlántida — Una música desconocida (Teatro Real)";
    feat.subtitle = "Featured Production • Teatro Real Madrid";
    feat.subtitle__i18n__es = "Producción Destacada • Teatro Real de Madrid";
    feat.category = "VIDEOS";
    feat.category__i18n__es = "VÍDEOS";
    feat.cta_label = "WATCH FEATURED VIDEO";
    feat.cta_label__i18n__es = "VER VÍDEO DESTACADO";
  }

  // Refine Regular Video in media_items
  const regCard = (storyContent.media_items || []).find(
    (c: any) => c.embed_url === "https://www.youtube.com/watch?v=VshaRvBlr1E"
  );
  if (regCard) {
    regCard.title = "The Emperor of Atlantis (Viktor Ullmann) — Featuring Blanca Portillo & Pedro Halffter";
    regCard.title__i18n__es = "El emperador de la Atlántida (Viktor Ullmann) — Con Blanca Portillo & Pedro Halffter";
    regCard.subtitle = "Feature & Production • Teatro Real Madrid";
    regCard.subtitle__i18n__es = "Reportaje y Producción • Teatro Real de Madrid";
    regCard.category = "VIDEOS";
    regCard.category__i18n__es = "VÍDEOS";
    regCard.cta_label = "WATCH VIDEO";
    regCard.cta_label__i18n__es = "VER VÍDEO";
  }

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log("✅ Successfully refined featured and regular Teatro Real video titles in Storyblok!");
}

main().catch(console.error);
