// scripts/add-latest-youtube-videos.ts
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

const featuredUrl = "https://www.youtube.com/watch?v=ePGviE6noBI";
const regularUrl = "https://www.youtube.com/watch?v=VshaRvBlr1E";

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
  console.log("Fetching YouTube metadata...");

  const metaFeatured = await fetchYouTubeMetadata(featuredUrl);
  console.log(`Featured Video Title: "${metaFeatured.title}" (${metaFeatured.author_name})`);

  const metaRegular = await fetchYouTubeMetadata(regularUrl);
  console.log(`Regular Video Title: "${metaRegular.title}" (${metaRegular.author_name})`);

  // Upload thumbnails
  const featAsset = await uploadThumbnail(metaFeatured.thumbnail_url, `featured_yt_${getVideoId(featuredUrl)}.jpg`);
  const regAsset = await uploadThumbnail(metaRegular.thumbnail_url, `yt_${getVideoId(regularUrl)}.jpg`);

  // Build Featured Card
  const featuredCard = {
    component: "media_card",
    category: "VIDEOS",
    category__i18n__es: "VÍDEOS",
    title: metaFeatured.title,
    title__i18n__es: metaFeatured.title,
    subtitle: `Featured Video • ${metaFeatured.author_name}`,
    subtitle__i18n__es: `Vídeo Destacado • ${metaFeatured.author_name}`,
    date_label: "",
    date_label__i18n__es: "",
    embed_url: featuredUrl,
    media_type: "video",
    card_style: "video_feature",
    card_size: "large",
    cta_label: "WATCH FEATURED VIDEO",
    cta_label__i18n__es: "VER VÍDEO DESTACADO",
    ...(featAsset ? { image: featAsset } : {}),
  };

  // Build Regular Card
  const regularCard = {
    component: "media_card",
    category: "VIDEOS",
    category__i18n__es: "VÍDEOS",
    title: metaRegular.title,
    title__i18n__es: metaRegular.title,
    subtitle: `Video • ${metaRegular.author_name}`,
    subtitle__i18n__es: `Vídeo • ${metaRegular.author_name}`,
    date_label: "",
    date_label__i18n__es: "",
    embed_url: regularUrl,
    media_type: "video",
    card_style: "video_feature",
    card_size: "medium",
    cta_label: "WATCH VIDEO",
    cta_label__i18n__es: "VER VÍDEO",
    ...(regAsset ? { image: regAsset } : {}),
  };

  console.log("\nFetching 'media' story from Storyblok...");
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;

  // Set featured_media to the new featuredCard
  storyContent.featured_media = [featuredCard];

  // Append regularCard to media_items (and also add featuredCard to media_items so it's in the grid too)
  const currentItems = storyContent.media_items || [];
  const filteredExisting = currentItems.filter(
    (c: any) => c.embed_url !== featuredUrl && c.embed_url !== regularUrl
  );

  storyContent.media_items = [regularCard, ...filteredExisting];

  console.log("Saving updated 'media' story to Storyblok...");

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log("✅ Successfully updated featured video and media grid in Storyblok!");
}

main().catch(console.error);
