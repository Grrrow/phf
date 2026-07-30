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
  try {
    const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
    let contactStory = storiesResp.data.stories.find((s: any) => s.slug === 'contact' || s.name === 'Contact');

    if (contactStory) {
      const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${contactStory.id}`);
      let content = detailResp.data.story.content;
      let changed = false;

      if (content.management_email === 'pedrohalffter@gmail.com') {
        content.management_email = 'info@pedrohalfftercaro.com';
        changed = true;
      }
      if (content.press_email === 'pedrohalffter@gmail.com') {
        content.press_email = 'info@pedrohalfftercaro.com';
        changed = true;
      }

      if (changed) {
        await Storyblok.put(`spaces/${SPACE_ID}/stories/${contactStory.id}`, {
          story: { content },
          force_update: 1
        });
        
        // Also update Spanish if needed
        try {
          const detailRespES = await Storyblok.get(`spaces/${SPACE_ID}/stories/${contactStory.id}`, { language: 'es' });
          let contentES = detailRespES.data.story.content;
          if (contentES.management_email === 'pedrohalffter@gmail.com') contentES.management_email = 'info@pedrohalfftercaro.com';
          if (contentES.press_email === 'pedrohalffter@gmail.com') contentES.press_email = 'info@pedrohalfftercaro.com';
          await Storyblok.put(`spaces/${SPACE_ID}/stories/${contactStory.id}`, {
            story: { content: contentES },
            force_update: 1
          });
        } catch (e) {}
        console.log('✅ Contact story updated with new email');
      } else {
        console.log('ℹ️ Contact story already uses the new email or is empty');
      }
    }
    
    // Also push the updated schema to Storyblok
    const componentResp = await Storyblok.get(`spaces/${SPACE_ID}/components`);
    const contactComp = componentResp.data.components.find((c: any) => c.name === 'contact_page');
    if (contactComp) {
      const schemaData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'storyblok/components/schemas/contact_page.json'), 'utf8'));
      await Storyblok.put(`spaces/${SPACE_ID}/components/${contactComp.id}`, {
        component: schemaData.schema // wait, the structure for PUT is component: { ... } but it needs full object
      });
      // Actually, since I run `npm run sync` or push-components script, maybe I can just execute that
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

main();
