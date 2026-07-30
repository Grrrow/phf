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
  const newsStory = storiesResp.data.stories.find((s: any) => s.slug === 'news');

  if (!newsStory) {
    console.error("News story not found!");
    return;
  }

  const res = await Storyblok.get(`spaces/${SPACE_ID}/stories/${newsStory.id}`);
  const content = res.data.story.content;

  content.featured_article = [
    {
      component: "article_card",
      _uid: `featured_article_${Date.now()}`,
      variant: "featured",
      media_type: "none",
      date: "Feb 2027",
      date__i18n__es: "Feb 2027",
      category: "WORLD PREMIERE",
      category__i18n__es: "ESTRENO MUNDIAL",
      title: "La Lettre au général Franco",
      title__i18n__es: "La Lettre au général Franco",
      excerpt: "World premiere of Pedro Halffter's new opera at Opéra de Montréal, featuring his original composition and musical direction.",
      excerpt__i18n__es: "Opéra de Montréal anuncia el estreno mundial de la nueva ópera de Pedro Halffter, quien firma la composición y la dirección musical.",
      cta_label: "VIEW PROGRAM",
      cta_label__i18n__es: "VER PROGRAMA",
      cta_link: {
        linktype: "url",
        url: "https://operademontreal.com/en/programs/la-lettre-au-general-franco",
        cached_url: "https://operademontreal.com/en/programs/la-lettre-au-general-franco"
      }
    }
  ];

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${newsStory.id}`, {
    story: { content: content },
    force_update: 1
  });

  console.log("✅ Successfully updated featured article in Storyblok!");
}

main();
