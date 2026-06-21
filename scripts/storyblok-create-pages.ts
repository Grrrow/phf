import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StoryblokClient from 'storyblok-js-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables manually
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

// Inicializar el cliente usando el token personal de la API de gestión
const Storyblok = new StoryblokClient({
  oauthToken: MANAGEMENT_TOKEN,
});

async function createStory(name: string, slug: string, component: string, defaultContent: any) {
  try {
    const response = await Storyblok.post(`spaces/${SPACE_ID}/stories`, {
      story: {
        name,
        slug,
        content: {
          component,
          ...defaultContent
        }
      }
    });
    console.log(`✅ Story creada: ${name} (Slug: /${slug})`);
  } catch (error: any) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    if (errorMsg.includes('already taken') || errorMsg.includes('has already been taken')) {
      console.log(`⚠️ La página ya existe: ${name} (Slug: /${slug})`);
    } else {
      console.error(`❌ Error creando ${name}:`, errorMsg);
    }
  }
}

async function main() {
  console.log('Creando páginas maestras en Storyblok...');

  // 1. Biografía
  await createStory('Biography', 'biography', 'biography_page', {
    page_theme: "editorial",
    show_header: true,
    show_footer: true,
    body: [
      {
        component: "biography_hero_section",
        title: "A Life in Movement.",
        image_treatment: "black_white",
        image_position: "right",
        heading_level: "h1",
        is_lcp: true
      }
    ]
  });

  // 2. Obras (Works Catalog)
  await createStory('Works', 'works', 'works_catalog_page', {
    title: "Works Catalog",
    page_theme: "editorial",
    show_header: true,
    show_footer: true,
    catalog: [
      {
        component: "works_catalog_group",
        title: "Operas",
        items: []
      }
    ]
  });

  // 3. Agenda
  await createStory('Agenda', 'agenda', 'agenda_page', {
    title: "Agenda",
    intro: "A curated chronicle of upcoming orchestral engagements, operatic premieres, and recital appearances globally.",
    page_theme: "editorial",
    show_header: true,
    show_footer: true,
    events_section: [
      {
        component: "agenda_events_section",
        layout_variant: "full_agenda_list"
      }
    ]
  });

  console.log('¡Proceso finalizado!');
}

main();
