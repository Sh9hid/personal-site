import fs from 'node:fs';
import path from 'node:path';

const contentDir = path.join(process.cwd(), 'src', 'content', 'publish');
const outputDir = path.join(process.cwd(), 'public');

console.log('🔍 Running content validation...\n');

const REQUIRED_FIELDS = ['title', 'date', 'tags'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseFrontmatter(content) {
  const lines = content.split('\n');
  let frontmatter = {};
  let bodyStart = 0;

  if (lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        bodyStart = i + 1;
        break;
      }
      const colonIndex = lines[i].indexOf(':');
      if (colonIndex > 0) {
        const key = lines[i].slice(0, colonIndex).trim();
        let value = lines[i].slice(colonIndex + 1).trim();
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        if (key === 'tags' && value) {
          if (value.startsWith('[')) {
            try {
              frontmatter[key] = JSON.parse(value);
            } catch {
              frontmatter[key] = value.split(',').map(t => t.trim().replace(/['"]/g, ''));
            }
          } else {
            frontmatter[key] = value.split(',').map(t => t.trim());
          }
        } else {
          frontmatter[key] = value;
        }
      }
    }
  }

  return {
    frontmatter,
    body: lines.slice(bodyStart).join('\n')
  };
}

function extractWikilinks(content) {
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const links = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  
  return links;
}

const notes = [];
const errors = [];
const slugSet = new Set();

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const { frontmatter, body } = parseFrontmatter(raw);
      
      const slug = frontmatter.slug || file.replace(/\.mdx?$/, '');
      const title = frontmatter.title || slug;
      const date = frontmatter.date || '1970-01-01';
      const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
      
      // Validation
      for (const field of REQUIRED_FIELDS) {
        if (!(field in frontmatter) || frontmatter[field] === undefined || frontmatter[field] === '') {
          errors.push({
            file: fullPath,
            field,
            message: `Missing required field: ${field}`
          });
        }
      }
      
      if (frontmatter.date && !DATE_REGEX.test(frontmatter.date)) {
        errors.push({
          file: fullPath,
          field: 'date',
          message: `Invalid date format: ${frontmatter.date}. Expected YYYY-MM-DD`
        });
      }
      
      if (slugSet.has(slug)) {
        errors.push({
          file: fullPath,
          field: 'slug',
          message: `Duplicate slug: ${slug}`
        });
      }
      slugSet.add(slug);
      
      const wikilinks = extractWikilinks(body);
      
      notes.push({
        slug,
        title,
        date,
        tags,
        wikilinks,
        filePath: fullPath
      });
    }
  }
}

walkDir(contentDir);

// Second pass for wikilinks
for (const note of notes) {
  for (const link of note.wikilinks) {
    if (!slugSet.has(link)) {
      errors.push({
        file: note.filePath,
        field: 'wikilink',
        message: `Broken wikilink: [[${link}]] - target does not exist`
      });
    }
  }
}

if (errors.length > 0) {
  console.error('❌ Content validation FAILED\n');
  for (const err of errors) {
    const relPath = path.relative(process.cwd(), err.file);
    console.error(`  ${relPath}`);
    console.error(`    └─ ${err.message}\n`);
  }
  process.exit(1);
}

console.log(`✅ Validation passed: ${notes.length} notes`);

// Generate graph.json
const nodes = notes.map(note => {
  const filePath = note.filePath.toLowerCase();
  let type = 'note';
  if (filePath.includes('/builds/')) type = 'build';
  else if (filePath.includes('/projects/')) type = 'project';
  else if (filePath.includes('/reading/')) type = 'reading';
  else if (filePath.includes('/daily/')) type = 'daily';
  else if (filePath.includes('/books/')) type = 'book';

  return {
    id: note.slug,
    title: note.title,
    type,
    tags: note.tags
  };
});

const linkMap = new Map();
for (const note of notes) {
  for (const target of note.wikilinks) {
    if (slugSet.has(target)) {
      const key = [note.slug, target].sort().join('---');
      linkMap.set(key, (linkMap.get(key) || 0) + 1);
    }
  }
}

const links = [];
for (const note of notes) {
  const seenTargets = new Set();
  for (const target of note.wikilinks) {
    if (slugSet.has(target) && !seenTargets.has(target)) {
      seenTargets.add(target);
      const key = [note.slug, target].sort().join('---');
      links.push({
        source: note.slug,
        target,
        weight: linkMap.get(key) || 1
      });
    }
  }
}

const graphData = { nodes, links };

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'graph.json'),
  JSON.stringify(graphData, null, 2)
);

console.log(`📊 Graph generated: ${nodes.length} nodes, ${links.length} links`);
console.log('\n✅ Build validation complete\n');
