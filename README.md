# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## 🧱 Storyblok Local System

This repository acts as the single source of truth for Storyblok components. We use custom scripts to generate, validate, and synchronize components with Storyblok.

### Commands

- \`npm run storyblok:create-block [block_name]\`: Creates a new JSON schema, Astro component, and documentation markdown file. \`block_name\` must be in \`snake_case\`.
- \`npm run storyblok:validate\`: Validates all local schemas for correct naming, required properties (type, pos), and ensures Astro components exist.
- \`npm run storyblok:push\`: Synchronizes the local JSON schemas to the Storyblok space using the Management API. Requires environment variables.

### Workflow

1. **Create:** Run \`npm run storyblok:create-block hero_section\`.
2. **Edit Schema:** Modify \`/storyblok/components/schemas/hero_section.json\` to add your fields.
3. **Edit Component:** Modify \`/src/components/storyblok/HeroSection.astro\` to implement the design.
4. **Validate:** Run \`npm run storyblok:validate\` to ensure everything is correct.
5. **Sync:** Run \`npm run storyblok:push\` to push the schema to Storyblok.

### Environment Variables

To push to Storyblok, you need to create a \`.env\` file in the root of the project with the following variables:

\`\`\`env
STORYBLOK_SPACE_ID=your_space_id
STORYBLOK_MANAGEMENT_TOKEN=your_management_token
\`\`\`

> **Important Security Note:** The \`STORYBLOK_MANAGEMENT_TOKEN\` must **never** be exposed to the client-side code. It should only be used by the push script locally or in a CI environment.
