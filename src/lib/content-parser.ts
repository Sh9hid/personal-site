import fs from 'node:fs';
import path from 'node:path';

export interface ParsedNote {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
  wikilinks: string[];
  wordCount: number;
  raw: string;
  filePath: string;
}

export interface ValidationError {
  file: string;
  field: string;
  message: string;
}

const REQUIRED_FIELDS = ['title', 'date', 'slug', 'tags'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function parseFrontmatter(content: string, filePath: string): { frontmatter: Record<string, unknown>; body: string; lineNumber: number } {
  const lines = content.split('\n');
  let frontmatter: Record<string, unknown> = {};
  let bodyStart = 0;
  let lineNumber = 0;

  if (lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        bodyStart = i + 1;
        lineNumber = i + 1;
        break;
      }
      const colonIndex = lines[i].indexOf(':');
      if (colonIndex > 0) {
        const key = lines[i].slice(0, colonIndex).trim();
        let value = lines[i].slice(colonIndex + 1).trim();
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
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
    body: lines.slice(bodyStart).join('\n'),
    lineNumber
  };
}

export function extractWikilinks(content: string): string[] {
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const links: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  
  return links;
}

export function countWords(content: string): number {
  return content.split(/\s+/).filter(word => word.length > 0).length;
}

export function validateNote(slug: string, frontmatter: Record<string, unknown>, filePath: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const field of REQUIRED_FIELDS) {
    if (!(field in frontmatter) || frontmatter[field] === undefined || frontmatter[field] === '') {
      errors.push({
        file: filePath,
        field,
        message: `Missing required field: ${field}`
      });
    }
  }
  
  if (frontmatter.date) {
    if (!DATE_REGEX.test(frontmatter.date as string)) {
      errors.push({
        file: filePath,
        field: 'date',
        message: `Invalid date format: ${frontmatter.date}. Expected YYYY-MM-DD`
      });
    }
  }
  
  if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
    errors.push({
      file: filePath,
      field: 'tags',
      message: `Tags must be an array`
    });
  }
  
  return errors;
}

export function parseAllContent(contentDir: string): { notes: ParsedNote[]; errors: ValidationError[]; slugSet: Set<string> } {
  const notes: ParsedNote[] = [];
  const errors: ValidationError[] = [];
  const slugSet = new Set<string>();
  
  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(raw, fullPath);
        
        const slug = (frontmatter.slug as string) || file.replace(/\.mdx?$/, '');
        const title = (frontmatter.title as string) || slug;
        const date = (frontmatter.date as string) || '1970-01-01';
        const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
        
        const validationErrors = validateNote(slug, frontmatter, fullPath);
        errors.push(...validationErrors);
        
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
          content: body,
          wikilinks,
          wordCount: countWords(body),
          raw,
          filePath: fullPath
        });
      }
    }
  }
  
  walkDir(contentDir);
  
  return { notes, errors, slugSet };
}

export function checkBrokenWikilinks(notes: ParsedNote[], slugSet: Set<string>): ValidationError[] {
  const errors: ValidationError[] = [];
  
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
  
  return errors;
}
