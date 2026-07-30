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

const schottData = {
  "569788": { "name": "Klara", "url": "https://www.schott-music.com/en/klara-no569788.html" },
  "334457": { "name": "Der Kaiser von Atlantis oder Die Tod-Verweigerung", "url": "https://www.schott-music.com/en/der-kaiser-von-atlantis-oder-die-tod-verweigerung-no334457.html" },
  "797391": { "name": "Klara", "url": "https://www.schott-music.com/en/klara-no797391.html" },
  "344443": { "name": "Adagio und Kleine Ouvertüre", "url": "https://www.schott-music.com/en/adagio-und-kleine-ouvertuere-no344443.html" },
  "558663": { "name": "Proteo", "url": "https://www.schott-music.com/en/proteo-no558663.html" },
  "442124": { "name": "Tannhäuser", "url": "https://www.schott-music.com/en/tannhaeuser-no442124.html" },
  "374770": { "name": "Thank You Mr. Joyce", "url": "https://www.schott-music.com/en/thank-you-mr-joyce-no374770.html" },
  "785230": { "name": "Adagio", "url": "https://www.schott-music.com/en/adagio-no785230.html", subtitle: "for brass, percussion and double basses" },
  "344444": { "name": "Adagio", "url": "https://www.schott-music.com/en/adagio-no344444.html", subtitle: "(in memoriam Ana Frank)" },
  "C619174": { "name": "Sonata", "url": "https://www.schott-music.com/en/sonata-noc619174.html" },
  "421378": { "name": "Sinfonie Nr. 9", "url": "https://www.schott-music.com/en/sinfonie-nr-9-no421378.html" },
  "588925": { "name": "Parsifal", "url": "https://www.schott-music.com/en/parsifal-no588925.html" },
  "442126": { "name": "Tannhäuser", "url": "https://www.schott-music.com/en/tannhaeuser-no442126.html" }
};

async function main() {
  try {
    const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
    let worksStory = storiesResp.data.stories.find((s: any) => s.slug === 'works' || s.name === 'Works');

    if (!worksStory) return console.log('Story not found');

    const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${worksStory.id}`);
    const content = detailResp.data.story.content;
    let klaraCounter = 0;
    
    // Iterate over groups and items
    if (content.groups) {
      content.groups.forEach((group: any) => {
        if (group.items) {
          group.items.forEach((item: any) => {
            if (item.component === 'work_catalog_item') {
              // Find matching URL
              let matchedUrl = '';
              
              if (item.title === 'Klara') {
                matchedUrl = klaraCounter === 0 ? schottData["569788"].url : schottData["797391"].url;
                klaraCounter++;
              } else if (item.title === 'Adagio') {
                if (item.description.includes('brass')) matchedUrl = schottData["785230"].url;
                else matchedUrl = schottData["344444"].url;
              } else if (item.title === 'Tannhäuser') {
                if (item.description.includes('Sinfonische Dichtung')) matchedUrl = schottData["442124"].url;
                else matchedUrl = schottData["442126"].url;
              } else {
                const match = Object.values(schottData).find(d => d.name === item.title);
                if (match) matchedUrl = match.url;
              }

              if (matchedUrl) {
                item.details_link = {
                  id: '',
                  url: matchedUrl,
                  linktype: 'url',
                  fieldtype: 'multilink',
                  cached_url: matchedUrl
                };
                // Leave details_label as is (e.g., 'Performance material') or we can change it to "Schott Music".
                // Since the user had "Performance material" as description in our catalogue, and we passed it as details_label before...
                // Wait! In `populate-works.ts`, I passed the third argument as `details_label`. Let's check `populate-works.ts`:
                // createItem('Adagio', 'for brass...', 'Performance material') -> details_label was 'Performance material'.
                // Yes, so it already has a label, but it lacked the link!
                item.open_in_new_tab = true;
                
                // For the UI, since we now have a link, we might want to make sure the label says something like "View Score" or keep "Performance material".
                // "Performance material" as a link is fine.
              }
            }
          });
        }
      });
    }

    await Storyblok.put(`spaces/${SPACE_ID}/stories/${worksStory.id}`, {
      story: { content }
    });

    console.log(`✅ Updated Works story with Schott Music URLs`);

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

main();
