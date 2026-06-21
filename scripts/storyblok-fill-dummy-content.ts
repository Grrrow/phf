import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StoryblokClient from 'storyblok-js-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Cargar variables de entorno manualmente
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

// Función para obtener la Story por Slug
async function getStoryBySlug(slug: string) {
  try {
    const response = await Storyblok.get(`spaces/${SPACE_ID}/stories`, {
      with_slug: slug
    });
    return response.data.stories[0];
  } catch (error) {
    console.error(`Error buscando la story ${slug}:`, error);
    return null;
  }
}

// Función para actualizar el contenido
async function updateStoryContent(storyId: number, content: any) {
  try {
    await Storyblok.put(`spaces/${SPACE_ID}/stories/${storyId}`, {
      story: {
        content
      }
    });
    console.log(`✅ Story actualizada con éxito (ID: ${storyId})`);
  } catch (error: any) {
    console.error(`❌ Error actualizando story ID ${storyId}:`, error.response?.data || error.message);
  }
}

async function main() {
  console.log('Obteniendo stories existentes...');

  // --- 1. BIOGRAPHY ---
  const bioStory = await getStoryBySlug('biography');
  if (bioStory) {
    console.log('Rellenando Biography...');
    const bioContent = {
      ...bioStory.content,
      component: 'biography_page',
      body: [
        {
          component: "biography_hero_section",
          title: "A Life in Movement.",
          intro: "Pedro Halffter is a renowned conductor and composer, recognized internationally for his passionate interpretations and profound musical understanding.",
          image_treatment: "black_white",
          image_position: "right",
          heading_level: "h1",
          is_lcp: true
        },
        {
          component: "editorial_text_section",
          title: "The Architect of Sound",
          text: {
            "type": "doc",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "text": "Born in Madrid, Pedro Halffter Caro has forged an international career conducting some of the world's most prestigious orchestras. His meticulous attention to detail and ability to breathe new life into classic masterpieces has earned him critical acclaim globally.",
                    "type": "text"
                  }
                ]
              },
              {
                "type": "paragraph",
                "content": [
                  {
                    "text": "Beyond the podium, his work as a composer reveals a deeply emotional connection to contemporary narratives, exploring the limits of orchestral colors.",
                    "type": "text"
                  }
                ]
              }
            ]
          },
          text_width: "medium",
          alignment: "left"
        },
        {
          component: "career_highlights_section",
          title: "Career Highlights",
          items: [
            {
              component: "career_highlight_item",
              date_label: "2001 - 2004",
              role_label: "Principal Guest Conductor",
              description: "Nürnberger Symphoniker"
            },
            {
              component: "career_highlight_item",
              date_label: "2004 - 2014",
              role_label: "Artistic Director",
              description: "Orquesta Filarmónica de Gran Canaria"
            },
            {
              component: "career_highlight_item",
              date_label: "2004 - 2018",
              role_label: "Artistic Director",
              description: "Real Orquesta Sinfónica de Sevilla"
            }
          ]
        }
      ]
    };
    await updateStoryContent(bioStory.id, bioContent);
  }

  // --- 2. WORKS ---
  const worksStory = await getStoryBySlug('works');
  if (worksStory) {
    console.log('Rellenando Works...');
    const worksContent = {
      ...worksStory.content,
      component: 'works_catalog_page',
      groups: [
        {
          component: "works_catalog_group",
          title: "Operas",
          items: [
            {
              component: "work_catalog_item",
              title: "Klara",
              year: "2022",
              instrumentation: "Soprano, 2 Pianos and Percussion",
              duration: "60'"
            },
            {
              component: "work_catalog_item",
              title: "Schachnovelle",
              year: "2013",
              instrumentation: "Full Orchestra and Choir",
              duration: "120'"
            }
          ]
        },
        {
          component: "works_catalog_group",
          title: "Symphonic Works",
          items: [
            {
              component: "work_catalog_item",
              title: "Diferencias sobre dos temas de Falla",
              year: "2006",
              instrumentation: "Symphony Orchestra",
              duration: "18'"
            },
            {
              component: "work_catalog_item",
              title: "Fantasía sobre una sonoridad de G.F. Handel",
              year: "1999",
              instrumentation: "Orchestra",
              duration: "12'"
            }
          ]
        }
      ]
    };
    await updateStoryContent(worksStory.id, worksContent);
  }

  // --- 3. AGENDA ---
  const agendaStory = await getStoryBySlug('agenda');
  if (agendaStory) {
    console.log('Rellenando Agenda...');
    const agendaContent = {
      ...agendaStory.content,
      component: 'agenda_page',
      events_section: [
        {
          component: "agenda_events_section",
          layout_variant: "full_agenda_list",
          items: [
            {
              component: "event_highlight_item",
              date_label: "Oct 12",
              date_sublabel: "2024 · 20:00",
              title: "Mahler: Symphony No. 9",
              subtitle: "Orquesta Sinfónica de Madrid",
              location_label: "Teatro Real, Madrid",
              details_label: "Tickets / Info",
              details_link: { cached_url: "https://example.com" },
              status: "upcoming"
            },
            {
              component: "event_highlight_item",
              date_label: "Nov 05",
              date_sublabel: "2024 · 19:30",
              title: "Wagner: Tristan und Isolde (Prelude) & Bruckner 7",
              subtitle: "Rundfunk-Sinfonieorchester Berlin",
              location_label: "Philharmonie Berlin",
              details_label: "Tickets / Info",
              details_link: { cached_url: "https://example.com" },
              status: "upcoming"
            },
            {
              component: "event_highlight_item",
              date_label: "Dec 18",
              date_sublabel: "2024 · 20:00",
              title: "Contemporary Works: Halffter & Ligeti",
              subtitle: "Ensemble Intercontemporain",
              location_label: "Cité de la Musique, Paris",
              details_label: "Tickets / Info",
              details_link: { cached_url: "https://example.com" },
              status: "upcoming"
            },
            {
              component: "event_highlight_item",
              date_label: "Jan 22",
              date_sublabel: "2025 · 19:00",
              title: "Strauss: Elektra",
              subtitle: "Bayerisches Staatsorchester",
              location_label: "Nationaltheater, Munich",
              details_label: "Sold Out",
              status: "sold_out"
            }
          ]
        }
      ]
    };
    await updateStoryContent(agendaStory.id, agendaContent);
  }

  console.log('🎉 ¡Todas las páginas han sido rellenadas con contenido de prueba!');
}

main();
