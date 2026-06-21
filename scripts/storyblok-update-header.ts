import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StoryblokClient from 'storyblok-js-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load env vars manually
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

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error("Missing STORYBLOK_SPACE_ID or STORYBLOK_MANAGEMENT_TOKEN in .env");
  process.exit(1);
}

const Storyblok = new StoryblokClient({
  oauthToken: MANAGEMENT_TOKEN,
});

async function main() {
  try {
    const response = await Storyblok.get(`spaces/${SPACE_ID}/stories`, {
      per_page: 100
    });
    const globalStoryList = response.data.stories.find((s: any) => s.slug === 'global-config' || s.name === 'Global Config');

    if (!globalStoryList) {
      console.error("❌ 'global-config' story not found!");
      return;
    }

    const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${globalStoryList.id}`);
    const globalStory = detailResp.data.story;

    const content = globalStory.content;
    
    // Ensure header array exists
    if (!content.header) content.header = [];
    if (content.header.length === 0) {
      content.header.push({
        component: 'header_config',
        navigation: []
      });
    }

    const headerConfig = content.header[0];
    if (!headerConfig.navigation) headerConfig.navigation = [];

    const newPages = [
      { label: 'Biography', url: 'biography' },
      { label: 'Works', url: 'works' },
      { label: 'Agenda', url: 'agenda' }
    ];

    let updated = false;

    for (const page of newPages) {
      // Check if already exists by checking the URL or exact label
      const exists = headerConfig.navigation.find((item: any) => 
        item.link?.cached_url === page.url || item.label === page.label
      );

      if (!exists) {
        // Encontrar la posición para insertar. Insertamos antes del contacto ("Contact") si existe.
        const contactIndex = headerConfig.navigation.findIndex((item: any) => 
          item.link?.cached_url?.includes('contact') || item.label?.toLowerCase() === 'contact'
        );

        const newItem = {
          component: 'navigation_item',
          label: page.label,
          link: {
            cached_url: page.url,
            linktype: 'story'
          }
        };

        if (contactIndex !== -1) {
          headerConfig.navigation.splice(contactIndex, 0, newItem);
        } else {
          headerConfig.navigation.push(newItem);
        }
        
        updated = true;
        console.log(`➕ Added ${page.label} to header navigation.`);
      } else {
        console.log(`⚠️ ${page.label} already exists in header navigation.`);
      }
    }

    if (updated) {
      await Storyblok.put(`spaces/${SPACE_ID}/stories/${globalStory.id}`, {
        story: {
          content
        }
      });
      console.log('✅ Global story updated successfully!');
    } else {
      console.log('✅ Header is already up to date!');
    }

  } catch (error: any) {
    console.error("❌ Error updating global story:", error.response?.data || error.message);
  }
}

main();
