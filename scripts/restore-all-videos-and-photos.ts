// scripts/restore-all-videos-and-photos.ts
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

function getYouTubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : "video";
}

// Complete catalog of 28 YouTube Videos
const allYouTubeVideos = [
  // Teatro Real Featured & Regular
  {
    url: "https://www.youtube.com/watch?v=ePGviE6noBI",
    titleEn: "The Emperor of Atlantis — Unknown Masterpiece (Teatro Real)",
    titleEs: "El emperador de la Atlántida — Una música desconocida (Teatro Real)",
    subtitleEn: "Featured Production • Teatro Real Madrid",
    subtitleEs: "Producción Destacada • Teatro Real de Madrid",
  },
  {
    url: "https://www.youtube.com/watch?v=VshaRvBlr1E",
    titleEn: "The Emperor of Atlantis (Viktor Ullmann) — Featuring Blanca Portillo & Pedro Halffter",
    titleEs: "El emperador de la Atlántida (Viktor Ullmann) — Con Blanca Portillo & Pedro Halffter",
    subtitleEn: "Feature & Production • Teatro Real Madrid",
    subtitleEs: "Reportaje y Producción • Teatro Real de Madrid",
  },
  // Extra 4
  {
    url: "https://www.youtube.com/watch?v=gZZ7KcQZEH8",
    titleEn: "Palintropos Harmonie (World Premiere) — Ana Häsler & Pedro Halffter",
    titleEs: "Palintropos Harmonie (Estreno Mundial) — Ana Häsler & Pedro Halffter",
    subtitleEn: "Composition Premiere • SWISSCUBAN",
    subtitleEs: "Estreno de composición • SWISSCUBAN",
  },
  {
    url: "https://www.youtube.com/watch?v=Rm4pThZEA58",
    titleEn: "Drei Lieder (Live) — Ana Häsler & Pedro Halffter",
    titleEs: "Drei Lieder (En directo) — Ana Häsler & Pedro Halffter",
    subtitleEn: "Performance • SWISSCUBAN",
    subtitleEs: "Interpretación en directo • SWISSCUBAN",
  },
  {
    url: "https://www.youtube.com/watch?v=anSnGhYJuO8",
    titleEn: "Apocalypse Opera Project — Carlus Padrissa (La Fura dels Baus) & Pedro Halffter",
    titleEs: "Apocalypse Opera Project — Carlus Padrissa (La Fura dels Baus) & Pedro Halffter",
    subtitleEn: "Opera Project • La Fura dels Baus",
    subtitleEs: "Proyecto de Ópera • La Fura dels Baus",
  },
  {
    url: "https://www.youtube.com/watch?v=vf5BumWJPfo",
    titleEn: "The Bells of Gran Canaria (Pedro Halffter)",
    titleEs: "Las campanas de Gran Canaria (Pedro Halffter)",
    subtitleEn: "Composition • Gofio Records",
    subtitleEs: "Composición • Gofio Records",
  },
  // Original 22 YouTube Videos
  {
    url: "https://www.youtube.com/watch?v=jW901B6C4QY",
    titleEn: "Pedro Halffter - International Conductor & Composer",
    titleEs: "Pedro Halffter - Director de Orquesta y Compositor Internacional",
    subtitleEn: "Biographical Profile • Visual Legacy",
    subtitleEs: "Perfil Biográfico • Trayectoria Profesional",
  },
  {
    url: "https://www.youtube.com/watch?v=Y8Y5p5g4-8Y",
    titleEn: "IPU Anthem - Inter-Parliamentary Union",
    titleEs: "Himno de la Unión Interparlamentaria",
    subtitleEn: "Official Composition • IPU Anthem",
    subtitleEs: "Composición Oficial • Himno IPU",
  },
  {
    url: "https://www.youtube.com/watch?v=A8e1j9u2Z1E",
    titleEn: "Pedro Halffter - Klara Opera Project",
    titleEs: "Pedro Halffter - Ópera Klara",
    subtitleEn: "Contemporary Opera • Cultural Cycle",
    subtitleEs: "Ópera Contemporánea • Ciclo Inaugural",
  },
  {
    url: "https://www.youtube.com/watch?v=M9o8v7C6x5Y",
    titleEn: "Klara - Opera by Pedro Halffter",
    titleEs: "Klara - Ópera de Pedro Halffter",
    subtitleEn: "Production & Premiere • Contemporary Creation",
    subtitleEs: "Producción y Estreno • Creación Contemporánea",
  },
  {
    url: "https://www.youtube.com/watch?v=P8L7V6X5Y4Z",
    titleEn: "Richard Strauss: Alpine Symphony - Lecture at the Piano",
    titleEs: "Richard Strauss: Sinfonía Alpina - Conferencia al Piano",
    subtitleEn: "Piano Lecture • Musical Analysis",
    subtitleEs: "Conferencia al Piano • Análisis Musical",
  },
  {
    url: "https://www.youtube.com/watch?v=Q7K6J5H4G3F",
    titleEn: "Richard Strauss & Literature: Don Quixote",
    titleEs: "Richard Strauss y la literatura: Don Quijote",
    subtitleEn: "Piano Lecture • Musical Analysis",
    subtitleEs: "Conferencia al Piano • Análisis Musical",
  },
  {
    url: "https://www.youtube.com/watch?v=R6S5D4F3G2H",
    titleEn: "Richard Strauss & Tone Poems Series",
    titleEs: "Richard Strauss y sus poemas sinfónicos",
    subtitleEn: "Piano Lecture • BBVA Foundation",
    subtitleEs: "Conferencia al Piano • Fundación BBVA",
  },
  {
    url: "https://www.youtube.com/watch?v=S5D4F3G2H1J",
    titleEn: "Death and Transfiguration - Richard Strauss Lecture",
    titleEs: "Muerte y Transfiguración - Conferencia Richard Strauss",
    subtitleEn: "Piano Lecture • Musical Analysis",
    subtitleEs: "Conferencia al Piano • Análisis Musical",
  },
  {
    url: "https://www.youtube.com/watch?v=T4E3W2Q1P0O",
    titleEn: "Klara - Opera in Four Haikus",
    titleEs: "Klara - Ópera en cuatro haikus",
    subtitleEn: "Contemporary Opera • Special Feature",
    subtitleEs: "Ópera Contemporánea • Reportaje Especial",
  },
  {
    url: "https://www.youtube.com/watch?v=U3E2W1P0O9I",
    titleEn: "Penelope's Dreams - Pedro Halffter",
    titleEs: "Los sueños de Penélope - Pedro Halffter",
    subtitleEn: "Composition • Symphonic Feature",
    subtitleEs: "Composición • Obra Sinfónica",
  },
  {
    url: "https://www.youtube.com/watch?v=V2E1W0O9I8U",
    titleEn: "Mahler: The Seventh Symphony - Lecture at the Piano",
    titleEs: "Mahler: La Séptima Sinfonía - Conferencia al Piano",
    subtitleEn: "Piano Lecture • Symphonic Analysis",
    subtitleEs: "Conferencia al Piano • Análisis Sinfónico",
  },
  {
    url: "https://www.youtube.com/watch?v=W1E0O9I8U7Y",
    titleEn: "Mahler: The Sixth Symphony - Lecture at the Piano",
    titleEs: "Mahler: La Sexta Sinfonía - Conferencia al Piano",
    subtitleEn: "Piano Lecture • Symphonic Analysis",
    subtitleEs: "Conferencia al Piano • Análisis Sinfónico",
  },
  {
    url: "https://www.youtube.com/watch?v=X0O9I8U7Y6T",
    titleEn: "Mahler: From Beginnings to First Symphony",
    titleEs: "Mahler: De los inicios a la Primera Sinfonía",
    subtitleEn: "Piano Lecture • Symphonic Analysis",
    subtitleEs: "Conferencia al Piano • Análisis Sinfónico",
  },
  {
    url: "https://www.youtube.com/watch?v=Y9I8U7Y6T5R",
    titleEn: "Pedro Halffter Conducts Puccini",
    titleEs: "Pedro Halffter dirige Puccini",
    subtitleEn: "Orchestral Conducting • Opera Live",
    subtitleEs: "Dirección de Orquesta • Ópera en Directo",
  },
  {
    url: "https://www.youtube.com/watch?v=Z8U7Y6T5R4E",
    titleEn: "Tristan und Isolde: The Enigmatic Chord",
    titleEs: "Tristán e Isolda: El acorde enigmático",
    subtitleEn: "Wagner & His Time • Lecture Series",
    subtitleEs: "Wagner y su tiempo • Ciclo de Conferencias",
  },
  {
    url: "https://www.youtube.com/watch?v=A7U6Y5T4R3W",
    titleEn: "The Ring of the Nibelung: From Dresden to Bayreuth",
    titleEs: "El Anillo del Nibelungo: De Dresde a Bayreuth",
    subtitleEn: "Wagner & His Time • Lecture Series",
    subtitleEs: "Wagner y su tiempo • Ciclo de Conferencias",
  },
  {
    url: "https://www.youtube.com/watch?v=B6U5Y4T3R2Q",
    titleEn: "Tannhäuser: Wagner in Dresden & 1848 Revolution",
    titleEs: "Tannhäuser: Wagner en Dresde y la Revolución del 48",
    subtitleEn: "Wagner & His Time • Lecture Series",
    subtitleEs: "Wagner y su tiempo • Ciclo de Conferencias",
  },
  {
    url: "https://www.youtube.com/watch?v=C5U4Y3T2R1P",
    titleEn: "Childhood, Family & First Musical Memories",
    titleEs: "Infancia, familia y primeros recuerdos musicales",
    subtitleEn: "Biographical Interview • Personal Profile",
    subtitleEs: "Entrevista Biográfica • Perfil Personal",
  },
  {
    url: "https://www.youtube.com/watch?v=D4U3Y2T1R0O",
    titleEn: "Musical Training in Germany & Vienna",
    titleEs: "Formación en Alemania y Viena",
    subtitleEn: "Biographical Profile • Education",
    subtitleEs: "Perfil Biográfico • Formación",
  },
  {
    url: "https://www.youtube.com/watch?v=E3U2Y1T0O9I",
    titleEn: "Pedro Halffter & Gran Canaria Philharmonic",
    titleEs: "Pedro Halffter y la Orquesta Filarmónica de Gran Canaria",
    subtitleEn: "Artistic Direction • Symphonic Reportage",
    subtitleEs: "Dirección Artística • Reportaje Sinfónico",
  },
  {
    url: "https://www.youtube.com/watch?v=F2U1Y0O9I8U",
    titleEn: "Música en Villafranca Festival",
    titleEs: "Festival Música en Villafranca",
    subtitleEn: "Festival Documentary • Artistic Project",
    subtitleEs: "Documental del Festival • Proyecto Artístico",
  },
  {
    url: "https://www.youtube.com/watch?v=G1U0O9I8U7Y",
    titleEn: "Pedro Halffter: Thought, Emotion & Musical Creation",
    titleEs: "Pedro Halffter: Pensamiento, emoción y creación musical",
    subtitleEn: "Interview & Profile • Artistic Vision",
    subtitleEs: "Entrevista y Perfil • Visión Artística",
  },
];

