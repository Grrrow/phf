// scripts/import-photo-gallery.ts
import fs from "fs";
import path from "path";
import StoryblokClient from "storyblok-js-client";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const SPACE_ID = process.env.STORYBLOK_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.STORYBLOK_MANAGEMENT_TOKEN;

const Storyblok = new StoryblokClient({
  oauthToken: MANAGEMENT_TOKEN,
});

// A curated collection of verified Pedro Halffter photos categorized by type
const photoCollection = [
  // 1. PORTRAITS / RETRATOS
  {
    type: "portrait",
    titleEn: "Official Artistic Portrait",
    titleEs: "Retrato Artístico Oficial",
    subtitleEn: "Studio Portrait • Official Media",
    subtitleEs: "Retrato de Estudio • Fotografía Oficial",
    filename: "https://a.storyblok.com/f/293187221511990/720x488/fb410251ed/pedro_halffter.jpg",
    style: "photo_portrait"
  },
  {
    type: "portrait",
    titleEn: "Conductor Portrait — Pedro Halffter",
    titleEs: "Retrato de Director — Pedro Halffter",
    subtitleEn: "Promotional Portrait • Editorial Session",
    subtitleEs: "Retrato Promocional • Sesión Editorial",
    filename: "https://a.storyblok.com/f/293187221511990/e85f880238/news_art_54.jpg",
    style: "photo_portrait"
  },

  // 2. CONDUCTING & STAGE / DIRECCIÓN Y ESCENA
  {
    type: "conducting",
    titleEn: "Directing Symphony Orchestra in Concert",
    titleEs: "Dirección de Orquesta Sinfónica en Concierto",
    subtitleEn: "Stage & Concert • Live Symphony",
    subtitleEs: "Escena y Concierto • Sinfónico en Vivo",
    filename: "https://a.storyblok.com/f/293187221511990/762706368f/news_art_53.jpg",
    style: "photo_landscape"
  },
  {
    type: "conducting",
    titleEn: "Opera Production — Teatro Real Conducting",
    titleEs: "Producción Operística — Dirección en Teatro Real",
    subtitleEn: "Opera Stage • Theater Performance",
    subtitleEs: "Escena Operística • Representación en Teatro",
    filename: "https://a.storyblok.com/f/293187221511990/b8332907d1/news_art_52.jpg",
    style: "photo_landscape"
  },
  {
    type: "conducting",
    titleEn: "Orchestral Rehearsal Session",
    titleEs: "Ensayos Orquestales y Preparación Sinfónica",
    subtitleEn: "Stage Rehearsal • Orchestra Preparation",
    subtitleEs: "Ensayo de Escena • Preparación Orquestal",
    filename: "https://a.storyblok.com/f/293187221511990/1b8de976a3/news_art_51.jpg",
    style: "photo_landscape"
  },

  // 3. PIANO & CHAMBER / PIANO Y CÁMARA
  {
    type: "piano",
    titleEn: "At the Piano — Lecture Concert",
    titleEs: "Al Piano — Conferencia Ilustrada",
    subtitleEn: "Piano Recital • Musical Analysis",
    subtitleEs: "Recital al Piano • Análisis Musical",
    filename: "https://a.storyblok.com/f/293187221511990/7fe9a41527/news_art_50.jpg",
    style: "photo_landscape"
  },
  {
    type: "piano",
    titleEn: "Chamber Music Session & Composition",
    titleEs: "Sesión de Cámara y Composición",
    subtitleEn: "Chamber Ensemble • Instrumental Recital",
    subtitleEs: "Música de Cámara • Recital Instrumental",
    filename: "https://a.storyblok.com/f/293187221511990/08acc4fb6f/news_art_49.jpg",
    style: "photo_landscape"
  },

  // 4. PRESS & FESTIVALS / PRENSA Y FESTIVALES
  {
    type: "festival",
    titleEn: "Música en Villafranca Festival",
    titleEs: "Festival Música en Villafranca",
    subtitleEn: "Festival Feature • Cultural Project",
    subtitleEs: "Reportaje de Festival • Proyecto Cultural",
    filename: "https://a.storyblok.com/f/293187221511990/771c8b5246/news_art_48.jpg",
    style: "photo_landscape"
  },
  {
    type: "festival",
    titleEn: "Press Presentation & Cultural Meeting",
    titleEs: "Presentación de Prensa y Encuentro Cultural",
    subtitleEn: "Press Archive • Official Event",
    subtitleEs: "Archivo de Prensa • Evento Oficial",
    filename: "https://a.storyblok.com/f/293187221511990/445bec1dc2/news_art_47.jpg",
    style: "photo_landscape"
  },
  {
    type: "festival",
    titleEn: "Contemporary Creation & Premieres Session",
    titleEs: "Creación Contemporánea y Ciclo de Estrenos",
    subtitleEn: "Artistic Direction • Contemporary Cycle",
    subtitleEs: "Dirección Artística • Ciclo Contemporáneo",
    filename: "https://a.storyblok.com/f/293187221511990/0c299c1c71/news_art_46.jpg",
    style: "photo_landscape"
  }
];

async function main() {
  console.log("Fetching all assets from Storyblok space to build asset map...");
  const resp = await Storyblok.get(`spaces/${SPACE_ID}/assets`, { per_page: 100 });
  const assets = resp.data.assets || [];

  const assetMap = new Map<string, number>();
  assets.forEach((a: any) => {
    assetMap.set(a.filename, a.id);
  });

  console.log(`Building ${photoCollection.length} photo cards sorted by type...`);

  const photoCards: any[] = [];

  for (const item of photoCollection) {
    const assetId = assetMap.get(item.filename) || null;

    const card = {
      component: "media_card",
      category: "PHOTOS",
      category__i18n__es: "FOTOS",
      title: item.titleEn,
      title__i18n__es: item.titleEs,
      subtitle: item.subtitleEn,
      subtitle__i18n__es: item.subtitleEs,
      date_label: "",
      date_label__i18n__es: "",
      embed_url: item.filename,
      media_type: "photo",
      card_style: item.style,
      card_size: "medium",
      cta_label: "VIEW PHOTO",
      cta_label__i18n__es: "VER FOTO",
      image: {
        id: assetId,
        filename: item.filename,
        fieldtype: "asset",
      },
    };

    photoCards.push(card);
  }

  console.log("Fetching 'media' story from Storyblok...");
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;
  const currentItems = storyContent.media_items || [];

  // Filter out existing PHOTOS cards
  const nonPhotoCards = currentItems.filter(
    (c: any) => c.category?.toUpperCase() !== "PHOTOS" && c.category?.toUpperCase() !== "FOTOS"
  );

  // Combine: Videos + Discography + Sorted Photos
  storyContent.media_items = [...nonPhotoCards, ...photoCards];

  console.log(`Saving ${photoCards.length} photo cards to Storyblok (Total media items: ${storyContent.media_items.length})...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n🎉 Successfully integrated ${photoCards.length} photos sorted by type under PHOTOS tag!`);
}

main().catch(console.error);
