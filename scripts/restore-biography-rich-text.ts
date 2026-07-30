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

/**
 * Parses markdown inline syntax (**bold** and [text](url)) into Storyblok RichText doc.
 */
function markdownToStoryblokDoc(mdText: string) {
  const paragraphs = mdText.split('\n\n').filter(Boolean);

  const docContent = paragraphs.map(p => {
    const inlineNodes: any[] = [];
    // Regex matches **bold** or [text](url) or regular text
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(p)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        inlineNodes.push({
          type: 'text',
          text: p.substring(lastIndex, match.index)
        });
      }

      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        // Bold token
        const boldText = token.slice(2, -2);
        inlineNodes.push({
          type: 'text',
          text: boldText,
          marks: [{ type: 'bold' }]
        });
      } else if (token.startsWith('[') && token.includes('](')) {
        // Link token: [label](url)
        const label = token.substring(1, token.indexOf(']('));
        const url = token.substring(token.indexOf('](') + 2, token.length - 1);
        inlineNodes.push({
          type: 'text',
          text: label,
          marks: [
            { type: 'bold' },
            {
              type: 'link',
              attrs: {
                href: url,
                target: '_blank',
                linktype: 'url'
              }
            }
          ]
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < p.length) {
      inlineNodes.push({
        type: 'text',
        text: p.substring(lastIndex)
      });
    }

    return {
      type: 'paragraph',
      content: inlineNodes
    };
  });

  return {
    type: 'doc',
    content: docContent
  };
}

