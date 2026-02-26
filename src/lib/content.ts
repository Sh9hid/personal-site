import fs from 'node:fs';
import path from 'node:path';

export interface ContentFrontmatter {
  id: string;
  title: string;
  date: string;
  type: 'project' | 'build' | 'reading' | 'note' | 'daily';
  tags: string[];
  abstract: string;
  publish: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  file: string;
}

const REQUIRED_FIELDS: (keyof ContentFrontmatter)[] = [
  'id',
  'title', 
  'date',
  'type',
  'tags',
  'abstract',
  'publish'
];

const VALID_TYPES = ['project', 'build', 'reading', 'note', 'daily'];

export function validateFrontmatter(frontmatter: Record<string, unknown>, filePath: string): ValidationResult {
  const errors: string[] = [];
  
  for (const field of REQUIRED_FIELDS) {
    if (!(field in frontmatter)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  if (frontmatter.type && !VALID_TYPES.includes(frontmatter.type as string)) {
    errors.push(`Invalid type: ${frontmatter.type}. Must be one of: ${VALID_TYPES.join(', ')}`);
  }
  
  if (frontmatter.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(frontmatter.date as string)) {
      errors.push('Invalid date format. Use YYYY-MM-DD');
    }
  }
  
  if (frontmatter.publish !== true) {
    errors.push('publish must be true');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    file: filePath
  };
}

export function validateAllContent(): ValidationResult[] {
  const results: ValidationResult[] = [];
  const contentDir = path.join(process.cwd(), 'content', 'publish');
  
  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        
        if (frontmatterMatch) {
          const frontmatter: Record<string, unknown> = {};
          const lines = frontmatterMatch[1].split('\n');
          
          for (const line of lines) {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
              const value = valueParts.join(':').trim();
              if (value === 'true') frontmatter[key.trim()] = true;
              else if (value === 'false') frontmatter[key.trim()] = false;
              else if (value.startsWith('"') && value.endsWith('"')) {
                frontmatter[key.trim()] = value.slice(1, -1);
              } else if (value.startsWith('[')) {
                try {
                  frontmatter[key.trim()] = JSON.parse(value);
                } catch {
                  frontmatter[key.trim()] = [];
                }
              } else {
                frontmatter[key.trim()] = value;
              }
            }
          }
          
          results.push(validateFrontmatter(frontmatter, fullPath));
        }
      }
    }
  }
  
  walkDir(contentDir);
  
  return results;
}
