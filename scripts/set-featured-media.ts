// scripts/set-featured-media.ts
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
  console.log("Fetching 'media' story...");
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;

  console.log("Uploading thumbnail for featured video...");
  const asset = await uploadThumbnail("https://i.ytimg.com/vi/Sv0rihMi48k/hqdefault.jpg", "featured_winterreise.jpg");

  const newFeaturedCard = {
    component: "media_card",
    category: "VIDEOS",
    category__i18n__es: "VÍDEOS",
    title: "Winterreise — Adaptation by Pedro Halffter",
    title__i18n__es: "Winterreise — adaptación de Pedro Halffter",
    subtitle: "Work Presentation • Schubert / Pedro Halffter",
    subtitle__i18n__es: "Presentación de obra • Schubert / Pedro Halffter",
    date_label: "2025",
    date_label__i18n__es: "2025",
    embed_url: "https://www.youtube.com/watch?v=Sv0rihMi48k",
    media_type: "video",
    card_style: "video_feature",
    card_size: "large",
    cta_label: "WATCH FULL CONCERT",
    cta_label__i18n__es: "VER VÍDEO COMPLETO",
    ...(asset ? { image: asset } : { image: { id: null, filename: "https://i.ytimg.com/vi/Sv0rihMi48k/hqdefault.jpg", fieldtype: "asset" } })
  };

  storyContent.featured_media = [newFeaturedCard];

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log("✅ Successfully uploaded thumbnail asset and updated featured video!");
}

main().catch(console.error);
