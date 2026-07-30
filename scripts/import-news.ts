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

const data1 = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'news_data.json'), 'utf-8'));
const data2 = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'news_data_2.json'), 'utf-8'));

const allItems = [...data1.items, ...data2.items];

const uniqueItems = [];
const seenTitles = new Set();
for (const item of allItems) {
  if (!seenTitles.has(item.title)) {
    seenTitles.add(item.title);
    uniqueItems.push(item);
  }
}

// sort by date desc
uniqueItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

function formatDateEN(dateStr: string) {
  if (!dateStr || dateStr.length < 4) return "";
  const parts = dateStr.split('-');
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateES(dateStr: string) {
  if (!dateStr || dateStr.length < 4) return "";
  const parts = dateStr.split('-');
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
    return d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '');
  }
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
}

const catMapEN: Record<string, string> = {
  "Anuncio": "ANNOUNCEMENT",
  "Crítica": "REVIEW",
  "Entrevista": "INTERVIEW",
  "Perfil": "PROFILE",
  "Noticia": "NEWS"
};

const catMapES: Record<string, string> = {
  "Anuncio": "ANUNCIO",
  "Crítica": "CRÍTICA",
  "Entrevista": "ENTREVISTA",
  "Perfil": "PERFIL",
  "Noticia": "NOTICIA"
};

async function main() {
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const newsStory = storiesResp.data.stories.find((s: any) => s.slug === 'news');

  if (!newsStory) {
    console.error("News story not found!");
    return;
  }

  const res = await Storyblok.get(`spaces/${SPACE_ID}/stories/${newsStory.id}`);
  const content = res.data.story.content;

  const newArticles = uniqueItems.map((item: any, index: number) => {
    return {
      component: "article_card",
      _uid: `news_article_${Date.now()}_${index}`,
      variant: "standard",
      media_type: "none",
      date: formatDateEN(item.date),
      date__i18n__es: formatDateES(item.date),
      category: catMapEN[item.type] || item.type.toUpperCase(),
      category__i18n__es: catMapES[item.type] || item.type.toUpperCase(),
      title: item.title,
      title__i18n__es: item.title,
      excerpt: item.description,
      excerpt__i18n__es: item.description,
      cta_label: "READ FULL ARTICLE",
      cta_label__i18n__es: "LEER ARTÍCULO COMPLETO",
      cta_link: {
        linktype: "url",
        url: item.url,
        cached_url: item.url
      }
    };
  });

  content.articles = newArticles;

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${newsStory.id}`, {
    story: { content: content },
    force_update: 1
  });

  console.log(`✅ Successfully imported ${newArticles.length} unique articles to Storyblok 'News' page.`);
}

main();
