import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StoryblokClient from 'storyblok-js-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
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
  try {
    const listResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
    const stories = listResp.data.stories;
    
    const fullStories = [];
    for (const s of stories) {
      const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${s.id}`);
      fullStories.push(detailResp.data.story);
    }

    const exportPath = path.join(rootDir, 'scripts', 'exported_stories.json');
    fs.writeFileSync(exportPath, JSON.stringify(fullStories, null, 2));
    console.log(`✅ Exported ${fullStories.length} stories to scripts/exported_stories.json`);
  } catch (error: any) {
    console.error("❌ Error exporting stories:", error.response?.data || error.message);
  }
}

main();
