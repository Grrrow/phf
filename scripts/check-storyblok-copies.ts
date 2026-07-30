// scripts/check-storyblok-copies.ts
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
  console.log("Fetching all stories from Storyblok space...");
  const resp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const stories = resp.data.stories || [];

  for (const s of stories) {
    const detail = await Storyblok.get(`spaces/${SPACE_ID}/stories/${s.id}`);
    console.log(`\n========================================`);
    console.log(`Story: ${s.name} (slug: ${s.slug}, id: ${s.id})`);
    console.log(`Content keys:`, Object.keys(detail.data.story.content));
    const jsonStr = JSON.stringify(detail.data.story.content, null, 2);
    if (jsonStr.toLowerCase().includes("compositor") || jsonStr.toLowerCase().includes("divulgador") || jsonStr.toLowerCase().includes("speaker") || jsonStr.toLowerCase().includes("communicator")) {
      console.log(` Found composer/speaker matches in ${s.name}!`);
    }
  }
}

main().catch(console.error);
