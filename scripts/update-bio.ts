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

const bioES = [
  // SECTION 0
  {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { text: 'Pedro Halffter Caro es una de las figuras más singulares de la música española contemporánea. Nacido en Madrid en 1971, creció dentro de una gran tradición musical, pero desarrolló muy pronto una voz propia, cimentando una sólida carrera internacional fundamentada en sus dos grandes pasiones: la ', type: 'text' },
        { text: 'dirección de orquesta', type: 'text', marks: [{ type: 'bold' }] },
        { text: ' y la ', type: 'text' },
        { text: 'composición', type: 'text', marks: [{ type: 'bold' }] },
        { text: '.', type: 'text' }
      ]
    }]
  },
  // SECTION 1
  {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { text: 'Entre 2001 y 2004 fue principal director invitado de la ', type: 'text' },
        { text: 'Nürnberger Symphoniker', type: 'text', marks: [{ type: 'bold' }] },
        { text: ' y entre 2002 y 2003 dirigió la ', type: 'text' },
        { text: 'Orquesta de Jóvenes del Festival de Bayreuth', type: 'text', marks: [{ type: 'bold' }] },
        { text: '. Más tarde desarrolló una etapa decisiva al frente de importantes instituciones españolas: la ', type: 'text' },
        { text: 'Real Orquesta Sinfónica de Sevilla, la Orquesta Filarmónica de Gran Canaria y el Teatro de la Maestranza', type: 'text', marks: [{ type: 'bold' }] },
        { text: ', impulsando una intensa actividad sinfónica y operística, donde destacó especialmente su aclamada dirección de la tetralogía ', type: 'text' },
        { text: 'El Anillo del Nibelungo', type: 'text', marks: [{ type: 'bold' }] },
        { text: '.', type: 'text' }
      ]
    }]
  },
  // SECTION 2
  {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { text: 'Como compositor, su catálogo reúne más de una veintena de obras y títulos como Klara, Penelope’s Dream, The Letter to General Franco, The Bells of Gran Canaria o Proteo. Sus obras y proyectos han llegado a salas como el ', type: 'text' },
        { text: 'Carnegie Hall, el Auditorio Nacional de Música de Madrid o el Konzerthaus de Dortmund', type: 'text', marks: [{ type: 'bold' }] },
        { text: '. Toda su obra creativa es publicada por la prestigiosa editorial ', type: 'text' },
        { text: 'Schott Music', type: 'text', marks: [{ type: 'link', attrs: { href: 'https://www.schott-music.com/en/person/pedro-halffter', linktype: 'url', target: '_blank' } }] },
        { text: '.', type: 'text' }
      ]
    }]
  },
  // SECTION 3
  {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { text: 'Además de su profunda dedicación a la batuta y la creación musical, Halffter también dedica parte de su tiempo a la difusión cultural a través del piano, destacando sus ciclos dedicados a ', type: 'text' },
        { text: 'Wagner, Mahler y Richard Strauss', type: 'text', marks: [{ type: 'bold' }] },
        { text: ' para la Fundación BBVA.', type: 'text' }
      ]
    }]
  }
];

const bioEN = [
  // SECTION 0
  {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { text: 'Pedro Halffter Caro is one of the most unique figures in contemporary Spanish music. Born in Madrid in 1971, he grew up within a great musical tradition but soon developed his own voice, building a solid international career founded on his two great passions: ', type: 'text' },
        { text: 'orchestral conducting', type: 'text', marks: [{ type: 'bold' }] },
        { text: ' and ', type: 'text' },
        { text: 'composition', type: 'text', marks: [{ type: 'bold' }] },
        { text: '.', type: 'text' }
      ]
    }]
  },
  // SECTION 1
  {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { text: 'Between 2001 and 2004 he was principal guest conductor of the ', type: 'text' },
        { text: 'Nürnberger Symphoniker', type: 'text', marks: [{ type: 'bold' }] },
        { text: ' and between 2002 and 2003 he conducted the ', type: 'text' },
        { text: 'Bayreuth Festival Youth Orchestra', type: 'text', marks: [{ type: 'bold' }] },
        { text: '. Later, he developed a decisive period leading important Spanish institutions: the ', type: 'text' },
        { text: 'Real Orquesta Sinfónica de Sevilla, the Orquesta Filarmónica de Gran Canaria, and the Teatro de la Maestranza', type: 'text', marks: [{ type: 'bold' }] },
        { text: ', promoting intense symphonic and operatic activity, where his acclaimed conducting of ', type: 'text' },
        { text: 'The Ring of the Nibelung', type: 'text', marks: [{ type: 'bold' }] },
        { text: ' tetralogy stood out especially.', type: 'text' }
      ]
    }]
  },
  // SECTION 2
  {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { text: 'As a composer, his catalog includes more than twenty works and titles such as Klara, Penelope’s Dream, The Letter to General Franco, The Bells of Gran Canaria, or Proteo. His works and projects have reached venues such as ', type: 'text' },
        { text: 'Carnegie Hall, the National Music Auditorium in Madrid, or the Dortmund Konzerthaus', type: 'text', marks: [{ type: 'bold' }] },
        { text: '. All his creative work is published by the prestigious publisher ', type: 'text' },
        { text: 'Schott Music', type: 'text', marks: [{ type: 'link', attrs: { href: 'https://www.schott-music.com/en/person/pedro-halffter', linktype: 'url', target: '_blank' } }] },
        { text: '.', type: 'text' }
      ]
    }]
  },
  // SECTION 3
  {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [
        { text: 'In addition to his deep dedication to conducting and musical creation, Halffter also devotes part of his time to cultural dissemination through the piano, highlighting his cycles dedicated to ', type: 'text' },
        { text: 'Wagner, Mahler, and Richard Strauss', type: 'text', marks: [{ type: 'bold' }] },
        { text: ' for the BBVA Foundation.', type: 'text' }
      ]
    }]
  }
];

async function main() {
  try {
    const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
    let biographyStory = storiesResp.data.stories.find((s: any) => s.slug === 'biography' || s.name === 'Biography');

    if (!biographyStory) return console.log('Story not found');
    
    // Update Default (English)
    const detailRespEN = await Storyblok.get(`spaces/${SPACE_ID}/stories/${biographyStory.id}`);
    const contentEN = detailRespEN.data.story.content;
    const sectionsEN = contentEN.body.filter((b: any) => b.component === 'image_text_section');
    
    sectionsEN.forEach((s: any, idx: number) => {
      s.text = bioEN[idx];
    });

    await Storyblok.put(`spaces/${SPACE_ID}/stories/${biographyStory.id}`, {
      story: { content: contentEN }
    });

    // Update Spanish
    const detailRespES = await Storyblok.get(`spaces/${SPACE_ID}/stories/${biographyStory.id}`, { language: 'es' });
    const contentES = detailRespES.data.story.content;
    const sectionsES = contentES.body.filter((b: any) => b.component === 'image_text_section');
    
    sectionsES.forEach((s: any, idx: number) => {
      s.text = bioES[idx];
    });

    await Storyblok.put(`spaces/${SPACE_ID}/stories/${biographyStory.id}`, {
      story: { content: contentES },
      force_update: 1
    });
    
    console.log('✅ Biographies updated successfully');
  } catch (e: any) {
    console.error('Error:', e.response?.data || e.message);
  }
}
main();
