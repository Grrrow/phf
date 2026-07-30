// scripts/update-seo-fields.ts
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

const seoContentMap = {
  home: {
    title: "Pedro Halffter | Compositor y Director de Orquesta",
    description: "Pedro Halffter, reconocido director de orquesta y compositor español. Explora su trayectoria, discografía, vídeos y conciertos. Descubre su legado musical.",
    og_title: "Pedro Halffter | Compositor y Director de Orquesta",
    og_description: "Pedro Halffter, reconocido director de orquesta y compositor español. Explora su trayectoria y legado musical.",
    twitter_title: "Pedro Halffter | Compositor y Director de Orquesta",
    twitter_description: "Pedro Halffter, reconocido director de orquesta y compositor español. Explora su trayectoria y legado musical.",
  },
  biography: {
    title: "Biografía | Pedro Halffter",
    description: "Conoce la biografía y trayectoria artística de Pedro Halffter. Director artístico de prestigiosos teatros y festivales, y compositor de obras sinfónicas aclamadas mundialmente.",
    og_title: "Biografía | Pedro Halffter",
    og_description: "Conoce la biografía y trayectoria artística de Pedro Halffter. Director artístico de prestigiosos teatros y compositor aclamado.",
    twitter_title: "Biografía | Pedro Halffter",
    twitter_description: "Conoce la biografía y trayectoria artística de Pedro Halffter. Director artístico y compositor aclamado.",
  },
  media: {
    title: "Media | Vídeos, Fotos y Discografía de Pedro Halffter",
    description: "Descubre el archivo multimedia de Pedro Halffter. Escucha sus últimas grabaciones, visualiza actuaciones en directo y explora su galería fotográfica oficial.",
    og_title: "Media | Pedro Halffter",
    og_description: "Descubre el archivo multimedia de Pedro Halffter: vídeos, fotos y discografía oficial.",
    twitter_title: "Media | Pedro Halffter",
    twitter_description: "Descubre el archivo multimedia de Pedro Halffter: vídeos, fotos y discografía oficial.",
  },
  contact: {
    title: "Contacto | Pedro Halffter",
    description: "Ponte en contacto con el equipo de management y relaciones públicas de Pedro Halffter. Accede a recursos de prensa y síguelo en redes sociales.",
    og_title: "Contacto | Pedro Halffter",
    og_description: "Ponte en contacto con el equipo de Pedro Halffter. Prensa, management y redes sociales.",
    twitter_title: "Contacto | Pedro Halffter",
    twitter_description: "Ponte en contacto con el equipo de Pedro Halffter. Prensa, management y redes sociales.",
  },
};

async function main() {
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  
  for (const story of storiesResp.data.stories) {
    const slug = story.slug;
    if (seoContentMap[slug]) {
      console.log(`Updating SEO for story: ${slug} (${story.id})`);
      
      const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${story.id}`);
      const storyContent = detailResp.data.story.content;
      
      const seoData = seoContentMap[slug];
      
      storyContent.seo = [
        {
          _uid: storyContent.seo?.[0]?._uid || Math.random().toString(36).substr(2, 9),
          component: "seo",
          title: seoData.title,
          description: seoData.description,
          og_title: seoData.og_title,
          og_description: seoData.og_description,
          twitter_title: seoData.twitter_title,
          twitter_description: seoData.twitter_description,
        }
      ];

      await Storyblok.put(`spaces/${SPACE_ID}/stories/${story.id}`, {
        story: {
          content: storyContent,
        },
        force_update: 1,
      });
      
      console.log(`✅ SEO updated for ${slug}`);
    }
  }
  console.log("All matching stories updated.");
}

main().catch(console.error);
