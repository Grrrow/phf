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
    
    if (response.data.stories.length === 0) {
      console.log('Home story not found. Searching by name...');
      const listResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
      const found = listResp.data.stories.find((s: any) => s.name === 'Home');
      if (found) {
        response.data.stories = [found];
      } else {
        console.error("❌ 'Home' story not found!");
        return;
      }
    }

    const homeStoryId = response.data.stories[0].id;
    const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${homeStoryId}`);
    const homeStory = detailResp.data.story;

    const homeContent = {
      ...homeStory.content,
      component: 'page', // Asumiendo que la Home usa el componente genérico 'page'
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
      ],
      body: [
        {
          component: "home_hero_section",
          title: "Orchestrating Silence & Sound",
          description: "Pedro Halffter's approach to conducting is an exploration of the spaces between notes. A prestigious, minimalist vision for contemporary and classical repertoire.",
          cta_text: "DISCOVER BIOGRAPHY",
          cta_link: { cached_url: "biography", linktype: "story" }
        },
        {
          component: "featured_works_section",
          title: "Featured Works",
          items: [
            {
              component: "work_highlight_card",
              category: "SYMPHONIC SUITE",
              title: "Mahler: Symphony No. 9",
              description: "",
              card_size: "large",
              card_style: "media_feature",
              cta_label: "EXPLORE WORK"
            },
            {
              component: "work_highlight_card",
              category: "OPERA",
              title: "Klara",
              description: "A contemporary chamber opera exploring themes of isolation and artificial consciousness, commissioned for a specialized ensemble.",
              card_size: "medium",
              card_style: "text_card",
              cta_label: "EXPLORE WORK"
            },
            {
              component: "work_highlight_card",
              category: "CHAMBER",
              title: "String Quartet No. 2",
              description: "An intimate dialogue between instruments, recorded live.",
              card_size: "medium",
              card_style: "text_card",
              cta_label: "EXPLORE WORK"
            },
            {
              component: "work_highlight_card",
              category: "LATEST RELEASE",
              title: "The Spanish Repertoire",
              description: "A collection of works by Falla, Turina, and Halffter himself.",
              card_size: "medium",
              card_style: "placeholder_card",
              cta_label: "LISTEN NOW"
            }
          ]
        },
        {
          component: "upcoming_highlights_section",
          title: "Upcoming Highlights",
          subtitle: "Selected performances and engagements.",
          cta_label: "VIEW FULL AGENDA",
          cta_link: { cached_url: "agenda", linktype: "story" },
          items: [
            {
              component: "event_highlight_item",
              date_label: "Nov 15",
              date_sublabel: "2024",
              title: "Beethoven: Symphony No. 5",
              subtitle: "Orquesta Sinfónica de Madrid",
              location_label: "MADRID, SPAIN",
              details_label: "DETAILS",
              details_link: { cached_url: "agenda", linktype: "story" }
            },
            {
              component: "event_highlight_item",
              date_label: "Dec 02",
              date_sublabel: "2024",
              title: "Wagner: Tristan und Isolde (Prelude)",
              subtitle: "Berlin Philharmonic",
              location_label: "BERLIN, GERMANY",
              details_label: "DETAILS",
              details_link: { cached_url: "agenda", linktype: "story" }
            },
            {
              component: "event_highlight_item",
              date_label: "Jan 18",
              date_sublabel: "2025",
              title: "Halffter: New Orchestral Work Premiere",
              subtitle: "Chicago Symphony Orchestra",
              location_label: "CHICAGO, USA",
              details_label: "DETAILS",
              details_link: { cached_url: "agenda", linktype: "story" }
            }
          ]
        }
      ]
    };

    await Storyblok.put(`spaces/${SPACE_ID}/stories/${homeStoryId}`, {
      story: {
        content: homeContent
      }
    });

    console.log('✅ Home story updated successfully with dummy content!');
  } catch (error: any) {
    console.error("❌ Error updating Home story:", error.response?.data || error.message);
  }
}

main();