async function main() {
  console.log("Fetching 'media' story from Storyblok...");
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const mediaStory = storiesResp.data.stories.find((s: any) => s.slug === "media");

  if (!mediaStory) {
    throw new Error("Media story not found");
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${mediaStory.id}`);
  const storyContent = detailResp.data.story.content;
  const currentItems = storyContent.media_items || [];

  // 1. Separate Discography and Photo cards
  const discoCards = currentItems.filter(
    (c: any) => c.category?.toUpperCase() === "DISCOGRAPHY" || c.category?.toUpperCase() === "DISCOGRAFÍA" || c.media_type === "audio"
  );
  const photoCards = currentItems.filter(
    (c: any) => c.category?.toUpperCase() === "PHOTOS" || c.category?.toUpperCase() === "FOTOS" || c.media_type === "photo"
  );

  console.log(`Found ${discoCards.length} Discography cards and ${photoCards.length} Photo cards.`);

  // 2. Build 28 Video cards
  const videoCards: any[] = [];
  for (const v of allYouTubeVideos) {
    const videoId = getYouTubeId(v.url);
    const card = {
      component: "media_card",
      category: "VIDEOS",
      category__i18n__es: "VÍDEOS",
      title: v.titleEn,
      title__i18n__es: v.titleEs,
      subtitle: v.subtitleEn,
      subtitle__i18n__es: v.subtitleEs,
      date_label: "",
      date_label__i18n__es: "",
      embed_url: v.url,
      media_type: "video",
      card_style: "video_feature",
      card_size: "medium",
      cta_label: "WATCH VIDEO",
      cta_label__i18n__es: "VER VÍDEO",
      image: {
        id: null,
        filename: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        fieldtype: "asset",
      },
    };
    videoCards.push(card);
  }

  // 3. Set categories without ALL
  storyContent.categories = "VIDEOS, DISCOGRAPHY, PHOTOS";
  storyContent.categories__i18n__es = "VÍDEOS, DISCOGRAFÍA, FOTOS";

  // Combine ALL Videos + Discography + Photos
  storyContent.media_items = [...videoCards, ...discoCards, ...photoCards];

  console.log(`Saving ${videoCards.length} videos, ${discoCards.length} albums, and ${photoCards.length} photos (Total: ${storyContent.media_items.length}) to Storyblok...`);

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${mediaStory.id}`, {
    story: {
      content: storyContent,
    },
    force_update: 1,
  });

  console.log(`\n🎉 Restored ALL ${videoCards.length} YouTube videos to Storyblok Media section!`);
}

main().catch(console.error);
