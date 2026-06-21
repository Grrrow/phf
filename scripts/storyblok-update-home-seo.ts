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
    const response = await Storyblok.get(`spaces/${SPACE_ID}/stories`, {
      with_slug: 'home'
    });
    
    let homeStoryId;
    if (response.data.stories.length === 0) {
      const listResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
      const found = listResp.data.stories.find((s: any) => s.name === 'Home');
      if (found) {
        homeStoryId = found.id;
      } else {
        console.error("❌ 'Home' story not found!");
        return;
      }
    } else {
      homeStoryId = response.data.stories[0].id;
    }

    // Descargamos la ultimísima versión guardada en Storyblok
    const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${homeStoryId}`);
    const homeStory = detailResp.data.story;

    // Preservamos todo el contenido existente y solo añadimos o actualizamos 'seo'
    const homeContent = {
      ...homeStory.content,
      seo: [
        {
          component: "seo",
          meta_title: "Pedro Halffter | Conductor & Composer",
          meta_description: "Official website of Pedro Halffter, Spanish conductor and composer. Discover his symphonic works, operas, biography, and upcoming performances.",
          og_title: "Pedro Halffter | Conductor & Composer",
          og_description: "Official website of Pedro Halffter, Spanish conductor and composer.",
          structured_data_type: "Person",
          focus_keyword: "Pedro Halffter",
          secondary_keywords: "Conductor, Composer, Spanish classical music, Opera"
        }
      ]
    };

    await Storyblok.put(`spaces/${SPACE_ID}/stories/${homeStoryId}`, {
      story: {
        content: homeContent
      }
    });

    console.log('✅ Home story SEO updated safely without touching other blocks!');
  } catch (error: any) {
    console.error("❌ Error updating Home story:", error.response?.data || error.message);
  }
}

main();
