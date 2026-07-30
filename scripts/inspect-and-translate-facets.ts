// scripts/inspect-and-translate-facets.ts
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
  const stories = storiesResp.data.stories || [];

  for (const sName of ["biography", "home", "works"]) {
    const storyMeta = stories.find((s: any) => s.slug === sName);
    if (!storyMeta) continue;

    const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${storyMeta.id}`);
    const story = detailResp.data.story;

    console.log(`\n=================== ${sName.toUpperCase()} STORY ===================`);
    const jsonStr = JSON.stringify(story.content, null, 2);
    
    // Find all blocks/text referencing composer or speaker/communicator/divulgador
    const lines = jsonStr.split("\n");
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes("compos") || line.toLowerCase().includes("divulg") || line.toLowerCase().includes("speak") || line.toLowerCase().includes("conferenc")) {
        console.log(`L${idx + 1}: ${line.trim()}`);
      }
    });
  }
}

main().catch(console.error);
