// Build script to compile files for production
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Copy directory recursively
const copyDir = (src, dest) => {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// Main build function
const build = async () => {
  console.log('Starting enhanced build process...');

  // Ensure build directory and subdirectories exist
  ensureDir('./build');
  ensureDir('./build/shared');
  ensureDir('./build/public');

  try {
    console.log('Creating schema.js...');

    // Create the schema.js file in the build directory
    let schemaContent = `// Auto-generated from schema.ts\n` + 
      `import { z } from 'zod';\n\n` +
      `// Login schema for admin authentication\n` +
      `export const loginSchema = z.object({\n` +
      `  username: z.string().min(1).max(50),\n` +
      `  password: z.string().min(1),\n` +
      `});\n\n` +
      `// Category schema for category management\n` +
      `export const insertCategorySchema = z.object({\n` +
      `  name: z.string().min(1).max(100),\n` +
      `  slug: z.string().min(1).max(100),\n` +
      `  description: z.string().optional(),\n` +
      `  image: z.string().optional(),\n` +
      `});\n\n` +
      `export const Category = z.object({\n` +
      `  id: z.number(),\n` +
      `  name: z.string(),\n` +
      `  slug: z.string(),\n` +
      `  description: z.string().nullable(),\n` +
      `  image: z.string().nullable()\n` +
      `});\n`;


    fs.writeFileSync('./build/shared/schema.js', schemaContent);

    console.log('Schema file created successfully');

    // Copy simplified-server.js to build directory and fix imports
    console.log('Copying simplified-server.js to build directory...');

    // Read the content of simplified-server.js
    const serverContent = fs.readFileSync('./simplified-server.js', 'utf8');

    // Make sure the paths are correct for the build version
    let modifiedServerContent = serverContent.replace(
      `const publicPath = path.join(__dirname, 'dist', 'public');`,
      `const publicPath = path.join(__dirname, 'public');`
    );

    // Write the modified content to the build directory
    fs.writeFileSync('./build/simplified-server.js', modifiedServerContent);

    // Copy the public directory to build/public
    console.log('Copying public directory to build/public...');
    copyDir('./public', './build/public');

    // Copy dist/public to build/public if it exists (merging frontend build)
    if (fs.existsSync('./dist/public')) {
      console.log('Copying frontend build from dist/public to build/public...');
      copyDir('./dist/public', './build/public');
    } else {
      console.log('Warning: Frontend build not found in dist/public');
    }

    // Create a success file to verify the build
    fs.writeFileSync('./build/build-complete.txt', `Build completed on ${new Date().toISOString()}`);

    console.log('Build completed successfully!');
    console.log('Files in build directory:');
    console.log(fs.readdirSync('./build'));
    console.log('Files in build/public directory:');
    console.log(fs.readdirSync('./build/public'));
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
};

// Run the build
build();