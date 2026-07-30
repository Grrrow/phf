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
  let worksStory = storiesResp.data.stories.find((s: any) => s.slug === 'works' || s.name === 'Works');

  if (!worksStory) return console.log('Story not found');
  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${worksStory.id}`);
  fs.writeFileSync('works-dump.json', JSON.stringify(detailResp.data.story.content, null, 2));
  console.log('Dumped to works-dump.json');
}
main();