async function main() {
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const bioStory = storiesResp.data.stories.find((s: any) => s.slug === 'biography');

  if (!bioStory) {
    console.error("Biography story not found!");
    return;
  }

  const res = await Storyblok.get(`spaces/${SPACE_ID}/stories/${bioStory.id}`);
  const content = res.data.story.content;

  // 1. Hero section
  const hero = content.body.find((b: any) => b.component === 'biography_hero_section');
  if (hero) {
    hero.text = markdownToStoryblokDoc(
      "A conductor of vast international experience and a composer of singular voice, **Pedro Halffter Caro** represents a bridge between the **great European symphonic tradition** and contemporary creation. His career spans leading premier orchestras and opera houses worldwide, creating acclaimed compositions and innovative symphonic arrangements."
    );
    hero.text__i18n__es = markdownToStoryblokDoc(
      "Director de orquesta de dilatada trayectoria internacional y compositor de voz singular, **Pedro Halffter Caro** representa un puente entre la **gran tradición sinfónica europea** y la creación contemporánea. Su carrera abarca la dirección de las principales orquestas y teatros de ópera del mundo, la creación de aclamadas composiciones y la realización de innovadoras versiones sinfónicas."
    );
  }

  // 2. Section: Conducting Career
  const section1 = content.body.find((b: any) => b.component === 'image_text_section' && b.title?.includes('Vienna'));
  if (section1) {
    section1.text = markdownToStoryblokDoc(
      "His career has taken his baton to some of the world’s greatest musical centers. From the **Musikverein** in Vienna, the **Konzerthaus** and **Philharmonie** in Berlin to the **Queen Elizabeth Hall** in London, the **Théâtre du Châtelet** in Paris, and the **Teatro Real** in Madrid, Pedro Halffter has built a career connecting major European musical traditions.\n\nHis presence extends to iconic venues including the **Bayerische Staatsoper** and **Munich Opera Festival**, the **Staatsoper Unter den Linden**, the **Großes Festspielhaus** in Salzburg, the **Gran Teatre del Liceu**, **Teatro Verdi** in Trieste, **Tchaikovsky Concert Hall** in Moscow, **National Centre for the Performing Arts** in Beijing, **Tokyo Opera City Concert Hall**, and **Shanghai Concert Hall**. Across these stages, he addresses both symphonic and operatic repertoire with structural depth, dramatic impulse, and first-hand compositional insight."
    );
    section1.text__i18n__es = markdownToStoryblokDoc(
      "Su trayectoria ha llevado su batuta a algunos de los grandes centros musicales del mundo. Desde el **Musikverein de Viena**, la **Konzerthaus** y la **Philharmonie de Berlín** hasta el **Queen Elizabeth Hall de Londres**, el **Théâtre du Châtelet de París** o el **Teatro Real de Madrid**, Pedro Halffter ha desarrollado una carrera que conecta las principales tradiciones musicales europeas.\n\nSu presencia se extiende también a escenarios como la **Bayerische Staatsoper** y el **Festival de Ópera de Múnich**, la **Staatsoper Unter den Linden**, el **Großes Festspielhaus de Salzburgo**, el **Gran Teatre del Liceu**, el **Teatro Verdi de Trieste**, la **Sala Chaikovski de Moscú**, el **National Centre for the Performing Arts de Pekín**, la **Tokyo Opera City Concert Hall** y la **Shanghai Concert Hall**. En cada uno de ellos ha abordado el repertorio sinfónico y operístico desde una mirada en la que conviven profundidad estructural, impulso teatral y conocimiento directo de la composición."
    );
  }

  // 3. Section: Composition & Arrangements (With Schott Music Link & Bolds)
  const section2 = content.body.find((b: any) => b.component === 'image_text_section' && (b.title?.includes('Creation') || b.title__i18n__es?.includes('Creación')));
  if (section2) {
    const schottUrl = "https://www.schott-music.com/en/person/index/perform/artist_id/62575";
    section2.text = markdownToStoryblokDoc(
      `As a composer, Pedro Halffter has built an extensive catalogue spanning opera, symphonic music, and chamber works, published by [Schott Music](${schottUrl}).\n\nKey works include his opera **Klara**, premiered in 2022 and staged at the Auditorio Nacional in Madrid, as well as symphonic works like **Proteo**, **Thank You Mr. Joyce**, and his new opera **La Lettre au général Franco** set for a 2027 world premiere in Montréal. Additionally, he has developed a celebrated facet as an arranger and orchestrator, creating acclaimed symphonic versions of Wagner (**Tannhäuser**, **Siegfried**, **Götterdämmerung**, **Parsifal**), Beethoven's **Ninth Symphony** for chamber ensemble, and Viktor Ullmann's **Der Kaiser von Atlantis**, premiered at the Teatro Real in Madrid in 2015.`
    );
    section2.text__i18n__es = markdownToStoryblokDoc(
      `Como compositor, Pedro Halffter ha desarrollado un catálogo extenso que abarca ópera, música sinfónica y obras de cámara, editado por [Schott Music](${schottUrl}).\n\nEntre sus obras destacan la ópera **Klara**, estrenada en 2022 y presentada en el Auditorio Nacional de Madrid, piezas sinfónicas como **Proteo** y **Thank You Mr. Joyce**, y su nueva ópera **La Lettre au général Franco** para su estreno mundial en Montreal en 2027. Asimismo, ha desarrollado una aclamada faceta como arreglista u orquestador, creando versiones sinfónicas de Wagner (**Tannhäuser**, **Siegfried**, **El ocaso de los dioses**, **Parsifal**), la **Novena Sinfonía de Beethoven** para conjunto de cámara, y **Der Kaiser von Atlantis** de Viktor Ullmann, estrenada en el Teatro Real de Madrid en 2015.`
    );
  }

  // 4. Section: Leadership & Villafranca
  const section3 = content.body.find((b: any) => b.component === 'image_text_section' && (b.title?.includes('Institutions') || b.title__i18n__es?.includes('Dirección')));
  if (section3) {
    section3.text = markdownToStoryblokDoc(
      "Pedro Halffter served as Artistic Director of the **Real Orquesta Sinfónica de Sevilla** (2004–2014), Artistic Director of the **Teatro de la Maestranza** in Seville (2004–2018), and Principal Conductor of the **Orquesta Filarmónica de Gran Canaria** (2004–2016).\n\nCurrently, he is the Artistic Director of the **Festival Música en Villafranca**, transforming Villafranca del Bierzo into a vibrant center for contemporary music, chamber recitals, and operatic masterclasses."
    );
    section3.text__i18n__es = markdownToStoryblokDoc(
      "Pedro Halffter ha sido Director Artístico de la **Real Orquesta Sinfónica de Sevilla** (2004–2014), Director Artístico del **Teatro de la Maestranza de Sevilla** (2004–2018) y Director Titular de la **Orquesta Filarmónica de Gran Canaria** (2004–2016).\n\nEn la actualidad, es el Director Artístico del **Festival Música en Villafranca**, convirtiendo Villafranca del Bierzo en un centro vibrante para la música contemporánea, recitales de cámara y clases magistrales de ópera."
    );
  }

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${bioStory.id}`, {
    story: { content: content },
    force_update: 1
  });

  console.log("✅ Successfully restored bold formatting and Schott Music link to Biography in Storyblok!");
}

main().catch(err => console.error(err));
