import fs from 'node:fs';
import path from 'node:path';
import StoryblokClient from 'storyblok-js-client';

const envPath = path.join(process.cwd(), '.env');
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
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const bioStory = storiesResp.data.stories.find((s: any) => s.slug === 'biography');

  if (!bioStory) {
    console.error("Biography story not found!");
    return;
  }

  const res = await Storyblok.get(`spaces/${SPACE_ID}/stories/${bioStory.id}`);
  console.log(JSON.stringify(res.data.story.content, null, 2));
}

main().catch(err => console.error(err));
