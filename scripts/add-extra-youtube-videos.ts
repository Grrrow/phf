// scripts/add-extra-youtube-videos.ts
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

const newVideoUrls = [
  "https://www.youtube.com/watch?v=gZZ7KcQZEH8",
  "https://www.youtube.com/watch?v=Rm4pThZEA58",
  "https://www.youtube.com/watch?v=anSnGhYJuO8",
  "https://www.youtube.com/watch?v=vf5BumWJPfo",
];

function getVideoId(url: string): string {
  const match = url.match(/v=([\w-]{11})/);
  return match ? match[1] : "video";
}

async function fetchYouTubeMetadata(url: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const resp = await fetch(oembedUrl);
    if (resp.ok) {
      const data = (await resp.json()) as any;
      return {
        title: data.title || "Pedro Halffter",
        author_name: data.author_name || "YouTube Channel",
        thumbnail_url: data.thumbnail_url || `https://i.ytimg.com/vi/${getVideoId(url)}/hqdefault.jpg`,
      };
    }
  } catch (e) {
    // silent
  }
  const videoId = getVideoId(url);
  return {
    title: "Pedro Halffter",
    author_name: "YouTube",
    thumbnail_url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

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
  console.log("Fetching YouTube metadata for extra 4 videos...");

  const extraCards: any[] = [];

  for (let i = 0; i < newVideoUrls.length; i++) {
    const url = newVideoUrls[i];
    const videoId = getVideoId(url);
    console.log(`\n[${i + 1}/4] Fetching metadata for ${url}...`);

    const meta = await fetchYouTubeMetadata(url);
    console.log(`   └─ Title: "${meta.title}" (${meta.author_name})`);

    const filename = `youtube_extra_${videoId}.jpg`;
    console.log(`   └─ Uploading thumbnail asset to Storyblok...`);
    const asset = await uploadThumbnail(meta.thumbnail_url, filename);

    // Prepare bilingual translations
    const titleEs = meta.title;
    const titleEn = meta.title;

    const subtitleEs = `Vídeo • ${meta.author_name}`;
    const subtitleEn = `Video • ${meta.author_name}`;

    const card = {
      component: "media_card",
      category: "VIDEOS",
      category__i18n__es: "VÍDEOS",
      title: titleEn,
      title__i18n__es: titleEs,
      subtitle: subtitleEn,
      subtitle__i18n__es: subtitleEs,
      date_label: "",
      date_label__i18n__es: "",
      embed_url: url,
      media_type: "video",
      card_style: "video_feature",
      card_size: "medium",
      cta_label: "WATCH VIDEO",
      cta_label__i18n__es: "VER VÍDEO",
      ...(asset ? { image: asset } : {}),
    };

    extraCards.push(card);
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

  // Filter out any duplicates if already added by URL
  const filteredExisting = currentItems.filter((c: any) => !newVideoUrls.includes(c.embed_url));

  storyContent.media_items = [...extraCards, ...filteredExisting];

  console.log(`Saving ${extraCards.length} new video cards to Storyblok (Total media items: ${storyContent.media_items.length})...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n🎉 Successfully added 4 new YouTube videos to Storyblok!`);
}

main().catch(console.error);
