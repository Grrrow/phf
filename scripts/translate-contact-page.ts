// scripts/translate-contact-page.ts
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

async function main() {
  const storiesResp = await Storyblok.get(`spaces/${SPACE_ID}/stories`, { per_page: 100 });
  const contactStory = storiesResp.data.stories.find((s: any) => s.slug === "contact" || s.content?.component === "contact_page");

  if (!contactStory) {
    console.error("Contact story not found");
    return;
  }

  const detailResp = await Storyblok.get(`spaces/${SPACE_ID}/stories/${contactStory.id}`);
  const content = detailResp.data.story.content;
  console.log("Current contact content:", JSON.stringify(content, null, 2));

  // Update contact page copies in English & Spanish
  content.title = "Contact & Management";
  content.title__i18n__es = "Contacto y Representación";

  content.subtitle = "For worldwide general management, press inquiries, or direct engagement requests, please reach out via the official channels below.";
  content.subtitle__i18n__es = "Para representación general internacional, consultas de prensa o solicitudes de contratación directa, por favor póngase en contacto a través de los canales oficiales indicados a continuación.";

  if (content.quote) {
    content.quote__i18n__es = content.quote;
  }

  // Update download items if present
  if (Array.isArray(content.downloads)) {
    content.downloads.forEach((item: any) => {
      if (item.title === "High-Res Press Photos" || item.title === "Fotos de Prensa en Alta Resoluci\u00f3n") {
        item.title = "High-Res Press Photos";
        item.title__i18n__es = "Fotos de prensa en alta resolución";
        item.description = "Official promotional portraits and stage photography for press usage.";
        item.description__i18n__es = "Retratos promocionales oficiales y fotografías de escena para uso de prensa.";
      } else if (item.title === "Biography (PDF)" || item.title === "Biograf\u00eda (PDF)") {
        item.title = "Complete Biography (PDF)";
        item.title__i18n__es = "Biografía completa (PDF)";
        item.description = "Curriculum vitae and artistic summary in high quality print format.";
        item.description__i18n__es = "Curriculum vitae y resumen artístico en formato impreso de alta calidad.";
      }
    });
  }

  await Storyblok.put(`spaces/${SPACE_ID}/stories/${contactStory.id}`, {
    story: { content },
    force_update: 1,
  });

  console.log("✅ Contact page copies translated and updated in Storyblok!");
}

main().catch(console.error);
