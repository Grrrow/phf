import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const blockName = process.argv[2];

if (!blockName) {
  console.error('❌ Please provide a block name. Example: pnpm storyblok:create-block hero_section');
  process.exit(1);
}

if (!/^[a-z0-9_]+$/.test(blockName)) {
  console.error('❌ Block name must be in snake_case (e.g., hero_section).');
  process.exit(1);
}

const pascalName = blockName
  .split('_')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

const schemaPath = path.join(rootDir, 'storyblok/components/schemas', `${blockName}.json`);
const astroPath = path.join(rootDir, 'src/components/storyblok', `${pascalName}.astro`);
const docPath = path.join(rootDir, 'storyblok/components/docs', `${blockName}.md`);
const componentsTsPath = path.join(rootDir, 'src/storyblok/components.ts');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function checkExists(filePath: string): Promise<boolean> {
  if (fs.existsSync(filePath)) {
    const answer = await rl.question(`⚠️  File ${path.relative(rootDir, filePath)} already exists. Overwrite? (y/N) `);
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborting.');
      return true;
    }
  }
  return false;
}

async function run() {
  if (await checkExists(schemaPath)) process.exit(1);
  if (await checkExists(astroPath)) process.exit(1);
  if (await checkExists(docPath)) process.exit(1);

  const displayName = blockName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // 1. Create JSON Schema
  const schemaObj = {
    component: {
      name: blockName,
      display_name: displayName,
      is_nestable: true,
      is_root: false,
      schema: {
        title: {
          type: "text",
          pos: 0,
          translatable: true
        },
        description: {
          type: "textarea",
          pos: 1,
          translatable: true
        }
      }
    }
  };
  fs.mkdirSync(path.dirname(schemaPath), { recursive: true });
  fs.writeFileSync(schemaPath, JSON.stringify(schemaObj, null, 2) + '\n');
  console.log(`✅ Created schema: ${path.relative(rootDir, schemaPath)}`);

  // 2. Create Astro Component
  const astroContent = `---
import { storyblokEditable } from '@storyblok/astro';
const { blok } = Astro.props;
---

<section {...storyblokEditable(blok)}>
  {blok.title && <h2>{blok.title}</h2>}
  {blok.description && <p>{blok.description}</p>}
</section>
`;
  fs.mkdirSync(path.dirname(astroPath), { recursive: true });
  fs.writeFileSync(astroPath, astroContent);
  console.log(`✅ Created component: ${path.relative(rootDir, astroPath)}`);

  // 3. Create Markdown Doc
  const docContent = `# ${displayName}

## Uso
Describe para qué sirve este bloque.

## Campos
- \`title\`: título principal.
- \`description\`: texto descriptivo.

## Notas de implementación
Este bloque se renderiza con el componente Astro correspondiente.
`;
  fs.mkdirSync(path.dirname(docPath), { recursive: true });
  fs.writeFileSync(docPath, docContent);
  console.log(`✅ Created documentation: ${path.relative(rootDir, docPath)}`);

  // 4. Update components.ts map
  let componentsContent = fs.readFileSync(componentsTsPath, 'utf-8');
  const mapEntry = `${blockName}: 'components/storyblok/${pascalName}'`;

  if (!componentsContent.includes(` ${blockName}: `)) {
    componentsContent = componentsContent.replace(/export const storyblokComponents = \{([\s\S]*?)\};/, (match, inner) => {
      const entries = inner.split('\n').map(l => l.trim().replace(/,$/, '')).filter(l => l);
      entries.push(mapEntry);
      // Sort alphabetically
      entries.sort((a, b) => a.localeCompare(b));
      
      const formattedEntries = entries.map(e => `  ${e},`).join('\n');
      return `export const storyblokComponents = {\n${formattedEntries}\n};`;
    });
    fs.writeFileSync(componentsTsPath, componentsContent);
    console.log(`✅ Registered component in: ${path.relative(rootDir, componentsTsPath)}`);
  }

  rl.close();
}

run();
