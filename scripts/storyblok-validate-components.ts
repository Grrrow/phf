import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const schemasDir = path.join(rootDir, 'storyblok/components/schemas');
const docsDir = path.join(rootDir, 'storyblok/components/docs');
const astroComponentsDir = path.join(rootDir, 'src/components/storyblok');

const isSnakeCase = (str: string) => /^[a-z0-9_]+$/.test(str);

const toPascalCase = (str: string) =>
  str.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');

function run() {
  if (!fs.existsSync(schemasDir)) {
    console.log('No schemas directory found. Validation passed.');
    return;
  }

  const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'));
  let hasErrors = false;
  const seenNames = new Set<string>();

  for (const file of files) {
    const filePath = path.join(schemasDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    let schemaObj;

    try {
      schemaObj = JSON.parse(content);
    } catch (e) {
      console.error(`❌ [${file}] Invalid JSON.`);
      hasErrors = true;
      continue;
    }

    if (!schemaObj.component || !schemaObj.component.name) {
      console.error(`❌ [${file}] Missing component.name.`);
      hasErrors = true;
      continue;
    }

    const name = schemaObj.component.name;
    const baseFileName = file.replace('.json', '');

    if (name !== baseFileName) {
      console.error(`❌ [${file}] File name does not match component.name (${name}).`);
      hasErrors = true;
    }

    if (!isSnakeCase(name)) {
      console.error(`❌ [${file}] Component name '${name}' must be in snake_case.`);
      hasErrors = true;
    }

    if (seenNames.has(name)) {
      console.error(`❌ [${file}] Duplicate component name '${name}' found.`);
      hasErrors = true;
    }
    seenNames.add(name);

    // Rule 4: Validations requested by user
    if (name === 'global_config' && !schemaObj.component.is_root) {
      console.error(`❌ [${file}] 'global_config' MUST be a root component (is_root: true).`);
      hasErrors = true;
    }
    if (name === 'seo' && !schemaObj.component.is_nestable) {
      console.error(`❌ [${file}] 'seo' MUST be a nestable component (is_nestable: true).`);
      hasErrors = true;
    }

    // Rule 5: Check translatable on common text fields (excluding technical fields)
    if (schemaObj.component.schema) {
      const nonTranslatableTextKeys = ['email', 'phone', 'url', 'audio_url', 'video_url', 'anchor_id', 'analytics_id', 'google_site_verification', 'canonical_url', 'contact_email', 'contact_phone', 'management_email', 'booking_email', 'press_email', 'brand_color'];
      
      for (const [key, field] of Object.entries<any>(schemaObj.component.schema)) {
        if ((field.type === 'text' || field.type === 'textarea') && !nonTranslatableTextKeys.includes(key)) {
          if (field.translatable !== true) {
            console.error(`❌ [${file}] Field '${key}' of type '${field.type}' is a visible text field but is missing 'translatable: true'. Add it or ignore if technical.`);
            hasErrors = true;
          }
        }
      }
    }

    // Validate fields
    if (schemaObj.component.schema) {
      for (const [fieldName, fieldDef] of Object.entries(schemaObj.component.schema)) {
        const field = fieldDef as any;
        if (!field.type) {
          console.error(`❌ [${file}] Field '${fieldName}' is missing 'type'.`);
          hasErrors = true;
        }
        if (typeof field.pos !== 'number') {
          console.error(`❌ [${file}] Field '${fieldName}' is missing 'pos' or it's not a number.`);
          hasErrors = true;
        }
      }
    }

    // Check Astro component
    const pascalName = toPascalCase(name);
    const astroFile = path.join(astroComponentsDir, `${pascalName}.astro`);
    if (!fs.existsSync(astroFile)) {
      console.error(`❌ [${file}] Missing Astro component. Expected at ${path.relative(rootDir, astroFile)}`);
      hasErrors = true;
    }

    // Check Documentation
    const docFile = path.join(docsDir, `${name}.md`);
    if (!fs.existsSync(docFile)) {
      console.error(`❌ [${file}] Missing documentation. Expected at ${path.relative(rootDir, docFile)}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\\n💥 Validation failed! Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\\n✅ All Storyblok schemas are valid.');
  }
}

run();
