// scripts/inspect-storyblok-assets.ts
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
  console.log("Fetching all assets from Storyblok space...");
  const resp = await Storyblok.get(`spaces/${SPACE_ID}/assets`, { per_page: 100 });
  const assets = resp.data.assets || [];

  console.log(`Found ${assets.length} assets in space:\n`);
  assets.forEach((a: any, i: number) => {
    console.log(`[${i + 1}] ID: ${a.id} | Name: ${a.filename} | Title/Alt: ${a.title || a.alt || "N/A"}`);
  });
}

main().catch(console.error);
