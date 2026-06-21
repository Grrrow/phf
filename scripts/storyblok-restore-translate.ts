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

const dict: Record<string, string> = {
  "Mahler: Symphony No. 9": "Mahler: Sinfonía No. 9",
  "Tickets / Info": "Entradas / Info",
  "Wagner: Tristan und Isolde (Prelude) & Bruckner 7": "Wagner: Tristán e Isolda (Preludio) y Bruckner 7",
  "Contemporary Works: Halffter & Ligeti": "Obras Contemporáneas: Halffter y Ligeti",
  "Strauss: Elektra": "Strauss: Elektra",
  "Sold Out": "Agotado",
  "Operas": "Óperas",
  "Symphonic Works": "Obras Sinfónicas",
  "Pedro Halffter is a renowned conductor and composer, recognized internationally for his passionate interpretations and profound musical understanding.": "Pedro Halffter es un reconocido director y compositor, aclamado internacionalmente por sus apasionadas interpretaciones y su profundo conocimiento musical.",
  "A Life in Movement.": "Una Vida en Movimiento.",
  "Born in Madrid, Pedro Halffter Caro has forged an international career conducting some of the world's most prestigious orchestras. His meticulous attention to detail and ability to breathe new life into classic masterpieces has earned him critical acclaim globally.": "Nacido en Madrid, Pedro Halffter Caro ha forjado una carrera internacional dirigiendo algunas de las orquestas más prestigiosas del mundo. Su meticulosa atención al detalle y su capacidad para dar nueva vida a las obras maestras clásicas le han valido el reconocimiento de la crítica a nivel mundial.",
  "Beyond the podium, his work as a composer reveals a deeply emotional connection to contemporary narratives, exploring the limits of orchestral colors.": "Más allá del podio, su trabajo como compositor revela una profunda conexión emocional con narrativas contemporáneas, explorando los límites de los colores orquestales.",
  "The Architect of Sound": "El Arquitecto del Sonido",
  "Principal Guest Conductor": "Director Invitado Principal",
  "Artistic Director": "Director Artístico",
  "Career Highlights": "Hitos de su Carrera",
  "Pedro Halffter | Conductor & Composer": "Pedro Halffter | Director y Compositor",
  "Official website of Pedro Halffter, Spanish conductor and composer. Discover his symphonic works, operas, biography, and upcoming performances.": "Sitio web oficial de Pedro Halffter, director y compositor español. Descubra sus obras sinfónicas, óperas, biografía y próximas actuaciones.",
  "Official website of Pedro Halffter, Spanish conductor and composer.": "Sitio web oficial de Pedro Halffter, director y compositor español.",
  "Orchestrating Silence & Sound": "Orquestando Silencio y Sonido",
  "Pedro Halffter's approach to conducting is an exploration of the spaces between notes. A prestigious, minimalist vision for contemporary and classical repertoire.": "El enfoque de la dirección de Pedro Halffter es una exploración de los espacios entre las notas. Una visión prestigiosa y minimalista para el repertorio contemporáneo y clásico.",
  "DISCOVER BIOGRAPHY": "DESCUBRIR BIOGRAFÍA",
  "Upcoming Highlights": "Próximos Destacados",
  "Selected performances and engagements.": "Actuaciones y compromisos seleccionados.",
  "See the gala": "Ver la gala",
  "Details": "Detalles",
  "Home": "Inicio",
  "Biography": "Biografía",
  "Works": "Obras",
  "Agenda": "Agenda",
  "Alongside his career as a conductor, Pedro Halffter has developed a distinguished profile as a composer. His works have been premiered by ensembles such as the Massachusetts Symphony Orchestra, the Deutsche Kammerakademie, the Stuttgart Chamber Orchestra, Ensemble Intercontemporain, the Schleswig-Holstein Festival Orchestra and the New Japan Philharmonic Orchestra, in venues including Carnegie Hall in New York, the Auditorio Nacional de Música in Madrid and the Konzerthaus Dortmund.\n\nHis catalogue reflects a deep interest in the dialogue between music, memory and other artistic disciplines. He has devoted particular attention to the legacy of Viktor Ullmann, creating arrangements and new works connected to Der Kaiser von Atlantis, as well as homage pieces such as Dalí and Beethoven, Homage to Beethoven, Thank You, Mr. Joyce and Proteo, premiered in 2022 by the Madrid Symphony Orchestra.": "Junto a su carrera como director, Pedro Halffter ha desarrollado un distinguido perfil como compositor. Sus obras han sido estrenadas por formaciones como la Orquesta Sinfónica de Massachusetts, la Kammerakademie Alemana, la Orquesta de Cámara de Stuttgart, Ensemble Intercontemporain, la Orquesta del Festival de Schleswig-Holstein y la Nueva Orquesta Filarmónica de Japón, en recintos como el Carnegie Hall de Nueva York, el Auditorio Nacional de Música de Madrid y el Konzerthaus Dortmund.\n\nSu catálogo refleja un profundo interés en el diálogo entre la música, la memoria y otras disciplinas artísticas. Ha dedicado especial atención al legado de Viktor Ullmann, creando arreglos y nuevas obras conectadas con Der Kaiser von Atlantis, así como piezas homenaje como Dalí y Beethoven, Homenaje a Beethoven, Thank You, Mr. Joyce y Proteo, estrenado en 2022 por la Orquesta Sinfónica de Madrid.",
  "Rehersall": "Ensayo",
  "Jury in ópera & Music": "Jurado en Ópera y Música",
  "Richard Strauss | Don Quixote“ op. 35 (recomposed by Pedro Halffter) / Pedro Halffter | Klavierquartett \"Hommage an Dali und Beethoven\"": "Richard Strauss | Don Quixote“ op. 35 (recompuesto por Pedro Halffter) / Pedro Halffter | Cuarteto con Piano \"Homenaje a Dalí y Beethoven\"",
  "Pedro Halffter | Winterreise (recomposed by Pedro Halffter)  - Richard Strauss | Metamorphosen": "Pedro Halffter | Winterreise (recompuesto por Pedro Halffter) - Richard Strauss | Metamorfosis"
};

