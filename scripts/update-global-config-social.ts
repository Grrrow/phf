// scripts/update-global-config-social.ts
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
  const globalStory = storiesResp.data.stories.find((s: any) => s.slug === "global-config");

  if (!globalStory) {
    console.log("Global config story not found");
    return;
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${globalStory.id}`);
  const storyContent = detailResp.data.story.content;

  storyContent.social_profiles = [
    {
      platform: "Facebook",
      url: "https://www.facebook.com/profile.php?id=100069814851042",
    },
    {
      platform: "Instagram",
      url: "https://www.instagram.com/pedrohalffter/",
    },
  ];

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${globalStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log("✅ Successfully updated social profiles in Storyblok Global Config!");
}

main().catch(console.error);
