import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StoryblokClient from 'storyblok-js-client';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const schemasDir = path.join(rootDir, 'storyblok/components/schemas');

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

const spaceId = process.env.STORYBLOK_SPACE_ID?.replace(/^#/, '').trim();
const oauthToken = process.env.STORYBLOK_MANAGEMENT_TOKEN?.trim();

if (!spaceId || !oauthToken) {
  console.error('❌ Missing STORYBLOK_SPACE_ID or STORYBLOK_MANAGEMENT_TOKEN in .env');
  process.exit(1);
}

const Storyblok = new StoryblokClient({
  oauthToken: oauthToken,
});

async function run() {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('⚠️ You are about to push schemas to Storyblok Management API. This will overwrite existing schemas. Are you sure? (y/N): ');
  rl.close();

  if (answer.toLowerCase() !== 'y') {
    console.log('Push aborted.');
    process.exit(0);
  }

  if (!fs.existsSync(schemasDir)) {
    console.log('No schemas directory found.');
    return;
  }

  const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'));

  let existingComponents: any[] = [];
  try {
    console.log('Fetching existing components from Storyblok...');
    const response = await Storyblok.get(`spaces/${spaceId}/components`);
    if (!response.data || !response.data.components) {
      console.log('Unexpected API response:', response.data);
      existingComponents = Array.isArray(response.data) ? response.data : [];
    } else {
      existingComponents = response.data.components;
    }
  } catch (error: any) {
    console.error('❌ Failed to fetch existing components:', error.response?.data || error.message);
    process.exit(1);
  }

  for (const file of files) {
    const filePath = path.join(schemasDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const schemaObj = JSON.parse(content);
    const name = schemaObj.component.name;

    const existing = existingComponents.find(c => c.name === name);

    try {
      if (existing) {
        console.log(`Updating component: ${name} (ID: ${existing.id})`);
        await Storyblok.put(`spaces/${spaceId}/components/${existing.id}`, schemaObj);
      } else {
        console.log(`Creating component: ${name}`);
        await Storyblok.post(`spaces/${spaceId}/components`, schemaObj);
      }
    } catch (error: any) {
      console.error(`❌ Failed to push ${name}:`, error.response?.data || error.message);
    }
  }

  console.log('✅ Push complete.');
}

run();