function translateObj(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(translateObj);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = { ...obj };
    for (const key of Object.keys(obj)) {
      if (key.includes('__i18n__')) continue;
      if (key.startsWith('_') || key === 'component') continue;
      
      const val = obj[key];
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (dict[trimmed]) {
          newObj[`${key}__i18n__es`] = val.replace(trimmed, dict[trimmed]);
        }
      } else if (typeof val === 'object' && val !== null) {
        if (val.type === 'doc') {
          // Rich text translation
          const strVal = JSON.stringify(val);
          let translatedStr = strVal;
          for (const [en, es] of Object.entries(dict)) {
            translatedStr = translatedStr.split(JSON.stringify(en)).join(JSON.stringify(es));
          }
          if (translatedStr !== strVal) {
            newObj[`${key}__i18n__es`] = JSON.parse(translatedStr);
          }
        } else if (!Array.isArray(val) && val.linktype) {
           // Ignore links
        } else if (Array.isArray(val)) {
           newObj[key] = val.map(translateObj);
        } else {
           newObj[key] = translateObj(val);
        }
      }
    }
    return newObj;
  }
  return obj;
}

async function main() {
  const file = fs.readFileSync(path.join(__dirname, 'exported_stories.json'), 'utf-8');
  // Usamos el archivo de backup con el ingles intocable
  const exported = JSON.parse(file);

  for (const story of exported) {
    if (story.name === 'Settings') continue;

    console.log(`Restoring English and injecting Spanish for: ${story.name}...`);
    try {
      const originalEnglishContent = story.content;
      const translatedContent = translateObj(originalEnglishContent);

      await Storyblok.put(`spaces/${SPACE_ID}/stories/${story.id}`, {
        story: {
          content: translatedContent
        }
      });
      console.log(`✅ Restored English & injected Spanish for ${story.name}`);
    } catch (e: any) {
      console.error(`❌ Error with ${story.name}:`, e.response?.data || e.message);
    }
  }
}

main();
